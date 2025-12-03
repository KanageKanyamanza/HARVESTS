// Virtuals
function addNotificationVirtuals(notificationSchema) {
  notificationSchema.virtual('isRead').get(function() {
    return !!this.readAt;
  });

  notificationSchema.virtual('isExpired').get(function() {
    return this.expiresAt && this.expiresAt < new Date();
  });

  notificationSchema.virtual('isScheduled').get(function() {
    return this.scheduledFor && this.scheduledFor > new Date();
  });

  notificationSchema.virtual('canBeSent').get(function() {
    return !this.isExpired && 
           (this.status === 'pending' || this.status === 'failed') &&
           (!this.scheduledFor || this.scheduledFor <= new Date());
  });

  notificationSchema.virtual('totalInteractions').get(function() {
    return this.interactions ? this.interactions.length : 0;
  });
}

module.exports = addNotificationVirtuals;

