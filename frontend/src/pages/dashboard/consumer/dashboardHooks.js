import { useState, useEffect } from "react";
import { consumerService } from "../../../services/genericService";
import commonService from "../../../services/commonService";

export const useConsumerDashboardStats = () => {
	const [stats, setStats] = useState({
		totalSpent: 0,
		totalOrders: 0,
		reviewsWritten: 0,
		loyaltyPoints: 1250, // Mock for now
		favoritesCount: 0,
		monthlyGrowth: 12.5,
		monthlySpentChart: [],
	});
	const [recentOrders, setRecentOrders] = useState([]);
	const [favoriteProducts, setFavoriteProducts] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadDashboardData = async () => {
			try {
				setLoading(true);

				// In a real app, we'd have a specific "dashboard-summary" endpoint
				// For now, we'll fetch stats and recent orders separately
				const [statsRes, ordersRes] = await Promise.all([
					consumerService.getStats(),
					consumerService.getOrders({ limit: 5 }),
				]);

				const statsData =
					statsRes.data?.data?.stats || statsRes.data?.stats || {};
				const ordersData =
					ordersRes.data?.data?.orders || ordersRes.data?.orders || [];

				setStats({
					totalSpent: statsData.totalSpent || 0,
					totalOrders: statsData.totalOrders || 0,
					reviewsWritten: statsData.reviewsWritten || 0,
					loyaltyPoints: statsData.loyaltyPoints || 1250,
					favoritesCount: statsData.favoritesCount || 0,
					monthlyGrowth: statsData.monthlyGrowth || 8.4,
					monthlySpentChart: [
						{ name: "Jan", value: 4000 },
						{ name: "Feb", value: 3000 },
						{ name: "Mar", value: 5000 },
						{ name: "Apr", value: 4500 },
						{ name: "May", value: 6000 },
						{ name: "Jun", value: 5500 },
					], // Mock data for the chart
				});

				setRecentOrders(ordersData);

				// Mock favorites for now
				setFavoriteProducts([
					{ id: 1, name: "Bananes Bio", price: 1200, image: "bananas.jpg" },
					{ id: 2, name: "Miel Naturel", price: 2500, image: "honey.jpg" },
				]);
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
