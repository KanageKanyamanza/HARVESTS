const Product = require("../../models/Product");
const Producer = require("../../models/Producer");
const User = require("../../models/User");
const { toPlainText } = require("../../utils/localization");
const notificationSystemService = require("../notification/notificationSystemService");
const adminNotifications = require("../../utils/adminNotifications");

/**
 * Service pour la gestion des produits par les producteurs
 */

/**
 * Obtenir les produits d'un producteur
 */
async function getProducerProducts(producerId, queryParams = {}) {
	const queryObj = { producer: producerId };

	if (queryParams.status) queryObj.status = queryParams.status;
	if (queryParams.category) queryObj.category = queryParams.category;

	const page = parseInt(queryParams.page, 10) || 1;
	const limit = parseInt(queryParams.limit, 10) || 20;
	const skip = (page - 1) * limit;

	const products = await Product.find(queryObj)
		.sort("-createdAt")
		.skip(skip)
		.limit(limit);

	const total = await Product.countDocuments(queryObj);

	return {
		products,
		total,
		page,
		totalPages: Math.ceil(total / limit),
	};
}

/**
 * Créer un nouveau produit
 */
async function createProduct(producerId, productData) {
	productData.producer = producerId;

	// S'assurer que subcategory a une valeur par défaut si non fournie
	if (!productData.subcategory && productData.category) {
		productData.subcategory = productData.category;
	}

	// Traiter les images si présentes
	if (productData.images && productData.images.length > 0) {
		productData.images = productData.images.map((img, index) => ({
			...img,
			order: index,
			isPrimary: index === 0,
		}));
	}

	const product = await Product.create(productData);

	// Notifier les admins d'un nouveau produit en attente d'approbation
	try {
		// Récupérer l'utilisateur producteur
		const producerUser = await User.findById(producerId).select(
			"firstName lastName email"
		);
		if (producerUser) {
			// Notifier les admins par email
			adminNotifications
				.notifyProductPending(product, producerUser)
				.catch((err) => {
					console.error("Erreur notification produit en attente:", err);
				});
		}

		// Notification système existante (garder pour compatibilité - notifications in-app)
		const producer = await Producer.findById(producerId).select(
			"firstName lastName farmName"
		);
		if (producer) {
			const producerName =
				producer.farmName || `${producer.firstName} ${producer.lastName}`;
			const productName = toPlainText(product.name, "Sans nom");

			await notificationSystemService.notifyProductPendingApproval(
				product._id,
				productName,
				producerName
			);
		}
	} catch (error) {
		console.error("Erreur lors de l'envoi de notification admin:", error);
	}

	return product;
}

/**
 * Obtenir un produit d'un producteur
 */
async function getProducerProduct(productId, producerId) {
	const product = await Product.findOne({
		_id: productId,
		producer: producerId,
	});

	if (!product) {
		throw new Error("Produit non trouvé");
	}

	return product;
}

/**
 * Mettre à jour un produit
 */
async function updateProducerProduct(productId, producerId, updateData) {
	// Champs autorisés à la modification
	const allowedFields = [
		"name",
		"description",
		"shortDescription",
		"price",
		"currency",
		"compareAtPrice",
		"category",
		"subcategory",
		"tags",
		"hasVariants",
		"variants",
		"images",
		"inventory",
		"minimumOrderQuantity",
		"maximumOrderQuantity",
	];

	const filteredBody = {};
	Object.keys(updateData).forEach((key) => {
		if (allowedFields.includes(key)) {
			filteredBody[key] = updateData[key];
		}
	});

	// Si le produit était approuvé et qu'on modifie des champs importants, repasser en révision
	const importantFields = [
		"name",
		"description",
		"price",
		"category",
		"images",
	];
	const hasImportantChanges = Object.keys(filteredBody).some((key) =>
		importantFields.includes(key)
	);

	if (hasImportantChanges) {
		filteredBody.status = "pending-review";
	}

	const product = await Product.findOneAndUpdate(
		{ _id: productId, producer: producerId },
		filteredBody,
		{ new: true, runValidators: true }
	);

	if (!product) {
		throw new Error("Produit non trouvé");
	}

	return product;
}

