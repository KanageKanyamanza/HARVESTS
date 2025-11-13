const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const paypalService = require('../services/paypalService');

const appendParamsToUrl = (url, params = {}) => {
  if (!url) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        parsedUrl.searchParams.set(key, value);
      }
    });
    return parsedUrl.toString();
  } catch (error) {
    return url;
  }
};

// ROUTES PROTÉGÉES

exports.getPaypalClientToken = catchAsync(async (req, res, next) => {
  const customerId = req.user?.paypalCustomerId || req.user?.paypalPayerId || null;

  const clientToken = await paypalService.generateClientToken({
    customerId
  });

  if (!clientToken) {
    return next(new AppError('Impossible de générer un token client PayPal', 502));
  }

  res.status(200).json({
    status: 'success',
    data: {
      clientToken
    }
  });
});

// Initier un paiement
exports.initiatePayment = catchAsync(async (req, res, next) => {
  const { orderId, method, returnUrl, cancelUrl, cashInstructions, type, planId, billingPeriod, amount, currency } = req.body;

  if (!['cash', 'paypal'].includes(method)) {
    return next(new AppError('Méthode de paiement non supportée', 400));
  }

  // Gestion des paiements de souscription
  if (type === 'subscription') {
    const Subscription = require('../models/Subscription');
    const plans = Subscription.getAvailablePlans();
    const plan = plans[planId];

    if (!plan) {
      return next(new AppError('Plan invalide', 400));
    }

    const expectedAmount = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
    
    if (amount !== expectedAmount) {
      return next(new AppError('Montant incorrect', 400));
    }

    // Vérifier si l'utilisateur a déjà une souscription active
    const existingActive = await Subscription.findOne({
      user: req.user.id,
      status: 'active'
    });

    if (existingActive && planId !== 'gratuit') {
      return next(new AppError('Vous avez déjà une souscription active', 400));
    }

    // Créer ou trouver la souscription
    let subscription = await Subscription.findOne({
      user: req.user.id,
      planId,
      status: 'pending'
    }).sort({ createdAt: -1 });

    if (!subscription) {
      subscription = await Subscription.create({
        user: req.user.id,
        planId,
        planName: plan.name,
        billingPeriod,
        amount: expectedAmount,
        currency: currency || 'XAF',
        paymentMethod: method,
        status: 'pending',
        paymentStatus: 'pending'
      });
    }

    const normalizedProvider = method === 'paypal' ? 'paypal' : 'cash-on-delivery';

    const payment = await Payment.create({
      paymentId: new mongoose.Types.ObjectId().toString(),
      user: req.user.id,
      amount: expectedAmount,
      currency: currency || 'XAF',
      method,
      provider: normalizedProvider,
      type: 'subscription',
      status: method === 'paypal' ? 'processing' : 'pending',
      metadata: {
        subscriptionId: subscription._id.toString(),
        planId,
        billingPeriod,
        customerIp: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    // Lier le paiement à la souscription
    subscription.payment = payment._id;
    await subscription.save();

    let paymentResponse;
    const enhancedReturnUrl = appendParamsToUrl(returnUrl, {
      subscriptionId: subscription._id.toString(),
      paymentId: payment.paymentId,
      planId
    });
    const enhancedCancelUrl = appendParamsToUrl(cancelUrl, {
      subscriptionId: subscription._id.toString(),
      paymentId: payment.paymentId,
      planId
    });

    if (method === 'cash') {
      payment.paymentDetails.cash = {
        ...(payment.paymentDetails.cash || {}),
        instructions: 'Vous serez contacté pour finaliser le paiement de votre souscription.'
      };
      payment.calculateFees();
      await payment.save();

      paymentResponse = {
        requiresOnlineAction: false,
        confirmationType: 'delivery',
        instructions: payment.paymentDetails.cash.instructions,
        subscriptionId: subscription._id.toString()
      };
    } else {
      try {
        const paypalOrder = await paypalService.createOrder({
          amount: payment.amount,
          currency: payment.currency,
          reference: payment.paymentId,
          returnUrl: enhancedReturnUrl || returnUrl,
          cancelUrl: enhancedCancelUrl || cancelUrl
        });

        payment.paymentDetails.paypal = {
          orderId: paypalOrder.id,
          status: paypalOrder.status,
          approvalUrl: paypalOrder.approvalUrl
        };
        await payment.save();

        paymentResponse = {
          requiresOnlineAction: true,
          approvalUrl: paypalOrder.approvalUrl,
          paypalOrderId: paypalOrder.id,
          paymentId: payment.paymentId,
          subscriptionId: subscription._id.toString()
        };
      } catch (error) {
        await Payment.findByIdAndDelete(payment._id);
        await Subscription.findByIdAndDelete(subscription._id);
        return next(new AppError(`Erreur PayPal: ${error.message}`, 500));
      }
    }

    return res.status(200).json({
      status: 'success',
      data: paymentResponse
    });
  }

  // Gestion des paiements de commande (code existant)
  if (!orderId) {
    return next(new AppError('ID de commande ou type de paiement requis', 400));
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  if (order.buyer.toString() !== req.user.id) {
    return next(new AppError('Vous ne pouvez payer que vos propres commandes', 403));
  }

  if (order.payment.status === 'completed') {
    return next(new AppError('Cette commande a déjà été payée', 400));
  }

  if (!['pending', 'failed'].includes(order.status)) {
    return next(new AppError('Cette commande ne peut plus être payée', 400));
  }

  const normalizedProvider = method === 'paypal' ? 'paypal' : 'cash-on-delivery';

  const payment = await Payment.create({
    paymentId: new mongoose.Types.ObjectId().toString(),
    order: orderId,
    user: req.user.id,
    amount: order.total,
    currency: order.currency,
    method,
    provider: normalizedProvider,
    type: 'payment',
    status: method === 'paypal' ? 'processing' : 'pending',
    metadata: {
      customerIp: req.ip,
      userAgent: req.get('User-Agent')
    }
  });

  let paymentResponse;
  const enhancedReturnUrl = appendParamsToUrl(returnUrl, {
    orderId: orderId?.toString?.() || order._id?.toString(),
    paymentId: payment.paymentId
  });
  const enhancedCancelUrl = appendParamsToUrl(cancelUrl, {
    orderId: orderId?.toString?.() || order._id?.toString(),
    paymentId: payment.paymentId
  });

  if (method === 'cash') {
    payment.paymentDetails.cash = {
      ...(payment.paymentDetails.cash || {}),
      instructions: cashInstructions || 'Préparez le montant exact à régler auprès du livreur lors de la livraison.'
    };

    payment.calculateFees();
    await payment.save();

    paymentResponse = {
      requiresOnlineAction: false,
      confirmationType: 'delivery',
      instructions: payment.paymentDetails.cash.instructions
    };
  } else {
    try {
      const paypalOrder = await paypalService.createOrder({
        amount: payment.amount,
        currency: payment.currency,
        reference: payment.paymentId,
        returnUrl: enhancedReturnUrl || returnUrl,
        cancelUrl: enhancedCancelUrl || cancelUrl
      });

      payment.paymentDetails.paypal = {
        orderId: paypalOrder.id,
        status: paypalOrder.status,
        rawResponse: paypalOrder.raw
      };

      payment.originalAmount = Number(paypalOrder.originalAmount || payment.amount);
      payment.originalCurrency = paypalOrder.originalCurrency || payment.currency;

      // Mettre à jour la devise si différente de celle de la commande
      if (paypalOrder.currency && paypalOrder.currency !== payment.currency) {
        payment.currency = paypalOrder.currency;
        payment.amount = Number(paypalOrder.amount);
      }

      if (paypalOrder.exchangeRate && paypalOrder.exchangeRate !== 1) {
        payment.metadata = {
          ...payment.metadata,
          exchangeRate: paypalOrder.exchangeRate
        };
      }

      payment.calculateFees();
      await payment.save();

      paymentResponse = {
        requiresOnlineAction: true,
        approvalUrl: paypalOrder.approvalUrl,
        paypalOrderId: paypalOrder.id
      };
    } catch (error) {
      await payment.markAsFailed('paypal_error', error.message);
      return next(new AppError(`Erreur PayPal: ${error.message}`, 400));
    }
  }

  res.status(201).json({
    status: 'success',
    data: {
      payment: {
        id: payment.paymentId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        provider: payment.provider
      },
      ...paymentResponse
    }
  });
});

// Confirmer un paiement
exports.confirmPayment = catchAsync(async (req, res, next) => {
  const { paypalOrderId, confirmationNotes } = req.body;

  const payment = await Payment.findOne({
    paymentId: req.params.id,
    user: req.user.id
  });

  if (!payment) {
    return next(new AppError('Paiement non trouvé', 404));
  }

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

  if (payment.method === 'paypal') {
    if (!paypalOrderId) {
      return next(new AppError('Identifiant de commande PayPal manquant', 400));
  }

  try {
      const capture = await paypalService.captureOrder(paypalOrderId);

      payment.paymentDetails.paypal = {
        ...(payment.paymentDetails.paypal || {}),
        orderId: paypalOrderId,
        captureId: capture.purchase_units?.[0]?.payments?.captures?.[0]?.id || capture.id,
        status: capture.status,
        payerEmail: capture.payer?.email_address,
        payerName: [capture.payer?.name?.given_name, capture.payer?.name?.surname].filter(Boolean).join(' ') || undefined,
        rawResponse: capture
      };

      const captureId = payment.paymentDetails.paypal.captureId;
      await payment.markAsSucceeded(captureId, capture.update_time ? new Date(capture.update_time) : new Date());

      // Si c'est un paiement de souscription, activer la souscription
      if (payment.type === 'subscription' && payment.metadata?.subscriptionId) {
        const Subscription = require('../models/Subscription');
        const subscription = await Subscription.findById(payment.metadata.subscriptionId);
        
        if (subscription) {
          subscription.status = 'active';
          subscription.paymentStatus = 'completed';
          subscription.startDate = new Date();
          subscription.endDate = subscription.calculateEndDate();
          subscription.nextBillingDate = subscription.calculateNextBillingDate();
          await subscription.save();

          await Notification.createNotification({
            recipient: payment.user,
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
          recipient: payment.user,
          type: 'payment_received',
          category: 'payment',
          title: 'Paiement PayPal confirmé',
          message: `Votre paiement PayPal de ${payment.amount} ${payment.currency} a été confirmé.`,
          data: {
            paymentId: payment.paymentId,
            amount: payment.amount,
            currency: payment.currency,
            provider: payment.provider
          },
          channels: {
            inApp: { enabled: true },
            email: { enabled: true },
            push: { enabled: true }
          }
        });
      }
    } catch (error) {
      await payment.markAsFailed('paypal_capture_error', error.message);
      return next(new AppError(`Erreur lors de la confirmation PayPal: ${error.message}`, 400));
    }

  } else if (payment.method === 'cash') {
    payment.paymentDetails.cash = {
      ...(payment.paymentDetails.cash || {}),
      confirmedBy: req.user.id,
      confirmedAt: new Date(),
      notes: confirmationNotes || undefined
    };

    await payment.markAsSucceeded(null);

    // Si c'est un paiement de souscription, activer la souscription
    if (payment.type === 'subscription' && payment.metadata?.subscriptionId) {
      const Subscription = require('../models/Subscription');
      const subscription = await Subscription.findById(payment.metadata.subscriptionId);
      
      if (subscription) {
        subscription.status = 'active';
        subscription.paymentStatus = 'completed';
        subscription.startDate = new Date();
        subscription.endDate = subscription.calculateEndDate();
        subscription.nextBillingDate = subscription.calculateNextBillingDate();
        await subscription.save();

        await Notification.createNotification({
          recipient: payment.user,
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
        recipient: payment.user,
        type: 'payment_received',
        category: 'payment',
        title: 'Paiement à la livraison confirmé',
        message: `Votre paiement à la livraison pour la commande ${payment.paymentId} est confirmé.`,
        data: {
          paymentId: payment.paymentId,
          amount: payment.amount,
          currency: payment.currency,
          provider: payment.provider
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
        id: payment.paymentId,
        status: payment.status,
        paidAt: payment.paidAt
      }
    }
  });
});

// Obtenir mes paiements
exports.getMyPayments = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const queryObj = { user: req.user.id };

  // Filtres
  if (req.query.status) queryObj.status = req.query.status;
  if (req.query.method) queryObj.method = req.query.method;
  if (req.query.type) queryObj.type = req.query.type;

  const payments = await Payment.find(queryObj)
    .populate('order', 'orderNumber total items')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Payment.countDocuments(queryObj);

  // Statistiques rapides
  const stats = await Payment.aggregate([
    { $match: { user: req.user.id, status: 'succeeded' } },
    {
      $group: {
        _id: null,
        totalPaid: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
        averageTransaction: { $avg: '$amount' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: payments.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    stats: stats[0] || {},
    data: {
      payments
    }
  });
});

// Obtenir un paiement spécifique
exports.getPayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findOne({
    paymentId: req.params.id,
    user: req.user.id
  }).populate('order', 'orderNumber items buyer seller');

  if (!payment) {
    return next(new AppError('Paiement non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      payment
    }
  });
});

// Demander un remboursement
exports.requestRefund = catchAsync(async (req, res, next) => {
  const { reason, amount } = req.body;

  const payment = await Payment.findOne({
    paymentId: req.params.id,
    user: req.user.id
  });

  if (!payment) {
    return next(new AppError('Paiement non trouvé', 404));
  }

  if (!payment.canBeRefunded) {
    return next(new AppError('Ce paiement ne peut pas être remboursé', 400));
  }

  const refundAmount = amount || payment.amount;

  try {
    await payment.createRefund(refundAmount, reason);

    // Notifier les admins
    await Notification.createNotification({
      recipient: 'admin', // Système pour notifier tous les admins
      type: 'refund_requested',
      category: 'payment',
      priority: 'high',
      title: 'Demande de remboursement',
      message: `Demande de remboursement de ${refundAmount} ${payment.currency} pour la commande ${payment.order}`,
      data: {
        paymentId: payment.paymentId,
        amount: refundAmount,
        reason
      },
      channels: {
        inApp: { enabled: true },
        email: { enabled: true }
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Demande de remboursement créée avec succès'
    });

  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// ROUTES VENDEUR

// Obtenir mes revenus (vendeurs)
exports.getMyRevenue = catchAsync(async (req, res, next) => {
  const { period = '30d', groupBy = 'day' } = req.query;
  const periodDays = parseInt(period.replace('d', ''));
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  // Obtenir les commandes du vendeur
  const orders = await Order.find({
    seller: req.user.id,
    status: 'completed',
    completedAt: { $gte: startDate }
  }).select('total subtotal completedAt');

  const orderIds = orders.map(o => o._id);

  // Obtenir les paiements correspondants
  const payments = await Payment.find({
    order: { $in: orderIds },
    status: 'succeeded'
  });

  // Calculer les statistiques
  const totalRevenue = payments.reduce((sum, p) => sum + p.netAmount, 0);
  const totalFees = payments.reduce((sum, p) => sum + p.fees.total, 0);
  const totalTransactions = payments.length;

  // Évolution dans le temps
  const timeline = await Payment.aggregate([
    { 
      $match: { 
        order: { $in: orderIds },
        status: 'succeeded',
        paidAt: { $gte: startDate }
      } 
    },
    {
      $group: {
        _id: {
          year: { $year: '$paidAt' },
          month: { $month: '$paidAt' },
          day: { $dayOfMonth: '$paidAt' }
        },
        revenue: { $sum: '$netAmount' },
        fees: { $sum: '$fees.total' },
        transactions: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      overview: {
        totalRevenue,
        totalFees,
        totalTransactions,
        averageTransaction: totalTransactions > 0 ? totalRevenue / totalTransactions : 0
      },
      timeline,
      period
    }
  });
});

// ROUTES ADMIN

// Obtenir tous les paiements (admin)
exports.getAllPayments = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const queryObj = {};
  
  if (req.query.status) queryObj.status = req.query.status;
  if (req.query.method) queryObj.method = req.query.method;
  if (req.query.provider) queryObj.provider = req.query.provider;
  if (req.query.user) queryObj.user = req.query.user;

  const payments = await Payment.find(queryObj)
    .populate('user', 'firstName lastName email userType')
    .populate('order', 'orderNumber buyer seller')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Payment.countDocuments(queryObj);

  res.status(200).json({
    status: 'success',
    results: payments.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      payments
    }
  });
});

// Traiter un remboursement (admin)
exports.processRefund = catchAsync(async (req, res, next) => {
  const { refundId, status, note } = req.body;

  const payment = await Payment.findOne({
    'refunds.refundId': refundId
  }).populate('user', 'firstName lastName email');

  if (!payment) {
    return next(new AppError('Demande de remboursement non trouvée', 404));
  }

  await payment.processRefund(refundId, status);

  // Notifier l'utilisateur
  const refund = payment.refunds.find(r => r.refundId === refundId);
  
  await Notification.createNotification({
    recipient: payment.user._id,
    type: status === 'succeeded' ? 'refund_processed' : 'refund_rejected',
    category: 'payment',
    title: status === 'succeeded' ? 'Remboursement traité' : 'Remboursement rejeté',
    message: status === 'succeeded' 
      ? `Votre remboursement de ${refund.amount} ${payment.currency} a été traité`
      : `Votre demande de remboursement a été rejetée. ${note || ''}`,
    data: {
      paymentId: payment.paymentId,
      refundId,
      amount: refund.amount,
      currency: payment.currency
    },
    channels: {
      inApp: { enabled: true },
      email: { enabled: true }
    }
  });

  res.status(200).json({
    status: 'success',
    message: `Remboursement ${status === 'succeeded' ? 'approuvé' : 'rejeté'}`,
    data: {
      refund
    }
  });
});

// Statistiques des paiements (admin)
exports.getPaymentStats = catchAsync(async (req, res, next) => {
  const { period = '30d', currency = 'XAF' } = req.query;
  const periodDays = parseInt(period.replace('d', ''));
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  // Statistiques générales
  const revenueStats = await Payment.getRevenueStats(startDate, new Date(), currency);
  
  // Statistiques par méthode de paiement
  const methodStats = await Payment.getPaymentMethodStats(startDate, new Date());
  
  // Analyse des échecs
  const failureStats = await Payment.getFailureAnalysis(startDate, new Date());

  // Évolution dans le temps
  const timeline = await Payment.aggregate([
    { 
      $match: { 
        status: 'succeeded',
        currency,
        paidAt: { $gte: startDate, $lte: new Date() }
      } 
    },
    {
      $group: {
        _id: {
          year: { $year: '$paidAt' },
          month: { $month: '$paidAt' },
          day: { $dayOfMonth: '$paidAt' }
        },
        revenue: { $sum: '$amount' },
        fees: { $sum: '$fees.total' },
        transactions: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      overview: revenueStats[0] || {},
      methodBreakdown: methodStats,
      failureAnalysis: failureStats,
      timeline,
      period,
      currency
    }
  });
});

// Réconciliation des paiements (admin)
exports.getUnreconciledPayments = catchAsync(async (req, res, next) => {
  const { olderThanDays = 7 } = req.query;

  const payments = await Payment.getUnreconciledPayments(olderThanDays);

  res.status(200).json({
    status: 'success',
    results: payments.length,
    data: {
      payments
    }
  });
});

exports.reconcilePayment = catchAsync(async (req, res, next) => {
  const { bankStatementRef, discrepancies } = req.body;

  const payment = await Payment.findOne({
    paymentId: req.params.id
  });

  if (!payment) {
    return next(new AppError('Paiement non trouvé', 404));
  }

  await payment.reconcile(req.user.id, bankStatementRef, discrepancies);

  res.status(200).json({
    status: 'success',
    message: 'Paiement réconcilié avec succès'
  });
});

// WEBHOOKS

// Webhook pour les fournisseurs de paiement
exports.handlePaymentWebhook = catchAsync(async (req, res, next) => {
  const isValid = await paypalService.verifyWebhook(req.headers, req.body);

  if (!isValid) {
    return next(new AppError('Signature de webhook invalide', 401));
  }

  const { event_type: eventType, resource } = req.body;

  switch (eventType) {
    case 'PAYMENT.CAPTURE.COMPLETED':
      await handlePayPalCaptureCompleted(resource);
      break;
    case 'PAYMENT.CAPTURE.DENIED':
    case 'PAYMENT.CAPTURE.REFUNDED':
    case 'PAYMENT.CAPTURE.REVERSED':
      await handlePayPalCaptureFailed(resource, eventType);
      break;
    default:
      // Événement non géré, mais signature valide
      break;
  }

  res.status(200).json({
    status: 'success',
    message: 'Webhook PayPal traité'
  });
});

// FONCTIONS UTILITAIRES

async function handlePayPalCaptureCompleted(resource) {
  const captureId = resource.id;
  const orderId = resource.supplementary_data?.related_ids?.order_id;

  const payment = await Payment.findOne({
    $or: [
      { 'paymentDetails.paypal.captureId': captureId },
      { 'paymentDetails.paypal.orderId': orderId }
    ]
  });

  if (!payment || payment.status === 'succeeded') {
    return;
  }

  payment.paymentDetails.paypal = {
    ...(payment.paymentDetails.paypal || {}),
    orderId: orderId || payment.paymentDetails.paypal?.orderId,
    captureId,
    status: resource.status,
    payerEmail: resource.payer?.email_address || payment.paymentDetails.paypal?.payerEmail,
    payerName: [resource.payer?.name?.given_name, resource.payer?.name?.surname].filter(Boolean).join(' ') || payment.paymentDetails.paypal?.payerName,
    rawResponse: resource
  };

  await payment.markAsSucceeded(captureId, resource.update_time ? new Date(resource.update_time) : new Date());
}

async function handlePayPalCaptureFailed(resource, eventType) {
  const captureId = resource.id;

  const payment = await Payment.findOne({
    'paymentDetails.paypal.captureId': captureId
  });

  if (!payment) {
    return;
  }

  const failureReason = resource.status_details?.reason || eventType;
  await payment.markAsFailed(eventType.toLowerCase(), failureReason);
}

module.exports = exports;
