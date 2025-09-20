const mongoose = require('mongoose');

// Schéma pour les pièces jointes
const attachmentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'document', 'video', 'audio', 'location', 'product'],
    required: true
  },
  filename: String,
  originalName: String,
  url: {
    type: String,
    required: true
  },
  size: Number, // en bytes
  mimeType: String,
  thumbnail: String, // Pour les images et vidéos
  duration: Number, // Pour les audios et vidéos (en secondes)
  
  // Pour les produits partagés
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  
  // Pour les localisations
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  }
}, { _id: true });

// Schéma pour les réactions aux messages
const reactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  emoji: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

// Schéma principal des messages
const messageSchema = new mongoose.Schema({
  // Conversation à laquelle appartient le message
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: [true, 'Conversation requise']
  },
  
  // Expéditeur
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Expéditeur requis']
  },
  
  // Type de message
  type: {
    type: String,
    enum: [
      'text',           // Message texte normal
      'image',          // Image seule
      'document',       // Document/fichier
      'video',          // Vidéo
      'audio',          // Message vocal
      'location',       // Partage de localisation
      'product',        // Partage de produit
      'system',         // Message système (utilisateur rejoint, etc.)
      'order_update',   // Mise à jour de commande
      'quote',          // Devis
      'payment_request' // Demande de paiement
    ],
    default: 'text'
  },
  
  // Contenu du message
  content: {
    type: String,
    maxlength: [5000, 'Le message ne peut pas dépasser 5000 caractères']
  },
  
  // Contenu formaté (pour les messages riches)
  richContent: {
    html: String,
    markdown: String
  },
  
  // Pièces jointes
  attachments: [attachmentSchema],
  
  // Message auquel on répond (threading)
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // Message transféré
  forwardedFrom: {
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    originalSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Réactions
  reactions: [reactionSchema],
  
  // Statut du message
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
    default: 'sending'
  },
  
  // Métadonnées de livraison
  deliveryInfo: {
    sentAt: Date,
    deliveredAt: Date,
    readBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Données spécifiques selon le type
  metadata: {
    // Pour les messages système
    systemType: {
      type: String,
      enum: ['user_joined', 'user_left', 'conversation_created', 'order_created', 'payment_received']
    },
    
    // Pour les commandes
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    
    // Pour les devis
    quote: {
      products: [{
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        },
        quantity: Number,
        unitPrice: Number,
        totalPrice: Number
      }],
      total: Number,
      currency: String,
      validUntil: Date,
      terms: String
    },
    
    // Pour les demandes de paiement
    paymentRequest: {
      amount: Number,
      currency: String,
      description: String,
      dueDate: Date
    }
  },
  
  // Édition du message
  isEdited: {
    type: Boolean,
    default: false
  },
  
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Suppression
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Épinglage
  isPinned: {
    type: Boolean,
    default: false
  },
  
  pinnedAt: Date,
  pinnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Signalement
  reports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'scam', 'other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Mentions
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Hashtags
  hashtags: [String],
  
  // Informations techniques
  clientInfo: {
    platform: String, // web, mobile, api
    version: String,
    userAgent: String,
    ip: String
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour performance
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ conversation: 1, isPinned: 1 });
messageSchema.index({ 'deliveryInfo.readBy.user': 1 });
messageSchema.index({ mentions: 1 });
messageSchema.index({ hashtags: 1 });
messageSchema.index({ isDeleted: 1 });

// Index de recherche textuelle
messageSchema.index({ 
  content: 'text',
  'richContent.html': 'text',
  'attachments.originalName': 'text'
});

// Virtuals
messageSchema.virtual('hasAttachments').get(function() {
  return this.attachments && this.attachments.length > 0;
});

messageSchema.virtual('isRead').get(function() {
  return this.status === 'read';
});

messageSchema.virtual('reactionCount').get(function() {
  return this.reactions ? this.reactions.length : 0;
});

