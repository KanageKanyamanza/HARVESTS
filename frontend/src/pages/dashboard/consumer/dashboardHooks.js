import { useState, useEffect } from "react";
import { consumerService } from "../../../services/genericService";

// Six derniers mois au format « AAAA-MM »
const lastSixMonths = () => {
	const today = new Date();
	return Array.from({ length: 6 }, (_, i) => {
		const d = new Date(today.getFullYear(), today.getMonth() - 5 + i, 1);
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
	});
};

const favoritesFrom = (response) => {
	const data = response?.data;
	const list =
		data?.data?.favorites || data?.favorites || (Array.isArray(data?.data) ? data.data : []);
	return (Array.isArray(list) ? list : [])
		.map((favorite) => favorite?.product)
		.filter((product) => product && typeof product === "object")
		.slice(0, 3)
		.map((product) => ({
			id: product._id,
			slug: product.slug,
			name: product.name,
			price: product.price,
			currency: product.currency,
			image: product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url,
		}));
};

/**
 * Jour 54 : données réelles du tableau de bord consommateur (il affichait
 * jusque-là des valeurs fictives : 1 250 points, +8,4 %, courbe de janvier à
 * juin inventée et deux faux favoris).
 */
export const useConsumerDashboardStats = () => {
	const [stats, setStats] = useState({
		totalSpent: 0,
		totalOrders: 0,
		reviewsWritten: 0,
		loyaltyPoints: 0,
		currentMonthSpent: 0,
		monthlyGrowth: null,
		monthlySpentChart: lastSixMonths().map((month) => ({ month, value: 0 })),
	});
	const [recentOrders, setRecentOrders] = useState([]);
	const [favoriteProducts, setFavoriteProducts] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadDashboardData = async () => {
			try {
				setLoading(true);
				const [statsRes, ordersRes, spendingRes, favoritesRes] = await Promise.all([
					consumerService.getStats(),
					consumerService.getOrders({ limit: 5 }),
					consumerService.getSpendingAnalytics().catch(() => null),
					consumerService.getFavorites().catch(() => null),
				]);

				const statsData = statsRes.data?.data?.stats || statsRes.data?.stats || {};
				const ordersData = ordersRes.data?.data?.orders || ordersRes.data?.orders || [];
				const analytics =
					spendingRes?.data?.data?.analytics || spendingRes?.data?.analytics || {};

				// Dépenses mensuelles du backend ({ month: "AAAA-MM", spending })
				const byMonth = Object.fromEntries(
					(analytics.monthlySpending || []).map((m) => [m.month, m.spending]),
				);
				const chart = lastSixMonths().map((month) => ({
					month,
					value: byMonth[month] || 0,
				}));
				const current = chart[chart.length - 1].value;
				const previous = chart[chart.length - 2].value;

				setStats({
					totalSpent: statsData.totalSpent || 0,
					totalOrders: statsData.totalOrders || 0,
					reviewsWritten: statsData.reviewsWritten || 0,
					loyaltyPoints: statsData.loyaltyPoints || 0,
					currentMonthSpent: analytics.currentMonthSpending ?? current,
					// Pas de tendance sans mois précédent de référence
					monthlyGrowth:
						previous > 0 ? Math.round(((current - previous) / previous) * 100) : null,
					monthlySpentChart: chart,
				});
				setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : []);
				setFavoriteProducts(favoritesFrom(favoritesRes));
			} catch (error) {
				console.error("Error loading consumer dashboard data:", error);
			} finally {
				setLoading(false);
			}
		};

		loadDashboardData();
	}, []);

	return {
		stats,
		recentOrders,
		favoriteProducts,
		loading,
	};
};
