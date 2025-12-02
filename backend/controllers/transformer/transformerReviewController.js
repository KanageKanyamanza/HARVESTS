const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const transformerReviewService = require('../../services/transformer/transformerReviewService');

// Fonctions temporaires
const temporaryResponse = (message) => catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: `Fonctionnalité en cours de développement - ${message}`,
    data: {}
  });
});

// Avis
exports.getMyReviews = catchAsync(async (req, res, next) => {
  try {
    const result = await transformerReviewService.getMyReviews(req.user._id, req.query);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.respondToReview = temporaryResponse('Réponse avis');

// Marquer un avis comme lu
exports.markReviewAsRead = catchAsync(async (req, res, next) => {
  try {
    const review = await transformerReviewService.markReviewAsRead(req.params.reviewId, req.user._id);
    res.status(200).json({
      status: 'success',
      message: 'Avis marqué comme lu',
      data: { review }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.markAllReviewsAsRead = catchAsync(async (req, res, next) => {
  try {
    await transformerReviewService.markAllReviewsAsRead(req.user._id);
    res.status(200).json({
      status: 'success',
      message: 'Tous les avis marqués comme lus'
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

