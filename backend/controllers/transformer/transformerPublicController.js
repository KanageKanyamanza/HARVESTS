const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const transformerSearchService = require('../../services/transformer/transformerSearchService');

// ROUTES PUBLIQUES
exports.getAllTransformers = catchAsync(async (req, res, next) => {
  try {
    const result = await transformerSearchService.getAllTransformers(req.query);
    res.status(200).json({
      status: 'success',
      results: result.transformers.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: { transformers: result.transformers }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.searchTransformers = catchAsync(async (req, res, next) => {
  try {
    const transformers = await transformerSearchService.searchTransformers(req.query);
    res.status(200).json({
      status: 'success',
      results: transformers.length,
      data: { transformers }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getTransformersByRegion = catchAsync(async (req, res, next) => {
  try {
    const transformers = await transformerSearchService.getTransformersByRegion(req.params.region);
    res.status(200).json({
      status: 'success',
      results: transformers.length,
      data: { transformers }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getTransformersByType = catchAsync(async (req, res, next) => {
  try {
    const transformers = await transformerSearchService.getTransformersByType(req.params.type);
    res.status(200).json({
      status: 'success',
      results: transformers.length,
      data: { transformers }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getTransformer = catchAsync(async (req, res, next) => {
  try {
    const transformer = await transformerSearchService.getTransformer(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { transformer }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getPublicTransformer = catchAsync(async (req, res, next) => {
  try {
    const transformer = await transformerSearchService.getPublicTransformer(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { transformer }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getTransformerServices = catchAsync(async (req, res, next) => {
  try {
    const result = await transformerSearchService.getTransformerServices(req.params.id);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getTransformerReviews = catchAsync(async (req, res, next) => {
  try {
    const reviews = await transformerSearchService.getTransformerReviews(req.params.id);
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: { reviews }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

