const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const transformerReviewService = require('../../services/transformer/transformerReviewService');

// Fonctions temporaires
const temporaryResponse = (featureKey) => catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: req.t('common.feature_in_development', { feature: req.t(featureKey) }),
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
    return next(AppError.from(error, 404));
  }
});

exports.respondToReview = temporaryResponse('review.response_feature');

// Marquer un avis comme lu
exports.markReviewAsRead = catchAsync(async (req, res, next) => {
  try {
    const review = await transformerReviewService.markReviewAsRead(req.params.reviewId, req.user._id);
    res.status(200).json({
      status: 'success',
      message: req.t('review.marked_read'),
      data: { review }
    });
  } catch (error) {
    return next(AppError.from(error, 404));
  }
});

exports.markAllReviewsAsRead = catchAsync(async (req, res, next) => {
  try {
    await transformerReviewService.markAllReviewsAsRead(req.user._id);
    res.status(200).json({
      status: 'success',
      message: req.t('review.all_marked_read')
    });
  } catch (error) {
    return next(AppError.from(error, 404));
  }
});

