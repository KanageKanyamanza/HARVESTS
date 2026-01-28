import React from "react";
import { Truck, DollarSign, MapPin, Star } from "lucide-react";
import StatCards from "../../../pages/admin/adminDashboard/StatCards";

const TransporterStatsOverview = ({ stats, loading }) => {
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
			title: "Livraisons",
			value: (
				stats?.performanceStats?.totalDeliveries ||
				stats?.totalOrders ||
				0
			).toLocaleString(),
			icon: Truck,
			color: "bg-blue-500",
			change: `${stats?.activeDeliveries || 0} en cours`,
			link: "/transporter/orders",
		},
		{
			title: "Chiffre d'affaires",
			value:
				stats?.performanceStats?.totalRevenue || stats?.totalRevenue ?
					`${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(stats?.performanceStats?.totalRevenue || stats?.totalRevenue)} FCFA`
				:	"0 FCFA",
			icon: DollarSign,
			color: "bg-emerald-500",
			change: "Revenu brut",
			link: "/transporter/statistics",
		},
		{
			title: "Zones de service",
			value: stats?.serviceAreas?.length || stats?.deliveryZones || "0",
			icon: MapPin,
			color: "bg-indigo-500",
			change: "Zones couvertes",
			link: "/transporter/profile",
		},
		{
			title: "Note Moyenne",
			value: `${stats?.averageRating ? Number(stats?.averageRating).toFixed(1) : "0.0"}/5`,
			icon: Star,
			color: "bg-yellow-500",
			change: `${stats?.totalReviews || 0} avis`,
			link: "/transporter/reviews",
		},
	];

	return <StatCards statCards={statCards} />;
};

export default TransporterStatsOverview;
