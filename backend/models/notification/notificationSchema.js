const mongoose = require('mongoose');

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

module.exports = { notificationSchema, notificationDataSchema };

