const catchAsync = require('../../utils/catchAsync');
const Payment = require('../../models/Payment');
const { findPaymentByIdentifier } = require('../../utils/paymentLookup');
const AppError = require('../../utils/appError');
const refundService = require('../../services/payment/paymentRefundAfribapayService');
const paymentAdminService = require('../../services/payment/paymentAdminService');
const paymentPayoutService = require('../../services/payment/paymentPayoutService');
const afribapayPayinService = require('../../services/payment/paymentAfribapayService');
const { isNotFound } = require('../../utils/translate');

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

// @desc    Obtenir tous les payouts
// @route   GET /api/v1/admin/payouts
// @access  Admin
// Jour 85 : listing des payouts (statuts, tentatives, coûts, float) pour la
// page back-office « paiements et payouts ».
exports.getAllPayouts = catchAsync(async (req, res, next) => {
  try {
    const { status, sellerId, currency, from, to, page, limit } = req.query;
    const result = await paymentPayoutService.listPayouts({ status, sellerId, currency, from, to, page, limit });

    res.status(200).json({
      status: 'success',
      results: result.payouts.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: {
        payouts: result.payouts
      }
    });
  } catch (error) {
    return next(AppError.from(error, 400));
  }
});

exports.getFloatBalances = catchAsync(async (req, res, next) => {
  try {
    const rawCountries = req.query?.countries;
    const countries = Array.isArray(rawCountries)
      ? rawCountries
      : typeof rawCountries === 'string'
        ? rawCountries.split(',').map((code) => code.trim().toUpperCase()).filter(Boolean)
        : undefined;
    const balances = await paymentPayoutService.getFloatBalances(
      countries ? { countries } : {},
    );
    res.status(200).json({
      status: 'success',
      data: { balances }
    });
  } catch (error) {
    return next(AppError.from(error, 400));
  }
});

// @desc    Relancer manuellement un payin mobile money échoué (admin)
// @route   POST /api/v1/admin/payments/:id/retry
// @access  Admin
// Jour 85 (revue) : la route client `/payments/:id/afribapay/retry` est
// scopée par utilisateur et n'accepte que le paymentId métier : un admin
// ne peut pas l'utiliser. Cet endpoint ne filtre pas sur `user` et accepte
// ObjectId ou paymentId. La relance reste déléguée à `retryAfribapayPayin`.
exports.retryAfribapayPayment = catchAsync(async (req, res, next) => {
  try {
    const payment = await findPaymentByIdentifier(req.params.id, {
      findOne: (query) => Payment.findOne(query),
      findById: (id) => Payment.findById(id),
    });
    if (!payment) return next(new AppError('payment.not_found', 404));
    if (payment.method !== 'mobile_money') {
      return next(new AppError('payment.unsupported_method', 400));
    }

    const stored = payment.paymentDetails?.afribapay || {};
    const operator = req.body?.operator || stored.operator;
    const phone = req.body?.phone || stored.phone;
    if (!operator || !phone) {
      return next(new AppError('payment.mobile_money_contact_required', 400));
    }

    const result = await afribapayPayinService.retryAfribapayPayin({
      payment,
      amount: payment.amount,
      currency: payment.currency,
      operator,
      phone,
      country: req.body?.country || stored.country || 'SN',
      returnUrl: req.body?.returnUrl,
      cancelUrl: req.body?.cancelUrl,
    });

    payment.calculateFees();
    await payment.save();
    return res.status(201).json({
      status: 'success',
      data: {
        payment,
        processorStatus: result?.data?.status || result?.status || null
      }
    });
  } catch (error) {
    return next(new AppError(
      error.i18nKey || error.message,
      error.i18nKey ? 400 : isNotFound(error.message) ? 404 : 400,
      error.params
    ));
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
    const payment = await findPaymentByIdentifier(req.params.id, {
      findOne: (query) => Payment.findOne(query),
      findById: (id) => Payment.findById(id),
    });
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

