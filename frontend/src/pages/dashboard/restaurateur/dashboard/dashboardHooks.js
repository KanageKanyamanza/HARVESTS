import { useState, useEffect, useCallback } from "react";
import { restaurateurService } from "../../../../services/genericService";

// Six derniers mois au format « AAAA-MM » (format attendu par SalesChart)
const lastSixMonths = () => {
	const today = new Date();
	return Array.from({ length: 6 }, (_, i) => {
		const d = new Date(today.getFullYear(), today.getMonth() - 5 + i, 1);
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
	});
};

/**
 * Jour 53 : données du tableau de bord restaurateur (même gabarit que le
 * producteur et le transformateur). Les ventes mensuelles du backend
 * ({ month: "AAAA-MM", orders, revenue }) sont ramenées aux six derniers mois
 * pour le graphique ; la croissance compare le mois en cours au précédent.
 */
export const useRestaurateurDashboardStats = () => {
	const [stats, setStats] = useState({
		totalRevenue: 0,
		totalOrders: 0,
		completedOrders: 0,
		totalProducts: 0,
		activeProducts: 0,
		uniqueCustomers: 0,
		averageOrderValue: 0,
		averageRating: 0,
		totalReviews: 0,
		weeklyOrders: 0,
		maxWeeklyOrders: 0,
		monthlyGrowth: 0,
	});
	const [recentOrders, setRecentOrders] = useState([]);
	const [recentDishes, setRecentDishes] = useState([]);
	const [salesChartData, setSalesChartData] = useState(() =>
		lastSixMonths().map((month) => ({ month, sales: 0, orders: 0 })),
	);
	const [loading, setLoading] = useState(true);

	const loadStats = useCallback(async () => {
		try {
			setLoading(true);
			const [statsResponse, ordersResponse, dishesResponse, salesResponse] =
				await Promise.all([
					restaurateurService.getStats(),
					restaurateurService.getOrders({ limit: 5 }),
					restaurateurService.getDishes(),
					restaurateurService
						.getSalesAnalytics()
						.catch(() => ({ data: { data: { analytics: {} } } })),
				]);

			const statsData =
				statsResponse.data?.data?.stats || statsResponse.data?.stats || {};

			const monthlySales =
				salesResponse.data?.data?.analytics?.monthlySales ||
				salesResponse.data?.analytics?.monthlySales ||
				[];
			const byMonth = Object.fromEntries(monthlySales.map((m) => [m.month, m]));
			const chart = lastSixMonths().map((month) => ({
				month,
				sales: byMonth[month]?.revenue || 0,
				orders: byMonth[month]?.orders || 0,
			}));
			setSalesChartData(chart);

			const current = chart[chart.length - 1].sales;
			const previous = chart[chart.length - 2].sales;
			const monthlyGrowth =
				previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;

			setStats({
				totalRevenue: statsData.totalRevenue || 0,
				totalOrders: statsData.totalOrders || 0,
				completedOrders: statsData.completedOrders || 0,
				totalProducts: statsData.totalProducts || 0,
				activeProducts: statsData.activeProducts || 0,
				uniqueCustomers: statsData.uniqueCustomers || 0,
				averageOrderValue: statsData.averageOrderValue || 0,
				averageRating: statsData.averageRating || 0,
				totalReviews: statsData.totalReviews || 0,
				weeklyOrders: statsData.weeklyOrders || 0,
				maxWeeklyOrders: statsData.maxWeeklyOrders || 0,
				pendingOrders: Math.max(
					0,
					(statsData.totalOrders || 0) - (statsData.completedOrders || 0),
				),
				monthlyGrowth,
			});

			const ordersData =
				ordersResponse.data?.data?.orders || ordersResponse.data?.orders || [];
			setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : []);

			const dishesData =
				dishesResponse.data?.data?.dishes || dishesResponse.data?.dishes || [];
			setRecentDishes(Array.isArray(dishesData) ? dishesData.slice(0, 5) : []);
		} catch (error) {
			console.error("Erreur lors du chargement du tableau de bord restaurateur:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadStats();
	}, [loadStats]);

	return { stats, recentOrders, recentDishes, salesChartData, loading };
};
