import { toPlainText } from "../../utils/textHelpers";
import {
	FiClock,
	FiTruck,
	FiCheckCircle,
	FiXCircle,
	FiPackage,
} from "react-icons/fi";

export const getStatusConfig = (status) => {
	const configs = {
		pending: {
			color: "text-amber-600 bg-amber-50 border-amber-100",
			text: "En attente",
			icon: FiClock,
		},
		confirmed: {
			color: "text-blue-600 bg-blue-50 border-blue-100",
			text: "Confirmée",
			icon: FiCheckCircle,
		},
		preparing: {
			color: "text-purple-600 bg-purple-50 border-purple-100",
			text: "En préparation",
			icon: FiPackage,
		},
		"ready-for-pickup": {
			color: "text-orange-600 bg-orange-50 border-orange-100",
			text: "Prête",
			icon: FiPackage,
		},
		"in-transit": {
			color: "text-indigo-600 bg-indigo-50 border-indigo-100",
			text: "En transit",
			icon: FiTruck,
		},
		"out-for-delivery": {
			color: "text-blue-600 bg-blue-50 border-blue-100",
			text: "En cours de livraison",
			icon: FiTruck,
		},
		delivered: {
			color: "text-emerald-600 bg-emerald-50 border-emerald-100",
			text: "Livrée",
			icon: FiCheckCircle,
		},
		completed: {
			color: "text-emerald-700 bg-emerald-50 border-emerald-100",
			text: "Terminée",
			icon: FiCheckCircle,
		},
		cancelled: {
			color: "text-rose-600 bg-rose-50 border-rose-100",
			text: "Annulée",
			icon: FiXCircle,
		},
	};
	return configs[status] || configs.pending;
};

export const getItemStatusConfig = (status = "pending") => {
	const configs = {
		pending: {
			color: "bg-amber-50 text-amber-700 border-amber-100",
			text: "En attente",
		},
		confirmed: {
			color: "bg-blue-50 text-blue-700 border-blue-100",
			text: "Confirmé",
		},
		preparing: {
			color: "bg-purple-50 text-purple-700 border-purple-100",
			text: "Préparation",
		},
		"ready-for-pickup": {
			color: "bg-orange-50 text-orange-700 border-orange-100",
			text: "Prête",
		},
		"in-transit": {
			color: "bg-indigo-50 text-indigo-700 border-indigo-100",
			text: "En transit",
		},
		delivered: {
			color: "bg-emerald-50 text-emerald-700 border-emerald-100",
			text: "Livré",
		},
		completed: {
			color: "bg-emerald-50 text-emerald-700 border-emerald-100",
			text: "Terminé",
		},
		cancelled: {
			color: "bg-rose-50 text-rose-700 border-rose-100",
			text: "Annulé",
		},
		rejected: {
			color: "bg-rose-50 text-rose-700 border-rose-100",
			text: "Rejeté",
		},
		refunded: {
			color: "bg-rose-50 text-rose-700 border-rose-100",
			text: "Remboursé",
		},
		disputed: {
			color: "bg-rose-50 text-rose-700 border-rose-100",
			text: "En litige",
		},
	};
	return configs[status] || configs.pending;
};

export const formatDate = (dateString) => {
	if (!dateString) return "Date non disponible";
	return new Date(dateString).toLocaleDateString("fr-FR", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
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
				:	buyer.name || buyer.username || "Client";
			return { name, email: buyer.email, phone: buyer.phone };
		}
		return { name: "Client inconnu" };
	} else {
		if (sellers.length === 1) return sellers[0];
		if (sellers.length > 1)
			return { name: sellers.map((s) => s.name).join(", ") };
		return null;
	}
};
