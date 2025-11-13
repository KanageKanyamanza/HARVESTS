const mongoose = require('mongoose');
const {
  ensureSegmentsForOrder,
  updateOrderStatusFromSegments
} = require('../utils/orderSegments');

// Schéma pour les articles de commande
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Produit requis']
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Seulement si le produit a des variantes
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  productSnapshot: {
    name: String,
    description: String,
    images: [String],
    producer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    transformer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    restaurateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  quantity: {
    type: Number,
    required: [true, 'Quantité requise'],
    min: [1, 'La quantité doit être au moins 1']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Prix unitaire requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Prix total requis'],
    min: [0, 'Le prix total ne peut pas être négatif']
  },
  weight: {
    value: Number,
    unit: String
  },
  specialInstructions: String,
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'preparing',
      'ready-for-pickup',
      'in-transit',
      'delivered',
      'completed',
      'cancelled',
      'rejected',
      'refunded',
      'disputed'
    ],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String,
    reason: String
  }]
});

const segmentHistorySchema = new mongoose.Schema({
  status: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  note: String,
  reason: String
}, { _id: false });

const orderSegmentSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'preparing',
      'ready-for-pickup',
      'in-transit',
      'delivered',
      'completed',
      'cancelled',
      'refunded',
      'disputed'
    ],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    default: 0
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  taxes: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  items: [orderItemSchema],
  history: [segmentHistorySchema]
}, {
  timestamps: true
});

// Schéma pour l'adresse de livraison
const deliveryAddressSchema = new mongoose.Schema({
  label: String,
  firstName: String,
  lastName: String,
  company: String,
  street: {
    type: String,
    required: [true, 'Rue requise']
  },
  city: {
    type: String,
    required: [true, 'Ville requise']
  },
  region: {
    type: String,
    required: [true, 'Région requise']
  },
  country: {
    type: String,
    default: 'Senegal'
  },
  postalCode: String,
  phone: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  deliveryInstructions: String
});

// Schéma pour le paiement
const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['cash', 'paypal'],
    required: [true, 'Méthode de paiement requise']
  },
  provider: {
    type: String,
    enum: ['cash-on-delivery', 'paypal'],
    default: function() {
      return this.method === 'cash' ? 'cash-on-delivery' : 'paypal';
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  transactionId: String,
  amount: {
    type: Number,
    required: [true, 'Montant requis']
  },
  currency: {
    type: String,
    default: 'XAF'
  },
  paidAt: Date,
  failureReason: String,
  refundAmount: Number,
  refundedAt: Date,
  fees: {
    platform: Number,
    payment: Number,
    total: Number
  }
});

// Schéma pour la livraison
const deliverySchema = new mongoose.Schema({
  transporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Référence vers un utilisateur de type transporter
  },
  method: {
    type: String,
    enum: ['pickup', 'standard-delivery', 'express-delivery', 'same-day', 'scheduled'],
    required: [true, 'Méthode de livraison requise']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'picked-up', 'in-transit', 'out-for-delivery', 'delivered', 'failed', 'returned'],
    default: 'pending'
  },
  trackingNumber: String,
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,
  deliveryFee: {
    type: Number,
    default: 0
  },
  feeDetail: {
    scope: String,
    method: String,
    reason: String,
    amount: Number
  },
  deliveryAddress: deliveryAddressSchema,
  pickupAddress: deliveryAddressSchema,
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    location: String,
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  proofOfDelivery: {
    signature: String,
    photo: String,
    recipientName: String,
    deliveredAt: Date
  },
  specialRequirements: {
    refrigerated: Boolean,
    fragile: Boolean,
    timeWindow: {
      start: String,
      end: String
    }
  }
});

