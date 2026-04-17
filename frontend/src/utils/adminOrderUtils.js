import React from "react";
import { 
	Clock, 
	CheckCircle, 
	Package, 
	Truck, 
	XCircle, 
	AlertTriangle 
} from "lucide-react";

export const getStatusConfig = (status) => {
	const configs = {
		pending: {
			color: "text-yellow-600 bg-yellow-100",
			text: "En attente",
			icon: Clock,
		},
		confirmed: {
			color: "text-blue-600 bg-blue-100",
			text: "Confirmée",
			icon: CheckCircle,
		},
		preparing: {
			color: "text-purple-600 bg-purple-100",
			text: "En préparation",
			icon: Package,
		},
		processing: {
			color: "text-purple-600 bg-purple-100",
			text: "En cours",
			icon: Package,
		},
		"ready-for-pickup": {
			color: "text-indigo-600 bg-indigo-100",
			text: "Prête à collecter",
			icon: Package,
		},
		"in-transit": {
			color: "text-indigo-600 bg-indigo-100",
			text: "En transit",
			icon: Truck,
		},
		shipped: {
			color: "text-indigo-600 bg-indigo-100",
			text: "Expédiée",
			icon: Truck,
		},
		delivered: {
			color: "text-green-600 bg-green-100",
			text: "Livrée",
			icon: CheckCircle,
		},
		completed: {
			color: "text-green-600 bg-green-100",
			text: "Terminée",
			icon: CheckCircle,
		},
		cancelled: {
			color: "text-red-600 bg-red-100",
			text: "Annulée",
			icon: XCircle,
		},
		disputed: {
			color: "text-orange-600 bg-orange-100",
			text: "En litige",
			icon: AlertTriangle,
		},
	};
	return configs[status] || configs["pending"];
};

export const getPaymentStatusConfig = (status) => {
	const configs = {
		pending: { color: "text-yellow-600 bg-yellow-100", text: "En attente" },
		completed: { color: "text-green-600 bg-green-100", text: "Payé" },
		paid: { color: "text-green-600 bg-green-100", text: "Payé" },
		failed: { color: "text-red-600 bg-red-100", text: "Échoué" },
		refunded: { color: "text-gray-600 bg-gray-100", text: "Remboursé" },
	};
	return configs[status] || configs["pending"];
};

export const formatDate = (date) => {
	if (!date) return "N/A";
	return new Date(date).toLocaleDateString("fr-FR", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

export const formatPrice = (price) =>
	new Intl.NumberFormat("fr-FR", {
		style: "currency",
		currency: "XOF",
		minimumFractionDigits: 0,
	}).format(price || 0);
