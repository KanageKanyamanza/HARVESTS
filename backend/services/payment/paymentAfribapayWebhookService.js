// Webhook payin AfriBaPay (Jour 77) — AfriBaPay confirme après le POST
// /pay/payin du Jour 76, intégré d'après le fonctionnement éprouvé dans
// AfricaSend (controllers/transaction/transaction.afribapay.js, handleWebhook).
//
// Garanties du jour :
//  1. Signature : en-tête `Afribapay-Sign` = HMAC-SHA256 hexadécimal du corps
//     BRUT (req.rawBody capturé dans app.js sur la route, AVANT express.json),
//     avec AFRIBAPAY_API_KEY ; AFRIBAPAY_WEBHOOK_SECRET reste accepté comme
//     seconde clé possible. Corps brut altéré ou absent → rejet 403.
//  2. Anti-replay : chaque notification (order_id + statut) est réclamée une
//     seule fois via un claim atomique écrit en base (models/WebhookEvent.js)
//     — jamais traitée deux fois ; fail-open si l'infra casse (un payin
//     légitime n'est jamais bloqué par l'anti-replay).
//  3. Cohérence montant/devise (payinMismatch) contre le Payment : une
//     confirmation non conforme laisse le paiement en attente et alerte.
//  4. Un payin confirmé (succeeded/refunded/largement remboursé) n'est JAMAIS
//     rétrogradé : l'échec d'un essai remplacé est loggé sans alerte, tout
//     autre conflit déclenche une alerte admin dédupliquée (claim).
//  5. Alerte admin sur signature invalide (une par jour) et sur notification
//     concernant un payin inconnu (une par order_id), dédupliquées par claim.
//
// Les décisions sont isolées dans afribapayWebhookDecision (fonction pure,
// testée dans tests/afribapay-webhook.test.js sans base MongoDB) ; le handler
// ne fait que : signature → identité → claim → recherche → décision → exécution.
const Payment = require("../../models/Payment");
const WebhookEvent = require("../../models/WebhookEvent");
const { AFRIBAPAY_API_KEY, AFRIBAPAY_WEBHOOK_SECRET } = require("../../config/afribapay");
const { checkAfribapaySignature, SIGNATURE_HEADER } = require("../../utils/afribapaySignature");
const { payinMismatch, redactSecrets } = require("../../utils/afribapayUtils");
const {
	paymentIdFromPayinOrderId,
	isSupersededPayinOrderId,
} = require("../../utils/payinOrderId");
const { createNotificationsForAdmins } = require("../../utils/adminNotifications");
const { logAudit } = require("../../utils/auditLogger");

// Statuts AfriBaPay considérés comme confirmant qu'un payin a été reçu.
// Liste portée d'AfricaSend (aussi utilisée par le /status du Jour 78).
const PAYIN_SUCCESS_STATUSES = [
	"SUCCESS",
	"COMPLETED",
	"PAID",
	"ACCEPTED",
	"APPROVED",
	"SUCCESSFUL",
	"VALIDATED",
];
const PAYIN_FAILURE_STATUSES = ["FAILED", "CANCELLED", "EXPIRED", "REJECTED"];

// Statuts Payment décrivant un payin déjà confirmé (jamais rétrogradés).
const PAYIN_CONFIRMED_PAYMENT_STATUSES = [
	"succeeded",
	"refunded",
	"partially_refunded",
];

/**
 * Traduit le statut AfriBaPay du webhook en statut Payment.
 * @param {string} rawStatus statut brut du webhook (insensible à la casse)
 * @returns {"succeeded"|"failed"|"cancelled"|null} null pour les statuts
 *   intermédiaires (PENDING…) : loggés et ignorés.
 */
const mapAfribapayPayinStatus = (rawStatus) => {
	const status = String(rawStatus || "").toUpperCase();
	if (PAYIN_SUCCESS_STATUSES.includes(status)) return "succeeded";
	if (status === "CANCELLED") return "cancelled";
	if (PAYIN_FAILURE_STATUSES.includes(status)) return "failed";
	return null;
};

