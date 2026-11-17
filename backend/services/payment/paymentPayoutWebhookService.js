// Webhook payout AfriBaPay (Jour 82) — symétrique du webhook payin du Jour 77 :
// AfriBaPay confirme après le POST /pay/payout du Jour 81, sur le chemin déjà
// annoncé dans la `notify_url` de l'envoi (/api/v1/payouts/afribapay/webhook).
//
// Garanties du jour :
//  1. Authenticité : en-tête `Afribapay-Sign` (HMAC-SHA256 du corps BRUT, avec
//     AFRIBAPAY_API_KEY puis AFRIBAPAY_WEBHOOK_SECRET) OU secret d'URL
//     (`?secret=…` ou en-tête `Afribapay-Secret`, AFRIBAPAY_PAYOUT_WEBHOOK_SECRET)
//     — AfriBaPay ne signe pas toujours les notifications payout. Aucun canal
//     configuré → 503 ; les deux invalides → 403 + alerte admin (1/jour).
//  2. Anti-replay : chaque couple (order_id de la tentative, statut) est réclamé
//     une seule fois via WebhookEvent.claimEvent — jamais traité deux fois ;
//     fail-open si l'infra casse (un payout légitime n'est jamais bloqué).
//  3. Un payout `succeeded` n'est JAMAIS rétrogradé : l'échec d'une tentative
//     remplacée est loggé sans alerte, tout autre conflit alerte les admins.
//  4. Un succès tardif sur un payout `failed`/`ambiguous` est appliqué (l'argent
//     est réellement parti) ; un succès sur un payout `cancelled` alerte sans
//     changer le statut (une annulation est une décision humaine).
//  5. La finalisation est celle de l'envoi et de la relance manuelle
//     (paymentPayoutService.finalizePayoutOutcome) : notification du vendeur,
//     alerte admin sur échec définitif/ambigu, marqueur payoutState, audit.
//
// La décision est une fonction pure (testée sans MongoDB ni réseau) ; le
// handler ne fait que : authenticité → identité → claim → recherche → décision
// → finalisation.
const Payout = require("../../models/Payout");
const WebhookEvent = require("../../models/WebhookEvent");
const afribapayConfig = require("../../config/afribapay");
const {
	checkAfribapaySignature,
	checkUrlSecret,
	SIGNATURE_HEADER,
	URL_SECRET_PARAM,
	URL_SECRET_HEADER,
} = require("../../utils/afribapaySignature");
const {
	payoutIdFromPayoutOrderId,
	payoutOrderIdBelongsTo,
	isSupersededPayoutOrderId,
} = require("../../utils/payoutOrderId");
const { isRefundOrderId } = require("../../utils/refundOrderId");
const { redactSecrets } = require("../../utils/afribapayUtils");
const payoutService = require("./paymentPayoutService");
const refundWebhookService = require("./paymentRefundWebhookService");
const payoutNotifications = require("../../utils/payoutNotifications");

const SUCCESS_STATUSES = payoutService.PAYOUT_SUCCESS_STATUSES;
const FAILURE_STATUSES = payoutService.PAYOUT_FAILURE_STATUSES;

/**
 * Traduit le statut brut du webhook en issue de reversement.
 * @param {string} rawStatus
 * @returns {"succeeded"|"failed"|null} null pour les statuts intermédiaires
 *   (PENDING, PROCESSING, INITIATED…) : loggés et ignorés.
 */
const mapPayoutWebhookStatus = (rawStatus) => {
	const status = String(rawStatus || "").toUpperCase();
	if (SUCCESS_STATUSES.includes(status)) return "succeeded";
	if (FAILURE_STATUSES.includes(status)) return "failed";
	return null;
};

/**
 * Identité du webhook : order_id de la tentative visée + statut brut. AfricaSend
 * a vu plusieurs noms de champs selon les versions de l'API — tous essayés.
 * @param {object} body corps vérifié par signature
 * @returns {{ payoutOrderId: string, rawStatus: string } | null}
 */
