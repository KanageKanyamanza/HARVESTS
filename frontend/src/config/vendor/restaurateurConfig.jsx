import React from "react";
import { FiStar, FiPackage, FiUsers, FiCalendar } from "react-icons/fi";
import {
	getVendorAverageRating,
	getVendorReviewCount,
	formatAverageRating,
} from "../../utils/vendorRatings";
import { toPlainText } from "../../utils/textHelpers";
import { getDishImageUrl } from "../../utils/dishImageUtils";
import { formatPrice, getBaseContact } from "./baseConfig.jsx";
import {
	VendorReviewsList,
	VendorHours,
	VendorEmptyState,
} from "../../components/common/vendor";

const RESTAURANT_TYPES = {
	"fine-dining": "Restaurant gastronomique",
	casual: "Restaurant décontracté",
	"fast-food": "Restaurant rapide",
	cafe: "Café",
	bar: "Bar",
	catering: "Traiteur",
	"food-truck": "Food truck",
	bakery: "Boulangerie",
};

const CUISINE_TYPES = {
	african: "Africaine",
	french: "Française",
	italian: "Italienne",
	asian: "Asiatique",
	american: "Américaine",
	mediterranean: "Méditerranéenne",
	fusion: "Fusion",
	vegetarian: "Végétarienne",
	vegan: "Végane",
};

export const restaurateurConfig = {
	vendorType: "restaurateur",
	getVendorName: (r) => r.restaurantName || `${r.firstName} ${r.lastName}`,
	getVendorSubtitle: (r) =>
		RESTAURANT_TYPES[r.restaurantType] || r.restaurantType,

	getVendorStats: (restaurateur, dishes, reviews = []) => {
		const averageRating = getVendorAverageRating(restaurateur, reviews);
		const reviewCount = getVendorReviewCount(restaurateur, reviews);
		return [
			{
				icon: <FiStar className="w-5 h-5 text-yellow-500" />,
				value: formatAverageRating(averageRating),
				label: "Note moyenne",
			},
			{
				icon: <FiUsers className="w-5 h-5 text-orange-500" />,
				value: `${restaurateur.seatingCapacity || 0}`,
				label: "Capacité",
			},
			{
				icon: <FiPackage className="w-5 h-5 text-green-500" />,
				value: dishes.length,
				label: "Plats",
			},
			{
				icon: <FiCalendar className="w-5 h-5 text-purple-500" />,
				value: new Date(restaurateur.createdAt).getFullYear(),
				label: "Depuis",
			},
		];
	},

	getVendorContact: getBaseContact,
	getVendorTags: (r) => [
		{
			label: "Types de cuisine",
			items: (r.cuisineTypes || []).map((type) => CUISINE_TYPES[type] || type),
		},
	],

	formatPrice,
	getItemName: (dish) => toPlainText(dish.name, "Plat"),
	getItemDescription: (dish) =>
		toPlainText(dish.description, "Aucune description"),
	getItemPrice: (dish) => dish.price?.value ?? dish.price ?? 0,
	getItemImage: (dish) => getDishImageUrl(dish),
	getItemExtraInfo: (dish) =>
		`${dish.preparationTime || dish.dishInfo?.preparationTime || 0} min`,
	getItemButtonText: "Commander",
	getItemButtonIcon: <FiPackage className="w-4 h-4 mr-2" />,
	getItemButtonColor: "bg-orange-600 hover:bg-orange-700",
	getEmptyStateIcon: (
		<FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
	),
	getEmptyStateTitle: "Menu en cours de préparation",
	getEmptyStateDescription: "Notre menu sera bientôt disponible.",

	tabs: ["menu", "about", "reviews", "hours"],
	getTabLabel: (tab) =>
		({
			menu: "Menu",
			about: "À propos",
			reviews: "Avis",
			hours: "Horaires",
		}[tab] || tab),
	getTabCount: (tab, items, reviews = []) => {
		if (tab === "menu") return items.length;
		if (tab === "reviews") return reviews.length;
		if (tab === "about" || tab === "hours") return 1;
		return 0;
	},

	getTabContent: (tab, items, vendor, helpers, reviews = []) => {
		if (tab === "menu") {
			if (items.length === 0) {
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
					{items.map((item) => {
						const stock = item.stock ?? item.inventory?.quantity ?? 0;
						const outOfStock = item.trackQuantity && stock === 0;

						return (
							<div
								key={item._id}
								className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
								onClick={() => helpers.navigate(`/dishes/${item._id}`)}
							>
								<div className="h-48 bg-gray-200 relative">
									{helpers.getItemImage(item) ? (
										<img
											src={helpers.getItemImage(item)}
											alt={helpers.getItemName(item)}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full bg-gray-100 flex items-center justify-center">
											<FiPackage className="w-12 h-12 text-gray-400" />
										</div>
									)}
								</div>
								<div className="p-4">
									<h3 className="font-semibold text-gray-900 mb-2">
										{helpers.getItemName(item)}
									</h3>
									<p className="text-gray-600 text-sm mb-3 line-clamp-2">
										{helpers.getItemDescription(item)}
									</p>
									<div className="flex items-center justify-between mb-2">
										<span className="text-lg font-bold text-orange-600">
											{helpers.formatPrice(helpers.getItemPrice(item))}
										</span>
										<span className="text-sm text-gray-500">
											{helpers.getItemExtraInfo(item)}
										</span>
									</div>
									{item.trackQuantity && (
										<div className="mb-2">
											<span
												className={`text-xs font-medium ${
													stock > 0 ? "text-green-600" : "text-red-600"
												}`}
											>
												Stock: {stock}
											</span>
										</div>
									)}
									{outOfStock && (
										<div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
											Rupture de stock
										</div>
									)}
									<button
										disabled={outOfStock}
										className={`w-full mt-3 py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${
											outOfStock
												? "bg-gray-300 text-gray-500 cursor-not-allowed"
												: `${helpers.getItemButtonColor} text-white`
										}`}
										onClick={(e) => {
											e.stopPropagation();
											if (!outOfStock) helpers.addToCart(item);
										}}
									>
										{helpers.getItemButtonIcon}
										{outOfStock
											? "Rupture de stock"
											: helpers.getItemButtonText}
									</button>
								</div>
							</div>
						);
					})}
				</div>
			);
		}
		if (tab === "about") {
			return (
				<div className="bg-white rounded-lg p-6 space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="bg-gray-50 p-4 rounded-xl">
							<p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
								Capacité d'accueil
							</p>
							<p className="font-bold text-gray-900">
								{vendor.seatingCapacity || 0} places
							</p>
						</div>
						<div className="bg-gray-50 p-4 rounded-xl">
							<p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
								Type d'établissement
							</p>
							<p className="font-bold text-gray-900 capitalize">
								{RESTAURANT_TYPES[vendor.restaurantType] ||
									vendor.restaurantType ||
									"Non renseigné"}
							</p>
						</div>
					</div>

					<div>
						<h3 className="text-md font-bold text-gray-900 mb-3 uppercase tracking-wide">
							Cuisines proposées
						</h3>
						<div className="flex flex-wrap gap-2">
							{(vendor.cuisineTypes || []).map((type, i) => (
								<span
									key={i}
									className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium border border-orange-100"
								>
									{CUISINE_TYPES[type] || type}
								</span>
							))}
						</div>
					</div>
				</div>
			);
		}
		if (tab === "hours") {
			return <VendorHours hours={vendor.operatingHours} />;
		}
		if (tab === "reviews") {
			return <VendorReviewsList reviews={reviews} />;
		}
		return null;
	},
};
