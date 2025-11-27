const mongoose = require('mongoose');

const chatInteractionSchema = new mongoose.Schema({
  // Utilisateur (null si visiteur non connecté)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  // Session ID pour les visiteurs non connectés
  sessionId: {
    type: String,
    index: true
  },
  // Question posée
  question: {
    type: String,
    required: true
  },
  // Réponse donnée par le bot
  response: {
    type: String
  },
  // Type de réponse
  responseType: {
    type: String,
    enum: ['faq', 'intent', 'product_search', 'no_answer', 'greeting'],
    default: 'no_answer'
  },
  // FAQ ou intent correspondant (si trouvé)
  matchedFaqId: String,
  matchedIntent: String,
  // Score de confiance (si applicable)
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  // Feedback utilisateur
  feedback: {
    type: String,
    enum: ['helpful', 'not_helpful', null],
    default: null
  },
  // Métadonnées
  ip: String,
  userAgent: String,
  language: {
    type: String,
    default: 'fr'
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false
});

// Index pour les analytics
chatInteractionSchema.index({ responseType: 1, createdAt: -1 });
chatInteractionSchema.index({ feedback: 1, createdAt: -1 });

// TTL - garder 6 mois d'historique
chatInteractionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

module.exports = mongoose.model('ChatInteraction', chatInteractionSchema);

