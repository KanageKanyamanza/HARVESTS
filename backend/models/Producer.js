const mongoose = require('mongoose');
const User = require('./User');

// Schéma spécialisé pour les Producteurs
const producerSchema = new mongoose.Schema({
  // Informations spécifiques au producteur
  farmName: {
    type: String,
    required: [true, 'Nom de la ferme requis'],
    trim: true,
    maxlength: [100, 'Le nom de la ferme ne peut pas dépasser 100 caractères']
  },
  
  farmSize: {
    value: {
      type: Number,
      required: [true, 'Taille de la ferme requise'],
      min: [0.1, 'La taille minimum est de 0.1']
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
    required: [true, 'Type d\'agriculture requis']
  },
  
  // Certifications
  certifications: [{
    name: {
      type: String,
      required: true
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
      required: true
    },
    category: {
      type: String,
      enum: ['cereals', 'vegetables', 'fruits', 'legumes', 'tubers', 'spices', 'herbs'],
      required: true
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
  
  // Informations financières
  bankAccount: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    bankCode: String,
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  
  // Statistiques de vente
  salesStats: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
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
  }
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
