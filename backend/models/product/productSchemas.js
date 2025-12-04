const mongoose = require('mongoose');

// Schéma pour les variantes de produits
const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nom de la variante requis']
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  price: {
    type: Number,
    required: [true, 'Prix requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  compareAtPrice: {
    type: Number,
    min: [0, 'Le prix de comparaison ne peut pas être négatif']
  },
  weight: {
    value: {
      type: Number,
      required: [true, 'Poids requis'],
      min: [0, 'Le poids ne peut pas être négatif']
    },
    unit: {
      type: String,
      enum: ['g', 'kg', 'lb', 'oz'],
      default: 'kg'
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'm', 'in', 'ft'],
      default: 'cm'
    }
  },
  inventory: {
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'La quantité ne peut pas être négative']
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    },
    trackQuantity: {
      type: Boolean,
      default: true
    },
    allowBackorder: {
      type: Boolean,
      default: false
    }
  },
  attributes: [{
    name: String, // ex: "Couleur", "Taille", "Qualité"
    value: String // ex: "Rouge", "Large", "Bio"
  }],
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
});

// Schéma principal du produit
const productSchema = new mongoose.Schema({
  // Informations de base
  name: {
    type: String,
    required: [true, 'Nom du produit requis'],
    trim: true,
    maxlength: [200, 'Le nom ne peut pas dépasser 200 caractères']
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  
  description: {
    type: String,
    required: [true, 'Description requise'],
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },
  
  shortDescription: {
    type: String,
    maxlength: [300, 'La description courte ne peut pas dépasser 300 caractères']
  },
  
  // Producteur
  producer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.userType === 'producer';
    }
  },
  
  // Transformateur
  transformer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.userType === 'transformer';
    }
  },

  restaurateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.userType === 'restaurateur';
    }
  },
  
  // Type d'utilisateur (producer ou transformer)
  userType: {
    type: String,
    enum: ['producer', 'transformer', 'restaurateur'],
    required: true
  },
  originType: {
    type: String,
    enum: ['catalog', 'dish'],
    default: 'catalog'
  },

  sourceDish: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurateur.dishes'
  },

  dishInfo: {
    category: String,
    preparationTime: Number,
    allergens: [String]
  },

  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Catégorisation
  category: {
    type: String,
    required: [true, 'Catégorie requise'],
    enum: [
      'cereals', 'vegetables', 'fruits', 'legumes', 'tubers', 
      'spices', 'herbs', 'nuts', 'seeds', 'dairy', 'meat', 
      'poultry', 'fish', 'processed-foods', 'beverages', 'other'
    ]
  },
  
  subcategory: {
    type: String,
    required: false
  },
  
  tags: [{
    type: String,
    lowercase: true
  }],
  
  // Prix et variantes
  hasVariants: {
    type: Boolean,
    default: false
  },
  
  // Si pas de variantes, prix unique
  price: {
    type: Number,
    min: [0, 'Le prix ne peut pas être négatif']
  },
  
  compareAtPrice: {
    type: Number,
    min: [0, 'Le prix de comparaison ne peut pas être négatif']
  },
  
  // Variantes du produit
  variants: [variantSchema],
  
  
  // Images
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  
  // Inventaire (si pas de variantes)
  inventory: {
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'La quantité ne peut pas être négative']
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    },
    trackQuantity: {
      type: Boolean,
      default: true
    },
    allowBackorder: {
      type: Boolean,
      default: false
    },
    reservedQuantity: {
      type: Number,
      default: 0
    }
  },
  
  // Commande minimum (désactivé - les clients peuvent commander n'importe quelle quantité)
  minimumOrderQuantity: {
    type: Number,
    default: 0
  },
  
  maximumOrderQuantity: {
    type: Number,
    min: [1, 'La quantité maximum doit être au moins 1']
  },
  
  // Statut et modération
  status: {
    type: String,
    enum: ['draft', 'pending-review', 'approved', 'rejected', 'inactive'],
    default: 'draft'
  },
  
  rejectionReason: String,
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  
  // Métadonnées
  publishedAt: Date,
  lastStockUpdate: Date,
  
  // Statistiques
  stats: {
    views: {
      type: Number,
      default: 0
    },
    sales: {
      type: Number,
      default: 0
    },
    favorites: {
      type: Number,
      default: 0
    }
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = {
  variantSchema,
  productSchema
};

