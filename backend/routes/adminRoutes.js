const express = require('express');
const adminController = require('../controllers/adminController');
const adminAuthController = require('../controllers/adminAuthController');

const router = express.Router();

// Toutes les routes admin nécessitent une authentification admin
router.use(adminAuthController.protect);

// ========================================
// DASHBOARD ET STATISTIQUES
// ========================================

// Statistiques générales du dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// Données détaillées pour le dashboard
router.get('/dashboard/recent-orders', adminController.getRecentOrders);
router.get('/dashboard/pending-products', adminController.getPendingProducts);
router.get('/dashboard/sales-chart', adminController.getSalesChart);
router.get('/dashboard/user-stats', adminController.getUserStats);
router.get('/dashboard/top-producers', adminController.getTopProducers);
router.get('/dashboard/product-stats', adminController.getProductStats);

// ========================================
// GESTION DES UTILISATEURS
// ========================================

// Obtenir tous les utilisateurs avec filtres
router.get('/users', adminController.getAllUsers);

// Obtenir un utilisateur spécifique
router.get('/users/:id', adminController.getUserById);

// Mettre à jour un utilisateur
router.patch('/users/:id', adminController.updateUser);

// Supprimer un utilisateur
router.delete('/users/:id', adminController.deleteUser);

// Bannir un utilisateur
router.post('/users/:id/ban', adminController.banUser);

// Débannir un utilisateur
router.post('/users/:id/unban', adminController.unbanUser);

// Vérifier un utilisateur
router.post('/users/:id/verify', adminController.verifyUser);

// ========================================
// GESTION DES PRODUITS
// ========================================

// Obtenir tous les produits avec filtres
router.get('/products', adminController.getAllProducts);

// Obtenir un produit spécifique
router.get('/products/:id', adminController.getProductById);

// Mettre à jour un produit
router.patch('/products/:id', adminController.updateProduct);

// Supprimer un produit
router.delete('/products/:id', adminController.deleteProduct);

// Approuver un produit
router.post('/products/:id/approve', adminController.approveProduct);

// Rejeter un produit
router.post('/products/:id/reject', adminController.rejectProduct);

// Mettre en vedette un produit
router.post('/products/:id/feature', adminController.featureProduct);

// Retirer de la vedette
router.post('/products/:id/unfeature', adminController.unfeatureProduct);

// ========================================
// GESTION DES PLATS (RESTAURATEURS)
// ========================================

// Obtenir tous les plats avec filtres
router.get('/dishes', adminController.getAllDishes);

// Obtenir un plat spécifique
router.get('/dishes/:id', adminController.getDishById);

// Mettre à jour un plat
router.patch('/dishes/:id', adminController.updateDish);

// Supprimer un plat
router.delete('/dishes/:id', adminController.deleteDish);

// Approuver un plat
router.post('/dishes/:id/approve', adminController.approveDish);

// Rejeter un plat
router.post('/dishes/:id/reject', adminController.rejectDish);

// ========================================
// GESTION DES COMMANDES
// ========================================

// Obtenir toutes les commandes avec filtres
router.get('/orders', adminController.getAllOrders);

// Obtenir une commande spécifique
router.get('/orders/:id', adminController.getOrderById);

// Mettre à jour le statut d'une commande
router.patch('/orders/:id/status', adminController.updateOrderStatus);

// Mettre à jour le statut de paiement d'une commande
router.patch('/orders/:id/payment-status', adminController.updateOrderPaymentStatus);

// Annuler une commande
router.post('/orders/:id/cancel', adminController.cancelOrder);

// ========================================
// GESTION DES AVIS
// ========================================

// Obtenir tous les avis avec filtres
router.get('/reviews', adminController.getAllReviews);

// Obtenir un avis spécifique
router.get('/reviews/:id', adminController.getReviewById);

// Mettre à jour un avis
router.patch('/reviews/:id', adminController.updateReview);

// Supprimer un avis
router.delete('/reviews/:id', adminController.deleteReview);

// Approuver un avis
router.post('/reviews/:id/approve', adminController.approveReview);

// Rejeter un avis
router.post('/reviews/:id/reject', adminController.rejectReview);

// ========================================
// GESTION DES MESSAGES/SUPPORT
// ========================================

// Obtenir tous les messages avec filtres
router.get('/messages', adminController.getAllMessages);

// Obtenir un message spécifique
router.get('/messages/:id', adminController.getMessageById);

// Répondre à un message
router.post('/messages/:id/reply', adminController.replyToMessage);

// Marquer un message comme lu
router.post('/messages/:id/read', adminController.markAsRead);

// Supprimer un message
router.delete('/messages/:id', adminController.deleteMessage);

// ========================================
// GESTION DES PAIEMENTS
// ========================================

// Obtenir tous les paiements avec filtres
router.get('/payments', adminController.getAllPayments);

// Obtenir un paiement spécifique
router.get('/payments/:id', adminController.getPaymentById);

// Mettre à jour le statut d'un paiement
router.patch('/payments/:id/status', adminController.updatePaymentStatus);

// Rembourser un paiement
router.post('/payments/:id/refund', adminController.refundPayment);

// ========================================
// GESTION DES LIVRAISONS
// ========================================

// Obtenir toutes les livraisons avec filtres
router.get('/deliveries', adminController.getAllDeliveries);

// Obtenir une livraison spécifique
router.get('/deliveries/:id', adminController.getDeliveryById);

// Mettre à jour le statut d'une livraison
router.patch('/deliveries/:id/status', adminController.updateDeliveryStatus);

// Assigner un transporteur
router.post('/deliveries/:id/assign', adminController.assignTransporter);

// ========================================
// RAPPORTS ET ANALYTICS
// ========================================

// Obtenir les analytics
router.get('/analytics', adminController.getAnalytics);

// Obtenir les rapports
router.get('/reports/:type', adminController.getReports);

// Exporter des données
router.get('/export/:type', adminController.exportData);

// ========================================
// PARAMÈTRES SYSTÈME
// ========================================

// Obtenir les paramètres système
router.get('/settings', adminController.getSystemSettings);

// Mettre à jour les paramètres système
router.patch('/settings', adminController.updateSystemSettings);

module.exports = router;