const extractPayoutWebhookIdentity = (body) => {
	const data = body?.data && typeof body.data === "object" ? body.data : body;
	const payoutOrderId =
		data?.order_id ||
		body?.order_id ||
		data?.transaction_id ||
		body?.transaction_id ||
		data?.reference_id ||
		body?.reference_id ||
		data?.reference ||
		body?.reference;
	if (!payoutOrderId) return null;
	return {
		payoutOrderId: String(payoutOrderId),
		rawStatus: String(data?.status || body?.status || ""),
	};
};

/**
 * Clé d'idempotence : order_id EXACT de la tentative (le SUCCESS de `-r2` n'est
 * pas un rejeu du FAILED de `-r1`) + statut.
 */
const payoutWebhookReplayKey = (payoutOrderId, rawStatus) =>
	`payout:${payoutOrderId}:${String(rawStatus || "").toUpperCase()}`;

/**
 * Décision pure du webhook payout.
 *
 * @param {object} params
 * @param {object} params.payout Payout trouvé en base (ou objet équivalent)
 * @param {string} params.payoutOrderId order_id reçu (`payout-<id>[-rN]`)
 * @param {string} params.rawStatus statut AfriBaPay brut
 * @returns {{ action: "apply-succeeded"|"apply-failed"|"ignore"|"alert", kind: string, responseMessage: string, detail: string, message?: string }}
 */
const payoutWebhookDecision = ({ payout, payoutOrderId, rawStatus }) => {
	const newStatus = mapPayoutWebhookStatus(rawStatus);
	if (!newStatus) {
		return {
			action: "ignore",
			kind: "statut-intermediaire",
			responseMessage: "Webhook traité",
			detail: `Statut ${rawStatus || "vide"} non final : ignoré`,
		};
	}

	const afribapay = payout?.afribapay || {};
	const confirmedOrderId = afribapay.payoutOrderId || null;
	const lastAttempt = afribapay.attempt;

	// Versement déjà confirmé : jamais rétrogradé. L'échec d'un essai remplacé
	// (webhook livré en retard) est normal — simple log ; tout autre message
	// contradictoire est une anomalie signalée.
	if (payout.status === "succeeded") {
		if (newStatus === "succeeded") {
			// Un SECOND order_id confirmé alors qu'un autre a déjà payé le
			// vendeur est un double paiement probable (ex. SUCCESS tardif de
			// `-r1` après le SUCCESS de `-r2`) : jamais silencieux.
			if (confirmedOrderId && payoutOrderId !== String(confirmedOrderId)) {
				return {
					action: "alert",
					kind: "double-paiement",
					responseMessage: "Second reversement confirmé — signalé",
					detail: `Webhook ${rawStatus} (essai ${payoutOrderId}) alors que le payout ${payout._id} est déjà confirmed par ${confirmedOrderId}`,
					message: `AfriBaPay confirme DEUX reversements pour le payout ${payout._id} : ${confirmedOrderId} puis ${payoutOrderId}. Le vendeur a peut-être été payé deux fois — vérifiez le dashboard AfriBaPay avant toute action.`,
				};
			}
			return {
				action: "ignore",
				kind: "deja-confirme",
				responseMessage: "Reversement déjà confirmé",
				detail: `Succès ${rawStatus} sur ${payoutOrderId} alors que le payout ${payout._id} est déjà succeeded`,
			};
		}
		if (isSupersededPayoutOrderId(payoutOrderId, { confirmedOrderId, lastAttempt })) {
			return {
				action: "ignore",
				kind: "essai-remplace",
				responseMessage: "Échec d'un essai remplacé — reversement inchangé",
				detail: `${rawStatus} sur ${payoutOrderId} alors que le reversement est confirmé par ${confirmedOrderId || "une tentative ultérieure"} — statut conservé, pas d'alerte.`,
			};
		}
		return {
			action: "alert",
			kind: "conflit-statut",
			responseMessage: "Conflit de statut signalé, reversement inchangé",
			detail: `Webhook ${rawStatus} (essai ${payoutOrderId}) vs payout ${payout.status}`,
			message: `AfriBaPay notifie ${rawStatus} (essai ${payoutOrderId}) alors que le reversement ${payout._id} est déjà succeeded${confirmedOrderId ? ` (confirmé par ${confirmedOrderId})` : ""}. Le vendeur a été payé : vérifiez le dashboard AfriBaPay avant toute action.`,
		};
	}

	// Payout annulé par un humain : un succès tardif signifie que l'argent est
	// parti sans notre accord — alerte, statut conservé.
	if (payout.status === "cancelled") {
		if (newStatus === "succeeded") {
			return {
				action: "alert",
				kind: "payout-sur-annule",
				responseMessage: "Versement reçu sur un reversement annulé — signalé",
				detail: `Webhook ${rawStatus} (essai ${payoutOrderId}) vs payout cancelled`,
				message: `AfriBaPay confirme le reversement ${payoutOrderId} alors que le payout ${payout._id} était annulé : le vendeur a peut-être été payé deux fois. Vérifiez le dashboard AfriBaPay.`,
			};
		}
		return {
			action: "ignore",
			kind: "annule",
			responseMessage: "Reversement annulé — événement ignoré",
			detail: `${rawStatus} sur ${payoutOrderId} : payout cancelled, statut conservé`,
		};
	}

	// Échec visant une tentative antérieure à la tentative courante (un
	// `-r2` attendu, FAILED tardif du premier essai) : ne fait pas tomber
	// l'essai en cours.
	if (newStatus === "failed" && isSupersededPayoutOrderId(payoutOrderId, { lastAttempt })) {
		return {
			action: "ignore",
			kind: "essai-remplace",
			responseMessage: "Échec d'un essai remplacé — reversement inchangé",
			detail: `${rawStatus} sur ${payoutOrderId} alors que la tentative courante est la n°${lastAttempt} — statut ${payout.status} conservé.`,
		};
	}

	// Cas nominaux : succès (y compris après un échec ou un statut ambigu — un
	// succès tardif prouve que le versement est parti) ou échec de l'essai
	// courant.
	return {
		action: newStatus === "succeeded" ? "apply-succeeded" : "apply-failed",
		kind: newStatus,
		responseMessage: "Webhook traité",
		detail: `Webhook ${rawStatus} (essai ${payoutOrderId}) → payout ${payout._id} passe en ${newStatus}`,
	};
};

