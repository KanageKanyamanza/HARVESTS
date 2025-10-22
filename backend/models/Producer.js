const mongoose = require('mongoose');
const User = require('./User');

// Schéma spécialisé pour les Producteurs
const producerSchema = new mongoose.Schema({
  // Informations spécifiques au producteur
  farmName: {
    type: String,
    required: false, // Optionnel lors de l'inscription
    trim: true,
    maxlength: [100, 'Le nom de la ferme ne peut pas dépasser 100 caractères'],
    default: 'À compléter'
  },
  
  farmSize: {
    value: {
      type: Number,
      required: false, // Optionnel lors de l'inscription
      min: [0, 'La taille ne peut pas être négative'],
      default: 0
    },
    unit: {
      type: String,
      enum: ['hectares', 'acres', 'm²'],
      default: 'hectares'
    }
  },
  
  farmingType: {
    type: String,
    enum: ['organic', 'conventional', 'mixed'],
    required: false, // Optionnel lors de l'inscription
    default: 'conventional'
  },
  
  // Certifications
  certifications: [{
    name: {
      type: String,
      required: false // Optionnel lors de l'inscription
    },
    issuedBy: String,
    validUntil: Date,
    certificateNumber: String,
    document: String // URL du document
  }],
  
  // Produits cultivés
  crops: [{
    name: {
      type: String,
      required: false // Optionnel lors de l'inscription
    },
    category: {
      type: String,
      enum: ['cereals', 'vegetables', 'fruits', 'legumes', 'tubers', 'spices', 'herbs'],
      required: false // Optionnel lors de l'inscription
    },
    plantingSeasons: [String],
    harvestSeasons: [String],
    estimatedYield: {
      value: Number,
      unit: String
    }
  }],
  
  // Équipements et infrastructure
  equipment: [{
    type: {
      type: String,
      enum: ['tractor', 'harvester', 'irrigation', 'greenhouse', 'storage', 'other']
    },
    description: String,
    capacity: String
  }],
  
  // Capacité de stockage
  storageCapacity: {
    value: Number,
    unit: {
      type: String,
      enum: ['tons', 'kg', 'm³'],
      default: 'tons'
    }
  },
  
  
  // Disponibilité pour livraison
  deliveryOptions: {
    canDeliver: {
      type: Boolean,
      default: false
    },
    deliveryRadius: {
      type: Number, // en kilomètres
      default: 0
    },
    deliveryFee: {
      type: Number,
      default: 0
    }
  },
  
  // Préférences de vente
  minimumOrderQuantity: {
    value: {
      type: Number,
      default: 1
    },
    unit: String
  },
  
  // Partenaires de transport préférés
  preferredTransporters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Documents d'identité et légaux
  documents: {
    nationalId: {
      number: String,
      document: String, // URL du document
      isVerified: {
        type: Boolean,
        default: false
      }
    },
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
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String }
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
producerSchema.index({ 'crops.category': 1 });
producerSchema.index({ farmingType: 1 });
producerSchema.index({ 'salesStats.averageRating': -1 });
producerSchema.index({ 'address.region': 1, 'crops.category': 1 });

// Middleware pour calculer la note moyenne
producerSchema.methods.updateAverageRating = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { producer: this._id } },
    {
      $group: {
        _id: '$producer',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.salesStats.averageRating = Math.round(stats[0].avgRating * 10) / 10;
    this.salesStats.totalReviews = stats[0].numReviews;
  } else {
    this.salesStats.averageRating = 0;
    this.salesStats.totalReviews = 0;
  }
  
  await this.save();
};

const Producer = User.discriminator('producer', producerSchema);

module.exports = Producer;