// Schéma principal de la commande
const orderSchema = new mongoose.Schema({
  // Numéro de commande unique
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Participants
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Acheteur requis']
  },
  
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Articles commandés
  items: [orderItemSchema],

  // Segments par vendeur pour commandes multi-vendeurs
  segments: [orderSegmentSchema],
  
  // Montants
  subtotal: {
    type: Number,
    required: [true, 'Sous-total requis'],
    min: [0, 'Le sous-total ne peut pas être négatif']
  },
  
  deliveryFee: {
    type: Number,
    default: 0,
    min: [0, 'Les frais de livraison ne peuvent pas être négatifs']
  },
  deliveryFeeDetail: {
    scope: String,
    method: String,
    reason: String,
    amount: Number
  },
  
  taxes: {
    type: Number,
    default: 0,
    min: [0, 'Les taxes ne peuvent pas être négatives']
  },
  
  discount: {
    type: Number,
    default: 0,
    min: [0, 'La remise ne peut pas être négative']
  },
  
  total: {
    type: Number,
    required: [true, 'Total requis'],
    min: [0, 'Le total ne peut pas être négatif']
  },
  
  currency: {
    type: String,
    default: 'XAF',
    enum: ['XAF', 'EUR', 'USD', 'XOF']
  },
  
  // Statut de la commande
  status: {
    type: String,
    enum: [
      'pending',           // En attente de confirmation
      'confirmed',         // Confirmée par le vendeur
      'preparing',         // En préparation
      'ready-for-pickup',  // Prête pour collecte
      'in-transit',        // En transit
      'delivered',         // Livrée
      'completed',         // Terminée (paiement confirmé)
      'cancelled',         // Annulée
      'refunded',          // Remboursée
      'disputed'           // En litige
    ],
    default: 'pending'
  },
  
  // Paiement
  payment: paymentSchema,
  
  // Livraison
  delivery: deliverySchema,
  
  // Code de réduction appliqué
  couponCode: String,
  couponDiscount: {
    type: Number,
    default: 0
  },
  
  // Points de fidélité
  loyaltyPointsUsed: {
    type: Number,
    default: 0
  },
  loyaltyPointsEarned: {
    type: Number,
    default: 0
  },
  
  // Notes et instructions
  buyerNotes: String,
  sellerNotes: String,
  internalNotes: String,
  
  // Dates importantes
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  
  // Raisons d'annulation ou de retour
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Informations de facturation
  billingAddress: deliveryAddressSchema,
  invoiceNumber: String,
  
  // Métadonnées
  source: {
    type: String,
    enum: ['web', 'mobile', 'api', 'admin'],
    default: 'web'
  },
  
  deviceInfo: {
    userAgent: String,
    ip: String
  },
  
  // Suivi des modifications
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    note: String
  }],
  
  // Informations pour l'export
  isExport: {
    type: Boolean,
    default: false
  },
  
  exportInfo: {
    destinationCountry: String,
    customsDeclaration: String,
    exportLicense: String,
    incoterms: String,
    exportValue: Number
  },
  
  // Évaluation et avis
  isReviewed: {
    type: Boolean,
    default: false
  },
  
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour performance
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ 'delivery.status': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'delivery.transporter': 1 });

// Virtuals
orderSchema.virtual('totalWeight').get(function() {
  if (!this.items || !Array.isArray(this.items)) {
    return 0;
  }
  return this.items.reduce((total, item) => {
    if (item.weight && item.weight.value) {
      return total + (item.weight.value * item.quantity);
    }
    return total;
  }, 0);
});

orderSchema.virtual('isPaymentPending').get(function() {
  if (!this.payment || !this.payment.status) {
    return false;
  }
  return ['pending', 'processing'].includes(this.payment.status);
});

orderSchema.virtual('isDelivered').get(function() {
  return this.status === 'delivered';
});

orderSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'confirmed'].includes(this.status);
});

orderSchema.virtual('estimatedDelivery').get(function() {
  if (this.delivery && this.delivery.estimatedDeliveryDate) {
    return this.delivery.estimatedDeliveryDate;
  }
  
  // Estimation basée sur la méthode de livraison
  const now = new Date();
  const deliveryDays = {
    'same-day': 0,
    'express-delivery': 1,
    'standard-delivery': 3,
    'scheduled': 7,
    'pickup': 0
  };
  
  const days = deliveryDays[this.delivery?.method] || 3;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
});

