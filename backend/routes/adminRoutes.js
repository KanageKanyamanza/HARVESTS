const express = require('express');
const adminAuthController = require('../controllers/adminAuthController');
const adminManagementController = require('../controllers/admin/adminManagementController');
const adminDashboardController = require('../controllers/admin/adminDashboardController');
const adminUserController = require('../controllers/admin/adminUserController');
const adminProductController = require('../controllers/admin/adminProductController');
const adminDishController = require('../controllers/admin/adminDishController');
const adminOrderController = require('../controllers/admin/adminOrderController');
const adminReviewController = require('../controllers/admin/adminReviewController');
const adminMessageController = require('../controllers/admin/adminMessageController');
const adminPaymentController = require('../controllers/admin/adminPaymentController');
const adminDeliveryController = require('../controllers/admin/adminDeliveryController');
const adminAnalyticsController = require('../controllers/admin/adminAnalyticsController');
const adminSettingsController = require('../controllers/admin/adminSettingsController');
const adminTransporterController = require('../controllers/admin/adminTransporterController');
const adminAuditController = require('../controllers/admin/adminAuditController');

const router = express.Router();

// Toutes les routes admin nécessitent une authentification admin
router.use(adminAuthController.protect);

// ========================================
// DASHBOARD ET STATISTIQUES
// ========================================

// Statistiques générales du dashboard
router.get('/dashboard/stats', adminDashboardController.getDashboardStats);

// Données détaillées pour le dashboard
router.get('/dashboard/recent-orders', adminDashboardController.getRecentOrders);
router.get('/dashboard/pending-products', adminDashboardController.getPendingProducts);
router.get('/dashboard/sales-chart', adminDashboardController.getSalesChart);
router.get('/dashboard/user-stats', adminDashboardController.getUserStats);
router.get('/dashboard/top-producers', adminDashboardController.getTopProducers);
router.get('/dashboard/product-stats', adminDashboardController.getProductStats);

// ========================================
// GESTION DES UTILISATEURS
// ========================================

// Obtenir tous les utilisateurs avec filtres
router.get('/users', adminUserController.getAllUsers);

// Obtenir un utilisateur spécifique
router.get('/users/:id', adminUserController.getUserById);

// Mettre à jour un utilisateur
router.patch('/users/:id', adminUserController.updateUser);

// Supprimer un utilisateur
router.delete('/users/:id', adminUserController.deleteUser);

// Bannir un utilisateur
router.post('/users/:id/ban', adminUserController.banUser);

// Débannir un utilisateur
router.post('/users/:id/unban', adminUserController.unbanUser);

// Vérifier un utilisateur
router.post('/users/:id/verify', adminUserController.verifyUser);

// ========================================
// GESTION DES PRODUITS
// ========================================

// Obtenir tous les produits avec filtres
router.get('/products', adminProductController.getAllProducts);

// Obtenir un produit spécifique
router.get('/products/:id', adminProductController.getProductById);

// Mettre à jour un produit
router.patch('/products/:id', adminProductController.updateProduct);

// Supprimer un produit
router.delete('/products/:id', adminProductController.deleteProduct);

// Approuver un produit
router.post('/products/:id/approve', adminProductController.approveProduct);

// Rejeter un produit
router.post('/products/:id/reject', adminProductController.rejectProduct);

// Mettre en vedette un produit
router.post('/products/:id/feature', adminProductController.featureProduct);

// Retirer de la vedette
router.post('/products/:id/unfeature', adminProductController.unfeatureProduct);

// ========================================
// GESTION DES PLATS (RESTAURATEURS)
// ========================================

// Obtenir tous les plats avec filtres
router.get('/dishes', adminDishController.getAllDishes);

// Obtenir un plat spécifique
router.get('/dishes/:id', adminDishController.getDishById);

// Mettre à jour un plat
router.patch('/dishes/:id', adminDishController.updateDish);

// Supprimer un plat
router.delete('/dishes/:id', adminDishController.deleteDish);

// Approuver un plat
router.post('/dishes/:id/approve', adminDishController.approveDish);

