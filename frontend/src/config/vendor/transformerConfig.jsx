import React from "react";
import { FiStar, FiPackage, FiUsers, FiCalendar } from "react-icons/fi";
import {
	getVendorAverageRating,
	getVendorReviewCount,
	formatAverageRating,
} from "../../utils/vendorRatings";
import { toPlainText } from "../../utils/textHelpers";
import { formatPrice, getBaseContact } from "./baseConfig.jsx";
import i18n from "../../utils/i18n";

const t = (key, opts) => i18n.t(`vendorProfile.${key}`, { ns: "public", ...opts });
import {
	VendorProductCard,
	VendorReviewsList,
	VendorHours,
	VendorEmptyState,
} from "../../components/common/vendor";
import CertificationsSection from "../../components/profile/specific/CertificationsSection";

export const transformerConfig = {
	vendorType: "transformer",
	getVendorName: (transformer) => transformer.companyName || `${transformer.firstName} ${transformer.lastName}`,
	getVendorSubtitle: (transformer) =>
		transformer.companyName ? `${transformer.firstName} ${transformer.lastName}` : t("roleLabels.transformer"),

	getVendorStats: (transformer, products, reviews = []) => {
		const averageRating = getVendorAverageRating(transformer, reviews);
		const reviewCount = getVendorReviewCount(transformer, reviews);
		return [
			{
				icon: <FiStar className="w-5 h-5 text-yellow-500" />,
				value: formatAverageRating(averageRating),
				label: t("statLabels.averageRating"),
			},
			{
				icon: <FiPackage className="w-5 h-5 text-green-500" />,
				value: products?.length || 0,
				label: t("transformer.productsLabel"),
			},
			{
				icon: <FiUsers className="w-5 h-5 text-blue-500" />,
				value: reviewCount,
				label: t("tabs.reviews"),
			},
			{
				icon: <FiUsers className="w-5 h-5 text-purple-500" />,
				value: transformer.transformationType || t("transformer.genericLabel"),
				label: t("transformer.typeLabel"),
			},
		];
	},

	getVendorContact: getBaseContact,
	getVendorTags: (transformer) => [{ label: t("producer.specialtiesLabel"), items: transformer.specialties || [] }],

	formatPrice,
	getItemName: (product) => toPlainText(product.name, t("producer.genericItemName")),
	getItemDescription: (product) =>
		toPlainText(product.description, t("producer.genericDescription")),
	getItemPrice: (product) => product.price,
	getItemImage: (product) => product.images?.[0]?.url,
	getItemExtraInfo: (product) => `${product.inventory?.quantity || 0} ${t("producer.inStockSuffix")}`,
	get getItemButtonText() { return t("producer.itemButton"); },
	getItemButtonIcon: <FiPackage className="w-4 h-4 mr-2" />,
	getItemButtonColor: "bg-green-600 hover:bg-green-700",
	getEmptyStateIcon: (
		<FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
	),
	get getEmptyStateTitle() { return t("transformer.emptyProductsTitle"); },
	get getEmptyStateDescription() { return t("transformer.emptyProductsDescription"); },

	tabs: ["products", "about", "certifications", "reviews", "hours"],
	getTabLabel: (tab) =>
		({
			products: t("tabs.products"),
			about: t("tabs.about"),
			certifications: t("tabs.certifications"),
			reviews: t("tabs.reviews"),
			hours: t("tabs.hours"),
		}[tab] || tab),
	getTabCount: (tab, items, reviews, vendor) => {
		if (tab === "products") return items?.length || 0;
		if (tab === "reviews") return reviews?.length || 0;
		if (tab === "about" || tab === "hours") return 1;
		if (tab === "certifications") return vendor?.certifications?.length || 0;
		return 0;
	},

	getTabContent: (tab, items, vendor, helpers, reviews = []) => {
		if (tab === "products") {
			if (!items || items.length === 0) {
				return (
					<VendorEmptyState
						icon={helpers.getEmptyStateIcon}
						title={helpers.getEmptyStateTitle}
						description={helpers.getEmptyStateDescription}
					/>
				);
			}
			return (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{items.map((item) => (
						<VendorProductCard
							key={item._id}
							item={item}
							helpers={helpers}
							showRating={false}
						/>
					))}
				</div>
			);
		}
		if (tab === "about") {
			return (
				<div className="bg-white rounded-lg p-6 space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="bg-gray-50 p-4 rounded-xl">
							<p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
								{t("transformer.transformationTypeLabel")}
							</p>
							<p className="font-bold text-gray-900 capitalize">
								{vendor.transformationType || t("transformer.notSpecified")}
							</p>
						</div>
						<div className="bg-gray-50 p-4 rounded-xl">
							<p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
								{t("transformer.servicesLabel")}
							</p>
							<p className="font-bold text-gray-900 capitalize">
								{vendor.servicesOffered || t("transformer.directSale")}
							</p>
						</div>
					</div>

					{vendor.processingCapabilities &&
						vendor.processingCapabilities.length > 0 && (
							<div>
								<h3 className="text-md font-bold text-gray-900 mb-3 uppercase tracking-wide text-green-700">
									{t("transformer.technicalCapabilitiesTitle")}
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									{vendor.processingCapabilities.map((cap, i) => (
										<div
											key={i}
											className="flex items-center p-3 border border-green-100 bg-green-50 rounded-lg"
										>
											<FiPackage className="text-green-600 mr-2" />
											<span className="text-sm font-medium text-green-800">
												{cap}
											</span>
										</div>
									))}
								</div>
							</div>
						)}
				</div>
			);
		}
		if (tab === "hours") {
			return <VendorHours hours={vendor.operatingHours} />;
		}
		if (tab === "certifications") {
			return (
				<CertificationsSection
					certifications={vendor.certifications}
					editing={false}
				/>
			);
		}
		if (tab === "reviews") {
			return <VendorReviewsList reviews={reviews} />;
		}
		return null;
	},
};
