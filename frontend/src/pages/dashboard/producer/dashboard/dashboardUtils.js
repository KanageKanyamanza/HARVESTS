import {
	Package,
	ShoppingCart,
	DollarSign,
	Star,
	Users,
	TrendingUp,
} from "lucide-react";
import i18n, { formatNumber } from "../../../../utils/i18n";
import { formatPrice } from "../../../../utils/currencyUtils";

// Jour 49 (bascule bilingue) : libellés de dashboard-producer:dashboard.cards,
// nombres et montants au format de la langue courante
const t = (key, options) => i18n.t(`dashboard.cards.${key}`, { ns: "dashboard-producer", ...options });

export const createProducerStatCards = (stats) => [
	{
		title: t("revenue"),
		value: formatPrice(stats.totalRevenue, "XOF"),
		icon: DollarSign,
		color: "bg-green-500",
		change: t("averageBasket", { amount: formatPrice(Math.round(stats.averageOrderValue), "XOF") }),
		link: "/producer/stats",
	},
	{
		title: t("orders"),
		value: formatNumber(stats.totalOrders),
		icon: ShoppingCart,
		color: "bg-blue-500",
		change: t("pending", { count: stats.pendingOrders || 0 }),
		link: "/producer/orders",
	},
	{
		title: t("activeProducts"),
		value: formatNumber(stats.activeProducts),
		icon: Package,
		color: "bg-purple-500",
		change: t("total", { count: stats.totalProducts }),
		link: "/producer/products",
	},
	{
		title: t("uniqueCustomers"),
		value: formatNumber(stats.uniqueCustomers),
		icon: Users,
		color: "bg-orange-500",
		change: t("loyalty"),
		link: "/producer/orders", // Or a customers page if it existed
	},
	{
		title: t("averageRating"),
		value: stats.averageRating ? `${Number(stats.averageRating).toFixed(1)}/5` : "—",
		icon: Star,
		color: "bg-yellow-500",
		change: t("seeReviews"),
		link: "/producer/reviews",
	},
];
