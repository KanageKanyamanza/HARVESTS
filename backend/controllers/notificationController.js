const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Fonction utilitaire pour construire une URL complète du frontend
function buildFrontendUrl(path) {
  const frontendUrl = process.env.FRONTEND_URL || 'https://harvests-khaki.vercel.app';
  // Supprimer le slash final de l'URL du frontend si présent
  const baseUrl = frontendUrl.replace(/\/$/, '');
  // S'assurer que le chemin commence par un slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

// ROUTES PROTÉGÉES UTILISATEUR

// Obtenir mes notifications
exports.getMyNotifications = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const queryObj = { recipient: req.user.id };

  // Filtres
  if (req.query.category) queryObj.category = req.query.category;
  if (req.query.type) queryObj.type = req.query.type;
  if (req.query.priority) queryObj.priority = req.query.priority;
  
  // Filtrer par statut de lecture
  if (req.query.unread === 'true') {
    queryObj.readAt = { $exists: false };
  } else if (req.query.read === 'true') {
    queryObj.readAt = { $exists: true };
  }

  const notifications = await Notification.find(queryObj)
    .populate({
      path: 'recipient',
      select: 'firstName lastName email userType role',
      options: { strictPopulate: false }
    })
    .populate({
      path: 'sender',
      select: 'firstName lastName avatar userType',
      options: { strictPopulate: false }
    })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments(queryObj);
  const unreadCount = await Notification.getUnreadCount(req.user.id);

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    total,
    unreadCount,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      notifications
    }
  });
});

// Obtenir le nombre de notifications non lues
exports.getUnreadCount = catchAsync(async (req, res, next) => {
  // Gérer à la fois les utilisateurs normaux et les admins
  const recipientId = req.admin ? req.admin._id : req.user.id;
  const unreadCount = await Notification.getUnreadCount(recipientId);

  // Compter par catégorie
  const unreadByCategory = await Notification.aggregate([
    {
      $match: {
        recipient: recipientId,
        readAt: { $exists: false },
        status: { $in: ['pending', 'sent', 'delivered'] }
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      total: unreadCount,
      byCategory: unreadByCategory
    }
  });
});

// Obtenir les notifications par catégorie
exports.getNotificationsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const limit = parseInt(req.query.limit, 10) || 20;

  const notifications = await Notification.getByCategory(req.user.id, category, limit);

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    data: {
      notifications
    }
  });
});

// Marquer une notification comme lue
exports.markAsRead = catchAsync(async (req, res, next) => {
  // Gérer à la fois les utilisateurs normaux et les admins
  const recipientId = req.admin ? req.admin._id : req.user.id;
  
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: recipientId
  });

  if (!notification) {
    return next(new AppError('Notification non trouvée', 404));
  }

  await notification.markAsRead();

  res.status(200).json({
    status: 'success',
    data: {
      notification
    }
  });
});

