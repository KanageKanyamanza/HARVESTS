// Index pour performance
function addNotificationIndexes(notificationSchema) {
  notificationSchema.index({ recipient: 1, createdAt: -1 });
  notificationSchema.index({ recipient: 1, status: 1 });
  notificationSchema.index({ recipient: 1, category: 1 });
  notificationSchema.index({ type: 1 });
  notificationSchema.index({ scheduledFor: 1 });
  notificationSchema.index({ expiresAt: 1 });
  notificationSchema.index({ groupKey: 1 });
  notificationSchema.index({ 'channels.email.sent': 1 });
  notificationSchema.index({ 'channels.sms.sent': 1 });
  notificationSchema.index({ 'channels.push.sent': 1 });

  // Index composé pour les requêtes fréquentes
  notificationSchema.index({ recipient: 1, status: 1, createdAt: -1 });
}

module.exports = addNotificationIndexes;