// Fonction pour obtenir le préfixe du pays
function getCountryPrefix(countryCode) {
  const countryMap = {
    'CM': 'CM', 'Cameroon': 'CM', 'cameroun': 'CM',
    'SN': 'SN', 'Senegal': 'SN', 'sénégal': 'SN', 'Sénégal': 'SN',
    'CI': 'CI', 'Côte d\'Ivoire': 'CI', 'côte d\'ivoire': 'CI',
    'GH': 'GH', 'Ghana': 'GH', 'ghana': 'GH',
    'NG': 'NG', 'Nigeria': 'NG', 'nigeria': 'NG',
    'KE': 'KE', 'Kenya': 'KE', 'kenya': 'KE',
    'BF': 'BF', 'Burkina Faso': 'BF', 'burkina faso': 'BF',
    'ML': 'ML', 'Mali': 'ML', 'mali': 'ML',
    'NE': 'NE', 'Niger': 'NE', 'niger': 'NE',
    'TD': 'TD', 'Tchad': 'TD', 'tchad': 'TD',
    'CF': 'CF', 'République centrafricaine': 'CF', 'république centrafricaine': 'CF',
    'GA': 'GA', 'Gabon': 'GA', 'gabon': 'GA',
    'CG': 'CG', 'Congo': 'CG', 'congo': 'CG',
    'CD': 'CD', 'République démocratique du Congo': 'CD', 'république démocratique du congo': 'CD',
    'AO': 'AO', 'Angola': 'AO', 'angola': 'AO',
    'ZM': 'ZM', 'Zambie': 'ZM', 'zambie': 'ZM',
    'ZW': 'ZW', 'Zimbabwe': 'ZW', 'zimbabwe': 'ZW',
    'ZA': 'ZA', 'Afrique du Sud': 'ZA', 'afrique du sud': 'ZA',
    'EG': 'EG', 'Égypte': 'EG', 'égypte': 'EG',
    'MA': 'MA', 'Maroc': 'MA', 'maroc': 'MA',
    'TN': 'TN', 'Tunisie': 'TN', 'tunisie': 'TN',
    'DZ': 'DZ', 'Algérie': 'DZ', 'algérie': 'DZ',
    'LY': 'LY', 'Libye': 'LY', 'libye': 'LY',
    'SD': 'SD', 'Soudan': 'SD', 'soudan': 'SD',
    'ET': 'ET', 'Éthiopie': 'ET', 'éthiopie': 'ET',
    'UG': 'UG', 'Ouganda': 'UG', 'ouganda': 'UG',
    'TZ': 'TZ', 'Tanzanie': 'TZ', 'tanzanie': 'TZ',
    'RW': 'RW', 'Rwanda': 'RW', 'rwanda': 'RW',
    'BI': 'BI', 'Burundi': 'BI', 'burundi': 'BI',
    'MW': 'MW', 'Malawi': 'MW', 'malawi': 'MW',
    'MZ': 'MZ', 'Mozambique': 'MZ', 'mozambique': 'MZ',
    'MG': 'MG', 'Madagascar': 'MG', 'madagascar': 'MG',
    'MU': 'MU', 'Maurice': 'MU', 'maurice': 'MU',
    'SC': 'SC', 'Seychelles': 'SC', 'seychelles': 'SC',
    'KM': 'KM', 'Comores': 'KM', 'comores': 'KM',
    'DJ': 'DJ', 'Djibouti': 'DJ', 'djibouti': 'DJ',
    'SO': 'SO', 'Somalie': 'SO', 'somalie': 'SO',
    'ER': 'ER', 'Érythrée': 'ER', 'érythrée': 'ER',
    'SS': 'SS', 'Soudan du Sud': 'SS', 'soudan du sud': 'SS'
  };
  
  // Si c'est déjà un code à 2 lettres, le retourner
  if (countryCode && countryCode.length === 2 && /^[A-Z]{2}$/.test(countryCode)) {
    return countryCode;
  }
  
  // Chercher dans la map
  return countryMap[countryCode] || 'CM'; // Fallback vers Cameroun
}

