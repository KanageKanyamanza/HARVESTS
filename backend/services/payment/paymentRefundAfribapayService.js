// Remboursements client mobile money AfriBaPay (Jour 83) — porté du
// fonctionnement éprouvé d'AfricaSend (backend/controllers/transaction/
// transaction.payout.js, executeRefund/handleRefundResult) : un remboursement
// est un VERSEMENT vers le téléphone du client, exécuté par le même endpoint
// que le payout (POST /pay/payout) avec un order_id `refund-<paymentId>[-rN]`,
// la même notify_url que le payout et le même secret d'URL.
//
// Garanties :
//  1. Un remboursement confirmé par AfriBaPay n'est JAMAIS rétrogradé ; un
//     succès tardif sur `failed`/`ambiguous` est appliqué (l'argent est parti).
//  2. Un remboursement en cours ou incertain réserve son montant : deux essais
//     ne peuvent pas rembourser deux fois le même argent.
//  3. L'entrée `pending` et son order_id sont persistés AVANT l'envoi : un
//     webhook rapide la retrouve.
//  4. Absence de réponse, 5xx, timeout ou 409 (order_id déjà connu) →
//     `ambiguous` + alerte, jamais de relance automatique.
//  5. Le client est notifié (`refund_sent`) une seule fois, au moment où
//     l'argent est réellement versé.
const axios = require("axios");
const mongoose = require("mongoose");
const Payment = require("../../models/Payment");
const Notification = require("../../models/Notification");
const { AFRIBAPAY_PAYOUT_URL, AFRIBAPAY_MERCHANT_KEY, isAfribapayConfigured } = require("../../config/afribapay");
const { getAccessToken, ipv4Agent, withRetry, tagIfUnavailable } = require("../../utils/afribapayClient");
const { parseAfribapayBody, redactSecrets, formatPhoneForAfribapay } = require("../../utils/afribapayUtils");
const { toAfribapayOperator } = require("../../utils/afribapayOperator");
const { refundOrderIdFor } = require("../../utils/refundOrderId");
const { payoutNotifyUrl, PAYOUT_SUCCESS_STATUSES, PAYOUT_FAILURE_STATUSES } = require("./paymentPayoutService");
const { logAudit, AUDIT_ACTIONS } = require("../../utils/auditLogger");
const payoutNotifications = require("../../utils/payoutNotifications");

// Statuts Payment depuis lesquels un remboursement peut être demandé.
const REFUNDABLE_PAYMENT_STATUSES = ["succeeded", "partially_refunded"];
// Statuts qui engagent déjà de l'argent : ils réduisent le montant disponible.
const RESERVED_REFUND_STATUSES = ["pending", "ambiguous", "succeeded"];
// Statuts depuis lesquels un admin peut relancer : jamais un remboursement
// confirmé, et surtout jamais `ambiguous` (l'argent a peut-être été versé).
const RETRYABLE_REFUND_STATUSES = ["failed"];

const REFUND_WINDOW_DAYS = 90;

/** Erreur métier portant un code stable (tests et API admin). */
const refundError = (code, message = code) => Object.assign(new Error(message), { code });

/**
 * Montant encore remboursable : total payé moins ce qui est déjà réservé
 * (`pending`, `ambiguous`) ou versé (`succeeded`).
 * @param {object} payment
 * @returns {number}
 */
const refundableAmount = (payment) => {
	const amount = Number(payment?.amount) || 0;
	const reserved = (payment?.refunds || [])
		.filter((refund) => RESERVED_REFUND_STATUSES.includes(refund?.status))
		.reduce((total, refund) => total + (Number(refund?.amount) || 0), 0);
	return Math.max(0, amount - reserved);
};

/**
 * Vérifie qu'un remboursement AfriBaPay est possible.
 * @param {object} payment
 * @param {number} amount montant demandé (FCFA, entier)
 * @param {{ now?: Function }} [options]
 * @throws {Error} code `refund_not_mobile_money`, `refund_not_refundable`,
 *   `refund_amount_invalid` ou `refund_amount_exceeds`
 */
