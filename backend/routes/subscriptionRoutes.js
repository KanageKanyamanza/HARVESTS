const express = require('express');
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../controllers/auth/authMiddleware');
const adminAuthController = require('../controllers/adminAuthController');

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: 📋 Gestion des abonnements
 */

const router = express.Router();

// Routes admin (doivent être avant les routes avec :id pour éviter les conflits)
// Utiliser adminAuthController pour les routes admin car les admins se connectent via adminAuthController
router.get('/stats/overview', adminAuthController.protect, subscriptionController.getSubscriptionStats);
router.get('/admin', adminAuthController.protect, subscriptionController.getAllSubscriptions);
router.patch('/admin/:id/status', adminAuthController.protect, subscriptionController.updateSubscriptionStatus);

/**
 * @swagger
 * /api/v1/subscriptions/me:
 *   get:
 *     summary: Obtenir mes abonnements
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des abonnements
 */
router.get('/me', authMiddleware.protect, subscriptionController.getMySubscriptions);

/**
 * @swagger
 * /api/v1/subscriptions:
 *   post:
 *     summary: Créer un nouvel abonnement
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plan
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: [free, basic, premium, enterprise]
 *               duration:
 *                 type: string
 *                 enum: [monthly, quarterly, yearly]
 *     responses:
 *       201:
 *         description: Abonnement créé
 */
router.post('/', authMiddleware.protect, subscriptionController.createSubscription);

/**
 * @swagger
 * /api/v1/subscriptions/activate-free:
 *   post:
 *     summary: Activer le plan gratuit
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Plan gratuit activé
 */
router.post('/activate-free', authMiddleware.protect, subscriptionController.activateFreePlan);

/**
 * @swagger
 * /api/v1/subscriptions/{id}:
 *   get:
 *     summary: Obtenir un abonnement spécifique
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     responses:
 *       200:
 *         description: Détails de l'abonnement
 *   patch:
 *     summary: Mettre à jour un abonnement
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Abonnement mis à jour
 */
router.get('/:id', authMiddleware.protect, subscriptionController.getSubscription);
router.patch('/:id', authMiddleware.protect, subscriptionController.updateSubscription);

/**
 * @swagger
 * /api/v1/subscriptions/{id}/cancel:
 *   patch:
 *     summary: Annuler un abonnement
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     responses:
 *       200:
 *         description: Abonnement annulé
 */
router.patch('/:id/cancel', authMiddleware.protect, subscriptionController.cancelSubscription);

/**
 * @swagger
 * /api/v1/subscriptions/{id}/renew:
 *   post:
 *     summary: Renouveler un abonnement
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     responses:
 *       200:
 *         description: Abonnement renouvelé
 */
router.post('/:id/renew', authMiddleware.protect, subscriptionController.renewSubscription);

/**
 * @swagger
 * /api/v1/subscriptions/{id}/payments:
 *   get:
 *     summary: Obtenir les paiements d'un abonnement
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     responses:
 *       200:
 *         description: Liste des paiements
 */
router.get('/:id/payments', authMiddleware.protect, subscriptionController.getSubscriptionPayments);

module.exports = router;

