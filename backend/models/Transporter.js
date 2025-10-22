const mongoose = require('mongoose');
const User = require('./User');

// Schéma spécialisé pour les Transporteurs
const transporterSchema = new mongoose.Schema({
  // Informations de l'entreprise de transport (optionnelles lors de l'inscription)
  companyName: {
    type: String,
    required: false, // Optionnel lors de l'inscription
    trim: true,
    maxlength: [100, 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères'],
    default: 'À compléter'
  },
  
  businessLicense: {
    type: String,
    required: false, // Optionnel lors de l'inscription
    default: function() { return `À_compléter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; }
  },
  
  // Type de transport
  transportType: {
    type: [String],
    enum: ['road', 'rail', 'air', 'sea', 'multimodal'],
    required: false, // Optionnel lors de l'inscription
    default: ['road']
  },
  
  // Services de transport
  serviceTypes: {
    type: [String],
    enum: ['local-delivery', 'regional-transport', 'national-transport', 'international-shipping', 'cold-chain', 'express-delivery'],
    required: false, // Optionnel lors de l'inscription
    default: ['local-delivery']
  },
  
  // Flotte de véhicules
  fleet: [{
    vehicleType: {
      type: String,
      enum: ['motorcycle', 'van', 'truck', 'refrigerated-truck', 'trailer', 'container-truck'],
      required: true
    },
    registrationNumber: String,
    capacity: {
      weight: {
        value: Number,
        unit: {
          type: String,
          enum: ['kg', 'tons'],
          default: 'kg'
        }
      },
      volume: {
        value: Number,
        unit: {
          type: String,
          enum: ['m³', 'liters'],
          default: 'm³'
        }
      }
    },
    specialFeatures: {
      type: [String],
      enum: ['refrigerated', 'insulated', 'ventilated', 'covered', 'gps-tracked', 'temperature-controlled']
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'needs-maintenance'],
      default: 'good'
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    lastMaintenanceDate: Date,
    nextMaintenanceDate: Date
  }],
  
  // Zones de couverture
  serviceAreas: [{
    region: {
      type: String,
      required: true
    },
    cities: [String],
    deliveryRadius: {
      type: Number, // en kilomètres
      required: true
    },
    averageDeliveryTime: {
      value: Number,
      unit: {
        type: String,
        enum: ['hours', 'days']
      }
    }
  }],
  
  // Tarification (optionnelle lors de l'inscription)
  pricingStructure: {
    model: {
      type: String,
      enum: ['per-km', 'per-kg', 'flat-rate', 'time-based', 'custom'],
      required: false, // Optionnel lors de l'inscription
      default: 'per-km'
    },
    baseRate: {
      type: Number,
      required: false, // Optionnel lors de l'inscription
      default: 0
    },
    additionalCharges: [{
      type: {
        type: String,
        enum: ['fuel-surcharge', 'loading-fee', 'waiting-time', 'cold-chain', 'express-delivery', 'insurance']
      },
      rate: Number,
      unit: String
    }],
    minimumCharge: {
      type: Number,
      default: 0
    },
    freeDeliveryThreshold: Number // Montant minimum pour livraison gratuite
  },
  
  // Horaires d'opération
  operatingHours: {
    monday: { start: String, end: String, isAvailable: Boolean },
    tuesday: { start: String, end: String, isAvailable: Boolean },
    wednesday: { start: String, end: String, isAvailable: Boolean },
    thursday: { start: String, end: String, isAvailable: Boolean },
    friday: { start: String, end: String, isAvailable: Boolean },
    saturday: { start: String, end: String, isAvailable: Boolean },
    sunday: { start: String, end: String, isAvailable: Boolean }
  },
  
  // Capacités spéciales
  specialCapabilities: {
    coldChain: {
      available: {
        type: Boolean,
        default: false
      },
      temperatureRange: {
        min: Number,
        max: Number
      },
      certifications: [String]
    },
    hazardousMaterials: {
      type: Boolean,
      default: false
    },
    liveAnimals: {
      type: Boolean,
      default: false
    },
    oversizedCargo: {
      type: Boolean,
      default: false
    },
    crossBorder: {
      type: Boolean,
      default: false
    }
  },
  
  // Équipe de transport
  drivers: [{
    name: String,
    licenseNumber: String,
    licenseExpiry: Date,
    experience: {
      type: Number, // années d'expérience
      min: 0
    },
    specialCertifications: [String],
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  
  // Assurances et sécurité
  insurance: [{
    type: {
      type: String,
      enum: ['cargo', 'vehicle', 'liability', 'comprehensive'],
      required: true
    },
    provider: String,
    policyNumber: String,
    coverage: {
      amount: Number,
      currency: String
    },
    validUntil: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Partenaires et sous-traitants
  partners: [{
    companyName: String,
    partnerType: {
      type: String,
      enum: ['subcontractor', 'logistics-partner', 'warehouse', 'customs-broker']
    },
    serviceAreas: [String],
    contactInfo: {
      phone: String,
      email: String
    }
  }],
  
  // Statistiques spécifiques au transporteur
  performanceStats: {
    totalDeliveries: {
      type: Number,
      default: 0
    },
    onTimeDeliveryRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    damageClaims: {
      type: Number,
      default: 0
    },
    fuelEfficiency: {
      type: Number, // km/litre
      default: 0
    }
  },
  
  // Préférences de travail
  workPreferences: {
    preferredCustomers: [{
      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
      }
    }],
    minimumJobValue: {
      type: Number,
      default: 0
    },
    maximumDistance: {
      type: Number, // en kilomètres
      default: 1000
    },
    preferredProducts: {
      type: [String],
      enum: ['cereals', 'vegetables', 'fruits', 'legumes', 'processed-foods', 'all']
    }
  },
  
  // Suivi et technologie
  trackingCapabilities: {
    gpsTracking: {
      type: Boolean,
      default: false
    },
    realTimeUpdates: {
      type: Boolean,
      default: false
    },
    temperatureMonitoring: {
      type: Boolean,
      default: false
    },
    photoConfirmation: {
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
    transportLicense: {
      number: String,
      document: String,
      validUntil: Date,
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
    insuranceCertificate: {
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
transporterSchema.index({ transportType: 1 });
transporterSchema.index({ serviceTypes: 1 });
transporterSchema.index({ 'serviceAreas.region': 1 });
transporterSchema.index({ 'performanceStats.averageRating': -1 });
transporterSchema.index({ 'performanceStats.onTimeDeliveryRate': -1 });
transporterSchema.index({ 'fleet.vehicleType': 1, 'fleet.isAvailable': 1 });

// Méthode pour mettre à jour les statistiques de performance
transporterSchema.methods.updatePerformanceStats = async function() {
  const Delivery = mongoose.model('Delivery');
  const Review = mongoose.model('Review');
  
  // Statistiques des livraisons
  const deliveryStats = await Delivery.aggregate([
    { $match: { transporter: this._id } },
    {
      $group: {
        _id: null,
        totalDeliveries: { $sum: 1 },
        onTimeDeliveries: {
          $sum: {
            $cond: [{ $eq: ['$status', 'delivered-on-time'] }, 1, 0]
          }
        },
        totalRevenue: { $sum: '$transportFee' },
        damageClaims: {
          $sum: {
            $cond: [{ $eq: ['$hasClaimedDamage', true] }, 1, 0]
          }
        }
      }
    }
  ]);
  
  // Statistiques des avis
  const reviewStats = await Review.aggregate([
    { $match: { transporter: this._id } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (deliveryStats.length > 0) {
    const stats = deliveryStats[0];
    this.performanceStats.totalDeliveries = stats.totalDeliveries;
    this.performanceStats.totalRevenue = stats.totalRevenue;
    this.performanceStats.damageClaims = stats.damageClaims;
    
    if (stats.totalDeliveries > 0) {
      this.performanceStats.onTimeDeliveryRate = Math.round(
        (stats.onTimeDeliveries / stats.totalDeliveries) * 100
      );
    }
  }
  
  if (reviewStats.length > 0) {
    this.performanceStats.averageRating = Math.round(reviewStats[0].avgRating * 10) / 10;
    this.performanceStats.totalReviews = reviewStats[0].numReviews;
  }
  
  await this.save();
};

// Méthode pour vérifier la disponibilité
transporterSchema.methods.checkAvailability = function(date, serviceArea) {
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
  const isOperatingDay = this.operatingHours[dayOfWeek].isAvailable;
  
  const hasServiceArea = this.serviceAreas.some(area => 
    area.region === serviceArea || area.cities.includes(serviceArea)
  );
  
  const hasAvailableVehicle = this.fleet.some(vehicle => vehicle.isAvailable);
  
  return isOperatingDay && hasServiceArea && hasAvailableVehicle;
};

const Transporter = User.discriminator('transporter', transporterSchema);

module.exports = Transporter;
