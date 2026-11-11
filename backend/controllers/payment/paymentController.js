const Notification = require('../../models/Notification');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { isNotFound } = require('../../utils/translate');
const paymentService = require('../../services/payment/paymentService');
const { listOperatorsForCountry, operatorLabel } = require('../../config/afribapayOperators');
const { resynchronizePayin } = require('../../services/payment/paymentAfribapayStatusService');
const { retryAfribapayPayin } = require('../../services/payment/paymentAfribapayService');

// Statuts pour lesquels un payin n'a plus besoin d'être réinterrogé : le
// /status ne doit jamais rétrograder un paiement confirmé (garde-fou J77/J78).
const CONFIRMED_PAYMENT_STATUSES = ['succeeded', 'refunded', 'partially_refunded'];

// Vue publique d'un Payment mobile money : la page d'attente n'a besoin ni du
// journal d'audit ni des métadonnées internes, et ne reçoit jamais la
// merchant_key (jamais stockée sur le Payment, mais on garde le contrat étroit).
const serializeAfribapayPayment = (payment) => {
  const afribapay = payment.paymentDetails?.afribapay || {};

  return {
    id: payment.paymentId,
    status: payment.status,
    method: payment.method,
    provider: payment.provider,
    amount: payment.amount,
    currency: payment.currency,
    orderId:
      payment.order?._id?.toString?.() ||
      payment.order?.toString?.() ||
      payment.metadata?.orderId ||
      null,
    paidAt: payment.paidAt,
    failureMessage: payment.failureMessage || null,
    afribapay: {
      operator: afribapay.operator || null,
      operatorName: afribapay.operator ? operatorLabel(afribapay.operator) : null,
      phone: afribapay.phone || null,
      country: afribapay.country || null,
      payinOrderId: afribapay.payinOrderId || null,
      attempt: afribapay.attempt || 0,
      processorStatus: afribapay.processorStatus || null,
      lastPolledAt: afribapay.lastPolledAt || null,
      lastPollResult: afribapay.lastPollResult || null
    }
  };
};

// Initier un paiement
exports.initiatePayment = catchAsync(async (req, res, next) => {
  const { orderId, method, returnUrl, cancelUrl, cashInstructions, type, planId, billingPeriod, amount, currency, operator, phone, country } = req.body;

  if (!['cash', 'paypal', 'mobile_money'].includes(method)) {
    return next(new AppError('payment.unsupported_method', 400));
  }

  // Payin AfriBaPay (Jour 76) : les souscriptions restent cash/paypal — le
  // mobile money ne concerne que les commandes client.
  if (method === 'mobile_money') {
    if (type === 'subscription') {
      return next(new AppError('payment.unsupported_method', 400));
    }
    if (!operator || !phone) {
      return next(new AppError('payment.mobile_money_contact_required', 400));
    }
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
        return next(new AppError('payment.order_or_type_required', 400));
      }

      result = await paymentService.initiateOrderPayment(req.user.id, orderId, {
        method,
        returnUrl,
        cancelUrl,
        cashInstructions,
        customerIp: req.ip,
        userAgent: req.get('User-Agent'),
        mobileMoney: method === 'mobile_money' ? { operator, phone, country } : undefined
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
          provider: result.payment.provider,
          afribapay: result.payment.paymentDetails?.afribapay ? {
            payinOrderId: result.payment.paymentDetails.afribapay.payinOrderId,
            attempt: result.payment.paymentDetails.afribapay.attempt,
            transactionId: result.payment.paymentDetails.afribapay.transactionId,
            processorStatus: result.payment.paymentDetails.afribapay.processorStatus
          } : undefined
        },
        ...result.paymentResponse
      }
    });
  } catch (error) {
    return next(AppError.from(error, isNotFound(error.message) ? 404 : 400));
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
        return next(new AppError('payment.paypal_order_id_missing', 400));
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
      return next(new AppError('payment.unsupported_confirm_method', 400));
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
    if (isNotFound(error.message)) {
      return next(AppError.from(error, 404));
    }
    return next(AppError.from(error, 400));
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
    return next(AppError.from(error, 400));
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
    return next(AppError.from(error, 404));
  }
});

// Opérateurs mobile money proposés pour un pays (Jour 79)
exports.getAfribapayOperators = catchAsync(async (req, res) => {
  const country = String(req.query.country || 'SN');

  res.status(200).json({
    status: 'success',
    data: listOperatorsForCountry(country)
  });
});

// Repoll du payin mobile money depuis la page d'attente (Jour 79) : /status est
// la source de vérité (J78) — le webhook peut être perdu ou en retard. Un
// payin confirmé n'est pas réinterrogé ; une erreur AfriBaPay ne casse pas la
// page, on renvoie le dernier état stocké.
exports.getAfribapayStatus = catchAsync(async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id, req.user.id);

    if (payment.method !== 'mobile_money') {
      return next(new AppError('payment.unsupported_method', 400));
    }

    let sync = 'already';
    if (!CONFIRMED_PAYMENT_STATUSES.includes(payment.status)) {
      try {
        sync = await resynchronizePayin({
          payment,
          source: 'afribapay-status-client'
        });
      } catch (error) {
        console.error('[Status AfriBaPay] Repoll client en échec:', error?.message ?? error);
        sync = 'skip';
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        sync,
        payment: serializeAfribapayPayment(payment)
      }
    });
  } catch (error) {
    return next(AppError.from(error, isNotFound(error.message) ? 404 : 400));
  }
});

// Relance le payin mobile money après un échec ou un abandon (Jour 79) : même
// service que les relances admin du Jour 85, order_id unique par tentative
// (`R<paymentId>-p2`, `-p3`… — AfriBaPay refuse la réutilisation).
exports.retryAfribapayPayment = catchAsync(async (req, res, next) => {
  const { operator, phone, country, returnUrl, cancelUrl } = req.body;

  try {
    const payment = await paymentService.getPaymentById(req.params.id, req.user.id);

    if (payment.method !== 'mobile_money') {
      return next(new AppError('payment.unsupported_method', 400));
    }

    const stored = payment.paymentDetails?.afribapay || {};
    const targetOperator = operator || stored.operator;
    const targetPhone = phone || stored.phone;

    if (!targetOperator || !targetPhone) {
      return next(new AppError('payment.mobile_money_contact_required', 400));
    }

    const result = await retryAfribapayPayin({
      payment,
      amount: payment.amount,
      currency: payment.currency,
      operator: targetOperator,
      phone: targetPhone,
      country: country || stored.country || 'SN',
      returnUrl,
      cancelUrl
    });

    payment.calculateFees();
    await payment.save();

    res.status(201).json({
      status: 'success',
      data: {
        payment: serializeAfribapayPayment(payment),
        processorStatus: result?.data?.status || result?.status || null
      }
    });
  } catch (error) {
    return next(new AppError(error.i18nKey || error.message, error.i18nKey ? 400 : isNotFound(error.message) ? 404 : 400));
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
    return next(AppError.from(error, 400));
  }
});
