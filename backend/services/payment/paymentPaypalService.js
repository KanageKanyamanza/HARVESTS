const mongoose = require('mongoose');
const Payment = require('../../models/Payment');
const Order = require('../../models/Order');
const Subscription = require('../../models/Subscription');
const paypalService = require('../paypalService');

/**
 * Service pour les opérations PayPal spécifiques
 */

/**
 * Générer un token client PayPal
 */
async function generatePaypalClientToken(customerId) {
  const clientToken = await paypalService.generateClientToken({
    customerId
  });

  if (!clientToken) {
    throw new Error('payment.paypal_token_failed');
  }

  return clientToken;
}

/**
 * Créer un ordre PayPal pour les Hosted Fields (souscription)
 */
async function createPaypalOrderForSubscription(userId, { planId, billingPeriod, amount, currency, customerIp, userAgent }) {
  const plans = Subscription.getAvailablePlans();
  const plan = plans[planId];

  if (!plan) {
    throw new Error('payment.invalid_plan');
  }

  const expectedAmount = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  
  if (amount !== expectedAmount) {
    throw new Error('payment.incorrect_amount');
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
      paymentMethod: 'paypal',
      status: 'pending',
      paymentStatus: 'pending'
    });
  }

  // Créer le paiement
  const payment = await Payment.create({
    paymentId: new mongoose.Types.ObjectId().toString(),
    user: userId,
    amount: expectedAmount,
    currency: currency || 'XAF',
    method: 'paypal',
    provider: 'paypal',
    type: 'subscription',
    status: 'processing',
    metadata: {
      subscriptionId: subscription._id.toString(),
      planId,
      billingPeriod,
      customerIp,
      userAgent,
      hostedFields: true
    }
  });

  // Lier le paiement à la souscription
  subscription.payment = payment._id;
  await subscription.save();

  // Créer l'ordre PayPal SANS return_url ni cancel_url
  const paypalOrder = await paypalService.createOrderForHostedFields({
    amount: payment.amount,
    currency: payment.currency,
    reference: payment.paymentId
  });

  payment.paymentDetails.paypal = {
    orderId: paypalOrder.id,
    status: paypalOrder.status
  };
  await payment.save();

  return {
    paypalOrderId: paypalOrder.id,
    paymentId: payment.paymentId,
    subscriptionId: subscription._id.toString()
  };
}

/**
 * Créer un ordre PayPal pour les Hosted Fields (commande)
 */
async function createPaypalOrderForOrder(userId, orderId, { customerIp, userAgent }) {
  if (!orderId) {
    throw new Error('payment.order_id_required');
  }

  const order = await Order.findById(orderId);
  
  if (!order) {
    throw new Error('order.not_found');
  }

  if (order.buyer.toString() !== userId) {
    throw new Error('payment.own_orders_only');
  }

  if (order.payment.status === 'completed') {
    throw new Error('payment.order_already_paid');
  }

  // Vérifier si un paiement existe déjà pour cette commande
  let payment = await Payment.findOne({
    'metadata.orderId': orderId,
    user: userId,
    type: 'order',
    status: { $in: ['pending', 'processing'] }
  });

  if (!payment) {
    // Créer un nouveau paiement
    payment = await Payment.create({
      paymentId: new mongoose.Types.ObjectId().toString(),
      user: userId,
      amount: order.total,
      currency: order.currency || 'XAF',
      method: 'paypal',
      provider: 'paypal',
      type: 'order',
      status: 'processing',
      metadata: {
        orderId: orderId,
        customerIp,
        userAgent,
        hostedFields: true
      }
    });
  }

  // Créer l'ordre PayPal SANS return_url ni cancel_url
  const paypalOrder = await paypalService.createOrderForHostedFields({
    amount: payment.amount,
    currency: payment.currency,
    reference: payment.paymentId
  });

  payment.paymentDetails.paypal = {
    orderId: paypalOrder.id,
    status: paypalOrder.status
  };
  await payment.save();

  return {
    paypalOrderId: paypalOrder.id,
    paymentId: payment.paymentId,
    orderId: orderId
  };
}

module.exports = {
  generatePaypalClientToken,
  createPaypalOrderForSubscription,
  createPaypalOrderForOrder
};