// Marquer toutes les notifications comme lues
exports.markAllAsRead = catchAsync(async (req, res, next) => {
  const { category } = req.query;
  
  // Gérer à la fois les utilisateurs normaux et les admins
  const recipientId = req.admin ? req.admin._id : req.user.id;

  const result = await Notification.markAllAsRead(recipientId, category);

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} notification(s) marquée(s) comme lue(s)`,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

// Marquer une notification comme cliquée
exports.markAsClicked = catchAsync(async (req, res, next) => {
  const { actionType } = req.body;

  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user.id
  });

  if (!notification) {
    return next(new AppError('Notification non trouvée', 404));
  }

  await notification.markAsClicked(actionType);

  res.status(200).json({
    status: 'success',
    data: {
      notification
    }
  });
});

// Rejeter/masquer une notification
exports.dismissNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user.id
  });

  if (!notification) {
    return next(new AppError('Notification non trouvée', 404));
  }

  await notification.dismiss();

  res.status(200).json({
    status: 'success',
    message: 'Notification masquée'
  });
});

// Supprimer une notification
exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user.id
  });

  if (!notification) {
    return next(new AppError('Notification non trouvée', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Obtenir les préférences de notification
exports.getNotificationPreferences = catchAsync(async (req, res, next) => {
  const User = require('../models/User');
  const user = await User.findById(req.user.id).select('notifications');

  res.status(200).json({
    status: 'success',
    data: {
      preferences: user.notifications
    }
  });
});

// Mettre à jour les préférences de notification
exports.updateNotificationPreferences = catchAsync(async (req, res, next) => {
  const User = require('../models/User');
  
  const allowedFields = ['email', 'sms', 'push'];
  const filteredPrefs = {};
  
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredPrefs[`notifications.${key}`] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    filteredPrefs,
    { new: true, runValidators: true }
  ).select('notifications');

  res.status(200).json({
    status: 'success',
    data: {
      preferences: user.notifications
    }
  });
});

// ROUTES ADMIN

// Créer une notification système (admin)
exports.createSystemNotification = catchAsync(async (req, res, next) => {
  const { 
    recipients, 
    type, 
    title, 
    message, 
    channels, 
    scheduledFor,
    expiresAt 
  } = req.body;

  if (!recipients || recipients.length === 0) {
    return next(new AppError('Au moins un destinataire requis', 400));
  }

  const notifications = [];

  // Créer une notification pour chaque destinataire
  for (const recipientId of recipients) {
    const notification = await Notification.createNotification({
      recipient: recipientId,
      sender: req.user.id,
      type: type || 'announcement',
      category: 'system',
      title,
      message,
      channels: channels || {
        inApp: { enabled: true },
        email: { enabled: true },
        push: { enabled: true }
      },
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    notifications.push(notification);
  }

  res.status(201).json({
    status: 'success',
    message: `${notifications.length} notification(s) créée(s)`,
    data: {
      notifications: notifications.slice(0, 5) // Retourner seulement les 5 premières
    }
  });
});

// Obtenir toutes les notifications (admin)
exports.getAllNotifications = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const queryObj = {};
  
  // Si c'est un admin, filtrer par ses notifications uniquement
  if (req.admin) {
    queryObj.recipient = req.admin._id;
  } else if (req.query.recipient) {
    queryObj.recipient = req.query.recipient;
  }
  
  if (req.query.type) queryObj.type = req.query.type;
  if (req.query.category) queryObj.category = req.query.category;
  if (req.query.status) queryObj.status = req.query.status;

  // Populate le recipient selon son modèle (User ou Admin)
  const notifications = await Notification.find(queryObj)
    .populate({
      path: 'recipient',
      select: 'firstName lastName email userType role',
      options: { strictPopulate: false }
    })
    .populate({
      path: 'sender',
      select: 'firstName lastName userType',
      options: { strictPopulate: false }
    })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments(queryObj);
  
  // Calculer le nombre de notifications non lues pour l'admin
  const unreadCount = await Notification.countDocuments({
    ...queryObj,
    readAt: { $exists: false },
    status: { $in: ['pending', 'sent', 'delivered'] }
  });

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    total,
    unreadCount,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      notifications
    }
  });
});

// Statistiques des notifications (admin)
exports.getNotificationStats = catchAsync(async (req, res, next) => {
  const { period = '30d' } = req.query;
  const periodDays = parseInt(period.replace('d', ''));
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  // Statistiques par type
  const typeStats = await Notification.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        readRate: {
          $avg: { $cond: [{ $exists: ['$readAt', true] }, 1, 0] }
        },
        clickRate: {
          $avg: { $cond: [{ $exists: ['$clickedAt', true] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Statistiques par canal
  const channelStats = await Notification.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalNotifications: { $sum: 1 },
        emailSent: {
          $sum: { $cond: [{ $eq: ['$channels.email.sent', true] }, 1, 0] }
        },
        smsSent: {
          $sum: { $cond: [{ $eq: ['$channels.sms.sent', true] }, 1, 0] }
        },
        pushSent: {
          $sum: { $cond: [{ $eq: ['$channels.push.sent', true] }, 1, 0] }
        },
        emailDelivered: {
          $sum: { $cond: [{ $exists: ['$channels.email.deliveredAt', true] }, 1, 0] }
        },
        emailOpened: {
          $sum: { $cond: [{ $exists: ['$channels.email.openedAt', true] }, 1, 0] }
        }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      typeStats,
      channelStats: channelStats[0] || {},
      period
    }
  });
});

// Renvoyer une notification échouée
exports.retryFailedNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError('Notification non trouvée', 404));
  }

  if (notification.status !== 'failed') {
    return next(new AppError('Seules les notifications échouées peuvent être renvoyées', 400));
  }

  // Réinitialiser les statuts d'envoi
  notification.status = 'pending';
  notification.channels.email.sent = false;
  notification.channels.sms.sent = false;
  notification.channels.push.sent = false;
  notification.channels.email.failureReason = undefined;
  notification.channels.sms.failureReason = undefined;
  notification.channels.push.failureReason = undefined;

  await notification.save();

  // Renvoyer
  const results = await notification.sendToAllChannels();

  res.status(200).json({
    status: 'success',
    message: 'Notification renvoyée',
    data: {
      results
    }
  });
});

// Nettoyer les notifications expirées
exports.cleanupExpiredNotifications = catchAsync(async (req, res, next) => {
  const result = await Notification.cleanupExpired();

  res.status(200).json({
    status: 'success',
    message: `${result.deletedCount} notification(s) expirée(s) supprimée(s)`,
    data: {
      deletedCount: result.deletedCount
    }
  });
});

// Traiter les notifications planifiées
exports.processScheduledNotifications = catchAsync(async (req, res, next) => {
  const scheduledNotifications = await Notification.getScheduledNotifications();

  const results = [];

  for (const notification of scheduledNotifications) {
    try {
      const sendResults = await notification.sendToAllChannels();
      results.push({
        notificationId: notification._id,
        success: true,
        results: sendResults
      });
    } catch (error) {
      results.push({
        notificationId: notification._id,
        success: false,
        error: error.message
      });
    }
  }

  res.status(200).json({
    status: 'success',
    message: `${results.length} notification(s) planifiée(s) traitée(s)`,
    data: {
      results
    }
  });
});

// Envoyer une notification de test
exports.sendTestNotification = catchAsync(async (req, res, next) => {
  const { recipient, channels } = req.body;

  const testNotification = await Notification.createNotification({
    recipient: recipient || req.user.id,
    sender: req.user.id,
    type: 'custom',
    category: 'system',
    title: 'Notification de test',
    message: 'Ceci est une notification de test envoyée depuis l\'administration.',
    channels: channels || {
      inApp: { enabled: true },
      email: { enabled: true }
    },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expire dans 24h
  });

  res.status(201).json({
    status: 'success',
    data: {
      notification: testNotification
    }
  });
});

// FONCTIONS UTILITAIRES POUR CRÉER DES NOTIFICATIONS SPÉCIFIQUES

// Notification de stock faible
exports.notifyLowStock = catchAsync(async (req, res, next) => {
  const { productId, currentStock, threshold } = req.body;

  const Product = require('../models/Product');
  const product = await Product.findById(productId).populate('producer');

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  await Notification.createNotification({
    recipient: product.producer._id,
    type: 'product_low_stock',
    category: 'product',
    priority: 'high',
    title: 'Stock faible',
    message: `Le stock de "${product.name}" est faible (${currentStock} restant, seuil: ${threshold})`,
    data: {
      productId: product._id,
      productName: product.name,
      currentStock,
      threshold
    },
    actions: [{
      type: 'view',
      label: 'Gérer le stock',
      url: `/products/${product._id}/stock`
    }],
    channels: {
      inApp: { enabled: true },
      email: { enabled: true },
      push: { enabled: true }
    }
  });

  res.status(201).json({
    status: 'success',
    message: 'Notification de stock faible envoyée'
  });
});

// Notification de produit de nouveau disponible
exports.notifyBackInStock = catchAsync(async (req, res, next) => {
  const { productId } = req.body;

  const Product = require('../models/Product');
  const Consumer = require('../models/Consumer');

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  // Trouver tous les consommateurs qui ont ce produit dans leur wishlist
  const consumers = await Consumer.find({
    'wishlist.product': productId,
    'wishlist.notifyWhenAvailable': true
  });

  const notifications = [];

  for (const consumer of consumers) {
    const notification = await Notification.createNotification({
      recipient: consumer._id,
      type: 'wishlist_item_available',
      category: 'product',
      title: 'Produit de nouveau disponible',
      message: `"${product.name}" de votre liste de souhaits est de nouveau en stock !`,
      data: {
        productId: product._id,
        productName: product.name
      },
      actions: [{
        type: 'view',
        label: 'Voir le produit',
        url: `/products/${product.slug}`
      }],
      channels: {
        inApp: { enabled: true },
        email: { enabled: true },
        push: { enabled: true }
      }
    });

    notifications.push(notification);
  }

  res.status(201).json({
    status: 'success',
    message: `${notifications.length} notification(s) envoyée(s)`,
    data: {
      notificationsSent: notifications.length
    }
  });
});

// Notification de promotion/réduction
exports.notifyPromotion = catchAsync(async (req, res, next) => {
  const { 
    title, 
    message, 
    targetUsers, 
    productIds, 
    discountCode,
    validUntil 
  } = req.body;

  let recipients = [];

  // Déterminer les destinataires
  if (targetUsers === 'all') {
    const User = require('../models/User');
    const users = await User.find({ 
      isActive: true, 
      isEmailVerified: true,
      userType: { $in: ['consumer', 'restaurateur'] }
    }).select('_id');
    recipients = users.map(u => u._id);
  } else if (Array.isArray(targetUsers)) {
    recipients = targetUsers;
  }

  const notifications = [];

  for (const recipientId of recipients) {
    const notification = await Notification.createNotification({
      recipient: recipientId,
      sender: req.user.id,
      type: 'promotion_started',
      category: 'marketing',
      title,
      message,
      data: {
        discountCode,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        productIds
      },
      actions: [{
        type: 'view',
        label: 'Voir l\'offre',
        url: buildFrontendUrl(`/promotions/${discountCode}`)
      }],
      channels: {
        inApp: { enabled: true },
        email: { enabled: true },
        push: { enabled: true }
      },
      expiresAt: validUntil ? new Date(validUntil) : undefined
    });

    notifications.push(notification);
  }

  res.status(201).json({
    status: 'success',
    message: `Promotion envoyée à ${notifications.length} utilisateur(s)`,
    data: {
      notificationsSent: notifications.length
    }
  });
});

// Obtenir les statistiques de performance des notifications
exports.getPerformanceStats = catchAsync(async (req, res, next) => {
  const { period = '30d' } = req.query;
  const periodDays = parseInt(period.replace('d', ''));
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  // Taux de lecture par type
  const readRateStats = await Notification.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$type',
        total: { $sum: 1 },
        read: { $sum: { $cond: [{ $exists: ['$readAt', true] }, 1, 0] } },
        clicked: { $sum: { $cond: [{ $exists: ['$clickedAt', true] }, 1, 0] } }
      }
    },
    {
      $addFields: {
        readRate: { $multiply: [{ $divide: ['$read', '$total'] }, 100] },
        clickRate: { $multiply: [{ $divide: ['$clicked', '$total'] }, 100] }
      }
    },
    { $sort: { total: -1 } }
  ]);

  // Performance par canal
  const channelPerformance = await Notification.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        emailSent: { $sum: { $cond: ['$channels.email.sent', 1, 0] } },
        emailDelivered: { $sum: { $cond: [{ $exists: ['$channels.email.deliveredAt', true] }, 1, 0] } },
        emailOpened: { $sum: { $cond: [{ $exists: ['$channels.email.openedAt', true] }, 1, 0] } },
        smsSent: { $sum: { $cond: ['$channels.sms.sent', 1, 0] } },
        smsDelivered: { $sum: { $cond: [{ $exists: ['$channels.sms.deliveredAt', true] }, 1, 0] } },
        pushSent: { $sum: { $cond: ['$channels.push.sent', 1, 0] } },
        pushDelivered: { $sum: { $cond: [{ $exists: ['$channels.push.deliveredAt', true] }, 1, 0] } }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      readRateByType: readRateStats,
      channelPerformance: channelPerformance[0] || {},
      period
    }
  });
});

// Webhook pour les événements de notification (ex: SendGrid, Twilio)
exports.handleNotificationWebhook = catchAsync(async (req, res, next) => {
  const { provider, event, data } = req.body;

  // Traiter selon le fournisseur
  switch (provider) {
    case 'sendgrid':
      await handleSendGridWebhook(event, data);
      break;
    case 'twilio':
      await handleTwilioWebhook(event, data);
      break;
    case 'firebase':
      await handleFirebaseWebhook(event, data);
      break;
    default:
      return next(new AppError('Fournisseur de webhook non supporté', 400));
  }

  res.status(200).json({
    status: 'success',
    message: 'Webhook traité avec succès'
  });
});

// Fonctions de traitement des webhooks
async function handleSendGridWebhook(event, data) {
  // Traiter les événements SendGrid (delivered, opened, clicked, etc.)
  const notification = await Notification.findOne({
    'data.customData.messageId': data.sg_message_id
  });

  if (notification) {
    switch (event) {
      case 'delivered':
        notification.channels.email.deliveredAt = new Date(data.timestamp * 1000);
        break;
      case 'open':
        notification.channels.email.openedAt = new Date(data.timestamp * 1000);
        break;
      case 'click':
        notification.channels.email.clickedAt = new Date(data.timestamp * 1000);
        break;
    }
    await notification.save();
  }
}

async function handleTwilioWebhook(event, data) {
  // Traiter les événements Twilio SMS
  // Implémentation similaire
}

async function handleFirebaseWebhook(event, data) {
  // Traiter les événements Firebase Push
  // Implémentation similaire
}

// ===== FONCTIONS DE NOTIFICATIONS AUTOMATIQUES POUR ADMINS =====

// Notifier les admins d'un nouveau produit en attente d'approbation
exports.notifyProductPendingApproval = catchAsync(async (productId, productName, producerName) => {
  const Admin = require('../models/Admin');
  
  // Récupérer tous les admins actifs
  const admins = await Admin.find({ isActive: true }).select('_id');
  
  const notifications = [];
  
  for (const admin of admins) {
    const notification = await Notification.createNotification({
      recipient: admin._id,
      recipientModel: 'Admin', // Spécifier que c'est un Admin
      type: 'product_pending_approval',
      category: 'product',
      priority: 'high',
      title: 'Nouveau produit en attente d\'approbation',
      message: `Le produit "${productName}" de ${producerName} est en attente d'approbation`,
      data: {
        productId,
        productName,
        producerName,
        action: 'approve_product'
      },
      actions: [{
        type: 'view',
        label: 'Voir le produit',
        url: `/admin/products/${productId}`
      }],
      channels: {
        inApp: { enabled: true },
        email: { enabled: true },
        push: { enabled: true }
      }
    });
    
    notifications.push(notification);
  }
  
  return notifications;
});

