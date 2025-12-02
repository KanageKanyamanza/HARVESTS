const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const paymentWebhookService = require('../../services/payment/paymentWebhookService');

// Webhook pour les fournisseurs de paiement
exports.handlePaymentWebhook = catchAsync(async (req, res, next) => {
  try {
    await paymentWebhookService.handlePayPalWebhook(req.headers, req.body);

    res.status(200).json({
      status: 'success',
      message: 'Webhook PayPal traité'
    });
  } catch (error) {
    return next(new AppError(error.message, 401));
  }
});
