const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../controllers/authController');
const adminAuthController = require('../controllers/adminAuthController');

// Routes publiques
router.get('/search-products', chatController.searchProducts);
router.get('/search-sellers', chatController.searchSellers);
router.get('/search-transporters', chatController.searchTransporters);
router.get('/categories', chatController.getCategories);
router.get('/custom-answers', chatController.getCustomAnswers);

// Routes avec authentification optionnelle (public pour l'instant)
router.get('/track/:orderNumber', chatController.trackOrder);

// Tracking des interactions (public mais enregistre l'utilisateur si connecté)
router.post('/log-interaction', chatController.logInteraction);
router.post('/log-feedback', chatController.logFeedback);

// Routes protégées (utilisateur connecté)
router.get('/my-orders', protect, chatController.getMyRecentOrders);

// ========================================
// ROUTES ADMIN
// ========================================
router.use('/admin', adminAuthController.protect);

// Questions sans réponse
router.get('/admin/unanswered', chatController.getUnansweredQuestions);
router.patch('/admin/unanswered/:id/answer', chatController.answerQuestion);
router.patch('/admin/unanswered/:id/ignore', chatController.ignoreQuestion);

// Statistiques
router.get('/admin/stats', chatController.getChatStats);

// Historique utilisateur
router.get('/admin/user/:userId/history', chatController.getUserChatHistory);

module.exports = router;

