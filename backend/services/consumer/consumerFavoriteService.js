const Consumer = require("../../models/Consumer");
const Producer = require("../../models/Producer");
const Transformer = require("../../models/Transformer");

/**
 * Service pour la gestion des producteurs/transformateurs favoris du consommateur
 */

async function getFavoriteProducers(consumerId) {
	try {
		let consumer = await Consumer.findById(consumerId).select(
			"favorites purchaseHistory"
		); // Include 'favorites' field

		if (!consumer) {
			// Create an empty Consumer if not found
			consumer = await Consumer.create({
				_id: consumerId,
				favoriteProducers: [],
				favorites: [],
			});
		}

		// Populate les producteurs favoris (optionnel, dans purchaseHistory)
		let favoriteProducers = [];
		try {
			if (consumer.purchaseHistory?.favoriteProducers?.length > 0) {
				await consumer.populate(
					"purchaseHistory.favoriteProducers.producer",
					"farmName firstName lastName address salesStats"
				);
				favoriteProducers = consumer.purchaseHistory.favoriteProducers || [];
			}
		} catch (populateError) {
			console.warn(
				"⚠️ getFavoriteProducers - Could not populate favoriteProducers:",
				populateError.message
			);
			// Continue anyway, we still need to process favorites
		}

		// Populate manuellement les produits dans les favoris car c'est un tableau de sous-documents
		let products = [];
		if (consumer.favorites && consumer.favorites.length > 0) {
			const Product = require("../../models/Product");

			// Extraire les IDs des produits (peuvent être ObjectId ou déjà des strings)
			const productIds = consumer.favorites
				.map((fav, index) => {
					const productRef = fav.product;
					if (!productRef) {
						console.warn(
							`⚠️ getFavoriteProducers - Favorite ${index} has no product`
						);
						return null;
					}
					// Si c'est un ObjectId, le convertir en string
					if (productRef.toString) {
						return productRef.toString();
					}
					return productRef;
				})
				.filter(Boolean);

			if (productIds.length > 0) {
				const foundProducts = await Product.find({ _id: { $in: productIds } })
					.select("name images price unit rating category producer transformer")
					.populate("producer", "farmName firstName lastName")
					.populate("transformer", "companyName firstName lastName")
					.lean(); // Utiliser lean() pour obtenir des objets JavaScript simples

				// Créer un map pour un accès rapide
				const productMap = new Map(
					foundProducts.map((p) => [p._id.toString(), p])
				);

				// Créer le tableau de favoris avec produits populés
				products = consumer.favorites
					.map((fav) => {
						const productId = fav.product?.toString
							? fav.product.toString()
							: fav.product?._id?.toString() ||
							  fav.product?.toString() ||
							  fav.product;
						const product = productId
							? productMap.get(productId.toString())
							: null;

						if (!product) {
							return null;
						}

						return {
							_id: fav._id,
							product: product,
							addedAt: fav.addedAt,
						};
					})
					.filter((fav) => fav !== null); // Filtrer les favoris sans produit
			}
		}

		return {
			producers: favoriteProducers,
			products: products,
		};
	} catch (error) {
		console.error("Erreur dans getFavoriteProducers:", error.message);
		return { producers: [], products: [] };
	}
}

async function addFavorite(consumerId, productId) {
	let consumer = await Consumer.findById(consumerId);
	if (!consumer) {
		consumer = await Consumer.create({ _id: consumerId });
	}

	const Product = require("../../models/Product");
	const product = await Product.findById(productId);
	if (!product) {
		throw new Error("Produit non trouvé");
	}

	if (!consumer.favorites) {
		consumer.favorites = [];
	}

	// Vérifier si le produit est déjà dans les favoris
	const productIdStr = productId.toString();
	const isAlreadyFavorite = consumer.favorites.some((fav) => {
		// Gérer différents formats : ObjectId, string, ou objet avec _id
		let favProductId = null;
		if (fav.product) {
			if (typeof fav.product === "string") {
				favProductId = fav.product;
			} else if (fav.product._id) {
				favProductId = fav.product._id.toString();
			} else {
				favProductId = fav.product.toString();
			}
		}
		return favProductId && favProductId === productIdStr;
	});

	if (isAlreadyFavorite) {
		// Si déjà favori, ne pas lever d'erreur, juste retourner un succès
		return { alreadyFavorite: true };
	}

	consumer.favorites.push({ product: productId });
	await consumer.save();
	return { alreadyFavorite: false };
}

async function removeFavorite(consumerId, productId) {
	const consumer = await Consumer.findById(consumerId);
	if (!consumer) {
		throw new Error("Consommateur non trouvé");
	}

	if (!consumer.favorites) {
		throw new Error("Aucun produit favori trouvé");
	}

	// Retirer le produit des favoris
	consumer.favorites = consumer.favorites.filter(
		(fav) => fav.product.toString() !== productId.toString()
	);

	await consumer.save();
}

module.exports = {
	getFavoriteProducers,
	addFavorite,
	removeFavorite,
};
