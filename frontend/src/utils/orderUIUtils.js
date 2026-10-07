import React from "react";
import {
	FiCheckCircle,
	FiClock,
	FiPackage,
	FiTruck,
} from "react-icons/fi";
import i18n, { formatDateTime } from "./i18n";

// Jour 54 : libellés traduits (common.orderStatus) et dates au format de la langue
export const getStatusConfig = (status) => {
	const configs = {
		pending: {
			color: "text-yellow-600 bg-yellow-100",
			status: "pending",
			icon: FiClock,
		},
		confirmed: {
			color: "text-blue-600 bg-blue-100",
			status: "confirmed",
			icon: FiCheckCircle,
		},
		processing: {
			color: "text-purple-600 bg-purple-100",
			status: "processing",
			icon: FiPackage,
		},
		shipped: {
			color: "text-indigo-600 bg-indigo-100",
			status: "shipped",
			icon: FiTruck,
		},
		delivered: {
			color: "text-green-600 bg-green-100",
			status: "delivered",
			icon: FiCheckCircle,
		},
		cancelled: {
			color: "text-red-600 bg-red-100",
			status: "cancelled",
			icon: FiClock,
		},
	};
	const config = configs[status] || configs.pending;
	return { ...config, text: i18n.t(`orderStatus.${config.status}`, { ns: "common" }) };
};

export const formatDate = (dateString) => {
	if (!dateString) return "—";
	return formatDateTime(dateString, i18n.language, {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};
