const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../controllers/auth/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: 💳 Paiements (Wave, Stripe, PayPal, Orange Money)
 */

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware.protect);
router.use(authMiddleware.requireVerification);

// ROUTES UTILISATEUR

// Obtenir un client token PayPal pour les Hosted Fields
router.get('/paypal/client-token', paymentController.getPaypalClientToken);

// Créer un ordre PayPal pour les Hosted Fields (sans redirection)
router.post('/paypal/hosted-fields/order', paymentController.createOrderForHostedFields);

/**
 * @swagger
 * /api/v1/payments/initiate:
 *   post:
 *     summary: Initier un paiement
 *     description: Créer une transaction de paiement pour une commande
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - method
 *               - amount
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: objectId
 *               method:
 *                 type: string
 *                 enum: [wave, orange-money, stripe, paypal]
 *                 example: wave
 *               amount:
 *                 type: number
 *                 example: 18500
 *               phone:
 *                 type: string
 *                 description: Requis pour Wave et Orange Money
 *                 example: "+221771234567"
 *     responses:
 *       201:
 *         description: Paiement initié avec succès
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/initiate', paymentController.initiatePayment);

// Confirmer un paiement
router.post('/:id/confirm', paymentController.confirmPayment);

// Obtenir mes paiements
router.get('/my', paymentController.getMyPayments);

/**
 * @swagger
 * /api/v1/payments/{id}:
 *   get:
 *     summary: Obtenir un paiement spécifique
 *     tags: [Payments]
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
 *         description: Détails du paiement
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', paymentController.getPayment);

// Demander un remboursement
router.post('/:id/refund', paymentController.requestRefund);

// ROUTES VENDEUR

// Obtenir mes revenus (vendeurs)
router.get('/my/revenue', 
  authMiddleware.restrictTo('producer', 'transformer', 'exporter'),
  paymentController.getMyRevenue
);

// ROUTES ADMIN

router.use(authMiddleware.restrictTo('admin'));

// Obtenir tous les paiements
router.get('/admin/all', paymentController.getAllPayments);

// Traiter un remboursement
router.patch('/admin/refunds/:refundId/process', paymentController.processRefund);

// Statistiques des paiements
router.get('/admin/stats', paymentController.getPaymentStats);

// Réconciliation
router.get('/admin/unreconciled', paymentController.getUnreconciledPayments);
router.patch('/admin/:id/reconcile', paymentController.reconcilePayment);

// WEBHOOKS

// Webhook pour les fournisseurs de paiement (sans authentification)
router.post('/webhook/:provider', paymentController.handlePaymentWebhook);

module.exports = router;