messageSchema.virtual('uniqueReactions').get(function() {
  if (!this.reactions || this.reactions.length === 0) return [];
  
  const reactionMap = {};
  this.reactions.forEach(reaction => {
    if (!reactionMap[reaction.emoji]) {
      reactionMap[reaction.emoji] = {
        emoji: reaction.emoji,
        count: 0,
        users: []
      };
    }
    reactionMap[reaction.emoji].count++;
    reactionMap[reaction.emoji].users.push(reaction.user);
  });
  
  return Object.values(reactionMap);
});

messageSchema.virtual('isSystemMessage').get(function() {
  return this.type === 'system';
});

messageSchema.virtual('canBeEdited').get(function() {
  // Les messages peuvent être édités dans les 24h
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return !this.isDeleted && 
         !this.isSystemMessage && 
         this.createdAt > twentyFourHoursAgo;
});

messageSchema.virtual('canBeDeleted').get(function() {
  // Les messages peuvent être supprimés dans les 48h
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  return !this.isDeleted && 
         !this.isSystemMessage && 
         this.createdAt > fortyEightHoursAgo;
});

// Middleware pre-save
messageSchema.pre('save', function(next) {
  // Extraire les mentions et hashtags du contenu
  if (this.content) {
    // Extraire les mentions (@username)
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(this.content)) !== null) {
      mentions.push(match[1]);
    }
    
    // Extraire les hashtags (#tag)
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [];
    while ((match = hashtagRegex.exec(this.content)) !== null) {
      hashtags.push(match[1].toLowerCase());
    }
    
    this.hashtags = [...new Set(hashtags)]; // Supprimer les doublons
  }
  
  // Mettre à jour le statut
  if (this.isNew) {
    this.status = 'sent';
    this.deliveryInfo.sentAt = new Date();
  }
  
  next();
});

