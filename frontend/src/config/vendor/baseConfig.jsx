import React from "react";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";

import { DEFAULT_CURRENCY } from "../currencies";
import i18n from "../../utils/i18n";
import { formatPriceForLanguage } from "../../utils/priceFormat";

// Jour 70 : prix affichés selon la langue (fr « 3 000 F CFA », en « FCFA 3,000 »),
// conventions communes à tout le site (utils/priceFormat.js).
export const formatPrice = (price, currency = DEFAULT_CURRENCY) =>
	formatPriceForLanguage(price, currency, i18n.language);

export const formatPriceOrQuote = (price) =>
	price ? formatPrice(price) : i18n.t("vendorProfile.priceOnRequest", { ns: "public" });

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
