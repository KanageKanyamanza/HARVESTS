const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Obtenir mes souscriptions
exports.getMySubscriptions = catchAsync(async (req, res, next) => {
  const subscriptions = await Subscription.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .populate({
      path: 'payment',
      select: 'paymentId status amount currency',
      options: { strictPopulate: false }
    })
    .lean();

  // Convertir en objets JavaScript simples pour éviter les problèmes de sérialisation
  const subscriptionsData = subscriptions.map(sub => ({
    ...sub,
    _id: sub._id.toString(),
    user: sub.user?.toString() || sub.user,
    payment: sub.payment || null
  }));

  res.status(200).json({
    status: 'success',
    results: subscriptionsData.length,
    data: {
      subscriptions: subscriptionsData
    }
  });
});

// Obtenir une souscription par ID
exports.getSubscription = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id)
    .populate('user', 'firstName lastName email userType')
    .populate('payment', 'paymentId status amount currency method');

  if (!subscription) {
    return next(new AppError('Souscription non trouvée', 404));
  }

  // Vérifier que l'utilisateur peut accéder à cette souscription
  if (subscription.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Vous n\'avez pas accès à cette souscription', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      subscription
    }
  });
});

// Créer une souscription
exports.createSubscription = catchAsync(async (req, res, next) => {
  const { planId, billingPeriod, paymentMethod, amount, currency } = req.body;

  if (!planId || !billingPeriod) {
    return next(new AppError('Plan et période de facturation requis', 400));
  }

  const plans = Subscription.getAvailablePlans();
  const plan = plans[planId];

  if (!plan) {
    return next(new AppError('Plan invalide', 400));
  }

  // Vérifier si l'utilisateur a déjà une souscription active
  const existingActive = await Subscription.findOne({
    user: req.user.id,
    status: 'active'
  });

  if (existingActive) {
    return next(new AppError('Vous avez déjà une souscription active', 400));
  }

  const expectedAmount = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  
  if (amount !== expectedAmount) {
    return next(new AppError('Montant incorrect', 400));
  }

  // Créer la souscription
  const subscription = await Subscription.create({
    user: req.user.id,
    planId,
    planName: plan.name,
    billingPeriod,
    amount: expectedAmount,
    currency: currency || 'XAF',
    paymentMethod: paymentMethod || 'cash',
    status: paymentMethod === 'cash' ? 'pending' : 'pending',
    paymentStatus: 'pending'
  });

  // Si paiement cash, la souscription reste en attente
  // Si PayPal, le paiement sera créé lors de l'initiation du paiement

  res.status(201).json({
    status: 'success',
    data: {
      subscription
    }
  });
});

// Activer un plan gratuit
exports.activateFreePlan = catchAsync(async (req, res, next) => {
  const { planId } = req.body;

  if (planId !== 'gratuit') {
    return next(new AppError('Seul le plan gratuit peut être activé sans paiement', 400));
  }

  // Vérifier si l'utilisateur a déjà une souscription active
  const existingActive = await Subscription.findOne({
    user: req.user.id,
    status: 'active'
  });

  if (existingActive) {
    return next(new AppError('Vous avez déjà une souscription active', 400));
  }

  const plans = Subscription.getAvailablePlans();
  const plan = plans[planId];

  const subscription = await Subscription.create({
    user: req.user.id,
    planId: 'gratuit',
    planName: plan.name,
    billingPeriod: 'monthly',
    amount: 0,
    currency: 'XAF',
    paymentMethod: 'cash',
    status: 'active',
    paymentStatus: 'completed',
    autoRenew: false
  });

  res.status(201).json({
    status: 'success',
    message: 'Plan gratuit activé avec succès',
    data: {
      subscription
    }
  });
});

// Mettre à jour une souscription
exports.updateSubscription = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    return next(new AppError('Souscription non trouvée', 404));
  }

  // Vérifier les permissions
  if (subscription.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Vous n\'avez pas accès à cette souscription', 403));
  }

  // Mettre à jour les champs autorisés
  const allowedFields = ['autoRenew', 'metadata'];
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      subscription[field] = req.body[field];
    }
  });

  await subscription.save();

  res.status(200).json({
    status: 'success',
    data: {
      subscription
    }
  });
});

// Annuler une souscription
exports.cancelSubscription = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    return next(new AppError('Souscription non trouvée', 404));
  }

  // Vérifier les permissions
  if (subscription.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Vous n\'avez pas accès à cette souscription', 403));
  }

  subscription.status = 'cancelled';
  subscription.cancelledAt = new Date();
  subscription.cancellationReason = req.body.reason || 'Annulé par l\'utilisateur';
  subscription.autoRenew = false;

  await subscription.save();

  res.status(200).json({
    status: 'success',
    message: 'Souscription annulée avec succès',
    data: {
      subscription
    }
  });
});

