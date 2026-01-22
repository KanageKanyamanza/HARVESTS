import {
	Package,
	ShoppingCart,
	DollarSign,
	Star,
	Users,
	TrendingUp,
} from "lucide-react";

export const createTransformerStatCards = (stats) => [
	{
		title: "Chiffre d'affaires",
		value: `${stats.totalRevenue.toLocaleString()} FCFA`,
		icon: DollarSign,
		color: "bg-green-500",
		change: `Panier moyen: ${Math.round(stats.averageOrderValue).toLocaleString()} FCFA`,
		link: "/transformer/stats",
	},
	{
		title: "Commandes",
		value: stats.totalOrders.toLocaleString(),
		icon: ShoppingCart,
		color: "bg-blue-500",
		change: `${stats.pendingOrders || 0} en attente`,
		link: "/transformer/orders",
	},
	{
		title: "Produits Transformés",
		value: stats.activeProducts.toLocaleString(),
		icon: Package,
		color: "bg-purple-500",
		change: `${stats.totalProducts} total`,
		link: "/transformer/products",
	},
	{
		title: "Clients Uniques",
		value: stats.uniqueCustomers.toLocaleString(),
		icon: Users,
		color: "bg-orange-500",
		change: "Fidélisation",
		link: "/transformer/orders",
	},
	{
		title: "Note Moyenne",
		value: `${stats.averageRating ? Number(stats.averageRating).toFixed(1) : "N/A"}/5`,
		icon: Star,
		color: "bg-yellow-500",
		change: "Voir avis",
		link: "/transformer/reviews",
	},
];
