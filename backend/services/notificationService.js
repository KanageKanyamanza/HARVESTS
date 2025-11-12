const admin = require('firebase-admin');
const webpush = require('web-push');
const cron = require('node-cron');
const { info, error } = require('../config/logger');
const emailService = require('../utils/email');

// Configuration Firebase Admin SDK
if (process.env.FCM_SERVER_KEY) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
  };

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
}

// Configuration Web Push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:admin@harvests.cm',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

class NotificationService {
  
  // 📱 Envoyer notification push FCM (Firebase)
  static async sendFCMNotification(userTokens, notification, data = {}) {
    if (!admin.apps.length) {
      info('Firebase Admin non configuré, notification ignorée');
      return;
    }
    
    try {
      const tokens = Array.isArray(userTokens) ? userTokens : [userTokens];
      
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.image || null
        },
        data: {
          click_action: notification.clickAction || 'FLUTTER_NOTIFICATION_CLICK',
          ...data
        },
        tokens: tokens.filter(token => token && token.length > 0)
      };
      
      if (message.tokens.length === 0) {
        info('Aucun token FCM valide trouvé');
        return;
      }
      
      const response = await admin.messaging().sendMulticast(message);
      
      info(`Notifications FCM envoyées: ${response.successCount}/${tokens.length}`, {
        successCount: response.successCount,
        failureCount: response.failureCount
      });
      
      // Nettoyer les tokens invalides
      if (response.failureCount > 0) {
        await this.cleanInvalidTokens(tokens, response.responses);
      }
      
