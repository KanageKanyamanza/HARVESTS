const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const AppError = require('../utils/appError');

class StripeService {
  
  // 💳 Créer un Payment Intent pour une commande
  static async createPaymentIntent(order, paymentMethodId = null) {
    try {
      const paymentIntentData = {
        amount: Math.round(order.total * 100), // Stripe utilise les centimes
        currency: order.payment.currency.toLowerCase() || 'xaf',
        metadata: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          buyerId: order.buyer.toString(),
          sellerId: order.seller.toString()
        },
        description: `Commande Harvests ${order.orderNumber}`,
        receipt_email: order.buyerEmail || null
      };
      
      // Si une méthode de paiement est fournie, l'attacher
      if (paymentMethodId) {
        paymentIntentData.payment_method = paymentMethodId;
        paymentIntentData.confirm = true;
        paymentIntentData.return_url = `${process.env.FRONTEND_URL}/orders/${order._id}/confirmation`;
      }
      
      const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);
      
      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status
      };
      
    } catch (error) {
      console.error('Erreur création Payment Intent:', error);
      throw new AppError('Erreur lors de la création du paiement', 500);
    }
  }
  
  // ✅ Confirmer un paiement
  static async confirmPayment(paymentIntentId, paymentMethodId) {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
        return_url: `${process.env.FRONTEND_URL}/payment/success`
      });
      
      return {
        status: paymentIntent.status,
        paymentIntentId: paymentIntent.id
      };
      
    } catch (error) {
      console.error('Erreur confirmation paiement:', error);
      throw new AppError('Erreur lors de la confirmation du paiement', 500);
    }
  }
  
  // 🔄 Créer un remboursement
  static async createRefund(paymentIntentId, amount = null, reason = 'requested_by_customer') {
    try {
      const refundData = {
        payment_intent: paymentIntentId,
        reason: reason
      };
      
      // Si montant spécifique (remboursement partiel)
      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }
      
      const refund = await stripe.refunds.create(refundData);
      
      return {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      };
      
    } catch (error) {
      console.error('Erreur création remboursement:', error);
      throw new AppError('Erreur lors du remboursement', 500);
    }
  }
  
  // 👤 Créer un compte Stripe Connect pour un producteur
  static async createConnectedAccount(producer) {
    try {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'CM', // Cameroun
        email: producer.email,
        business_profile: {
          name: producer.farmName || `${producer.firstName} ${producer.lastName}`,
          product_description: 'Produits agricoles biologiques',
          support_email: producer.email,
          url: `${process.env.FRONTEND_URL}/producer/${producer._id}`
        },
        metadata: {
          producerId: producer._id.toString(),
          userType: 'producer'
        }
      });
      
      return {
        accountId: account.id,
        onboardingUrl: await this.createAccountLink(account.id)
      };
      
    } catch (error) {
      console.error('Erreur création compte Stripe Connect:', error);
      throw new AppError('Erreur lors de la création du compte vendeur', 500);
    }
  }
  
  // 🔗 Créer un lien d'onboarding pour Stripe Connect
  static async createAccountLink(accountId) {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${process.env.FRONTEND_URL}/producer/stripe/refresh`,
        return_url: `${process.env.FRONTEND_URL}/producer/stripe/success`,
        type: 'account_onboarding'
      });
      
      return accountLink.url;
      
    } catch (error) {
      console.error('Erreur création lien onboarding:', error);
      throw new AppError('Erreur lors de la création du lien d\'onboarding', 500);
    }
  }
  
  // 💰 Créer un transfert vers un compte connecté
  static async createTransfer(amount, connectedAccountId, orderId) {
    try {
      // Calculer les frais de plateforme (5%)
      const platformFee = Math.round(amount * 0.05 * 100);
      const transferAmount = Math.round(amount * 100) - platformFee;
      
      const transfer = await stripe.transfers.create({
        amount: transferAmount,
        currency: 'xaf',
        destination: connectedAccountId,
        metadata: {
          orderId: orderId,
          platformFee: platformFee / 100
        }
      });
      
      return {
        transferId: transfer.id,
        amount: transfer.amount / 100,
        platformFee: platformFee / 100
      };
      
    } catch (error) {
      console.error('Erreur création transfert:', error);
      throw new AppError('Erreur lors du transfert vers le vendeur', 500);
    }
  }
  
  // 📊 Obtenir les détails d'un paiement
  static async getPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        metadata: paymentIntent.metadata
      };
      
    } catch (error) {
      console.error('Erreur récupération Payment Intent:', error);
      throw new AppError('Erreur lors de la récupération du paiement', 500);
    }
  }
  
  // 🎯 Traiter les webhooks Stripe
  static async handleWebhook(body, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      
      console.log('Webhook Stripe reçu:', event.type);
      
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
          
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
          
        case 'account.updated':
          await this.handleAccountUpdated(event.data.object);
          break;
          
        default:
          console.log(`Webhook non géré: ${event.type}`);
      }
      
      return { received: true };
      
    } catch (error) {
      console.error('Erreur traitement webhook:', error);
      throw new AppError('Erreur lors du traitement du webhook', 400);
    }
  }
  
  // ✅ Traiter le succès d'un paiement
  static async handlePaymentSuccess(paymentIntent) {
    try {
      const Order = require('../models/Order');
      const orderId = paymentIntent.metadata.orderId;
      
      const order = await Order.findById(orderId);
      if (order) {
        order.payment.status = 'completed';
        order.payment.transactionId = paymentIntent.id;
        order.payment.paidAt = new Date();
        
        if (order.status === 'pending') {
          order.status = 'confirmed';
        }
        
        await order.save();
        
        // Créer transfert vers le vendeur si compte connecté
        if (order.sellerStripeAccount) {
          await this.createTransfer(
            order.total,
            order.sellerStripeAccount,
            order._id.toString()
          );
        }
      }
      
    } catch (error) {
      console.error('Erreur traitement succès paiement:', error);
    }
  }
  
  // ❌ Traiter l'échec d'un paiement
  static async handlePaymentFailed(paymentIntent) {
    try {
      const Order = require('../models/Order');
      const orderId = paymentIntent.metadata.orderId;
      
      const order = await Order.findById(orderId);
      if (order) {
        order.payment.status = 'failed';
        order.payment.failureReason = 'Payment failed via Stripe';
        await order.save();
      }
      
    } catch (error) {
      console.error('Erreur traitement échec paiement:', error);
    }
  }
  
  // 🏪 Traiter la mise à jour d'un compte connecté
  static async handleAccountUpdated(account) {
    try {
      const User = require('../models/User');
      const producerId = account.metadata.producerId;
      
      if (producerId) {
        const producer = await User.findById(producerId);
        if (producer) {
          producer.stripeAccountId = account.id;
          producer.stripeAccountStatus = account.details_submitted ? 'active' : 'pending';
          await producer.save();
        }
      }
      
    } catch (error) {
      console.error('Erreur traitement mise à jour compte:', error);
    }
  }
}

module.exports = StripeService;
