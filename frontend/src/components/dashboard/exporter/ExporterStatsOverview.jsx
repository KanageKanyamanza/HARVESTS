import React from "react";
import { useTranslation } from "react-i18next";
import { ShoppingCart, DollarSign, Globe, Star } from "lucide-react";
import StatCards from "../../../pages/admin/adminDashboard/StatCards";
import { formatNumber } from "../../../utils/i18n";
import { formatPrice } from "../../../utils/currencyUtils";

const ExporterStatsOverview = ({ stats, loading }) => {
	const { t } = useTranslation("dashboard-transporter");

	const statCards = [
		{
			title: t("exporter.cards.exports"),
			value: formatNumber(stats?.totalExports || 0),
			icon: ShoppingCart,
			color: "bg-emerald-500",
			// Champ renvoyé par le serveur : pendingExports (pendingOrders n'existe pas)
			change: t("exporter.cards.pending", { count: stats?.pendingExports || 0 }),
			link: "/exporter/orders",
		},
		{
			title: t("exporter.cards.revenue"),
			value: formatPrice(stats?.totalValue || 0, "XOF"),
			icon: DollarSign,
			color: "bg-blue-500",
			change: t("exporter.cards.grossRevenue"),
			link: "/exporter/statistics",
		},
		{
			title: t("exporter.cards.countries"),
			value: formatNumber(stats?.exportCountries || 0),
			icon: Globe,
			color: "bg-purple-500",
			change: t("exporter.cards.markets"),
			link: "/exporter/statistics",
		},
		{
			title: t("dashboard.cards.averageRating"),
			value: `${stats?.averageRating ? Number(stats.averageRating).toFixed(1) : "0.0"}/5`,
			icon: Star,
			color: "bg-yellow-500",
			change: t("dashboard.cards.reviews", { count: stats?.totalReviews || 0 }),
			link: "/exporter/profile",
		},
	];

	return <StatCards statCards={statCards} loading={loading && !stats} />;
};

export default ExporterStatsOverview;