      return response;
      
    } catch (err) {
      error('Erreur envoi notification FCM:', err);
      throw err;
    }
  }
  
  // 🌐 Envoyer notification push Web
  static async sendWebPushNotification(subscriptions, notification, data = {}) {
    if (!process.env.VAPID_PUBLIC_KEY) {
      info('Web Push non configuré, notification ignorée');
      return;
    }
    
    try {
      const subs = Array.isArray(subscriptions) ? subscriptions : [subscriptions];
      const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/icons/harvests-icon-192.png',
        badge: '/icons/harvests-badge-72.png',
        image: notification.image || null,
        data: {
          url: notification.clickAction || '/',
          ...data
        },
        actions: notification.actions || []
      });
      
      const promises = subs.map(subscription => {
        return webpush.sendNotification(subscription, payload)
          .catch(err => {
            if (err.statusCode === 410) {
              // Subscription expirée, la supprimer
              this.removeExpiredSubscription(subscription);
            }
            error('Erreur envoi Web Push:', err);
          });
      });
      
      const results = await Promise.allSettled(promises);
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      
      info(`Notifications Web Push envoyées: ${successCount}/${subs.length}`);
      
      return { successCount, totalCount: subs.length };
      
    } catch (err) {
      error('Erreur envoi notification Web Push:', err);
      throw err;
    }
  }
  
  // 📧 Envoyer notification par email
  static async sendEmailNotification(user, notification, data = {}) {
    try {
      const emailData = {
        to: user.email,
        subject: notification.title,
        template: notification.emailTemplate || 'notification',
        context: {
          firstName: user.firstName,
          title: notification.title,
          body: notification.body,
          actionUrl: notification.clickAction,
          actionText: notification.actionText || 'Voir détails',
          ...data
        }
      };
      
      await emailService.sendEmail(emailData);
      info(`Email de notification envoyé à ${user.email}`);
      
    } catch (err) {
      error('Erreur envoi email notification:', err);
      throw err;
    }
  }
  
  // 📲 Envoyer notification multi-canal
  static async sendMultiChannelNotification(user, notification, data = {}) {
    const promises = [];
    
    // Vérifier les préférences utilisateur
    if (user.preferences?.notifications?.push && user.fcmTokens?.length > 0) {
      promises.push(this.sendFCMNotification(user.fcmTokens, notification, data));
    }
    
    if (user.preferences?.notifications?.webPush && user.webPushSubscriptions?.length > 0) {
      promises.push(this.sendWebPushNotification(user.webPushSubscriptions, notification, data));
    }
    
    if (user.preferences?.notifications?.email) {
      promises.push(this.sendEmailNotification(user, notification, data));
    }
    
    const results = await Promise.allSettled(promises);
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    
    info(`Notifications multi-canal envoyées: ${successCount}/${promises.length} canaux`);
    
    return results;
  }
  
  // 👥 Envoyer notification à plusieurs utilisateurs
  static async sendBulkNotification(users, notification, data = {}) {
    const batchSize = 100; // Traiter par lots de 100
    const batches = [];
    
    for (let i = 0; i < users.length; i += batchSize) {
      batches.push(users.slice(i, i + batchSize));
    }
    
    let totalSent = 0;
    
    for (const batch of batches) {
      const promises = batch.map(user => 
        this.sendMultiChannelNotification(user, notification, data)
          .catch(err => {
            error(`Erreur notification utilisateur ${user._id}:`, err);
            return null;
          })
      );
      
      const results = await Promise.allSettled(promises);
      const batchSuccess = results.filter(r => r.status === 'fulfilled' && r.value).length;
      totalSent += batchSuccess;
      
      // Pause entre les lots pour éviter la surcharge
      if (batches.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    info(`Notifications bulk envoyées: ${totalSent}/${users.length} utilisateurs`);
    
    return { sent: totalSent, total: users.length };
  }
  
  // 🎯 Notifications spécialisées pour Harvests
  static async notifyNewOrder(order) {
    const toSellerIds = new Set();

    const addSeller = (value) => {
      if (!value) return;
      if (typeof value === 'string') {
        toSellerIds.add(value);
        return;
      }
      if (value?._id) {
        toSellerIds.add(value._id.toString());
        return;
      }
      if (typeof value.toString === 'function') {
        toSellerIds.add(value.toString());
      }
    };

    addSeller(order.seller);
    (order.segments || []).forEach((segment) => addSeller(segment?.seller));
    if (toSellerIds.size === 0 && Array.isArray(order.items)) {
      order.items.forEach((item) => addSeller(item?.seller));
    }

    const buyer = await this.getUser(order.buyer);

    // Notifier les vendeurs
    for (const sellerId of toSellerIds) {
      const sellerUser = await this.getUser(sellerId);
      if (!sellerUser) continue;

      await this.sendMultiChannelNotification(sellerUser, {
        title: '🛒 Nouvelle commande !',
        body: `Vous avez reçu une commande de ${order.total} XAF`,
        clickAction: `/producer/orders/${order._id}`,
        actionText: 'Voir la commande',
        emailTemplate: 'new-order'
      }, {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        amount: order.total
      });
    }
    
    // Confirmer au client
    if (buyer) {
      await this.sendMultiChannelNotification(buyer, {
        title: '✅ Commande confirmée',
        body: `Votre commande ${order.orderNumber} a été enregistrée`,
        clickAction: `/orders/${order._id}`,
        actionText: 'Suivre ma commande',
        emailTemplate: 'order-confirmation'
      }, {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber
      });
    }
  }
  
  // 📦 Notifier changement de statut commande
  static async notifyOrderStatusChange(order, newStatus) {
    const buyer = await this.getUser(order.buyer);
    
    if (!buyer) return;
    
    const statusMessages = {
      'confirmed': '✅ Commande confirmée par le producteur',
      'preparing': '📦 Votre commande est en préparation',
      'ready-for-pickup': '🚚 Commande prête pour la collecte',
      'in-transit': '🛣️ Votre commande est en route',
      'delivered': '🎉 Commande livrée avec succès !',
      'cancelled': '❌ Commande annulée'
    };
    
    await this.sendMultiChannelNotification(buyer, {
      title: 'Mise à jour de votre commande',
      body: statusMessages[newStatus] || 'Statut de commande mis à jour',
      clickAction: `/orders/${order._id}`,
      actionText: 'Voir détails',
      emailTemplate: 'order-status-update'
    }, {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      status: newStatus
    });
  }
  
  // ⭐ Notifier nouvel avis
  static async notifyNewReview(review) {
    const producer = await this.getUser(review.producer);
    
    if (!producer) return;
    
    await this.sendMultiChannelNotification(producer, {
      title: `⭐ Nouvel avis ${review.rating}/5`,
      body: `"${review.title}" - Un client a laissé un avis`,
      clickAction: `/producer/reviews/${review._id}`,
      actionText: 'Voir l\'avis',
      emailTemplate: 'new-review'
    }, {
      reviewId: review._id.toString(),
      rating: review.rating,
      title: review.title
    });
  }
  
  // 💰 Notifier paiement reçu
  static async notifyPaymentReceived(order, payment) {
    const sellerIds = new Set();
    const addSeller = (value) => {
      if (!value) return;
      if (typeof value === 'string') {
        sellerIds.add(value);
        return;
      }
      if (value?._id) {
        sellerIds.add(value._id.toString());
        return;
      }
      if (typeof value.toString === 'function') {
        sellerIds.add(value.toString());
      }
    };

    addSeller(order.seller);
    (order.segments || []).forEach((segment) => addSeller(segment?.seller));
    if (sellerIds.size === 0 && Array.isArray(order.items)) {
      order.items.forEach((item) => addSeller(item?.seller));
    }

    for (const sellerId of sellerIds) {
      const sellerUser = await this.getUser(sellerId);
      if (!sellerUser) continue;

      await this.sendMultiChannelNotification(sellerUser, {
        title: '💰 Paiement reçu !',
        body: `Paiement de ${payment.amount} XAF pour la commande ${order.orderNumber}`,
        clickAction: `/producer/payments/${payment._id}`,
        actionText: 'Voir paiement',
        emailTemplate: 'payment-received'
      }, {
        orderId: order._id.toString(),
        paymentId: payment._id?.toString(),
        amount: payment.amount
      });
    }
  }
  
  // 🕒 Notifications programmées
  static setupScheduledNotifications() {
    // Rappel quotidien pour les commandes en attente (9h00)
    cron.schedule('0 9 * * *', async () => {
      await this.sendPendingOrderReminders();
    });
    
    // Rappel hebdomadaire pour les producteurs inactifs (lundi 10h00)
    cron.schedule('0 10 * * 1', async () => {
      await this.sendInactiveProducerReminders();
    });
    
    // Notification promotionnelle mensuelle (1er du mois 14h00)
    cron.schedule('0 14 1 * *', async () => {
      await this.sendMonthlyPromotions();
    });
    
    info('Notifications programmées configurées');
  }
  
  // 📋 Rappels commandes en attente
  static async sendPendingOrderReminders() {
    try {
      const Order = require('../models/Order');
      const pendingOrders = await Order.find({
        status: 'pending',
        createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Plus de 24h
      }).populate('seller buyer');
      
      for (const order of pendingOrders) {
        const sellerIds = new Set();
        const addSeller = (value) => {
          if (!value) return;
          if (typeof value === 'string') {
            sellerIds.add(value);
            return;
          }
          if (value?._id) {
            sellerIds.add(value._id.toString());
            return;
          }
          if (typeof value.toString === 'function') {
            sellerIds.add(value.toString());
          }
        };

        addSeller(order.seller);
        (order.segments || []).forEach((segment) => addSeller(segment?.seller));
        if (sellerIds.size === 0 && Array.isArray(order.items)) {
          order.items.forEach((item) => addSeller(item?.seller));
        }

        for (const sellerId of sellerIds) {
          const sellerUser = await this.getUser(sellerId);
          if (!sellerUser) continue;

          await this.sendMultiChannelNotification(sellerUser, {
            title: '⏰ Commande en attente',
            body: `N'oubliez pas de traiter la commande ${order.orderNumber}`,
            clickAction: `/producer/orders/${order._id}`,
            actionText: 'Traiter maintenant'
          });
        }
      }
      
      info(`Rappels envoyés pour ${pendingOrders.length} commandes en attente`);
      
    } catch (err) {
      error('Erreur rappels commandes en attente:', err);
    }
  }
  
  // 😴 Rappels producteurs inactifs
  static async sendInactiveProducerReminders() {
    try {
      const User = require('../models/User');
      const inactiveProducers = await User.find({
        userType: 'producer',
        lastActivity: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Plus de 7 jours
        isActive: true
      });
      
      for (const producer of inactiveProducers) {
        await this.sendMultiChannelNotification(producer, {
          title: '🌾 Revenez sur Harvests !',
          body: 'Vos clients vous attendent. Ajoutez de nouveaux produits !',
          clickAction: '/producer/dashboard',
          actionText: 'Voir mon tableau de bord'
        });
      }
      
      info(`Rappels envoyés à ${inactiveProducers.length} producteurs inactifs`);
      
    } catch (err) {
      error('Erreur rappels producteurs inactifs:', err);
    }
  }
  
  // 🎁 Promotions mensuelles
  static async sendMonthlyPromotions() {
    try {
      const User = require('../models/User');
      const consumers = await User.find({
        userType: 'consumer',
        'preferences.notifications.promotional': true
      });
      
      await this.sendBulkNotification(consumers, {
        title: '🎁 Offres spéciales du mois !',
        body: 'Découvrez nos produits bio en promotion',
        clickAction: '/promotions',
        actionText: 'Voir les offres',
        emailTemplate: 'monthly-promotions'
      });
      
      info(`Promotions mensuelles envoyées à ${consumers.length} consommateurs`);
      
    } catch (err) {
      error('Erreur promotions mensuelles:', err);
    }
  }
  
  // 🧹 Nettoyer tokens FCM invalides
  static async cleanInvalidTokens(tokens, responses) {
    const User = require('../models/User');
    const invalidTokens = [];
    
    responses.forEach((response, index) => {
      if (!response.success) {
        if (response.error?.code === 'messaging/invalid-registration-token' ||
            response.error?.code === 'messaging/registration-token-not-registered') {
          invalidTokens.push(tokens[index]);
        }
      }
    });
    
    if (invalidTokens.length > 0) {
      await User.updateMany(
        { fcmTokens: { $in: invalidTokens } },
        { $pullAll: { fcmTokens: invalidTokens } }
      );
      
      info(`${invalidTokens.length} tokens FCM invalides supprimés`);
    }
  }
  
  // 🗑️ Supprimer subscription Web Push expirée
  static async removeExpiredSubscription(subscription) {
    const User = require('../models/User');
    
    await User.updateMany(
      { webPushSubscriptions: subscription },
      { $pull: { webPushSubscriptions: subscription } }
    );
    
    info('Subscription Web Push expirée supprimée');
  }
  
  // 👤 Obtenir utilisateur avec gestion d'erreur
  static async getUser(userId) {
    try {
      const User = require('../models/User');
      return await User.findById(userId).select('+preferences +fcmTokens +webPushSubscriptions');
    } catch (err) {
      error(`Erreur récupération utilisateur ${userId}:`, err);
      return null;
    }
  }
}

module.exports = NotificationService;
