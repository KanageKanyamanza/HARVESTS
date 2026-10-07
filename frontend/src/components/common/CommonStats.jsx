import React from "react";
import {
	FiTrendingUp,
	FiDollarSign,
	FiStar,
	FiShoppingBag,
	FiShoppingCart,
	FiUsers,
	FiEye,
	FiGlobe,
} from "react-icons/fi";

import { useTranslation } from "react-i18next";
import DataValue from "./DataValue";

// Composant pour afficher les statistiques communes
// loading : libellés affichés, seules les valeurs (serveur) attendent
const CommonStats = ({ stats, userType, loading = false }) => {
	const { t } = useTranslation("common", { keyPrefix: "commonStats" });
	const getStatsForUserType = () => {
		const baseStats = [
			{
				name: t("averageRating"),
				value: stats?.ratings?.average || 0,
				icon: FiStar,
				color: "text-yellow-500",
				bgColor: "bg-yellow-50",
				format: (value) => `${value.toFixed(1)}/5`,
				subtitle: t("reviews", { count: stats?.ratings?.count || 0 }),
			},
			{
				name: t("profileViews"),
				value: stats?.profileViews || 0,
				icon: FiEye,
				color: "text-blue-500",
				bgColor: "bg-blue-50",
				format: (value) => value.toLocaleString(),
			},
		];

		// Statistiques spécifiques selon le type d'utilisateur
		switch (userType) {
			case "producer":
				return [
					{
						name: t("productsOnSale"),
						value: stats?.activeProducts || 0,
						icon: FiShoppingBag,
						color: "text-green-500",
						bgColor: "bg-green-50",
						format: (value) => value.toLocaleString(),
					},
					{
						name: t("ordersThisMonth"),
						value: stats?.totalOrders || 0,
						icon: FiShoppingCart,
						color: "text-blue-500",
						bgColor: "bg-blue-50",
						format: (value) => value.toLocaleString(),
					},
					{
						name: t("revenueThisMonth"),
						value: stats?.totalRevenue || 0,
						icon: FiDollarSign,
						color: "text-purple-500",
						bgColor: "bg-purple-50",
						format: (value) => `${value.toLocaleString()} FCFA`,
					},
					{
						name: t("averageRating"),
						value: stats?.averageRating || 0,
						icon: FiStar,
						color: "text-yellow-500",
						bgColor: "bg-yellow-50",
						format: (value) => `${value.toFixed(1)}/5`,
					},
				];

			case "transformer":
				return [
					...baseStats,
					{
						name: t("productsSold"),
						value: stats?.salesStats?.totalSales || 0,
						icon: FiShoppingBag,
						color: "text-green-500",
						bgColor: "bg-green-50",
						format: (value) => value.toLocaleString(),
					},
					{
						name: t("revenue"),
						value: stats?.salesStats?.totalRevenue || 0,
						icon: FiDollarSign,
						color: "text-purple-500",
						bgColor: "bg-purple-50",
						format: (value) => `${value.toLocaleString()} FCFA`,
					},
				];

			case "restaurateur":
				return [
					{
						name: t("averageRating"),
						value: stats?.ratings?.average || stats?.averageRating || 0,
						icon: FiStar,
						color: "text-yellow-500",
						bgColor: "bg-yellow-50",
						format: (value) => `${value.toFixed(1)}/5`,
						subtitle: t("reviews", {
							count: stats?.ratings?.count || stats?.totalReviews || 0,
						}),
					},
					{
						name: t("profileViews"),
						value: stats?.profileViews || 0,
						icon: FiEye,
						color: "text-blue-500",
						bgColor: "bg-blue-50",
						format: (value) => value.toLocaleString(),
					},
					{
						name: t("dishesSold"),
						value: stats?.totalProductsSold || stats?.totalDishesSold || 0,
						icon: FiShoppingBag,
						color: "text-green-500",
						bgColor: "bg-green-50",
						format: (value) => value.toLocaleString(),
					},
					{
						name: t("revenue"),
						value: stats?.totalRevenue || 0,
						icon: FiDollarSign,
						color: "text-purple-500",
						bgColor: "bg-purple-50",
						format: (value) => `${value.toLocaleString()} FCFA`,
					},
				];

			case "exporter":
				return [
					{
						name: t("totalExports"),
						value: stats?.totalExports || 0,
						icon: FiShoppingBag,
						color: "text-teal-500",
						bgColor: "bg-teal-50",
						format: (value) => value.toLocaleString(),
					},
					{
						name: t("exportValue"),
						value: stats?.totalValue || stats?.exportValue || 0,
						icon: FiDollarSign,
						color: "text-green-500",
						bgColor: "bg-green-50",
						format: (value) => `${value.toLocaleString()} FCFA`,
					},
					{
						name: t("exportCountries"),
						value: stats?.exportCountries || 0,
						icon: FiGlobe,
						color: "text-blue-500",
						bgColor: "bg-blue-50",
						format: (value) => value.toLocaleString(),
					},
					{
						name: t("averageRating"),
						value: stats?.averageRating || 0,
						icon: FiStar,
						color: "text-yellow-500",
						bgColor: "bg-yellow-50",
						format: (value) => `${value.toFixed(1)}/5`,
						subtitle: t("reviews", { count: stats?.totalReviews || 0 }),
					},
				];

			case "consumer":
				return [
					{
						name: t("totalOrders"),
						value: stats?.totalOrders || 0,
						icon: FiShoppingBag,
						color: "text-green-500",
						bgColor: "bg-green-50",
						format: (value) => value.toLocaleString(),
					},
					{
						name: t("amountSpent"),
						value: stats?.totalSpent || 0,
						icon: FiDollarSign,
						color: "text-purple-500",
						bgColor: "bg-purple-50",
						format: (value) => `${value.toLocaleString()} FCFA`,
					},
					{
						name: t("reviewsWritten"),
						value: stats?.reviewsWritten || 0,
						icon: FiStar,
						color: "text-yellow-500",
						bgColor: "bg-yellow-50",
						format: (value) => value.toLocaleString(),
						subtitle: t("averageGiven", {
							value: stats?.averageRatingGiven?.toFixed(1) || "0.0",
						}),
					},
					{
						name: t("profileViews"),
						value: stats?.profileViews || 0,
						icon: FiEye,
						color: "text-blue-500",
						bgColor: "bg-blue-50",
						format: (value) => value.toLocaleString(),
					},
				];

			case "transporter":
				return [
					...baseStats,
					{
						name: t("deliveriesMade"),
						value: stats?.performanceStats?.totalDeliveries || 0,
						icon: FiShoppingBag,
						color: "text-green-500",
						bgColor: "bg-green-50",
						format: (value) => value.toLocaleString(),
					},
					{
						name: t("onTimeRate"),
						value: stats?.performanceStats?.onTimeDeliveryRate || 0,
						icon: FiTrendingUp,
						color: "text-blue-500",
						bgColor: "bg-blue-50",
						format: (value) => `${value}%`,
					},
				];

			default:
				return baseStats;
		}
	};

	const statsToShow = getStatsForUserType();

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			{statsToShow.map((stat, index) => {
				const Icon = stat.icon;
				return (
					<div
						key={index}
						className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">{stat.name}</p>
								<p className="text-2xl font-bold text-gray-900">
									<DataValue loading={loading}>
										{stat.format
											? stat.format(stat.value)
											: stat.value.toLocaleString()}
									</DataValue>
								</p>
								{stat.subtitle && (
									<p className="text-xs text-gray-500 mt-1"><DataValue loading={loading} className="w-12 h-[0.9em]">{stat.subtitle}</DataValue></p>
								)}
							</div>
							<div className={`p-3 rounded-full ${stat.bgColor}`}>
								<Icon className={`h-6 w-6 ${stat.color}`} />
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default CommonStats;
