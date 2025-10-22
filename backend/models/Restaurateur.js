const mongoose = require('mongoose');
const User = require('./User');

// Schéma spécialisé pour les Restaurateurs
const restaurateurSchema = new mongoose.Schema({
  // Informations du restaurant (optionnelles lors de l'inscription)
  restaurantName: {
    type: String,
    required: false, // Optionnel lors de l'inscription
    trim: true,
    maxlength: [100, 'Le nom du restaurant ne peut pas dépasser 100 caractères'],
    default: 'À compléter'
  },
  
  businessLicense: {
    type: String,
    required: false, // Optionnel lors de l'inscription
    default: function() { return `À_compléter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; }
  },
  
  // Type de restaurant
  restaurantType: {
    type: String,
    enum: ['fine-dining', 'casual', 'fast-food', 'cafe', 'bar', 'catering', 'food-truck', 'bakery'],
    required: false, // Optionnel lors de l'inscription
    default: 'casual'
  },
  
  // Cuisine servie
  cuisineTypes: {
    type: [String],
    required: false, // Optionnel lors de l'inscription
    default: ['african']
  },
  
  // Capacité et horaires
  seatingCapacity: {
    type: Number,
    required: false, // Optionnel lors de l'inscription
    min: [1, 'Capacité minimum de 1 personne'],
    default: 20
  },
  
  operatingHours: {
    monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } }
  },
  
  // Besoins d'approvisionnement
  procurementNeeds: [{
    category: {
      type: String,
      enum: ['vegetables', 'fruits', 'cereals', 'legumes', 'spices', 'herbs', 'meat', 'dairy', 'seafood'],
      required: true
    },
    specificProducts: [String],
    estimatedMonthlyVolume: {
      value: Number,
      unit: String
    },
    qualityRequirements: {
      organic: { type: Boolean, default: false },
      freshness: {
        type: String,
        enum: ['same-day', 'within-2-days', 'within-week', 'flexible']
      },
      certification: [String]
    },
    budgetRange: {
      min: Number,
      max: Number
    },
    deliveryFrequency: {
      type: String,
      enum: ['daily', 'twice-weekly', 'weekly', 'bi-weekly', 'monthly']
    }
  }],
  
  // Fournisseurs préférés
  preferredSuppliers: [{
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    category: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    contractDetails: {
      startDate: Date,
      endDate: Date,
      terms: String
    }
  }],
  
  // Certifications et licences
  certifications: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['food-safety', 'hygiene', 'organic', 'halal', 'kosher', 'health-permit']
    },
    issuedBy: String,
    validUntil: Date,
    certificateNumber: String,
    document: String
  }],
  
  // Équipements de cuisine
  kitchenEquipment: [{
    type: {
      type: String,
      enum: ['oven', 'stove', 'refrigerator', 'freezer', 'grill', 'fryer', 'mixer', 'other']
    },
    brand: String,
    capacity: String,
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'needs-repair']
    }
  }],
  
  // Capacité de stockage
  storageCapacity: {
    dryStorage: {
      value: Number,
      unit: String
    },
    refrigerated: {
      value: Number,
      unit: String
    },
    frozen: {
      value: Number,
      unit: String
    }
  },
  
  // Préférences de paiement spécifiques au restaurateur
  paymentPreferences: {
    paymentTerms: {
      type: String,
      enum: ['immediate', 'net-7', 'net-15', 'net-30'],
      default: 'immediate'
    },
    creditLimit: {
      type: Number,
      default: 0
    }
  },
  
  // Statistiques spécifiques au restaurateur
  businessStats: {
    onTimePaymentRate: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    supplierRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  
  // Services additionnels
  additionalServices: {
    catering: {
      type: Boolean,
      default: false
    },
    delivery: {
      type: Boolean,
      default: false
    },
    events: {
      type: Boolean,
      default: false
    },
    mealPlanning: {
      type: Boolean,
      default: false
    }
  },
  
  // Bannière du restaurant
  restaurantBanner: {
    type: String,
    required: false,
    default: null
  },
  
  // Plats du restaurant
  dishes: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Le nom du plat ne peut pas dépasser 100 caractères']
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Le prix ne peut pas être négatif']
    },
    image: {
      type: String,
      required: false,
      default: null
    },
    category: {
      type: String,
      required: false,
      enum: ['entree', 'plat', 'dessert', 'boisson', 'accompagnement'],
      default: 'plat'
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    preparationTime: {
      type: Number,
      required: false,
      min: [0, 'Le temps de préparation ne peut pas être négatif'],
      default: 30 // en minutes
    },
    allergens: [{
      type: String,
      enum: ['gluten', 'lactose', 'nuts', 'eggs', 'soy', 'fish', 'shellfish', 'sesame']
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Préférences de livraison
  deliveryPreferences: {
    preferredTimes: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      timeSlots: [String]
    }],
    specialInstructions: String,
    dockAccess: {
      type: Boolean,
      default: false
    },
    storageAssistance: {
      type: Boolean,
      default: false
    }
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
    },
    firePermit: {
      number: String,
      document: String,
      validUntil: Date,
      isVerified: {
        type: Boolean,
        default: false
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
restaurateurSchema.index({ restaurantType: 1 });
restaurateurSchema.index({ cuisineTypes: 1 });
restaurateurSchema.index({ 'procurementNeeds.category': 1 });
restaurateurSchema.index({ 'businessStats.supplierRating': -1 });
restaurateurSchema.index({ 'address.city': 1, restaurantType: 1 });

// Méthode pour calculer la note moyenne en tant qu'acheteur
restaurateurSchema.methods.updateSupplierRating = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { buyer: this._id } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$buyerRating' }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.businessStats.supplierRating = Math.round(stats[0].avgRating * 10) / 10;
  }
  
  await this.save();
};

// Méthode pour mettre à jour les statistiques d'achat
restaurateurSchema.methods.updatePurchaseStats = async function() {
  const Order = mongoose.model('Order');
  const stats = await Order.aggregate([
    { $match: { buyer: this._id, status: 'completed' } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
        avgOrderValue: { $avg: '$totalAmount' }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.businessStats.totalOrders = stats[0].totalOrders;
    this.businessStats.totalSpent = stats[0].totalSpent;
    this.businessStats.averageOrderValue = Math.round(stats[0].avgOrderValue);
  }
  
  await this.save();
};

const Restaurateur = User.discriminator('restaurateur', restaurateurSchema);

module.exports = Restaurateur;
