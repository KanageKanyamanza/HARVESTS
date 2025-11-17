const express = require('express');
const paymentController = require('../controllers/paymentController');
const authController = require('../controllers/authController');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authController.protect);
router.use(authController.requireVerification);

// ROUTES UTILISATEUR

// Obtenir un client token PayPal pour les Hosted Fields
router.get('/paypal/client-token', paymentController.getPaypalClientToken);

// Créer un ordre PayPal pour les Hosted Fields (sans redirection)
router.post('/paypal/hosted-fields/order', paymentController.createOrderForHostedFields);

// Initier un paiement
router.post('/initiate', paymentController.initiatePayment);

// Confirmer un paiement
router.post('/:id/confirm', paymentController.confirmPayment);

// Obtenir mes paiements
router.get('/my', paymentController.getMyPayments);

// Obtenir un paiement spécifique
router.get('/:id', paymentController.getPayment);

// Demander un remboursement
router.post('/:id/refund', paymentController.requestRefund);

// ROUTES VENDEUR

// Obtenir mes revenus (vendeurs)
router.get('/my/revenue', 
  authController.restrictTo('producer', 'transformer', 'exporter'),
  paymentController.getMyRevenue
);

// ROUTES ADMIN

router.use(authController.restrictTo('admin'));

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
