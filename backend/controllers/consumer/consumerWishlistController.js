const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const consumerWishlistService = require('../../services/consumer/consumerWishlistService');

// Gestion de la wishlist
exports.getWishlist = catchAsync(async (req, res, next) => {
  try {
    const wishlist = await consumerWishlistService.getWishlist(req.user.id);
    res.status(200).json({
      status: 'success',
      results: wishlist.length,
      data: { wishlist }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.addToWishlist = catchAsync(async (req, res, next) => {
  try {
    await consumerWishlistService.addToWishlist(req.user.id, req.body.productId);
    res.status(201).json({
      status: 'success',
      message: 'Produit ajouté à la liste de souhaits'
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.removeFromWishlist = catchAsync(async (req, res, next) => {
  try {
    await consumerWishlistService.removeFromWishlist(req.user.id, req.params.productId);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.toggleWishlistNotifications = catchAsync(async (req, res, next) => {
  try {
    const preferences = await consumerWishlistService.toggleWishlistNotifications(req.user.id, req.body.enabled);
    res.status(200).json({
      status: 'success',
      data: { preferences }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

