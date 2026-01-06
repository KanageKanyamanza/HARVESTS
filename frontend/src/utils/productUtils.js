import { getCountryName } from "./countryMapper";
import { DEFAULT_CURRENCY, CURRENCIES } from "../config/currencies";

// Fonction utilitaire pour formater l'unité avec pluriel approprié
export const formatUnit = (quantity, unit) => {
	const unitValue = unit || "unité";
	const unitsNoPlural = [
		"kg",
		"g",
		"L",
		"ml",
		"m³",
		"m²",
		"cm",
		"mm",
		"tons",
		"tonnes",
	];

	if (unitsNoPlural.includes(unitValue)) {
		return unitValue;
	}
	return quantity > 1 ? `${unitValue}s` : unitValue;
};

// Fonction utilitaire pour obtenir le nom du vendeur
export const getVendorName = (vendor) => {
	if (!vendor) return "";
	return (
		vendor.farmName ||
		vendor.companyName ||
		vendor.restaurantName ||
		vendor.businessName ||
		`${vendor.firstName || ""} ${vendor.lastName || ""}`.trim() ||
		"Vendeur"
	);
};

// Fonction utilitaire pour obtenir le logo du vendeur
export const getVendorLogo = (vendor) => {
	if (!vendor) return null;
	if (vendor.shopLogo) {
		return typeof vendor.shopLogo === "string"
			? vendor.shopLogo
			: vendor.shopLogo.url || vendor.shopLogo.secure_url;
	}
	if (vendor.shopBanner) {
		return typeof vendor.shopBanner === "string"
			? vendor.shopBanner
			: vendor.shopBanner.url || vendor.shopBanner.secure_url;
	}
	if (vendor.avatar) {
		return typeof vendor.avatar === "string"
			? vendor.avatar
			: vendor.avatar.url || vendor.avatar.secure_url;
	}
	return null;
};

// Fonction utilitaire pour formater l'adresse complète
export const formatVendorAddress = (vendor) => {
	if (!vendor) return "";
	const parts = [];
	const city = vendor.address?.city || vendor.city;
	if (city) parts.push(city);
	const region = vendor.address?.region || vendor.region;
	if (region) parts.push(region);
	if (vendor.country) parts.push(getCountryName(vendor.country));
	return parts.length > 0 ? parts.join(", ") : "";
};

// Fonction pour obtenir la route du profil selon le type de vendeur
export const getVendorProfileRoute = (vendor) => {
	if (!vendor) return "#";
	const vendorId = vendor._id || vendor.id;
	const routes = {
		transformer: `/transformers/${vendorId}`,
		restaurateur: `/restaurateurs/${vendorId}`,
		exporter: `/exporters/${vendorId}`,
		transporter: `/transporters/${vendorId}`,
	};
	return routes[vendor.userType] || `/producers/${vendorId}`;
};

// Convertir le prix

// Labels des catégories
export const getCategoryLabel = (category) => {
	const categories = {
		cereals: "Céréales",
		vegetables: "Légumes",
		fruits: "Fruits",
		legumes: "Légumineuses",
		tubers: "Tubercules",
		spices: "Épices",
		herbs: "Herbes",
		grains: "Grains",
		nuts: "Noix",
		seeds: "Graines",
		dairy: "Produits laitiers",
		meat: "Viande",
		poultry: "Volaille",
		fish: "Poisson",
		"processed-foods": "Aliments transformés",
		beverages: "Boissons",
		other: "Autres",
	};
	return categories[category] || category;
};

// Configuration des statuts
export const getStatusConfig = (status) => {
	const configs = {
		approved: {
			color: "bg-green-100 text-green-800",
			text: "Disponible",
			iconName: "check",
		},
		"pending-review": {
			color: "bg-yellow-100 text-yellow-800",
			text: "En cours de révision",
			iconName: "clock",
		},
		draft: {
			color: "bg-blue-100 text-blue-800",
			text: "Brouillon",
			iconName: "package",
		},
		rejected: {
			color: "bg-red-100 text-red-800",
			text: "Rejeté",
			iconName: "x",
		},
		inactive: {
			color: "bg-gray-100 text-gray-800",
			text: "Indisponible",
			iconName: "x",
		},
	};
	return configs[status] || configs["draft"];
};

// Extraire le nom du produit depuis différentes structures
export const parseProductName = (name) => {
	if (!name) return "Produit sans nom";
	if (typeof name === "string") return name;
	if (typeof name === "object") {
		return (
			name.fr ||
			name.en ||
			name.value ||
			Object.values(name)[0] ||
			"Produit sans nom"
		);
	}
	return String(name);
};
