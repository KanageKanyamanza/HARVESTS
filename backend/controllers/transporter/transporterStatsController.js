const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const Transporter = require("../../models/Transporter");
const Order = require("../../models/Order");
const Review = require("../../models/Review");

// Obtenir les statistiques
exports.getStats = catchAsync(async (req, res, next) => {
	const transporter = await Transporter.findById(req.user.id);
	if (!transporter) {
		return next(new AppError("Transporteur non trouvé", 404));
	}

	// Statistiques des commandes
	const orderStats = await Order.aggregate([
		{
			$match: {
				"delivery.transporter": transporter._id,
			},
		},
		{
			$group: {
				_id: null,
				totalDeliveries: { $sum: 1 },
				completedDeliveries: {
					$sum: {
						$cond: [{ $in: ["$status", ["delivered", "completed"]] }, 1, 0],
					},
				},
				inTransitDeliveries: {
					$sum: { $cond: [{ $eq: ["$status", "in-transit"] }, 1, 0] },
				},
				pendingDeliveries: {
					$sum: {
						$cond: [
							{ $in: ["$status", ["pending", "ready-for-pickup"]] },
							1,
							0,
						],
					},
				},
				totalRevenue: {
					$sum: "$delivery.cost",
				},
			},
		},
	]);

	// Statistiques de ponctualité
	const onTimeStats = await Order.aggregate([
		{
			$match: {
				"delivery.transporter": transporter._id,
				status: { $in: ["delivered", "completed"] },
				"delivery.deliveredAt": { $exists: true },
				"delivery.estimatedDeliveryDate": { $exists: true },
			},
		},
		{
			$project: {
				isOnTime: {
					$lte: ["$delivery.deliveredAt", "$delivery.estimatedDeliveryDate"],
				},
			},
		},
		{
			$group: {
				_id: null,
				onTimeDeliveries: {
					$sum: { $cond: ["$isOnTime", 1, 0] },
				},
				totalDelivered: { $sum: 1 },
			},
		},
	]);

	// Statistiques des avis
	const reviewStats = await Review.aggregate([
		{
			$match: {
				transporter: transporter._id,
				status: "approved",
			},
		},
		{
			$group: {
				_id: null,
				averageRating: { $avg: "$rating" },
				totalReviews: { $sum: 1 },
			},
		},
	]);

	const profileViews = transporter.profileViews || 0;

	const deliveryData = orderStats[0] || {
		totalDeliveries: 0,
		completedDeliveries: 0,
		inTransitDeliveries: 0,
		pendingDeliveries: 0,
		totalRevenue: 0,
	};

	const onTimeData = onTimeStats[0] || {
		onTimeDeliveries: 0,
		totalDelivered: 0,
	};

	const reviewData = reviewStats[0] || {
		averageRating: 0,
		totalReviews: 0,
	};

	const onTimeDeliveryRate =
		onTimeData.totalDelivered > 0 ?
			Math.round(
				(onTimeData.onTimeDeliveries / onTimeData.totalDelivered) * 100,
			)
		:	transporter.performanceStats?.onTimeDeliveryRate || 0;

	// Calculer le quota hebdomadaire
	const now = new Date();
	const day = now.getDay();
	const diff = now.getDate() - day + (day === 0 ? -6 : 1);
	const startOfWeek = new Date(now.setDate(diff));
	startOfWeek.setHours(0, 0, 0, 0);

	const weeklyOrders = await Order.countDocuments({
		"delivery.transporter": transporter._id,
		createdAt: { $gte: startOfWeek },
		status: { $ne: "cancelled" },
	});

	const maxWeeklyOrders =
		transporter.subscriptionFeatures?.maxWeeklyOrders || 5;

	const stats = {
		profileViews: profileViews,
		ratings: {
			average:
				reviewData.averageRating ?
					Math.round(reviewData.averageRating * 10) / 10
				:	0,
			count: reviewData.totalReviews || 0,
		},
		averageRating:
			reviewData.averageRating ?
				Math.round(reviewData.averageRating * 10) / 10
			:	0,
		totalReviews: reviewData.totalReviews || 0,
		performanceStats: {
			totalDeliveries:
				deliveryData.totalDeliveries ||
				transporter.performanceStats?.totalDeliveries ||
				0,
			completedDeliveries: deliveryData.completedDeliveries || 0,
			inTransitDeliveries: deliveryData.inTransitDeliveries || 0,
			pendingDeliveries: deliveryData.pendingDeliveries || 0,
			onTimeDeliveryRate: onTimeDeliveryRate,
			totalRevenue: deliveryData.totalRevenue || 0,
		},
		totalOrders: deliveryData.totalDeliveries || 0,
		activeDeliveries:
			deliveryData.inTransitDeliveries + deliveryData.pendingDeliveries || 0,
		weeklyOrders,
		maxWeeklyOrders,
	};

	res.status(200).json({
		status: "success",
		data: {
			stats,
		},
	});
});
