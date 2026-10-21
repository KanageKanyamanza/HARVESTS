const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { isNotFound } = require('../../utils/translate');
const productAdminService = require('../../services/product/productAdminService');

// Approuver un produit
exports.approveProduct = catchAsync(async (req, res, next) => {
  try {
    const product = await productAdminService.approveProduct(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    return next(AppError.from(error, isNotFound(error.message) ? 404 : 400));
  }
});

// Rejeter un produit
exports.rejectProduct = catchAsync(async (req, res, next) => {
  try {
    const { reason } = req.body;
    const product = await productAdminService.rejectProduct(req.params.id, reason);

    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    return next(AppError.from(error, isNotFound(error.message) ? 404 : 400));
  }
});

// Mettre un produit en vedette
exports.featureProduct = catchAsync(async (req, res, next) => {
  try {
    const product = await productAdminService.featureProduct(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    return next(AppError.from(error, 404));
  }
});

// Retirer un produit de la vedette
exports.unfeatureProduct = catchAsync(async (req, res, next) => {
  try {
    const product = await productAdminService.unfeatureProduct(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    return next(AppError.from(error, 404));
  }
});

// Obtenir les produits en attente de modération
exports.getPendingProducts = catchAsync(async (req, res, next) => {
  try {
    const result = await productAdminService.getPendingProducts(req.query);

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
    return next(AppError.from(error, 404));
  }
});

