// Méthodes statiques
function addNotificationStatics(notificationSchema) {
  notificationSchema.statics.createNotification = async function(data) {
    // S'assurer que data est un objet JavaScript simple (sérialiser les objets complexes)
    if (data && data.data) {
      // Convertir data.data en objet JavaScript simple si nécessaire
      if (typeof data.data === 'object' && data.data !== null) {
        try {
          // Forcer la sérialisation complète en passant par JSON
          data.data = JSON.parse(JSON.stringify(data.data));
        } catch (e) {
          console.warn('⚠️ [Notification] Erreur lors de la sérialisation de data:', e.message);
        }
      }
    }
    
    // Debug: vérifier les données avant sauvegarde
    if (data && data.data) {
      console.log('📝 [Notification] Création notification avec:', {
        type: data.type,
        hasData: !!data.data,
        hasProducts: !!(data.data.products),
        productsCount: data.data.products ? data.data.products.length : 0,
        hasBuyer: !!(data.data.buyer),
        dataKeys: Object.keys(data.data)
      });
    }
    
    const notification = new this(data);
    
    // Forcer la sérialisation du champ data avant sauvegarde
    // Mongoose peut avoir des problèmes avec Mixed, donc on s'assure que c'est bien sérialisé
    if (notification.data && typeof notification.data === 'object') {
      try {
        // Marquer le champ comme modifié pour forcer la sauvegarde
        notification.markModified('data');
        // S'assurer que data est bien un objet JavaScript simple
        notification.data = JSON.parse(JSON.stringify(notification.data));
      } catch (e) {
        console.warn('⚠️ [Notification] Erreur lors de la préparation de data pour sauvegarde:', e.message);
      }
    }
    
    await notification.save();
    
    // Vérifier après sauvegarde que les données sont toujours présentes
    const savedNotification = await this.findById(notification._id).lean();
    if (savedNotification && savedNotification.data) {
      console.log('💾 [Notification] Données après sauvegarde:', {
        hasData: !!savedNotification.data,
        hasProducts: !!(savedNotification.data.products),
        productsCount: savedNotification.data.products ? savedNotification.data.products.length : 0,
        hasBuyer: !!(savedNotification.data.buyer),
        dataKeys: Object.keys(savedNotification.data)
      });
    }
    
    // Envoyer immédiatement si pas planifié
    if (!notification.scheduledFor || notification.scheduledFor <= new Date()) {
      await notification.sendToAllChannels();
    }
    
    return notification;
  };

  notificationSchema.statics.getUnreadCount = function(userId) {
    return this.countDocuments({
      recipient: userId,
      readAt: { $exists: false },
      status: { $in: ['pending', 'sent', 'delivered', 'failed'] } // Inclure 'failed'
    });
  };

  notificationSchema.statics.getByCategory = function(userId, category, limit = 20) {
    return this.find({
      recipient: userId,
      category: category
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'firstName lastName avatar');
  };

  notificationSchema.statics.markAllAsRead = function(userId, category = null) {
    const query = {
      recipient: userId,
      readAt: { $exists: false }
    };
    
    if (category) {
      query.category = category;
    }
    
    return this.updateMany(query, {
      readAt: new Date(),
      status: 'read'
    });
  };

  notificationSchema.statics.cleanupExpired = function() {
    return this.deleteMany({
      expiresAt: { $lt: new Date() },
      status: { $nin: ['read', 'clicked'] }
    });
  };

  notificationSchema.statics.getScheduledNotifications = function() {
    return this.find({
      status: 'pending',
      scheduledFor: { $lte: new Date() },
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });
  };
}

module.exports = addNotificationStatics;

