const crypto = require('crypto');
const axios = require('axios');
const { info, error } = require('../config/logger');
const { generateSecureToken } = require('../middleware/advancedSecurity');

class WebhookService {
  
  // 📡 Enregistrer un nouveau webhook
  static async registerWebhook(url, events, secret = null, userId = null) {
    try {
      const Webhook = require('../models/Webhook'); // À créer
      
      const webhook = new Webhook({
        url,
        events: Array.isArray(events) ? events : [events],
        secret: secret || generateSecureToken(),
        userId,
        isActive: true,
        createdAt: new Date()
      });
      
      await webhook.save();
      
      info('Webhook enregistré', {
        webhookId: webhook._id,
        url: webhook.url,
        events: webhook.events
      });
      
      return webhook;
      
    } catch (err) {
      error('Erreur enregistrement webhook:', err);
      throw err;
    }
  }
  
  // 🔥 Déclencher un webhook
  static async triggerWebhook(eventType, data, userId = null) {
    try {
      const Webhook = require('../models/Webhook');
      
      // Trouver tous les webhooks actifs pour cet événement
      const webhooks = await Webhook.find({
        events: eventType,
        isActive: true,
        $or: [
          { userId: userId },
          { userId: null } // Webhooks globaux
        ]
      });
      
      if (webhooks.length === 0) {
        info(`Aucun webhook trouvé pour l'événement: ${eventType}`);
        return;
      }
      
      const payload = {
        event: eventType,
        timestamp: new Date().toISOString(),
        data: data,
        webhook_id: null // Sera défini pour chaque webhook
      };
      
      // Envoyer à tous les webhooks correspondants
      const promises = webhooks.map(webhook => 
        this.sendWebhook(webhook, { ...payload, webhook_id: webhook._id })
      );
      
      const results = await Promise.allSettled(promises);
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      
      info(`Webhooks déclenchés: ${successCount}/${webhooks.length}`, {
        eventType,
        totalWebhooks: webhooks.length,
        successCount
      });
      
      return { sent: successCount, total: webhooks.length };
      
    } catch (err) {
      error('Erreur déclenchement webhook:', err);
      throw err;
    }
  }
  
  // 📤 Envoyer un webhook individuel
  static async sendWebhook(webhook, payload) {
    try {
      const signature = this.generateSignature(payload, webhook.secret);
      
      const response = await axios.post(webhook.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Harvests-Signature': signature,
          'X-Harvests-Event': payload.event,
          'X-Harvests-Timestamp': payload.timestamp,
          'X-Harvests-Webhook-ID': webhook._id.toString(),
          'User-Agent': 'Harvests-Webhook/1.0'
        },
        timeout: 30000, // 30 secondes
        validateStatus: (status) => status >= 200 && status < 300
      });
      
      // Enregistrer le succès
      await this.logWebhookDelivery(webhook._id, payload.event, 'success', {
        statusCode: response.status,
        responseTime: response.headers['x-response-time'] || null
      });
      
      info(`Webhook envoyé avec succès: ${webhook.url}`, {
        webhookId: webhook._id,
        event: payload.event,
        statusCode: response.status
      });
      
