const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const productProducerService = require('../../services/product/productProducerService');

// Obtenir mes produits
exports.getMyProducts = catchAsync(async (req, res, next) => {
  try {
    const result = await productProducerService.getProducerProducts(req.user.id, req.query);

    res.status(200).json({
      status: 'success',
      results: result.products.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: {
        products: result.products
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Créer un nouveau produit
exports.createProduct = catchAsync(async (req, res, next) => {
  try {
    const product = await productProducerService.createProduct(req.user.id, req.body);

    res.status(201).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// Obtenir un de mes produits
exports.getMyProduct = catchAsync(async (req, res, next) => {
  try {
    const product = await productProducerService.getProducerProduct(req.params.id, req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Mettre à jour un de mes produits
exports.updateMyProduct = catchAsync(async (req, res, next) => {
  try {
    const product = await productProducerService.updateProducerProduct(req.params.id, req.user.id, req.body);

    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Supprimer un de mes produits
exports.deleteMyProduct = catchAsync(async (req, res, next) => {
  try {
    await productProducerService.deleteProducerProduct(req.params.id, req.user.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Gestion des variantes
exports.addVariant = catchAsync(async (req, res, next) => {
  try {
    const variant = await productProducerService.addVariant(req.params.id, req.user.id, req.body);

    res.status(201).json({
      status: 'success',
      data: {
        variant
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateVariant = catchAsync(async (req, res, next) => {
  try {
    const variant = await productProducerService.updateVariant(req.params.id, req.user.id, req.params.variantId, req.body);

    res.status(200).json({
      status: 'success',
      data: {
        variant
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.deleteVariant = catchAsync(async (req, res, next) => {
  try {
    await productProducerService.deleteVariant(req.params.id, req.user.id, req.params.variantId);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Gestion du stock
exports.updateStock = catchAsync(async (req, res, next) => {
  try {
    const product = await productProducerService.updateStock(req.params.id, req.user.id, req.body);

    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Statistiques de mes produits
exports.getMyProductStats = catchAsync(async (req, res, next) => {
  try {
    const stats = await productProducerService.getProducerProductStats(req.user.id);

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