// Middleware pre-save
orderSchema.pre('validate', async function(next) {
  try {
    if (this.payment) {
      const method = (this.payment.method || '').toLowerCase();
      const normalizedMethod = method === 'paypal' ? 'paypal' : 'cash';
      if (!this.payment.method) {
        this.payment.method = normalizedMethod;
      }
      if (!this.payment.provider || this.payment.provider === '') {
        this.payment.provider = normalizedMethod === 'paypal' ? 'paypal' : 'cash-on-delivery';
      }
    }

    if (!this.orderNumber) {
      const countryCode = this.delivery?.deliveryAddress?.country ||
        this.billingAddress?.country ||
        'CM';
      const countryPrefix = getCountryPrefix(countryCode);
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const count = await this.constructor.countDocuments();
      const countStr = count.toString().padStart(4, '0');
      this.orderNumber = `H${countryPrefix}${countStr}${timestamp.substring(-4)}${random}`;
    }

    next();
  } catch (error) {
    next(error);
  }
});

orderSchema.pre('save', async function(next) {
  // Générer le numéro de commande seulement s'il n'est pas déjà défini
  if (this.isNew && !this.orderNumber) {
    // Format: H + code pays + alphanumérique
    const countryCode = this.delivery?.deliveryAddress?.country || 
                       this.billingAddress?.country || 
                       'CM';
    const countryPrefix = getCountryPrefix(countryCode);
    
    // Générer un identifiant alphanumérique unique
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const count = await this.constructor.countDocuments();
    const countStr = count.toString().padStart(4, '0');
    
    this.orderNumber = `H${countryPrefix}${countStr}${timestamp.substring(-4)}${random}`;
    
    console.log('🔢 Génération orderNumber dans middleware:', {
      countryCode,
      countryPrefix,
      count,
      orderNumber: this.orderNumber
    });
  }
  
  // Calculer le total
  this.total = this.subtotal + this.deliveryFee + this.taxes - this.discount - this.couponDiscount;
  
  // Ajouter à l'historique des statuts si le statut change
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: this.modifiedBy || null // Doit être défini par l'application
    });
  }
  
  next();
});

// Méthodes du schéma
orderSchema.methods.updateStatus = function(newStatus, updatedBy, reason = null, note = null) {
  const oldStatus = this.status;
  const segmentsCreated = ensureSegmentsForOrder(this);
  if (segmentsCreated) {
    // Les segments seront enregistrés lors du save
  }

  const now = new Date();

  if (Array.isArray(this.segments) && this.segments.length > 0) {
    this.segments.forEach((segment) => {
      segment.status = newStatus;
      segment.history = segment.history || [];
      segment.history.push({
        status: newStatus,
        timestamp: now,
        updatedBy,
        reason,
        note
      });
    });
  }

  this.status = newStatus;
  this.modifiedBy = updatedBy;
  
  // Mettre à jour les dates spécifiques
  switch (newStatus) {
    case 'confirmed':
      this.confirmedAt = now;
      break;
    case 'in-transit':
      this.shippedAt = now;
      break;
    case 'delivered':
      this.deliveredAt = now;
      break;
    case 'completed':
      this.completedAt = now;
      break;
    case 'cancelled':
      this.cancelledAt = now;
      this.cancelledBy = updatedBy;
      if (reason) this.cancellationReason = reason;
      break;
  }
  
  // Ajouter à l'historique
  this.statusHistory = this.statusHistory || [];
  this.statusHistory.push({
    status: newStatus,
    timestamp: now,
    updatedBy,
    reason,
    note
  });
 
  updateOrderStatusFromSegments(this, newStatus);

  return this.save();
};

orderSchema.methods.addDeliveryUpdate = function(status, location = null, note = null, updatedBy = null) {
  if (!this.delivery.timeline) {
    this.delivery.timeline = [];
  }
  
  this.delivery.timeline.push({
    status,
    timestamp: new Date(),
    location,
    note,
    updatedBy
  });
  
  // Mettre à jour le statut de livraison
  this.delivery.status = status;
  
  // Mettre à jour le statut de la commande si nécessaire
  const statusMapping = {
    'picked-up': 'in-transit',
    'delivered': 'delivered'
  };
  
  if (statusMapping[status]) {
    this.updateStatus(statusMapping[status], updatedBy);
  }
  
  return this.save();
};

