const User = require("../../models/User");
const Product = require("../../models/Product");
const Order = require("../../models/Order");
const LanguageSwitch = require("../../models/LanguageSwitch");
const catchAsync = require("../../utils/catchAsync");
const { toPlainText } = require("../../utils/localization");

// @desc    Obtenir les analytics
// @route   GET /api/v1/admin/analytics
// @access  Admin
// Jour 73 (lancement bilingue) : suivi du taux d'usage de la bascule
// fr/en, consommé par la carte « Bascule FR/EN » de la page admin
// Analytiques. Les agrégats reprennent la fenêtre de temps déjà calculée
// par getAnalytics (timeRange) : une seule source pour toutes les cartes.

/**
 * Agrège les totaux en la vue « overview » exposée à l'admin : part de
 * l'anglais, retours au français, visiteurs distincts. Fonction pure,
 * testée sans MongoDB (tests/language-usage.test.js).
 */
const buildLanguageUsageOverview = ({
	total = 0,
	toEnglish = 0,
	distinctVisitorCount = 0,
} = {}) => {
	// Retours au français : toute bascule non anglaise (en → fr).
	const toFrench = Math.max(total - toEnglish, 0);

	// Le taux demandé par la feuille de route : part de l'anglais parmi
	// les bascules explicites de la période, exprimée en pourcentage.
	const englishShare =
		total > 0 ? parseFloat(((toEnglish / total) * 100).toFixed(1)) : 0;

	return {
		total,
		toEnglish,
		toFrench,
		englishShare,
		distinctVisitors: distinctVisitorCount,
	};
};

// Exposé pour les tests : le calcul du taux est le cœur du suivi.
exports.buildLanguageUsageOverview = buildLanguageUsageOverview;

