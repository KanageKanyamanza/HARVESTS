const Order = require('../models/Order');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// ROUTES PUBLIQUES (avec authentification)

// Créer une nouvelle commande
exports.createOrder = catchAsync(async (req, res, next) => {
  const { items, deliveryAddress, billingAddress, paymentMethod, notes } = req.body;

  // Valider les articles
  if (!items || items.length === 0) {
    return next(new AppError('Au moins un article est requis', 400));
  }

  // Vérifier la disponibilité et calculer les totaux
  let subtotal = 0;
  const processedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive || product.status !== 'approved') {
      return next(new AppError(`Produit ${item.productId} non disponible`, 400));
    }

    // Vérifier le stock
    let availableQuantity;
    let unitPrice;

    if (product.hasVariants && item.variantId) {
      const variant = product.variants.id(item.variantId);
      if (!variant || !variant.isActive) {
        return next(new AppError(`Variante non disponible`, 400));
      }
      availableQuantity = variant.inventory.quantity;
      unitPrice = variant.price;
    } else {
      availableQuantity = product.inventory.quantity;
      unitPrice = product.price;
    }

    if (availableQuantity < item.quantity) {
      return next(new AppError(`Stock insuffisant pour ${product.name}`, 400));
    }

    // Vérifier la quantité minimum
    if (item.quantity < product.minimumOrderQuantity) {
      return next(new AppError(
        `Quantité minimum pour ${product.name}: ${product.minimumOrderQuantity}`, 
        400
      ));
    }

    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;

    processedItems.push({
      product: product._id,
      variant: item.variantId || undefined,
      productSnapshot: {
        name: product.name,
        description: product.shortDescription || product.description,
        images: product.images.map(img => img.url),
        producer: product.producer
      },
      quantity: item.quantity,
      unitPrice,
      totalPrice,
      weight: product.shipping.weight,
      specialInstructions: item.specialInstructions
    });
  }

  // Calculer les frais de livraison (logique simplifiée)
  const deliveryFee = calculateDeliveryFee(processedItems, deliveryAddress);
  
  // Calculer les taxes (exemple: 19.25% TVA au Cameroun)
  const taxes = Math.round(subtotal * 0.1925);

  // Appliquer les remises (points de fidélité, coupons, etc.)
  let discount = 0;
  let loyaltyPointsUsed = 0;

  if (req.body.useLoyaltyPoints && req.user.userType === 'consumer') {
    const Consumer = require('../models/Consumer');
    const consumer = await Consumer.findById(req.user.id);
    if (consumer && req.body.loyaltyPointsToUse <= consumer.loyaltyProgram.points) {
      discount = consumer.redeemLoyaltyPoints(req.body.loyaltyPointsToUse);
      loyaltyPointsUsed = req.body.loyaltyPointsToUse;
      await consumer.save();
    }
  }

  const total = subtotal + deliveryFee + taxes - discount;

  // Créer la commande
  const order = await Order.create({
    buyer: req.user.id,
    seller: processedItems[0].productSnapshot.producer, // Tous les produits du même producteur
    items: processedItems,
    subtotal,
    deliveryFee,
    taxes,
    discount,
    total,
    currency: req.body.currency || 'XAF',
    payment: {
      method: paymentMethod,
      status: 'pending'
    },
    delivery: {
      method: req.body.deliveryMethod || 'standard-delivery',
      deliveryAddress,
      estimatedDeliveryDate: calculateEstimatedDelivery(req.body.deliveryMethod)
    },
    billingAddress: billingAddress || deliveryAddress,
    buyerNotes: notes,
    loyaltyPointsUsed,
    source: req.body.source || 'web'
  });

  // Réserver le stock
  try {
    await order.reserveStock();
  } catch (error) {
    await Order.findByIdAndDelete(order._id);
    return next(new AppError(error.message, 400));
  }

  // Calculer les points de fidélité gagnés
  if (req.user.userType === 'consumer') {
    const Consumer = require('../models/Consumer');
    const consumer = await Consumer.findById(req.user.id);
    if (consumer) {
      const pointsEarned = consumer.addLoyaltyPoints(total);
      order.loyaltyPointsEarned = pointsEarned;
      await consumer.save();
    }
  }

  await order.save();

  // Envoyer notifications
  await Notification.notifyOrderCreated(order);

  res.status(201).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Obtenir mes commandes
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  let query = {};
  
  // Filtrer selon le type d'utilisateur
  if (['consumer', 'restaurateur'].includes(req.user.userType)) {
    query.buyer = req.user.id;
  } else if (['producer', 'transformer'].includes(req.user.userType)) {
    query.seller = req.user.id;
  } else if (req.user.userType === 'transporter') {
    query['delivery.transporter'] = req.user.id;
  }

  // Filtres optionnels
  if (req.query.status) query.status = req.query.status;
  if (req.query.dateFrom) {
    query.createdAt = { $gte: new Date(req.query.dateFrom) };
  }
  if (req.query.dateTo) {
    query.createdAt = { ...query.createdAt, $lte: new Date(req.query.dateTo) };
  }

  const orders = await Order.find(query)
    .populate('buyer', 'firstName lastName email')
    .populate('seller', 'farmName companyName firstName lastName')
    .populate('items.product', 'name images')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: orders.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      orders
    }
  });
});

