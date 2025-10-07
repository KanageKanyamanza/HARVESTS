const axios = require('axios');
const AppError = require('../utils/appError');
const crypto = require('crypto');

class MobileMoneyService {
  
  // 🟠 ORANGE MONEY SÉNÉGAL
  static async processOrangeMoneyPayment(order, phoneNumber) {
    try {
      const orangeConfig = {
        baseURL: 'https://api.orange.com/orange-money-webpay/sn/v1',
        timeout: 60000, // 1 minute minimum
        headers: {
          'Authorization': `Bearer ${await this.getOrangeAccessToken()}`,
          'Content-Type': 'application/json'
        }
      };
      
      const paymentData = {
        merchant_key: process.env.ORANGE_MONEY_MERCHANT_KEY,
        currency: 'XOF',
        order_id: order.orderNumber,
        amount: order.total,
        return_url: `${process.env.FRONTEND_URL}/orders/${order._id}/success`,
        cancel_url: `${process.env.FRONTEND_URL}/orders/${order._id}/cancel`,
        notif_url: `${process.env.BACKEND_URL}/api/webhooks/orange-money`,
        lang: 'fr',
        reference: `HARVESTS-${order._id}`,
        customer_msisdn: this.formatPhoneNumber(phoneNumber, 'SN')
      };
      
      const response = await axios.post('/webpayment', paymentData, orangeConfig);
      
      return {
        provider: 'orange_money',
        paymentUrl: response.data.payment_url,
        transactionId: response.data.pay_token,
        status: 'pending'
      };
      
    } catch (error) {
      console.error('Erreur Orange Money:', error.response?.data || error.message);
      throw new AppError('Erreur lors du paiement Orange Money', 500);
    }
  }
  
  // 🌊 WAVE SÉNÉGAL (Leader du mobile money)
  static async processWavePayment(order, phoneNumber) {
    try {
      const waveConfig = {
        baseURL: 'https://api.wave.com/v1',
        timeout: 60000, // 1 minute minimum
        headers: {
          'Authorization': `Bearer ${process.env.WAVE_API_KEY}`,
          'Content-Type': 'application/json',
          'X-API-Version': '2023-01-01'
        }
      };
      
      const paymentData = {
        amount: order.total,
        currency: 'XOF',
        reference: order.orderNumber,
        description: `Commande Harvests ${order.orderNumber}`,
        customer: {
          phone: this.formatPhoneNumber(phoneNumber, 'SN'),
          email: order.buyerEmail || null
        },
        webhook_url: `${process.env.BACKEND_URL}/api/webhooks/wave`,
        success_url: `${process.env.FRONTEND_URL}/orders/${order._id}/success`,
        error_url: `${process.env.FRONTEND_URL}/orders/${order._id}/error`
      };
      
      const response = await axios.post('/checkout/sessions', paymentData, waveConfig);
      
      return {
        provider: 'wave',
        paymentUrl: response.data.checkout_session.wave_launch_url,
        transactionId: response.data.checkout_session.id,
        status: 'pending'
      };
      
    } catch (error) {
      console.error('Erreur Wave:', error.response?.data || error.message);
      throw new AppError('Erreur lors du paiement Wave', 500);
    }
  }
  