      return response;
      
    } catch (err) {
      // Enregistrer l'échec
      await this.logWebhookDelivery(webhook._id, payload.event, 'failed', {
        error: err.message,
        statusCode: err.response?.status || null
      });
      
      error(`Erreur envoi webhook: ${webhook.url}`, err);
      
      // Désactiver le webhook après plusieurs échecs
      await this.handleWebhookFailure(webhook);
      
      throw err;
    }
  }
  
  // 🔐 Générer signature HMAC
  static generateSignature(payload, secret) {
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
  }
  
  // ✅ Vérifier signature webhook
  static verifySignature(payload, signature, secret) {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }
  
  // 📝 Logger la livraison d'un webhook
  static async logWebhookDelivery(webhookId, event, status, metadata = {}) {
    try {
      const WebhookLog = require('../models/WebhookLog'); // À créer
      
      const log = new WebhookLog({
        webhook: webhookId,
        event,
        status,
        timestamp: new Date(),
        metadata
      });
      
      await log.save();
      
    } catch (err) {
      error('Erreur logging webhook:', err);
    }
  }
  
  // ❌ Gérer les échecs de webhook
  static async handleWebhookFailure(webhook) {
    try {
      const WebhookLog = require('../models/WebhookLog');
      
      // Compter les échecs récents (dernières 24h)
      const recentFailures = await WebhookLog.countDocuments({
        webhook: webhook._id,
        status: 'failed',
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });
      
      // Désactiver après 10 échecs
      if (recentFailures >= 10) {
        const Webhook = require('../models/Webhook');
        await Webhook.findByIdAndUpdate(webhook._id, {
          isActive: false,
          deactivatedAt: new Date(),
          deactivationReason: 'Too many failures'
        });
        
        info(`Webhook désactivé après ${recentFailures} échecs:`, {
          webhookId: webhook._id,
          url: webhook.url
        });
      }
      
    } catch (err) {
      error('Erreur gestion échec webhook:', err);
    }
  }
  
  // 🎯 Webhooks spécialisés pour Harvests
  static async triggerOrderWebhook(order, action) {
    const eventType = `order.${action}`; // order.created, order.updated, order.cancelled
    
    const data = {
      id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      currency: order.payment.currency,
      buyer: {
        id: order.buyer,
        email: order.buyerEmail
      },
      seller: {
        id: order.seller
      },
      items: order.items.map(item => ({
        productId: item.product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
    
    await this.triggerWebhook(eventType, data, order.seller);
  }
  
  // 💳 Webhook de paiement
  static async triggerPaymentWebhook(payment, action) {
    const eventType = `payment.${action}`; // payment.completed, payment.failed, payment.refunded
    
    const data = {
      id: payment._id,
      orderId: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt
    };
    
    await this.triggerWebhook(eventType, data);
  }
  
  // 👤 Webhook utilisateur
  static async triggerUserWebhook(user, action) {
    const eventType = `user.${action}`; // user.created, user.updated, user.verified
    
    const data = {
      id: user._id,
      userType: user.userType,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    // Ajouter données spécifiques au type d'utilisateur
    if (user.userType === 'producer') {
      data.farmName = user.farmName;
      data.farmSize = user.farmSize;
    }
    
    await this.triggerWebhook(eventType, data);
  }
  
  // ⭐ Webhook avis
  static async triggerReviewWebhook(review, action) {
    const eventType = `review.${action}`; // review.created, review.updated, review.moderated
    
    const data = {
      id: review._id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      productId: review.product,
      reviewerId: review.reviewer,
      revieweeId: review.reviewee,
      orderId: review.order,
      isVerified: review.isVerified,
      createdAt: review.createdAt
    };
    
    await this.triggerWebhook(eventType, data, review.reviewee);
  }
  
  // 🔄 Retry webhook failed
  static async retryFailedWebhooks() {
    try {
      const WebhookLog = require('../models/WebhookLog');
      const Webhook = require('../models/Webhook');
      
      // Trouver les webhooks échoués récents (dernières 6 heures)
      const failedLogs = await WebhookLog.find({
        status: 'failed',
        timestamp: { 
          $gte: new Date(Date.now() - 6 * 60 * 60 * 1000),
          $lte: new Date(Date.now() - 30 * 60 * 1000) // Pas plus récent que 30 min
        },
        retryCount: { $lt: 3 } // Maximum 3 tentatives
      }).populate('webhook');
      
      for (const log of failedLogs) {
        if (log.webhook && log.webhook.isActive) {
          try {
            // Reconstituer le payload (simplifié)
            const payload = {
              event: log.event,
              timestamp: new Date().toISOString(),
              webhook_id: log.webhook._id,
              retry: true,
              originalTimestamp: log.timestamp
            };
            
            await this.sendWebhook(log.webhook, payload);
            
            // Marquer comme retenté
            log.retryCount = (log.retryCount || 0) + 1;
            log.lastRetryAt = new Date();
            await log.save();
            
          } catch (err) {
            error(`Erreur retry webhook ${log.webhook._id}:`, err);
          }
        }
      }
      
      info(`Retry de ${failedLogs.length} webhooks échoués terminé`);
      
    } catch (err) {
      error('Erreur retry webhooks échoués:', err);
    }
  }
  
  // 📊 Statistiques webhooks
  static async getWebhookStats(webhookId, days = 7) {
    try {
      const WebhookLog = require('../models/WebhookLog');
      
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const stats = await WebhookLog.aggregate([
        {
          $match: {
            webhook: webhookId,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            events: { $addToSet: '$event' }
          }
        }
      ]);
      
      const total = stats.reduce((sum, stat) => sum + stat.count, 0);
      const success = stats.find(s => s._id === 'success')?.count || 0;
      const failed = stats.find(s => s._id === 'failed')?.count || 0;
      
      return {
        total,
        success,
        failed,
        successRate: total > 0 ? (success / total * 100).toFixed(2) : 0,
        period: `${days} days`,
        details: stats
      };
      
    } catch (err) {
      error('Erreur statistiques webhook:', err);
      throw err;
    }
  }
  
  // 🧹 Nettoyer anciens logs
  static async cleanupOldLogs(daysToKeep = 30) {
    try {
      const WebhookLog = require('../models/WebhookLog');
      
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
      
      const result = await WebhookLog.deleteMany({
        timestamp: { $lt: cutoffDate }
      });
      
      info(`${result.deletedCount} anciens logs webhook supprimés`);
      
      return result.deletedCount;
      
    } catch (err) {
      error('Erreur nettoyage logs webhook:', err);
      throw err;
    }
  }
}

module.exports = WebhookService;
