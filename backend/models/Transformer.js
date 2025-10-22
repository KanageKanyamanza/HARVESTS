const mongoose = require('mongoose');
const User = require('./User');

// Schéma spécialisé pour les Transformateurs
const transformerSchema = new mongoose.Schema({
  // Informations de l'entreprise (optionnelles lors de l'inscription)
  companyName: {
    type: String,
    required: false, // Optionnel lors de l'inscription
    trim: true,
    maxlength: [100, 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères'],
    default: 'À compléter'
  },
  
  companyRegistrationNumber: {
    type: String,
    required: false, // Optionnel lors de l'inscription
    default: function() { return `À_compléter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; }
  },
  
  // Type de transformation
  transformationType: {
    type: String,
    enum: ['processing', 'packaging', 'preservation', 'manufacturing', 'mixed'],
    required: false, // Optionnel lors de l'inscription
    default: 'processing'
  },
  
  // Produits transformés
  processingCapabilities: [{
    inputProduct: {
      type: String,
      required: true
    },
    outputProducts: [String],
    processingMethod: String,
    capacity: {
      value: Number,
      unit: String,
      period: {
        type: String,
        enum: ['hour', 'day', 'week', 'month']
      }
    },
    minimumQuantity: {
      value: Number,
      unit: String
    }
  }],
  
  // Certifications et standards
  certifications: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['food-safety', 'quality', 'organic', 'halal', 'kosher', 'iso', 'haccp']
    },
    issuedBy: String,
    validUntil: Date,
    certificateNumber: String,
    document: String
  }],
  
  
  // Capacités de stockage
  storageCapabilities: {
    rawMaterials: {
      capacity: {
        value: Number,
        unit: String
      },
      conditions: [String] // réfrigéré, sec, température contrôlée, etc.
    },
    finishedProducts: {
      capacity: {
        value: Number,
        unit: String
      },
      conditions: [String]
    }
  },
  
  // Services offerts
  services: {
    customProcessing: {
      type: Boolean,
      default: false
    },
    privateLabeling: {
      type: Boolean,
      default: false
    },
    qualityTesting: {
      type: Boolean,
      default: false
    },
    packaging: {
      type: Boolean,
      default: true
    },
    consultation: {
      type: Boolean,
      default: false
    }
  },
  
  // Tarification (optionnelle lors de l'inscription)
  pricing: {
    model: {
      type: String,
      enum: ['per-unit', 'per-kg', 'per-batch', 'hourly', 'custom'],
      required: false, // Optionnel lors de l'inscription
      default: 'per-unit'
    },
    baseRate: {
      type: Number,
      default: 0
    },
    minimumCharge: {
      type: Number,
      default: 0
    },
    additionalServices: [{
      service: String,
      rate: Number,
      unit: String
    }]
  },
  
  // Délais de traitement
  processingTimes: {
    standard: {
      value: Number,
      unit: {
        type: String,
        enum: ['hours', 'days', 'weeks']
      }
    },
    rush: {
      value: Number,
      unit: {
        type: String,
        enum: ['hours', 'days', 'weeks']
      },
      additionalCost: Number
    }
  },
  
  // Fournisseurs préférés
  preferredSuppliers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Statistiques spécifiques au transformateur
  businessStats: {
    onTimeDeliveryRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  
  // Horaires d'opération
  operatingHours: {
    monday: { open: String, close: String, isOpen: Boolean },
    tuesday: { open: String, close: String, isOpen: Boolean },
    wednesday: { open: String, close: String, isOpen: Boolean },
    thursday: { open: String, close: String, isOpen: Boolean },
    friday: { open: String, close: String, isOpen: Boolean },
    saturday: { open: String, close: String, isOpen: Boolean },
    sunday: { open: String, close: String, isOpen: Boolean }
  },
  
  // Documents légaux
  documents: {
    businessLicense: {
      number: String,
      document: String,
      isVerified: {
        type: Boolean,
        default: false
      }
    },
    taxId: {
      number: String,
      document: String,
      isVerified: {
        type: Boolean,
        default: false
      }
    },
    healthPermit: {
      number: String,
      document: String,
      validUntil: Date,
      isVerified: {
        type: Boolean,
        default: false
      }
    }
  },

  // Informations de boutique
  shopInfo: {
    isShopActive: {
      type: Boolean,
      default: false
    },
    shopName: {
      type: String,
      trim: true,
      maxlength: [100, 'Le nom de la boutique ne peut pas dépasser 100 caractères']
    },
    shopDescription: {
      type: String,
      maxlength: [500, 'La description de la boutique ne peut pas dépasser 500 caractères']
    },
    shopBanner: {
      type: String,
      default: null
    },
    shopLogo: {
      type: String,
      default: null
    },
    openingHours: {
      monday: { open: String, close: String, isOpen: Boolean },
      tuesday: { open: String, close: String, isOpen: Boolean },
      wednesday: { open: String, close: String, isOpen: Boolean },
      thursday: { open: String, close: String, isOpen: Boolean },
      friday: { open: String, close: String, isOpen: Boolean },
      saturday: { open: String, close: String, isOpen: Boolean },
      sunday: { open: String, close: String, isOpen: Boolean }
    },
    contactInfo: {
      phone: String,
      email: String,
      website: String,
      socialMedia: {
        facebook: String,
        instagram: String,
        twitter: String
      }
    }
  },

  // Méthodes de paiement préférées (centralisées depuis User)
  paymentMethods: [String],

  // Préférences de notification (centralisées depuis User)
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
    orderUpdates: { type: Boolean, default: true },
    priceAlerts: { type: Boolean, default: false }
  },

  // Statut de vérification (centralisé depuis User)
  verificationStatus: {
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    verificationDocuments: [{
      type: { type: String, enum: ['identity', 'business-license', 'tax-certificate', 'bank-statement', 'other'] },
      documentUrl: String,
      uploadedAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
    }]
  },

  // Adresses de livraison (centralisées depuis User)
  deliveryAddresses: [{
    label: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    region: { type: String, required: true },
    country: { type: String, default: 'Sénégal' },
    postalCode: String,
    coordinates: { latitude: Number, longitude: Number },
    instructions: String,
    isDefault: { type: Boolean, default: false }
  }]
});

// Index pour recherche et performance
transformerSchema.index({ transformationType: 1 });
transformerSchema.index({ 'processingCapabilities.inputProduct': 1 });
transformerSchema.index({ 'businessStats.averageRating': -1 });
transformerSchema.index({ 'address.region': 1, transformationType: 1 });

// Méthode pour mettre à jour les statistiques
transformerSchema.methods.updateBusinessStats = async function() {
  const Order = mongoose.model('Order');
  const Review = mongoose.model('Review');
  
  // Statistiques des commandes
  const orderStats = await Order.aggregate([
    { $match: { transformer: this._id, status: 'completed' } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' }
      }
    }
  ]);
  
  // Statistiques des avis
  const reviewStats = await Review.aggregate([
    { $match: { transformer: this._id } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (orderStats.length > 0) {
    this.businessStats.totalOrders = orderStats[0].totalOrders;
    this.businessStats.totalRevenue = orderStats[0].totalRevenue;
  }
  
  if (reviewStats.length > 0) {
    this.businessStats.averageRating = Math.round(reviewStats[0].avgRating * 10) / 10;
    this.businessStats.totalReviews = reviewStats[0].numReviews;
  }
  
  await this.save();
};

const Transformer = User.discriminator('transformer', transformerSchema);

module.exports = Transformer;
