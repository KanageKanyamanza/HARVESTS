const User = require("../../models/User");
const Admin = require("../../models/Admin");
const Producer = require("../../models/Producer");
const Consumer = require("../../models/Consumer");
const Transporter = require("../../models/Transporter");
const Exporter = require("../../models/Exporter");
const Restaurateur = require("../../models/Restaurateur");
const Transformer = require("../../models/Transformer");
const Product = require("../../models/Product");
const Order = require("../../models/Order");
const catchAsync = require("../../utils/catchAsync");

// @desc    Obtenir les statistiques du dashboard
// @route   GET /api/v1/admin/dashboard/stats
// @access  Admin
exports.getDashboardStats = catchAsync(async (req, res, next) => {
	// Compter les utilisateurs
	const totalUsers = await User.countDocuments();
	const activeUsers = await User.countDocuments({ isActive: true });

	// Compter les utilisateurs par type directement depuis le modèle User pour plus de fiabilité
	const totalProducers = await User.countDocuments({ userType: "producer" });
	const totalConsumers = await User.countDocuments({ userType: "consumer" });
	const totalTransporters = await User.countDocuments({
		userType: "transporter",
	});
	const totalRestaurateurs = await User.countDocuments({
		userType: "restaurateur",
	});
	const totalExportateurs = await User.countDocuments({ userType: "exporter" });
	const totalTransformers = await User.countDocuments({
		userType: "transformer",
	});

	// Pour les admins, on compte dans la collection Admin ET les users de type admin
	const adminsInUserCollection = await User.countDocuments({
		userType: "admin",
		isActive: true,
	});
	const activeAdmins =
		(await Admin.countDocuments({ isActive: true })) + adminsInUserCollection;

	// Compter les produits
	const totalProducts = await Product.countDocuments();
	const pendingProducts = await Product.countDocuments({
		status: "pending-review",
	});

	// Compter les commandes
	const totalOrders = await Order.countDocuments();
	const recentOrders = await Order.countDocuments({
		createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // 7 derniers jours
	});

	// Calculer le revenu total
	const revenueResult = await Order.aggregate([
		{ $match: { status: { $in: ["completed", "delivered"] } } },
		{ $group: { _id: null, total: { $sum: "$total" } } },
	]);
	const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

	// Compter les approbations en attente
	const pendingApprovals = await User.countDocuments({
		isApproved: false,
		isActive: true,
	});

	// Calculer la croissance mensuelle (simplifié)
	const lastMonth = new Date();
	lastMonth.setMonth(lastMonth.getMonth() - 1);
	const usersLastMonth = await User.countDocuments({
		createdAt: { $gte: lastMonth },
	});
	const monthlyGrowth =
		totalUsers > 0 ? ((usersLastMonth / totalUsers) * 100).toFixed(1) : 0;

	// Autres statistiques
	const pendingReviews = 0; // À implémenter quand le système de reviews sera prêt
	const unreadMessages = 0; // À implémenter quand le système de messages sera prêt

	const stats = {
		totalUsers,
		totalProducts,
		totalOrders,
		totalRevenue,
		pendingApprovals,
		activeUsers,
		recentOrders,
		monthlyGrowth: parseFloat(monthlyGrowth),
		totalProducers,
		totalConsumers,
		totalTransporters,
		totalRestaurateurs,
		totalExportateurs,
		totalTransformers,
		pendingProducts,
		pendingReviews,
		unreadMessages,
		activeAdmins,
	};

	res.status(200).json({
		status: "success",
		data: {
			stats,
		},
	});
});

// @desc    Obtenir les commandes récentes pour le dashboard
// @route   GET /api/v1/admin/dashboard/recent-orders
// @access  Admin
exports.getRecentOrders = catchAsync(async (req, res, next) => {
	const limit = parseInt(req.query.limit) || 10;

	const recentOrders = await Order.find()
		.populate("buyer", "firstName lastName email userType")
		.populate("seller", "firstName lastName email userType")
		.populate("items.product", "name price images")
		.sort("-createdAt")
		.limit(limit);

	res.status(200).json({
		status: "success",
		data: {
			orders: recentOrders,
		},
	});
});

