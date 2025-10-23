const mongoose = require('mongoose');
const User = require('./User');

// Schéma spécialisé pour les Consommateurs
const consumerSchema = new mongoose.Schema({
  // Préférences alimentaires
  dietaryPreferences: {
    type: [String],
    enum: ['organic', 'vegetarian', 'vegan', 'gluten-free', 'halal', 'kosher', 'local', 'seasonal'],
    default: []
  },
  
  // Allergies alimentaires
  allergies: [{
    allergen: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      required: true
    }
  }],
  
  // Préférences d'achat
  shoppingPreferences: {
    preferredDeliveryTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'weekend', 'flexible'],
      default: 'flexible'
    },
    maxDeliveryDistance: {
      type: Number,
      default: 25, // en kilomètres
      min: 1,
      max: 100
    },
    budgetRange: {
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 100000
      },
      currency: {
        type: String,
        default: 'XAF'
      }
    }
  },
  
  // Historique d'achat et préférences
  purchaseHistory: {
    favoriteCategories: [{
      category: String,
      purchaseCount: {
        type: Number,
        default: 1
      }
    }],
    favoriteProducers: [{
      producer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      orderCount: {
        type: Number,
        default: 1
      }
    }],
    averageOrderValue: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    }
  },
  
  // Produits favoris
  favorites: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Liste de souhaits
  wishlist: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    notifyWhenAvailable: {
      type: Boolean,
      default: true
    }
  }],
  
  // Abonnements et livraisons récurrentes
  subscriptions: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    producer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    quantity: {
      type: Number,
      required: true
    },
    frequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly'],
      required: true
    },
    nextDelivery: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    deliveryAddress: {
      type: mongoose.Schema.Types.ObjectId
    }
  }],
  
  // Paramètres de communication
  communicationPreferences: {
    orderUpdates: {
      type: Boolean,
      default: true
    },
    promotions: {
      type: Boolean,
      default: true
    },
    newProducts: {
      type: Boolean,
      default: false
    },
    priceDrops: {
      type: Boolean,
      default: true
    },
    harvestUpdates: {
      type: Boolean,
      default: false
    }
  },
  
  // Programme de fidélité
  loyaltyProgram: {
    points: {
      type: Number,
      default: 0
    },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    },
    totalPointsEarned: {
      type: Number,
      default: 0
    },
    totalPointsRedeemed: {
      type: Number,
      default: 0
    }
  },
  
  // Statistiques d'activité
  activityStats: {
    totalOrders: {
      type: Number,
      default: 0
    },
    cancelledOrders: {
      type: Number,
      default: 0
    },
    averageRatingGiven: {
      type: Number,
      default: 0
    },
    reviewsWritten: {
      type: Number,
      default: 0
    },
    lastOrderDate: Date
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

// Index pour performance
consumerSchema.index({ 'deliveryAddresses.city': 1, 'deliveryAddresses.region': 1 });
consumerSchema.index({ 'dietaryPreferences': 1 });
consumerSchema.index({ 'loyaltyProgram.tier': 1 });
consumerSchema.index({ 'activityStats.totalOrders': -1 });

// Méthode pour calculer le tier de fidélité
consumerSchema.methods.updateLoyaltyTier = function() {
  const points = this.loyaltyProgram.points;
  
  if (points >= 10000) {
    this.loyaltyProgram.tier = 'platinum';
  } else if (points >= 5000) {
    this.loyaltyProgram.tier = 'gold';
  } else if (points >= 1000) {
    this.loyaltyProgram.tier = 'silver';
  } else {
    this.loyaltyProgram.tier = 'bronze';
  }
};

// Méthode pour ajouter des points de fidélité
consumerSchema.methods.addLoyaltyPoints = async function(orderAmount, orderId = null) {
  const pointsEarned = Math.floor(orderAmount / 100); // 1 point pour 100 XAF
  
  this.loyaltyProgram.points += pointsEarned;
  this.loyaltyProgram.totalPointsEarned += pointsEarned;
  
  this.updateLoyaltyTier();
  
  // TODO: Créer une transaction de fidélité quand le modèle LoyaltyTransaction sera disponible
  // const LoyaltyTransaction = mongoose.model('LoyaltyTransaction');
  // await LoyaltyTransaction.create({...});
  
  return pointsEarned;
};

// Méthode pour utiliser des points de fidélité
consumerSchema.methods.redeemLoyaltyPoints = async function(pointsToRedeem, orderId = null) {
  if (this.loyaltyProgram.points < pointsToRedeem) {
    throw new Error('Points insuffisants');
  }
  
  this.loyaltyProgram.points -= pointsToRedeem;
  this.loyaltyProgram.totalPointsRedeemed += pointsToRedeem;
  
  this.updateLoyaltyTier();
  
  // TODO: Créer une transaction de fidélité quand le modèle LoyaltyTransaction sera disponible
  // const LoyaltyTransaction = mongoose.model('LoyaltyTransaction');
  // await LoyaltyTransaction.create({...});
  
  // 1 point = 1 XAF de réduction
  return pointsToRedeem;
};

const Consumer = User.discriminator('consumer', consumerSchema);

module.exports = Consumer;
