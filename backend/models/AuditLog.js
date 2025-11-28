const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  userEmail: {
    type: String,
    index: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  targetType: {
    type: String,
    enum: ['User', 'Order', 'Product', 'Payment', null]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ip: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false
});

// Index composé pour les requêtes fréquentes
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });

// TTL index - supprime les logs après 90 jours
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

