import React from "react";
import { ShoppingCart, DollarSign, Globe, Star } from "lucide-react";
import StatCards from "../../../pages/admin/adminDashboard/StatCards";

const ExporterStatsOverview = ({ stats, loading }) => {
	if (loading && !stats) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className="h-32 rounded-[1.5rem] bg-gray-100 animate-pulse shadow-sm"
					/>
				))}
			</div>
		);
	}

	const statCards = [
		{
			title: "Exportations",
			value: stats?.totalExports?.toLocaleString() || "0",
			icon: ShoppingCart,
			color: "bg-emerald-500",
			change: `${stats?.pendingOrders || 0} en attente`,
			link: "/exporter/orders",
		},
		{
			title: "Chiffre d'affaires",
			value:
				stats?.totalValue ?
					`${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(stats.totalValue)} FCFA`
				:	"0 FCFA",
			icon: DollarSign,
			color: "bg-blue-500",
			change: "Revenu brut",
			link: "/exporter/stats",
		},
		{
			title: "Pays Attaints",
			value: stats?.exportCountries || "0",
			icon: Globe,
			color: "bg-purple-500",
			change: "Marchés mondiaux",
			link: "/exporter/stats",
		},
		{
			title: "Note Moyenne",
			value: `${stats?.averageRating ? Number(stats?.averageRating).toFixed(1) : "0.0"}/5`,
			icon: Star,
			color: "bg-yellow-500",
			change: `${stats?.totalReviews || 0} avis`,
			link: "/exporter/reviews",
		},
	];

	return <StatCards statCards={statCards} />;
};

export default ExporterStatsOverview;