/**
 * Secret d'URL reçu : query `secret` (l'URL de notification) ou en-tête
 * `Afribapay-Secret`. Les deux sont acceptés ; le premier non vide gagne.
 * @param {object} req requête Express
 */
const readUrlSecret = (req) => {
	const header = (name) =>
		typeof req?.get === "function" ? req.get(name) : req?.headers?.[String(name).toLowerCase()];
	return req?.query?.[URL_SECRET_PARAM] || header(URL_SECRET_HEADER) || null;
};

/**
 * Applique la décision du webhook. `deps` traverse jusqu'à la finalisation
 * (tests sans base ni réseau).
 * @param {object} params
 * @returns {Promise<{action: string}>}
 */
const applyPayoutWebhookOutcome = async ({
	payout,
	decision,
	payoutOrderId,
	rawStatus,
	data = {},
	requestInfo = {},
	deps = {},
}) => {
	const source = requestInfo.source || "afribapay-payout-webhook";

	if (decision.action === "ignore") {
		console.log(`[Payout AfriBaPay] Ignoré (${decision.kind}): ${decision.detail}`);
		return { action: "ignore" };
	}

	if (decision.action === "alert") {
		await payoutNotifications.alertPayoutAnomaly({
			key: `anomaly:payout-${decision.kind}:${payoutOrderId}`,
			message: decision.message,
			detail: decision.detail,
			data: {
				payoutId: payout?._id?.toString?.() || String(payout?._id),
				payoutOrderId,
				rawStatus,
				source,
			},
		});
		return { action: "alert" };
	}

	const status = decision.action === "apply-succeeded" ? "succeeded" : "failed";
	await payoutService.finalizePayoutOutcome(
		payout,
		{
			status,
			orderId: payoutOrderId,
			transactionId: data.transaction_id || null,
			processorStatus: rawStatus,
			reason: status === "failed" ? data.message || rawStatus : null,
			source,
		},
		deps,
	);
	return { action: decision.action };
};

