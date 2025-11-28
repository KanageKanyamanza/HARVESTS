const express = require('express');
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../controllers/auth/authMiddleware');
const adminAuthController = require('../controllers/adminAuthController');

const router = express.Router();

// Routes admin (doivent être avant les routes avec :id pour éviter les conflits)
// Utiliser adminAuthController pour les routes admin car les admins se connectent via adminAuthController
router.get('/stats/overview', adminAuthController.protect, subscriptionController.getSubscriptionStats);
router.get('/admin', adminAuthController.protect, subscriptionController.getAllSubscriptions);
router.patch('/admin/:id/status', adminAuthController.protect, subscriptionController.updateSubscriptionStatus);

// Routes utilisateur (protégées par authMiddleware)
router.get('/me', authMiddleware.protect, subscriptionController.getMySubscriptions);
router.post('/', authMiddleware.protect, subscriptionController.createSubscription);
router.post('/activate-free', authMiddleware.protect, subscriptionController.activateFreePlan);

// Routes utilisateur avec :id (doivent être après les routes admin)
router.get('/:id', authMiddleware.protect, subscriptionController.getSubscription);
router.patch('/:id', authMiddleware.protect, subscriptionController.updateSubscription);
router.patch('/:id/cancel', authMiddleware.protect, subscriptionController.cancelSubscription);
router.post('/:id/renew', authMiddleware.protect, subscriptionController.renewSubscription);
router.get('/:id/payments', authMiddleware.protect, subscriptionController.getSubscriptionPayments);

module.exports = router;

