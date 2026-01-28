const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const Exporter = require("../../models/Exporter");
const Order = require("../../models/Order");
const Review = require("../../models/Review");

// Obtenir les statistiques d'export
exports.getExportStats = catchAsync(async (req, res, next) => {
	const exporter = await Exporter.findById(req.user.id);
	if (!exporter) {
		return next(new AppError("Exportateur non trouvé", 404));
	}

	// Récupérer toutes les commandes assignées à l'exportateur
	let allOrders = [];
	try {
		allOrders = await Order.find({
			"delivery.transporter": exporter._id,
		}).populate("delivery.transporter", "userType");
	} catch (err) {
		console.warn("Erreur lors de la récupération des commandes:", err.message);
	}

	// Filtrer pour ne garder que les commandes assignées à un exportateur
	const exportOrders = (allOrders || []).filter((order) => {
		const transporter = order.delivery?.transporter;
		if (
			transporter &&
			typeof transporter === "object" &&
			transporter.userType
		) {
			return transporter.userType === "exporter";
		}
		return order.isExport === true;
	});

	// Calculer les statistiques depuis les commandes filtrées
	const orderStats = exportOrders.reduce(
		(acc, order) => {
			acc.totalExports += 1;

			if (["delivered", "completed"].includes(order.status)) {
				acc.completedExports += 1;
				acc.totalValue += order.deliveryFee || order.delivery?.deliveryFee || 0;
			}

			if (order.status === "in-transit") {
				acc.inTransitExports += 1;
			}

			if (["ready-for-pickup", "preparing"].includes(order.status)) {
				acc.pendingExports += 1;
			}

			return acc;
		},
		{
			totalExports: 0,
			completedExports: 0,
			inTransitExports: 0,
			pendingExports: 0,
			totalValue: 0,
		},
	);

	// Calculer le taux de livraison réussie
	const successfulStats = exportOrders.reduce(
		(acc, order) => {
			acc.totalOrders += 1;
			if (["delivered", "completed"].includes(order.status)) {
				acc.successfulDeliveries += 1;
			}
			return acc;
		},
		{
			totalOrders: 0,
			successfulDeliveries: 0,
		},
	);

	// Statistiques des avis
	const exportOrderIds = exportOrders.map((order) => order._id);

	const reviewStats = await Review.aggregate([
		{
			$match: {
				status: "approved",
				$or: [{ order: { $in: exportOrderIds } }, { exporter: exporter._id }],
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

	const profileViews = exporter.profileViews || 0;
	const exportCountries = exporter.targetMarkets?.length || 0;
	const exportProductsCount = exporter.exportProducts?.length || 0;

	const activeLicenses =
		exporter.exportLicenses?.filter((license) => {
			if (!license.validUntil) return license.isVerified;
			return license.isVerified && new Date(license.validUntil) > new Date();
		}).length || 0;

	const deliveryData = orderStats || {
		totalExports: 0,
		completedExports: 0,
		inTransitExports: 0,
		pendingExports: 0,
		totalValue: 0,
	};

	const successfulData = successfulStats || {
		totalOrders: 0,
		successfulDeliveries: 0,
	};

	const reviewData = reviewStats[0] || {
		averageRating: 0,
		totalReviews: 0,
	};

	const successfulDeliveryRate =
		successfulData.totalOrders > 0 ?
			Math.round(
				(successfulData.successfulDeliveries / successfulData.totalOrders) *
					100,
			)
		:	exporter.exportStats?.successfulDeliveryRate || 0;

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
		totalExports:
			deliveryData.totalExports || exporter.exportStats?.totalExports || 0,
		totalValue:
			deliveryData.totalValue || exporter.exportStats?.totalValue || 0,
		exportValue:
			deliveryData.totalValue || exporter.exportStats?.totalValue || 0,
		successfulDeliveryRate: successfulDeliveryRate,
		completedExports: deliveryData.completedExports || 0,
		inTransitExports: deliveryData.inTransitExports || 0,
		pendingExports: deliveryData.pendingExports || 0,
		exportCountries: exportCountries,
		exportProductsCount: exportProductsCount,
		activeLicenses: activeLicenses,
		totalProducts: exportProductsCount,
		activeProducts: exportProductsCount,
		totalOrders: deliveryData.totalExports || 0,
	};

	res.status(200).json({
		status: "success",
		data: {
			stats,
		},
	});
});

// Alias pour compatibilité
exports.getStats = exports.getExportStats;
