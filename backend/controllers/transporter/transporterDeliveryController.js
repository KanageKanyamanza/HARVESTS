const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Order = require('../../models/Order');

// Obtenir toutes les livraisons assignées au transporteur
exports.getMyDeliveries = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const status = req.query.status;

  const query = {
    'delivery.transporter': req.user.id
  };

  if (status && status !== 'all') {
    if (status === 'ready-for-pickup' || status === 'in-transit' || status === 'delivered' || status === 'completed') {
      query.status = status;
    }
  }

  const orders = await Order.find(query)
    .populate('buyer', 'firstName lastName email phone')
    .populate('seller', 'firstName lastName companyName farmName email phone')
    .populate('delivery.transporter', 'firstName lastName companyName email phone')
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
      deliveries: orders,
      orders: orders // Compatibilité avec le frontend
    }
  });
});

// Obtenir les détails d'une livraison spécifique
exports.getMyDelivery = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.deliveryId,
    'delivery.transporter': req.user.id
  })
    .populate('buyer', 'firstName lastName email phone address city region country')
    .populate('seller', 'firstName lastName companyName farmName email phone address city region')
    .populate('delivery.transporter', 'firstName lastName companyName email phone')
    .populate('items.product', 'name images price category');

  if (!order) {
    return next(new AppError('Livraison non trouvée ou non assignée à ce transporteur', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order,
      delivery: order
    }
  });
});

// Mettre à jour le statut de livraison
exports.updateDeliveryStatus = catchAsync(async (req, res, next) => {
  const { status, location, note } = req.body;

  const validStatuses = ['picked-up', 'in-transit', 'out-for-delivery', 'delivered'];
  if (!validStatuses.includes(status)) {
    return next(new AppError(`Statut invalide. Statuts autorisés: ${validStatuses.join(', ')}`, 400));
  }

  const order = await Order.findOne({
    _id: req.params.deliveryId,
    'delivery.transporter': req.user.id
  });

  if (!order) {
    return next(new AppError('Livraison non trouvée ou non assignée à ce transporteur', 404));
  }

  const currentStatus = order.delivery?.status || order.status || 'pending';
  const userType = req.user.userType || 'transporter';
  
  const getValidTransitions = (currentStat, userTyp) => {
    const transitions = {
      'ready-for-pickup': {
        transporter: ['picked-up', 'in-transit'],
        exporter: ['picked-up', 'in-transit']
      },
      'picked-up': {
        transporter: ['in-transit', 'delivered'],
        exporter: ['in-transit', 'delivered']
      },
      'in-transit': {
        transporter: ['delivered'],
        exporter: ['delivered']
      },
      'out-for-delivery': {
        transporter: ['delivered'],
        exporter: ['delivered']
      }
    };
    return transitions[currentStat]?.[userTyp] || [];
  };

  let deliveryStatusToCheck = currentStatus;
  if (currentStatus === 'ready-for-pickup' || currentStatus === 'preparing') {
    deliveryStatusToCheck = 'ready-for-pickup';
  } else if (currentStatus === 'in-transit') {
    deliveryStatusToCheck = 'in-transit';
  }

  const validTransitions = getValidTransitions(deliveryStatusToCheck, userType);
  
  if (status === 'picked-up' && (currentStatus === 'ready-for-pickup' || currentStatus === 'preparing')) {
    // Valide
  } else if (status === 'in-transit' && (currentStatus === 'ready-for-pickup' || currentStatus === 'preparing' || currentStatus === 'picked-up')) {
    // Valide
  } else if (status === 'delivered' && (currentStatus === 'in-transit' || currentStatus === 'picked-up' || currentStatus === 'out-for-delivery')) {
    // Valide
  } else if (!validTransitions.includes(status) && status !== 'picked-up') {
    return next(new AppError(
      `Transition de statut invalide pour un livreur: de "${currentStatus}" à "${status}". Transitions autorisées: ${validTransitions.join(', ')}`,
      403
    ));
  }

  await order.addDeliveryUpdate(status, location, note, req.user.id);

  const sendStatusNotifications = require('../orderController').sendStatusNotifications || (async () => {});
  try {
    await sendStatusNotifications(order, status === 'picked-up' ? 'in-transit' : status === 'delivered' ? 'delivered' : order.status);
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error);
  }

  const updatedOrder = await Order.findById(order._id)
    .populate('buyer', 'firstName lastName email phone')
    .populate('seller', 'firstName lastName companyName farmName email phone')
    .populate('delivery.transporter', 'firstName lastName companyName email phone');

  res.status(200).json({
    status: 'success',
    message: `Statut de livraison mis à jour: ${status === 'picked-up' ? 'Collectée' : status === 'delivered' ? 'Livrée' : status}`,
    data: {
      order: updatedOrder,
      delivery: updatedOrder
    }
  });
});

