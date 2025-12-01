const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const notificationController = require('./notificationController');
const {
  createSegmentsFromItems,
  ensureSegmentsForOrder,
  updateOrderStatusFromSegments
} = require('../utils/orderSegments');
const { toPlainText } = require('../utils/localization');
const orderService = require('../services/orderService');
const deliveryService = require('../services/deliveryService');
const orderNotificationService = require('../services/orderNotificationService');
const orderStatusService = require('../services/orderStatusService');

// ROUTES PUBLIQUES (avec authentification)

// Estimer les frais avant création de commande
exports.estimateOrderCosts = catchAsync(async (req, res, next) => {
  const { items, deliveryAddress, deliveryMethod, useLoyaltyPoints, loyaltyPointsToUse } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new AppError('Au moins un article est requis', 400));
  }

  try {
    const costs = await orderService.estimateOrderCosts(
      items,
      deliveryAddress,
      deliveryMethod,
      req.user,
      {
        useLoyaltyPoints,
        loyaltyPointsToUse,
        paymentMethod: req.body.paymentMethod,
        paymentProvider: req.body.paymentProvider
      }
    );
    res.status(200).json({
      status: 'success',
      data: costs
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// Créer une nouvelle commande
exports.createOrder = catchAsync(async (req, res, next) => {
  const { items, deliveryAddress, billingAddress, paymentMethod, paymentProvider, notes } = req.body;

  if (!items || items.length === 0) {
    return next(new AppError('Au moins un article est requis', 400));
  }

  try {
    const order = await orderService.createOrder({
      items,
      deliveryAddress,
      billingAddress,
      paymentMethod,
      paymentProvider,
      notes,
      deliveryMethod: req.body.deliveryMethod,
      currency: req.body.currency,
      useLoyaltyPoints: req.body.useLoyaltyPoints,
      loyaltyPointsToUse: req.body.loyaltyPointsToUse,
      source: req.body.source
    }, req.user);

    // Envoyer notifications
    try {
      await Notification.notifyOrderCreated(order);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
    }

    // Notifier les admins pour les commandes de forte valeur (> 100,000 FCFA)
    if (order.total >= 100000) {
      try {
        const customerName = `${req.user.firstName} ${req.user.lastName}`;
        await notificationController.notifyHighValueOrder(
          order._id,
          order.total,
          customerName
        );
      } catch (error) {
        console.error('Erreur lors de l\'envoi de notification admin:', error);
      }
    }

    res.status(201).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// Obtenir mes commandes
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = orderService.buildOrderQuery(req.user._id, req.user.userType, req.query);

  const orders = await Order.find(query)
    .populate('buyer', 'firstName lastName email')
    .populate('seller', 'farmName companyName firstName lastName')
    .populate({
      path: 'segments.seller',
      select: 'farmName companyName firstName lastName email phone userType'
    })
    .populate('items.product', 'name images')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  // Créer les segments si nécessaire avec gestion d'erreur
  for (const order of orders) {
    try {
      if (ensureSegmentsForOrder(order)) {
        await order.save();
      }
    } catch (error) {
      // Logger l'erreur mais continuer le traitement
      console.error(`Erreur lors de la création des segments pour la commande ${order._id}:`, error.message);
    }
  }

  const total = await Order.countDocuments(query);
  const formattedOrders = orderService.formatOrders(orders, req.user._id, req.user.userType);

  res.status(200).json({
    status: 'success',
    results: formattedOrders.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: { orders: formattedOrders }
  });
});

// Obtenir une commande spécifique
exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('buyer', 'firstName lastName email phone')
    .populate('seller', 'farmName companyName firstName lastName email phone')
    .populate({
      path: 'segments.seller',
      select: 'farmName companyName firstName lastName email phone userType'
    })
    .populate('items.product', 'name images category')
    .populate('delivery.transporter', 'companyName firstName lastName phone');

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  const segmentsCreated = ensureSegmentsForOrder(order);
  if (segmentsCreated) {
    await order.save();
  }

  if (!orderService.checkOrderAccess(order, req.user._id, req.user.role)) {
    return next(new AppError('Accès non autorisé à cette commande', 403));
  }

  const orderData = orderService.formatOrder(order, req.user._id, req.user.userType);
  res.status(200).json({
    status: 'success',
    data: { order: orderData }
  });
});

// Mettre à jour le statut d'une commande
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status, segmentId, itemIds, itemId, reason, note } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  try {
    const rawItemIds = Array.isArray(itemIds) ? itemIds : (itemId ? [itemId] : []);
    const result = await orderStatusService.updateOrderStatus(order, status, req.user, {
      segmentId,
      itemIds: rawItemIds,
      reason,
      note
    });

    if (!result.changed) {
      return res.status(200).json({
        status: 'success',
        message: 'Le statut de la commande est déjà à ce niveau',
        data: { order: result.order }
      });
    }

    res.status(200).json({
      status: 'success',
      data: { order: result.order }
    });
  } catch (error) {
    return next(error);
  }
});

