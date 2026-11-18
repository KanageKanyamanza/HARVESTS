// Webhook des remboursements client AfriBaPay (Jour 83) — les notifications
// `refund-<paymentId>[-rN]` arrivent sur la même route que le payout (même
// signature HMAC ou secret d'URL, même notify_url). Le handler payout délègue
// ici dès que l'order_id porte le préfixe `refund-`.
//
// Garanties :
//  1. Anti-replay : chaque couple (order_id, statut) est réclamé une fois
//     (WebhookEvent.claimEvent) ; la clé est libérée si le traitement échoue.
//  2. Un remboursement `succeeded` n'est jamais rétrogradé ; un succès tardif
//     sur `failed`/`ambiguous` est appliqué (l'argent est parti) ; un échec
//     contredisant un succès ou un statut ambigu alerte sans rien changer.
//  3. Un paiement/remboursement inconnu, ou un order_id appartenant à un autre
//     paiement, alerte les admins au lieu d'être appliqué.
const Payment = require("../../models/Payment");
const WebhookEvent = require("../../models/WebhookEvent");
const {
	paymentIdFromRefundOrderId,
	refundAttemptNumber,
	refundOrderIdBelongsTo,
	isSupersededRefundOrderId,
} = require("../../utils/refundOrderId");
const payoutNotifications = require("../../utils/payoutNotifications");
const { finalizeRefundOutcome, safeAudit } = require("./paymentRefundAfribapayService");
const { capturedAfribapayCosts } = require("../../models/afribapayCosts");

const SUCCESS_STATUSES = require("./paymentPayoutService").PAYOUT_SUCCESS_STATUSES;
const FAILURE_STATUSES = require("./paymentPayoutService").PAYOUT_FAILURE_STATUSES;

/** Traduit le statut brut en issue de remboursement (null = intermédiaire). */
const mapRefundWebhookStatus = (rawStatus) => {
	const status = String(rawStatus || "").toUpperCase();
	if (SUCCESS_STATUSES.includes(status)) return "succeeded";
	if (FAILURE_STATUSES.includes(status)) return "failed";
	return null;
};

/** Clé d'idempotence : order_id EXACT de l'essai + statut. */
const refundWebhookReplayKey = (refundOrderId, rawStatus) =>
	`refund:${refundOrderId}:${String(rawStatus || "").toUpperCase()}`;

/**
 * Décision pure du webhook de remboursement.
 * @param {object} params
 * @param {object} params.payment Payment trouvé (ou objet équivalent)
 * @param {object|null} params.refund entrée refunds[] visée (order_id exact)
 * @param {string} params.refundOrderId order_id reçu (`refund-<id>[-rN]`)
 * @param {string} params.rawStatus statut AfriBaPay brut
 * @param {number} [params.lastAttempt] dernier essai connu du paiement
 * @returns {{action: "apply-succeeded"|"apply-failed"|"ignore"|"alert", kind: string, responseMessage: string, detail: string, message?: string}}
 */