// Renouveler une souscription
exports.renewSubscription = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    return next(new AppError('Souscription non trouvée', 404));
  }

  if (subscription.status !== 'active') {
    return next(new AppError('Seules les souscriptions actives peuvent être renouvelées', 400));
  }

  // Calculer la nouvelle date de fin
  subscription.endDate = subscription.calculateEndDate();
  subscription.nextBillingDate = subscription.calculateNextBillingDate();

  await subscription.save();

  res.status(200).json({
    status: 'success',
    message: 'Souscription renouvelée avec succès',
    data: {
      subscription
    }
  });
});

// Obtenir l'historique des paiements d'une souscription
exports.getSubscriptionPayments = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    return next(new AppError('Souscription non trouvée', 404));
  }

  // Vérifier les permissions
  if (subscription.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Vous n\'avez pas accès à cette souscription', 403));
  }

  const payments = await Payment.find({
    $or: [
      { _id: subscription.payment },
      { 'metadata.subscriptionId': subscription._id.toString() }
    ]
  }).sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: payments.length,
    data: {
      payments
    }
  });
});

// ============ ROUTES ADMIN ============

// Obtenir toutes les souscriptions (admin)
exports.getAllSubscriptions = catchAsync(async (req, res, next) => {
  const {
    status,
    planId,
    paymentStatus,
    page = 1,
    limit = 20,
    sort = '-createdAt'
  } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }
  if (planId) {
    query.planId = planId;
  }
  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const subscriptions = await Subscription.find(query)
    .populate({
      path: 'user',
      select: 'firstName lastName email userType',
      options: { strictPopulate: false }
    })
    .populate({
      path: 'payment',
      select: 'paymentId status amount currency method',
      options: { strictPopulate: false }
    })
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    .lean();

  const total = await Subscription.countDocuments(query);

  // Convertir les ObjectId en strings pour la sérialisation JSON
  const subscriptionsData = subscriptions.map(sub => ({
    ...sub,
    _id: sub._id.toString(),
    user: sub.user ? (typeof sub.user === 'object' ? {
      ...sub.user,
      _id: sub.user._id?.toString() || sub.user._id
    } : sub.user) : null,
    payment: sub.payment ? (typeof sub.payment === 'object' ? {
      ...sub.payment,
      _id: sub.payment._id?.toString() || sub.payment._id
    } : sub.payment) : null
  }));

  res.status(200).json({
    status: 'success',
    results: subscriptionsData.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: {
      subscriptions: subscriptionsData
    }
  });
});

// Obtenir les statistiques des souscriptions (admin)
exports.getSubscriptionStats = catchAsync(async (req, res, next) => {
  const stats = {
    total: await Subscription.countDocuments(),
    active: await Subscription.countDocuments({ status: 'active' }),
    pending: await Subscription.countDocuments({ status: 'pending' }),
    cancelled: await Subscription.countDocuments({ status: 'cancelled' }),
    expired: await Subscription.countDocuments({ status: 'expired' }),
    byPlan: {
      gratuit: await Subscription.countDocuments({ planId: 'gratuit' }),
      standard: await Subscription.countDocuments({ planId: 'standard' }),
      premium: await Subscription.countDocuments({ planId: 'premium' })
    },
    byPeriod: {
      monthly: await Subscription.countDocuments({ billingPeriod: 'monthly' }),
      annual: await Subscription.countDocuments({ billingPeriod: 'annual' })
    },
    revenue: {
      total: await Subscription.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => result[0]?.total || 0),
      monthly: await Subscription.aggregate([
        {
          $match: {
            paymentStatus: 'completed',
            createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => result[0]?.total || 0)
    }
  };

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

// Mettre à jour le statut d'une souscription (admin)
exports.updateSubscriptionStatus = catchAsync(async (req, res, next) => {
  const { status, paymentStatus } = req.body;

  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    return next(new AppError('Souscription non trouvée', 404));
  }

  if (status) {
    subscription.status = status;
    if (status === 'active' && !subscription.nextBillingDate) {
      subscription.nextBillingDate = subscription.calculateNextBillingDate();
    }
  }

  if (paymentStatus) {
    subscription.paymentStatus = paymentStatus;
    if (paymentStatus === 'completed' && subscription.status === 'pending') {
      subscription.status = 'active';
      subscription.endDate = subscription.calculateEndDate();
      subscription.nextBillingDate = subscription.calculateNextBillingDate();
    }
  }

  await subscription.save();

  res.status(200).json({
    status: 'success',
    data: {
      subscription
    }
  });
});

