const mongoose = require('mongoose');
const Payment = require('../../models/Payment');
const Order = require('../../models/Order');
const Subscription = require('../../models/Subscription');
const paypalService = require('../paypalService');

/**
 * Service pour la gestion des paiements
 */

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

/**
 * Initier un paiement de souscription
 */
async function initiateSubscriptionPayment(userId, { planId, billingPeriod, amount, currency, method, returnUrl, cancelUrl, customerIp, userAgent }) {
  const plans = Subscription.getAvailablePlans();
  const plan = plans[planId];

  if (!plan) {
    throw new Error('Plan invalide');
  }

  const expectedAmount = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  
  if (amount !== expectedAmount) {
    throw new Error('Montant incorrect');
  }

  // Vérifier si l'utilisateur a déjà une souscription active
  const existingActive = await Subscription.findOne({
    user: userId,
    status: 'active'
  });

  if (existingActive && planId !== 'gratuit') {
    throw new Error('Vous avez déjà une souscription active');
  }

  // Créer ou trouver la souscription
  let subscription = await Subscription.findOne({
    user: userId,
    planId,
    status: 'pending'
  }).sort({ createdAt: -1 });

  if (!subscription) {
    subscription = await Subscription.create({
      user: userId,
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
    user: userId,
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
      customerIp,
      userAgent
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
  }

  return { payment, subscription, paymentResponse };
}

/**
 * Initier un paiement de commande
 */
async function initiateOrderPayment(userId, orderId, { method, returnUrl, cancelUrl, cashInstructions, customerIp, userAgent }) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Commande non trouvée');
  }

  if (order.buyer.toString() !== userId) {
    throw new Error('Vous ne pouvez payer que vos propres commandes');
  }

  if (order.payment.status === 'completed') {
    throw new Error('Cette commande a déjà été payée');
  }

  if (!['pending', 'failed'].includes(order.status)) {
    throw new Error('Cette commande ne peut plus être payée');
  }

  const normalizedProvider = method === 'paypal' ? 'paypal' : 'cash-on-delivery';

  const payment = await Payment.create({
    paymentId: new mongoose.Types.ObjectId().toString(),
    order: orderId,
    user: userId,
    amount: order.total,
    currency: order.currency,
    method,
    provider: normalizedProvider,
    type: 'order',
    status: method === 'paypal' ? 'processing' : 'pending',
    metadata: {
      orderId: orderId?.toString?.() || order._id?.toString(),
      customerIp,
      userAgent
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
  }

  return { payment, paymentResponse };
}

/**
 * Confirmer un paiement PayPal
 */
async function confirmPayPalPayment(paymentId, userId, paypalOrderId) {
  const payment = await Payment.findOne({
    paymentId,
    user: userId
  });

  if (!payment) {
    throw new Error('Paiement non trouvé');
  }

  if (payment.status === 'succeeded') {
    return { payment, alreadySucceeded: true };
  }

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

  return { payment, captureId };
}

/**
 * Confirmer un paiement cash
 */
async function confirmCashPayment(paymentId, userId, confirmationNotes) {
  const payment = await Payment.findOne({
    paymentId,
    user: userId
  });

  if (!payment) {
    throw new Error('Paiement non trouvé');
  }

  payment.paymentDetails.cash = {
    ...(payment.paymentDetails.cash || {}),
    confirmedBy: userId,
    confirmedAt: new Date(),
    notes: confirmationNotes || undefined
  };

  await payment.markAsSucceeded(null);

  return { payment };
}

/**
 * Obtenir les paiements d'un utilisateur
 */
async function getUserPayments(userId, queryParams = {}) {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const queryObj = { user: userId };

  if (queryParams.status) queryObj.status = queryParams.status;
  if (queryParams.method) queryObj.method = queryParams.method;
  if (queryParams.type) queryObj.type = queryParams.type;

  const payments = await Payment.find(queryObj)
    .populate('order', 'orderNumber total items')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Payment.countDocuments(queryObj);

  // Statistiques rapides
  const stats = await Payment.aggregate([
    { $match: { user: userId, status: 'succeeded' } },
    {
      $group: {
        _id: null,
        totalPaid: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
        averageTransaction: { $avg: '$amount' }
      }
    }
  ]);

  return {
    payments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    stats: stats[0] || {}
  };
}

/**
 * Obtenir un paiement spécifique
 */
async function getPaymentById(paymentId, userId) {
  const payment = await Payment.findOne({
    paymentId,
    user: userId
  }).populate('order', 'orderNumber items buyer seller');

  if (!payment) {
    throw new Error('Paiement non trouvé');
  }

  return payment;
}

/**
 * Obtenir les revenus d'un vendeur
 */
async function getSellerRevenue(sellerId, { period = '30d', groupBy = 'day' }) {
  const periodDays = parseInt(period.replace('d', ''));
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  // Obtenir les commandes du vendeur
  const orders = await Order.find({
    seller: sellerId,
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

  return {
    overview: {
      totalRevenue,
      totalFees,
      totalTransactions,
      averageTransaction: totalTransactions > 0 ? totalRevenue / totalTransactions : 0
    },
    timeline,
    period
  };
}

module.exports = {
  initiateSubscriptionPayment,
  initiateOrderPayment,
  confirmPayPalPayment,
  confirmCashPayment,
  getUserPayments,
  getPaymentById,
  getSellerRevenue
};