const assertRefundable = async (payment, amount, { now = () => new Date() } = {}) => {
	if (payment?.method !== "mobile_money") {
		throw refundError("refund_not_mobile_money", "Seuls les paiements mobile money se remboursent via AfriBaPay");
	}
	if (!REFUNDABLE_PAYMENT_STATUSES.includes(payment?.status)) {
		throw refundError("refund_not_refundable", `Paiement ${payment?.status || "inconnu"} : remboursement impossible`);
	}
	if (!payment?.paidAt) {
		throw refundError("refund_not_refundable", "Paiement sans date de règlement : remboursement impossible");
	}
	const ageDays = (now().getTime() - new Date(payment.paidAt).getTime()) / (24 * 60 * 60 * 1000);
	if (!(ageDays <= REFUND_WINDOW_DAYS)) {
		throw refundError("refund_not_refundable", `Paiement de plus de ${REFUND_WINDOW_DAYS} jours : remboursement impossible`);
	}

	const value = Number(amount);
	const available = refundableAmount(payment);
	if (!Number.isInteger(value) || value <= 0) {
		throw refundError("refund_amount_invalid", "Montant de remboursement invalide");
	}
	if (value > available) {
		throw refundError("refund_amount_exceeds", `Montant supérieur au disponible (${available})`);
	}
};

/** Numéro de la prochaine tentative de remboursement. */
const nextRefundAttempt = (payment) => {
	const fromEntries = (payment?.refunds || []).reduce(
		(max, refund) => Math.max(max, Number(refund?.attempt) || 0),
		0,
	);
	return Math.max(fromEntries, Number(payment?.refundAttempt) || 0) + 1;
};

/**
 * Payload POST /pay/payout d'un remboursement : mêmes 9 clés que le payout
 * (AfriBaPay refuse les champs hors contrat), order_id `refund-…`, notify_url
 * du webhook payout (secret d'URL inclus si configuré).
 * @param {object} payment
 * @param {{ amount: number, attempt?: number, operator?: string, phone?: string, country?: string }} options
 */
const buildRefundPayload = (payment, { amount, attempt = 1, operator, phone, country } = {}) => {
	const resolvedCountry = country || payment?.country || "SN";
	return {
		operator: toAfribapayOperator(operator || payment?.operator),
		country: resolvedCountry,
		phone_number: formatPhoneForAfribapay(String(phone || payment?.phone || ""), resolvedCountry),
		amount: Math.round(Number(amount) || 0),
		currency: payment?.currency || "XOF",
		merchant_key: AFRIBAPAY_MERCHANT_KEY,
		order_id: refundOrderIdFor(payment?.paymentId, attempt),
		notify_url: payoutNotifyUrl(),
		lang: "fr",
	};
};

/** Traduit le statut brut AfriBaPay en issue de remboursement. */
const mapRefundProcessorStatus = (rawStatus) => {
	const status = String(rawStatus || "").toUpperCase();
	if (PAYOUT_SUCCESS_STATUSES.includes(status)) return "succeeded";
	if (PAYOUT_FAILURE_STATUSES.includes(status)) return "failed";
	return null;
};

/**
 * Classe l'échec d'un envoi de remboursement. Écart assumé avec le payout
 * (Jour 81/82, où toute réponse d'erreur devient `ambiguous`) : un refus
 * explicite AVANT traitement (400 validation, 401/403 credentials, 404 route,
 * 422 corps rejeté) ne peut pas avoir versé d'argent, et le marquer `failed`
 * rend la relance manuelle possible sans risque. Tout le reste — absence de
 * réponse, 5xx, 408, 423, 409 (order_id déjà connu), statut illisible — est
 * `ambiguous` : jamais de relance automatique.
 */
const REFUSED_HTTP_STATUSES = [400, 401, 403, 404, 422];

const classifyRefundSendFailure = (error) => {
	const httpStatus = error?.response?.status;
	if (error?.response && REFUSED_HTTP_STATUSES.includes(httpStatus)) return "failed";
	return "ambiguous";
};