const refundWebhookDecision = ({ payment, refund, refundOrderId, rawStatus, lastAttempt }) => {
	const newStatus = mapRefundWebhookStatus(rawStatus);
	if (!newStatus) {
		return {
			action: "ignore",
			kind: "statut-intermediaire",
			responseMessage: "Webhook traité",
			detail: `Statut ${rawStatus || "vide"} non final : ignoré`,
		};
	}

	if (!refund) {
		return {
			action: "alert",
			kind: "remboursement-inconnu",
			responseMessage: "Remboursement non trouvé",
			detail: `Aucun remboursement ${refundOrderId} sur le paiement ${payment?.paymentId}`,
			message: `AfriBaPay a notifié le remboursement ${refundOrderId} (${rawStatus}) mais aucun essai correspondant n'existe pour le paiement ${payment?.paymentId}. Vérifiez ce versement sur le dashboard AfriBaPay.`,
		};
	}

	const confirmedOrderId = refund.status === "succeeded" ? refund.orderId : null;

	if (refund.status === "succeeded") {
		if (newStatus === "succeeded") {
			if (confirmedOrderId && refundOrderId !== String(confirmedOrderId)) {
				return {
					action: "alert",
					kind: "double-remboursement",
					responseMessage: "Second remboursement confirmé — signalé",
					detail: `Webhook ${rawStatus} (essai ${refundOrderId}) alors que le remboursement est confirmé par ${confirmedOrderId}`,
					message: `AfriBaPay confirme DEUX remboursements pour le paiement ${payment?.paymentId} : ${confirmedOrderId} puis ${refundOrderId}. Le client a peut-être été remboursé deux fois — vérifiez le dashboard AfriBaPay avant toute action.`,
				};
			}
			return {
				action: "ignore",
				kind: "deja-confirme",
				responseMessage: "Remboursement déjà confirmé",
				detail: `Succès ${rawStatus} sur ${refundOrderId} : remboursement déjà succeeded`,
			};
		}
		return {
			action: "alert",
			kind: "conflit-statut",
			responseMessage: "Conflit de statut signalé, remboursement inchangé",
			detail: `Webhook ${rawStatus} (essai ${refundOrderId}) vs remboursement succeeded`,
			message: `AfriBaPay notifie ${rawStatus} (essai ${refundOrderId}) alors que le remboursement du paiement ${payment?.paymentId} est déjà confirmé. Le client a été remboursé : vérifiez le dashboard AfriBaPay avant toute action.`,
		};
	}

	if (refund.status === "ambiguous" && newStatus === "failed") {
		return {
			action: "alert",
			kind: "ambigu-contredit",
			responseMessage: "Statut ambigu confirmé en échec — vérification requise",
			detail: `Échec ${rawStatus} sur ${refundOrderId} alors que le remboursement est ambigu`,
			message: `AfriBaPay notifie l'échec ${rawStatus} du remboursement ${refundOrderId} alors qu'il était ambigu : le client a peut-être été remboursé. Vérifiez le dashboard AfriBaPay AVANT toute relance.`,
		};
	}

	// Échec d'un essai antérieur à la tentative courante : un `-r2` est déjà
	// parti, un FAILED tardif du premier essai ne doit pas le faire tomber.
	const last = Number(lastAttempt) || Number(refund.attempt) || 1;
	if (newStatus === "failed" && isSupersededRefundOrderId(refundOrderId, { lastAttempt: last })) {
		return {
			action: "ignore",
			kind: "essai-remplace",
			responseMessage: "Échec d'un essai remplacé — remboursement inchangé",
			detail: `${rawStatus} sur ${refundOrderId} alors que la dernière tentative est la n°${last}`,
		};
	}

	return {
		action: newStatus === "succeeded" ? "apply-succeeded" : "apply-failed",
		kind: newStatus,
		responseMessage: "Webhook traité",
		detail: `Webhook ${rawStatus} (essai ${refundOrderId}) → remboursement ${newStatus}`,
	};
};

/**
 * Traite une notification de remboursement : claim anti-replay → paiement →
 * remboursement → décision → application.
 * @param {object} params
 * @param {string} params.refundOrderId
 * @param {string} params.rawStatus
 * @param {object} [params.data] corps de la notification
 * @param {object} [params.requestInfo]
 * @param {object} [params.deps] findPayment, save, notifyClient, alert, audit, now
 * @returns {Promise<{action: string, message: string}>}
 */
