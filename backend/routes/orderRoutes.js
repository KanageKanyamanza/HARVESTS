const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../controllers/auth/authMiddleware');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware.protect);

// Routes de lecture (autorisées sans vérification d'email)
router.get('/my', orderController.getMyOrders);
router.get('/:id/tracking', orderController.trackOrder);
router.get('/:id', orderController.getOrder);
router.post('/estimate', orderController.estimateOrderCosts);

// Routes d'écriture (nécessitent une vérification d'email)
router.use(authMiddleware.requireVerification);

// ROUTES COMMUNES

// Créer une nouvelle commande
router.post('/', orderController.createOrder);

// Route de test pour créer une commande (TEMPORAIRE)
router.post('/test', orderController.createTestOrder);

// Ces routes sont maintenant définies avant requireVerification

// Mettre à jour le statut d'une commande
router.patch('/:id/status', orderController.updateOrderStatus);

// Annuler une commande
router.patch('/:id/cancel', orderController.cancelOrder);

// Cette route est maintenant définie avant requireVerification

// ROUTES ADMIN

router.use(authMiddleware.restrictTo('admin'));

// Obtenir toutes les commandes
router.get('/', orderController.getAllOrders);

// Statistiques des commandes
router.get('/stats/overview', orderController.getOrderStats);

module.exports = router;
