import React from "react";
import { FiStar, FiPackage, FiUsers, FiCalendar } from "react-icons/fi";
import {
	getVendorAverageRating,
	getVendorReviewCount,
	formatAverageRating,
} from "../../utils/vendorRatings";
import { toPlainText } from "../../utils/textHelpers";
import { formatPrice, getBaseContact } from "./baseConfig.jsx";
import {
	VendorProductCard,
	VendorReviewsList,
	VendorHours,
	VendorEmptyState,
} from "../../components/common/vendor";
import CertificationsSection from "../../components/profile/specific/CertificationsSection";

export const transformerConfig = {
	vendorType: "transformer",
	getVendorName: (t) => t.companyName || `${t.firstName} ${t.lastName}`,
	getVendorSubtitle: (t) =>
		t.companyName ? `${t.firstName} ${t.lastName}` : "Transformateur",

	getVendorStats: (transformer, products, reviews = []) => {
		const averageRating = getVendorAverageRating(transformer, reviews);
		const reviewCount = getVendorReviewCount(transformer, reviews);
		return [
			{
				icon: <FiStar className="w-5 h-5 text-yellow-500" />,
				value: formatAverageRating(averageRating),
				label: "Note moyenne",
			},
			{
				icon: <FiPackage className="w-5 h-5 text-green-500" />,
				value: products?.length || 0,
				label: "Produits",
			},
			{
				icon: <FiUsers className="w-5 h-5 text-blue-500" />,
				value: reviewCount,
				label: "Avis",
			},
			{
				icon: <FiUsers className="w-5 h-5 text-purple-500" />,
				value: transformer.transformationType || "Standard",
				label: "Type",
			},
		];
	},

	getVendorContact: getBaseContact,
	getVendorTags: (t) => [{ label: "Spécialités", items: t.specialties || [] }],

	formatPrice,
	getItemName: (product) => toPlainText(product.name, "Produit sans nom"),
	getItemDescription: (product) =>
		toPlainText(product.description, "Aucune description"),
	getItemPrice: (product) => product.price,
	getItemImage: (product) => product.images?.[0]?.url,
	getItemExtraInfo: (product) => `${product.inventory?.quantity || 0} en stock`,
	getItemButtonText: "Ajouter au panier",
	getItemButtonIcon: <FiPackage className="w-4 h-4 mr-2" />,
	getItemButtonColor: "bg-green-600 hover:bg-green-700",
	getEmptyStateIcon: (
		<FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
	),
	getEmptyStateTitle: "Aucun produit disponible",
	getEmptyStateDescription:
		"Ce transformateur n'a pas encore de produits en vente.",

	tabs: ["products", "about", "certifications", "reviews", "hours"],
	getTabLabel: (tab) =>
		({
			products: "Produits",
			about: "À propos",
			certifications: "Certifications",
			reviews: "Avis",
			hours: "Horaires",
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
								Type de transformation
							</p>
							<p className="font-bold text-gray-900 capitalize">
								{vendor.transformationType || "Non renseigné"}
							</p>
						</div>
						<div className="bg-gray-50 p-4 rounded-xl">
							<p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
								Services
							</p>
							<p className="font-bold text-gray-900 capitalize">
								{vendor.servicesOffered || "Vente directe"}
							</p>
						</div>
					</div>

					{vendor.processingCapabilities &&
						vendor.processingCapabilities.length > 0 && (
							<div>
								<h3 className="text-md font-bold text-gray-900 mb-3 uppercase tracking-wide text-green-700">
									Capacités Techniques
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
