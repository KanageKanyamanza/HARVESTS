const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { isNotFound } = require('../../utils/translate');
const paymentAdminService = require('../../services/payment/paymentAdminService');
const paymentCostsService = require('../../services/payment/paymentCostsService');

// Obtenir tous les paiements (admin)
exports.getAllPayments = catchAsync(async (req, res, next) => {
  try {
    const result = await paymentAdminService.getAllPayments(req.query);

    res.status(200).json({
      status: 'success',
      results: result.payments.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: {
        payments: result.payments
      }
    });
  } catch (error) {
    return next(AppError.from(error, 400));
  }
});

// Statistiques des paiements (admin)
exports.getPaymentStats = catchAsync(async (req, res, next) => {
  try {
    const result = await paymentAdminService.getPaymentStats(req.query);

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return next(AppError.from(error, 400));
  }
});

// Réconciliation des paiements (admin)
exports.getUnreconciledPayments = catchAsync(async (req, res, next) => {
  try {
    const { olderThanDays = 7 } = req.query;
    const payments = await paymentAdminService.getUnreconciledPayments(olderThanDays);

    res.status(200).json({
      status: 'success',
      results: payments.length,
      data: {
        payments
      }
    });
  } catch (error) {
    return next(AppError.from(error, 400));
  }
});

exports.reconcilePayment = catchAsync(async (req, res, next) => {
  try {
    await paymentAdminService.reconcilePayment(req.params.id, req.user.id, req.body);

    res.status(200).json({
      status: 'success',
      message: 'Paiement réconcilié avec succès'
    });
  } catch (error) {
    return next(AppError.from(error, isNotFound(error.message) ? 404 : 400));
  }
});

// Coûts réels AfriBaPay d'une période, par devise (Jour 84) : payin,
// reversements vendeurs et remboursements clients, avec les montants
// effectivement prélevés par l'agrégateur. Alimente le back-office du Jour 85.
exports.getProviderCosts = catchAsync(async (req, res, next) => {
  try {
    const { period = '30d', from, to, currency } = req.query;
    const result = await paymentCostsService.getProviderCostStats({ period, from, to, currency });

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    // Paramètres refusés par le service (devise, dates, période) : message
    // contrôlé, jamais une erreur interne remontée telle quelle.
    if (error instanceof RangeError) return next(new AppError(error.message, 400));
    return next(AppError.from(error, 400));
  }
});
