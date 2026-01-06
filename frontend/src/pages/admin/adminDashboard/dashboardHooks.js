// Hook pour charger les statistiques du dashboard

import { useState, useEffect, useCallback } from "react";
import { adminService } from "../../../services/adminService";

export const useDashboardStats = () => {
	const [stats, setStats] = useState({
		totalUsers: 0,
		totalProducts: 0,
		totalOrders: 0,
		totalRevenue: 0,
		pendingApprovals: 0,
		activeUsers: 0,
		recentOrders: 0,
		monthlyGrowth: 0,
		totalProducers: 0,
		totalConsumers: 0,
		totalTransporters: 0,
		totalRestaurateurs: 0,
		totalExportateurs: 0,
		totalTransformers: 0,
		pendingProducts: 0,
		pendingReviews: 0,
		unreadMessages: 0,
		activeAdmins: 0,
		totalSubscriptions: 0,
		activeSubscriptions: 0,
		subscriptionRevenue: 0,
	});
	const [recentOrders, setRecentOrders] = useState([]);
	const [pendingProducts, setPendingProducts] = useState([]);
	const [salesChartData, setSalesChartData] = useState([]);
	const [topProducers, setTopProducers] = useState([]);
	const [productStats, setProductStats] = useState({});
	const [loading, setLoading] = useState(true);

	const loadStats = useCallback(async () => {
		try {
			setLoading(true);

			// Charger toutes les données en parallèle
			const [
				statsResponse,
				ordersResponse,
				productsResponse,
				salesResponse,
				producersResponse,
				productStatsResponse,
				subscriptionStatsResponse,
			] = await Promise.all([
				adminService.getDashboardStats(),
				adminService.getRecentOrders({ limit: 5 }),
				adminService.getPendingProducts({ limit: 5 }),
				adminService.getSalesChart({ months: 12 }),
				adminService.getTopProducers({ limit: 5 }),
				adminService.getProductStats(),
				adminService
					.getSubscriptionStats()
					.catch(() => ({ data: { data: { stats: {} } } })),
			]);

			// Traiter les statistiques générales
			if (statsResponse.data && statsResponse.data.stats) {
				const statsData = statsResponse.data.stats;
				const subscriptionStats =
					subscriptionStatsResponse?.data?.data?.stats || {};
				setStats({
					totalUsers: statsData.totalUsers || 0,
					totalProducts: statsData.totalProducts || 0,
					totalOrders: statsData.totalOrders || 0,
					totalRevenue: statsData.totalRevenue || 0,
					pendingApprovals: statsData.pendingApprovals || 0,
					activeUsers: statsData.activeUsers || 0,
					recentOrders: statsData.recentOrders || 0,
					monthlyGrowth: statsData.monthlyGrowth || 0,
					totalProducers: statsData.totalProducers || 0,
					totalConsumers: statsData.totalConsumers || 0,
					totalTransporters: statsData.totalTransporters || 0,
					totalRestaurateurs: statsData.totalRestaurateurs || 0,
					totalExportateurs: statsData.totalExportateurs || 0,
					totalTransformers: statsData.totalTransformers || 0,
					pendingProducts: statsData.pendingProducts || 0,
					pendingReviews: statsData.pendingReviews || 0,
					unreadMessages: statsData.unreadMessages || 0,
					activeAdmins: statsData.activeAdmins || 0,
					totalSubscriptions: subscriptionStats.total || 0,
					activeSubscriptions: subscriptionStats.active || 0,
					subscriptionRevenue: subscriptionStats.revenue?.total || 0,
				});
			}

			// Traiter les commandes récentes
			if (ordersResponse.data && ordersResponse.data.orders) {
				setRecentOrders(ordersResponse.data.orders);
			}

			// Traiter les produits en attente
			if (productsResponse.data && productsResponse.data.products) {
				setPendingProducts(productsResponse.data.products);
			}

			// Traiter les données de vente
			if (salesResponse.data && salesResponse.data.chartData) {
				setSalesChartData(salesResponse.data.chartData);
			}

			// Traiter les top producteurs
			if (producersResponse.data && producersResponse.data.producers) {
				setTopProducers(producersResponse.data.producers);
			}

			// Traiter les statistiques des produits
			if (productStatsResponse.data) {
				setProductStats(productStatsResponse.data);
			}
		} catch (error) {
			console.error("Erreur lors du chargement des données:", error);
			// Réinitialiser les stats en cas d'erreur
			setStats({
				totalUsers: 0,
				totalProducts: 0,
				totalOrders: 0,
				totalRevenue: 0,
				pendingApprovals: 0,
				activeUsers: 0,
				recentOrders: 0,
				monthlyGrowth: 0,
				totalProducers: 0,
				totalConsumers: 0,
				totalTransporters: 0,
				totalRestaurateurs: 0,
				totalExportateurs: 0,
				totalTransformers: 0,
				pendingProducts: 0,
				pendingReviews: 0,
				unreadMessages: 0,
				activeAdmins: 0,
				totalSubscriptions: 0,
				activeSubscriptions: 0,
				subscriptionRevenue: 0,
			});
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
		pendingProducts,
		salesChartData,
		topProducers,
		productStats,
		loading,
		loadStats,
	};
};
