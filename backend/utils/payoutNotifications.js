// Notifications de reversement vendeur (Jour 82) : le vendeur est prévenu au
// moment où la paie tombe, et les admins sont alertés sur un échec définitif
// ou un statut ambigu. Séparé de utils/adminNotifications.js pour être partagé
// par le service payout (envoi) et le webhook payout, sans dépendance croisée.
const Notification = require("../models/Notification");
const WebhookEvent = require("../models/WebhookEvent");
const { createNotificationsForAdmins } = require("./adminNotifications");

/**
 * Notifie le vendeur que son reversement est parti.
 * Le texte enregistré est en français ; utils/notificationI18n.js le traduit à
 * la lecture selon la langue du vendeur (fr + en).
 * @param {object} payout Payout dont le statut vient de passer à `succeeded`
 * @returns {Promise<object|null>} la notification créée, ou null (compte de
 *   test, erreur non bloquante)
 */
const notifyPayoutSeller = async (payout) => {
	try {
		const amount = Number(payout?.amount) || 0;
		const currency = payout?.currency || "XOF";
		const message = `Votre reversement de ${amount} ${currency} a été envoyé sur votre compte mobile money.`;
		return await Notification.createNotification({
			recipient: payout.seller,
			recipientModel: "User",
			type: "payout_sent",
			category: "payment",
			title: "Reversement effectué",
			message,
			priority: "high",
			data: {
				payoutId: payout._id,
				sellerId: payout.seller,
				amount,
				currency,
				operator: payout.operator,
				status: "succeeded",
			},
			channels: {
				inApp: { enabled: true },
				// L'e-mail part par la file d'envoi ; le push prévient tout de suite.
				email: { enabled: false },
				push: { enabled: true },
			},
		});
	} catch (error) {
		console.error(`[Payout] notification vendeur non envoyée: ${error.message}`);
		return null;
	}
};

/**
 * Alerte admin dédupliquée par claim WebhookEvent (même mécanisme que les
 * anomalies de payin) : un échec définitif ou un statut ambigu n'alerte
 * qu'une fois par clé, jamais une fois par rejeu de webhook.
 * @param {{key: string, message?: string, detail: string, data?: object}} params
 */
const alertPayoutAnomaly = async ({ key, message, detail, data = {} }) => {
	const isNew = await WebhookEvent.claimEvent(key).catch((err) => {
		console.error("[Payout AfriBaPay] claim d'alerte en erreur:", err.message);
		return true; // fail-open : mieux vaut deux alertes qu'aucune
	});
	if (!isNew) return;
	console.warn(`[Payout AfriBaPay] ⚠️ ${detail}`);
	try {
		await createNotificationsForAdmins({
			title: "💸 Anomalie de reversement — AfriBaPay",
			message: message || detail,
			type: "payment_issue",
			category: "payment",
			priority: "high",
			data: { source: "afribapay-payout", detail, ...data },
		});
	} catch (err) {
		console.error(`[Payout AfriBaPay] alerte non envoyée: ${err.message}`);
	}
};

module.exports = { notifyPayoutSeller, alertPayoutAnomaly };
