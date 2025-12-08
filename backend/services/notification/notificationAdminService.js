const Notification = require('../../models/Notification');

/**
 * Service pour l'administration des notifications
 */

/**
 * Créer une notification système
 */
async function createSystemNotification(adminId, { recipients, type, title, message, channels, scheduledFor, expiresAt }) {
  if (!recipients || recipients.length === 0) {
    throw new Error('Au moins un destinataire requis');
  }

  const notifications = [];

  // Créer une notification pour chaque destinataire
  for (const recipientId of recipients) {
    const notification = await Notification.createNotification({
      recipient: recipientId,
      sender: adminId,
      type: type || 'announcement',
      category: 'system',
      title,
      message,
      channels: channels || {
        inApp: { enabled: true },
        email: { enabled: true },
        push: { enabled: true }
      },
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    notifications.push(notification);
  }

  return notifications;
}

/**
 * Obtenir toutes les notifications (admin)
 */
async function getAllNotifications(queryParams = {}, adminId = null) {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const queryObj = {
    recipientModel: 'Admin' // Filtrer uniquement les notifications destinées aux admins
  };
  
  // Si c'est un admin, filtrer par ses notifications uniquement
  if (adminId) {
    queryObj.recipient = adminId;
  } else if (queryParams.recipient) {
    queryObj.recipient = queryParams.recipient;
  }
  
  if (queryParams.type) queryObj.type = queryParams.type;
  if (queryParams.category) queryObj.category = queryParams.category;
  if (queryParams.status) queryObj.status = queryParams.status;

  console.log('[getAllNotifications] Requête de recherche:', JSON.stringify(queryObj, null, 2));
  
  // Populate le recipient selon son modèle (User ou Admin)
  const notifications = await Notification.find(queryObj)
    .populate({
      path: 'recipient',
      select: 'firstName lastName email userType role',
      options: { strictPopulate: false }
    })
    .populate({
      path: 'sender',
      select: 'firstName lastName userType',
      options: { strictPopulate: false }
    })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  console.log(`[getAllNotifications] ${notifications.length} notification(s) trouvée(s) pour l'admin ${adminId}`);

  const total = await Notification.countDocuments(queryObj);
  
  // Calculer le nombre de notifications non lues pour l'admin
  const unreadCount = await Notification.countDocuments({
    ...queryObj,
    readAt: { $exists: false },
    status: { $in: ['pending', 'sent', 'delivered'] }
  });
  
  console.log(`[getAllNotifications] Total: ${total}, Non lues: ${unreadCount}`);

  return {
    notifications,
    total,
    unreadCount,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Obtenir les statistiques des notifications
 */
async function getNotificationStats({ period = '30d' }) {
  const periodDays = parseInt(period.replace('d', ''));
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  // Statistiques par type
  const typeStats = await Notification.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        readRate: {
          $avg: { $cond: [{ $exists: ['$readAt', true] }, 1, 0] }
        },
        clickRate: {
          $avg: { $cond: [{ $exists: ['$clickedAt', true] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Statistiques par canal
  const channelStats = await Notification.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalNotifications: { $sum: 1 },
        emailSent: {
          $sum: { $cond: [{ $eq: ['$channels.email.sent', true] }, 1, 0] }
        },
        smsSent: {
          $sum: { $cond: [{ $eq: ['$channels.sms.sent', true] }, 1, 0] }
        },
        pushSent: {
          $sum: { $cond: [{ $eq: ['$channels.push.sent', true] }, 1, 0] }
        },
        emailDelivered: {
          $sum: { $cond: [{ $exists: ['$channels.email.deliveredAt', true] }, 1, 0] }
        },
        emailOpened: {
          $sum: { $cond: [{ $exists: ['$channels.email.openedAt', true] }, 1, 0] }
        }
      }
    }
  ]);

  return {
    typeStats,
    channelStats: channelStats[0] || {},
    period
  };
}

/**
 * Renvoyer une notification échouée
 */
async function retryFailedNotification(notificationId) {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new Error('Notification non trouvée');
  }

  if (notification.status !== 'failed') {
    throw new Error('Seules les notifications échouées peuvent être renvoyées');
  }

  // Réinitialiser les statuts d'envoi
  notification.status = 'pending';
  notification.channels.email.sent = false;
  notification.channels.sms.sent = false;
  notification.channels.push.sent = false;
  notification.channels.email.failureReason = undefined;
  notification.channels.sms.failureReason = undefined;
  notification.channels.push.failureReason = undefined;

  await notification.save();

  // Renvoyer
  const results = await notification.sendToAllChannels();

  return { notification, results };
}

/**
 * Nettoyer les notifications expirées
 */
async function cleanupExpiredNotifications() {
  const result = await Notification.cleanupExpired();
  return result;
}

/**
 * Traiter les notifications planifiées
 */
async function processScheduledNotifications() {
  const scheduledNotifications = await Notification.getScheduledNotifications();

  const results = [];

  for (const notification of scheduledNotifications) {
    try {
      const sendResults = await notification.sendToAllChannels();
      results.push({
        notificationId: notification._id,
        success: true,
        results: sendResults
      });
    } catch (error) {
      results.push({
        notificationId: notification._id,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * Envoyer une notification de test
 */
async function sendTestNotification(adminId, { recipientId, channels }) {
  const notification = await Notification.createNotification({
    recipient: recipientId || adminId,
    sender: adminId,
    type: 'test',
    category: 'system',
    title: 'Notification de test',
    message: 'Ceci est une notification de test',
    channels: channels || {
      inApp: { enabled: true },
      email: { enabled: true },
      push: { enabled: true }
    }
  });

  const results = await notification.sendToAllChannels();

  return { notification, results };
}

/**
 * Obtenir les statistiques de performance
 */
async function getPerformanceStats({ period = '30d' }) {
  const periodDays = parseInt(period.replace('d', ''));
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  const stats = await Notification.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        read: { $sum: { $cond: [{ $exists: ['$readAt', true] }, 1, 0] } },
        clicked: { $sum: { $cond: [{ $exists: ['$clickedAt', true] }, 1, 0] } },
        dismissed: { $sum: { $cond: [{ $eq: ['$status', 'dismissed'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
      }
    }
  ]);

  const result = stats[0] || {};
  const readRate = result.total > 0 ? (result.read / result.total) * 100 : 0;
  const clickRate = result.total > 0 ? (result.clicked / result.total) * 100 : 0;

  return {
    ...result,
    readRate: parseFloat(readRate.toFixed(2)),
    clickRate: parseFloat(clickRate.toFixed(2)),
    period
  };
}

module.exports = {
  createSystemNotification,
  getAllNotifications,
  getNotificationStats,
  retryFailedNotification,
  cleanupExpiredNotifications,
  processScheduledNotifications,
  sendTestNotification,
  getPerformanceStats
};

