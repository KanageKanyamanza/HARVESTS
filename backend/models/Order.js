const mongoose = require('mongoose');

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
  productSnapshot: {
    name: String,
    description: String,
    images: [String],
    producer: {
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
  specialInstructions: String
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
    default: 'Cameroon'
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
    enum: ['cash', 'card', 'mobile-money', 'bank-transfer', 'crypto'],
    required: [true, 'Méthode de paiement requise']
  },
  provider: String, // ex: "Orange Money", "MTN Mobile Money", "Visa"
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
    ref: 'User',
    required: [true, 'Vendeur requis']
  },
  
  // Articles commandés
  items: [orderItemSchema],
  
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
  return this.items.reduce((total, item) => {
    if (item.weight && item.weight.value) {
      return total + (item.weight.value * item.quantity);
    }
    return total;
  }, 0);
});

orderSchema.virtual('isPaymentPending').get(function() {
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

// Middleware pre-save
orderSchema.pre('save', async function(next) {
  // Générer le numéro de commande
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.orderNumber = `HRV-${year}-${String(count + 1).padStart(6, '0')}`;
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
  this.status = newStatus;
  this.modifiedBy = updatedBy;
  
  // Mettre à jour les dates spécifiques
  const now = new Date();
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
  this.statusHistory.push({
    status: newStatus,
    timestamp: now,
    updatedBy,
    reason,
    note
  });
  
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
      product.releaseStock(item.quantity, item.variant);
      await product.save();
    }
  }
};

// Méthodes statiques
orderSchema.statics.getOrdersByStatus = function(status, userId = null, userType = null) {
  const query = { status };
  
  if (userId) {
    if (userType === 'buyer' || userType === 'consumer') {
      query.buyer = userId;
    } else if (userType === 'seller' || ['producer', 'transformer'].includes(userType)) {
      query.seller = userId;
    } else if (userType === 'transporter') {
      query['delivery.transporter'] = userId;
    }
  }
  
  return this.find(query)
    .populate('buyer', 'firstName lastName email')
    .populate('seller', 'farmName companyName firstName lastName')
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
