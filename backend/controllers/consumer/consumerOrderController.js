const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const orderController = require('../orderController');
const consumerOrderService = require('../../services/consumer/consumerOrderService');
const orderServiceMain = require('../../services/orderService');

// Fonctions temporaires pour les fonctionnalités nécessitant d'autres modèles
const tempResponse = (message, statusCode = 200, data = {}) => catchAsync(async (req, res, next) => {
  res.status(statusCode).json({
    status: 'success',
    message: `Fonctionnalité en cours de développement - ${message}`,
    data
  });
});

exports.getCart = tempResponse('Modèle Cart requis', 200, { cart: [] });
exports.addToCart = tempResponse('Modèle Cart requis', 201);
exports.updateCartItem = tempResponse('Modèle Cart requis');
exports.removeFromCart = tempResponse('Modèle Cart requis', 204, null);
exports.clearCart = tempResponse('Modèle Cart requis', 204, null);

// Commandes
exports.getMyOrders = catchAsync(async (req, res, next) => {
  try {
    const orders = await consumerOrderService.getConsumerOrders(req.user.id, req.query);
    res.status(200).json({
      status: 'success',
      data: { orders }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.createOrder = (req, res, next) => orderController.createOrder(req, res, next);

exports.getMyOrder = catchAsync(async (req, res, next) => {
  try {
    const order = await consumerOrderService.getConsumerOrderById(req.user.id, req.params.orderId);
    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  try {
    const order = await orderServiceMain.cancelOrder(req.params.orderId, req.user.id, req.body.reason);
    res.status(200).json({
      status: 'success',
      message: 'Commande annulée avec succès',
      data: { order }
    });
  } catch (error) {
    return next(new AppError(error.message, error.message.includes('ne peut pas') ? 400 : 404));
  }
});

exports.trackOrder = catchAsync(async (req, res, next) => {
  try {
    const result = await consumerOrderService.trackConsumerOrder(req.user.id, req.params.orderId);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