// Middleware post-save pour mettre à jour la conversation
messageSchema.post('save', async function() {
  try {
    const Conversation = mongoose.model('Conversation');
    await Conversation.findByIdAndUpdate(this.conversation, {
      lastMessage: this._id,
      lastActivity: new Date(),
      $inc: { messageCount: 1 }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la conversation:', error);
  }
});

// Méthodes du schéma
messageSchema.methods.markAsRead = function(userId) {
  // Vérifier si l'utilisateur a déjà lu le message
  const existingRead = this.deliveryInfo.readBy.find(
    read => read.user.toString() === userId.toString()
  );
  
  if (!existingRead) {
    this.deliveryInfo.readBy.push({
      user: userId,
      readAt: new Date()
    });
    
    // Mettre à jour le statut global si c'est le destinataire principal
    if (this.status !== 'read') {
      this.status = 'read';
    }
  }
  
  return this.save();
};

messageSchema.methods.addReaction = function(userId, emoji) {
  // Vérifier si l'utilisateur a déjà réagi avec ce même emoji
  const existingReaction = this.reactions.find(
    reaction => reaction.user.toString() === userId.toString() && 
                reaction.emoji === emoji
  );
  
  if (!existingReaction) {
    this.reactions.push({
      user: userId,
      emoji: emoji
    });
  }
  
  return this.save();
};

messageSchema.methods.removeReaction = function(userId, emoji) {
  const reactionIndex = this.reactions.findIndex(
    reaction => reaction.user.toString() === userId.toString() && 
                reaction.emoji === emoji
  );
  
  if (reactionIndex !== -1) {
    this.reactions.splice(reactionIndex, 1);
  }
  
  return this.save();
};

messageSchema.methods.editContent = function(newContent, userId) {
  if (!this.canBeEdited) {
    throw new Error('Ce message ne peut plus être modifié');
  }
  
  if (this.sender.toString() !== userId.toString()) {
    throw new Error('Vous ne pouvez modifier que vos propres messages');
  }
  
  // Sauvegarder l'ancien contenu
  this.editHistory.push({
    content: this.content,
    editedAt: new Date()
  });
  
  this.content = newContent;
  this.isEdited = true;
  
  return this.save();
};

messageSchema.methods.delete = function(userId, isAdmin = false) {
  if (!this.canBeDeleted && !isAdmin) {
    throw new Error('Ce message ne peut plus être supprimé');
  }
  
  if (this.sender.toString() !== userId.toString() && !isAdmin) {
    throw new Error('Vous ne pouvez supprimer que vos propres messages');
  }
  
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  
  return this.save();
};

messageSchema.methods.pin = function(userId) {
  this.isPinned = true;
  this.pinnedAt = new Date();
  this.pinnedBy = userId;
  
  return this.save();
};

messageSchema.methods.unpin = function() {
  this.isPinned = false;
  this.pinnedAt = undefined;
  this.pinnedBy = undefined;
  
  return this.save();
};

messageSchema.methods.report = function(reportedBy, reason, description = '') {
  // Vérifier si l'utilisateur a déjà signalé ce message
  const existingReport = this.reports.find(
    report => report.reportedBy.toString() === reportedBy.toString()
  );
  
  if (!existingReport) {
    this.reports.push({
      reportedBy,
      reason,
      description
    });
  }
  
  return this.save();
};

// Méthodes statiques
messageSchema.statics.createTextMessage = function(conversationId, senderId, content) {
  return this.create({
    conversation: conversationId,
    sender: senderId,
    type: 'text',
    content: content
  });
};

messageSchema.statics.createSystemMessage = function(conversationId, systemType, content, metadata = {}) {
  return this.create({
    conversation: conversationId,
    type: 'system',
    content: content,
    metadata: {
      systemType,
      ...metadata
    }
  });
};

messageSchema.statics.createProductShare = function(conversationId, senderId, productId, message = '') {
  return this.create({
    conversation: conversationId,
    sender: senderId,
    type: 'product',
    content: message,
    attachments: [{
      type: 'product',
      product: productId,
      url: `/products/${productId}`
    }]
  });
};

messageSchema.statics.createQuote = function(conversationId, senderId, quoteData) {
  return this.create({
    conversation: conversationId,
    sender: senderId,
    type: 'quote',
    content: `Devis envoyé - Total: ${quoteData.total} ${quoteData.currency}`,
    metadata: {
      quote: quoteData
    }
  });
};

messageSchema.statics.getConversationMessages = function(conversationId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({
    conversation: conversationId,
    isDeleted: false
  })
  .populate('sender', 'firstName lastName avatar userType')
  .populate('replyTo', 'content sender')
  .populate('attachments.product', 'name images price')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

messageSchema.statics.searchMessages = function(conversationId, query, options = {}) {
  const searchQuery = {
    conversation: conversationId,
    isDeleted: false,
    $text: { $search: query }
  };
  
  if (options.sender) {
    searchQuery.sender = options.sender;
  }
  
  if (options.type) {
    searchQuery.type = options.type;
  }
  
  if (options.dateFrom) {
    searchQuery.createdAt = { $gte: new Date(options.dateFrom) };
  }
  
  if (options.dateTo) {
    searchQuery.createdAt = { 
      ...searchQuery.createdAt,
      $lte: new Date(options.dateTo) 
    };
  }
  
  return this.find(searchQuery)
    .populate('sender', 'firstName lastName avatar')
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .limit(options.limit || 20);
};

messageSchema.statics.getUnreadCount = function(conversationId, userId) {
  return this.countDocuments({
    conversation: conversationId,
    sender: { $ne: userId },
    'deliveryInfo.readBy.user': { $ne: userId },
    isDeleted: false
  });
};

messageSchema.statics.markConversationAsRead = function(conversationId, userId) {
  return this.updateMany({
    conversation: conversationId,
    sender: { $ne: userId },
    'deliveryInfo.readBy.user': { $ne: userId },
    isDeleted: false
  }, {
    $push: {
      'deliveryInfo.readBy': {
        user: userId,
        readAt: new Date()
      }
    },
    status: 'read'
  });
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
