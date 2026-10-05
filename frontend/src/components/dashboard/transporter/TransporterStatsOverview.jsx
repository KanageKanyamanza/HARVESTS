import React from "react";
import { useTranslation } from "react-i18next";
import { Truck, DollarSign, MapPin, Star } from "lucide-react";
import StatCards from "../../../pages/admin/adminDashboard/StatCards";

const TransporterStatsOverview = ({ stats, loading }) => {
	const { t } = useTranslation("dashboard-transporter");

	const statCards = [
		{
			title: t("dashboard.cards.deliveries"),
			value: (
				stats?.performanceStats?.totalDeliveries ||
				stats?.totalOrders ||
				0
			).toLocaleString(),
			icon: Truck,
			color: "bg-blue-500",
			change: t("dashboard.cards.inProgress", {
				count: stats?.activeDeliveries || 0,
			}),
			link: "/transporter/orders",
		},
		{
			title: t("dashboard.cards.revenue"),
			value:
				stats?.performanceStats?.totalRevenue || stats?.totalRevenue ?
					`${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(stats?.performanceStats?.totalRevenue || stats?.totalRevenue)} FCFA`
				:	"0 FCFA",
			icon: DollarSign,
			color: "bg-emerald-500",
			change: t("dashboard.cards.grossRevenue"),
			link: "/transporter/statistics",
		},
		{
			title: t("dashboard.cards.serviceAreas"),
			value: (typeof stats?.serviceAreas === "number" ?
				stats.serviceAreas
			:	stats?.serviceAreas?.length || stats?.deliveryZones || 0
			).toString(),
			icon: MapPin,
			color: "bg-indigo-500",
			change: t("dashboard.cards.areasCovered"),
			link: "/transporter/profile",
		},
		{
			title: t("dashboard.cards.averageRating"),
			value: `${stats?.averageRating ? Number(stats?.averageRating).toFixed(1) : "0.0"}/5`,
			icon: Star,
			color: "bg-yellow-500",
			change: t("dashboard.cards.reviews", { count: stats?.totalReviews || 0 }),
			link: "/transporter/profile",
		},
	];

	return <StatCards statCards={statCards} loading={loading && !stats} />;
};

export default TransporterStatsOverview;
