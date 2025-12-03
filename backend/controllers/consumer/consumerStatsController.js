const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const consumerStatsService = require('../../services/consumer/consumerStatsService');

// Statistiques et analytics
exports.getPurchaseHistory = catchAsync(async (req, res, next) => {
  try {
    const history = await consumerStatsService.getPurchaseHistory(req.user.id, req.query.limit);
    res.status(200).json({
      status: 'success',
      data: { purchaseHistory: history }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getRecommendations = catchAsync(async (req, res, next) => {
  try {
    const recommendations = await consumerStatsService.getRecommendations(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { recommendations }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getMyStats = catchAsync(async (req, res, next) => {
  try {
    const stats = await consumerStatsService.getConsumerStats(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getSpendingAnalytics = catchAsync(async (req, res, next) => {
  try {
    const analytics = await consumerStatsService.getSpendingAnalytics(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { analytics }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

