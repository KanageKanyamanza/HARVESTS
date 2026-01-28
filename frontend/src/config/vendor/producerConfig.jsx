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
	VendorEmptyState,
} from "../../components/common/vendor";
import CertificationsSection from "../../components/profile/specific/CertificationsSection";

export const producerConfig = {
	vendorType: "producer",
	getVendorName: (producer) => {
		const shopName = producer.shopInfo?.shopName;
		const farmName =
			producer.farmName && producer.farmName !== "À compléter" ?
				producer.farmName
			:	null;
		const lastName =
			producer.lastName && producer.lastName !== "À compléter" ?
				producer.lastName
			:	"";
		const companyName = producer.companyName;
		return (
			shopName ||
			farmName ||
			companyName ||
			`${producer.firstName} ${lastName}`.trim()
		);
	},
	getVendorSubtitle: (producer) => {
		const farmName =
			producer.farmName && producer.farmName !== "À compléter" ?
				producer.farmName
			:	null;
		const lastName =
			producer.lastName && producer.lastName !== "À compléter" ?
				producer.lastName
			:	"";
		return (
			farmName ||
			producer.companyName ||
			`${producer.firstName} ${lastName}`.trim()
		);
	},

	getVendorStats: (producer, products, reviews = []) => {
		const averageRating = getVendorAverageRating(producer, reviews);
		const reviewCount = getVendorReviewCount(producer, reviews);

		return [
			{
				icon: <FiStar className="w-5 h-5 text-yellow-500" />,
				value: formatAverageRating(averageRating),
				label: "Note moyenne",
			},
			{
				icon: <FiPackage className="w-5 h-5 text-green-500" />,
				value: `${producer.farmSize?.value || 0} ${
					producer.farmSize?.unit || "ha"
				}`,
				label: "Exploitation",
			},
			{
				icon: <FiUsers className="w-5 h-5 text-blue-500" />,
				value: reviewCount,
				label: "Avis",
			},
			{
				icon: <FiCalendar className="w-5 h-5 text-purple-500" />,
				value: new Date(producer.createdAt).getFullYear(),
				label: "Depuis",
			},
		];
	},

	getVendorContact: getBaseContact,
	getVendorTags: (producer) => [
		{ label: "Spécialités", items: producer.specialties || [] },
	],

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
		"Ce producteur n'a pas encore de produits en vente.",

	tabs: ["products", "about", "certifications", "reviews"],
	getTabLabel: (tab) =>
		({
			products: "Produits",
			about: "À propos",
			certifications: "Certifications",
			reviews: "Avis",
		})[tab] || tab,
	getTabCount: (tab, items, reviews, vendor) => {
		if (tab === "products") return items?.length || 0;
		if (tab === "reviews") return reviews?.length || 0;
		if (tab === "about") return 1;
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
						<VendorProductCard key={item._id} item={item} helpers={helpers} />
					))}
				</div>
			);
		}
		if (tab === "about") {
			return (
				<div className="bg-white rounded-lg p-6 space-y-8">
					<div>
						<h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
							Exploitation Agricole
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="bg-gray-50 p-4 rounded-xl">
								<p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
									Taille
								</p>
								<p className="font-bold text-gray-900">
									{vendor.farmSize?.value || 0}{" "}
									{vendor.farmSize?.unit || "hectares"}
								</p>
							</div>
							<div className="bg-gray-50 p-4 rounded-xl">
								<p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
									Type d'agriculture
								</p>
								<p className="font-bold text-gray-900 capitalize">
									{vendor.farmingType || "Conventionnelle"}
								</p>
							</div>
							<div className="bg-gray-50 p-4 rounded-xl">
								<p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
									MOQ
								</p>
								<p className="font-bold text-gray-900">
									{vendor.minimumOrderQuantity?.value || 1}{" "}
									{vendor.minimumOrderQuantity?.unit || "kg"}
								</p>
							</div>
						</div>
					</div>

					{vendor.crops && vendor.crops.length > 0 && (
						<div>
							<h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
								Nos Produits & Cultures
							</h3>
							<div className="flex flex-wrap gap-3">
								{vendor.crops.map((crop, i) => (
									<div
										key={i}
										className="flex flex-col bg-green-50 border border-green-100 p-3 rounded-lg min-w-[150px]"
									>
										<span className="font-bold text-green-800">
											{crop.name}
										</span>
										<span className="text-xs text-green-600 uppercase">
											{crop.category}
										</span>
									</div>
								))}
							</div>
						</div>
					)}

					<div>
						<h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
							Livraison & Logistique
						</h3>
						<div
							className={`p-4 rounded-xl  ${
								vendor.deliveryOptions?.canDeliver ?
									"bg-blue-50 border-blue-500"
								:	"bg-gray-50 border-gray-300"
							}`}
						>
							<p className="font-bold text-gray-900 mb-1">
								{vendor.deliveryOptions?.canDeliver ?
									"Service de livraison disponible"
								:	"Pas de service de livraison"}
							</p>
							{vendor.deliveryOptions?.canDeliver && (
								<div className="text-sm text-gray-700 space-y-1">
									<p>
										• Rayon d'action : {vendor.deliveryOptions.deliveryRadius}{" "}
										km autour de {vendor.city || "la ferme"}
									</p>
									<p>
										• Frais de livraison : {vendor.deliveryOptions.deliveryFee}{" "}
										FCFA
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			);
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
