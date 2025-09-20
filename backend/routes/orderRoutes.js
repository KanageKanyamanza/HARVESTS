const express = require('express');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authController.protect);
router.use(authController.requireVerification);

// ROUTES COMMUNES

// Créer une nouvelle commande
router.post('/', orderController.createOrder);

// Obtenir mes commandes
router.get('/my', orderController.getMyOrders);

// Obtenir une commande spécifique
router.get('/:id', orderController.getOrder);

// Mettre à jour le statut d'une commande
router.patch('/:id/status', orderController.updateOrderStatus);

// Annuler une commande
router.patch('/:id/cancel', orderController.cancelOrder);

// Suivi d'une commande
router.get('/:id/tracking', orderController.trackOrder);

// ROUTES ADMIN

router.use(authController.restrictTo('admin'));

// Obtenir toutes les commandes
router.get('/', orderController.getAllOrders);

// Statistiques des commandes
router.get('/stats/overview', orderController.getOrderStats);

module.exports = router;
