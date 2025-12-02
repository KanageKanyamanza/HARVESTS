const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const producerProductService = require('../../services/producer/producerProductService');

// Gestion des produits
exports.getMyProducts = catchAsync(async (req, res, next) => {
  try {
    const products = await producerProductService.getProducts(req.user._id);
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: { products }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.createProduct = catchAsync(async (req, res, next) => {
  try {
    const product = await producerProductService.createProduct(req.user._id, req.body);
    res.status(201).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.getMyProduct = catchAsync(async (req, res, next) => {
  try {
    const product = await producerProductService.getProduct(req.params.productId, req.user._id);
    res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateMyProduct = catchAsync(async (req, res, next) => {
  try {
    const product = await producerProductService.updateProduct(req.params.productId, req.user._id, req.body);
    res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.deleteMyProduct = catchAsync(async (req, res, next) => {
  try {
    await producerProductService.deleteProduct(req.params.productId, req.user._id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

