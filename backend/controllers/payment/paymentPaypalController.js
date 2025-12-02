const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const paymentPaypalService = require('../../services/payment/paymentPaypalService');

// Obtenir le token client PayPal
exports.getPaypalClientToken = catchAsync(async (req, res, next) => {
  try {
    const customerId = req.user?.paypalCustomerId || req.user?.paypalPayerId || null;
    const clientToken = await paymentPaypalService.generatePaypalClientToken(customerId);

    res.status(200).json({
      status: 'success',
      data: {
        clientToken
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 502));
  }
});

// Créer un ordre PayPal pour les Hosted Fields (sans redirection)
exports.createOrderForHostedFields = catchAsync(async (req, res, next) => {
  const { type, planId, billingPeriod, amount, currency, orderId } = req.body;

  // Vérifier le type de paiement
  if (type !== 'subscription' && type !== 'order') {
    return next(new AppError('Type de paiement non supporté pour les Hosted Fields. Utilisez "subscription" ou "order"', 400));
  }

  try {
    let result;

    if (type === 'subscription') {
      result = await paymentPaypalService.createPaypalOrderForSubscription(
        req.user.id,
        {
          planId,
          billingPeriod,
          amount,
          currency,
          customerIp: req.ip,
          userAgent: req.get('User-Agent')
        }
      );
    } else if (type === 'order') {
      result = await paymentPaypalService.createPaypalOrderForOrder(
        req.user.id,
        orderId,
        {
          customerIp: req.ip,
          userAgent: req.get('User-Agent')
        }
      );
    }

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return next(new AppError(error.message, error.message.includes('non trouv') ? 404 : 500));
  }
});
