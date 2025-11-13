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
  
  // Pour les commandes : informations du client (buyer)
  buyer: {
    firstName: String,
    lastName: String,
    fullName: String,
    email: String,
    phone: String
  },
  
  // Pour les commandes : détails des produits
  products: [{
    name: String,
    description: String,
    images: [String],
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  
  // Statut de commande
  status: String,
  
  // Données génériques
  customData: mongoose.Schema.Types.Mixed
}, { _id: false, strict: false });

// Schéma principal des notifications
const notificationSchema = new mongoose.Schema({
  // Destinataire (peut être un User ou un Admin)
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'recipientModel',
    required: [true, 'Destinataire requis']
  },
  // Modèle du destinataire (User ou Admin)
  recipientModel: {
    type: String,
    enum: ['User', 'Admin'],
    default: 'User'
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
      'order_created_buyer',
      'order_confirmed',
      'order_confirmed_seller',
      'order_preparing',
      'order_preparing_seller',
      'order_ready_for_pickup',
      'order_ready_for_pickup_seller',
      'order_ready_for_pickup_transporter',
      'order_shipped',
      'order_in_transit',
      'order_in_transit_seller',
      'order_in_transit_transporter',
      'order_delivered',
      'order_delivered_seller',
      'order_completed',
      'order_completed_seller',
      'order_cancelled',
      'order_cancelled_seller',
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
    const Admin = mongoose.model('Admin');
    
    // Récupérer la notification fraîche depuis la base de données pour s'assurer d'avoir toutes les données
    // Utiliser .lean() pour obtenir un objet JavaScript simple directement
    const freshNotification = await this.constructor.findById(this._id).lean();
    
    if (!freshNotification) {
      throw new Error('Notification non trouvée dans la base de données');
    }
    
    // Chercher d'abord dans User, puis dans Admin
    let recipient = await User.findById(freshNotification.recipient);
    if (!recipient) {
      recipient = await Admin.findById(freshNotification.recipient);
    }
    
    if (!recipient) {
      throw new Error('Destinataire non trouvé (ni User ni Admin)');
    }
    
    // S'assurer que data est un objet JavaScript simple avec toutes les propriétés
    // Utiliser JSON.parse/stringify pour forcer la sérialisation complète des objets complexes
    let dataToSend = null;
    if (freshNotification.data) {
      try {
        // Forcer la sérialisation complète en passant par JSON
        dataToSend = JSON.parse(JSON.stringify(freshNotification.data));
      } catch (e) {
        console.warn('⚠️ [Notification] Erreur lors de la sérialisation de data:', e.message);
        // Fallback: utiliser directement l'objet
        dataToSend = freshNotification.data;
      }
    }
    
    // S'assurer que actions est un tableau JavaScript simple
    const actionsToSend = freshNotification.actions ? (Array.isArray(freshNotification.actions) 
      ? freshNotification.actions.map(action => typeof action === 'object' && action !== null 
          ? JSON.parse(JSON.stringify(action)) 
          : action) 
      : freshNotification.actions) : null;
    
    // Debug: vérifier les données avant envoi
    console.log('📧 [Notification.sendViaEmail] Données préparées:', {
      hasData: !!dataToSend,
      hasProducts: !!(dataToSend && dataToSend.products),
      productsCount: dataToSend && dataToSend.products ? dataToSend.products.length : 0,
      hasBuyer: !!(dataToSend && dataToSend.buyer),
      dataKeys: dataToSend ? Object.keys(dataToSend) : []
    });
    
    await new Email(recipient).sendNotification({
      title: freshNotification.title,
      message: freshNotification.message,
      data: dataToSend,
      actions: actionsToSend
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
    console.error('Erreur envoi email notification:', error.message);
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

// Fonction utilitaire pour construire une URL complète du frontend
function buildFrontendUrl(path) {
  const frontendUrl = process.env.FRONTEND_URL || 'https://harvests-khaki.vercel.app';
  // Supprimer le slash final de l'URL du frontend si présent
  const baseUrl = frontendUrl.replace(/\/$/, '');
  // S'assurer que le chemin commence par un slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

// Méthodes pour créer des notifications spécifiques
notificationSchema.statics.notifyOrderCreated = async function(order) {
  const User = mongoose.model('User');
  const sellerIds = new Set();

  const getIdString = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (value._id) return value._id.toString();
    if (typeof value === 'object' && typeof value.toString === 'function') {
      return value.toString();
    }
    return null;
  };

  const pushSellerId = (value) => {
    const id = getIdString(value);
    if (id) {
      sellerIds.add(id);
    }
  };

  pushSellerId(order.seller);

  const segmentInfoMap = new Map();

  (order.segments || []).forEach((segment) => {
    const sellerKey = getIdString(segment?.seller);
    if (sellerKey) {
      pushSellerId(sellerKey);
      segmentInfoMap.set(sellerKey, {
        status: segment.status || null,
        segmentId: segment._id?.toString?.() || null
      });
    }
  });

  if (sellerIds.size === 0 && Array.isArray(order.items)) {
    order.items.forEach((item) => pushSellerId(item?.seller));
  }

  // Récupérer les informations du client (buyer)
  let buyerInfo = null;
  if (order.buyer) {
    const buyerId = order.buyer._id || order.buyer;
    const buyer = await User.findById(buyerId).select('firstName lastName email phone');
    if (buyer) {
      buyerInfo = {
        firstName: buyer.firstName || '',
        lastName: buyer.lastName || '',
        fullName: `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim() || 'Client',
        email: buyer.email || '',
        phone: buyer.phone || ''
      };
    }
  }

  // Préparer les détails des produits avec segments et vendeurs
  const sellerInfoCache = new Map();

  const getSellerInfo = async (sellerId) => {
    if (!sellerId) return null;
    if (sellerInfoCache.has(sellerId)) {
      return sellerInfoCache.get(sellerId);
    }

    const seller = await User.findById(sellerId).select('firstName lastName companyName farmName restaurantName businessName name userType');
    if (!seller) {
      sellerInfoCache.set(sellerId, null);
      return null;
    }

    const displayName = seller.farmName || seller.companyName || seller.restaurantName || seller.businessName || seller.name || `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || 'Vendeur';
    const info = {
      id: sellerId,
      name: displayName,
      userType: seller.userType || null
    };
    sellerInfoCache.set(sellerId, info);
    return info;
  };

  const productsDetails = [];
  if (Array.isArray(order.items)) {
    for (const item of order.items) {
      const images = item.productSnapshot?.images || [];
      const productName = item.productSnapshot?.name || 'Produit';
      const productDescription = item.productSnapshot?.description || '';

      const sellerId = getIdString(item.seller) || getIdString(item.productSnapshot?.producer) || getIdString(item.productSnapshot?.transformer) || getIdString(item.productSnapshot?.restaurateur);
      const sellerInfo = sellerId ? await getSellerInfo(sellerId) : null;
      const segmentInfo = sellerId ? segmentInfoMap.get(sellerId) : null;
      if (segmentInfo && sellerInfo?.name) {
        segmentInfoMap.set(sellerId, {
          ...segmentInfo,
          sellerName: sellerInfo.name
        });
      }

      const productStatus = item.status || segmentInfo?.status || order.status || 'pending';

      productsDetails.push({
        name: productName,
        description: productDescription,
        images: Array.isArray(images) ? images : [],
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        totalPrice: item.totalPrice || 0,
        status: productStatus,
        seller: sellerId ? {
          id: sellerId,
          name: sellerInfo?.name || null,
          type: sellerInfo?.userType || null
        } : null,
        segment: segmentInfo ? {
          id: segmentInfo.segmentId || null,
          status: segmentInfo.status || null,
          sellerId,
          sellerName: segmentInfo.sellerName || sellerInfo?.name || null
        } : null
      });
    }
  }

  const notifications = [];

  // Fonction pour construire l'URL de commande selon le type d'utilisateur
  const buildOrderUrl = async (userId) => {
    const user = await User.findById(userId).select('userType');
    if (!user) {
      // Par défaut, utiliser /consumer/orders/ si l'utilisateur n'est pas trouvé
      return buildFrontendUrl(`/consumer/orders/${order._id}`);
    }
    
    const userType = user.userType;
    // Mapper les types d'utilisateurs aux routes appropriées
    const routeMap = {
      'consumer': '/consumer/orders',
      'restaurateur': '/restaurateur/orders',
      'producer': '/producer/orders',
      'transformer': '/transformer/orders',
      'exporter': '/exporter/orders',
      'transporter': '/transporter/orders'
    };
    
    const baseRoute = routeMap[userType] || '/consumer/orders';
    return buildFrontendUrl(`${baseRoute}/${order._id}`);
  };

  // Notifier tous les vendeurs concernés
  if (sellerIds.size > 0) {
    const sellerNotificationsPromises = Array.from(sellerIds).map(async (sellerId) => {
      const orderUrl = await buildOrderUrl(sellerId);
      const sellerInfo = await getSellerInfo(sellerId);
      const segmentInfo = segmentInfoMap.get(sellerId) || null;
      const sellerProducts = productsDetails.filter((product) => product.seller?.id === sellerId);
      const productsForSeller = sellerProducts.length > 0 ? sellerProducts : productsDetails;
      const sellerAmount = productsForSeller.reduce((sum, product) => sum + (Number(product.totalPrice) || 0), 0);
      return this.createNotification({
        recipient: sellerId,
        type: 'order_created',
        category: 'order',
        title: 'Nouvelle commande reçue',
        message: `Vous avez reçu une nouvelle commande (${order.orderNumber}) d'un montant de ${sellerAmount || order.total} ${order.currency}${buyerInfo ? ` de ${buyerInfo.fullName}` : ''}`,
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          amount: sellerAmount || order.total,
          currency: order.currency,
          buyer: buyerInfo,
          status: segmentInfo?.status || order.status,
          segment: segmentInfo ? {
            id: segmentInfo.segmentId || null,
            status: segmentInfo.status || null,
            sellerId,
            sellerName: segmentInfo.sellerName || sellerProducts[0]?.seller?.name || sellerInfo?.name || null
          } : null,
          products: productsForSeller
        },
        actions: [{
          type: 'view',
          label: 'Voir la commande',
          url: orderUrl
        }],
        channels: {
          inApp: { enabled: true },
          email: { enabled: true },
          push: { enabled: true }
        }
      });
    });
    const sellerNotifications = await Promise.all(sellerNotificationsPromises);
    notifications.push(...sellerNotifications);
  }

  // Notifier l'acheteur de la création de sa commande
  if (order.buyer) {
    const buyerId = order.buyer._id || order.buyer;
    const orderUrl = await buildOrderUrl(buyerId);
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
        currency: order.currency,
        status: order.status || 'pending',
        products: productsDetails
      },
      actions: [{
        type: 'view',
        label: 'Voir ma commande',
        url: orderUrl
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
      url: buildFrontendUrl(`/products/${product.slug || product._id}`)
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
