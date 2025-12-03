const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const transformerStatsService = require('../../services/transformer/transformerStatsService');

// Fonctions temporaires
const temporaryResponse = (message) => catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: `Fonctionnalité en cours de développement - ${message}`,
    data: {}
  });
});

// Statistiques
exports.getBusinessStats = catchAsync(async (req, res, next) => {
  try {
    const stats = await transformerStatsService.getBusinessStats(req.user._id);
    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getProductionAnalytics = catchAsync(async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    const analytics = await transformerStatsService.getProductionAnalytics(req.user._id, period);
    res.status(200).json({
      status: 'success',
      data: analytics
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getEfficiencyMetrics = temporaryResponse('Métriques efficacité');
exports.getRevenueAnalytics = temporaryResponse('Analytics revenus');