// Obtenir une commande spécifique
exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('buyer', 'firstName lastName email phone')
    .populate('seller', 'farmName companyName firstName lastName email phone')
    .populate('items.product', 'name images category')
    .populate('delivery.transporter', 'companyName firstName lastName phone');

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  // Vérifier que l'utilisateur a accès à cette commande
  const hasAccess = 
    order.buyer.toString() === req.user.id ||
    order.seller.toString() === req.user.id ||
    (order.delivery.transporter && order.delivery.transporter._id.toString() === req.user.id) ||
    req.user.role === 'admin';

  if (!hasAccess) {
    return next(new AppError('Accès non autorisé à cette commande', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Mettre à jour le statut d'une commande
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status, reason, note } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  // Vérifier les permissions
  const canUpdate = 
    (order.seller.toString() === req.user.id) ||
    (order.delivery.transporter && order.delivery.transporter.toString() === req.user.id) ||
    req.user.role === 'admin';

  if (!canUpdate) {
    return next(new AppError('Vous n\'avez pas le droit de modifier cette commande', 403));
  }

  // Valider la transition de statut
  const validTransitions = getValidStatusTransitions(order.status, req.user.userType);
  if (!validTransitions.includes(status)) {
    return next(new AppError(`Transition de statut invalide: ${order.status} -> ${status}`, 400));
  }

  await order.updateStatus(status, req.user.id, reason, note);

  // Envoyer notifications selon le nouveau statut
  await sendStatusNotifications(order, status);

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Annuler une commande
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  // Vérifier que la commande peut être annulée
  if (!order.canBeCancelled) {
    return next(new AppError('Cette commande ne peut plus être annulée', 400));
  }

  // Vérifier les permissions
  const canCancel = 
    order.buyer.toString() === req.user.id ||
    order.seller.toString() === req.user.id ||
    req.user.role === 'admin';

  if (!canCancel) {
    return next(new AppError('Vous n\'avez pas le droit d\'annuler cette commande', 403));
  }

  // Libérer le stock
  await order.releaseStock();

  // Mettre à jour le statut
  await order.updateStatus('cancelled', req.user.id, reason);

  // Traiter le remboursement si paiement effectué
  if (order.payment.status === 'completed') {
    const Payment = require('../models/Payment');
    const payment = await Payment.findOne({ order: order._id });
    if (payment) {
      await payment.createRefund(payment.amount, 'order_cancelled');
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Suivi d'une commande
exports.trackOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('delivery.transporter', 'companyName phone')
    .select('orderNumber status delivery statusHistory');

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  // Vérifier l'accès
  const hasAccess = 
    order.buyer.toString() === req.user.id ||
    order.seller.toString() === req.user.id ||
    (order.delivery.transporter && order.delivery.transporter._id.toString() === req.user.id);

  if (!hasAccess) {
    return next(new AppError('Accès non autorisé', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tracking: {
        orderNumber: order.orderNumber,
        status: order.status,
        estimatedDelivery: order.estimatedDelivery,
        timeline: order.delivery.timeline,
        transporter: order.delivery.transporter,
        trackingNumber: order.delivery.trackingNumber
      }
    }
  });
});

// ROUTES ADMIN

// Obtenir toutes les commandes (admin)
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const queryObj = {};
  
  // Filtres
  if (req.query.status) queryObj.status = req.query.status;
  if (req.query.seller) queryObj.seller = req.query.seller;
  if (req.query.buyer) queryObj.buyer = req.query.buyer;
  if (req.query.dateFrom) {
    queryObj.createdAt = { $gte: new Date(req.query.dateFrom) };
  }
  if (req.query.dateTo) {
    queryObj.createdAt = { ...queryObj.createdAt, $lte: new Date(req.query.dateTo) };
  }

  const orders = await Order.find(queryObj)
    .populate('buyer', 'firstName lastName email userType')
    .populate('seller', 'farmName companyName firstName lastName userType')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(queryObj);

  // Statistiques rapides
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
    data: {
      orders
    }
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

// Calculer les frais de livraison
function calculateDeliveryFee(items, deliveryAddress) {
  // Logique simplifiée - à personnaliser selon les besoins
  const totalWeight = items.reduce((sum, item) => {
    return sum + (item.weight?.value || 1) * item.quantity;
  }, 0);

  const baseRate = 1000; // 1000 XAF de base
  const weightRate = 100; // 100 XAF par kg
  
  return Math.round(baseRate + (totalWeight * weightRate));
}

// Calculer la date de livraison estimée
function calculateEstimatedDelivery(deliveryMethod) {
  const now = new Date();
  const deliveryDays = {
    'same-day': 0,
    'express-delivery': 1,
    'standard-delivery': 3,
    'scheduled': 7,
    'pickup': 0
  };

  const days = deliveryDays[deliveryMethod] || 3;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

// Obtenir les transitions de statut valides
function getValidStatusTransitions(currentStatus, userType) {
  const transitions = {
    pending: {
      producer: ['confirmed', 'cancelled'],
      transformer: ['confirmed', 'cancelled'],
      consumer: ['cancelled'],
      restaurateur: ['cancelled'],
      admin: ['confirmed', 'cancelled']
    },
    confirmed: {
      producer: ['preparing', 'cancelled'],
      transformer: ['preparing', 'cancelled'],
      admin: ['preparing', 'cancelled']
    },
    preparing: {
      producer: ['ready-for-pickup'],
      transformer: ['ready-for-pickup'],
      admin: ['ready-for-pickup', 'cancelled']
    },
    'ready-for-pickup': {
      transporter: ['in-transit'],
      producer: ['in-transit'],
      admin: ['in-transit']
    },
    'in-transit': {
      transporter: ['delivered'],
      admin: ['delivered']
    },
    delivered: {
      buyer: ['completed'],
      admin: ['completed']
    }
  };

  return transitions[currentStatus]?.[userType] || [];
}

// Envoyer les notifications selon le statut
async function sendStatusNotifications(order, newStatus) {
  const notifications = {
    confirmed: {
      recipient: order.buyer,
      type: 'order_confirmed',
      title: 'Commande confirmée',
      message: `Votre commande ${order.orderNumber} a été confirmée par le vendeur`
    },
    preparing: {
      recipient: order.buyer,
      type: 'order_preparing',
      title: 'Commande en préparation',
      message: `Votre commande ${order.orderNumber} est en cours de préparation`
    },
    'in-transit': {
      recipient: order.buyer,
      type: 'order_shipped',
      title: 'Commande expédiée',
      message: `Votre commande ${order.orderNumber} est en route`
    },
    delivered: {
      recipient: order.buyer,
      type: 'order_delivered',
      title: 'Commande livrée',
      message: `Votre commande ${order.orderNumber} a été livrée`
    },
    cancelled: {
      recipient: order.buyer,
      type: 'order_cancelled',
      title: 'Commande annulée',
      message: `Votre commande ${order.orderNumber} a été annulée`
    }
  };

  const notificationData = notifications[newStatus];
  if (notificationData) {
    await Notification.createNotification({
      ...notificationData,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber
      },
      actions: [{
        type: 'view',
        label: 'Voir la commande',
        url: `/orders/${order._id}`
      }],
      channels: {
        inApp: { enabled: true },
        email: { enabled: true },
        push: { enabled: true }
      }
    });
  }
}

// Fonction de test pour créer une commande (TEMPORAIRE)
exports.createTestOrder = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  const Product = require('../models/Product');
  
  try {
    console.log('🔧 createTestOrder - User ID:', req.user._id);
    
    // Trouver un produit du producteur connecté
    const product = await Product.findOne({ producer: req.user._id });
    console.log('🔧 createTestOrder - Product found:', product);
    
    // Si pas de produit, créer une commande simple sans produit
    let orderData;
    
    if (product) {
      orderData = {
        orderNumber: `TEST-${Date.now()}`,
        buyer: req.user._id, // Temporairement, le producteur est aussi l'acheteur
        seller: req.user._id,
        items: [{
          product: product._id,
          quantity: 2,
          unitPrice: product.price || 1000,
          totalPrice: (product.price || 1000) * 2,
          productSnapshot: {
            name: product.name?.fr || product.name || 'Produit de test',
            description: product.description?.fr || 'Description de test'
          }
        }],
        total: (product.price || 1000) * 2,
        status: 'pending',
        paymentMethod: 'cash',
        delivery: {
          method: 'standard-delivery',
          deliveryFee: 0,
          deliveryAddress: {
            firstName: 'Test',
            lastName: 'User',
            street: 'Test Street',
            city: 'Dakar',
            region: 'Dakar',
            country: 'Sénégal',
            postalCode: '00000',
            phone: '+221000000000'
          }
        }
      };
    } else {
      // Commande sans produit réel
      orderData = {
        orderNumber: `TEST-${Date.now()}`,
        buyer: req.user._id,
        seller: req.user._id,
        items: [{
          product: null, // Pas de produit réel
          quantity: 1,
          unitPrice: 1000,
          totalPrice: 1000,
          productSnapshot: {
            name: 'Produit de test',
            description: 'Commande de test sans produit réel'
          }
        }],
        total: 1000,
        status: 'pending',
        paymentMethod: 'cash',
        delivery: {
          method: 'standard-delivery',
          deliveryFee: 0,
          deliveryAddress: {
            firstName: 'Test',
            lastName: 'User',
            street: 'Test Street',
            city: 'Dakar',
            region: 'Dakar',
            country: 'Sénégal',
            postalCode: '00000',
            phone: '+221000000000'
          }
        }
      };
    }

    // Créer une commande de test
    const testOrder = new Order(orderData);

    console.log('🔧 createTestOrder - Saving order...');
    await testOrder.save();
    console.log('🔧 createTestOrder - Order saved successfully');
    
    // Populate les données
    await testOrder.populate('buyer', 'firstName lastName email');
    await testOrder.populate('seller', 'firstName lastName');
    await testOrder.populate('items.product', 'name images');

    console.log('🔧 createTestOrder - Order created successfully:', testOrder._id);

    res.status(201).json({
      status: 'success',
      message: 'Commande de test créée',
      data: { order: testOrder }
    });
  } catch (error) {
    console.error('🔧 Erreur création commande test:', error);
    console.error('🔧 Error details:', error.message);
    console.error('🔧 Error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la création de la commande de test',
      error: error.message
    });
  }
});

// Exporter la fonction de notification pour utilisation dans d'autres contrôleurs
exports.sendStatusNotifications = sendStatusNotifications;

module.exports = exports;