// Notifier les admins d'un utilisateur signalé
exports.notifyUserReported = catchAsync(async (userId, userName, reportReason, reporterName) => {
  const Admin = require('../models/Admin');
  
  const admins = await Admin.find({ isActive: true }).select('_id');
  
  const notifications = [];
  
  for (const admin of admins) {
    const notification = await Notification.createNotification({
      recipient: admin._id,
      recipientModel: 'Admin', // Spécifier que c'est un Admin
      type: 'user_reported',
      category: 'account',
      priority: 'high',
      title: 'Utilisateur signalé',
      message: `L'utilisateur ${userName} a été signalé par ${reporterName}. Raison: ${reportReason}`,
      data: {
        userId,
        userName,
        reportReason,
        reporterName,
        action: 'review_user'
      },
      actions: [{
        type: 'view',
        label: 'Examiner l\'utilisateur',
        url: `/admin/users/${userId}`
      }],
      channels: {
        inApp: { enabled: true },
        email: { enabled: true },
        push: { enabled: true }
      }
    });
    
    notifications.push(notification);
  }
  
  return notifications;
});

// Notifier les admins d'une commande de forte valeur
exports.notifyHighValueOrder = catchAsync(async (orderId, orderAmount, customerName) => {
  const Admin = require('../models/Admin');
  
  const admins = await Admin.find({ isActive: true }).select('_id');
  
  const notifications = [];
  
  for (const admin of admins) {
    const notification = await Notification.createNotification({
      recipient: admin._id,
      recipientModel: 'Admin', // Spécifier que c'est un Admin
      type: 'high_value_order',
      category: 'order',
      priority: 'medium',
      title: 'Commande de forte valeur',
      message: `Nouvelle commande de ${orderAmount.toLocaleString()} FCFA par ${customerName}`,
      data: {
        orderId,
        orderAmount,
        customerName,
        action: 'review_order'
      },
      actions: [{
        type: 'view',
        label: 'Voir la commande',
        url: buildFrontendUrl(`/admin/orders/${orderId}`)
      }],
      channels: {
        inApp: { enabled: true },
        email: { enabled: true },
        push: { enabled: true }
      }
    });
    
    notifications.push(notification);
  }
  
  return notifications;
});

