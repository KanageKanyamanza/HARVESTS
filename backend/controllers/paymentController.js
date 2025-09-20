const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const crypto = require('crypto');

// ROUTES PROTÉGÉES

// Initier un paiement
exports.initiatePayment = catchAsync(async (req, res, next) => {
  const { orderId, method, provider, returnUrl } = req.body;

  // Vérifier la commande
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  // Vérifier que l'utilisateur est l'acheteur
  if (order.buyer.toString() !== req.user.id) {
    return next(new AppError('Vous ne pouvez payer que vos propres commandes', 403));
  }

  // Vérifier que la commande peut être payée
  if (order.payment.status === 'completed') {
    return next(new AppError('Cette commande a déjà été payée', 400));
  }

  if (!['pending', 'failed'].includes(order.status)) {
    return next(new AppError('Cette commande ne peut plus être payée', 400));
  }

  // Créer l'enregistrement de paiement
  const payment = await Payment.create({
    order: orderId,
    user: req.user.id,
    amount: order.total,
    currency: order.currency,
    method,
    provider,
    type: 'payment',
    metadata: {
      customerIp: req.ip,
      userAgent: req.get('User-Agent')
    }
  });

  // Calculer les frais
  payment.calculateFees();
  await payment.save();

  // Traitement selon la méthode de paiement
  let paymentResponse;

  switch (method) {
    case 'mobile-money':
      paymentResponse = await processMobileMoneyPayment(payment, req.body);
      break;
    case 'card':
      paymentResponse = await processCardPayment(payment, req.body, returnUrl);
      break;
    case 'bank-transfer':
      paymentResponse = await processBankTransferPayment(payment, req.body);
      break;
    case 'crypto':
      paymentResponse = await processCryptoPayment(payment, req.body);
      break;
    default:
      return next(new AppError('Méthode de paiement non supportée', 400));
  }

  res.status(201).json({
    status: 'success',
    data: {
      payment: {
        id: payment.paymentId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method
      },
      ...paymentResponse
    }
  });
});

