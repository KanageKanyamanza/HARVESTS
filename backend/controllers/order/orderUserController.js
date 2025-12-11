const Order = require('../../models/Order');
const Notification = require('../../models/Notification');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const notificationController = require('../notificationController');
const {
  ensureSegmentsForOrder
} = require('../../utils/orderSegments');
const orderService = require('../../services/orderService');
const orderStatusService = require('../../services/orderStatusService');
const adminNotifications = require('../../utils/adminNotifications');
const invoiceService = require('../../services/invoiceService');

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

    // Notifier les admins de la nouvelle commande
    adminNotifications.notifyNewOrder(order, req.user).catch(err => {
      console.error('Erreur notification nouvelle commande:', err);
    });

    // Notifier les admins pour les commandes de forte valeur (> 100,000 FCFA)
    if (order.total >= 100000) {
      adminNotifications.notifyHighValueOrder(order, req.user).catch(err => {
        console.error('Erreur notification commande de forte valeur:', err);
      });
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
    
    // Notifier les admins de l'annulation
    adminNotifications.notifyOrderCancelled(cancelledOrder, req.user, reason).catch(err => {
      console.error('Erreur notification commande annulée:', err);
    });
    
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

// Générer une facture PDF
exports.generateInvoice = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  
  try {
    const pdfBuffer = await invoiceService.generateInvoicePDF(orderId, req.user);
    
    // Définir les headers pour le téléchargement
    const order = await Order.findById(orderId);
    const invoiceNumber = order?.invoiceNumber || order?.orderNumber || `INV-${orderId.substring(0, 8).toUpperCase()}`;
    const filename = `facture-${invoiceNumber}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
  } catch (error) {
    return next(error);
  }
});

