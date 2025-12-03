const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const notificationAdminService = require('../../services/notification/notificationAdminService');
const notificationSystemService = require('../../services/notification/notificationSystemService');

// Créer une notification système (admin)
exports.createSystemNotification = catchAsync(async (req, res, next) => {
  try {
    const notifications = await notificationAdminService.createSystemNotification(req.user.id, req.body);

    res.status(201).json({
      status: 'success',
      message: `${notifications.length} notification(s) créée(s)`,
      data: {
        notifications: notifications.slice(0, 5) // Retourner seulement les 5 premières
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// Obtenir toutes les notifications (admin)
exports.getAllNotifications = catchAsync(async (req, res, next) => {
  try {
    const adminId = req.admin ? req.admin._id : null;
    const result = await notificationAdminService.getAllNotifications(req.query, adminId);

    res.status(200).json({
      status: 'success',
      results: result.notifications.length,
      total: result.total,
      unreadCount: result.unreadCount,
      page: result.page,
      totalPages: result.totalPages,
      data: {
        notifications: result.notifications
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// Statistiques des notifications (admin)
exports.getNotificationStats = catchAsync(async (req, res, next) => {
  try {
    const result = await notificationAdminService.getNotificationStats(req.query);

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// Renvoyer une notification échouée
exports.retryFailedNotification = catchAsync(async (req, res, next) => {
  try {
    const result = await notificationAdminService.retryFailedNotification(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Notification renvoyée',
      data: {
        results: result.results
      }
    });
  } catch (error) {
    return next(new AppError(error.message, error.message.includes('non trouv') ? 404 : 400));
  }
});

// Nettoyer les notifications expirées
exports.cleanupExpiredNotifications = catchAsync(async (req, res, next) => {
  try {
    const result = await notificationAdminService.cleanupExpiredNotifications();

    res.status(200).json({
      status: 'success',
      message: `${result.deletedCount} notification(s) expirée(s) supprimée(s)`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// Traiter les notifications planifiées
exports.processScheduledNotifications = catchAsync(async (req, res, next) => {
  try {
    const results = await notificationAdminService.processScheduledNotifications();

    res.status(200).json({
      status: 'success',
      message: `${results.length} notification(s) planifiée(s) traitée(s)`,
      data: {
        results
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// Envoyer une notification de test
exports.sendTestNotification = catchAsync(async (req, res, next) => {
  try {
    const { recipient, channels } = req.body;
    const result = await notificationAdminService.sendTestNotification(req.user.id, {
      recipientId: recipient,
      channels
    });

    res.status(201).json({
      status: 'success',
      data: {
        notification: result.notification,
        results: result.results
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// Obtenir les statistiques de performance des notifications
exports.getPerformanceStats = catchAsync(async (req, res, next) => {
  try {
    const result = await notificationAdminService.getPerformanceStats(req.query);

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// Notification de stock faible
exports.notifyLowStock = catchAsync(async (req, res, next) => {
  try {
    const { productId, currentStock, threshold } = req.body;
    await notificationSystemService.notifyLowStock(productId, currentStock, threshold);

    res.status(201).json({
      status: 'success',
      message: 'Notification de stock faible envoyée'
    });
  } catch (error) {
    return next(new AppError(error.message, error.message.includes('non trouvé') ? 404 : 400));
  }
});

// Notification de produit de nouveau disponible
exports.notifyBackInStock = catchAsync(async (req, res, next) => {
  try {
    const { productId } = req.body;
    const notifications = await notificationSystemService.notifyBackInStock(productId);

    res.status(201).json({
      status: 'success',
      message: `${notifications.length} notification(s) envoyée(s)`,
      data: {
        notificationsSent: notifications.length
      }
    });
  } catch (error) {
    return next(new AppError(error.message, error.message.includes('non trouvé') ? 404 : 400));
  }
});

// Notification de promotion/réduction
exports.notifyPromotion = catchAsync(async (req, res, next) => {
  try {
    const notifications = await notificationSystemService.notifyPromotion(req.user.id, req.body);

    res.status(201).json({
      status: 'success',
      message: `Promotion envoyée à ${notifications.length} utilisateur(s)`,
      data: {
        notificationsSent: notifications.length
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

