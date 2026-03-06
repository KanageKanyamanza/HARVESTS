const mongoose = require("mongoose");

/**
 * Checks if a user has reached their weekly order limit.
 * @param {string} userId - The user ID to check.
 * @throws {Error} if the limit is reached.
 */
async function checkWeeklyOrderLimit(userId) {
	const User = mongoose.model("User");
	const Order = mongoose.model("Order");

	const user = await User.findById(userId);
	if (!user) return;

	// Les admins et les consommateurs n'ont pas cette limite
	if (["admin", "consumer"].includes(user.userType)) return;

	const maxWeeklyOrders = user.subscriptionFeatures?.maxWeeklyOrders;

	// -1 signifie illimité
	if (maxWeeklyOrders === -1) return;

	// Par défaut, limite du plan Gratuit si non définie
	const limit = maxWeeklyOrders !== undefined ? maxWeeklyOrders : 5;

	// Définir le début de la semaine en cours (Lundi)
	const now = new Date();
	const day = now.getDay(); // 0 (Dim) à 6 (Sam)
	const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Ajuster si on est dimanche
	const startOfWeek = new Date(now.setDate(diff));
	startOfWeek.setHours(0, 0, 0, 0);

	// Compter les commandes reçues/assignées cette semaine (en tant que vendeur ou transporteur)
	let query = {
		createdAt: { $gte: startOfWeek },
		status: { $ne: "cancelled" }, // On ne compte pas les commandes annulées
		$or: [
			{ seller: userId },
			{ "segments.seller": userId },
			{ "delivery.transporter": userId },
		],
	};

	const orderCount = await Order.countDocuments(query);

	if (orderCount >= limit) {
		// Notifier le vendeur que son quota est atteint (pour l'affichage dans son dashboard)
		try {
			const Notification = mongoose.model("Notification");
			const Subscription = mongoose.model("Subscription");
			const plans = Subscription.getAvailablePlans();
			const planId = user.subscriptionFeatures?.planId || "gratuit";
			const planName = plans[planId]?.name || "Gratuit";

			await Notification.notifyQuotaReached(userId, planName, limit);
		} catch (notifyError) {
			console.error("Erreur notification quota atteint:", notifyError);
		}

		throw new Error(
			`Limite hebdomadaire de commandes atteinte (${limit}). Veuillez passer à un plan supérieur pour recevoir plus de commandes.`,
		);
	}
}

module.exports = {
	checkWeeklyOrderLimit,
};
