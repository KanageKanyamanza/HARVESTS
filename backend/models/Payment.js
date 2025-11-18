const mongoose = require('mongoose');

// Schéma pour les paiements PayPal
const paypalSchema = new mongoose.Schema({
  orderId: String,
  captureId: String,
  payerEmail: String,
  payerName: String,
  status: String,
  rawResponse: mongoose.Schema.Types.Mixed
}, { _id: false });

// Schéma pour le paiement à la livraison (cash on delivery)
const cashOnDeliverySchema = new mongoose.Schema({
  instructions: {
    type: String,
    default: 'Préparez le montant exact à régler auprès du livreur lors de la livraison.'
  },
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  confirmedAt: Date,
  notes: String
}, { _id: false });

// Schéma principal des paiements
const paymentSchema = new mongoose.Schema({
  // Références
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: function() {
      // Requis seulement pour les paiements de commande (type 'payment' ou 'order')
      return this.type === 'payment' || this.type === 'order';
    }
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Utilisateur requis']
  },
  
  // Identifiants de paiement
  paymentId: {
    type: String,
    unique: true,
    required: true
  },
  
  externalId: String, // ID du fournisseur de paiement externe
  
  // Type et méthode de paiement
  type: {
    type: String,
    enum: ['payment', 'order', 'refund', 'payout', 'fee', 'subscription'],
    required: true
  },
  
  method: {
    type: String,
    enum: ['cash', 'paypal'],
    required: [true, 'Méthode de paiement requise']
  },
  
  provider: {
    type: String,
    enum: ['cash-on-delivery', 'paypal'],
    default: function() {
      return this.method === 'cash' ? 'cash-on-delivery' : 'paypal';
    }
  },
  
  // Montants
  amount: {
    type: Number,
    required: [true, 'Montant requis'],
    min: [0, 'Le montant ne peut pas être négatif']
  },
  
  currency: {
    type: String,
    required: [true, 'Devise requise'],
    enum: ['XAF', 'EUR', 'USD', 'XOF', 'GHS', 'NGN', 'KES'],
    default: 'XAF'
  },
  
  // Montant original si conversion de devise
  originalAmount: Number,
  originalCurrency: String,
  exchangeRate: Number,
  
  // Frais
  fees: {
    platform: {
      type: Number,
      default: 0
    },
    payment: {
      type: Number,
      default: 0
    },
    processing: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  
  // Montant net reçu par le vendeur
  netAmount: Number,
  
  // Statut du paiement
  status: {
    type: String,
    enum: [
      'pending',        // En attente
      'processing',     // En cours de traitement
      'requires_action', // Nécessite une action (3D Secure, etc.)
      'succeeded',      // Réussi
      'failed',         // Échoué
      'cancelled',      // Annulé
      'refunded',       // Remboursé
      'partially_refunded', // Partiellement remboursé
      'disputed',       // Contesté
      'expired'         // Expiré
    ],
    default: 'pending'
  },
  
  // Détails spécifiques selon la méthode
  paymentDetails: {
    paypal: paypalSchema,
    cash: cashOnDeliverySchema
  },
  
  // Description du paiement
  description: String,
  
  // Métadonnées du paiement
  metadata: {
    customerIp: String,
    userAgent: String,
    riskScore: Number,
    fraudCheck: {
      passed: Boolean,
      reasons: [String]
    }
  },
  
  // Dates importantes
  authorizedAt: Date,
  capturedAt: Date,
  paidAt: Date,
  failedAt: Date,
  cancelledAt: Date,
  refundedAt: Date,
  expiresAt: Date,
  
  // Informations d'échec
  failureCode: String,
  failureMessage: String,
  declineCode: String,
  
  // Remboursements
  refunds: [{
    refundId: String,
    amount: Number,
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'cancelled']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    processedAt: Date,
    failureReason: String
  }],
  
  // Contestations
  disputes: [{
    disputeId: String,
    amount: Number,
    reason: {
      type: String,
      enum: ['duplicate', 'fraudulent', 'subscription_canceled', 'product_unacceptable', 'product_not_received', 'unrecognized', 'credit_not_processed']
    },
    status: {
      type: String,
      enum: ['warning_needs_response', 'warning_under_review', 'warning_closed', 'needs_response', 'under_review', 'charge_refunded', 'won', 'lost']
    },
    evidence: mongoose.Schema.Types.Mixed,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Webhooks reçus
  webhooks: [{
    eventType: String,
    eventId: String,
    receivedAt: {
      type: Date,
      default: Date.now
    },
    processed: {
      type: Boolean,
      default: false
    },
    data: mongoose.Schema.Types.Mixed
  }],
  
  // Tentatives de paiement
  attempts: [{
    attemptedAt: {
      type: Date,
      default: Date.now
    },
    status: String,
    errorCode: String,
    errorMessage: String,
    processingTime: Number // en millisecondes
  }],
  
  // Réconciliation comptable
  reconciliation: {
    isReconciled: {
      type: Boolean,
      default: false
    },
    reconciledAt: Date,
    reconciledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    bankStatementRef: String,
    discrepancies: [String]
  },
  
  // Informations de conformité
  compliance: {
    amlCheck: {
      status: {
        type: String,
        enum: ['pending', 'passed', 'failed', 'manual_review']
      },
      checkedAt: Date,
      riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high']
      }
    },
    kycRequired: Boolean,
    taxReporting: {
      required: Boolean,
      reported: Boolean,
      reportedAt: Date
    }
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour performance
paymentSchema.index({ paymentId: 1 }, { unique: true });
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ method: 1, provider: 1 });
paymentSchema.index({ externalId: 1 });
paymentSchema.index({ paidAt: 1 });
paymentSchema.index({ 'reconciliation.isReconciled': 1 });
paymentSchema.index({ currency: 1, createdAt: -1 });

// Index composé pour les requêtes fréquentes
paymentSchema.index({ user: 1, status: 1, createdAt: -1 });

// Virtuals
paymentSchema.virtual('isSuccessful').get(function() {
  return this.status === 'succeeded';
});

paymentSchema.virtual('isPending').get(function() {
  return ['pending', 'processing', 'requires_action'].includes(this.status);
});

paymentSchema.virtual('isFailed').get(function() {
  return ['failed', 'cancelled', 'expired'].includes(this.status);
});

paymentSchema.virtual('totalRefunded').get(function() {
  return this.refunds
    .filter(refund => refund.status === 'succeeded')
    .reduce((total, refund) => total + refund.amount, 0);
});

paymentSchema.virtual('canBeRefunded').get(function() {
  return this.status === 'succeeded' && 
         this.totalRefunded < this.amount &&
         this.paidAt &&
         (new Date() - this.paidAt) < (90 * 24 * 60 * 60 * 1000); // 90 jours
});

paymentSchema.virtual('processingTime').get(function() {
  if (this.paidAt && this.createdAt) {
    return this.paidAt - this.createdAt;
  }
  return null;
});

// Middleware pre-save
paymentSchema.pre('save', function(next) {
  // Générer un ID de paiement unique si nouveau
  if (this.isNew && !this.paymentId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    this.paymentId = `pay_${timestamp}_${random}`;
  }
  
  // Calculer les frais totaux
  if (this.fees) {
    this.fees.total = (this.fees.platform || 0) + 
                     (this.fees.payment || 0) + 
                     (this.fees.processing || 0);
  }
  
  // Calculer le montant net
  this.netAmount = this.amount - (this.fees?.total || 0);
  
  // Mettre à jour les dates selon le statut
  const now = new Date();
  if (this.isModified('status')) {
    switch (this.status) {
      case 'succeeded':
        if (!this.paidAt) this.paidAt = now;
        break;
      case 'failed':
        if (!this.failedAt) this.failedAt = now;
        break;
      case 'cancelled':
        if (!this.cancelledAt) this.cancelledAt = now;
        break;
      case 'refunded':
        if (!this.refundedAt) this.refundedAt = now;
        break;
    }
  }
  
  next();
});

// Middleware post-save pour mettre à jour la commande (seulement pour les paiements de commande)
paymentSchema.post('save', async function() {
  // Ne mettre à jour la commande que si c'est un paiement de commande (type 'payment' ou 'order')
  if ((this.type !== 'payment' && this.type !== 'order') || !this.order) {
    return;
  }

  try {
    const Order = mongoose.model('Order');
    const order = await Order.findById(this.order).populate('delivery.transporter');
    
    if (order) {
      const wasCompleted = order.payment.status === 'completed' || order.payment.status === 'succeeded';
      const isNowCompleted = this.status === 'completed' || this.status === 'succeeded';
      
      // Mettre à jour le statut de paiement de la commande
      order.payment.status = this.status;
      order.payment.paidAt = this.paidAt;
      order.payment.transactionId = this.paymentId;
      
      if (isNowCompleted && order.status === 'pending') {
        await order.updateStatus('confirmed', null, 'Paiement confirmé');
      }
      
      await order.save();
      
      // Si le paiement vient d'être complété et qu'il y a un livreur assigné, créer un paiement pour les frais de livraison
      if (isNowCompleted && !wasCompleted && order.delivery?.transporter) {
        await createDeliveryFeePayment(order);
      }
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error);
  }
});

// Fonction pour créer un paiement de frais de livraison pour le transporteur
async function createDeliveryFeePayment(order) {
  try {
    const transporterId = order.delivery.transporter._id || order.delivery.transporter;
    const deliveryFee = order.deliveryFee || order.delivery?.deliveryFee || 0;
    
    if (!transporterId || deliveryFee <= 0) {
      return;
    }
    
    // Vérifier si un paiement de frais de livraison existe déjà pour cette commande
    const existingPayment = await mongoose.model('Payment').findOne({
      order: order._id,
      user: transporterId,
      type: 'payout',
      'metadata.deliveryFee': true
    });
    
    if (existingPayment) {
      return; // Paiement déjà créé
    }
    
    // Créer un paiement de type 'payout' pour le transporteur
    const transporterPayment = await mongoose.model('Payment').create({
      paymentId: new mongoose.Types.ObjectId().toString(),
      order: order._id,
      user: transporterId,
      amount: deliveryFee,
      currency: order.currency || 'XAF',
      method: 'cash', // Les frais de livraison sont en cash
      provider: 'cash-on-delivery',
      type: 'payout', // Type 'payout' pour les paiements aux transporteurs
      status: 'completed', // Les frais de livraison sont automatiquement payés
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        deliveryFee: true,
        transporterType: 'transporter' // ou 'exporter'
      },
      paidAt: new Date()
    });
    
    // Notifier le transporteur
    const Notification = require('./Notification');
    const User = mongoose.model('User');
    const transporter = await User.findById(transporterId).select('firstName lastName companyName userType');
    const transporterName = transporter?.companyName || 
      (transporter?.firstName && transporter?.lastName ? `${transporter.firstName} ${transporter.lastName}` : 'Livreur');
    
    await Notification.createNotification({
      recipient: transporterId,
      type: 'payout_processed',
      category: 'payment',
      title: 'Frais de livraison reçus',
      message: `Vous avez reçu ${deliveryFee} ${order.currency || 'XAF'} de frais de livraison pour la commande ${order.orderNumber}`,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: deliveryFee,
        currency: order.currency || 'XAF',
        paymentId: transporterPayment.paymentId,
        paymentType: 'delivery_fee'
      },
      channels: {
        inApp: { enabled: true },
        email: { enabled: true },
        push: { enabled: true }
      }
    });
    
    console.log(`✅ Paiement de frais de livraison créé pour le transporteur ${transporterId}: ${deliveryFee} ${order.currency || 'XAF'}`);
  } catch (error) {
    console.error('Erreur lors de la création du paiement de frais de livraison:', error);
  }
}

