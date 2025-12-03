const Notification = require('../../models/Notification');
const Product = require('../../models/Product');
const Consumer = require('../../models/Consumer');
const Admin = require('../../models/Admin');
const User = require('../../models/User');

/**
 * Service pour les notifications système automatiques
 */

function buildFrontendUrl(path) {
  const frontendUrl = process.env.FRONTEND_URL || 'https://www.harvests.site';
  const baseUrl = frontendUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Notifier les admins d'un nouveau produit en attente d'approbation
 */
async function notifyProductPendingApproval(productId, productName, producerName) {
  const admins = await Admin.find({ isActive: true }).select('_id');
  
  const notifications = [];
  
  for (const admin of admins) {
    const notification = await Notification.createNotification({
      recipient: admin._id,
      recipientModel: 'Admin',
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
}

/**
 * Notifier les admins d'un utilisateur signalé
 */
async function notifyUserReported(userId, userName, reportReason, reporterName) {
  const admins = await Admin.find({ isActive: true }).select('_id');
  
  const notifications = [];
  
  for (const admin of admins) {
    const notification = await Notification.createNotification({
      recipient: admin._id,
      recipientModel: 'Admin',
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
}

/**
 * Notifier les admins d'une commande de forte valeur
 */
async function notifyHighValueOrder(orderId, orderAmount, customerName) {
  const admins = await Admin.find({ isActive: true }).select('_id');
  
  const notifications = [];
  
  for (const admin of admins) {
    const notification = await Notification.createNotification({
      recipient: admin._id,
      recipientModel: 'Admin',
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
}

/**
 * Notifier les admins d'un problème de paiement
 */
async function notifyPaymentIssue(paymentId, issue, amount, customerName) {
  const admins = await Admin.find({ isActive: true }).select('_id');
  
  const notifications = [];
  
  for (const admin of admins) {
    const notification = await Notification.createNotification({
      recipient: admin._id,
      recipientModel: 'Admin',
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
}

/**
 * Notifier les admins d'un litige créé
 */
async function notifyDisputeCreated(disputeId, disputeType, customerName, amount) {
  const admins = await Admin.find({ isActive: true }).select('_id');
  
  const notifications = [];
  
  for (const admin of admins) {
    const notification = await Notification.createNotification({
      recipient: admin._id,
      recipientModel: 'Admin',
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
}

/**
 * Notifier les admins d'une alerte de sécurité
 */
async function notifySecurityAlert(alertType, description, severity = 'medium') {
  const admins = await Admin.find({ isActive: true }).select('_id');
  
  const notifications = [];
  
  for (const admin of admins) {
    const notification = await Notification.createNotification({
      recipient: admin._id,
      recipientModel: 'Admin',
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
}

/**
 * Notifier un stock faible
 */
async function notifyLowStock(productId, currentStock, threshold) {
  const product = await Product.findById(productId).populate('producer');

  if (!product) {
    throw new Error('Produit non trouvé');
  }

  const notification = await Notification.createNotification({
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

  return notification;
}

/**
 * Notifier que le produit est de nouveau disponible
 */
async function notifyBackInStock(productId) {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Produit non trouvé');
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

  return notifications;
}

/**
 * Notifier une promotion
 */
async function notifyPromotion(adminId, { title, message, targetUsers, productIds, discountCode, validUntil }) {
  let recipients = [];

  // Déterminer les destinataires
  if (targetUsers === 'all') {
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
      sender: adminId,
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

  return notifications;
}

module.exports = {
  notifyProductPendingApproval,
  notifyUserReported,
  notifyHighValueOrder,
  notifyPaymentIssue,
  notifyDisputeCreated,
  notifySecurityAlert,
  notifyLowStock,
  notifyBackInStock,
  notifyPromotion
};