/**
 * Envoie UNE tentative de remboursement. Le retry réseau (withRetry) rejoue le
 * même order_id : AfriBaPay déduplique, pas de double versement.
 * @returns {Promise<{orderId: string, status: string, processorStatus: string|null, transactionId: string|null, error: string|null, sentAt: Date}>}
 */
const sendRefund = async (payment, { amount, attempt = 1, operator, phone, country } = {}) => {
	if (!isAfribapayConfigured()) throw refundError("afribapay_not_configured");

	const payload = buildRefundPayload(payment, { amount, attempt, operator, phone, country });
	const sentAt = new Date();
	console.log("Calling AfriBaPay Refund (payout endpoint) with:", redactSecrets(JSON.stringify(payload, null, 2)));

	try {
		const token = await getAccessToken();
		const response = await withRetry(
			() =>
				axios.post(AFRIBAPAY_PAYOUT_URL, payload, {
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					httpsAgent: ipv4Agent,
				}),
			{ retries: 1, baseDelayMs: 1000, label: "AfriBaPay Refund" },
		);

		const body = parseAfribapayBody(response.data) ?? response.data;
		const data = body?.data && typeof body.data === "object" ? body.data : body;
		const processorStatus = String(data?.status || body?.status || "").toUpperCase() || null;
		const status = mapRefundProcessorStatus(processorStatus);
		return {
			orderId: payload.order_id,
			// Statut illisible (nouveau libellé AfriBaPay) : incertain, pas un
			// échec — l'argent a peut-être été versé.
			status: status || "ambiguous",
			processorStatus,
			transactionId: data?.transaction_id || body?.transaction_id || null,
			error:
				status === "failed"
					? redactSecrets(String(data?.message || processorStatus || "refund_failed"))
					: null,
			sentAt,
		};
	} catch (error) {
		const { invalidateAfribapayTokenOn401 } = require("../../utils/afribapayTokenCache");
		invalidateAfribapayTokenOn401(error);
		tagIfUnavailable(error);
		console.error("AfriBaPay Refund Error:", redactSecrets(error.response?.data ?? error.message));

		// Aucune réponse, 5xx/408/423, ou 409 (order_id déjà connu) : AfriBaPay a
		// pu traiter la demande. On ne prouve pas le refus → ambiguous.
		const providerMessage = parseAfribapayBody(error.response?.data)?.error?.message;
		return {
			orderId: payload.order_id,
			status: classifyRefundSendFailure(error),
			processorStatus: null,
			transactionId: null,
			error: redactSecrets(
				String(providerMessage || error.response?.data || error.message || "refund_rejected"),
			),
			sentAt,
		};
	}
};

/**
 * Journalise un envoi de remboursement. Best-effort : l'audit ne doit jamais
 * faire échouer un remboursement déjà parti.
 */
const auditRefund = async (audit, { payment, refund, action, status = "success", extra = {} }) => {
	// `userId`/`userEmail` appartiennent au log lui-même (qui a agi), pas aux
	// détails de l'objet remboursé.
	const { userId = null, userEmail = null, ...details } = extra || {};
	try {
		await audit({
			action,
			status,
			userId,
			userEmail,
			targetId: payment?._id,
			targetType: "Payment",
			details: {
				paymentId: payment?.paymentId,
				refundId: refund?.refundId,
				orderId: refund?.orderId,
				attempt: refund?.attempt,
				amount: refund?.amount,
				currency: payment?.currency,
				operator: refund?.operator,
				phone: refund?.phone,
				...details,
			},
		});
	} catch (err) {
		console.error(`[Refund] audit non écrit: ${err.message}`);
	}
};

/**
 * Audit par défaut : sans connexion Mongoose (tests, script hors base), le
 * journal n'est pas écrit plutôt que de laisser une écriture en tampon.
 */
const safeAudit = async (entry) => {
	if (mongoose.connection.readyState !== 1) return null;
	return logAudit(entry);
};

/**
 * Réserve un numéro d'essai de façon atomique. `refundAttempt` est incrémenté
 * en base ($inc) : deux administrateurs simultanés obtiennent deux numéros
 * distincts, donc deux order_id/refundId distincts. Le champ n'est JAMAIS
 * réécrit par le save du document (sinon l'incrément du voisin serait écrasé).
 * Sans connexion (tests), repli sur le calcul en mémoire.
 */
