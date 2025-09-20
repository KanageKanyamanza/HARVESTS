const multer = require('multer');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Configuration Multer pour les pièces jointes
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'audio/mpeg', 'audio/wav', 'video/mp4', 'video/webm'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Type de fichier non autorisé', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
    files: 5
  }
});

exports.uploadAttachments = upload.array('attachments', 5);

// Middleware pour traiter les pièces jointes
exports.processAttachments = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  req.body.attachments = [];

  for (const file of req.files) {
    const filename = `msg-${req.user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    // Déterminer le type
    let type = 'document';
    if (file.mimetype.startsWith('image/')) type = 'image';
    else if (file.mimetype.startsWith('video/')) type = 'video';
    else if (file.mimetype.startsWith('audio/')) type = 'audio';

    req.body.attachments.push({
      type,
      filename: `${filename}.${file.mimetype.split('/')[1]}`,
      originalName: file.originalname,
      url: `/uploads/messages/${filename}`,
      size: file.size,
      mimeType: file.mimetype
    });
  }

  next();
});

// ROUTES PROTÉGÉES

// Obtenir mes conversations
exports.getMyConversations = catchAsync(async (req, res, next) => {
  const options = {
    type: req.query.type,
    includeArchived: req.query.archived === 'true',
    limit: parseInt(req.query.limit, 10) || 50
  };

  const conversations = await Conversation.getUserConversations(req.user.id, options);

  // Calculer les messages non lus pour chaque conversation
  for (const conversation of conversations) {
    const participant = conversation.participants.find(
      p => p.user._id.toString() === req.user.id
    );
    if (participant) {
      conversation.unreadCount = participant.unreadCount;
    }
  }

  res.status(200).json({
    status: 'success',
    results: conversations.length,
    data: {
      conversations
    }
  });
});

// Créer une nouvelle conversation
exports.createConversation = catchAsync(async (req, res, next) => {
  const { type, title, participantIds, orderId } = req.body;

  let conversation;

  switch (type) {
    case 'direct':
      if (!participantIds || participantIds.length !== 1) {
        return next(new AppError('Une conversation directe nécessite exactement un autre participant', 400));
      }
      conversation = await Conversation.createDirectConversation(
        req.user.id, 
        participantIds[0], 
        req.user.id
      );
      break;

    case 'group':
      if (!title) {
        return next(new AppError('Titre requis pour les conversations de groupe', 400));
      }
      conversation = await Conversation.createGroupConversation(
        title, 
        req.user.id, 
        participantIds || []
      );
      break;

    case 'order':
      if (!orderId) {
        return next(new AppError('ID de commande requis', 400));
      }
      const Order = require('../models/Order');
      const order = await Order.findById(orderId);
      if (!order) {
        return next(new AppError('Commande non trouvée', 404));
      }
      conversation = await Conversation.createOrderConversation(
        orderId, 
        order.buyer, 
        order.seller
      );
      break;

    default:
      return next(new AppError('Type de conversation invalide', 400));
  }

  // Envoyer un message système de bienvenue
  await Message.createSystemMessage(
    conversation._id,
    'conversation_created',
    type === 'direct' ? 'Conversation démarrée' : `Conversation "${title}" créée`
  );

  res.status(201).json({
    status: 'success',
    data: {
      conversation
    }
  });
});

// Obtenir une conversation
exports.getConversation = catchAsync(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id)
    .populate('participants.user', 'firstName lastName avatar userType')
    .populate('lastMessage', 'content type createdAt sender')
    .populate('lastMessage.sender', 'firstName lastName');

  if (!conversation) {
    return next(new AppError('Conversation non trouvée', 404));
  }

  // Vérifier l'accès
  if (!conversation.canUserAccess(req.user.id)) {
    return next(new AppError('Accès non autorisé à cette conversation', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      conversation
    }
  });
});

// Obtenir les messages d'une conversation
exports.getConversationMessages = catchAsync(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return next(new AppError('Conversation non trouvée', 404));
  }

  if (!conversation.canUserAccess(req.user.id)) {
    return next(new AppError('Accès non autorisé', 403));
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;

  const messages = await Message.getConversationMessages(req.params.id, page, limit);

  // Marquer les messages comme lus
  await Message.markConversationAsRead(req.params.id, req.user.id);
  await conversation.markAsRead(req.user.id);

  res.status(200).json({
    status: 'success',
    results: messages.length,
    page,
    data: {
      messages: messages.reverse() // Ordre chronologique
    }
  });
});

// Envoyer un message
exports.sendMessage = catchAsync(async (req, res, next) => {
  const { content, type, replyToId, attachments } = req.body;

  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return next(new AppError('Conversation non trouvée', 404));
  }

  if (!conversation.canUserAccess(req.user.id)) {
    return next(new AppError('Accès non autorisé', 403));
  }

  // Valider le contenu
  if (!content && (!attachments || attachments.length === 0)) {
    return next(new AppError('Contenu ou pièce jointe requis', 400));
  }

  // Créer le message
  const messageData = {
    conversation: req.params.id,
    sender: req.user.id,
    type: type || 'text',
    content
  };

  if (replyToId) {
    const replyToMessage = await Message.findById(replyToId);
    if (replyToMessage && replyToMessage.conversation.toString() === req.params.id) {
      messageData.replyTo = replyToId;
    }
  }

  if (req.body.attachments && req.body.attachments.length > 0) {
    messageData.attachments = req.body.attachments;
  }

  const message = await Message.create(messageData);

  // Populer pour la réponse
  await message.populate('sender', 'firstName lastName avatar userType');
  if (message.replyTo) {
    await message.populate('replyTo', 'content sender');
  }

  // Notifier les autres participants
  const otherParticipants = conversation.participants.filter(
    p => p.user.toString() !== req.user.id && p.isActive
  );

  for (const participant of otherParticipants) {
    // Incrémenter le compteur de messages non lus
    await conversation.incrementUnreadCount(participant.user);

    // Envoyer notification si activée
    if (participant.notifications.enabled) {
      await Notification.createNotification({
        recipient: participant.user,
        sender: req.user.id,
        type: 'message_received',
        category: 'message',
        title: `Message de ${req.user.firstName}`,
        message: content ? content.substring(0, 100) : 'Pièce jointe envoyée',
        data: {
          conversationId: conversation._id,
          messageId: message._id
        },
        actions: [{
          type: 'view',
          label: 'Répondre',
          url: `/messages/${conversation._id}`
        }],
        channels: {
          inApp: { enabled: true },
          push: { enabled: participant.notifications.push },
          email: { enabled: participant.notifications.email }
        }
      });
    }
  }

  // Émettre via Socket.IO (si configuré)
  // req.io?.to(req.params.id).emit('new_message', message);

  res.status(201).json({
    status: 'success',
    data: {
      message
    }
  });
});

// Marquer une conversation comme lue
exports.markConversationAsRead = catchAsync(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return next(new AppError('Conversation non trouvée', 404));
  }

  if (!conversation.canUserAccess(req.user.id)) {
    return next(new AppError('Accès non autorisé', 403));
  }

  await Message.markConversationAsRead(req.params.id, req.user.id);
  await conversation.markAsRead(req.user.id);

  res.status(200).json({
    status: 'success',
    message: 'Conversation marquée comme lue'
  });
});

// Modifier un message
exports.editMessage = catchAsync(async (req, res, next) => {
  const { content } = req.body;

  if (!content) {
    return next(new AppError('Nouveau contenu requis', 400));
  }

  const message = await Message.findById(req.params.messageId);

  if (!message) {
    return next(new AppError('Message non trouvé', 404));
  }

  try {
    await message.editContent(content, req.user.id);
  } catch (error) {
    return next(new AppError(error.message, 400));
  }

  res.status(200).json({
    status: 'success',
    data: {
      message
    }
  });
});

// Supprimer un message
exports.deleteMessage = catchAsync(async (req, res, next) => {
  const message = await Message.findById(req.params.messageId);

  if (!message) {
    return next(new AppError('Message non trouvé', 404));
  }

  const isAdmin = req.user.role === 'admin';

  try {
    await message.delete(req.user.id, isAdmin);
  } catch (error) {
    return next(new AppError(error.message, 400));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Ajouter une réaction à un message
exports.addReaction = catchAsync(async (req, res, next) => {
  const { emoji } = req.body;

  if (!emoji) {
    return next(new AppError('Emoji requis', 400));
  }

  const message = await Message.findById(req.params.messageId);

  if (!message) {
    return next(new AppError('Message non trouvé', 404));
  }

  await message.addReaction(req.user.id, emoji);

  res.status(200).json({
    status: 'success',
    data: {
      reactions: message.uniqueReactions
    }
  });
});

// Supprimer une réaction
exports.removeReaction = catchAsync(async (req, res, next) => {
  const { emoji } = req.body;

  const message = await Message.findById(req.params.messageId);

  if (!message) {
    return next(new AppError('Message non trouvé', 404));
  }

  await message.removeReaction(req.user.id, emoji);

  res.status(200).json({
    status: 'success',
    data: {
      reactions: message.uniqueReactions
    }
  });
});

// Épingler un message
exports.pinMessage = catchAsync(async (req, res, next) => {
  const message = await Message.findById(req.params.messageId);

  if (!message) {
    return next(new AppError('Message non trouvé', 404));
  }

  // Vérifier les permissions
  const conversation = await Conversation.findById(message.conversation);
  if (!conversation.canUserModerate(req.user.id)) {
    return next(new AppError('Vous n\'avez pas les droits pour épingler des messages', 403));
  }

  await message.pin(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      message
    }
  });
});

// Désépingler un message
exports.unpinMessage = catchAsync(async (req, res, next) => {
  const message = await Message.findById(req.params.messageId);

  if (!message) {
    return next(new AppError('Message non trouvé', 404));
  }

  const conversation = await Conversation.findById(message.conversation);
  if (!conversation.canUserModerate(req.user.id)) {
    return next(new AppError('Vous n\'avez pas les droits pour désépingler des messages', 403));
  }

  await message.unpin();

  res.status(200).json({
    status: 'success',
    data: {
      message
    }
  });
});

// Signaler un message
exports.reportMessage = catchAsync(async (req, res, next) => {
  const { reason, description } = req.body;

  if (!reason) {
    return next(new AppError('Raison du signalement requise', 400));
  }

  const message = await Message.findById(req.params.messageId);

  if (!message) {
    return next(new AppError('Message non trouvé', 404));
  }

  await message.report(req.user.id, reason, description);

  res.status(200).json({
    status: 'success',
    message: 'Message signalé avec succès'
  });
});

// Rechercher dans les messages
exports.searchMessages = catchAsync(async (req, res, next) => {
  const { q, conversationId } = req.query;

  if (!q) {
    return next(new AppError('Terme de recherche requis', 400));
  }

  let searchOptions = {
    limit: parseInt(req.query.limit, 10) || 20
  };

  // Filtres optionnels
  if (req.query.sender) searchOptions.sender = req.query.sender;
  if (req.query.type) searchOptions.type = req.query.type;
  if (req.query.dateFrom) searchOptions.dateFrom = req.query.dateFrom;
  if (req.query.dateTo) searchOptions.dateTo = req.query.dateTo;

  let messages;

  if (conversationId) {
    // Recherche dans une conversation spécifique
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.canUserAccess(req.user.id)) {
      return next(new AppError('Conversation non trouvée ou accès non autorisé', 404));
    }
    
    messages = await Message.searchMessages(conversationId, q, searchOptions);
  } else {
    // Recherche globale dans toutes les conversations de l'utilisateur
    const userConversations = await Conversation.find({
      'participants.user': req.user.id,
      'participants.isActive': true
    }).select('_id');

    const conversationIds = userConversations.map(c => c._id);

    messages = await Message.find({
      conversation: { $in: conversationIds },
      isDeleted: false,
      $text: { $search: q }
    })
    .populate('sender', 'firstName lastName avatar')
    .populate('conversation', 'title type')
    .sort({ score: { $meta: 'textScore' } })
    .limit(searchOptions.limit);
  }

  res.status(200).json({
    status: 'success',
    results: messages.length,
    data: {
      messages
    }
  });
});

// GESTION DES CONVERSATIONS

// Ajouter un participant à une conversation
exports.addParticipant = catchAsync(async (req, res, next) => {
  const { userId, role } = req.body;

  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return next(new AppError('Conversation non trouvée', 404));
  }

  if (!conversation.canUserModerate(req.user.id)) {
    return next(new AppError('Vous n\'avez pas les droits pour ajouter des participants', 403));
  }

  if (conversation.type === 'direct') {
    return next(new AppError('Impossible d\'ajouter des participants à une conversation directe', 400));
  }

  await conversation.addParticipant(userId, role || 'member', req.user.id);

  // Message système
  const User = require('../models/User');
  const newUser = await User.findById(userId).select('firstName lastName');
  
  await Message.createSystemMessage(
    conversation._id,
    'user_joined',
    `${newUser.firstName} ${newUser.lastName} a rejoint la conversation`
  );

  res.status(200).json({
    status: 'success',
    message: 'Participant ajouté avec succès'
  });
});

// Supprimer un participant
exports.removeParticipant = catchAsync(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return next(new AppError('Conversation non trouvée', 404));
  }

  if (!conversation.canUserModerate(req.user.id)) {
    return next(new AppError('Vous n\'avez pas les droits pour supprimer des participants', 403));
  }

  await conversation.removeParticipant(req.params.userId, req.user.id);

  // Message système
  const User = require('../models/User');
  const removedUser = await User.findById(req.params.userId).select('firstName lastName');
  
  await Message.createSystemMessage(
    conversation._id,
    'user_left',
    `${removedUser.firstName} ${removedUser.lastName} a quitté la conversation`
  );

  res.status(200).json({
    status: 'success',
    message: 'Participant supprimé avec succès'
  });
});

// Quitter une conversation
exports.leaveConversation = catchAsync(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return next(new AppError('Conversation non trouvée', 404));
  }

  if (conversation.type === 'direct') {
    return next(new AppError('Impossible de quitter une conversation directe', 400));
  }

  await conversation.removeParticipant(req.user.id, req.user.id);

  res.status(200).json({
    status: 'success',
    message: 'Vous avez quitté la conversation'
  });
});

// Archiver une conversation
exports.archiveConversation = catchAsync(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return next(new AppError('Conversation non trouvée', 404));
  }

  if (!conversation.canUserAccess(req.user.id)) {
    return next(new AppError('Accès non autorisé', 403));
  }

  await conversation.archive(req.user.id);

  res.status(200).json({
    status: 'success',
    message: 'Conversation archivée'
  });
});

// Désarchiver une conversation
exports.unarchiveConversation = catchAsync(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return next(new AppError('Conversation non trouvée', 404));
  }

  if (!conversation.canUserAccess(req.user.id)) {
    return next(new AppError('Accès non autorisé', 403));
  }

  await conversation.unarchive();

  res.status(200).json({
    status: 'success',
    message: 'Conversation désarchivée'
  });
});

// FONCTIONS SPÉCIALISÉES

// Partager un produit dans une conversation
exports.shareProduct = catchAsync(async (req, res, next) => {
  const { productId, message } = req.body;

  const conversation = await Conversation.findById(req.params.id);
  if (!conversation || !conversation.canUserAccess(req.user.id)) {
    return next(new AppError('Conversation non trouvée ou accès non autorisé', 404));
  }

  const Product = require('../models/Product');
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  const sharedMessage = await Message.createProductShare(
    req.params.id,
    req.user.id,
    productId,
    message
  );

  await sharedMessage.populate('sender', 'firstName lastName avatar');
  await sharedMessage.populate('attachments.product', 'name images price');

  res.status(201).json({
    status: 'success',
    data: {
      message: sharedMessage
    }
  });
});

// Envoyer un devis dans une conversation
exports.sendQuote = catchAsync(async (req, res, next) => {
  const { products, total, currency, validUntil, terms } = req.body;

  const conversation = await Conversation.findById(req.params.id);
  if (!conversation || !conversation.canUserAccess(req.user.id)) {
    return next(new AppError('Conversation non trouvée ou accès non autorisé', 404));
  }

  const quoteData = {
    products,
    total,
    currency: currency || 'XAF',
    validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    terms
  };

  const quoteMessage = await Message.createQuote(
    req.params.id,
    req.user.id,
    quoteData
  );

  await quoteMessage.populate('sender', 'firstName lastName avatar');

  res.status(201).json({
    status: 'success',
    data: {
      message: quoteMessage
    }
  });
});

// Obtenir les statistiques de messagerie
exports.getMessagingStats = catchAsync(async (req, res, next) => {
  const { period = '30d' } = req.query;
  const periodDays = parseInt(period.replace('d', ''));
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  // Mes statistiques de messagerie
  const myStats = await Message.aggregate([
    { 
      $match: { 
        sender: req.user.id,
        createdAt: { $gte: startDate }
      } 
    },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        messagesByType: {
          $push: '$type'
        }
      }
    }
  ]);

  // Conversations actives
  const activeConversations = await Conversation.countDocuments({
    'participants.user': req.user.id,
    'participants.isActive': true,
    status: 'active',
    lastActivity: { $gte: startDate }
  });

  // Messages reçus
  const receivedMessages = await Message.countDocuments({
    conversation: {
      $in: await Conversation.find({
        'participants.user': req.user.id,
        'participants.isActive': true
      }).distinct('_id')
    },
    sender: { $ne: req.user.id },
    createdAt: { $gte: startDate }
  });

  res.status(200).json({
    status: 'success',
    data: {
      messagesSent: myStats[0]?.totalMessages || 0,
      messagesReceived: receivedMessages,
      activeConversations,
      period
    }
  });
});

// ROUTES ADMIN

// Obtenir toutes les conversations (admin)
exports.getAllConversations = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const queryObj = {};
  if (req.query.type) queryObj.type = req.query.type;
  if (req.query.status) queryObj.status = req.query.status;

  const conversations = await Conversation.find(queryObj)
    .populate('participants.user', 'firstName lastName email userType')
    .populate('createdBy', 'firstName lastName userType')
    .sort('-lastActivity')
    .skip(skip)
    .limit(limit);

  const total = await Conversation.countDocuments(queryObj);

  res.status(200).json({
    status: 'success',
    results: conversations.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      conversations
    }
  });
});

// Statistiques globales de messagerie (admin)
exports.getGlobalMessagingStats = catchAsync(async (req, res, next) => {
  const { period = '30d' } = req.query;
  const periodDays = parseInt(period.replace('d', ''));
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  // Statistiques générales
  const generalStats = await Message.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        uniqueSenders: { $addToSet: '$sender' },
        messagesByType: {
          $push: '$type'
        }
      }
    },
    {
      $addFields: {
        uniqueSendersCount: { $size: '$uniqueSenders' }
      }
    }
  ]);

  // Évolution dans le temps
  const timeline = await Message.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        messageCount: { $sum: 1 },
        uniqueUsers: { $addToSet: '$sender' }
      }
    },
    {
      $addFields: {
        activeUsers: { $size: '$uniqueUsers' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Top utilisateurs actifs
  const topUsers = await Message.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$sender',
        messageCount: { $sum: 1 }
      }
    },
    { $sort: { messageCount: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      overview: generalStats[0] || {},
      timeline,
      topUsers,
      period
    }
  });
});

// Nettoyer les conversations inactives
exports.cleanupInactiveConversations = catchAsync(async (req, res, next) => {
  const { daysInactive = 90 } = req.body;

  const result = await Conversation.cleanupInactiveConversations(daysInactive);

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} conversation(s) archivée(s)`,
    data: {
      archivedCount: result.modifiedCount
    }
  });
});

module.exports = exports;
