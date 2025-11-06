const mongoose = require('mongoose');

const blogVisitSchema = new mongoose.Schema({
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  
  // Géolocalisation
  ipAddress: {
    type: String,
    required: true
  },
  country: String,
  region: String,
  city: String,
  
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
    brand: String,
    model: String,
    os: String,
    osVersion: String,
    browser: String,
    browserVersion: String
  },
  
  // Référent et UTM
  referrer: String,
  referrerDomain: String,
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  
  // Métriques comportementales
  timeOnPage: {
    type: Number,
    default: 0,
    min: 0
  },
  scrollDepth: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isBounce: {
    type: Boolean,
    default: true
  },
  
  // Page
  pageTitle: {
    type: String,
    required: true
  },
  pageUrl: {
    type: String,
    required: true
  },
  
  // Statut
  status: {
    type: String,
    enum: ['active', 'completed', 'bounced'],
    default: 'active'
  },
  
  // Timestamps
  visitedAt: {
    type: Date,
    default: Date.now
  },
  leftAt: Date
}, {
  timestamps: true
});

// Index pour requêtes fréquentes
blogVisitSchema.index({ blog: 1, visitedAt: -1 });
blogVisitSchema.index({ sessionId: 1 });
blogVisitSchema.index({ ipAddress: 1 });
blogVisitSchema.index({ country: 1 });
blogVisitSchema.index({ 'device.type': 1 });

// Méthodes d'instance
blogVisitSchema.methods.calculateDuration = function() {
  if (this.leftAt && this.visitedAt) {
    return Math.floor((this.leftAt - this.visitedAt) / 1000); // en secondes
  }
  return 0;
};

blogVisitSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.leftAt = new Date();
  this.isBounce = this.timeOnPage < 30 || this.scrollDepth < 10;
  return this.save();
};

blogVisitSchema.methods.markAsBounced = function() {
  this.status = 'bounced';
  this.leftAt = new Date();
  this.isBounce = true;
  return this.save();
};

module.exports = mongoose.model('BlogVisit', blogVisitSchema);

