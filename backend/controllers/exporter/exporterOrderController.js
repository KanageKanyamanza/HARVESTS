const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Order = require('../../models/Order');

// Obtenir toutes les commandes assignées à l'exportateur
exports.getMyExportOrders = catchAsync(async (req, res, next) => {
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
    .populate('delivery.transporter', 'firstName lastName companyName email phone userType')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  // Filtrer pour ne garder que les commandes assignées à un exportateur
  const filteredOrders = orders.filter(order => {
    const transporter = order.delivery?.transporter;
    if (transporter && typeof transporter === 'object' && transporter.userType) {
      return transporter.userType === 'exporter';
    }
    return order.isExport === true;
  });

  const totalFiltered = filteredOrders.length;

  res.status(200).json({
    status: 'success',
    results: filteredOrders.length,
    total: totalFiltered,
    page,
    totalPages: Math.ceil(totalFiltered / limit),
    data: {
      exportOrders: filteredOrders,
      orders: filteredOrders
    }
  });
});

// Obtenir une commande spécifique assignée à l'exportateur
exports.getMyExportOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    'delivery.transporter': req.user.id
  })
    .populate('buyer', 'firstName lastName email phone address city region country')
    .populate('seller', 'firstName lastName companyName farmName email phone address city region')
    .populate('delivery.transporter', 'firstName lastName companyName email phone userType')
    .populate('items.product', 'name images price category');

  if (!order) {
    return next(new AppError('Commande d\'export non trouvée ou non assignée à cet exportateur', 404));
  }

  // Vérifier que c'est bien un exportateur qui est assigné
  const transporter = order.delivery?.transporter;
  const isExporterAssigned = transporter && typeof transporter === 'object' && transporter.userType === 'exporter';
  const isExportOrder = order.isExport === true;

  if (!isExporterAssigned && !isExportOrder) {
    return next(new AppError('Cette commande n\'est pas assignée à un exportateur', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order,
      exportOrder: order
    }
  });
});

// Mettre à jour le statut de commande d'export
exports.updateExportOrderStatus = catchAsync(async (req, res, next) => {
  const { status, location, note } = req.body;

  const validStatuses = ['picked-up', 'in-transit', 'out-for-delivery', 'delivered'];
  if (!validStatuses.includes(status)) {
    return next(new AppError(`Statut invalide. Statuts autorisés: ${validStatuses.join(', ')}`, 400));
  }

  const order = await Order.findOne({
    _id: req.params.orderId,
    'delivery.transporter': req.user.id
  })
    .populate('delivery.transporter', 'userType');

  if (!order) {
    return next(new AppError('Commande d\'export non trouvée ou non assignée à cet exportateur', 404));
  }

  // Vérifier que c'est bien un exportateur qui est assigné
  const transporter = order.delivery?.transporter;
  const isExporterAssigned = transporter && typeof transporter === 'object' && transporter.userType === 'exporter';
  const isExportOrder = order.isExport === true;

  if (!isExporterAssigned && !isExportOrder) {
    return next(new AppError('Cette commande n\'est pas assignée à un exportateur', 403));
  }

  const currentStatus = order.delivery?.status || order.status || 'pending';
  const userType = req.user.userType || 'exporter';
  
  const getValidTransitions = (currentStat, userTyp) => {
    const transitions = {
      'ready-for-pickup': {
        exporter: ['picked-up', 'in-transit']
      },
      'picked-up': {
        exporter: ['in-transit', 'delivered']
      },
      'in-transit': {
        exporter: ['delivered']
      },
      'out-for-delivery': {
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
      `Transition de statut invalide pour un exportateur: de "${currentStatus}" à "${status}". Transitions autorisées: ${validTransitions.join(', ')}`,
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
    message: `Statut de commande d'export mis à jour: ${status === 'picked-up' ? 'Collectée' : status === 'delivered' ? 'Livrée' : status}`,
    data: {
      order: updatedOrder,
      exportOrder: updatedOrder
    }
  });
});