/**
 * Extrait l'identité du webhook : order_id de l'essai visé + statut brut.
 * AfricaSend a vu plusieurs noms de champs selon les versions de l'API
 * (order_id, transaction_id, reference_id, reference) — tous sont essayés.
 * @param {object} body corps du webhook (vérifié par signature)
 * @returns {{payinOrderId: string, rawStatus: string} | null} null si aucun
 *   identifiant exploitable (webhook ignoré : rien à rechercher)
 */
const extractWebhookIdentity = (body) => {
	const data = body?.data && typeof body.data === "object" ? body.data : body;
	const payinOrderId =
		data?.order_id ||
		body?.order_id ||
		data?.transaction_id ||
		body?.transaction_id ||
		data?.reference_id ||
		body?.reference_id ||
		data?.reference ||
		body?.reference;
	if (!payinOrderId) return null;
	return {
		payinOrderId: String(payinOrderId),
		rawStatus: String(data?.status || body?.status || ""),
	};
};

/**
 * Clé d'idempotence anti-replay. Elle porte le order_id EXACT de l'essai (pas
 * le paymentId seul) : le SUCCESS d'une relance `-p2` n'est pas un replay du
 * SUCCESS de l'essai de départ `R<paymentId>`.
 */
const replayKeyFor = (payinOrderId, rawStatus) =>
	`payin:${payinOrderId}:${String(rawStatus || "").toUpperCase()}`;

/**
 * Décision pure du webhook : donné l'identité, le paiement trouvé et l'écart
 * montant/devise éventuel, répond toujours — l'action à mener.
 *
 * @param {object} params
 * @param {object} params.payment Payment AfriBaPay trouvé en base (ou objet
 *   équivalent en test : status, paymentDetails.afribapay)
 * @param {string} params.payinOrderId order_id de l'essai (R<paymentId>[-pN])
 * @param {string} params.rawStatus statut AfriBaPay brut
 * @param {string|null} params.mismatch retour de payinMismatch (ou null)
 * @returns {object} { action, kind, responseMessage, detail, message? }
 *   action : 'apply-succeeded' | 'apply-end' | 'ignore' | 'alert'
 */
