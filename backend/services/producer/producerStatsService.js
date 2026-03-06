const Order = require("../../models/Order");
const Product = require("../../models/Product");
const Producer = require("../../models/Producer");
const { toPlainText } = require("../../utils/localization");

/**
 * Service pour les statistiques et analytics du producteur
 */

async function getMyStats(producerId) {
	const orders = await Order.find({
		seller: producerId,
	}).populate("buyer", "firstName lastName");

	const products = await Product.find({
		producer: producerId,
	});

	const completedOrders = orders.filter(
		(o) => o.status === "completed" || o.status === "delivered",
	);
	const totalRevenue = completedOrders.reduce(
		(sum, order) => sum + (order.total || 0),
		0,
	);
	const averageOrderValue =
		completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

	let totalProductsSold = 0;
	completedOrders.forEach((order) => {
		order.items.forEach((item) => {
			totalProductsSold += item.quantity;
		});
	});

	const uniqueCustomers = new Set(
		orders.map((o) => o.buyer?._id?.toString() || o.buyer?.toString()),
	).size;

	const productSales = {};
	completedOrders.forEach((order) => {
		order.items.forEach((item) => {
			const productId =
				item.product?._id?.toString() || item.product?.toString();
			if (!productSales[productId]) {
				productSales[productId] = {
					quantity: 0,
					revenue: 0,
				};
			}
			productSales[productId].quantity += item.quantity;
			productSales[productId].revenue +=
				item.totalPrice || item.quantity * item.unitPrice;
		});
	});

	const topProducts = await Promise.all(
		Object.entries(productSales)
			.sort((a, b) => b[1].quantity - a[1].quantity)
			.slice(0, 5)
			.map(async ([productId, sales]) => {
				const product =
					await Product.findById(productId).select("name category");
				return {
					id: productId,
					name: toPlainText(product?.name, "Produit"),
					category: product?.category,
					quantitySold: sales.quantity,
					revenue: sales.revenue,
				};
			}),
	);

	const activeProducts = products.filter(
		(p) => p.isActive && p.status === "approved",
	).length;
	const conversionRate =
		products.length > 0 ?
			Math.round((activeProducts / products.length) * 100)
		:	0;

	const customerOrderCounts = {};
	orders.forEach((order) => {
		const customerId = order.buyer?._id?.toString() || order.buyer?.toString();
		customerOrderCounts[customerId] =
			(customerOrderCounts[customerId] || 0) + 1;
	});
	const repeatCustomers = Object.values(customerOrderCounts).filter(
		(count) => count > 1,
	).length;
	const customerRetentionRate =
		uniqueCustomers > 0 ?
			Math.round((repeatCustomers / uniqueCustomers) * 100)
		:	0;

	// Calculer les commandes de la semaine en cours (Lundi à Dimanche)
	const now = new Date();
	const day = now.getDay();
	const diff = now.getDate() - day + (day === 0 ? -6 : 1);
	const startOfWeek = new Date(now.setDate(diff));
	startOfWeek.setHours(0, 0, 0, 0);

	const weeklyOrders = orders.filter(
		(o) => new Date(o.createdAt) >= startOfWeek && o.status !== "cancelled",
	).length;

	const producer = await Producer.findById(producerId);
	const maxWeeklyOrders = producer?.subscriptionFeatures?.maxWeeklyOrders || 5;

	return {
		totalRevenue,
		totalOrders: orders.length,
		completedOrders: completedOrders.length,
		totalProductsSold,
		uniqueCustomers,
		topProducts,
		averageOrderValue,
		conversionRate,
		customerRetentionRate,
		totalProducts: products.length,
		activeProducts,
		weeklyOrders,
		maxWeeklyOrders,
	};
}

