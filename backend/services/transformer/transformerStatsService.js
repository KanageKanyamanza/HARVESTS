const Transformer = require("../../models/Transformer");
const Order = require("../../models/Order");
const Product = require("../../models/Product");

/**
 * Service pour les statistiques du transformateur
 */

async function getBusinessStats(transformerId) {
	const transformer = await Transformer.findById(transformerId);
	if (!transformer) {
		throw new Error("Transformateur non trouvé");
	}

	const totalOrders = await Order.countDocuments({
		seller: transformerId,
		status: { $ne: "cancelled" },
	});

	const completedOrders = await Order.countDocuments({
		seller: transformerId,
		status: "completed",
	});

	const pendingOrders = await Order.countDocuments({
		seller: transformerId,
		status: { $in: ["pending", "processing"] },
	});

	const totalProducts = await Product.countDocuments({
		transformer: transformerId,
		userType: "transformer",
	});

	const activeProducts = await Product.countDocuments({
		transformer: transformerId,
		userType: "transformer",
		status: "approved",
		isActive: true,
	});

	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

	const monthlyRevenue = await Order.aggregate([
		{
			$match: {
				seller: transformerId,
				status: { $in: ["completed", "delivered"] },
				createdAt: { $gte: startOfMonth, $lte: endOfMonth },
			},
		},
		{
			$group: {
				_id: null,
				total: { $sum: "$total" },
			},
		},
	]);

	// Récupérer la note moyenne depuis les avis
	let averageRating = 0;
	let totalReviews = 0;
	try {
		const Review = require("../../models/Review");
		const reviewStats = await Review.aggregate([
			{ $match: { transformer: transformerId, status: "approved" } },
			{
				$group: {
					_id: null,
					averageRating: { $avg: "$rating" },
					totalReviews: { $sum: 1 },
				},
			},
		]);

		if (reviewStats.length > 0 && reviewStats[0].averageRating) {
			averageRating = Math.round(reviewStats[0].averageRating * 10) / 10;
			totalReviews = reviewStats[0].totalReviews || 0;
		}
	} catch (error) {
		console.error("Erreur lors du calcul de la note moyenne:", error);
	}

	// Calculer le quota hebdomadaire
	const nowWeekly = new Date();
	const day = nowWeekly.getDay();
	const diff = nowWeekly.getDate() - day + (day === 0 ? -6 : 1);
	const startOfWeek = new Date(nowWeekly.setDate(diff));
	startOfWeek.setHours(0, 0, 0, 0);

	const weeklyOrders = await Order.countDocuments({
		$or: [{ seller: transformerId }, { "segments.seller": transformerId }],
		createdAt: { $gte: startOfWeek },
		status: { $ne: "cancelled" },
	});

	const maxWeeklyOrders =
		transformer.subscriptionFeatures?.maxWeeklyOrders || 5;

	return {
		totalOrders,
		completedOrders,
		pendingOrders,
		totalProducts,
		activeProducts,
		monthlyRevenue: monthlyRevenue[0]?.total || 0,
		averageRating,
		totalReviews,
		weeklyOrders,
		maxWeeklyOrders,
	};
}

async function getProductionAnalytics(transformerId, period = "30d") {
	const now = new Date();
	let startDate;

	switch (period) {
		case "7d":
			startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			break;
		case "30d":
			startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
			break;
		case "90d":
			startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
			break;
		default:
			startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
	}

	const orders = await Order.find({
		seller: transformerId,
		status: { $in: ["completed", "delivered"] },
		createdAt: { $gte: startDate },
	});

	const dailyProduction = {};
	orders.forEach((order) => {
		const date = new Date(order.createdAt).toLocaleDateString("fr-FR");
		if (!dailyProduction[date]) {
			dailyProduction[date] = {
				orders: 0,
				revenue: 0,
				products: 0,
			};
		}
		dailyProduction[date].orders += 1;
		dailyProduction[date].revenue += order.total || 0;
		order.items.forEach((item) => {
			dailyProduction[date].products += item.quantity;
		});
	});

	return {
		period,
		dailyProduction: Object.entries(dailyProduction).map(([date, data]) => ({
			date,
			...data,
		})),
	};
}

module.exports = {
	getBusinessStats,
	getProductionAnalytics,
};
