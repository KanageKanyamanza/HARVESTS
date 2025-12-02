const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const consumerFavoriteService = require('../../services/consumer/consumerFavoriteService');

// Gestion des favoris
exports.getFavorites = catchAsync(async (req, res, next) => {
  try {
    const favorites = await consumerFavoriteService.getFavoriteProducers(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { favorites }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.addFavorite = catchAsync(async (req, res, next) => {
  try {
    await consumerFavoriteService.addFavorite(req.user.id, req.body.producerId || req.body.transformerId, req.body.userType || 'producer');
    res.status(201).json({
      status: 'success',
      message: 'Ajouté aux favoris'
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.removeFavorite = catchAsync(async (req, res, next) => {
  try {
    await consumerFavoriteService.removeFavorite(req.user.id, req.params.producerId || req.params.transformerId, req.query.userType || 'producer');
    res.status(200).json({
      status: 'success',
      message: 'Retiré des favoris'
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getFavoriteProducers = catchAsync(async (req, res, next) => {
  try {
    const favorites = await consumerFavoriteService.getFavoriteProducers(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { favoriteProducers: favorites }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

