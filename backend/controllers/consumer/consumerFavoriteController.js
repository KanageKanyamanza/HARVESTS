const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const consumerFavoriteService = require("../../services/consumer/consumerFavoriteService");

// Gestion des favoris
exports.getFavorites = catchAsync(async (req, res, next) => {
	try {
		const result = await consumerFavoriteService.getFavoriteProducers(
			req.user.id
		);
		// Retourner les produits favoris (le frontend s'attend à un tableau de produits)
		// result est un objet { producers: [], products: [] }
		const favorites =
			result && result.products
				? result.products
				: Array.isArray(result)
				? result
				: [];
		res.status(200).json({
			status: "success",
			data: { favorites },
		});
	} catch (error) {
		// Retourner un tableau vide au lieu d'une erreur 404
		console.error("Erreur dans getFavorites controller:", error.message);
		res.status(200).json({
			status: "success",
			data: { favorites: [] },
		});
	}
});

exports.addFavorite = catchAsync(async (req, res, next) => {
	try {
		const { productId } = req.body;
		if (!productId) {
			return next(new AppError("ID du produit manquant", 400));
		}
		const result = await consumerFavoriteService.addFavorite(
			req.user.id,
			productId
		);

		if (result.alreadyFavorite) {
			// Si déjà favori, retourner un succès mais avec un message différent
			return res.status(200).json({
				status: "success",
				message: "Produit déjà dans vos favoris",
				alreadyFavorite: true,
			});
		}

		res.status(201).json({
			status: "success",
			message: "Ajouté aux favoris",
		});
	} catch (error) {
		return next(new AppError(error.message, 400));
	}
});

exports.removeFavorite = catchAsync(async (req, res, next) => {
	try {
		const productId = req.params.productId || req.params.id;
		if (!productId) {
			return next(new AppError("ID du produit manquant", 400));
		}
		await consumerFavoriteService.removeFavorite(req.user.id, productId);
		res.status(200).json({
			status: "success",
			message: "Retiré des favoris",
		});
	} catch (error) {
		return next(new AppError(error.message, 404));
	}
});

exports.getFavoriteProducers = catchAsync(async (req, res, next) => {
	try {
		const favorites = await consumerFavoriteService.getFavoriteProducers(
			req.user.id
		);
		res.status(200).json({
			status: "success",
			data: { favoriteProducers: favorites },
		});
	} catch (error) {
		return next(new AppError(error.message, 404));
	}
});
