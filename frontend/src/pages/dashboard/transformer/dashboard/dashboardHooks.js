import { useState, useEffect, useCallback } from "react";
import { transformerService } from "../../../../services/genericService";

const generateEmptyChartData = () => {
	const months = [];
	const today = new Date();
	for (let i = 5; i >= 0; i--) {
		const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
		const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
		months.push({
			month: monthStr,
			sales: 0,
			orders: 0,
		});
	}
	return months;
};

export const useTransformerDashboardStats = () => {
	const [stats, setStats] = useState({
		totalRevenue: 0,
		monthlyRevenue: 0,
		totalOrders: 0,
		completedOrders: 0,
		totalProducts: 0, // Produits transformés
		activeProducts: 0,
		totalProductsSold: 0,
		uniqueCustomers: 0,
		averageOrderValue: 0,
		conversionRate: 0,
		averageRating: 0,
		pendingOrders: 0,
		monthlyGrowth: 0,
		weeklyOrders: 0,
		maxWeeklyOrders: 0,
	});
	const [recentOrders, setRecentOrders] = useState([]);
	const [salesChartData, setSalesChartData] = useState([]);
	const [recentProducts, setRecentProducts] = useState([]);
	const [loading, setLoading] = useState(true);

	const loadStats = useCallback(async () => {
		try {
			setLoading(true);

			// Charger les données
			const [statsResponse, ordersResponse, productsResponse, salesResponse] =
				await Promise.all([
					transformerService.getStats(),
					transformerService.getOrders({ limit: 5 }),
					transformerService.getMyProducts({ limit: 5, sort: "-createdAt" }), // Used getMyProducts as per service definition
					transformerService
						.getSalesAnalytics()
						.catch(() => ({ data: { chartData: [] } })),
				]);

			// Traitement des stats
			const statsData =
				statsResponse.data?.data?.stats || statsResponse.data?.stats || {};
			setStats({
				totalRevenue: statsData.totalRevenue || 0,
				monthlyRevenue: statsData.monthlyRevenue || statsData.totalRevenue || 0,
				totalOrders: statsData.totalOrders || 0,
				completedOrders: statsData.completedOrders || 0,
				totalProducts: statsData.totalProducts || 0,
				activeProducts: statsData.activeProducts || 0,
				totalProductsSold: statsData.totalProductsSold || 0,
				uniqueCustomers: statsData.uniqueCustomers || 0,
				averageOrderValue: statsData.averageOrderValue || 0,
				conversionRate: statsData.conversionRate || 0,
				averageRating: statsData.averageRating || 0,
				pendingOrders: statsData.pendingOrders || 0,
				monthlyGrowth: statsData.monthlyGrowth || 0,
				weeklyOrders: statsData.weeklyOrders || 0,
				maxWeeklyOrders: statsData.maxWeeklyOrders || 0,
			});

			// Traitement des commandes
			const ordersData =
				ordersResponse.data?.data?.orders || ordersResponse.data?.orders || [];
			setRecentOrders(Array.isArray(ordersData) ? ordersData : []);

			// Traitement des produits récents
			const productsData =
				productsResponse.data?.data?.products ||
				productsResponse.data?.products ||
				[];
			setRecentProducts(Array.isArray(productsData) ? productsData : []);

			// Adapt structure if necessary
			const analyticsData =
				salesResponse.data?.data?.analytics || salesResponse.data?.data;
			let chartData =
				analyticsData?.chartData || analyticsData?.monthlySales || [];

			if (!chartData || chartData.length === 0) {
				chartData = generateEmptyChartData();
			}

			setSalesChartData(chartData);
		} catch (error) {
			console.error(
				"Erreur lors du chargement des données transformateur:",
				error,
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadStats();
	}, [loadStats]);

	return {
		stats,
		recentOrders,
		recentProducts,
		salesChartData,
		loading,
		loadStats,
	};
};