const reserveRefundAttempt = async (payment) => {
	const fallback = nextRefundAttempt(payment);
	if (mongoose.connection.readyState !== 1 || !payment?._id) return fallback;

	// Reprise/déploiement : aligner le compteur sur les essais déjà tracés
	// (le prochain $inc doit donner `fallback`, pas le dépasser).
	if (fallback > 1) {
		await Payment.updateOne(
			{ _id: payment._id, refundAttempt: { $lt: fallback - 1 } },
			{ $set: { refundAttempt: fallback - 1 } },
		);
	}
	const updated = await Payment.findOneAndUpdate(
		{ _id: payment._id },
		{ $inc: { refundAttempt: 1 } },
		{ new: true, projection: { refundAttempt: 1 } },
	).lean();
	if (!updated) throw refundError("refund_not_found", "Paiement introuvable pour réserver un remboursement");
	return Number(updated.refundAttempt);
};

/**
 * Applique des changements à UN essai de remboursement (et éventuellement au
 * statut global du Payment).
 *
 * Sans base (tests) : mutation en mémoire puis `save()` injecté. En base :
 * écriture ciblée (`$set` positionnel via arrayFilters) — `Payment` n'a pas
 * `optimisticConcurrency`, un `save()` global écraserait l'essai qu'un autre
 * webhook vient de confirmer en parallèle.
 *
 * @param {object} payment
 * @param {object} refund
 * @param {{refund: object, payment?: object}} changes
 * @param {{save: Function}} deps
 * @returns {Promise<"save"|"atomic">}
 */
const persistRefundChanges = async (payment, refund, changes, { save }) => {
	const applied = () => {
		Object.assign(refund, changes.refund);
		if (changes.payment) Object.assign(payment, changes.payment);
	};

	if (mongoose.connection.readyState !== 1 || !payment?._id) {
		applied();
		await save();
		return "save";
	}

	const set = {};
	for (const [key, value] of Object.entries(changes.refund)) {
		set[`refunds.$[essai].${key}`] = value;
	}
	for (const [key, value] of Object.entries(changes.payment || {})) set[key] = value;
	const result = await Payment.updateOne(
		{ _id: payment._id },
		{ $set: set },
		{ arrayFilters: [{ "essai.refundId": refund.refundId }] },
	);
	if (!result?.matchedCount) {
		throw refundError("refund_not_found", "Remboursement absent du paiement — état non enregistré");
	}
	applied();
	return "atomic";
};

/**
 * Après avoir enregistré l'entrée `pending`, vérifie que le total ENGAGÉ
 * (pending + ambiguous + succeeded) ne dépasse pas le montant payé : deux
 * administrateurs simultanés peuvent tous deux avoir passé la validation sur
 * un document périmé. La seconde entrée est annulée AVANT l'envoi — l'argent
 * ne part jamais deux fois.
 */
const verifyReservedAmount = async (payment, refund) => {
	if (mongoose.connection.readyState !== 1 || !payment?._id) return;
	const fresh = await Payment.findById(payment._id).lean();
	if (!fresh) return;
	const reserved = (fresh.refunds || [])
		.filter((entry) => RESERVED_REFUND_STATUSES.includes(entry?.status))
		.reduce((total, entry) => total + (Number(entry?.amount) || 0), 0);
	if (reserved <= (Number(fresh.amount) || 0)) return;

	await Payment.updateOne(
		{ _id: payment._id },
		{
			$set: {
				"refunds.$[essai].status": "cancelled",
				"refunds.$[essai].failureReason": "refund_concurrent_conflict",
			},
		},
		{ arrayFilters: [{ "essai.refundId": refund.refundId }] },
	);
	refund.status = "cancelled";
	refund.failureReason = "refund_concurrent_conflict";
	throw refundError(
		"refund_amount_exceeds",
		"Un autre remboursement a engagé le montant disponible entre-temps : aucun envoi n'a été fait",
	);
};

