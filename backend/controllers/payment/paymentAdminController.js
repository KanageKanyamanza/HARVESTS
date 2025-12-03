const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const paymentAdminService = require('../../services/payment/paymentAdminService');

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
    return next(new AppError(error.message, 400));
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
    return next(new AppError(error.message, 400));
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
    return next(new AppError(error.message, 400));
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
    return next(new AppError(error.message, error.message.includes('non trouvé') ? 404 : 400));
  }
});
