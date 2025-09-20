const mongoose = require('mongoose');

// Schéma pour les participants
const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'member', 'observer'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  leftAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  // Paramètres de notification pour ce participant
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    sound: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    }
  },
  // Dernière fois que l'utilisateur a lu la conversation
  lastReadAt: {
    type: Date,
    default: Date.now
  },
  // Nombre de messages non lus
  unreadCount: {
    type: Number,
    default: 0
  }
}, { _id: true });

// Schéma principal des conversations
const conversationSchema = new mongoose.Schema({
  // Type de conversation
  type: {
    type: String,
    enum: ['direct', 'group', 'order', 'support', 'broadcast'],
    required: [true, 'Type de conversation requis']
  },
  
  // Titre (pour les conversations de groupe)
  title: {
    type: String,
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  
  // Description
  description: {
    type: String,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  
  // Avatar de la conversation (pour les groupes)
  avatar: String,
  
  // Participants
  participants: [participantSchema],
  
  // Créateur de la conversation
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Dernier message
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // Dernière activité
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  // Nombre total de messages
  messageCount: {
    type: Number,
    default: 0
  },
  
  // Statut de la conversation
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked', 'deleted'],
    default: 'active'
  },
  
  // Informations spécifiques selon le type
  metadata: {
    // Pour les conversations liées aux commandes
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    
    // Pour les conversations de support
    supportTicket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupportTicket'
    },
    
    // Pour les conversations de négociation
    negotiation: {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: Number,
      proposedPrice: Number,
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'counter-offer']
      }
    }
  },
  
  // Paramètres de la conversation
  settings: {
    // Qui peut ajouter des membres (pour les groupes)
    whoCanAddMembers: {
      type: String,
      enum: ['admin', 'all'],
      default: 'admin'
    },
    
    // Messages éphémères
    ephemeralMessages: {
      enabled: {
        type: Boolean,
        default: false
      },
      duration: {
        type: Number, // en secondes
        default: 86400 // 24 heures
      }
    },
    
    // Auto-archivage
    autoArchive: {
      enabled: {
        type: Boolean,
        default: false
      },
      afterDays: {
        type: Number,
        default: 30
      }
    }
  },
  
  // Tags pour l'organisation
  tags: [{
    type: String,
    lowercase: true
  }],
  
  // Priorité (pour le support)
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Langue de la conversation
  language: {
    type: String,
    default: 'fr'
  },
  
  // Informations d'archivage
  archivedAt: Date,
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Informations de suppression
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ 'participants.user': 1, lastActivity: -1 });
conversationSchema.index({ type: 1, status: 1 });
conversationSchema.index({ createdBy: 1 });
conversationSchema.index({ 'metadata.order': 1 });
conversationSchema.index({ tags: 1 });
conversationSchema.index({ lastActivity: -1 });

// Index composé pour les requêtes fréquentes
conversationSchema.index({ 
  'participants.user': 1, 
  status: 1, 
  lastActivity: -1 
});

// Virtuals
conversationSchema.virtual('activeParticipants').get(function() {
  return this.participants.filter(p => p.isActive);
});

conversationSchema.virtual('participantCount').get(function() {
  return this.activeParticipants.length;
});

conversationSchema.virtual('isGroup').get(function() {
  return this.type === 'group';
});

conversationSchema.virtual('isDirect').get(function() {
  return this.type === 'direct';
});

conversationSchema.virtual('isArchived').get(function() {
  return this.status === 'archived';
});

conversationSchema.virtual('totalUnreadMessages').get(function() {
  return this.participants.reduce((total, p) => total + p.unreadCount, 0);
});

// Middleware pre-save
conversationSchema.pre('save', function(next) {
  // Mettre à jour lastActivity
  if (this.isModified('lastMessage')) {
    this.lastActivity = new Date();
  }
  
  // Valider le titre pour les conversations de groupe
  if (this.type === 'group' && !this.title) {
    this.title = `Groupe créé par ${this.createdBy}`;
  }
  
  next();
});

// Méthodes du schéma
conversationSchema.methods.addParticipant = function(userId, role = 'member', addedBy = null) {
  // Vérifier si l'utilisateur est déjà participant
  const existingParticipant = this.participants.find(
    p => p.user.toString() === userId.toString() && p.isActive
  );
  
  if (existingParticipant) {
    return this;
  }
  
  // Vérifier si l'utilisateur était un ancien participant
  const formerParticipant = this.participants.find(
    p => p.user.toString() === userId.toString() && !p.isActive
  );
  
  if (formerParticipant) {
    // Réactiver l'ancien participant
    formerParticipant.isActive = true;
    formerParticipant.joinedAt = new Date();
    formerParticipant.leftAt = undefined;
    formerParticipant.role = role;
  } else {
    // Ajouter nouveau participant
    this.participants.push({
      user: userId,
      role: role,
      joinedAt: new Date()
    });
  }
  
  return this.save();
};

conversationSchema.methods.removeParticipant = function(userId, removedBy = null) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString() && p.isActive
  );
  
  if (participant) {
    participant.isActive = false;
    participant.leftAt = new Date();
  }
  
  return this.save();
};

