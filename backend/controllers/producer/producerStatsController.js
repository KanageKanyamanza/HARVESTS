const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const producerStatsService = require('../../services/producer/producerStatsService');

// Statistiques
exports.getMyStats = catchAsync(async (req, res, next) => {
  try {
    const stats = await producerStatsService.getMyStats(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getStats = catchAsync(async (req, res, next) => {
  try {
    const stats = await producerStatsService.getStats(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getSalesAnalytics = catchAsync(async (req, res, next) => {
  try {
    const analytics = await producerStatsService.getSalesAnalytics(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { analytics }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getRevenueAnalytics = catchAsync(async (req, res, next) => {
  try {
    const analytics = await producerStatsService.getRevenueAnalytics(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { analytics }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

