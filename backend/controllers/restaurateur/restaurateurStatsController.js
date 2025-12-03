const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const restaurateurStatsService = require('../../services/restaurateur/restaurateurStatsService');

// Fonction temporaire pour les fonctionnalités en cours de développement
const temporaryResponse = (message) => catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: `Fonctionnalité en cours de développement - ${message}`,
    data: {}
  });
});

// Obtenir mes statistiques
exports.getMyStats = catchAsync(async (req, res, next) => {
  try {
    const stats = await restaurateurStatsService.getMyStats(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Obtenir les statistiques
exports.getStats = catchAsync(async (req, res, next) => {
  try {
    const stats = await restaurateurStatsService.getStats(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Obtenir les analytics de ventes
exports.getSalesAnalytics = catchAsync(async (req, res, next) => {
  try {
    const analytics = await restaurateurStatsService.getSalesAnalytics(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { analytics }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Obtenir les analytics de revenus
exports.getRevenueAnalytics = catchAsync(async (req, res, next) => {
  try {
    const analytics = await restaurateurStatsService.getRevenueAnalytics(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { analytics }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Fonctions temporaires
exports.getPurchaseAnalytics = temporaryResponse('Analytics achats');
exports.getSupplierPerformance = temporaryResponse('Performance fournisseurs');