conversationSchema.methods.updateParticipantRole = function(userId, newRole, updatedBy = null) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString() && p.isActive
  );
  
  if (participant) {
    participant.role = newRole;
  }
  
  return this.save();
};

conversationSchema.methods.markAsRead = function(userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString() && p.isActive
  );
  
  if (participant) {
    participant.lastReadAt = new Date();
    participant.unreadCount = 0;
  }
  
  return this.save();
};

conversationSchema.methods.incrementUnreadCount = function(userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString() && p.isActive
  );
  
  if (participant) {
    participant.unreadCount = (participant.unreadCount || 0) + 1;
  }
  
  return this.save();
};

conversationSchema.methods.archive = function(userId) {
  this.status = 'archived';
  this.archivedAt = new Date();
  this.archivedBy = userId;
  
  return this.save();
};

conversationSchema.methods.unarchive = function() {
  this.status = 'active';
  this.archivedAt = undefined;
  this.archivedBy = undefined;
  
  return this.save();
};

conversationSchema.methods.block = function(userId) {
  this.status = 'blocked';
  
  return this.save();
};

conversationSchema.methods.unblock = function() {
  this.status = 'active';
  
  return this.save();
};

conversationSchema.methods.delete = function(userId) {
  this.status = 'deleted';
  this.deletedAt = new Date();
  this.deletedBy = userId;
  
  return this.save();
};

conversationSchema.methods.getOtherParticipant = function(currentUserId) {
  if (this.type !== 'direct') {
    return null;
  }
  
  const otherParticipant = this.participants.find(
    p => p.user.toString() !== currentUserId.toString() && p.isActive
  );
  
  return otherParticipant ? otherParticipant.user : null;
};

conversationSchema.methods.canUserAccess = function(userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString() && p.isActive
  );
  
  return !!participant && this.status !== 'deleted';
};

conversationSchema.methods.canUserModerate = function(userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString() && p.isActive
  );
  
  return participant && (participant.role === 'admin' || this.createdBy.toString() === userId.toString());
};

// Méthodes statiques
conversationSchema.statics.createDirectConversation = async function(user1Id, user2Id, createdBy = null) {
  // Vérifier si une conversation directe existe déjà
  const existingConversation = await this.findOne({
    type: 'direct',
    'participants.user': { $all: [user1Id, user2Id] },
    'participants.isActive': true,
    status: { $ne: 'deleted' }
  });
  
  if (existingConversation) {
    return existingConversation;
  }
  
  // Créer nouvelle conversation
  const conversation = new this({
    type: 'direct',
    createdBy: createdBy || user1Id,
    participants: [
      { user: user1Id, role: 'member' },
      { user: user2Id, role: 'member' }
    ]
  });
  
  return conversation.save();
};

conversationSchema.statics.createGroupConversation = function(title, createdBy, participantIds = []) {
  const participants = [
    { user: createdBy, role: 'admin' },
    ...participantIds.map(id => ({ user: id, role: 'member' }))
  ];
  
  const conversation = new this({
    type: 'group',
    title: title,
    createdBy: createdBy,
    participants: participants
  });
  
  return conversation.save();
};

conversationSchema.statics.createOrderConversation = function(orderId, buyerId, sellerId) {
  const conversation = new this({
    type: 'order',
    title: `Commande #${orderId}`,
    createdBy: buyerId,
    participants: [
      { user: buyerId, role: 'member' },
      { user: sellerId, role: 'member' }
    ],
    metadata: {
      order: orderId
    }
  });
  
  return conversation.save();
};

conversationSchema.statics.getUserConversations = function(userId, options = {}) {
  const query = {
    'participants.user': userId,
    'participants.isActive': true,
    status: options.includeArchived ? { $in: ['active', 'archived'] } : 'active'
  };
  
  if (options.type) {
    query.type = options.type;
  }
  
  return this.find(query)
    .populate('participants.user', 'firstName lastName avatar userType')
    .populate('lastMessage', 'content type createdAt sender')
    .populate('lastMessage.sender', 'firstName lastName')
    .sort({ lastActivity: -1 })
    .limit(options.limit || 50);
};

conversationSchema.statics.searchConversations = function(userId, searchQuery, options = {}) {
  const query = {
    'participants.user': userId,
    'participants.isActive': true,
    status: 'active',
    $or: [
      { title: { $regex: searchQuery, $options: 'i' } },
      { description: { $regex: searchQuery, $options: 'i' } },
      { tags: { $regex: searchQuery, $options: 'i' } }
    ]
  };
  
  return this.find(query)
    .populate('participants.user', 'firstName lastName avatar')
    .sort({ lastActivity: -1 })
    .limit(options.limit || 20);
};

conversationSchema.statics.getUnreadConversationsCount = function(userId) {
  return this.countDocuments({
    'participants.user': userId,
    'participants.isActive': true,
    'participants.unreadCount': { $gt: 0 },
    status: 'active'
  });
};

conversationSchema.statics.cleanupInactiveConversations = function(daysInactive = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysInactive);
  
  return this.updateMany({
    lastActivity: { $lt: cutoffDate },
    status: 'active',
    messageCount: 0
  }, {
    status: 'archived',
    archivedAt: new Date()
  });
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
