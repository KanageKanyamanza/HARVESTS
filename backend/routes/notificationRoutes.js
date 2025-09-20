const express = require('express');
const notificationController = require('../controllers/notificationController');
const authController = require('../controllers/authController');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authController.protect);
router.use(authController.requireVerification);

// ROUTES UTILISATEUR

// Obtenir mes notifications
router.get('/my', notificationController.getMyNotifications);

// Obtenir le nombre de notifications non lues
router.get('/my/unread-count', notificationController.getUnreadCount);

// Obtenir les notifications par catégorie
router.get('/my/category/:category', notificationController.getNotificationsByCategory);

// Marquer une notification comme lue
router.patch('/:id/read', notificationController.markAsRead);

// Marquer toutes les notifications comme lues
router.patch('/my/read-all', notificationController.markAllAsRead);

// Marquer une notification comme cliquée
router.patch('/:id/clicked', notificationController.markAsClicked);

// Rejeter/masquer une notification
router.patch('/:id/dismiss', notificationController.dismissNotification);

// Supprimer une notification
router.delete('/:id', notificationController.deleteNotification);

// Préférences de notification
router.route('/my/preferences')
  .get(notificationController.getNotificationPreferences)
  .patch(notificationController.updateNotificationPreferences);

// ROUTES SYSTÈME (pour les producteurs/vendeurs)

// Notifier stock faible
router.post('/system/low-stock', 
  authController.restrictTo('producer', 'transformer'),
  notificationController.notifyLowStock
);

// Notifier produit de nouveau disponible
router.post('/system/back-in-stock',
  authController.restrictTo('producer', 'transformer'),
  notificationController.notifyBackInStock
);

// ROUTES ADMIN

router.use(authController.restrictTo('admin'));

// Créer une notification système
router.post('/system/create', notificationController.createSystemNotification);

// Obtenir toutes les notifications
router.get('/admin/all', notificationController.getAllNotifications);

// Statistiques des notifications
router.get('/admin/stats', notificationController.getNotificationStats);

// Performance des notifications
router.get('/admin/performance', notificationController.getPerformanceStats);

// Renvoyer une notification échouée
router.post('/:id/retry', notificationController.retryFailedNotification);

// Nettoyer les notifications expirées
router.delete('/admin/cleanup-expired', notificationController.cleanupExpiredNotifications);

// Traiter les notifications planifiées
router.post('/admin/process-scheduled', notificationController.processScheduledNotifications);

// Envoyer une notification de test
router.post('/admin/test', notificationController.sendTestNotification);

// Envoyer une promotion
router.post('/admin/promotion', notificationController.notifyPromotion);

// Webhook pour les événements de notification
router.post('/webhook/:provider', notificationController.handleNotificationWebhook);

module.exports = router;
