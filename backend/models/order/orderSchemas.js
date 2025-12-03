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

module.exports = { orderSchema, orderItemSchema, segmentHistorySchema, orderSegmentSchema, deliveryAddressSchema, paymentSchema, deliverySchema };