// Méthodes du schéma
paymentSchema.methods.calculateFees = function() {
  const amount = Number(this.amount || 0);
  const percent = Number(process.env.PAYPAL_FEE_PERCENT || 0);
  const fixed = Number(process.env.PAYPAL_FIXED_FEE || 0);

  this.fees = this.fees || {};
  if (this.method === 'paypal') {
    const variableFee = percent ? amount * (percent / 100) : 0;
    this.fees.payment = Math.round(variableFee + fixed);
  } else {
    this.fees.payment = 0;
  }

  this.fees.platform = this.fees.platform || 0;
  this.fees.processing = this.fees.processing || 0;
  this.fees.total = (this.fees.platform || 0) + (this.fees.payment || 0) + (this.fees.processing || 0);
  this.netAmount = amount - this.fees.total;
};

paymentSchema.methods.markAsSucceeded = function(transactionId = null, paidAt = null) {
  this.status = 'succeeded';
  this.paidAt = paidAt || new Date();
  if (transactionId) {
    this.externalId = transactionId;
  }
  
  return this.save();
};

paymentSchema.methods.markAsFailed = function(errorCode, errorMessage) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.failureCode = errorCode;
  this.failureMessage = errorMessage;
  
  // Ajouter à l'historique des tentatives
  this.attempts.push({
    status: 'failed',
    errorCode,
    errorMessage
  });
  
  return this.save();
};

