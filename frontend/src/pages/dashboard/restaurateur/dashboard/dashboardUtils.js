import { Utensils, ShoppingCart, DollarSign, Star, Users } from "lucide-react";
import i18n, { formatNumber } from "../../../../utils/i18n";
import { formatPrice } from "../../../../utils/currencyUtils";

// Libellés communs aux tableaux de bord vendeurs (dashboard-producer:dashboard.cards)
const card = (key, options) =>
	i18n.t(`dashboard.cards.${key}`, { ns: "dashboard-producer", ...options });

export const createRestaurateurStatCards = (stats) => [
	{
		title: card("revenue"),
		value: formatPrice(stats.totalRevenue, "XOF"),
		icon: DollarSign,
		color: "bg-green-500",
		change: card("averageBasket", {
			amount: formatPrice(Math.round(stats.averageOrderValue), "XOF"),
		}),
		link: "/restaurateur/stats",
	},
	{
		title: card("orders"),
		value: formatNumber(stats.totalOrders),
		icon: ShoppingCart,
		color: "bg-blue-500",
		change: card("pending", { count: stats.pendingOrders || 0 }),
		link: "/restaurateur/orders",
	},
	{
		title: i18n.t("dashboard.activeDishes", { ns: "dashboard-restaurateur" }),
		value: formatNumber(stats.activeProducts),
		icon: Utensils,
		color: "bg-orange-500",
		change: card("total", { count: stats.totalProducts }),
		link: "/restaurateur/dishes",
	},
	{
		title: card("uniqueCustomers"),
		value: formatNumber(stats.uniqueCustomers),
		icon: Users,
		color: "bg-purple-500",
		change: card("loyalty"),
		link: "/restaurateur/orders",
	},
	{
		title: card("averageRating"),
		value: stats.averageRating ? `${Number(stats.averageRating).toFixed(1)}/5` : "—",
		icon: Star,
		color: "bg-yellow-500",
		change: card("seeReviews"),
		link: "/restaurateur/reviews",
	},
];