// Agrégats MongoDB du suivi ; getAnalytics (plus bas) les consomme pour
// nourrir la carte « Bascule FR/EN » de la page admin Analytiques.
exports.getLanguageUsage = async (startDate) => {
	const periodMatch = { occurredAt: { $gte: startDate } };

	const switchTotals = await LanguageSwitch.aggregate([
		{ $match: periodMatch },
		{
			$group: {
				_id: null,
				total: { $sum: 1 },
				toEnglish: {
					$sum: { $cond: [{ $eq: ["$to", "en"] }, 1, 0] },
				},
			},
		},
		{ $project: { _id: 0, total: 1, toEnglish: 1 } },
	]);

	const totals = switchTotals[0] || { total: 0, toEnglish: 0 };

	// Un agrégat honnête compte les visiteurs, pas les clics : distinct()
	// sur l'identifiant anonyme du navigateur évite qu'une personne qui
	// teste fr/en à répétition soit comptée à chaque bascule.
	const distinctVisitors = await LanguageSwitch.distinct(
		"visitorId",
		periodMatch,
	);

	// Endroits de l'interface (header, footer, topbar, auth…) où la bascule
	// est employée : c'est la matière première du Jour 74
	// (« en se basant sur les retours/usages remontés »).
	const byContext = await LanguageSwitch.aggregate([
		{ $match: periodMatch },
		{
			$group: {
				_id: { $ifNull: ["$context", "unknown"] },
				total: { $sum: 1 },
				toEnglish: {
					$sum: { $cond: [{ $eq: ["$to", "en"] }, 1, 0] },
				},
			},
		},
		{ $sort: { total: -1 } },
		{ $limit: 5 },
		{ $project: { _id: 0, context: "$_id", total: 1, toEnglish: 1 } },
	]);

	// Même format que les graphiques existants (year/month/day) : une
	// carte future pourra tracer la courbe sans changement de contrat.
	const byDay = await LanguageSwitch.aggregate([
		{ $match: periodMatch },
		{
			$group: {
				_id: {
					year: { $year: "$occurredAt" },
					month: { $month: "$occurredAt" },
					day: { $dayOfMonth: "$occurredAt" },
				},
				total: { $sum: 1 },
				toEnglish: {
					$sum: { $cond: [{ $eq: ["$to", "en"] }, 1, 0] },
				},
			},
		},
		{ $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
		{ $project: { _id: 0, day: "$_id", total: 1, toEnglish: 1 } },
	]);

	return {
		overview: buildLanguageUsageOverview({
			total: totals.total,
			toEnglish: totals.toEnglish,
			distinctVisitorCount: distinctVisitors.length,
		}),
		byContext,
		byDay,
	};
};

exports.getAnalytics = catchAsync(async (req, res, next) => {
	const { timeRange = "30d" } = req.query;

	// Calculer la période
	const days =
		timeRange === "7d"
			? 7
			: timeRange === "30d"
			? 30
			: timeRange === "90d"
			? 90
			: 365;
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - days);

	// Récupérer les statistiques générales
	const totalUsers = await User.countDocuments();
	const totalProducts = await Product.countDocuments();
	const totalOrders = await Order.countDocuments();

	// Calculer le revenu total
	const revenueResult = await Order.aggregate([
		{ $match: { status: { $in: ["completed", "delivered"] } } },
		{ $group: { _id: null, total: { $sum: "$total" } } },
	]);
	const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

	// Statistiques de croissance
	const usersLastPeriod = await User.countDocuments({
		createdAt: { $gte: startDate },
	});
	const productsLastPeriod = await Product.countDocuments({
		createdAt: { $gte: startDate },
	});
	const ordersLastPeriod = await Order.countDocuments({
		createdAt: { $gte: startDate },
	});

	const userGrowth = totalUsers > 0 ? (usersLastPeriod / totalUsers) * 100 : 0;
	const productGrowth =
		totalProducts > 0 ? (productsLastPeriod / totalProducts) * 100 : 0;
	const orderGrowth =
		totalOrders > 0 ? (ordersLastPeriod / totalOrders) * 100 : 0;

	// Données pour les graphiques
	const userRegistrations = await User.aggregate([
		{
			$match: { createdAt: { $gte: startDate } },
		},
		{
			$group: {
				_id: {
					year: { $year: "$createdAt" },
					month: { $month: "$createdAt" },
					day: { $dayOfMonth: "$createdAt" },
				},
				count: { $sum: 1 },
			},
		},
		{
			$sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
		},
	]);

	const revenueTrends = await Order.aggregate([
		{
			$match: {
				createdAt: { $gte: startDate },
				status: { $in: ["completed", "delivered"] },
			},
		},
		{
			$group: {
				_id: {
					year: { $year: "$createdAt" },
					month: { $month: "$createdAt" },
					day: { $dayOfMonth: "$createdAt" },
				},
				revenue: { $sum: "$total" },
				orders: { $sum: 1 },
			},
		},
		{
			$sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
		},
	]);

	// Distribution par catégorie
	const categoryDistribution = await Product.aggregate([
		{
			$group: {
				_id: "$category",
				count: { $sum: 1 },
				averagePrice: { $avg: "$price" },
			},
		},
		{
			$sort: { count: -1 },
		},
	]);

	// Top producteurs
	const topProducers = await Order.aggregate([
		{
			$match: { status: { $in: ["completed", "delivered"] } },
		},
		{
			$group: {
				_id: "$seller",
				totalSales: { $sum: "$total" },
				orderCount: { $sum: 1 },
			},
		},
		{
			$lookup: {
				from: "users",
				localField: "_id",
				foreignField: "_id",
				as: "producer",
			},
		},
		{
			$unwind: "$producer",
		},
		{
			$project: {
				producerName: {
					$concat: ["$producer.firstName", " ", "$producer.lastName"],
				},
				farmName: "$producer.farmName",
				totalSales: 1,
				orderCount: 1,
			},
		},
		{
			$sort: { totalSales: -1 },
		},
		{
			$limit: 5,
		},
	]);

	// Top produits
	const topProducts = await Order.aggregate([
		{
			$match: { status: { $in: ["completed", "delivered"] } },
		},
		{
			$unwind: "$items",
		},
		{
			$group: {
				_id: "$items.product",
				totalSales: {
					$sum: { $multiply: ["$items.quantity", "$items.unitPrice"] },
				},
				totalQuantity: { $sum: "$items.quantity" },
				orderCount: { $sum: 1 },
			},
		},
		{
			$lookup: {
				from: "products",
				localField: "_id",
				foreignField: "_id",
				as: "product",
			},
		},
		{
			$unwind: "$product",
		},
		{
			$project: {
				name: "$product.name",
				price: "$product.price",
				totalSales: 1,
				totalQuantity: 1,
				orderCount: 1,
				sales: "$totalQuantity",
			},
		},
		{
			$sort: { totalSales: -1 },
		},
		{
			$limit: 5,
		},
	]);

	const normalizedTopProducts = topProducts.map((product) => ({
		...product,
		name: toPlainText(product.name, "Produit"),
	}));

	// Jour 73 (lancement bilingue) : usage de la bascule fr/en sur la
	// même fenêtre de temps, affiché dans la carte « Bascule FR/EN ».
	const languageUsage = await exports.getLanguageUsage(startDate);

	const analytics = {
		overview: {
			totalUsers,
			totalProducts,
			totalOrders,
			totalRevenue,
			userGrowth: parseFloat(userGrowth.toFixed(1)),
			productGrowth: parseFloat(productGrowth.toFixed(1)),
			orderGrowth: parseFloat(orderGrowth.toFixed(1)),
			revenueGrowth: 0,
		},
		charts: {
			userRegistrations,
			productCreations: [],
			orderTrends: revenueTrends,
			revenueTrends,
			categoryDistribution,
			topProducers,
			topProducts: normalizedTopProducts,
		},
		languageUsage: {
			overview: languageUsage.overview,
			byContext: languageUsage.byContext,
			byDay: languageUsage.byDay,
		},
	};

	res.status(200).json({
		status: "success",
		data: { analytics },
	});
});

// @desc    Obtenir les rapports
// @route   GET /api/v1/admin/reports/:type
// @access  Admin
exports.getReports = catchAsync(async (req, res, next) => {
	res.status(200).json({
		status: "success",
		message: req.t("admin.feature_in_development"),
		data: { reports: [] },
	});
});

// @desc    Exporter des données
// @route   GET /api/v1/admin/export/:type
// @access  Admin
exports.exportData = catchAsync(async (req, res, next) => {
	res.status(200).json({
		status: "success",
		message: req.t("admin.feature_in_development"),
	});
});