// @desc    Obtenir les produits en attente d'approbation
// @route   GET /api/v1/admin/dashboard/pending-products
// @access  Admin
exports.getPendingProducts = catchAsync(async (req, res, next) => {
	const limit = parseInt(req.query.limit) || 10;

	const pendingProducts = await Product.find({ status: "pending-review" })
		.populate("producer", "firstName lastName farmName email")
		.sort("-createdAt")
		.limit(limit);

	res.status(200).json({
		status: "success",
		data: {
			products: pendingProducts,
		},
	});
});

// @desc    Obtenir les statistiques de vente par mois
// @route   GET /api/v1/admin/dashboard/sales-chart
// @access  Admin
exports.getSalesChart = catchAsync(async (req, res, next) => {
	const months = parseInt(req.query.months) || 12;
	const startDate = new Date();
	startDate.setMonth(startDate.getMonth() - months);

	const salesData = await Order.aggregate([
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
				},
				totalSales: { $sum: "$total" },
				orderCount: { $sum: 1 },
			},
		},
		{
			$sort: { "_id.year": 1, "_id.month": 1 },
		},
	]);

	// Formater les données pour le graphique
	const chartData = salesData.map((item) => ({
		month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
		sales: item.totalSales,
		orders: item.orderCount,
	}));

	res.status(200).json({
		status: "success",
		data: {
			chartData,
		},
	});
});

// @desc    Obtenir les statistiques des utilisateurs par type
// @route   GET /api/v1/admin/dashboard/user-stats
// @access  Admin
exports.getUserStats = catchAsync(async (req, res, next) => {
	const months = parseInt(req.query.months) || 12;
	const startDate = new Date();
	startDate.setMonth(startDate.getMonth() - months);

	// Statistiques des nouveaux utilisateurs par mois
	const newUsersByMonth = await User.aggregate([
		{
			$match: {
				createdAt: { $gte: startDate },
			},
		},
		{
			$group: {
				_id: {
					year: { $year: "$createdAt" },
					month: { $month: "$createdAt" },
					userType: "$userType",
				},
				count: { $sum: 1 },
			},
		},
		{
			$sort: { "_id.year": 1, "_id.month": 1 },
		},
	]);

	// Statistiques par type d'utilisateur
	const userTypeStats = await Promise.all([
		Producer.aggregate([
			{
				$group: {
					_id: null,
					total: { $sum: 1 },
					active: { $sum: { $cond: ["$isActive", 1, 0] } },
				},
			},
		]),
		Consumer.aggregate([
			{
				$group: {
					_id: null,
					total: { $sum: 1 },
					active: { $sum: { $cond: ["$isActive", 1, 0] } },
				},
			},
		]),
		Transporter.aggregate([
			{
				$group: {
					_id: null,
					total: { $sum: 1 },
					active: { $sum: { $cond: ["$isActive", 1, 0] } },
				},
			},
		]),
	]);

	res.status(200).json({
		status: "success",
		data: {
			newUsersByMonth,
			userTypeStats: {
				producers: userTypeStats[0][0] || { total: 0, active: 0 },
				consumers: userTypeStats[1][0] || { total: 0, active: 0 },
				transporters: userTypeStats[2][0] || { total: 0, active: 0 },
			},
		},
	});
});

// @desc    Obtenir les top producteurs
// @route   GET /api/v1/admin/dashboard/top-producers
// @access  Admin
exports.getTopProducers = catchAsync(async (req, res, next) => {
	const limit = parseInt(req.query.limit) || 10;

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
				producerId: "$_id",
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
			$limit: limit,
		},
	]);

	res.status(200).json({
		status: "success",
		data: {
			producers: topProducers,
		},
	});
});

// @desc    Obtenir les statistiques des produits
// @route   GET /api/v1/admin/dashboard/product-stats
// @access  Admin
exports.getProductStats = catchAsync(async (req, res, next) => {
	const productStats = await Product.aggregate([
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

	const statusStats = await Product.aggregate([
		{
			$group: {
				_id: "$status",
				count: { $sum: 1 },
			},
		},
	]);

	res.status(200).json({
		status: "success",
		data: {
			byCategory: productStats,
			byStatus: statusStats,
		},
	});
});
