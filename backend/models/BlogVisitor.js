const mongoose = require('mongoose');

const blogVisitorSchema = new mongoose.Schema({
  // Informations personnelles
  firstName: {
    type: String,
    required: [true, 'validation.blog_visitor_first_name_required'],
    trim: true,
    maxlength: [50, 'validation.first_name_maxlength']
  },
  lastName: {
    type: String,
    required: [true, 'validation.blog_visitor_last_name_required'],
    trim: true,
    maxlength: [50, 'validation.last_name_maxlength']
  },
  email: {
    type: String,
    required: [true, 'validation.blog_visitor_email_required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'validation.email_invalid'
    }
  },
  country: {
    type: String,
    required: [true, 'validation.blog_visitor_country_required'],
    maxlength: [100, 'validation.blog_visitor_country_maxlength']
  },
  
  // Localisation
  ipAddress: {
    type: String,
    required: true,
    index: true
  },
  city: String,
  region: String,
  
  // Appareil
  userAgent: {
    type: String,
    required: true
  },
  device: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet']
    },
    browser: String,
    os: String
  },
  
  // Historique des visites
  blogsVisited: [{
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    },
    blogTitle: String,
    blogSlug: String,
    visitedAt: {
      type: Date,
      default: Date.now
    },
    scrollDepth: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    timeOnPage: {
      type: Number,
      default: 0,
      min: 0
    },
    isFormSubmitted: {
      type: Boolean,
      default: false
    }
  }],
  
  // Statistiques globales
  totalBlogsVisited: {
    type: Number,
    default: 1
  },
  totalTimeSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  averageScrollDepth: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Statut
  isReturningVisitor: {
    type: Boolean,
    default: false
  },
  lastVisitAt: {
    type: Date,
    default: Date.now
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  
  // Métadonnées
  source: {
    type: String,
    enum: ['blog_form', 'manual_entry'],
    default: 'blog_form'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index
blogVisitorSchema.index({ email: 1 });
blogVisitorSchema.index({ ipAddress: 1 });
blogVisitorSchema.index({ sessionId: 1 });
blogVisitorSchema.index({ lastVisitAt: -1 });

// Méthodes d'instance
blogVisitorSchema.methods.addBlogVisit = function(blogId, blogTitle, blogSlug, scrollDepth = 0, timeOnPage = 0) {
  this.blogsVisited.push({
    blog: blogId,
    blogTitle,
    blogSlug,
    scrollDepth,
    timeOnPage,
    isFormSubmitted: true
  });
  
  this.totalBlogsVisited += 1;
  this.totalTimeSpent += timeOnPage;
  
  // Recalculer la moyenne du scroll depth
  const totalScroll = this.blogsVisited.reduce((sum, visit) => sum + visit.scrollDepth, 0);
  this.averageScrollDepth = Math.round(totalScroll / this.blogsVisited.length);
  
  this.lastVisitAt = new Date();
  return this.save();
};

blogVisitorSchema.methods.markAsReturningVisitor = function() {
  this.isReturningVisitor = true;
  return this.save();
};

blogVisitorSchema.methods.getStats = function() {
  return {
    totalBlogsVisited: this.totalBlogsVisited,
    totalTimeSpent: this.totalTimeSpent,
    averageScrollDepth: this.averageScrollDepth,
    isReturningVisitor: this.isReturningVisitor,
    lastVisitAt: this.lastVisitAt
  };
};

// Méthodes statiques
blogVisitorSchema.statics.findByIP = function(ipAddress) {
  return this.findOne({ ipAddress, status: 'active' }).sort({ lastVisitAt: -1 });
};

blogVisitorSchema.statics.getGlobalStats = async function() {
  const total = await this.countDocuments({ status: 'active' });
  const returning = await this.countDocuments({ isReturningVisitor: true, status: 'active' });
  const newVisitors = total - returning;
  
  const avgTime = await this.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: null, avg: { $avg: '$totalTimeSpent' } } }
  ]);
  
  const avgScroll = await this.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: null, avg: { $avg: '$averageScrollDepth' } } }
  ]);
  
  return {
    total,
    returning,
    newVisitors,
    averageTimeSpent: avgTime[0]?.avg || 0,
    averageScrollDepth: avgScroll[0]?.avg || 0
  };
};

module.exports = mongoose.model('BlogVisitor', blogVisitorSchema);