/**
 * Crée l'entrée `pending` d'une tentative et la persiste AVANT l'envoi.
 */
const persistPendingRefund = async (payment, { save, amount, reason, attempt, operator, phone, country, adminId, now }) => {
	const orderId = refundOrderIdFor(payment.paymentId, attempt);
	const refund = {
		refundId: `ref_afp_${payment.paymentId}_${attempt}`,
		amount,
		reason: reason || "admin_refund",
		status: "pending",
		attempt,
		orderId,
		operator: toAfribapayOperator(operator || payment.operator),
		phone: formatPhoneForAfribapay(String(phone || payment.phone || ""), country || payment.country || "SN"),
		country: country || payment.country || "SN",
		requestedBy: adminId || null,
		createdAt: now(),
	};
	if (mongoose.connection.readyState === 1 && payment?._id) {
		// `$push` ciblé : l'entrée part sans réécrire le tableau lu par un autre
		// administrateur (son essai ne serait pas perdu).
		const result = await Payment.updateOne(
			{ _id: payment._id, "refunds.refundId": { $ne: refund.refundId } },
			{ $push: { refunds: refund } },
		);
		if (!result?.matchedCount) {
			throw refundError("refund_conflict", "Ce remboursement est déjà enregistré — réessayez");
		}
		if (!Array.isArray(payment.refunds)) payment.refunds = [];
		payment.refunds.push(refund);
		return refund;
	}

	if (!Array.isArray(payment.refunds)) payment.refunds = [];
	payment.refunds.push(refund);
	await save();
	return refund;
};

/**
 * Applique le résultat définitif d'un remboursement : statut de l'essai,
 * statut global du Payment, notification du client, alerte admin et audit.
 *
 * @param {object} payment Payment (document Mongoose ou objet équivalent)
 * @param {object} options
 * @param {string} options.refundId ou `options.orderId` pour retrouver l'essai
 * @param {"succeeded"|"failed"|"ambiguous"} options.status
 * @param {string} [options.orderId]
 * @param {string} [options.previousStatus]
 * @param {string|null} [options.transactionId]
 * @param {string|null} [options.processorStatus]
 * @param {string|null} [options.reason]
 * @param {string} [options.source]
 * @param {object} [deps]
 * @returns {Promise<{refund: object, status: string, notified: boolean}>}
 */