const processRefundWebhook = async ({ refundOrderId, rawStatus, data = {}, requestInfo = {}, deps = {} }) => {
	const alert = deps.alert || ((params) => payoutNotifications.alertPayoutAnomaly(params));
	const replayKey = refundWebhookReplayKey(refundOrderId, rawStatus);

	const isNewEvent = await WebhookEvent.claimEvent(replayKey).catch((err) => {
		console.error("[Refund AfriBaPay] claim anti-replay en erreur:", err.message);
		return true; // fail-open : un remboursement légitime n'est jamais bloqué
	});
	if (!isNewEvent) {
		console.log(`[Refund AfriBaPay] Rejeu détecté et ignoré: ${replayKey}`);
		return { action: "ignore", message: "Événement déjà traité" };
	}

	try {
		const paymentId = paymentIdFromRefundOrderId(refundOrderId);
		const findPayment = deps.findPayment || ((id) => Payment.findOne({ paymentId: id }));
		const payment = await findPayment(paymentId);

		if (!payment || !refundOrderIdBelongsTo(refundOrderId, payment.paymentId)) {
			await alert({
				key: `anomaly:refund-inconnu:${refundOrderId}`,
				message: `AfriBaPay a notifié un remboursement inconnu (essai ${refundOrderId}, statut ${rawStatus || "n/a"}) — aucun paiement Harvests ne correspond. Vérifiez ce versement sur le dashboard AfriBaPay.`,
				detail: `Remboursement inconnu : ${refundOrderId} (statut ${rawStatus || "n/a"})`,
				data: { refundOrderId, rawStatus, paymentId, source: "afribapay-refund-webhook" },
			});
			return { action: "alert", message: "Remboursement non trouvé" };
		}

		// L'essai visé : d'abord l'order_id exact, sinon le numéro d'essai (un
		// ancien enregistrement peut ne pas porter l'order_id complet).
		const refundAttempt = refundAttemptNumber(refundOrderId);
		const refund =
			(payment.refunds || []).find((entry) => entry?.orderId === refundOrderId) ||
			(payment.refunds || []).find((entry) => Number(entry?.attempt) === refundAttempt) ||
			null;
		const lastAttempt = (payment.refunds || []).reduce(
			(max, entry) => Math.max(max, Number(entry?.attempt) || 0),
			0,
		);
		const decision = refundWebhookDecision({
			payment,
			refund,
			refundOrderId,
			rawStatus,
			lastAttempt,
		});

		if (decision.action === "ignore") {
			console.log(`[Refund AfriBaPay] Ignoré (${decision.kind}): ${decision.detail}`);
			return { action: "ignore", message: decision.responseMessage };
		}

		if (decision.action === "alert") {
			await alert({
				key: `anomaly:refund-${decision.kind}:${refundOrderId}`,
				message: decision.message,
				detail: decision.detail,
				data: {
					paymentId: payment.paymentId,
					refundOrderId,
					rawStatus,
					source: requestInfo.source || "afribapay-refund-webhook",
				},
			});
			return { action: "alert", message: decision.responseMessage };
		}

		const status = decision.action === "apply-succeeded" ? "succeeded" : "failed";
		await finalizeRefundOutcome(
			payment,
			{
				refundId: refund.refundId,
				orderId: refundOrderId,
				status,
				previousStatus: refund.status,
				transactionId: data.transaction_id || null,
				processorStatus: rawStatus,
				reason: status === "failed" ? data.message || rawStatus : null,
				source: requestInfo.source || "afribapay-refund-webhook",
				// Coûts réels du versement client notifiés (Jour 84).
				costs: capturedAfribapayCosts(data),
			},
			{
				save: deps.save,
				notifyClient: deps.notifyClient,
				alert,
				audit: deps.audit || safeAudit,
				now: deps.now,
			},
		);
		return { action: decision.action, message: decision.responseMessage };
	} catch (err) {
		// Sans libération, la nouvelle tentative d'AfriBaPay serait prise pour un
		// rejeu et le remboursement serait perdu.
		await WebhookEvent.releaseEvent(replayKey).catch((releaseErr) => {
			console.error("[Refund AfriBaPay] Libération de la clé anti-replay impossible:", releaseErr.message);
		});
		throw err;
	}
};

module.exports = {
	mapRefundWebhookStatus,
	refundWebhookReplayKey,
	refundWebhookDecision,
	processRefundWebhook,
};
