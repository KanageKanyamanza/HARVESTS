import { toPlainText } from "../../utils/textHelpers";
import i18n, { formatDateTime } from "../../utils/i18n";
import {
	FiClock,
	FiTruck,
	FiCheckCircle,
	FiXCircle,
	FiPackage,
} from "react-icons/fi";

// Jour 49 (bascule bilingue) : libellé lu dans common:orderStatus au moment
// de l'appel (langue courante) ; les appelants lisent toujours config.text.
const withLabel = (status, config) => ({
	...config,
	text: i18n.t(`orderStatus.${status}`, { ns: "common" }),
});

export const getStatusConfig = (status) => {
	const configs = {
		pending: {
			color: "text-amber-600 bg-amber-50 border-amber-100",
			icon: FiClock,
		},
		confirmed: {
			color: "text-blue-600 bg-blue-50 border-blue-100",
			icon: FiCheckCircle,
		},
		preparing: {
			color: "text-purple-600 bg-purple-50 border-purple-100",
			icon: FiPackage,
		},
		"ready-for-pickup": {
			color: "text-orange-600 bg-orange-50 border-orange-100",
			icon: FiPackage,
		},
		"in-transit": {
			color: "text-indigo-600 bg-indigo-50 border-indigo-100",
			icon: FiTruck,
		},
		"out-for-delivery": {
			color: "text-blue-600 bg-blue-50 border-blue-100",
			icon: FiTruck,
		},
		delivered: {
			color: "text-emerald-600 bg-emerald-50 border-emerald-100",
			icon: FiCheckCircle,
		},
		completed: {
			color: "text-emerald-700 bg-emerald-50 border-emerald-100",
			icon: FiCheckCircle,
		},
		cancelled: {
			color: "text-rose-600 bg-rose-50 border-rose-100",
			icon: FiXCircle,
		},
	};
	const key = configs[status] ? status : "pending";
	return withLabel(key, configs[key]);
};

export const getItemStatusConfig = (status = "pending") => {
	const configs = {
		pending: {
			color: "bg-amber-50 text-amber-700 border-amber-100",
		},
		confirmed: {
			color: "bg-blue-50 text-blue-700 border-blue-100",
		},
		preparing: {
			color: "bg-purple-50 text-purple-700 border-purple-100",
		},
		"ready-for-pickup": {
			color: "bg-orange-50 text-orange-700 border-orange-100",
		},
		"in-transit": {
			color: "bg-indigo-50 text-indigo-700 border-indigo-100",
		},
		delivered: {
			color: "bg-emerald-50 text-emerald-700 border-emerald-100",
		},
		completed: {
			color: "bg-emerald-50 text-emerald-700 border-emerald-100",
		},
		cancelled: {
			color: "bg-rose-50 text-rose-700 border-rose-100",
		},
		rejected: {
			color: "bg-rose-50 text-rose-700 border-rose-100",
		},
		refunded: {
			color: "bg-rose-50 text-rose-700 border-rose-100",
		},
		disputed: {
			color: "bg-rose-50 text-rose-700 border-rose-100",
		},
	};
	const key = configs[status] ? status : "pending";
	return withLabel(key, configs[key]);
};

export const formatDate = (dateString) => {
	if (!dateString) return i18n.t("orders.noDate", { ns: "common" });
	return formatDateTime(dateString);
};

export const extractSellerDetails = (order) => {
	const sellersMap = new Map();

	const addSeller = (rawSeller) => {
		if (!rawSeller || typeof rawSeller === "string") return;
		const sellerObj = typeof rawSeller === "object" ? rawSeller : null;
		if (!sellerObj) return;

		const id = sellerObj._id || sellerObj.id;
		const rawName =
			sellerObj.farmName ||
			sellerObj.companyName ||
			(sellerObj.firstName && sellerObj.lastName ?
				`${sellerObj.firstName} ${sellerObj.lastName}`
			:	sellerObj.firstName || sellerObj.lastName || sellerObj.name);
		const displayName = toPlainText(rawName, "");
		if (!displayName) return;

		const key = id || displayName;
		if (!sellersMap.has(key)) {
			sellersMap.set(key, {
				id: key,
				name: displayName,
				email: sellerObj.email || null,
				phone: sellerObj.phone || null,
			});
		}
	};

	if (order?.segment?.seller) addSeller(order.segment.seller);
	if (Array.isArray(order?.segments))
		order.segments.forEach((s) => addSeller(s?.seller));
	if (order?.seller) addSeller(order.seller);
	if (Array.isArray(order?.items))
		order.items.forEach((item) => addSeller(item?.seller));

	return Array.from(sellersMap.values());
};

export const getClientInfo = (order, userType) => {
	const sellers = extractSellerDetails(order);

	if (
		userType === "producer" ||
		userType === "transformer" ||
		userType === "restaurateur"
	) {
		const buyer = order.buyer;
		if (buyer) {
			const name =
				buyer.firstName && buyer.lastName ?
					`${buyer.firstName} ${buyer.lastName}`
				:	buyer.name || buyer.username || i18n.t("orders.customer", { ns: "common" });
			return { name, email: buyer.email, phone: buyer.phone };
		}
		return { name: i18n.t("orders.unknownCustomer", { ns: "common" }) };
	} else {
		if (sellers.length === 1) return sellers[0];
		if (sellers.length > 1)
			return { name: sellers.map((s) => s.name).join(", ") };
		return null;
	}
};
