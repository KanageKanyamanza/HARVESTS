const Notification = require('../../models/Notification');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const paymentService = require('../../services/payment/paymentService');

// Initier un paiement
exports.initiatePayment = catchAsync(async (req, res, next) => {
  const { orderId, method, returnUrl, cancelUrl, cashInstructions, type, planId, billingPeriod, amount, currency } = req.body;

  if (!['cash', 'paypal'].includes(method)) {
    return next(new AppError('Méthode de paiement non supportée', 400));
  }

  try {
    let result;

    if (type === 'subscription') {
      result = await paymentService.initiateSubscriptionPayment(req.user.id, {
        planId,
        billingPeriod,
        amount,
        currency,
        method,
        returnUrl,
        cancelUrl,
        customerIp: req.ip,
        userAgent: req.get('User-Agent')
      });
    } else {
      if (!orderId) {
        return next(new AppError('ID de commande ou type de paiement requis', 400));
      }

      result = await paymentService.initiateOrderPayment(req.user.id, orderId, {
        method,
        returnUrl,
        cancelUrl,
        cashInstructions,
        customerIp: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.status(201).json({
      status: 'success',
      data: {
        payment: {
          id: result.payment.paymentId,
          status: result.payment.status,
          amount: result.payment.amount,
          currency: result.payment.currency,
          method: result.payment.method,
          provider: result.payment.provider
        },
        ...result.paymentResponse
      }
    });
  } catch (error) {
    return next(new AppError(error.message, error.message.includes('non trouv') ? 404 : 400));
  }
});

// Confirmer un paiement
exports.confirmPayment = catchAsync(async (req, res, next) => {
  const { paypalOrderId, confirmationNotes } = req.body;

  try {
    const payment = await paymentService.getPaymentById(req.params.id, req.user.id);

    if (payment.status === 'succeeded') {
      return res.status(200).json({
        status: 'success',
        data: {
          payment: {
            id: payment.paymentId,
            status: payment.status,
            paidAt: payment.paidAt
          }
        }
      });
    }

    let result;

    if (payment.method === 'paypal') {
      if (!paypalOrderId) {
        return next(new AppError('Identifiant de commande PayPal manquant', 400));
      }

      result = await paymentService.confirmPayPalPayment(req.params.id, req.user.id, paypalOrderId);
      
      if (result.alreadySucceeded) {
        return res.status(200).json({
          status: 'success',
          data: {
            payment: {
              id: result.payment.paymentId,
              status: result.payment.status,
              paidAt: result.payment.paidAt
            }
          }
        });
      }

      // Si c'est un paiement de souscription, activer la souscription
      if (result.payment.type === 'subscription' && result.payment.metadata?.subscriptionId) {
        const Subscription = require('../../models/Subscription');
        const subscription = await Subscription.findById(result.payment.metadata.subscriptionId);
        
        if (subscription) {
          subscription.status = 'active';
          subscription.paymentStatus = 'completed';
          subscription.startDate = new Date();
          subscription.endDate = subscription.calculateEndDate();
          subscription.nextBillingDate = subscription.calculateNextBillingDate();
          await subscription.save();

          await Notification.createNotification({
            recipient: result.payment.user,
            type: 'subscription_activated',
            category: 'subscription',
            title: 'Souscription activée',
            message: `Votre souscription ${subscription.planName} a été activée avec succès!`,
            data: {
              subscriptionId: subscription._id.toString(),
              planId: subscription.planId,
              planName: subscription.planName
            },
            channels: {
              inApp: { enabled: true },
              email: { enabled: true },
              push: { enabled: true }
            }
          });
        }
      } else {
        await Notification.createNotification({
          recipient: result.payment.user,
          type: 'payment_received',
          category: 'payment',
          title: 'Paiement PayPal confirmé',
          message: `Votre paiement PayPal de ${result.payment.amount} ${result.payment.currency} a été confirmé.`,
          data: {
            paymentId: result.payment.paymentId,
            amount: result.payment.amount,
            currency: result.payment.currency,
            provider: result.payment.provider
          },
          channels: {
            inApp: { enabled: true },
            email: { enabled: true },
            push: { enabled: true }
          }
        });
      }
    } else if (payment.method === 'cash') {
      result = await paymentService.confirmCashPayment(req.params.id, req.user.id, confirmationNotes);

      // Si c'est un paiement de souscription, activer la souscription
      if (result.payment.type === 'subscription' && result.payment.metadata?.subscriptionId) {
        const Subscription = require('../../models/Subscription');
        const subscription = await Subscription.findById(result.payment.metadata.subscriptionId);
        
        if (subscription) {
          subscription.status = 'active';
          subscription.paymentStatus = 'completed';
          subscription.startDate = new Date();
          subscription.endDate = subscription.calculateEndDate();
          subscription.nextBillingDate = subscription.calculateNextBillingDate();
          await subscription.save();

          await Notification.createNotification({
            recipient: result.payment.user,
            type: 'subscription_activated',
            category: 'subscription',
            title: 'Souscription activée',
            message: `Votre souscription ${subscription.planName} a été activée avec succès!`,
            data: {
              subscriptionId: subscription._id.toString(),
              planId: subscription.planId,
              planName: subscription.planName
            },
            channels: {
              inApp: { enabled: true },
              email: { enabled: true },
              push: { enabled: true }
            }
          });
        }
      } else {
        await Notification.createNotification({
          recipient: result.payment.user,
          type: 'payment_received',
          category: 'payment',
          title: 'Paiement à la livraison confirmé',
          message: `Votre paiement à la livraison pour la commande ${result.payment.paymentId} est confirmé.`,
          data: {
            paymentId: result.payment.paymentId,
            amount: result.payment.amount,
            currency: result.payment.currency,
            provider: result.payment.provider
          },
          channels: {
            inApp: { enabled: true },
            email: { enabled: true }
          }
        });
      }
    } else {
      return next(new AppError('Méthode de paiement non supportée pour la confirmation', 400));
    }

    res.status(200).json({
      status: 'success',
      data: {
        payment: {
          id: result.payment.paymentId,
          status: result.payment.status,
          paidAt: result.payment.paidAt
        }
      }
    });
  } catch (error) {
    if (error.message.includes('non trouvé')) {
      return next(new AppError(error.message, 404));
    }
    return next(new AppError(`Erreur lors de la confirmation: ${error.message}`, 400));
  }
});

// Obtenir mes paiements
exports.getMyPayments = catchAsync(async (req, res, next) => {
  try {
    const result = await paymentService.getUserPayments(req.user.id, req.query);

    res.status(200).json({
      status: 'success',
      results: result.payments.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      stats: result.stats,
      data: {
        payments: result.payments
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// Obtenir un paiement spécifique
exports.getPayment = catchAsync(async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id, req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        payment
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Obtenir mes revenus (vendeurs)
exports.getMyRevenue = catchAsync(async (req, res, next) => {
  try {
    const result = await paymentService.getSellerRevenue(req.user.id, req.query);

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});