const finalizeRefundOutcome = async (
	payment,
	{
		refundId,
		orderId,
		status,
		previousStatus,
		transactionId = null,
		processorStatus = null,
		reason = null,
		source = "refund",
	} = {},
	deps = {},
) => {
	const save = deps.save || (() => payment.save());
	const notifyClient = deps.notifyClient || ((p, r) => notifyRefundClient(p, r));
	const alert = deps.alert || ((params) => payoutNotifications.alertPayoutAnomaly(params));
	const audit = deps.audit || safeAudit;
	const now = deps.now || (() => new Date());

	const refund = (payment?.refunds || []).find(
		(entry) => entry?.refundId === refundId || (orderId && entry?.orderId === orderId),
	);
	if (!refund) throw refundError("refund_not_found", `Remboursement introuvable (${refundId || orderId})`);

	// Un remboursement confirmé n'est jamais rétrogradé (ni rejoué).
	if (refund.status === "succeeded" && status !== "succeeded") {
		return { refund, status: refund.status, notified: false };
	}
	const before = previousStatus || refund.status;
	const refundAmount = Number(refund.amount) || 0;
	const paidAmount = Number(payment.amount) || 0;
	const alreadyRefunded = (payment.refunds || [])
		.filter((entry) => entry !== refund && entry?.status === "succeeded")
		.reduce((total, entry) => total + (Number(entry?.amount) || 0), 0);

	// Un succès qui ferait dépasser le montant payé signale un DOUBLE
	// remboursement (l'essai d'une tentative antérieure a été confirmé après
	// coup) : on n'applique rien et on alerte — le client a peut-être reçu deux
	// fois.
	if (status === "succeeded" && alreadyRefunded + refundAmount > paidAmount) {
		try {
			await alert({
				key: `anomaly:refund-double:${payment.paymentId}:${refund.orderId || refund.refundId}`,
				message: `Un second remboursement (${refund.orderId || refund.refundId}, ${refundAmount} ${payment.currency || "XOF"}) est confirmé pour le paiement ${payment.paymentId} alors que ${alreadyRefunded} ${payment.currency || "XOF"} sont déjà versés. Le client a peut-être été remboursé DEUX FOIS — vérifiez le dashboard AfriBaPay avant toute action.`,
				detail: `Succès ${refund.orderId || refund.refundId} non appliqué : total dépasserait le montant payé`,
				data: {
					paymentId: payment.paymentId,
					refundId: refund.refundId,
					orderId: refund.orderId,
					amount: refundAmount,
					alreadyRefunded,
					currency: payment.currency,
					source,
				},
			});
		} catch (err) {
			console.error(`[Refund] alerte double remboursement non envoyée: ${err.message}`);
		}
		return { refund, status: refund.status, notified: false, blocked: "double-refund" };
	}

	const processedAt = now();
	const changes = {
		refund: {
			status,
			processedAt,
			processorStatus: processorStatus || refund.processorStatus || null,
			...(transactionId ? { transactionId } : {}),
			...(orderId ? { orderId } : {}),
			...(["failed", "ambiguous"].includes(status)
				? { failureReason: reason ? redactSecrets(String(reason)) : null }
				: {}),
		},
	};

	// Statut global : total réellement versé. Un échec ne rétrograde jamais un
	// paiement déjà remboursé.
	if (status === "succeeded") {
		const paymentChanges = {};
		if (alreadyRefunded + refundAmount >= paidAmount) {
			paymentChanges.status = "refunded";
			if (!payment.refundedAt) paymentChanges.refundedAt = processedAt;
		} else if (payment.status !== "refunded") {
			paymentChanges.status = "partially_refunded";
		}
		if (Object.keys(paymentChanges).length) changes.payment = paymentChanges;
	}

	await persistRefundChanges(payment, refund, changes, { save });

	const notified = status === "succeeded" && before !== "succeeded";
	if (notified) {
		try {
			await notifyClient(payment, refund);
		} catch (err) {
			console.error(`[Refund] notification client non envoyée: ${err.message}`);
		}
	}

	if (status === "failed" || status === "ambiguous") {
		const amount = `${refund.amount} ${payment.currency || "XOF"}`;
		try {
			await alert({
				key: `anomaly:refund-${status}:${payment.paymentId}:${refund.orderId || ""}`,
				message:
					status === "failed"
						? `Le remboursement ${refund.orderId} de ${amount} au client a échoué définitivement (${processorStatus || "statut inconnu"}). Vérifiez le dashboard AfriBaPay puis relancez le remboursement si le client n'a rien reçu.`
						: `Le remboursement ${refund.orderId} de ${amount} au client a un statut ambigu (${processorStatus || "illisible"}) : le client a peut-être été remboursé. Vérifiez sur le dashboard AfriBaPay AVANT toute relance.`,
				detail: `Remboursement ${refund.orderId} ${status} (${processorStatus || "statut inconnu"})`,
				data: {
					paymentId: payment.paymentId,
					refundId: refund.refundId,
					orderId: refund.orderId,
					amount: refund.amount,
					currency: payment.currency,
					processorStatus,
					source,
				},
			});
		} catch (err) {
			console.error(`[Refund] alerte admin non envoyée: ${err.message}`);
		}
	}

	const action =
		status === "succeeded"
			? AUDIT_ACTIONS.REFUND_CONFIRMED
			: status === "failed"
				? AUDIT_ACTIONS.REFUND_FAILED
				: status === "ambiguous"
					? AUDIT_ACTIONS.REFUND_AMBIGUOUS
					: null;
	if (action) {
		await auditRefund(audit, {
			payment,
			refund,
			action,
			status: status === "succeeded" ? "success" : "failure",
			extra: { payoutStatus: status, processorStatus: processorStatus || undefined, source },
		});
	}

	return { refund, status, notified };
};

