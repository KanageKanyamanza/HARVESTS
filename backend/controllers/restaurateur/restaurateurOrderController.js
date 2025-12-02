const orderController = require('../orderController');
const catchAsync = require('../../utils/catchAsync');

// Fonction temporaire pour les fonctionnalités en cours de développement
const temporaryResponse = (message) => catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: `Fonctionnalité en cours de développement - ${message}`,
    data: {}
  });
});

// Créer une commande
exports.createOrder = (req, res, next) => orderController.createOrder(req, res, next);

// Obtenir mes commandes
exports.getMyOrders = (req, res, next) => orderController.getMyOrders(req, res, next);

// Obtenir une commande
exports.getMyOrder = (req, res, next) => {
  if (!req.params.id && req.params.orderId) {
    req.params.id = req.params.orderId;
  }
  return orderController.getOrder(req, res, next);
};

// Mettre à jour le statut d'une commande
exports.updateOrderStatus = (req, res, next) => {
  if (!req.params.id && req.params.orderId) {
    req.params.id = req.params.orderId;
  }
  return orderController.updateOrderStatus(req, res, next);
};

// Fonctions temporaires
exports.updateOrder = temporaryResponse('Mise à jour commande');
exports.cancelOrder = temporaryResponse('Annulation commande');
exports.trackOrder = temporaryResponse('Suivi commande');

