const mongoose = require('mongoose');
const slugify = require('slugify');

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
  // Informations de base multilingues
  name: {
    fr: {
      type: String,
      required: [true, 'Nom du produit requis en français'],
      trim: true,
      maxlength: [200, 'Le nom ne peut pas dépasser 200 caractères']
    },
    en: {
      type: String,
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters']
    }
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  
  description: {
    fr: {
      type: String,
      required: [true, 'Description requise en français'],
      maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
    },
    en: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    }
  },
  
  shortDescription: {
    fr: {
      type: String,
      maxlength: [300, 'La description courte ne peut pas dépasser 300 caractères']
    },
    en: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters']
    }
  },
  
  // Producteur
  producer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.transformer;
    }
  },
  
  // Transformateur
  transformer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.producer;
    }
  },
  
  // Type d'utilisateur (producer ou transformer)
  userType: {
    type: String,
    enum: ['producer', 'transformer'],
    required: true
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
    required: [true, 'Sous-catégorie requise']
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
  
  // Commande minimum
  minimumOrderQuantity: {
    type: Number,
    default: 1,
    min: [1, 'La quantité minimum doit être au moins 1']
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

// Index pour la recherche et performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ producer: 1, status: 1 });
productSchema.index({ transformer: 1, status: 1 });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ producer: 1, slug: 1 }, { unique: true, sparse: true });
productSchema.index({ transformer: 1, slug: 1 }, { unique: true, sparse: true });
productSchema.index({ isFeatured: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });

// Index géospatial pour la recherche par localisation
productSchema.index({ 'producer.address.coordinates': '2dsphere' });

// Virtuals
productSchema.virtual('isInStock').get(function() {
  if (this.hasVariants) {
    return this.variants.some(variant => 
      variant.isActive && variant.inventory.quantity > 0
    );
  }
  return this.inventory.quantity > 0;
});

productSchema.virtual('isLowStock').get(function() {
  if (this.hasVariants) {
    return this.variants.some(variant => 
      variant.isActive && 
      variant.inventory.quantity <= variant.inventory.lowStockThreshold &&
      variant.inventory.quantity > 0
    );
  }
  return this.inventory.quantity <= this.inventory.lowStockThreshold && 
         this.inventory.quantity > 0;
});

productSchema.virtual('displayPrice').get(function() {
  if (this.hasVariants && this.variants.length > 0) {
    const activePrices = this.variants
      .filter(v => v.isActive)
      .map(v => v.price);
    
    if (activePrices.length === 0) return null;
    
    const minPrice = Math.min(...activePrices);
    const maxPrice = Math.max(...activePrices);
    
    return minPrice === maxPrice ? minPrice : { from: minPrice, to: maxPrice };
  }
  return this.price;
});

productSchema.virtual('primaryImage').get(function() {
  if (this.images && this.images.length > 0) {
    const primary = this.images.find(img => img.isPrimary);
    return primary || this.images[0];
  }
  return null;
});

// Middleware pre-save
productSchema.pre('save', async function(next) {
  // Générer le slug à partir du nom français
  if (this.isModified('name')) {
    const nameForSlug = typeof this.name === 'string' ? this.name : (this.name.fr || this.name.en || 'product');
    let baseSlug = slugify(nameForSlug, { 
      lower: true, 
      strict: true,
      remove: /[*+~.()'"!:@]/g 
    });
    
    // Gérer les slugs dupliqués en ajoutant un suffixe numérique
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      try {
        const existingProduct = await this.constructor.findOne({ 
          $or: [
            { producer: this.producer, slug },
            { transformer: this.transformer, slug }
          ]
        });
        if (!existingProduct || existingProduct._id.toString() === this._id.toString()) {
          break;
        }
        slug = `${baseSlug}-${counter}`;
        counter++;
      } catch (error) {
        // En cas d'erreur, utiliser le slug de base avec timestamp
        slug = `${baseSlug}-${Date.now()}`;
        break;
      }
    }
    
    this.slug = slug;
  }
  
  
  // Valider qu'il y a au moins une image principale
  if (this.images && this.images.length > 0) {
    const primaryImages = this.images.filter(img => img.isPrimary);
    if (primaryImages.length === 0) {
      this.images[0].isPrimary = true;
    } else if (primaryImages.length > 1) {
      // Garder seulement la première comme principale
      this.images.forEach((img, index) => {
        img.isPrimary = index === this.images.findIndex(i => i.isPrimary);
      });
    }
  }
  
  next();
});

// Méthodes du schéma


productSchema.methods.reserveStock = function(quantity, variantId = null) {
  if (this.hasVariants && variantId) {
    const variant = this.variants.id(variantId);
    if (!variant || variant.inventory.quantity < quantity) {
      throw new Error('Stock insuffisant pour cette variante');
    }
    variant.inventory.quantity -= quantity;
    variant.inventory.reservedQuantity = (variant.inventory.reservedQuantity || 0) + quantity;
  } else {
    if (this.inventory.quantity < quantity) {
      throw new Error('Stock insuffisant');
    }
    this.inventory.quantity -= quantity;
    this.inventory.reservedQuantity = (this.inventory.reservedQuantity || 0) + quantity;
  }
  
  this.lastStockUpdate = new Date();
};

productSchema.methods.releaseStock = function(quantity, variantId = null) {
  if (this.hasVariants && variantId) {
    const variant = this.variants.id(variantId);
    if (variant) {
      variant.inventory.quantity += quantity;
      variant.inventory.reservedQuantity = Math.max(0, (variant.inventory.reservedQuantity || 0) - quantity);
    }
  } else {
    this.inventory.quantity += quantity;
    this.inventory.reservedQuantity = Math.max(0, (this.inventory.reservedQuantity || 0) - quantity);
  }
  
  this.lastStockUpdate = new Date();
};

productSchema.methods.incrementViews = function() {
  if (!this.stats) {
    this.stats = { views: 0, sales: 0, favorites: 0 };
  }
  this.stats.views += 1;
  return this.save({ validateBeforeSave: false });
};

// Méthode pour obtenir le contenu dans la langue demandée
productSchema.methods.getLocalizedContent = function(language = 'fr') {
  const lang = ['fr', 'en'].includes(language) ? language : 'fr';
  
  return {
    name: this.name[lang] || this.name.fr || this.name.en,
    description: this.description[lang] || this.description.fr || this.description.en,
    shortDescription: this.shortDescription[lang] || this.shortDescription.fr || this.shortDescription.en,
    // Autres champs restent identiques
    _id: this._id,
    slug: this.slug,
    producer: this.producer,
    category: this.category,
    subcategory: this.subcategory,
    price: this.price,
    images: this.images,
    inventory: this.inventory,
    stats: this.stats,
    isActive: this.isActive,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Méthode statique pour la recherche
productSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    status: 'approved',
    isActive: true,
    ...filters
  };
  
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  return this.find(searchQuery)
    .populate('producer', 'farmName firstName lastName address')
    .populate('transformer', 'companyName firstName lastName address')
    .sort(query ? { score: { $meta: 'textScore' } } : { createdAt: -1 });
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
