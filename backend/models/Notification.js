const mongoose = require('mongoose');
const { toPlainText } = require('../utils/localization');

// Schéma pour les données spécifiques selon le type de notification
const notificationDataSchema = new mongoose.Schema({
  // Pour les commandes
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  orderNumber: String,
  
  // Pour les produits
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: String,
  
  // Pour les avis
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  },
  
  // Pour les messages
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  
  // Pour les paiements
  paymentId: String,
  amount: Number,
  currency: String,
  
  // Pour les utilisateurs
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: String,
  
  // Données génériques
  customData: mongoose.Schema.Types.Mixed
}, { _id: false });

// Schéma principal des notifications
const notificationSchema = new mongoose.Schema({
  // Destinataire
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Destinataire requis']
  },
  
  // Expéditeur (optionnel, pour les notifications système)
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Type de notification
  type: {
    type: String,
    required: [true, 'Type de notification requis'],
    enum: [
      // Commandes
      'order_created',
      'order_confirmed',
      'order_preparing',
      'order_ready_for_pickup',
      'order_shipped',
      'order_in_transit',
      'order_delivered',
      'order_completed',
      'order_cancelled',
      'order_refunded',
      'order_disputed',
      'order_payment_received',
      'order_payment_failed',
      
      // Produits
      'product_approved',
      'product_rejected',
      'product_low_stock',
      'product_out_of_stock',
      'product_back_in_stock',
      'product_price_changed',
      'wishlist_item_available',
      
      // Avis et évaluations
      'review_received',
      'review_response_received',
      'review_helpful_vote',
      
      // Messages et chat
      'message_received',
      'conversation_started',
      
      // Compte utilisateur
      'account_approved',
      'account_rejected',
      'account_suspended',
      'profile_updated',
      'document_verified',
      'document_rejected',
      
      // Livraisons
      'delivery_assigned',
      'delivery_picked_up',
      'delivery_in_transit',
      'delivery_out_for_delivery',
      'delivery_delivered',
      'delivery_failed',
      
      // Paiements
      'payment_received',
      'payment_sent',
      'payment_failed',
      'payout_processed',
      'invoice_generated',
      
      // Promotions et marketing
      'promotion_started',
      'discount_available',
      'seasonal_reminder',
      'harvest_season_alert',
      
      // Système
      'maintenance_scheduled',
      'system_update',
      'security_alert',
      'backup_completed',
      
      // Abonnements
      'subscription_renewed',
      'subscription_cancelled',
      'subscription_payment_failed',
      
      // Général
      'welcome',
      'reminder',
      'announcement',
      'custom'
    ]
  },
  
  // Catégorie pour le groupement
  category: {
    type: String,
    enum: ['order', 'product', 'account', 'payment', 'message', 'system', 'marketing'],
    required: true
  },
  
  // Priorité
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Contenu de la notification
  title: {
    type: String,
    required: [true, 'Titre requis'],
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  
  message: {
    type: String,
    required: [true, 'Message requis'],
    maxlength: [1000, 'Le message ne peut pas dépasser 1000 caractères']
  },
  
  // Contenu riche (HTML)
  richContent: {
    html: String,
    template: String,
    variables: mongoose.Schema.Types.Mixed
  },
  
  // Données spécifiques
  data: notificationDataSchema,
  
  // Actions possibles
  actions: [{
    type: {
      type: String,
      enum: ['view', 'approve', 'reject', 'pay', 'respond', 'download', 'custom']
    },
    label: String,
    url: String,
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE'],
      default: 'GET'
    },
    payload: mongoose.Schema.Types.Mixed
  }],
  
  // Statut
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'clicked', 'dismissed', 'failed'],
    default: 'pending'
  },
  
  // Canaux de diffusion
  channels: {
    inApp: {
      enabled: { type: Boolean, default: true },
      sent: { type: Boolean, default: false },
      sentAt: Date,
      readAt: Date
    },
    email: {
      enabled: { type: Boolean, default: false },
      sent: { type: Boolean, default: false },
      sentAt: Date,
      deliveredAt: Date,
      openedAt: Date,
      clickedAt: Date,
      failureReason: String
    },
    sms: {
      enabled: { type: Boolean, default: false },
      sent: { type: Boolean, default: false },
      sentAt: Date,
      deliveredAt: Date,
      failureReason: String
    },
    push: {
      enabled: { type: Boolean, default: false },
      sent: { type: Boolean, default: false },
      sentAt: Date,
      deliveredAt: Date,
      clickedAt: Date,
      failureReason: String
    }
  },
  
  // Métadonnées
  metadata: {
    source: String, // D'où vient la notification
    tags: [String],
    locale: {
      type: String,
      default: 'fr'
    },
    timezone: String,
    deviceInfo: {
      platform: String,
      version: String
    }
  },
  
  // Planification
  scheduledFor: Date,
  expiresAt: Date,
  
  // Groupement (pour éviter le spam)
  groupKey: String, // Clé pour grouper les notifications similaires
  
  // Statut de lecture et interaction
  readAt: Date,
  clickedAt: Date,
  dismissedAt: Date,
  
  // Tracking
  interactions: [{
    type: {
      type: String,
      enum: ['view', 'click', 'dismiss', 'share']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    data: mongoose.Schema.Types.Mixed
  }]
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour performance
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

// Virtuals
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

// Middleware pre-save
notificationSchema.pre('save', function(next) {
  // Définir la catégorie automatiquement basée sur le type
  if (!this.category) {
    const typeToCategory = {
      'order_': 'order',
      'product_': 'product',
      'account_': 'account',
      'payment_': 'payment',
      'message_': 'message',
      'delivery_': 'order',
      'review_': 'product',
      'system_': 'system',
      'promotion_': 'marketing'
    };
    
    for (const [prefix, cat] of Object.entries(typeToCategory)) {
      if (this.type.startsWith(prefix)) {
        this.category = cat;
        break;
      }
    }
  }
  
  // Générer une clé de groupe si non définie
  if (!this.groupKey) {
    this.groupKey = `${this.recipient}_${this.type}_${this.data?.orderId || this.data?.productId || 'general'}`;
  }
  
  next();
});

// Méthodes du schéma
notificationSchema.methods.markAsRead = function() {
  if (!this.readAt) {
    this.readAt = new Date();
    this.status = 'read';
    
    // Marquer le canal in-app comme lu
    if (this.channels.inApp.enabled) {
      this.channels.inApp.readAt = this.readAt;
    }
  }
  
  return this.save();
};

notificationSchema.methods.markAsClicked = function(actionType = null) {
  this.clickedAt = new Date();
  if (this.status !== 'read') {
    this.status = 'clicked';
  }
  
  // Ajouter l'interaction
  this.interactions.push({
    type: 'click',
    timestamp: this.clickedAt,
    data: { actionType }
  });
  
  return this.save();
};

notificationSchema.methods.dismiss = function() {
  this.dismissedAt = new Date();
  this.interactions.push({
    type: 'dismiss',
    timestamp: this.dismissedAt
  });
  
  return this.save();
};

notificationSchema.methods.sendViaEmail = async function() {
  if (!this.channels.email.enabled || this.channels.email.sent) {
    return false;
  }
  
  try {
    const Email = require('../utils/email');
    const User = mongoose.model('User');
    
    const recipient = await User.findById(this.recipient);
    if (!recipient) {
      throw new Error('Destinataire non trouvé');
    }
    
    // Envoyer l'email (implémentation à compléter)
    await new Email(recipient).sendNotification({
      title: this.title,
      message: this.message,
      data: this.data,
      actions: this.actions
    });
    
    this.channels.email.sent = true;
    this.channels.email.sentAt = new Date();
    
    if (this.status === 'pending') {
      this.status = 'sent';
    }
    
    await this.save();
    return true;
    
  } catch (error) {
    this.channels.email.failureReason = error.message;
    await this.save();
    return false;
  }
};

notificationSchema.methods.sendViaSMS = async function() {
  if (!this.channels.sms.enabled || this.channels.sms.sent) {
    return false;
  }
  
  try {
    // Intégration avec service SMS (à implémenter)
    // Exemple: Twilio, Africa's Talking, etc.
    
    this.channels.sms.sent = true;
    this.channels.sms.sentAt = new Date();
    
    if (this.status === 'pending') {
      this.status = 'sent';
    }
    
    await this.save();
    return true;
    
  } catch (error) {
    this.channels.sms.failureReason = error.message;
    await this.save();
    return false;
  }
};

notificationSchema.methods.sendViaPush = async function() {
  if (!this.channels.push.enabled || this.channels.push.sent) {
    return false;
  }
  
  try {
    // Intégration avec Firebase Cloud Messaging ou similaire
    // (à implémenter)
    
    this.channels.push.sent = true;
    this.channels.push.sentAt = new Date();
    
    if (this.status === 'pending') {
      this.status = 'sent';
    }
    
    await this.save();
    return true;
    
  } catch (error) {
    this.channels.push.failureReason = error.message;
    await this.save();
    return false;
  }
};

notificationSchema.methods.sendToAllChannels = async function() {
  const results = {
    inApp: true, // Toujours disponible
    email: false,
    sms: false,
    push: false
  };
  
  // Envoyer par email si activé (sans bloquer si échec)
  if (this.channels.email.enabled) {
    try {
      results.email = await this.sendViaEmail();
    } catch (error) {
      console.error('Erreur envoi email:', error.message);
      this.channels.email.failureReason = error.message;
    }
  }
  
  // Envoyer par SMS si activé (sans bloquer si échec)
  if (this.channels.sms.enabled) {
    try {
      results.sms = await this.sendViaSMS();
    } catch (error) {
      console.error('Erreur envoi SMS:', error.message);
      this.channels.sms.failureReason = error.message;
    }
  }
  
  // Envoyer par push si activé (sans bloquer si échec)
  if (this.channels.push.enabled) {
    try {
      results.push = await this.sendViaPush();
    } catch (error) {
      console.error('Erreur envoi push:', error.message);
      this.channels.push.failureReason = error.message;
    }
  }
  
  // Marquer comme envoyé in-app (toujours disponible)
  this.channels.inApp.sent = true;
  this.channels.inApp.sentAt = new Date();
  
  // Marquer comme envoyé si au moins inApp fonctionne
  if (this.status === 'pending') {
    this.status = 'sent';
  }
  
  await this.save();
  
  return results;
};

// Méthodes statiques
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  
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

// Méthodes pour créer des notifications spécifiques
notificationSchema.statics.notifyOrderCreated = function(order) {
  const sellerIds = new Set();

  const pushSellerId = (value) => {
    if (!value) return;
    if (typeof value === 'string') {
      sellerIds.add(value);
      return;
    }
    if (value._id) {
      sellerIds.add(value._id.toString());
      return;
    }
    if (typeof value.toString === 'function') {
      sellerIds.add(value.toString());
    }
  };

  pushSellerId(order.seller);

  (order.segments || []).forEach((segment) => {
    pushSellerId(segment?.seller);
  });

  if (sellerIds.size === 0 && Array.isArray(order.items)) {
    order.items.forEach((item) => pushSellerId(item?.seller));
  }

  const notifications = [];

  // Notifier tous les vendeurs concernés
  if (sellerIds.size > 0) {
    const sellerNotifications = Array.from(sellerIds).map((sellerId) =>
      this.createNotification({
        recipient: sellerId,
        type: 'order_created',
        category: 'order',
        title: 'Nouvelle commande reçue',
        message: `Vous avez reçu une nouvelle commande (${order.orderNumber}) d'un montant de ${order.total} ${order.currency}`,
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          amount: order.total,
          currency: order.currency
        },
        actions: [{
          type: 'view',
          label: 'Voir la commande',
          url: `/orders/${order._id}`
        }],
        channels: {
          inApp: { enabled: true },
          email: { enabled: true },
          push: { enabled: true }
        }
      })
    );
    notifications.push(...sellerNotifications);
  }

  // Notifier l'acheteur de la création de sa commande
  if (order.buyer) {
    const buyerNotification = this.createNotification({
      recipient: order.buyer,
      type: 'order_created_buyer',
      category: 'order',
      title: 'Commande créée avec succès',
      message: `Votre commande ${order.orderNumber} a été créée avec succès. Montant total : ${order.total} ${order.currency}`,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: order.total,
        currency: order.currency
      },
      actions: [{
        type: 'view',
        label: 'Voir ma commande',
        url: `/orders/${order._id}`
      }],
      channels: {
        inApp: { enabled: true },
        email: { enabled: true },
        push: { enabled: true }
      }
    });
    notifications.push(buyerNotification);
  }

  return Promise.all(notifications);
};

