const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const consumerReviewService = require('../../services/consumer/consumerReviewService');

// Avis et évaluations
exports.getMyReviews = catchAsync(async (req, res, next) => {
  try {
    const reviews = await consumerReviewService.getConsumerReviews(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { reviews }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.createReview = catchAsync(async (req, res, next) => {
  try {
    const review = await consumerReviewService.createReview(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      data: { review }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.getMyReview = catchAsync(async (req, res, next) => {
  try {
    const review = await consumerReviewService.getConsumerReviewById(req.user.id, req.params.reviewId);
    res.status(200).json({
      status: 'success',
      data: { review }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateMyReview = catchAsync(async (req, res, next) => {
  try {
    const review = await consumerReviewService.updateConsumerReview(req.user.id, req.params.reviewId, req.body);
    res.status(200).json({
      status: 'success',
      data: { review }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.deleteMyReview = catchAsync(async (req, res, next) => {
  try {
    await consumerReviewService.deleteConsumerReview(req.user.id, req.params.reviewId);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