/**
 * Données de la notification client. Attention : `data.orderId` du schéma
 * Notification est un ObjectId de commande — y écrire `refund-<paymentId>`
 * fait échouer la validation. L'order_id AfriBaPay voyage donc dans `orderRef`.
 */
const buildRefundNotificationData = (payment, refund) => ({
	paymentId: payment?.paymentId || null,
	refundId: refund?.refundId || null,
	orderRef: refund?.orderId || null,
	amount: Number(refund?.amount) || 0,
	currency: payment?.currency || "XOF",
	operator: refund?.operator || null,
	status: "succeeded",
});

/**
 * Notifie le client que son remboursement est réellement versé. Le texte est
 * enregistré en français ; utils/notificationI18n.js le traduit à la lecture.
 */
const notifyRefundClient = async (payment, refund) => {
	// Sans base (tests, script ponctuel), aucune notification n'est créée.
	if (mongoose.connection.readyState !== 1) return null;
	const amount = Number(refund?.amount) || 0;
	const currency = payment?.currency || "XOF";
	return Notification.createNotification({
		recipient: payment?.user,
		recipientModel: "User",
		type: "refund_sent",
		category: "payment",
		title: "Remboursement effectué",
		message: `Votre remboursement de ${amount} ${currency} a été envoyé sur votre compte mobile money.`,
		priority: "high",
		data: buildRefundNotificationData(payment, refund),
		channels: {
			inApp: { enabled: true },
			email: { enabled: false },
			push: { enabled: true },
		},
	});
};

/**
 * Demande un remboursement mobile money (admin). L'entrée `pending` est
 * persistée avant l'appel ; le résultat est finalisé immédiatement.
 *
 * @param {object} payment
 * @param {object} options amount, reason, operator/phone/country (destination),
 *   adminId, et dépendances injectables (save, sendAttempt, notifyClient,
 *   alert, audit, now)
 * @returns {Promise<{payment: object, refund: object, outcome: string}>}
 */
const requestAfribapayRefund = async (
	payment,
	{
		amount,
		reason = null,
		operator,
		phone,
		country,
		adminId = null,
		save = () => payment.save(),
		sendAttempt = sendRefund,
		notifyClient,
		alert,
		audit = safeAudit,
		now = () => new Date(),
	} = {},
) => {
	await assertRefundable(payment, amount, { now });

	const attempt = await reserveRefundAttempt(payment);
	const refund = await persistPendingRefund(payment, {
		save,
		amount,
		reason,
		attempt,
		operator,
		phone,
		country,
		adminId,
		now,
	});

	// Deux demandes simultanées ont pu passer la validation sur un document
	// périmé : la seconde est annulée ici, avant tout envoi.
	await verifyReservedAmount(payment, refund);

	let result;
	try {
		result = await sendAttempt(payment, {
			amount,
			attempt,
			operator: refund.operator,
			phone: refund.phone,
			country: refund.country,
		});
	} catch (error) {
		// Aucun résultat lisible : la demande a pu partir. Jamais de relance
		// automatique — ambiguous + alerte.
		result = {
			orderId: refund.orderId,
			status: "ambiguous",
			processorStatus: null,
			transactionId: null,
			error: redactSecrets(String(error?.message || "refund_network_issue")),
			sentAt: now(),
		};
	}

	const outcome = result.status === "succeeded" || result.status === "failed" ? result.status : "ambiguous";
	await auditRefund(audit, {
		payment,
		refund,
		action: AUDIT_ACTIONS.REFUND_SENT,
		status: outcome === "succeeded" ? "success" : "failure",
		extra: { outcome, processorStatus: result.processorStatus || undefined, error: result.error || undefined },
	});

	await finalizeRefundOutcome(
		payment,
		{
			refundId: refund.refundId,
			orderId: result.orderId || refund.orderId,
			status: outcome,
			previousStatus: "pending",
			transactionId: result.transactionId || null,
			processorStatus: result.processorStatus || null,
			reason: result.error || null,
			source: "refund",
		},
		{ save, notifyClient, alert, audit, now },
	);

	return { payment, refund, outcome };
};

