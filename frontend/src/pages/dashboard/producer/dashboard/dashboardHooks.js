import { useState, useEffect, useCallback } from "react";
import { producerService } from "../../../../services/genericService";

export const useProducerDashboardStats = () => {
	const [stats, setStats] = useState({
		totalRevenue: 0,
		monthlyRevenue: 0,
		totalOrders: 0,
		completedOrders: 0,
		totalProducts: 0,
		activeProducts: 0,
		totalProductsSold: 0,
		uniqueCustomers: 0,
		averageOrderValue: 0,
		conversionRate: 0,
		averageRating: 0,
		pendingOrders: 0,
		monthlyGrowth: 0,
	});
	const [recentOrders, setRecentOrders] = useState([]);
	const [salesChartData, setSalesChartData] = useState([]);
	// We can add more specific producer lists here if needed, like "Low Stock Products"
	const [recentProducts, setRecentProducts] = useState([]);
	const [loading, setLoading] = useState(true);

	const loadStats = useCallback(async () => {
		try {
			setLoading(true);

			// Charger les données
			const [statsResponse, ordersResponse, productsResponse, salesResponse] =
				await Promise.all([
					producerService.getStats(),
					producerService.getOrders({ limit: 5 }),
					producerService.getProducts({ limit: 5, sort: "-createdAt" }),
					producerService
						.getSalesAnalytics()
						.catch(() => ({ data: { chartData: [] } })),
				]);

			// Traitement des stats
			const statsData =
				statsResponse.data?.data?.stats || statsResponse.data?.stats || {};
			setStats({
				totalRevenue: statsData.totalRevenue || 0,
				monthlyRevenue: statsData.monthlyRevenue || statsData.totalRevenue || 0, // Fallback if no specific monthly
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

			// Adapt structure if necessary, assuming salesResponse.data contains chartData or similar
			const analyticsData =
				salesResponse.data?.data?.analytics || salesResponse.data?.data;
			const chartData =
				analyticsData?.chartData || analyticsData?.monthlySales || [];
			setSalesChartData(chartData);
		} catch (error) {
			console.error("Erreur lors du chargement des données producteur:", error);
			// Keep default empty stats
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