// Notifier les admins d'un problème de paiement
exports.notifyPaymentIssue = catchAsync(async (paymentId, issue, amount, customerName) => {
  const Admin = require('../models/Admin');
  
  const admins = await Admin.find({ isActive: true }).select('_id');
  
  const notifications = [];
  
  for (const admin of admins) {
    const notification = await Notification.createNotification({
      recipient: admin._id,
      recipientModel: 'Admin', // Spécifier que c'est un Admin
      type: 'payment_issue',
      category: 'payment',
      priority: 'high',
      title: 'Problème de paiement',
      message: `Problème de paiement: ${issue} - ${amount.toLocaleString()} FCFA - ${customerName}`,
      data: {
        paymentId,
        issue,
        amount,
        customerName,
        action: 'resolve_payment'
      },
      actions: [{
        type: 'view',
        label: 'Examiner le paiement',
        url: `/admin/payments/${paymentId}`
      }],
      channels: {
        inApp: { enabled: true },
        email: { enabled: true },
        push: { enabled: true }
      }
    });
    
    notifications.push(notification);
  }
  
  return notifications;
});

// Notifier les admins d'un litige créé
exports.notifyDisputeCreated = catchAsync(async (disputeId, disputeType, customerName, amount) => {
  const Admin = require('../models/Admin');
  
  const admins = await Admin.find({ isActive: true }).select('_id');
  
  const notifications = [];
  
  for (const admin of admins) {
    const notification = await Notification.createNotification({
      recipient: admin._id,
      recipientModel: 'Admin', // Spécifier que c'est un Admin
      type: 'dispute_created',
      category: 'order',
      priority: 'high',
      title: 'Nouveau litige créé',
      message: `Litige ${disputeType} créé par ${customerName} - ${amount?.toLocaleString()} FCFA`,
      data: {
        disputeId,
        disputeType,
        customerName,
        amount,
        action: 'resolve_dispute'
      },
      actions: [{
        type: 'view',
        label: 'Examiner le litige',
        url: `/admin/disputes/${disputeId}`
      }],
      channels: {
        inApp: { enabled: true },
        email: { enabled: true },
        push: { enabled: true }
      }
    });
    
    notifications.push(notification);
  }
  
  return notifications;
});

// Notifier les admins d'une alerte de sécurité
exports.notifySecurityAlert = catchAsync(async (alertType, description, severity = 'medium') => {
  const Admin = require('../models/Admin');
  
  const admins = await Admin.find({ isActive: true }).select('_id');
  
  const notifications = [];
  
  for (const admin of admins) {
    const notification = await Notification.createNotification({
      recipient: admin._id,
      recipientModel: 'Admin', // Spécifier que c'est un Admin
      type: 'security_alert',
      category: 'system',
      priority: severity,
      title: 'Alerte de sécurité',
      message: `${alertType}: ${description}`,
      data: {
        alertType,
        description,
        severity,
        action: 'investigate_security'
      },
      actions: [{
        type: 'view',
        label: 'Examiner l\'alerte',
        url: `/admin/security/alerts`
      }],
      channels: {
        inApp: { enabled: true },
        email: { enabled: true },
        push: { enabled: true }
      }
    });
    
    notifications.push(notification);
  }
  
  return notifications;
});

module.exports = exports;
