const Consumer = require('../../models/Consumer');
const Notification = require('../../models/Notification');

/**
 * Service pour la gestion des notifications du consommateur
 */

async function getNotifications(consumerId, limit = 20) {
  const notifications = await Notification.find({ user: consumerId })
    .sort('-createdAt')
    .limit(limit);
  
  return notifications;
}

async function markNotificationsAsRead(consumerId) {
  await Notification.updateMany(
    { user: consumerId, read: false },
    { read: true, readAt: new Date() }
  );
}

async function markNotificationAsRead(consumerId, notificationId) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: consumerId },
    { read: true, readAt: new Date() },
    { new: true }
  );
  
  if (!notification) {
    throw new Error('Notification non trouvée');
  }
  
  return notification;
}

async function deleteNotification(consumerId, notificationId) {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    user: consumerId
  });
  
  if (!notification) {
    throw new Error('Notification non trouvée');
  }
  
  return notification;
}

module.exports = {
  getNotifications,
  markNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification
};