orderSchema.methods.processPayment = async function(paymentData) {
  this.payment.status = 'processing';
  this.payment.transactionId = paymentData.transactionId;
  
  try {
    // Ici on intégrerait avec les services de paiement
    // Stripe, Orange Money, MTN Mobile Money, etc.
    
    this.payment.status = 'completed';
    this.payment.paidAt = new Date();
    
    // Mettre à jour le statut de la commande
    if (this.status === 'pending') {
      await this.updateStatus('confirmed', null, 'Paiement confirmé');
    }
    
    return await this.save();
  } catch (error) {
    this.payment.status = 'failed';
    this.payment.failureReason = error.message;
    await this.save();
    throw error;
  }
};

orderSchema.methods.calculateFees = function() {
  const platformFeeRate = 0.05; // 5% de commission
  const paymentFeeRate = 0.025; // 2.5% de frais de paiement
  
  const platformFee = this.subtotal * platformFeeRate;
  const paymentFee = this.total * paymentFeeRate;
  
  this.payment.fees = {
    platform: Math.round(platformFee),
    payment: Math.round(paymentFee),
    total: Math.round(platformFee + paymentFee)
  };
  
  return this.payment.fees;
};

orderSchema.methods.reserveStock = async function() {
  const Product = mongoose.model('Product');
  
  for (const item of this.items) {
    const product = await Product.findById(item.product);
    if (product) {
      // S'assurer que le produit a le champ userType défini
      if (!product.userType) {
        // Déterminer le userType basé sur les champs existants
        if (product.producer) {
          product.userType = 'producer';
        } else if (product.transformer) {
          product.userType = 'transformer';
        } else {
          // Fallback - essayer de déterminer depuis le vendeur de la commande
          product.userType = 'producer'; // Valeur par défaut
        }
      }
      
      product.reserveStock(item.quantity, item.variant);
      await product.save();
    }
  }
};

orderSchema.methods.releaseStock = async function() {
  const Product = mongoose.model('Product');
  
  for (const item of this.items) {
    const product = await Product.findById(item.product);
    if (product) {
      // S'assurer que le produit a le champ userType défini
      if (!product.userType) {
        // Déterminer le userType basé sur les champs existants
        if (product.producer) {
          product.userType = 'producer';
        } else if (product.transformer) {
          product.userType = 'transformer';
        } else {
          // Fallback - essayer de déterminer depuis le vendeur de la commande
          product.userType = 'producer'; // Valeur par défaut
        }
      }
      
      product.releaseStock(item.quantity, item.variant);
      await product.save();
    }
  }
};

// Méthodes statiques
orderSchema.statics.getOrdersByStatus = function(status, userId = null, userType = null) {
  const query = { status };
  
  if (userId) {
    if (['buyer', 'consumer'].includes(userType)) {
      query.buyer = userId;
    } else if (['seller', 'producer', 'transformer', 'restaurateur'].includes(userType)) {
      query.$or = [
        { seller: userId },
        { 'segments.seller': userId },
        { 'items.seller': userId },
        { 'items.productSnapshot.producer': userId },
        { 'items.productSnapshot.transformer': userId },
        { 'items.productSnapshot.restaurateur': userId }
      ];
    } else if (userType === 'transporter') {
      query['delivery.transporter'] = userId;
    }
  }
  
  return this.find(query)
    .populate('buyer', 'firstName lastName email')
    .populate('seller', 'farmName companyName firstName lastName')
    .populate({
      path: 'segments.seller',
      select: 'farmName companyName firstName lastName email phone userType'
    })
    .populate('items.product', 'name images price')
    .sort({ createdAt: -1 });
};

orderSchema.statics.getRevenueStats = function(sellerId, startDate, endDate) {
  const matchQuery = {
    seller: sellerId,
    status: 'completed',
    completedAt: { $gte: startDate, $lte: endDate }
  };
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$subtotal' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$subtotal' },
        totalFees: { $sum: '$payment.fees.total' }
      }
    }
  ]);
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