async function getStats(producerId) {
	const orders = await Order.find({ seller: producerId });
	const completedOrders = orders.filter(
		(o) => o.status === "completed" || o.status === "delivered",
	);
	const totalRevenue = completedOrders.reduce(
		(sum, order) => sum + (order.total || 0),
		0,
	);

	const products = await Product.find({ producer: producerId });
	const activeProducts = products.filter(
		(p) => p.isActive && p.status === "approved",
	);

	const totalProductsSold = completedOrders.reduce((sum, order) => {
		return (
			sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
		);
	}, 0);

	const uniqueCustomers = new Set(
		completedOrders.map((order) => order.buyer.toString()),
	).size;

	const productSales = {};
	completedOrders.forEach((order) => {
		order.items.forEach((item) => {
			if (!productSales[item.product]) {
				productSales[item.product] = {
					name: item.name,
					category: item.category,
					quantitySold: 0,
					revenue: 0,
				};
			}
			productSales[item.product].quantitySold += item.quantity;
			productSales[item.product].revenue += item.price * item.quantity;
		});
	});

	const topProducts = Object.values(productSales)
		.sort((a, b) => b.quantitySold - a.quantitySold)
		.slice(0, 5);

	const averageOrderValue =
		completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

	// Récupérer la note moyenne depuis les avis
	let averageRating = 0;
	let totalReviews = 0;
	try {
		const Review = require("../../models/Review");
		const reviewStats = await Review.aggregate([
			{ $match: { producer: producerId, status: "approved" } },
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

	return {
		totalRevenue,
		totalOrders: orders.length,
		completedOrders: completedOrders.length,
		totalProducts: products.length,
		activeProducts: activeProducts.length,
		totalProductsSold,
		uniqueCustomers,
		topProducts,
		averageOrderValue,
		conversionRate:
			orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0,
		customerRetentionRate: 0,
		averageRating,
		totalReviews,
	};
}

async function getSalesAnalytics(producerId) {
	const twelveMonthsAgo = new Date();
	twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

	const orders = await Order.find({
		seller: producerId,
		status: { $in: ["completed", "delivered"] },
		createdAt: { $gte: twelveMonthsAgo },
	});

	const monthlySales = {};
	orders.forEach((order) => {
		const d = new Date(order.createdAt);
		const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

		if (!monthlySales[month]) {
			monthlySales[month] = {
				orders: 0,
				revenue: 0,
				sales: 0,
				products: 0,
			};
		}
		monthlySales[month].orders += 1;
		monthlySales[month].revenue += order.total || 0;
		monthlySales[month].sales += order.total || 0;
		order.items.forEach((item) => {
			monthlySales[month].products += item.quantity;
		});
	});

	const chartData = Object.entries(monthlySales)
		.map(([month, data]) => ({
			month,
			...data,
		}))
		.sort((a, b) => a.month.localeCompare(b.month));

	return {
		monthlySales: chartData,
		chartData, // Alias for easier frontend consumption
	};
}

async function getRevenueAnalytics(producerId) {
	const twelveMonthsAgo = new Date();
	twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

	const orders = await Order.find({
		seller: producerId,
		status: { $in: ["completed", "delivered"] },
		createdAt: { $gte: twelveMonthsAgo },
	});

	const monthlyRevenue = {};
	orders.forEach((order) => {
		const month = new Date(order.createdAt).toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "short",
		});
		if (!monthlyRevenue[month]) {
			monthlyRevenue[month] = 0;
		}
		monthlyRevenue[month] += order.total || 0;
	});

	const currentMonth = new Date().getMonth();
	const currentYear = new Date().getFullYear();
	const currentMonthRevenue = orders
		.filter((order) => {
			const orderDate = new Date(order.createdAt);
			return (
				orderDate.getMonth() === currentMonth &&
				orderDate.getFullYear() === currentYear
			);
		})
		.reduce((sum, order) => sum + (order.total || 0), 0);

	return {
		monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({
			month,
			revenue,
		})),
		currentMonthRevenue,
		totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
	};
}

module.exports = {
	getMyStats,
	getStats,
	getSalesAnalytics,
	getRevenueAnalytics,
};