/**
 * Relance manuelle d'un remboursement échoué (back-office, Jour 85). Un nouvel
 * essai prend un nouvel order_id (`-r2`), l'audit précède l'envoi, et le
 * résultat est finalisé comme le premier essai.
 *
 * @param {object} payment
 * @param {string} refundId
 * @param {object} options adminId, adminEmail, reason + dépendances injectables
 * @returns {Promise<{payment: object, refund: object, outcome: string}>}
 */
const retryRefundManually = async (
	payment,
	refundId,
	{
		adminId = null,
		adminEmail = null,
		reason = null,
		save = () => payment.save(),
		sendAttempt = sendRefund,
		notifyClient,
		alert,
		audit = safeAudit,
		now = () => new Date(),
	} = {},
) => {
	const previous = (payment?.refunds || []).find((entry) => entry?.refundId === refundId);
	// Seul un essai AfriBaPay (avec numéro d'essai) se relance : un
	// remboursement legacy PayPal/espèces n'a pas de destinataire mobile money.
	if (!previous || previous.attempt == null || !RETRYABLE_REFUND_STATUSES.includes(previous.status)) {
		throw refundError(
			"refund_not_retryable",
			`Remboursement ${previous?.status || "introuvable"} : relance interdite`,
		);
	}
	// Le montant doit toujours être disponible (un autre remboursement a pu
	// être versé entre-temps).
	await assertRefundable(payment, previous.amount, { now });

	await auditRefund(audit, {
		payment,
		refund: previous,
		action: AUDIT_ACTIONS.REFUND_MANUAL_RETRY,
		extra: {
			userId: adminId,
			userEmail: adminEmail,
			fromStatus: previous.status,
			reason: reason || null,
		},
	});

	const attempt = await reserveRefundAttempt(payment);
	const refund = await persistPendingRefund(payment, {
		save,
		amount: previous.amount,
		reason: reason || previous.reason,
		attempt,
		operator: previous.operator,
		phone: previous.phone,
		country: previous.country,
		adminId,
		now,
	});

	await verifyReservedAmount(payment, refund);

	let result;
	try {
		result = await sendAttempt(payment, {
			amount: refund.amount,
			attempt,
			operator: refund.operator,
			phone: refund.phone,
			country: refund.country,
		});
	} catch (error) {
		result = {
			orderId: refund.orderId,
			status: "ambiguous",
			processorStatus: null,
			transactionId: null,
			error: redactSecrets(String(error?.message || "refund_network_issue")),
			sentAt: now(),
		};
	}

	const outcome = result.status === "succeeded" || result.status === "failed" ? result.status : "ambiguous";
	await auditRefund(audit, {
		payment,
		refund,
		action: AUDIT_ACTIONS.REFUND_SENT,
		status: outcome === "succeeded" ? "success" : "failure",
		extra: { outcome, processorStatus: result.processorStatus || undefined, error: result.error || undefined },
	});

	await finalizeRefundOutcome(
		payment,
		{
			refundId: refund.refundId,
			orderId: result.orderId || refund.orderId,
			status: outcome,
			previousStatus: "pending",
			transactionId: result.transactionId || null,
			processorStatus: result.processorStatus || null,
			reason: result.error || null,
			source: "manual-retry",
		},
		{ save, notifyClient, alert, audit, now },
	);

	return { payment, refund, outcome };
};

module.exports = {
	REFUNDABLE_PAYMENT_STATUSES,
	RESERVED_REFUND_STATUSES,
	RETRYABLE_REFUND_STATUSES,
	REFUND_WINDOW_DAYS,
	refundableAmount,
	assertRefundable,
	nextRefundAttempt,
	reserveRefundAttempt,
	persistRefundChanges,
	verifyReservedAmount,
	buildRefundPayload,
	mapRefundProcessorStatus,
	classifyRefundSendFailure,
	sendRefund,
	finalizeRefundOutcome,
	notifyRefundClient,
	buildRefundNotificationData,
	safeAudit,
	requestAfribapayRefund,
	retryRefundManually,
	Payment,
};
