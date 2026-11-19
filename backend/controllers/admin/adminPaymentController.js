const catchAsync = require('../../utils/catchAsync');
const mongoose = require('mongoose');
const Payment = require('../../models/Payment');
const AppError = require('../../utils/appError');
const refundService = require('../../services/payment/paymentRefundAfribapayService');
const paymentAdminService = require('../../services/payment/paymentAdminService');

// Statut HTTP associé à chaque refus métier du remboursement.
const REFUND_ERROR_STATUS = {
  refund_not_found: 404,
  // Relance d'un remboursement confirmé ou ambigu : conflit, pas une saisie
  // invalide (l'administrateur doit vérifier le dashboard AfriBaPay).
  refund_not_retryable: 409,
  refund_conflict: 409,
  afribapay_not_configured: 503
};

// @desc    Obtenir tous les paiements
// @route   GET /api/v1/admin/payments
// @access  Admin
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

// @desc    Obtenir un paiement par ID
// @route   GET /api/v1/admin/payments/:id
// @access  Admin
exports.getPaymentById = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: req.t('admin.feature_in_development'),
    data: { payment: null }
  });
});

// @desc    Mettre à jour le statut d'un paiement
// @route   PATCH /api/v1/admin/payments/:id/status
// @access  Admin
exports.updatePaymentStatus = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: req.t('admin.feature_in_development')
  });
});

// @desc    Rembourser un paiement mobile money (AfriBaPay) ou relancer un
//          remboursement échoué
// @route   POST /api/v1/admin/payments/:id/refund
// @access  Admin
exports.refundPayment = catchAsync(async (req, res, next) => {
  try {
    const { amount, reason, operator, phone, country, refundId } = req.body || {};

    // `:id` est le plus souvent le paymentId métier, mais le back-office
    // manipule aussi l'ObjectId : les deux sont acceptés.
    const payment = mongoose.isValidObjectId(req.params.id)
      ? await Payment.findById(req.params.id)
      : await Payment.findOne({ paymentId: req.params.id });
    if (!payment) {
      return next(new AppError('payment.not_found', 404));
    }

    // Relance d'un essai explicitement échoué (jamais d'un remboursement
    // confirmé ou ambigu : l'argent a peut-être été versé).
    const result = refundId
      ? await refundService.retryRefundManually(payment, refundId, {
          adminId: req.admin?._id,
          adminEmail: req.admin?.email,
          reason
        })
      : await refundService.requestAfribapayRefund(payment, {
          amount,
          reason,
          operator,
          phone,
          country,
          adminId: req.admin?._id
        });

    // Un statut ambigu n'est ni un succès ni un échec : 409 pour forcer
    // l'administrateur à vérifier le dashboard avant toute relance.
    const statusCode = result.outcome === 'ambiguous' ? 409 : 200;
    return res.status(statusCode).json({
      status: result.outcome === 'ambiguous' ? 'fail' : 'success',
      message:
        result.outcome === 'succeeded'
          ? req.t('payment.refunded')
          : result.outcome === 'failed'
            ? req.t('payment.refund_failed')
            : req.t('payment.refund_ambiguous'),
      data: {
        outcome: result.outcome,
        refund: result.refund
      }
    });
  } catch (error) {
    return next(AppError.from(error, REFUND_ERROR_STATUS[error.code] || 400));
  }
});