const afribapayWebhookDecision = ({ payment, payinOrderId, rawStatus, mismatch }) => {
	const newStatus = mapAfribapayPayinStatus(rawStatus);
	if (!newStatus) {
		return {
			action: "ignore",
			kind: "statut-intermediaire",
			responseMessage: "Webhook traité",
			detail: `Statut ${rawStatus || "vide"} non final : ignoré`,
		};
	}

	// Un payin confirmé n'est JAMAIS rétrogradé. Un échec portant sur un AUTRE
	// essai que celui qui a confirmé est normal (webhook livré en retard, ou
	// relance du client : R123-p3 réussit et l'échec de R123-p2 n'arrive qu'en
	// retard — l'essai confirmé reste la référence) : simple log, pas d'alerte.
	// Toute autre notification contradictoire est une anomalie : alerte admin
	// dédupliquée, statut conservé.
	if (PAYIN_CONFIRMED_PAYMENT_STATUSES.includes(payment.status)) {
		const afribapay = payment.paymentDetails?.afribapay || {};
		const superseded = isSupersededPayinOrderId(payinOrderId, {
			confirmedOrderId: afribapay.payinConfirmedOrderId,
			lastAttempt: afribapay.attempt,
		});
		if (newStatus !== "succeeded" && superseded) {
			return {
				action: "ignore",
				kind: "essai-remplace",
				responseMessage: "Échec d'un essai remplacé — paiement inchangé",
				detail: `${rawStatus} sur l'essai ${payinOrderId} alors que le payin est confirmé par ${afribapay.payinConfirmedOrderId || "un essai ultérieur"} — statut ${payment.status} conservé, pas d'alerte.`,
			};
		}
		return {
			action: "alert",
			kind: "conflit-statut",
			responseMessage: "Conflit de statut signalé, paiement inchangé",
			detail: `Webhook ${rawStatus} (essai ${payinOrderId}) vs paiement ${payment.status}`,
			message: `AfriBaPay notifie ${rawStatus} (essai ${payinOrderId}) alors que le paiement ${payment.paymentId} est déjà ${payment.status}${afribapay.payinConfirmedOrderId ? ` (confirmé par l'essai ${afribapay.payinConfirmedOrderId})` : ""}. Statut conservé : vérifiez le dashboard AfriBaPay.`,
		};
	}

	// Paiement réellement reçu sur un paiement annulé : le client est débité
	// sans commande payable. Jamais silencieux, pas de retour à l'annulé
	// (relance automatique interdite : il a pu payer de nouveau).
	if (newStatus === "succeeded" && payment.status === "cancelled") {
		return {
			action: "alert",
			kind: "paiement-sur-annule",
			responseMessage: "Paiement reçu sur un paiement annulé — signalé",
			detail: `Webhook ${rawStatus} (essai ${payinOrderId}) vs paiement cancelled`,
			message: `AfriBaPay confirme le paiement (${rawStatus}, essai ${payinOrderId}) du paiement ${payment.paymentId} annulé : le client a été débité sans commande acceptable. À rembourser ou à reprendre manuellement.`,
		};
	}

	// Cohérence montant/devise contre le Payment : une confirmation non
	// conforme ne confirme PAS le payin. Le /status du Jour 78 fera le même
	// contrôle — il ne doit jamais approuver ce que le webhook a refusé.
	if (newStatus === "succeeded" && mismatch) {
		return {
			action: "alert",
			kind: "montant-devise",
			responseMessage: "Montant ou devise non conforme — signalé",
			detail: `Webhook ${rawStatus} (essai ${payinOrderId}) : ${mismatch}`,
			message: `Confirmation AfriBaPay non conforme (${mismatch}) pour le payin ${payinOrderId} (paiement ${payment.paymentId}). Paiement laissé en ${payment.status}, non confirmé.`,
		};
	}

	// Cas nominaux : confirmation ou échec d'un paiement en attente. Un paiement
	// failed peut être rattrapé par un SUCCESS tardif (AfriBaPay notifie parfois
	// l'échec puis le succès du même essai).
	return {
		action: newStatus === "succeeded" ? "apply-succeeded" : "apply-end",
		kind: newStatus,
		responseMessage: "Webhook traité",
		detail: `Webhook ${rawStatus} (essai ${payinOrderId}) → paiement ${payment.paymentId} passe en ${newStatus}`,
	};
};

/**
 * Alerte admin dédupliquée par claim WebhookEvent : le webhook (et plus tard
 * le /status du Jour 78, le payout ou le refund) réutilisera ses clés
 * `anomaly:payin-*` pour n'alerter qu'une seule fois par anomalie.
 */
const alertAfribapayAnomaly = async ({ key, message, detail, data = {} }) => {
	const isNew = await WebhookEvent.claimEvent(key).catch((err) => {
		console.error("[Payin AfriBaPay] claim d'alerte en erreur:", err.message);
		return true; // fail-open : mieux vaut deux alertes qu'aucune
	});
	if (!isNew) return;
	console.warn(`[Payin AfriBaPay] ⚠️ ${detail}`);
	try {
		await createNotificationsForAdmins({
			title: "💳 Anomalie de paiement — AfriBaPay",
			message: message || detail,
			type: "payment_issue",
			category: "payment",
			priority: "high",
			data: { source: "afribapay-payin", detail, ...data },
		});
	} catch (err) {
		console.error(`[Payin AfriBaPay] alerte non envoyée: ${err.message}`);
	}
};

/**
 * Exécute la décision calculée par afribapayWebhookDecision (webhook Jour 77,
 * réutilisation /status Jour 78) : alerte admin, transition succeeded ou
 * échec/annulation. Les deux canaux partagent exactement les mêmes garde-fous
 * — le /status ne peut pas approuver ce que le webhook a refusé et réciproquement.
 *
 * @param {object} params
 * @param {object} params.payment Payment (doct mongoose ou objet légal en test)
 * @param {object} params.decision retour de afribapayWebhookDecision
 * @param {string} params.payinOrderId order_id de l'essai visé
 * @param {string} params.rawStatus statut AfriBaPay brut
 * @param {object} [params.data] corps AfriBaPay à plat (amount, transaction_id…)
 * @param {{source?: string, ip?: string=null, userAgent?: string}|object} [params.requestInfo]
 * @returns {Promise<{action: string, applied?: string}>}
 */
const applyAfribapayPayinOutcome = async ({
	payment,
	decision,
	payinOrderId,
	rawStatus,
	data = {},
	requestInfo = {},
}) => {
	const source = requestInfo.source || "afribapay-webhook";
	const upperStatus = String(rawStatus || "UNKNOWN").toUpperCase();

	if (decision.action === "ignore") {
		console.log(`[Payin AfriBaPay] Ignoré (${decision.kind}): ${decision.detail}`);
		return { action: "ignore" };
	}

	if (decision.action === "alert") {
		await alertAfribapayAnomaly({
			key: `anomaly:payin-${decision.kind}:${payinOrderId}`,
			message: decision.message,
			detail: decision.detail,
			data: { payinOrderId, paymentId: payment.paymentId, rawStatus, mismatch: data.mismatch },
		});
		// L'événement reste dans l'historique du paiement (audit), état inchangé.
		payment.webhooks.push({
			eventType: `afribapay_${upperStatus}`,
			eventId: payinOrderId,
			processed: false,
			data: { receivedStatus: rawStatus || undefined, mismatch: data.mismatch || undefined },
		});
		await payment.save();
		return { action: "alert" };
	}

	// 'apply-succeeded' / 'apply-end' : transition réelle (l'ingestion a été
	// validée par le claim anti-replay du webhook, ou par le verrou de polling).
	if (decision.action === "apply-succeeded") {
		const transactionId = data.transaction_id || null;
		payment.paymentDetails.afribapay = {
			...(payment.paymentDetails.afribapay || {}),
			processorStatus: upperStatus,
			...(transactionId ? { transactionId } : {}),
			// L'essai qui a réellement confirmé le payin : permet de
			// reconnaître plus tard l'échec d'un essai remplacé
			// (isSupersededPayinOrderId).
			payinConfirmedOrderId: payinOrderId,
			failedReadCount: 0,
		};
		payment.webhooks.push({
			eventType: "afribapay_confirmed",
			eventId: payinOrderId,
			processed: true,
			data: {
				processorStatus: upperStatus,
				amount: data.amount_total ?? data.original_amount,
				currency: data.currency,
			},
		});
		payment.attempts.push({ status: "succeeded" });
		// status → succeeded : paidAt posé par le pre-save, règlement de la
		// commande déroulé par le post-save du modèle Payment (confirmé + frais
		// livreur éventuels).
		await payment.markAsSucceeded(transactionId);
		logAudit({
			action: "PAYMENT_CONFIRMED",
			targetId: payment._id,
			targetType: "Payment",
			details: {
				payinOrderId,
				paymentId: payment.paymentId,
				orderId: payment.order?.toString?.() || undefined,
				afribapayStatus: rawStatus,
				transactionId: transactionId || undefined,
				source,
			},
			ip: requestInfo.ip || null,
			userAgent: requestInfo.userAgent || null,
		});
		console.log(
			`[Payin AfriBaPay] ✅ Payin ${payinOrderId} confirmé → paiement ${payment.paymentId} succeeded`,
		);
		return { action: "apply-succeeded" };
	}

	// 'apply-end' : échec / annulation d'un payin en attente (pending,
	// processing, requires_action, failed) — jamais un statut confirmé.
	payment.paymentDetails.afribapay = {
		...(payment.paymentDetails.afribapay || {}),
		processorStatus: upperStatus,
		failedReadCount: 0,
	};
	payment.webhooks.push({
		eventType: `afribapay_${upperStatus}`,
		eventId: payinOrderId,
		processed: true,
		data: { status: rawStatus },
	});
	payment.status = decision.kind; // 'failed' ou 'cancelled'
	payment.attempts.push({
		status: decision.kind,
		errorCode: `afribapay_${upperStatus}`,
		errorMessage: `Payin ${payinOrderId} : ${rawStatus}`,
	});
	await payment.save();
	logAudit({
		action: "PAYMENT_CONFIRMED",
		status: "failure",
		targetId: payment._id,
		targetType: "Payment",
		details: {
			payinOrderId,
			paymentId: payment.paymentId,
			afribapayStatus: rawStatus,
			paymentStatus: decision.kind,
			source,
		},
		ip: requestInfo.ip || null,
		userAgent: requestInfo.userAgent || null,
	});
	console.log(
		`[Payin AfriBaPay] ❌ Payin ${payinOrderId} → paiement ${payment.paymentId} ${decision.kind}`,
	);
	return { action: "apply-end" };
};

/**
 * Handler du webhook payin AfriBaPay. Route montée dans app.js sur
 * /api/v1/payments/afribapay/webhook (chemin figé dans
 * services/payment/paymentAfribapayService.js) : corps brut capturé AVANT
 * express.json, sans authentification (machine-to-machine) et sans CSRF
 * (middleware/security.js exempt tout chemin /webhook) — c'est AfriBaPay
 * qui appelle.
 */
const handleAfribapayWebhook = async (req, res) => {
	const body = req.body || {};

	// --- 1. Signature HMAC sur le corps brut ---
	const signatureCheck = checkAfribapaySignature(req, [
		AFRIBAPAY_API_KEY,
		AFRIBAPAY_WEBHOOK_SECRET,
	]);
	if (signatureCheck === "unconfigured") {
		console.error(
			"[SECURITY Webhook AfriBaPay] AFRIBAPAY_API_KEY non défini — webhook payin désactivé",
		);
		return res.status(503).json({ error: "Service non configuré" });
	}
	if (signatureCheck !== "valid") {
		console.warn(
			`[Webhook AfriBaPay] Signature ${signatureCheck === "missing" ? "manquante" : "invalide"} — requête rejetée (corps brut: ${req.rawBody ? "oui" : "non"}, signature: ${String(req.headers?.[SIGNATURE_HEADER] || "").length} car.)`,
		);
		// Une fois par jour (claim) : il faut savoir qu'un intrus — ou un
		// changement d'interface AfriBaPay — a frappé sur le webhook.
		await alertAfribapayAnomaly({
			key: `anomaly:payin-signature:${new Date().toISOString().slice(0, 10)}`,
			message: `Webhook AfriBaPay rejeté : signature ${signatureCheck === "missing" ? "manquante" : "invalide"} (IP ${req.ip || "inconnue"}). Vérifiez la clé de signature configurée côté AfriBaPay et AFRIBAPAY_API_KEY / AFRIBAPAY_WEBHOOK_SECRET.`,
			detail: `Signature ${signatureCheck === "missing" ? "manquante" : "invalide"} (IP: ${req.ip || "inconnue"})`,
			data: { signatureCheck, ip: req.ip },
		});
		return res
			.status(403)
			.json({ error: signatureCheck === "missing" ? "Signature manquante" : "Signature invalide" });
	}
	// --------------------------------------------

	console.log("[Webhook AfriBaPay] Payin reçu:", redactSecrets(JSON.stringify(body)));

	try {
		// --- 2. Identité du webhook + anti-replay ---
		const identity = extractWebhookIdentity(body);
		if (!identity) {
			console.warn(
				"[Webhook AfriBaPay] Reçu sans order_id/transaction_id/reference:",
				redactSecrets(JSON.stringify(body)),
			);
			return res.status(200).json({ message: "Webhook sans identifiant de payin, ignoré" });
		}

		const { payinOrderId, rawStatus } = identity;
		// Clé sur l'order_id exact de l'essai : le SUCCESS d'une relance n'est
		// pas un rejeu de l'essai de départ. Fail-open : jamais un payin
		// légitime n'est bloqué par une panne d'infra (le claim sera réinséré
		// au prochain passage du même webhook).
		const replayKey = replayKeyFor(payinOrderId, rawStatus);
		const isNewEvent = await WebhookEvent.claimEvent(replayKey).catch((err) => {
			console.error("[Webhook AfriBaPay] claim anti-replay en erreur:", err.message);
			return true;
		});
		if (!isNewEvent) {
			console.log(`[Webhook AfriBaPay] Rejeu détecté et ignoré: ${replayKey}`);
			return res.status(200).json({ message: "Événement déjà traité" });
		}

		// --- 3. Recherche du paiement (order_id R<paymentId>[-pN] → paymentId) ---
		const derivedPaymentId = paymentIdFromPayinOrderId(payinOrderId);
		const payment = await Payment.findOne({ paymentId: derivedPaymentId });
		if (!payment || payment.method !== "mobile_money") {
			console.error(
				`[Webhook AfriBaPay] Payin ${payinOrderId} : paiement ${derivedPaymentId} inconnu (ou pas un payin AfriBaPay)`,
			);
			await alertAfribapayAnomaly({
				key: `anomaly:payin-inconnu:${payinOrderId}`,
				message: `AfriBaPay a notifié un payin inconnu (essai ${payinOrderId}, statut ${rawStatus || "n/a"}) — aucun paiement mobile_money Harvests ne correspond. Le client a possiblement été débité : vérifiez le ${payinOrderId} sur le dashboard AfriBaPay.`,
				detail: `Payin inconnu : ${payinOrderId} (statut ${rawStatus || "n/a"})`,
				data: { payinOrderId, rawStatus, derivedPaymentId },
			});
			return res.status(200).json({ message: "Paiement non trouvé" });
		}

		// --- 4. Cohérence montant/devise (contrôle fait sur les confirmations) ---
		const data = body.data && typeof body.data === "object" ? body.data : body;
		const mismatch =
			mapAfribapayPayinStatus(rawStatus) === "succeeded"
				? payinMismatch(payment, data)
				: null;

		// --- 5. Décision exécutée (même exécution que le /status du Jour 78) ---
		const decision = afribapayWebhookDecision({
			payment,
			payinOrderId,
			rawStatus,
			mismatch,
		});
		await applyAfribapayPayinOutcome({
			payment,
			decision,
			payinOrderId,
			rawStatus,
			data: {
				transaction_id: data.transaction_id || body.transaction_id,
				...data,
				mismatch,
			},
			requestInfo: { source: "afribapay-webhook", ip: req.ip, userAgent: req.get("User-Agent") },
		});
		return res.status(200).json({ message: decision.responseMessage });
	} catch (err) {
		console.error(
			"[Webhook AfriBaPay] Erreur interne:",
			redactSecrets(err?.response?.data ?? err.message ?? err),
		);
		return res.status(500).json({ error: "Erreur interne du serveur" });
	}
};

module.exports = {
	PAYIN_SUCCESS_STATUSES,
	PAYIN_FAILURE_STATUSES,
	mapAfribapayPayinStatus,
	extractWebhookIdentity,
	replayKeyFor,
	afribapayWebhookDecision,
	applyAfribapayPayinOutcome,
	alertAfribapayAnomaly,
	handleAfribapayWebhook,
};
