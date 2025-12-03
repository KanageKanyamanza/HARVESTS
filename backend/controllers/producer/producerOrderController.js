const orderController = require('../orderController');

// Gestion des commandes
exports.getMyOrders = (req, res, next) => orderController.getMyOrders(req, res, next);

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

