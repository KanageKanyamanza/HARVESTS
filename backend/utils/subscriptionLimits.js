const mongoose = require("mongoose");
const AppError = require("./appError");

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

		throw new AppError("order.weekly_limit_reached", 403, { limit });
	}
}

/**
 * Vérifie la limite de produits du plan d'abonnement avant une création.
 * Jour 59 : partagée par toutes les routes de création (producteur via
 * /producers/me/products, producteur via /products, transformateur) — la
 * route de l'interface producteur ne la vérifiait pas : un appel direct à
 * l'API permettait de dépasser le plan.
 * @param {"producer"|"transformer"} ownerField - champ propriétaire du produit
 * @param {string} ownerId - identifiant du vendeur
 * @throws {AppError} 403 si la limite est atteinte
 */
async function assertProductLimit(ownerField, ownerId) {
	const Subscription = mongoose.model("Subscription");
	const Product = mongoose.model("Product");
	const activeSubscription = await Subscription.findOne({ user: ownerId, status: "active" });

	const plans = Subscription.getAvailablePlans();
	const currentPlan = (activeSubscription && plans[activeSubscription.planId]) || plans.gratuit;
	const maxProducts = currentPlan.features.maxProducts;
	if (maxProducts === -1) return;

	const productCount = await Product.countDocuments({
		[ownerField]: ownerId,
		status: { $ne: "inactive" },
	});
	if (productCount >= maxProducts) {
		throw new AppError("product.limit_reached", 403, { plan: currentPlan.name, max: maxProducts });
	}
}

module.exports = {
	checkWeeklyOrderLimit,
	assertProductLimit,
};