// Rejeter un plat
router.post('/dishes/:id/reject', adminDishController.rejectDish);

// ========================================
// GESTION DES COMMANDES
// ========================================

// Obtenir toutes les commandes avec filtres
router.get('/orders', adminOrderController.getAllOrders);

// Obtenir une commande spécifique
router.get('/orders/:id', adminOrderController.getOrderById);

// Mettre à jour le statut d'une commande
router.patch('/orders/:id/status', adminOrderController.updateOrderStatus);

// Mettre à jour le statut de paiement d'une commande
router.patch('/orders/:id/payment-status', adminOrderController.updateOrderPaymentStatus);

// Annuler une commande
router.post('/orders/:id/cancel', adminOrderController.cancelOrder);

// Obtenir les transporteurs disponibles pour une commande
router.get('/orders/:id/available-transporters', adminTransporterController.getAvailableTransporters);

// Assigner un transporteur à une commande
router.post('/orders/:id/assign-transporter', adminTransporterController.assignTransporterToOrder);

// ========================================
// GESTION DES AVIS
// ========================================

// Obtenir tous les avis avec filtres
router.get('/reviews', adminReviewController.getAllReviews);

// Obtenir un avis spécifique
router.get('/reviews/:id', adminReviewController.getReviewById);

// Mettre à jour un avis
router.patch('/reviews/:id', adminReviewController.updateReview);

// Supprimer un avis
router.delete('/reviews/:id', adminReviewController.deleteReview);

// Approuver un avis
router.post('/reviews/:id/approve', adminReviewController.approveReview);

// Rejeter un avis
router.post('/reviews/:id/reject', adminReviewController.rejectReview);

// ========================================
// GESTION DES MESSAGES/SUPPORT
// ========================================

// Obtenir tous les messages avec filtres
router.get('/messages', adminMessageController.getAllMessages);

// Obtenir un message spécifique
router.get('/messages/:id', adminMessageController.getMessageById);

// Répondre à un message
router.post('/messages/:id/reply', adminMessageController.replyToMessage);

// Marquer un message comme lu
router.post('/messages/:id/read', adminMessageController.markAsRead);

// Supprimer un message
router.delete('/messages/:id', adminMessageController.deleteMessage);

// ========================================
// GESTION DES PAIEMENTS
// ========================================

// Obtenir tous les paiements avec filtres
router.get('/payments', adminPaymentController.getAllPayments);

// Obtenir un paiement spécifique
router.get('/payments/:id', adminPaymentController.getPaymentById);

// Mettre à jour le statut d'un paiement
router.patch('/payments/:id/status', adminPaymentController.updatePaymentStatus);

// Rembourser un paiement
router.post('/payments/:id/refund', adminPaymentController.refundPayment);

// ========================================
// GESTION DES LIVRAISONS
// ========================================

// Obtenir toutes les livraisons avec filtres
router.get('/deliveries', adminDeliveryController.getAllDeliveries);

// Obtenir une livraison spécifique
router.get('/deliveries/:id', adminDeliveryController.getDeliveryById);

// Mettre à jour le statut d'une livraison
router.patch('/deliveries/:id/status', adminDeliveryController.updateDeliveryStatus);

// Assigner un transporteur
router.post('/deliveries/:id/assign', adminDeliveryController.assignTransporter);

// ========================================
// RAPPORTS ET ANALYTICS
// ========================================

// Obtenir les analytics
router.get('/analytics', adminAnalyticsController.getAnalytics);

// Obtenir les rapports
router.get('/reports/:type', adminAnalyticsController.getReports);

// Exporter des données
router.get('/export/:type', adminAnalyticsController.exportData);

// ========================================
// PARAMÈTRES SYSTÈME
// ========================================

// Obtenir les paramètres système
router.get('/settings', adminSettingsController.getSystemSettings);

// Mettre à jour les paramètres système
router.patch('/settings', adminSettingsController.updateSystemSettings);

// ========================================
// AUDIT LOGS
// ========================================

// Obtenir les logs d'audit
router.get('/audit-logs', adminAuditController.getAuditLogs);

module.exports = router;
