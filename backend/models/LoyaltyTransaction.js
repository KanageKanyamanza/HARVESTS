const mongoose = require('mongoose');

const loyaltyTransactionSchema = new mongoose.Schema({
  consumer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Consumer ID requis']
  },
  
  type: {
    type: String,
    enum: ['earn', 'redeem', 'expire', 'bonus', 'adjustment'],
    required: true
  },
  
  points: {
    type: Number,
    required: [true, 'Nombre de points requis']
  },
  
  description: {
    type: String,
    required: true
  },
  
  // Référence à la commande si applicable
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  
  // Balance après cette transaction
  balanceAfter: {
    type: Number,
    required: true
  },
  
  // Date d'expiration des points (si applicable)
  expiresAt: {
    type: Date
  },
  
  // Métadonnées additionnelles
  metadata: {
    tierAtTransaction: String,
    orderAmount: Number,
    conversionRate: Number // points gagnés par XAF dépensé
  }
}, {
  timestamps: true
});

// Index pour performance
loyaltyTransactionSchema.index({ consumer: 1, createdAt: -1 });
loyaltyTransactionSchema.index({ consumer: 1, type: 1 });
loyaltyTransactionSchema.index({ expiresAt: 1 });

const LoyaltyTransaction = mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);

module.exports = LoyaltyTransaction;