paymentSchema.methods.cancel = function(reason = null) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  if (reason) {
    this.failureMessage = reason;
  }
  
  return this.save();
};

paymentSchema.methods.createRefund = function(amount, reason = 'requested_by_customer') {
  if (!this.canBeRefunded) {
    throw new Error('Ce paiement ne peut pas être remboursé');
  }
  
  if (amount > (this.amount - this.totalRefunded)) {
    throw new Error('Le montant du remboursement dépasse le montant disponible');
  }
  
  const refundId = `ref_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  this.refunds.push({
    refundId,
    amount,
    reason,
    status: 'pending'
  });
  
  return this.save();
};

paymentSchema.methods.processRefund = function(refundId, status, processedAt = null) {
  const refund = this.refunds.find(r => r.refundId === refundId);
  if (!refund) {
    throw new Error('Remboursement non trouvé');
  }
  
  refund.status = status;
  refund.processedAt = processedAt || new Date();
  
  // Mettre à jour le statut global si nécessaire
  if (status === 'succeeded') {
    const totalRefunded = this.totalRefunded;
    if (totalRefunded >= this.amount) {
      this.status = 'refunded';
      this.refundedAt = new Date();
    } else if (totalRefunded > 0) {
      this.status = 'partially_refunded';
    }
  }
  
  return this.save();
};

paymentSchema.methods.addWebhook = function(eventType, eventId, data) {
  this.webhooks.push({
    eventType,
    eventId,
    data
  });
  
  return this.save();
};

paymentSchema.methods.processWebhook = function(eventId) {
  const webhook = this.webhooks.find(w => w.eventId === eventId);
  if (webhook) {
    webhook.processed = true;
  }
  
  return this.save();
};

paymentSchema.methods.reconcile = function(userId, bankStatementRef = null, discrepancies = []) {
  this.reconciliation.isReconciled = true;
  this.reconciliation.reconciledAt = new Date();
  this.reconciliation.reconciledBy = userId;
  this.reconciliation.bankStatementRef = bankStatementRef;
  this.reconciliation.discrepancies = discrepancies;
  
  return this.save();
};

// Méthodes statiques
paymentSchema.statics.createPayment = function(paymentData) {
  const payment = new this(paymentData);
  return payment.save();
};

paymentSchema.statics.findByExternalId = function(externalId) {
  return this.findOne({ externalId });
};

paymentSchema.statics.getPaymentsByStatus = function(status, options = {}) {
  const query = { status };
  
  if (options.method) query.method = options.method;
  if (options.provider) query.provider = options.provider;
  if (options.user) query.user = options.user;
  if (options.dateFrom) query.createdAt = { $gte: new Date(options.dateFrom) };
  if (options.dateTo) {
    query.createdAt = { ...query.createdAt, $lte: new Date(options.dateTo) };
  }
  
  return this.find(query)
    .populate('user', 'firstName lastName email')
    .populate('order', 'orderNumber total')
    .sort({ createdAt: -1 })
    .limit(options.limit || 100);
};

paymentSchema.statics.getRevenueStats = function(dateFrom, dateTo, currency = 'XAF') {
  const matchQuery = {
    status: 'succeeded',
    currency,
    paidAt: { $gte: new Date(dateFrom), $lte: new Date(dateTo) }
  };
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        totalFees: { $sum: '$fees.total' },
        netRevenue: { $sum: '$netAmount' },
        transactionCount: { $sum: 1 },
        averageTransaction: { $avg: '$amount' }
      }
    }
  ]);
};

paymentSchema.statics.getPaymentMethodStats = function(dateFrom, dateTo) {
  const matchQuery = {
    status: 'succeeded',
    paidAt: { $gte: new Date(dateFrom), $lte: new Date(dateTo) }
  };
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: { method: '$method', provider: '$provider' },
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        averageAmount: { $avg: '$amount' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

paymentSchema.statics.getFailureAnalysis = function(dateFrom, dateTo) {
  const matchQuery = {
    status: 'failed',
    failedAt: { $gte: new Date(dateFrom), $lte: new Date(dateTo) }
  };
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: { code: '$failureCode', message: '$failureMessage' },
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

paymentSchema.statics.getUnreconciledPayments = function(olderThanDays = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  
  return this.find({
    status: 'succeeded',
    paidAt: { $lt: cutoffDate },
    'reconciliation.isReconciled': false
  }).populate('user', 'firstName lastName email')
    .populate('order', 'orderNumber');
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
