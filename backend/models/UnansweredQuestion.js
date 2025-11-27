const mongoose = require('mongoose');

const unansweredQuestionSchema = new mongoose.Schema({
  // Question originale
  question: {
    type: String,
    required: true
  },
  // Questions similaires regroupées
  similarQuestions: [{
    text: String,
    count: { type: Number, default: 1 },
    lastAsked: Date
  }],
  // Nombre de fois posée
  count: {
    type: Number,
    default: 1
  },
  // Statut
  status: {
    type: String,
    enum: ['pending', 'answered', 'ignored'],
    default: 'pending',
    index: true
  },
  // Réponse ajoutée par l'admin
  answer: {
    type: String
  },
  // Catégorie assignée
  category: {
    type: String,
    enum: ['livraison', 'paiement', 'commande', 'compte', 'produits', 'autre'],
    default: 'autre'
  },
  // Mots-clés pour le matching (ajoutés par admin)
  keywords: [String],
  // Admin qui a répondu
  answeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  answeredAt: Date,
  // Premier et dernier utilisateur à avoir posé la question
  firstAskedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastAskedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour recherche
unansweredQuestionSchema.index({ question: 'text' });
unansweredQuestionSchema.index({ count: -1 });

module.exports = mongoose.model('UnansweredQuestion', unansweredQuestionSchema);