// Annuler une commande
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  if (!orderService.checkCancelPermission(order, req.user._id, req.user.role)) {
    return next(new AppError('Vous n\'avez pas le droit d\'annuler cette commande', 403));
  }

  try {
    const cancelledOrder = await orderService.cancelOrder(order, req.user._id, reason);
    res.status(200).json({
      status: 'success',
      data: { order: cancelledOrder }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// Suivi d'une commande
exports.trackOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('delivery.transporter', 'companyName phone')
    .select('orderNumber status delivery statusHistory');

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  if (!orderService.checkOrderAccess(order, req.user._id, req.user.role)) {
    return next(new AppError('Accès non autorisé', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tracking: orderService.getTrackingData(order)
    }
  });
});

// ROUTES ADMIN

// Obtenir toutes les commandes (admin)
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const queryObj = orderService.buildAllOrdersQuery(req.query);

  const orders = await Order.find(queryObj)
    .populate('buyer', 'firstName lastName email userType')
    .populate('seller', 'farmName companyName firstName lastName userType')
    .populate({
      path: 'segments.seller',
      select: 'farmName companyName firstName lastName email phone userType'
    })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  for (const order of orders) {
    if (ensureSegmentsForOrder(order)) {
      await order.save();
    }
  }

  const total = await Order.countDocuments(queryObj);

  const stats = await Order.aggregate([
    { $match: queryObj },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        totalOrders: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: orders.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    stats: stats[0] || {},
    data: { orders }
  });
});

// Statistiques des commandes
exports.getOrderStats = catchAsync(async (req, res, next) => {
  const { period = '30d', groupBy = 'day' } = req.query;
  
  const periodDays = parseInt(period.replace('d', ''));
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  // Groupement par période
  let groupFormat;
  switch (groupBy) {
    case 'hour':
      groupFormat = { 
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' },
        hour: { $hour: '$createdAt' }
      };
      break;
    case 'day':
      groupFormat = { 
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      break;
    case 'week':
      groupFormat = { 
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' }
      };
      break;
    case 'month':
      groupFormat = { 
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
      break;
    default:
      groupFormat = { 
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
  }

  const stats = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: groupFormat,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
  ]);

  // Statistiques par statut
  const statusStats = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$total' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Top vendeurs
  const topSellers = await Order.aggregate([
    { 
      $match: { 
        createdAt: { $gte: startDate },
        status: 'completed'
      } 
    },
    {
      $group: {
        _id: '$seller',
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' }
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'seller'
      }
    },
    { $unwind: '$seller' }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      timeline: stats,
      statusBreakdown: statusStats,
      topSellers,
      period,
      groupBy
    }
  });
});

// FONCTIONS UTILITAIRES

// Les fonctions utilitaires ont été déplacées dans les services
// calculateDeliveryFee -> deliveryService.calculateDeliveryFee
// calculateEstimatedDelivery -> deliveryService.calculateEstimatedDelivery
// formatOrderForSeller -> utils/orderFormatting.formatOrderForSeller
// getValidStatusTransitions -> orderStatusService.getValidStatusTransitions
// sendStatusNotifications -> orderNotificationService.sendStatusNotifications

// FONCTION DE TEST (TEMPORAIRE)
// Créer une commande de test (développement uniquement)
exports.createTestOrder = catchAsync(async (req, res, next) => {
  const Product = require('../models/Product');
  const product = await Product.findOne({ producer: req.user._id });
  
  const orderData = {
    orderNumber: `TEST-${Date.now()}`,
    buyer: req.user._id,
    seller: req.user._id,
    items: product ? [{
      product: product._id,
      quantity: 2,
      unitPrice: product.price || 1000,
      totalPrice: (product.price || 1000) * 2,
      productSnapshot: {
        name: toPlainText(product.name, 'Produit de test'),
        description: toPlainText(product.description, 'Description de test')
      }
    }] : [{
      product: null,
      quantity: 1,
      unitPrice: 1000,
      totalPrice: 1000,
      productSnapshot: { name: 'Produit de test', description: 'Commande de test sans produit réel' }
    }],
    total: product ? (product.price || 1000) * 2 : 1000,
    status: 'pending',
    paymentMethod: 'cash',
    delivery: {
      method: 'standard-delivery',
      deliveryFee: 0,
      deliveryAddress: {
        firstName: 'Test', lastName: 'User', street: 'Test Street',
        city: 'Dakar', region: 'Dakar', country: 'Sénégal',
        postalCode: '00000', phone: '+221000000000'
      }
    }
  };

  const testOrder = await Order.create(orderData);
  await testOrder.populate('buyer', 'firstName lastName email');
  await testOrder.populate('seller', 'firstName lastName');
  await testOrder.populate('items.product', 'name images');

  res.status(201).json({
    status: 'success',
    message: 'Commande de test créée',
    data: { order: testOrder }
  });
});

// Exporter la fonction de notification pour utilisation dans d'autres contrôleurs
exports.sendStatusNotifications = orderNotificationService.sendStatusNotifications;

module.exports = exports;
