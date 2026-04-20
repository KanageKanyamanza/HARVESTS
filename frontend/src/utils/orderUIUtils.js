import React from "react";
import {
	FiCheckCircle,
	FiClock,
	FiPackage,
	FiTruck,
} from "react-icons/fi";

export const getStatusConfig = (status) => {
	const configs = {
		pending: {
			color: "text-yellow-600 bg-yellow-100",
			text: "En attente",
			icon: FiClock,
		},
		confirmed: {
			color: "text-blue-600 bg-blue-100",
			text: "Confirmée",
			icon: FiCheckCircle,
		},
		processing: {
			color: "text-purple-600 bg-purple-100",
			text: "En préparation",
			icon: FiPackage,
		},
		shipped: {
			color: "text-indigo-600 bg-indigo-100",
			text: "Expédiée",
			icon: FiTruck,
		},
		delivered: {
			color: "text-green-600 bg-green-100",
			text: "Livrée",
			icon: FiCheckCircle,
		},
		cancelled: {
			color: "text-red-600 bg-red-100",
			text: "Annulée",
			icon: FiClock,
		},
	};
	return configs[status] || configs["pending"];
};

export const formatDate = (dateString) => {
	if (!dateString) return "N/A";
	return new Date(dateString).toLocaleDateString("fr-FR", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};
