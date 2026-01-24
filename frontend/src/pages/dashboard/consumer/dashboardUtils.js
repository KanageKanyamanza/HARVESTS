import {
	FiShoppingCart,
	FiCreditCard,
	FiStar,
	FiHeart,
	FiAward,
	FiTrendingUp,
} from "react-icons/fi";

export const createConsumerStatCards = (stats) => {
	const formatCurrency = (val) => {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: "XAF",
			minimumFractionDigits: 0,
		}).format(val || 0);
	};

	return [
		{
			title: "Total Dépensé",
			value: formatCurrency(stats.totalSpent),
			icon: FiCreditCard,
			color: "bg-blue-500",
			trend: {
				value: `${stats.monthlyGrowth}%`,
				isPositive: true,
				text: "vs mois dernier",
			},
			link: "/consumer/statistics",
		},
		{
			title: "Commandes",
			value: stats.totalOrders.toString(),
			icon: FiShoppingCart,
			color: "bg-cyan-500",
			link: "/consumer/orders",
		},
		{
			title: "Points Fidélité",
			value: stats.loyaltyPoints.toLocaleString(),
			icon: FiAward,
			color: "bg-amber-500",
			link: "/loyalty",
		},
		{
			title: "Avis Donnés",
			value: stats.reviewsWritten.toString(),
			icon: FiStar,
			color: "bg-indigo-500",
			link: "/consumer/reviews",
		},
	];
};
