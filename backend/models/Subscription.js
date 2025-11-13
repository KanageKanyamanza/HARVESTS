const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Utilisateur requis'],
    index: true
  },
  planId: {
    type: String,
    required: [true, 'Plan requis'],
    enum: ['gratuit', 'standard', 'premium'],
    index: true
  },
  planName: {
    type: String,
    required: true
  },
  billingPeriod: {
    type: String,
    required: true,
    enum: ['monthly', 'annual']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'XAF'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'cancelled', 'expired', 'suspended'],
    default: 'pending',
    index: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  nextBillingDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'paypal'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ planId: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ nextBillingDate: 1 });

// Méthode pour calculer la date de fin
subscriptionSchema.methods.calculateEndDate = function() {
  const start = this.startDate || new Date();
  const months = this.billingPeriod === 'annual' ? 12 : 1;
  const endDate = new Date(start);
  endDate.setMonth(endDate.getMonth() + months);
  return endDate;
};

// Méthode pour calculer la prochaine date de facturation
subscriptionSchema.methods.calculateNextBillingDate = function() {
  if (!this.autoRenew || this.status !== 'active') {
    return null;
  }
  const lastBilling = this.nextBillingDate || this.startDate || new Date();
  const months = this.billingPeriod === 'annual' ? 12 : 1;
  const nextDate = new Date(lastBilling);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
};

// Pré-save hook pour calculer les dates
subscriptionSchema.pre('save', function(next) {
  if (this.isNew && !this.endDate) {
    this.endDate = this.calculateEndDate();
  }
  if (this.isNew && !this.nextBillingDate && this.status === 'active') {
    this.nextBillingDate = this.calculateNextBillingDate();
  }
  next();
});

// Méthode statique pour obtenir les plans disponibles
subscriptionSchema.statics.getAvailablePlans = function() {
  return {
    gratuit: {
      id: 'gratuit',
      name: 'Gratuit',
      monthlyPrice: 0,
      annualPrice: 0
    },
    standard: {
      id: 'standard',
      name: 'Standard',
      monthlyPrice: 3000,
      annualPrice: 25000
    },
    premium: {
      id: 'premium',
      name: 'Premium',
      monthlyPrice: 10000,
      annualPrice: 75000
    }
  };
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;