notificationSchema.statics.notifyProductApproved = function(product, explicitOwner = null) {
  const ownersMap = new Map();

  const registerOwner = (candidate) => {
    if (!candidate) return;

    if (Array.isArray(candidate)) {
      candidate.forEach(registerOwner);
      return;
    }

    const ownerId = candidate._id || candidate;
    if (!ownerId) return;

    const key = ownerId.toString();
    if (!ownersMap.has(key)) {
      ownersMap.set(key, candidate);
    }
  };

  registerOwner(explicitOwner);
  registerOwner(product.producer);
  registerOwner(product.transformer);
  registerOwner(product.restaurateur);

  if (ownersMap.size === 0) {
    console.warn('Notification produit approuvé : aucun propriétaire identifié', {
      productId: product?._id?.toString()
    });
    return Promise.resolve([]);
  }

  const localizedName = toPlainText(product?.name, 'Produit');

  const notifications = Array.from(ownersMap.keys()).map((ownerId) => this.createNotification({
    recipient: ownerId,
    type: 'product_approved',
    category: 'product',
    title: 'Produit approuvé',
    message: `Votre produit "${localizedName}" a été approuvé et est maintenant visible sur la marketplace`,
    data: {
      productId: product._id,
      productName: localizedName
    },
    actions: [{
      type: 'view',
      label: 'Voir le produit',
      url: `/products/${product.slug || product._id}`
    }],
    channels: {
      inApp: { enabled: true },
      email: { enabled: true }
    }
  }));

  return Promise.all(notifications);
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
