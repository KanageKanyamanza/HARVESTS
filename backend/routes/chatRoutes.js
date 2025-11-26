const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../controllers/authController');

// Routes publiques
router.get('/search-products', chatController.searchProducts);
router.get('/search-sellers', chatController.searchSellers);
router.get('/search-transporters', chatController.searchTransporters);
router.get('/categories', chatController.getCategories);

// Routes avec authentification optionnelle (public pour l'instant)
router.get('/track/:orderNumber', chatController.trackOrder);

// Routes protégées
router.get('/my-orders', protect, chatController.getMyRecentOrders);

module.exports = router;

