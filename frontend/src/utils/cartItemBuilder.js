import { getDishImageUrl } from "./dishImageUtils";
import { toPlainText } from "./textHelpers";

/**
 * Construit un item de panier à partir d'un produit
 */
export const buildCartItem = (product) => {
	if (!product) return null;

	const originType =
		product.originType ||
		product.userType ||
		product.type ||
		(product.restaurateur
			? "dish"
			: product.transformer
			? "transformed-product"
			: "product");

	const productId = product._id || product.id;
	const quantity = product.quantity || 1;

	let price = product.price;
	if (typeof price === "object" && price !== null) {
		price = price.value ?? price.amount ?? Object.values(price)[0];
	}
	price = Number(price) || 0;

	let imageUrl = "";
	if (
		originType === "restaurateur" ||
		originType === "dish" ||
		product.restaurateur
	) {
		imageUrl = getDishImageUrl(product) || "";
	} else if (
		product.images &&
		Array.isArray(product.images) &&
		product.images.length > 0
	) {
		const firstImage = product.images[0];
		if (typeof firstImage === "object" && firstImage !== null) {
			imageUrl =
				firstImage.url ||
				firstImage.secureUrl ||
				firstImage.secure_url ||
				firstImage.src ||
				firstImage.path ||
				"";
		} else if (typeof firstImage === "string") {
			imageUrl = firstImage;
		}
	} else if (product.primaryImage) {
		if (
			typeof product.primaryImage === "object" &&
			product.primaryImage !== null
		) {
			imageUrl =
				product.primaryImage.url ||
				product.primaryImage.secureUrl ||
				product.primaryImage.secure_url ||
				product.primaryImage.src ||
				product.primaryImage.path ||
				"";
		} else if (typeof product.primaryImage === "string") {
			imageUrl = product.primaryImage;
		}
	}

	if (!imageUrl) {
		imageUrl = product.image || product.coverImage || product.thumbnail || "";
	}

	const supplierInfo =
		[
			product.producer,
			product.restaurateur,
			product.transformer,
			product.supplier,
			product.vendor,
			product.owner,
			product.farmer,
			product.seller,
			product.provider,
			product.merchant,
			product.source,
		].find(Boolean) || {};

	// Pour les produits de restaurateurs, chercher aussi dans les champs spécifiques
	let restaurateurId = null;
	if (
		originType === "dish" ||
		originType === "restaurateur" ||
		product.restaurateur
	) {
		restaurateurId =
			product.restaurateur?._id ||
			product.restaurateur?.id ||
			product.restaurateurId ||
			(typeof product.restaurateur === "string" ? product.restaurateur : null);
	}

	const supplierId =
		supplierInfo.companyId ||
		supplierInfo.organizationId ||
		supplierInfo._id ||
		supplierInfo.id ||
		restaurateurId ||
		product.companyId ||
		product.organizationId ||
		product.producerId ||
		product.restaurateurId ||
		product.transformerId ||
		product.supplierId ||
		product.vendorId ||
		product.ownerId ||
		product.userId ||
		product.owner?._id ||
		product.sourceId ||
		product.creatorId ||
		product.sellerId ||
		null;

	let supplierName = "";
	if (originType === "dish" || originType === "restaurateur") {
		supplierName =
			supplierInfo.restaurantName ||
			product.restaurateur?.restaurantName ||
			product.restaurantName ||
			product.restaurateurName ||
			supplierInfo.name ||
			supplierInfo.displayName ||
			supplierInfo.brandName ||
			supplierInfo.companyName ||
			product.restaurateur?.name ||
			product.restaurateur?.displayName;
	} else if (
		originType === "transformed-product" ||
		originType === "transformer"
	) {
		supplierName =
			supplierInfo.companyName ||
			supplierInfo.organizationName ||
			supplierInfo.businessName ||
			product.transformer?.companyName ||
			product.companyName ||
			product.businessName ||
			product.transformerName;
	} else {
		supplierName =
			supplierInfo.farmName ||
			supplierInfo.companyName ||
			supplierInfo.businessName ||
			product.producer?.farmName ||
			product.farmName ||
			product.companyName ||
			product.businessName ||
			product.producerName;
	}

	if (!supplierName) {
		supplierName =
			supplierInfo.displayName ||
			supplierInfo.brandName ||
			supplierInfo.organizationName ||
			supplierInfo.businessName ||
			supplierInfo.shopName ||
			supplierInfo.storeName ||
			supplierInfo.tradeName ||
			supplierInfo.commercialName ||
			supplierInfo.legalName ||
			supplierInfo.profile?.restaurantName ||
			supplierInfo.profile?.companyName ||
			supplierInfo.profile?.businessName ||
			supplierInfo.name ||
			product.brandName ||
			product.organizationName ||
			product.businessName ||
			product.shopName ||
			product.storeName ||
			product.tradeName ||
			product.commercialName ||
			product.legalName ||
			product.owner?.businessName ||
			product.owner?.companyName ||
			product.owner?.restaurantName ||
			product.owner?.displayName ||
			product.owner?.name ||
			"Fournisseur";
	}

	const supplierType =
		supplierInfo.userType ||
		supplierInfo.role ||
		supplierInfo.type ||
		product.supplierType ||
		product.vendorType ||
		product.categoryOwnerType ||
		product.ownerType ||
		product.owner?.userType ||
		(originType === "dish" || originType === "restaurateur"
			? "restaurateur"
			: originType === "transformed-product" || originType === "transformer"
			? "transformer"
			: originType === "logistics"
			? "transporter"
			: "producer");

	return {
		productId,
		originType,
		name: toPlainText(product.name, "Produit"),
		price,
		image: imageUrl,
		quantity,
		unit: product.unit || "unité",
		producer: {
			id: supplierId,
			name: supplierName,
			type: supplierType,
		},
		currency: product.currency || "XOF",
	};
};
