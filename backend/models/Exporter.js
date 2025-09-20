const mongoose = require('mongoose');
const User = require('./User');

// Schéma spécialisé pour les Exportateurs
const exporterSchema = new mongoose.Schema({
  // Informations de l'entreprise
  companyName: {
    type: String,
    required: [true, 'Nom de l\'entreprise requis'],
    trim: true,
    maxlength: [150, 'Le nom de l\'entreprise ne peut pas dépasser 150 caractères']
  },
  
  businessRegistrationNumber: {
    type: String,
    required: [true, 'Numéro d\'enregistrement commercial requis'],
    unique: true
  },
  
  // Licences d'exportation
  exportLicenses: [{
    licenseNumber: {
      type: String,
      required: true
    },
    issuedBy: String,
    validUntil: Date,
    countries: [String], // Pays autorisés pour cette licence
    productCategories: [String],
    document: String,
    isVerified: {
      type: Boolean,
      default: false
    }
  }],
  
  // Marchés cibles
  targetMarkets: [{
    country: {
      type: String,
      required: true
    },
    region: String,
    marketType: {
      type: String,
      enum: ['wholesale', 'retail', 'industrial', 'institutional']
    },
    experience: {
      type: String,
      enum: ['new', '1-2-years', '3-5-years', '5+-years']
    },
    annualVolume: {
      value: Number,
      unit: String
    }
  }],
  
  // Produits d'exportation
  exportProducts: [{
    category: {
      type: String,
      enum: ['cereals', 'vegetables', 'fruits', 'legumes', 'tubers', 'spices', 'herbs', 'processed-foods'],
      required: true
    },
    specificProducts: [String],
    qualityStandards: [String], // ISO, FDA, EU, etc.
    packagingRequirements: String,
    shelfLife: {
      value: Number,
      unit: {
        type: String,
        enum: ['days', 'weeks', 'months', 'years']
      }
    },
    minimumOrderQuantity: {
      value: Number,
      unit: String
    }
  }],
  
  // Certifications internationales
  internationalCertifications: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['iso', 'haccp', 'brc', 'ifs', 'fda', 'eu-organic', 'fair-trade', 'rainforest-alliance']
    },
    issuedBy: String,
    validUntil: Date,
    certificateNumber: String,
    document: String,
    isVerified: {
      type: Boolean,
      default: false
    }
  }],
  
  // Capacités logistiques
  logisticsCapabilities: {
    warehouseCapacity: {
      value: Number,
      unit: String
    },
    coldStorage: {
      available: {
        type: Boolean,
        default: false
      },
      capacity: {
        value: Number,
        unit: String
      },
      temperatureRange: {
        min: Number,
        max: Number
      }
    },
    packagingFacilities: {
      available: {
        type: Boolean,
        default: false
      },
      capabilities: [String]
    },
    qualityControl: {
      inHouse: {
        type: Boolean,
        default: false
      },
      certifiedLab: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Partenaires logistiques
  shippingPartners: [{
    companyName: String,
    serviceType: {
      type: String,
      enum: ['air-freight', 'sea-freight', 'land-transport', 'courier']
    },
    routes: [String],
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  
  // Conditions commerciales
  tradingTerms: {
    acceptedIncoterms: {
      type: [String],
      enum: ['EXW', 'FCA', 'CPT', 'CIP', 'DAT', 'DAP', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'],
      default: ['FOB', 'CIF']
    },
    paymentTerms: {
      type: [String],
      enum: ['advance-payment', 'letter-of-credit', 'documentary-collection', 'open-account'],
      default: ['letter-of-credit']
    },
    currencies: {
      type: [String],
      enum: ['USD', 'EUR', 'GBP', 'XAF', 'XOF'],
      default: ['USD', 'EUR']
    }
  },
  
  // Fournisseurs locaux
  localSuppliers: [{
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    products: [String],
    contractType: {
      type: String,
      enum: ['exclusive', 'preferred', 'regular']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    annualVolume: {
      value: Number,
      unit: String
    }
  }],
  
  // Informations financières
  bankAccounts: [{
    accountName: String,
    accountNumber: String,
    bankName: String,
    bankCode: String,
    swiftCode: String,
    currency: String,
    country: String,
    isVerified: {
      type: Boolean,
      default: false
    }
  }],
  
  // Assurances
  insurancePolicies: [{
    type: {
      type: String,
      enum: ['cargo', 'liability', 'credit', 'business-interruption']
    },
    provider: String,
    policyNumber: String,
    coverage: {
      amount: Number,
      currency: String
    },
    validUntil: Date
  }],
  
  // Statistiques d'export
  exportStats: {
    totalExports: {
      type: Number,
      default: 0
    },
    totalValue: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    successfulDeliveryRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
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
  
  // Équipe et expertise
  team: [{
    role: {
      type: String,
      enum: ['manager', 'quality-controller', 'logistics-coordinator', 'sales-representative']
    },
    name: String,
    experience: String,
    certifications: [String]
  }],
  
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
    exportLicense: {
      number: String,
      document: String,
      validUntil: Date,
      isVerified: {
        type: Boolean,
        default: false
      }
    },
    customsRegistration: {
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
exporterSchema.index({ 'targetMarkets.country': 1 });
exporterSchema.index({ 'exportProducts.category': 1 });
exporterSchema.index({ 'exportStats.averageRating': -1 });
exporterSchema.index({ 'tradingTerms.acceptedIncoterms': 1 });
exporterSchema.index({ 'address.country': 1, 'targetMarkets.country': 1 });

// Méthode pour mettre à jour les statistiques d'export
exporterSchema.methods.updateExportStats = async function() {
  const Order = mongoose.model('Order');
  const Review = mongoose.model('Review');
  
  // Statistiques des commandes d'export
  const orderStats = await Order.aggregate([
    { $match: { exporter: this._id, status: 'completed', isExport: true } },
    {
      $group: {
        _id: null,
        totalExports: { $sum: 1 },
        totalValue: { $sum: '$totalAmount' },
        avgOrderValue: { $avg: '$totalAmount' }
      }
    }
  ]);
  
  // Statistiques des avis
  const reviewStats = await Review.aggregate([
    { $match: { exporter: this._id } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);
  
  // Taux de livraison réussie
  const deliveryStats = await Order.aggregate([
    { $match: { exporter: this._id, isExport: true } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        successfulDeliveries: {
          $sum: {
            $cond: [{ $eq: ['$deliveryStatus', 'delivered'] }, 1, 0]
          }
        }
      }
    }
  ]);
  
  if (orderStats.length > 0) {
    this.exportStats.totalExports = orderStats[0].totalExports;
    this.exportStats.totalValue = orderStats[0].totalValue;
    this.exportStats.averageOrderValue = Math.round(orderStats[0].avgOrderValue);
  }
  
  if (reviewStats.length > 0) {
    this.exportStats.averageRating = Math.round(reviewStats[0].avgRating * 10) / 10;
    this.exportStats.totalReviews = reviewStats[0].numReviews;
  }
  
  if (deliveryStats.length > 0 && deliveryStats[0].totalOrders > 0) {
    this.exportStats.successfulDeliveryRate = Math.round(
      (deliveryStats[0].successfulDeliveries / deliveryStats[0].totalOrders) * 100
    );
  }
  
  await this.save();
};

const Exporter = User.discriminator('exporter', exporterSchema);

module.exports = Exporter;
