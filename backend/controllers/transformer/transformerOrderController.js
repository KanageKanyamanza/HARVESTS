const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Order = require('../../models/Order');
const orderController = require('../orderController');
const transformerOrderService = require('../../services/transformer/transformerOrderService');

// Commandes
exports.getMyOrders = (req, res, next) => orderController.getMyOrders(req, res, next);

exports.acceptOrder = catchAsync(async (req, res, next) => {
  try {
    const order = await transformerOrderService.acceptOrder(req.params.orderId, req.user._id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Commande acceptée avec succès',
      data: { order }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getMyOrder = (req, res, next) => {
  if (!req.params.id && req.params.orderId) {
    req.params.id = req.params.orderId;
  }
  return orderController.getOrder(req, res, next);
};

exports.updateOrderStatus = (req, res, next) => {
  if (!req.params.id && req.params.orderId) {
    req.params.id = req.params.orderId;
  }
  return orderController.updateOrderStatus(req, res, next);
};

exports.cancelOrder = catchAsync(async (req, res, next) => {
  try {
    const order = await transformerOrderService.cancelOrderByTransformer(req.params.orderId, req.user._id, req.body.reason);
    res.status(200).json({
      status: 'success',
      message: 'Commande annulée avec succès',
      data: { order }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.trackOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;

  const order = await Order.findOne({
    _id: orderId,
    transformer: req.user._id
  })
  .populate('customer', 'firstName lastName email')
  .select('status createdAt acceptedAt startedAt completedAt estimatedDelivery trackingUpdates');

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order: {
        id: order._id,
        status: order.status,
        createdAt: order.createdAt,
        acceptedAt: order.acceptedAt,
        startedAt: order.startedAt,
        completedAt: order.completedAt,
        estimatedDelivery: order.estimatedDelivery,
        trackingUpdates: order.trackingUpdates || []
      }
    }
  });
});

exports.updateOrderProgress = catchAsync(async (req, res, next) => {
  try {
    const order = await transformerOrderService.updateOrderProgress(req.params.orderId, req.user._id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Progression de la commande mise à jour avec succès',
      data: {
        order: {
          id: order._id,
          status: order.status,
          trackingUpdates: order.trackingUpdates
        }
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