  // 🔐 Obtenir token d'accès Orange Money
  static async getOrangeAccessToken() {
    try {
      const authString = Buffer.from(
        `${process.env.ORANGE_MONEY_CLIENT_ID}:${process.env.ORANGE_MONEY_CLIENT_SECRET}`
      ).toString('base64');
      
      const response = await axios.post(
        'https://api.orange.com/oauth/v3/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      return response.data.access_token;
      
    } catch (error) {
      console.error('Erreur authentification Orange:', error);
      throw new AppError('Erreur d\'authentification Orange Money', 500);
    }
  }
  
  // 🌊 Vérifier le statut d'un paiement Wave
  static async checkWavePaymentStatus(sessionId) {
    try {
      const response = await axios.get(
        `https://api.wave.com/v1/checkout/sessions/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.WAVE_API_KEY}`,
            'X-API-Version': '2023-01-01'
          }
        }
      );
      
      return {
        status: response.data.status, // pending, completed, failed, expired
        transactionId: response.data.transaction_id,
        amount: response.data.amount
      };
      
    } catch (error) {
      console.error('Erreur vérification statut Wave:', error);
      throw new AppError('Erreur lors de la vérification du paiement Wave', 500);
    }
  }
  
  // ✅ Vérifier le statut d'un paiement Orange Money
  static async checkOrangePaymentStatus(payToken) {
    try {
      const orangeConfig = {
        baseURL: 'https://api.orange.com/orange-money-webpay/cm/v1',
        timeout: 60000, // 1 minute minimum
        headers: {
          'Authorization': `Bearer ${await this.getOrangeAccessToken()}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.get(`/webpayment/${payToken}`, orangeConfig);
      
      return {
        status: response.data.status, // SUCCESS, PENDING, FAILED
        transactionId: response.data.txnid,
        amount: response.data.amount
      };
      
    } catch (error) {
      console.error('Erreur vérification statut Orange:', error);
      throw new AppError('Erreur lors de la vérification du paiement', 500);
    }
  }
  
  // 🌊 Traiter webhook Wave
  static async processWaveWebhook(body, signature = null) {
    // Vérifier la signature si nécessaire
    if (signature && process.env.WAVE_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.WAVE_WEBHOOK_SECRET)
        .update(JSON.stringify(body))
        .digest('hex');
      
      if (signature !== expectedSignature) {
        throw new AppError('Signature webhook Wave invalide', 401);
      }
    }
    
    return {
      provider: 'wave',
      orderId: body.reference,
      transactionId: body.transaction_id,
      status: body.status,
      amount: body.amount
    };
  }
  
  // 📞 Formater numéro de téléphone selon le pays
  static formatPhoneNumber(phoneNumber, country = 'SN') {
    // Retirer tous les caractères non numériques
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    switch (country) {
      case 'SN': // Sénégal
        if (cleaned.startsWith('221')) {
          return cleaned;
        } else if (cleaned.startsWith('7') || cleaned.startsWith('3')) {
          return '221' + cleaned;
        } else {
          return '221' + cleaned.slice(-9); // Garder les 9 derniers chiffres
        }
      
      case 'CM': // Cameroun (garder pour compatibilité)
        if (cleaned.startsWith('237')) {
          return cleaned;
        } else if (cleaned.startsWith('6') || cleaned.startsWith('2')) {
          return '237' + cleaned;
        } else {
          return '237' + cleaned.slice(-9);
        }
      
      default:
        return cleaned;
    }
  }
  
  // 🎯 Traiter les webhooks des opérateurs
  static async handleMobileMoneyWebhook(provider, body, signature = null) {
    try {
      let paymentData;
      
      switch (provider) {
        case 'orange':
          paymentData = await this.processOrangeWebhook(body, signature);
          break;
          
        case 'wave':
          paymentData = await this.processWaveWebhook(body, signature);
          break;
          
        default:
          throw new AppError('Opérateur mobile money non supporté', 400);
      }
      
      // Mettre à jour la commande
      await this.updateOrderFromWebhook(paymentData);
      
      return { received: true };
      
    } catch (error) {
      console.error('Erreur traitement webhook mobile money:', error);
      throw new AppError('Erreur lors du traitement du webhook', 400);
    }
  }
  
  // 🟠 Traiter webhook Orange Money
  static async processOrangeWebhook(body, signature) {
    // Vérifier la signature si nécessaire
    if (signature && process.env.ORANGE_MONEY_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.ORANGE_MONEY_WEBHOOK_SECRET)
        .update(JSON.stringify(body))
        .digest('hex');
      
      if (signature !== expectedSignature) {
        throw new AppError('Signature webhook invalide', 401);
      }
    }
    
    return {
      provider: 'orange_money',
      orderId: body.order_id,
      transactionId: body.txnid,
      status: body.status,
      amount: body.amount
    };
  }
  
  
  // 📝 Mettre à jour commande depuis webhook
  static async updateOrderFromWebhook(paymentData) {
    try {
      const Order = require('../models/Order');
      
      // Trouver la commande par numéro de commande
      const order = await Order.findOne({ orderNumber: paymentData.orderId });
      
      if (!order) {
        console.error('Commande non trouvée:', paymentData.orderId);
        return;
      }
      
      // Mettre à jour le statut de paiement
      const statusMap = {
        'SUCCESS': 'completed',
        'SUCCESSFUL': 'completed',
        'PENDING': 'processing',
        'FAILED': 'failed'
      };
      
      order.payment.status = statusMap[paymentData.status] || 'failed';
      order.payment.transactionId = paymentData.transactionId;
      order.payment.provider = paymentData.provider;
      
      if (order.payment.status === 'completed') {
        order.payment.paidAt = new Date();
        if (order.status === 'pending') {
          order.status = 'confirmed';
        }
      }
      
      await order.save();
      
      console.log(`Commande ${order.orderNumber} mise à jour: ${order.payment.status}`);
      
    } catch (error) {
      console.error('Erreur mise à jour commande:', error);
    }
  }
  
  // 💰 Initier un retrait vers mobile money
  static async initiateWithdrawal(producer, amount, phoneNumber, provider = 'wave') {
    try {
      if (provider === 'orange') {
        return await this.processOrangeWithdrawal(producer, amount, phoneNumber);
      } else if (provider === 'wave') {
        return await this.processWaveWithdrawal(producer, amount, phoneNumber);
      } else {
        throw new AppError('Opérateur non supporté pour les retraits', 400);
      }
      
    } catch (error) {
      console.error('Erreur retrait mobile money:', error);
      throw new AppError('Erreur lors du retrait', 500);
    }
  }
  
  // 🟠 Retrait Orange Money
  static async processOrangeWithdrawal(producer, amount, phoneNumber) {
    // Implémentation du retrait Orange Money
    // À implémenter selon l'API Orange Money pour les marchands
    return {
      provider: 'orange_money',
      status: 'pending',
      transactionId: crypto.randomUUID()
    };
  }
  
  // 🌊 Retrait Wave
  static async processWaveWithdrawal(producer, amount, phoneNumber) {
    try {
      const waveConfig = {
        baseURL: 'https://api.wave.com/v1',
        timeout: 60000, // 1 minute minimum
        headers: {
          'Authorization': `Bearer ${process.env.WAVE_API_KEY}`,
          'Content-Type': 'application/json',
          'X-API-Version': '2023-01-01'
        }
      };
      
      const withdrawalData = {
        amount: amount,
        currency: 'XOF',
        recipient: {
          phone: this.formatPhoneNumber(phoneNumber, 'SN')
        },
        description: `Retrait Harvests - ${producer.farmName || producer.firstName}`,
        reference: `WITHDRAWAL-${Date.now()}`
      };
      
      const response = await axios.post('/transfers', withdrawalData, waveConfig);
      
      return {
        provider: 'wave',
        status: 'pending',
        transactionId: response.data.transfer_id,
        amount: amount
      };
      
    } catch (error) {
      console.error('Erreur retrait Wave:', error);
      return {
        provider: 'wave',
        status: 'pending',
        transactionId: crypto.randomUUID()
      };
    }
  }
}

module.exports = MobileMoneyService;
