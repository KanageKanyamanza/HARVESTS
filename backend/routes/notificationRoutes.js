const express = require('express');
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../controllers/auth/authMiddleware');
const adminAuthController = require('../controllers/adminAuthController');

const router = express.Router();

// ROUTES UTILISATEUR (authentification normale)
// Appliquer l'authentification utilisateur seulement aux routes utilisateur
const userRoutes = express.Router();
userRoutes.use(authMiddleware.protect);
userRoutes.use(authMiddleware.requireVerification);

// Obtenir mes notifications
userRoutes.get('/my', notificationController.getMyNotifications);

// Obtenir le nombre de notifications non lues
userRoutes.get('/my/unread-count', notificationController.getUnreadCount);

// Obtenir les notifications par catégorie
userRoutes.get('/my/category/:category', notificationController.getNotificationsByCategory);

// Marquer une notification comme lue
userRoutes.patch('/:id/read', notificationController.markAsRead);

// Marquer toutes les notifications comme lues
userRoutes.patch('/my/read-all', notificationController.markAllAsRead);

// Marquer une notification comme cliquée
userRoutes.patch('/:id/clicked', notificationController.markAsClicked);

// Rejeter/masquer une notification
userRoutes.patch('/:id/dismiss', notificationController.dismissNotification);

// Supprimer une notification
userRoutes.delete('/:id', notificationController.deleteNotification);

// Préférences de notification
userRoutes.route('/my/preferences')
  .get(notificationController.getNotificationPreferences)
  .patch(notificationController.updateNotificationPreferences);

// ROUTES SYSTÈME (pour les producteurs/vendeurs)
// Appliquer l'authentification utilisateur aux routes système
const systemRoutes = express.Router();
systemRoutes.use(authMiddleware.protect);
systemRoutes.use(authMiddleware.requireVerification);

// Notifier stock faible
systemRoutes.post('/system/low-stock', 
  authMiddleware.restrictTo('producer', 'transformer'),
  notificationController.notifyLowStock
);

// Notifier produit de nouveau disponible
systemRoutes.post('/system/back-in-stock',
  authMiddleware.restrictTo('producer', 'transformer'),
  notificationController.notifyBackInStock
);

// ROUTES ADMIN (authentification admin)
// Créer une notification système
router.post('/admin/system/create', adminAuthController.protect, notificationController.createSystemNotification);

// Obtenir toutes les notifications
router.get('/admin/all', adminAuthController.protect, notificationController.getAllNotifications);

// Obtenir le nombre de notifications non lues (pour les admins)
router.get('/admin/unread-count', adminAuthController.protect, notificationController.getUnreadCount);

// Marquer une notification comme lue (pour les admins)
router.patch('/admin/:id/read', adminAuthController.protect, notificationController.markAsRead);

// Marquer toutes les notifications comme lues (pour les admins)
router.patch('/admin/read-all', adminAuthController.protect, notificationController.markAllAsRead);

// Statistiques des notifications
router.get('/admin/stats', adminAuthController.protect, notificationController.getNotificationStats);

// Performance des notifications
router.get('/admin/performance', adminAuthController.protect, notificationController.getPerformanceStats);

// Renvoyer une notification échouée
router.post('/admin/:id/retry', adminAuthController.protect, notificationController.retryFailedNotification);

// Nettoyer les notifications expirées
router.delete('/admin/cleanup-expired', adminAuthController.protect, notificationController.cleanupExpiredNotifications);

// Traiter les notifications planifiées
router.post('/admin/process-scheduled', adminAuthController.protect, notificationController.processScheduledNotifications);

// Envoyer une notification de test
router.post('/admin/test', adminAuthController.protect, notificationController.sendTestNotification);

// Envoyer une promotion
router.post('/admin/promotion', adminAuthController.protect, notificationController.notifyPromotion);

// Webhook pour les événements de notification
router.post('/admin/webhook/:provider', adminAuthController.protect, notificationController.handleNotificationWebhook);

// Monter les sous-routers
router.use('/', userRoutes);
router.use('/', systemRoutes);

module.exports = router;