// Confirmer un paiement
exports.confirmPayment = catchAsync(async (req, res, next) => {
  const { transactionId, confirmationCode } = req.body;

  const payment = await Payment.findOne({
    paymentId: req.params.id,
    user: req.user.id
  });

  if (!payment) {
    return next(new AppError('Paiement non trouvé', 404));
  }

  if (payment.status !== 'processing') {
    return next(new AppError('Ce paiement ne peut pas être confirmé', 400));
  }

  try {
    // Vérifier avec le fournisseur de paiement
    const isValid = await verifyPaymentWithProvider(payment, transactionId, confirmationCode);
    
    if (isValid) {
      await payment.markAsSucceeded(transactionId);
      
      // Notifier l'utilisateur
      await Notification.createNotification({
        recipient: payment.user,
        type: 'payment_received',
        category: 'payment',
        title: 'Paiement confirmé',
        message: `Votre paiement de ${payment.amount} ${payment.currency} a été confirmé`,
        data: {
          paymentId: payment.paymentId,
          amount: payment.amount,
          currency: payment.currency
        },
        channels: {
          inApp: { enabled: true },
          email: { enabled: true },
          push: { enabled: true }
        }
      });

    } else {
      await payment.markAsFailed('invalid_confirmation', 'Code de confirmation invalide');
    }

  } catch (error) {
    await payment.markAsFailed('verification_error', error.message);
    return next(new AppError('Erreur lors de la vérification du paiement', 500));
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
  const signature = req.headers['x-webhook-signature'] || req.headers['stripe-signature'];
  const payload = req.body;

  // Vérifier la signature du webhook
  if (!verifyWebhookSignature(signature, payload, req.headers['x-provider'])) {
    return next(new AppError('Signature de webhook invalide', 401));
  }

  const { provider, event, data } = payload;

  switch (provider) {
    case 'stripe':
      await handleStripeWebhook(event, data);
      break;
    case 'flutterwave':
      await handleFlutterwaveWebhook(event, data);
      break;
    case 'orange-money':
      await handleOrangeMoneyWebhook(event, data);
      break;
    case 'mtn-momo':
      await handleMTNMomoWebhook(event, data);
      break;
    default:
      return next(new AppError('Fournisseur de webhook non supporté', 400));
  }

  res.status(200).json({
    status: 'success',
    message: 'Webhook traité'
  });
});

// FONCTIONS UTILITAIRES

// Traitement Mobile Money
async function processMobileMoneyPayment(payment, paymentData) {
  const { phoneNumber, provider } = paymentData;

  // Mise à jour des détails de paiement
  payment.paymentDetails.mobileMoney = {
    provider,
    phoneNumber,
    fees: calculateMobileMoneyFees(payment.amount, provider)
  };

  payment.status = 'processing';
  await payment.save();

  // Intégration avec l'API du fournisseur
  try {
    const result = await initiateMobileMoneyPayment(payment, phoneNumber, provider);
    
    return {
      requiresConfirmation: true,
      confirmationMethod: 'ussd',
      instructions: `Composez *126# et suivez les instructions pour confirmer le paiement de ${payment.amount} ${payment.currency}`,
      transactionId: result.transactionId
    };
  } catch (error) {
    await payment.markAsFailed('provider_error', error.message);
    throw error;
  }
}

// Traitement par carte
async function processCardPayment(payment, paymentData, returnUrl) {
  // Intégration avec Stripe ou autre processeur de cartes
  payment.status = 'processing';
  await payment.save();

  // Simulation - en réalité, on utiliserait l'API Stripe
  return {
    requiresAction: false,
    clientSecret: `pi_${payment.paymentId}_secret`,
    redirectUrl: returnUrl
  };
}

// Traitement virement bancaire
async function processBankTransferPayment(payment, paymentData) {
  payment.paymentDetails.bankTransfer = paymentData;
  payment.status = 'processing';
  await payment.save();

  return {
    requiresConfirmation: true,
    bankDetails: {
      accountName: 'Harvests SARL',
      accountNumber: '1234567890',
      bankName: 'Afriland First Bank',
      reference: payment.paymentId
    },
    instructions: 'Effectuez le virement avec la référence fournie et envoyez-nous le reçu.'
  };
}

// Traitement crypto
async function processCryptoPayment(payment, paymentData) {
  const { currency } = paymentData;
  
  // Générer une adresse de wallet temporaire
  const walletAddress = generateCryptoAddress(currency);
  
  payment.paymentDetails.crypto = {
    currency,
    walletAddress
  };
  payment.status = 'processing';
  await payment.save();

  return {
    walletAddress,
    amount: convertToCrypto(payment.amount, payment.currency, currency),
    currency,
    qrCode: `data:image/png;base64,${generateQRCode(walletAddress)}`,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
  };
}

// Vérification avec les fournisseurs
async function verifyPaymentWithProvider(payment, transactionId, confirmationCode) {
  switch (payment.provider) {
    case 'orange-money':
      return verifyOrangeMoneyPayment(transactionId, confirmationCode);
    case 'mtn-momo':
      return verifyMTNMomoPayment(transactionId, confirmationCode);
    case 'stripe':
      return verifyStripePayment(transactionId);
    default:
      return true; // Simulation
  }
}

// Vérification des signatures de webhook
function verifyWebhookSignature(signature, payload, provider) {
  const secret = process.env[`${provider.toUpperCase()}_WEBHOOK_SECRET`];
  if (!secret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return signature === `sha256=${expectedSignature}`;
}

// Gestionnaires de webhooks
async function handleStripeWebhook(event, data) {
  const payment = await Payment.findOne({ externalId: data.id });
  if (!payment) return;

  switch (event) {
    case 'payment_intent.succeeded':
      await payment.markAsSucceeded(data.id);
      break;
    case 'payment_intent.payment_failed':
      await payment.markAsFailed(data.last_payment_error?.code, data.last_payment_error?.message);
      break;
  }
}

async function handleFlutterwaveWebhook(event, data) {
  // Implémentation Flutterwave
}

async function handleOrangeMoneyWebhook(event, data) {
  // Implémentation Orange Money
}

async function handleMTNMomoWebhook(event, data) {
  // Implémentation MTN Mobile Money
}

// Fonctions utilitaires
function calculateMobileMoneyFees(amount, provider) {
  const feeRates = {
    'orange-money': 0.02, // 2%
    'mtn-momo': 0.025,    // 2.5%
    'express-union': 0.03, // 3%
    'wave': 0.01          // 1%
  };

  return Math.round(amount * (feeRates[provider] || 0.02));
}

async function initiateMobileMoneyPayment(payment, phoneNumber, provider) {
  // Simulation - en réalité, on appellerait l'API du fournisseur
  return {
    transactionId: `${provider}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    status: 'pending'
  };
}

function generateCryptoAddress(currency) {
  // Simulation - en réalité, on utiliserait un service de wallet
  const addresses = {
    'BTC': '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
    'ETH': '0x742d35Cc6634C0532925a3b8D87C3C94C3f5d9C2',
    'USDC': '0x742d35Cc6634C0532925a3b8D87C3C94C3f5d9C2',
    'USDT': '0x742d35Cc6634C0532925a3b8D87C3C94C3f5d9C2'
  };
  
  return addresses[currency] || addresses['BTC'];
}

function convertToCrypto(amount, fromCurrency, toCurrency) {
  // Simulation - en réalité, on utiliserait une API de taux de change
  const rates = {
    'BTC': 0.000023, // 1 XAF = 0.000023 BTC
    'ETH': 0.00035,  // 1 XAF = 0.00035 ETH
    'USDC': 0.0017,  // 1 XAF = 0.0017 USDC
    'USDT': 0.0017   // 1 XAF = 0.0017 USDT
  };

  return amount * (rates[toCurrency] || 1);
}

function generateQRCode(data) {
  // Simulation - en réalité, on utiliserait une librairie QR code
  return Buffer.from(data).toString('base64');
}

// Fonctions de vérification des fournisseurs (simulations)
async function verifyOrangeMoneyPayment(transactionId, confirmationCode) {
  // Appel API Orange Money
  return true; // Simulation
}

async function verifyMTNMomoPayment(transactionId, confirmationCode) {
  // Appel API MTN Mobile Money
  return true; // Simulation
}

async function verifyStripePayment(transactionId) {
  // Appel API Stripe
  return true; // Simulation
}

module.exports = exports;
