const express = require('express');
const subscriptionController = require('../controllers/subscriptionController');
const authController = require('../controllers/authController');
const adminAuthController = require('../controllers/adminAuthController');

const router = express.Router();

// Routes admin (doivent être avant les routes avec :id pour éviter les conflits)
// Utiliser adminAuthController pour les routes admin car les admins se connectent via adminAuthController
router.get('/stats/overview', adminAuthController.protect, subscriptionController.getSubscriptionStats);
router.get('/admin', adminAuthController.protect, subscriptionController.getAllSubscriptions);
router.patch('/admin/:id/status', adminAuthController.protect, subscriptionController.updateSubscriptionStatus);

// Routes utilisateur (protégées par authController)
router.get('/me', authController.protect, subscriptionController.getMySubscriptions);
router.post('/', authController.protect, subscriptionController.createSubscription);
router.post('/activate-free', authController.protect, subscriptionController.activateFreePlan);

// Routes utilisateur avec :id (doivent être après les routes admin)
router.get('/:id', authController.protect, subscriptionController.getSubscription);
router.patch('/:id', authController.protect, subscriptionController.updateSubscription);
router.patch('/:id/cancel', authController.protect, subscriptionController.cancelSubscription);
router.post('/:id/renew', authController.protect, subscriptionController.renewSubscription);
router.get('/:id/payments', authController.protect, subscriptionController.getSubscriptionPayments);

module.exports = router;

