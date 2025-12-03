const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const transformerProductService = require('../../services/transformer/transformerProductService');

// Fonctions temporaires pour les fonctionnalités nécessitant d'autres modèles
const temporaryResponse = (message) => catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: `Fonctionnalité en cours de développement - ${message}`,
    data: {}
  });
});

// Produits de la boutique
exports.getMyProducts = catchAsync(async (req, res, next) => {
  try {
    const products = await transformerProductService.getMyProducts(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { products }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getProduct = catchAsync(async (req, res, next) => {
  try {
    const product = await transformerProductService.getProduct(req.params.productId, req.user._id);
    res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.createProduct = catchAsync(async (req, res, next) => {
  if (!req.body.name || !req.body.description || !req.body.category || !req.body.price || req.body.stock === undefined) {
    return next(new AppError('Tous les champs obligatoires doivent être remplis', 400));
  }

  try {
    const product = await transformerProductService.createProduct(req.user._id, req.body);
    res.status(201).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.updateProduct = temporaryResponse('Mise à jour produit');

exports.deleteProduct = catchAsync(async (req, res, next) => {
  try {
    await transformerProductService.deleteProduct(req.params.productId, req.user._id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Soumettre un produit pour révision
exports.submitProductForReview = catchAsync(async (req, res, next) => {
  try {
    const product = await transformerProductService.submitProductForReview(req.params.productId, req.user._id);
    res.status(200).json({
      status: 'success',
      message: 'Produit soumis pour révision avec succès',
      data: { product }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Produits publics (pour la boutique publique)
exports.getPublicProducts = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  if (id === 'me') {
    return next(new AppError('Route non autorisée', 403));
  }
  
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new AppError('ID de transformateur invalide', 400));
  }
  
  try {
    const products = await transformerProductService.getPublicProducts(id);
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: { products }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

