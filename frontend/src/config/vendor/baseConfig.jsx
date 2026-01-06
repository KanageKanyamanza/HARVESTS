import React from "react";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";

import { DEFAULT_CURRENCY } from "../currencies";

export const formatPrice = (price, currency = DEFAULT_CURRENCY) => {
	try {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: currency,
			minimumFractionDigits: 0,
		}).format(price);
	} catch (error) {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: DEFAULT_CURRENCY,
			minimumFractionDigits: 0,
		}).format(price);
	}
};

export const formatPriceOrQuote = (price) =>
	price ? formatPrice(price) : "Sur devis";

export const getBaseContact = (vendor) => {
	const contact = [];
	if (vendor.phone) {
		contact.push({
			icon: <FiPhone className="h-5 w-5 text-gray-400 mr-3" />,
			text: vendor.phone,
			href: `tel:${vendor.phone}`,
		});
	}
	if (vendor.email) {
		contact.push({
			icon: <FiMail className="h-5 w-5 text-gray-400 mr-3" />,
			text: vendor.email,
			href: `mailto:${vendor.email}`,
		});
	}
	if (vendor.address || vendor.city) {
		contact.push({
			icon: <FiMapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />,
			text: `${vendor.address ? vendor.address + ", " : ""}${
				vendor.city || ""
			}${vendor.region ? ", " + vendor.region : ""}`,
		});
	}
	return contact;
};
