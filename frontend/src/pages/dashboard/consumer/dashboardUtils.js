import { FiShoppingCart, FiCreditCard, FiStar, FiAward } from "react-icons/fi";
import i18n, { formatNumber } from "../../../utils/i18n";
import { formatPrice } from "../../../utils/currencyUtils";

const card = (key) => i18n.t(`dashboard.cards.${key}`, { ns: "dashboard-consumer" });

export const createConsumerStatCards = (stats) => [
	{
		title: card("totalSpent"),
		value: formatPrice(stats.totalSpent, "XOF"),
		icon: FiCreditCard,
		color: "bg-blue-500",
		// Tendance affichée seulement quand elle est calculable (mois précédent non nul)
		...(stats.monthlyGrowth !== null && {
			trend: {
				value: `${stats.monthlyGrowth >= 0 ? "+" : ""}${stats.monthlyGrowth}%`,
				isPositive: stats.monthlyGrowth >= 0,
				text: card("vsLastMonth"),
			},
		}),
		link: "/consumer/statistics",
	},
	{
		title: card("orders"),
		value: formatNumber(stats.totalOrders),
		icon: FiShoppingCart,
		color: "bg-cyan-500",
		link: "/consumer/orders",
	},
	{
		title: card("loyaltyPoints"),
		value: formatNumber(stats.loyaltyPoints),
		icon: FiAward,
		color: "bg-amber-500",
		link: "/loyalty",
	},
	{
		title: card("reviewsGiven"),
		value: formatNumber(stats.reviewsWritten),
		icon: FiStar,
		color: "bg-indigo-500",
		link: "/consumer/reviews",
	},
];