/**
 * Handler du webhook payout. Route montée dans app.js sur
 * AFRIBAPAY_PAYOUT_WEBHOOK_PATH, AVANT express.json (corps brut pour la
 * signature), sans authentification (machine-to-machine) — c'est AfriBaPay qui
 * appelle.
 */
const handleAfribapayPayoutWebhook = async (req, res) => {
	const body = req.body || {};

	// --- 1. Authenticité : signature HMAC ou secret d'URL ---
	const signatureCheck = checkAfribapaySignature(req, [
		afribapayConfig.AFRIBAPAY_API_KEY,
		afribapayConfig.AFRIBAPAY_WEBHOOK_SECRET,
	]);
	const secretCheck = checkUrlSecret(readUrlSecret(req), afribapayConfig.getPayoutWebhookSecret());

	if (signatureCheck === "unconfigured" && secretCheck === "unconfigured") {
		console.error(
			"[SECURITY Webhook Payout AfriBaPay] Aucun canal d'authentification configuré (AFRIBAPAY_API_KEY / AFRIBAPAY_PAYOUT_WEBHOOK_SECRET) — webhook payout désactivé",
		);
		return res.status(503).json({ error: "Service non configuré" });
	}
	if (signatureCheck !== "valid" && secretCheck !== "valid") {
		console.warn(
			`[Webhook Payout AfriBaPay] Authentification refusée (signature: ${signatureCheck}, secret d'URL: ${secretCheck}) — requête rejetée`,
		);
		// Une fois par jour (claim) : il faut savoir qu'un intrus — ou un
		// changement d'interface AfriBaPay — a frappé sur le webhook.
		await payoutNotifications.alertPayoutAnomaly({
			key: `anomaly:payout-signature:${new Date().toISOString().slice(0, 10)}`,
			message: `Webhook payout AfriBaPay rejeté (signature: ${signatureCheck}, secret d'URL: ${secretCheck}, IP ${req.ip || "inconnue"}). Vérifiez AFRIBAPAY_API_KEY / AFRIBAPAY_PAYOUT_WEBHOOK_SECRET et l'URL de notification configurée côté AfriBaPay.`,
			detail: `Authentification payout refusée (signature: ${signatureCheck}, secret: ${secretCheck}, IP: ${req.ip || "inconnue"})`,
			data: { signatureCheck, secretCheck, ip: req.ip },
		});
		return res.status(403).json({ error: "Authentification invalide" });
	}
	// --------------------------------------------

	console.log("[Webhook Payout AfriBaPay] Reçu:", redactSecrets(JSON.stringify(body)));

	// Clé anti-replay réclamée pendant ce traitement : libérée si une erreur
	// interne empêche d'aboutir, sinon la nouvelle tentative d'AfriBaPay serait
	// prise pour un rejeu et l'événement définitivement perdu.
	let claimedKey = null;

	try {
		// --- 2. Identité + anti-replay ---
		const identity = extractPayoutWebhookIdentity(body);
		if (!identity) {
			console.warn(
				"[Webhook Payout AfriBaPay] Reçu sans order_id/référence:",
				redactSecrets(JSON.stringify(body)),
			);
			return res.status(200).json({ message: "Webhook sans identifiant de reversement, ignoré" });
		}

		const { payoutOrderId, rawStatus } = identity;

		// --- 2bis. Remboursements client (Jour 83) : AfriBaPay notifie les
		// remboursements sur la MÊME URL que le payout (`refund-<paymentId>[-rN]`).
		// Le service des remboursements prend le relais, avec son propre
		// anti-replay — sinon un remboursement serait pris pour un reversement
		// inconnu.
		if (isRefundOrderId(payoutOrderId)) {
			const refundData = body.data && typeof body.data === "object" ? body.data : body;
			const outcome = await refundWebhookService.processRefundWebhook({
				refundOrderId: payoutOrderId,
				rawStatus,
				data: refundData,
				requestInfo: { source: "afribapay-payout-webhook", ip: req.ip },
			});
			return res.status(200).json({ message: outcome.message });
		}

		const replayKey = payoutWebhookReplayKey(payoutOrderId, rawStatus);
		const isNewEvent = await WebhookEvent.claimEvent(replayKey).catch((err) => {
			console.error("[Webhook Payout AfriBaPay] claim anti-replay en erreur:", err.message);
			return true; // fail-open : un événement légitime n'est jamais bloqué
		});
		if (!isNewEvent) {
			console.log(`[Webhook Payout AfriBaPay] Rejeu détecté et ignoré: ${replayKey}`);
			return res.status(200).json({ message: "Événement déjà traité" });
		}
		claimedKey = replayKey;

		// --- 3. Recherche du Payout (payout-<id>[-rN] → id) ---
		const derivedPayoutId = payoutIdFromPayoutOrderId(payoutOrderId);
		let payout = null;
		try {
			payout = await Payout.findById(derivedPayoutId);
		} catch (err) {
			// Seul un identifiant qui n'est pas un ObjectId est « inconnu ».
			// Une panne de la base doit remonter (500 → libération du claim →
			// AfriBaPay retente) : sinon la confirmation serait perdue.
			if (err?.name !== "CastError") throw err;
			payout = null;
		}
		if (!payout || !payoutOrderIdBelongsTo(payoutOrderId, payout._id)) {
			console.error(`[Webhook Payout AfriBaPay] Reversement inconnu : ${payoutOrderId}`);
			await payoutNotifications.alertPayoutAnomaly({
				key: `anomaly:payout-inconnu:${payoutOrderId}`,
				message: `AfriBaPay a notifié un reversement inconnu (essai ${payoutOrderId}, statut ${rawStatus || "n/a"}) — aucun Payout Harvests ne correspond. Vérifiez ce versement sur le dashboard AfriBaPay.`,
				detail: `Reversement inconnu : ${payoutOrderId} (statut ${rawStatus || "n/a"})`,
				data: { payoutOrderId, rawStatus, derivedPayoutId },
			});
			return res.status(200).json({ message: "Reversement non trouvé" });
		}

		// --- 4. Décision puis finalisation partagée (envoi, relance, webhook) ---
		const data = body.data && typeof body.data === "object" ? body.data : body;
		const decision = payoutWebhookDecision({ payout, payoutOrderId, rawStatus });
		await applyPayoutWebhookOutcome({
			payout,
			decision,
			payoutOrderId,
			rawStatus,
			data,
			requestInfo: { source: "afribapay-payout-webhook", ip: req.ip },
		});
		return res.status(200).json({ message: decision.responseMessage });
	} catch (err) {
		if (claimedKey) {
			await WebhookEvent.releaseEvent(claimedKey).catch((releaseErr) => {
				console.error(
					"[Webhook Payout AfriBaPay] Libération de la clé anti-replay impossible:",
					releaseErr.message,
				);
			});
		}
		console.error(
			"[Webhook Payout AfriBaPay] Erreur interne:",
			redactSecrets(err?.response?.data ?? err.message ?? err),
		);
		return res.status(500).json({ error: "Erreur interne du serveur" });
	}
};

module.exports = {
	mapPayoutWebhookStatus,
	extractPayoutWebhookIdentity,
	payoutWebhookReplayKey,
	payoutWebhookDecision,
	applyPayoutWebhookOutcome,
	handleAfribapayPayoutWebhook,
};
