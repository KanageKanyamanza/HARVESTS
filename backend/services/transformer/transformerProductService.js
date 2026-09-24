const Product = require("../../models/Product");
const { toPlainText } = require("../../utils/localization");

/**
 * Service pour la gestion des produits du transformateur
 */

async function getMyProducts(transformerId) {
	const products = await Product.find({
		transformer: transformerId,
		userType: "transformer",
	}).sort("-createdAt");
	return products;
}

async function getProduct(productId, transformerId) {
	const product = await Product.findOne({
		_id: productId,
		transformer: transformerId,
		userType: "transformer",
	});

	if (!product) {
		throw new Error("Produit non trouvé");
	}

	return product;
}

async function createProduct(transformerId, productData) {
	// Vérifier les limites de produits selon le plan
	const mongoose = require("mongoose");
	const Subscription = mongoose.model("Subscription");
	const activeSubscription = await Subscription.findOne({
		user: transformerId,
		status: "active",
	});

	const plans = Subscription.getAvailablePlans();
	const currentPlan =
		activeSubscription ? plans[activeSubscription.planId] : plans.gratuit;

	const productCount = await Product.countDocuments({
		transformer: transformerId,
		status: { $ne: "inactive" },
	});

	if (
		currentPlan.features.maxProducts !== -1 &&
		productCount >= currentPlan.features.maxProducts
	) {
		throw new Error(
			`Limite de produits atteinte pour votre plan ${currentPlan.name} (${currentPlan.features.maxProducts} produits max).`,
		);
	}

	const {
		name,
		description,
		shortDescription,
		category,
		subcategory,
		tags,
		price,
		compareAtPrice,
		stock,
		minimumOrderQuantity,
		maximumOrderQuantity,
		unit,
		status,
		images,
		currency,
	} = productData;

	// Validation des champs obligatoires
	if (!name || !description || !category || !price || stock === undefined) {
		throw new Error("Tous les champs obligatoires doivent être remplis");
	}

	// Jour 45 (bascule bilingue) : on ne fige plus name/description/
	// shortDescription en chaîne ici — la forme brute (chaîne legacy ou
	// {fr, en}) est transmise telle quelle, productMiddleware.js (pre('save'))
	// la normalise et complète `en` par traduction automatique si absent.
	const plainNameForValidation = toPlainText(name, "");
	const plainDescriptionForValidation = toPlainText(description, "");

	if (!plainNameForValidation || !plainDescriptionForValidation) {
		throw new Error("Le nom et la description doivent être fournis");
	}

	// S'assurer que subcategory a une valeur par défaut si non fournie
	const finalSubcategory = subcategory || category || undefined;

	// Préparer les données du produit
	const productDataToCreate = {
		name,
		description,
		shortDescription: shortDescription || undefined,
		category,
		subcategory: finalSubcategory,
		tags: tags || [],
		price: parseFloat(price),
		compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
		inventory: {
			quantity: parseInt(stock) || 0,
		},
		minimumOrderQuantity:
			minimumOrderQuantity !== undefined ? minimumOrderQuantity : 0,
		maximumOrderQuantity: maximumOrderQuantity || undefined,
		unit: unit || "unité",
		currency: currency || "XOF",
		status: status || "draft",
		images:
			images ?
				images.map((img, index) => ({
					...img,
					order: index,
					isPrimary: index === 0,
				}))
			:	[],
		transformer: transformerId,
		userType: "transformer",
	};

	// Note: currency et unit ne sont pas stockés dans le modèle Product
	// Ils peuvent être utilisés pour des calculs ou affichage mais ne sont pas persistés

	const product = await Product.create(productDataToCreate);

	return product;
}

async function deleteProduct(productId, transformerId) {
	const product = await Product.findOneAndDelete({
		_id: productId,
		transformer: transformerId,
		userType: "transformer",
	});

	if (!product) {
		throw new Error("Produit non trouvé");
	}

	return product;
}

async function submitProductForReview(productId, transformerId) {
	const product = await Product.findOneAndUpdate(
		{ _id: productId, transformer: transformerId },
		{ status: "pending-review" },
		{ new: true },
	);

	if (!product) {
		throw new Error("Produit non trouvé");
	}

	return product;
}

async function getPublicProducts(transformerId) {
	const products = await Product.find({
		transformer: transformerId,
		userType: "transformer",
		status: "approved",
		isActive: true,
	}).sort("-createdAt");

	return products;
}

module.exports = {
	getMyProducts,
	getProduct,
	createProduct,
	deleteProduct,
	submitProductForReview,
	getPublicProducts,
};