/**
 * Supprimer un produit (soft delete)
 */
async function deleteProducerProduct(productId, producerId) {
	const product = await Product.findOne({
		_id: productId,
		producer: producerId,
	});

	if (!product) {
		throw new Error("Produit non trouvé");
	}

	product.isActive = false;
	product.status = "inactive";
	await product.save();

	return product;
}

/**
 * Ajouter une variante
 */
async function addVariant(productId, producerId, variantData) {
	const product = await Product.findOne({
		_id: productId,
		producer: producerId,
	});

	if (!product) {
		throw new Error("Produit non trouvé");
	}

	product.variants.push(variantData);
	product.hasVariants = true;
	await product.save();

	return product.variants[product.variants.length - 1];
}

/**
 * Mettre à jour une variante
 */
async function updateVariant(productId, producerId, variantId, variantData) {
	const product = await Product.findOne({
		_id: productId,
		producer: producerId,
	});

	if (!product) {
		throw new Error("Produit non trouvé");
	}

	const variant = product.variants.id(variantId);
	if (!variant) {
		throw new Error("Variante non trouvée");
	}

	Object.keys(variantData).forEach((key) => {
		variant[key] = variantData[key];
	});

	await product.save();

	return variant;
}

/**
 * Supprimer une variante
 */
async function deleteVariant(productId, producerId, variantId) {
	const product = await Product.findOne({
		_id: productId,
		producer: producerId,
	});

	if (!product) {
		throw new Error("Produit non trouvé");
	}

	product.variants.pull(variantId);

	if (product.variants.length === 0) {
		product.hasVariants = false;
	}

	await product.save();

	return product;
}

/**
 * Mettre à jour le stock
 */
async function updateStock(productId, producerId, { quantity, variantId }) {
	const product = await Product.findOne({
		_id: productId,
		producer: producerId,
	});

	if (!product) {
		throw new Error("Produit non trouvé");
	}

	if (product.hasVariants && variantId) {
		const variant = product.variants.id(variantId);
		if (!variant) {
			throw new Error("Variante non trouvée");
		}
		variant.inventory.quantity = quantity;
	} else {
		product.inventory.quantity = quantity;
	}

	product.lastStockUpdate = new Date();
	product.updateAvailabilityStatus();
	await product.save();

	return product;
}

/**
 * Obtenir les statistiques des produits d'un producteur
 */
async function getProducerProductStats(producerId) {
	const stats = await Product.aggregate([
		{ $match: { producer: producerId } },
		{
			$group: {
				_id: null,
				totalProducts: { $sum: 1 },
				activeProducts: {
					$sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
				},
				approvedProducts: {
					$sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
				},
				totalViews: { $sum: 0 },
				totalSales: { $sum: 0 },
				totalRevenue: { $sum: 0 },
				averageRating: { $avg: 0 },
			},
		},
	]);

	// Statistiques par catégorie
	const categoryStats = await Product.aggregate([
		{ $match: { producer: producerId, isActive: true } },
		{
			$group: {
				_id: "$category",
				count: { $sum: 1 },
				totalSales: { $sum: 0 },
				revenue: { $sum: 0 },
			},
		},
		{ $sort: { revenue: -1 } },
	]);

	// Produits les plus performants
	const topProducts = await Product.find({
		producer: producerId,
		isActive: true,
	})
		.sort("-createdAt")
		.limit(5)
		.select("name price createdAt");

	return {
		overview: stats[0] || {},
		categoryStats,
		topProducts,
	};
}

module.exports = {
	getProducerProducts,
	createProduct,
	getProducerProduct,
	updateProducerProduct,
	deleteProducerProduct,
	addVariant,
	updateVariant,
	deleteVariant,
	updateStock,
	getProducerProductStats,
};
