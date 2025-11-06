const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
  // Contenu bilingue (FR/EN)
  title: {
    fr: {
      type: String,
      trim: true
    },
    en: {
      type: String,
      trim: true
    }
  },
  slug: {
    fr: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    en: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    }
  },
  excerpt: {
    fr: {
      type: String,
      maxlength: [500, 'L\'extrait ne peut pas dépasser 500 caractères']
    },
    en: {
      type: String,
      maxlength: [500, 'L\'extrait ne peut pas dépasser 500 caractères']
    }
  },
  content: {
    fr: {
      type: String
    },
    en: {
      type: String
    }
  },
  
  // Classification
  type: {
    type: String,
    enum: ['article', 'etude-cas', 'tutoriel', 'actualite', 'temoignage'],
    default: 'article'
  },
  category: {
    type: String,
    enum: ['strategie', 'technologie', 'finance', 'ressources-humaines', 
           'marketing', 'operations', 'gouvernance']
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Images
  featuredImage: {
    url: String,
    alt: String,
    caption: String
  },
  images: [{
    cloudinaryId: String,
    url: String,
    alt: String,
    caption: String,
    position: {
      type: String,
      enum: ['top', 'middle', 'bottom', 'inline', 'content-start', 'content-end'],
      default: 'inline'
    },
    order: {
      type: Number,
      default: 0
    },
    width: Number,
    height: Number,
    format: String,
    size: Number
  }],
  
  // Statut et publication
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  
  // Auteur
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  
  // SEO bilingue
  metaTitle: {
    fr: {
      type: String,
      maxlength: [60, 'Le titre SEO ne peut pas dépasser 60 caractères']
    },
    en: {
      type: String,
      maxlength: [60, 'Le titre SEO ne peut pas dépasser 60 caractères']
    }
  },
  metaDescription: {
    fr: {
      type: String,
      maxlength: [160, 'La description SEO ne peut pas dépasser 160 caractères']
    },
    en: {
      type: String,
      maxlength: [160, 'La description SEO ne peut pas dépasser 160 caractères']
    }
  },
  
  // Statistiques
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  
  // Configurations spéciales par type
  caseStudy: {
    company: String,
    sector: String,
    companySize: String,
    challenge: String,
    solution: String,
    results: String,
    metrics: [{
      label: String,
      value: String,
      description: String
    }]
  },
  tutorial: {
    difficulty: {
      type: String,
      enum: ['debutant', 'intermediaire', 'avance']
    },
    duration: String,
    prerequisites: [String]
  },
  testimonial: {
    clientName: String,
    clientCompany: String,
    clientPosition: String,
    clientPhoto: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }
}, {
  timestamps: true
});

// Index pour recherche textuelle
blogSchema.index({ 
  'title.fr': 'text', 
  'title.en': 'text',
  'content.fr': 'text',
  'content.en': 'text',
  'excerpt.fr': 'text',
  'excerpt.en': 'text'
});

// Index pour filtres
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ type: 1, category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ 'slug.fr': 1 });
blogSchema.index({ 'slug.en': 1 });

// Middleware pre-save pour générer les slugs
blogSchema.pre('save', function(next) {
  // Générer slug FR si titre FR existe
  if (this.title?.fr && !this.slug?.fr) {
    this.slug.fr = slugify(this.title.fr, { 
      lower: true, 
      strict: true,
      locale: 'fr'
    });
  }
  
  // Générer slug EN si titre EN existe
  if (this.title?.en && !this.slug?.en) {
    this.slug.en = slugify(this.title.en, { 
      lower: true, 
      strict: true,
      locale: 'en'
    });
  }
  
  // Définir publishedAt si status passe à published
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Validation : au moins une langue doit être remplie
blogSchema.pre('validate', function(next) {
  if (!this.title?.fr && !this.title?.en) {
    next(new Error('Au moins un titre (FR ou EN) est requis'));
  } else {
    next();
  }
});

// Méthodes d'instance
blogSchema.methods.getTitle = function(language = 'fr') {
  return this.title?.[language] || this.title?.fr || this.title?.en || '';
};

blogSchema.methods.getSlug = function(language = 'fr') {
  return this.slug?.[language] || this.slug?.fr || this.slug?.en || '';
};

blogSchema.methods.getExcerpt = function(language = 'fr') {
  return this.excerpt?.[language] || this.excerpt?.fr || this.excerpt?.en || '';
};

blogSchema.methods.getContent = function(language = 'fr') {
  return this.content?.[language] || this.content?.fr || this.content?.en || '';
};

blogSchema.methods.getMetaTitle = function(language = 'fr') {
  return this.metaTitle?.[language] || this.metaTitle?.fr || this.metaTitle?.en || this.getTitle(language);
};

blogSchema.methods.getMetaDescription = function(language = 'fr') {
  return this.metaDescription?.[language] || this.metaDescription?.fr || this.metaDescription?.en || this.getExcerpt(language);
};

blogSchema.methods.getLocalizedContent = function(language = 'fr') {
  return {
    title: this.getTitle(language),
    slug: this.getSlug(language),
    excerpt: this.getExcerpt(language),
    content: this.getContent(language),
    metaTitle: this.getMetaTitle(language),
    metaDescription: this.getMetaDescription(language)
  };
};

blogSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

blogSchema.methods.incrementLikes = function() {
  this.likes += 1;
  return this.save();
};

blogSchema.methods.getVisitStats = async function() {
  const BlogVisit = mongoose.model('BlogVisit');
  const visits = await BlogVisit.find({ blog: this._id });
  
  return {
    total: visits.length,
    unique: new Set(visits.map(v => v.sessionId)).size,
    averageTimeOnPage: visits.reduce((sum, v) => sum + (v.timeOnPage || 0), 0) / visits.length || 0,
    averageScrollDepth: visits.reduce((sum, v) => sum + (v.scrollDepth || 0), 0) / visits.length || 0,
    bounceRate: visits.filter(v => v.isBounce).length / visits.length || 0
  };
};

module.exports = mongoose.model('Blog', blogSchema);

