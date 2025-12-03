const mongoose = require('mongoose');
const {
  ensureSegmentsForOrder,
  updateOrderStatusFromSegments
} = require('../../utils/orderSegments');

// Méthodes du schéma
function addOrderMethods(orderSchema) {
  orderSchema.methods.updateStatus = function(newStatus, updatedBy, reason = null, note = null) {
    const oldStatus = this.status;
    const segmentsCreated = ensureSegmentsForOrder(this);
    if (segmentsCreated) {
      // Les segments seront enregistrés lors du save
    }

    const now = new Date();

    if (Array.isArray(this.segments) && this.segments.length > 0) {
      this.segments.forEach((segment) => {
        segment.status = newStatus;
        segment.history = segment.history || [];
        segment.history.push({
          status: newStatus,
          timestamp: now,
          updatedBy,
          reason,
          note
        });
      });
    }

    this.status = newStatus;
    this.modifiedBy = updatedBy;
    
    // Mettre à jour les dates spécifiques
    switch (newStatus) {
      case 'confirmed':
        this.confirmedAt = now;
        break;
      case 'in-transit':
        this.shippedAt = now;
        break;
      case 'delivered':
        this.deliveredAt = now;
        break;
      case 'completed':
        this.completedAt = now;
        break;
      case 'cancelled':
        this.cancelledAt = now;
        this.cancelledBy = updatedBy;
        if (reason) this.cancellationReason = reason;
        break;
    }
    
    // Ajouter à l'historique
    this.statusHistory = this.statusHistory || [];
    this.statusHistory.push({
      status: newStatus,
      timestamp: now,
      updatedBy,
      reason,
      note
    });
 
    updateOrderStatusFromSegments(this, newStatus);

    return this.save();
  };

  orderSchema.methods.addDeliveryUpdate = async function(status, location = null, note = null, updatedBy = null) {
    if (!this.delivery.timeline) {
      this.delivery.timeline = [];
    }
    
    this.delivery.timeline.push({
      status,
      timestamp: new Date(),
      location,
      note,
      updatedBy
    });
    
    // Mettre à jour le statut de livraison
    this.delivery.status = status;
    
    // Mettre à jour le statut de la commande si nécessaire
    const statusMapping = {
      'picked-up': 'in-transit',
      'delivered': 'delivered'
    };
    
    // Si updateStatus est appelé, il sauvegarde déjà le document
    // Sinon, on doit sauvegarder manuellement
    if (statusMapping[status]) {
      // updateStatus appelle déjà save(), donc on retourne directement sa promesse
      return await this.updateStatus(statusMapping[status], updatedBy);
    }
    
    // Si pas de changement de statut de commande, sauvegarder seulement les changements de livraison
    return await this.save();
  };

  orderSchema.methods.processPayment = async function(paymentData) {
    this.payment.status = 'processing';
    this.payment.transactionId = paymentData.transactionId;
    
    try {
      // Ici on intégrerait avec les services de paiement
      // Stripe, Orange Money, MTN Mobile Money, etc.
      
      this.payment.status = 'completed';
      this.payment.paidAt = new Date();
      
      // Mettre à jour le statut de la commande
      if (this.status === 'pending') {
        await this.updateStatus('confirmed', null, 'Paiement confirmé');
      }
      
      return await this.save();
    } catch (error) {
      this.payment.status = 'failed';
      this.payment.failureReason = error.message;
      await this.save();
      throw error;
    }
  };

  orderSchema.methods.calculateFees = function() {
    const platformFeeRate = 0.05; // 5% de commission
    const paymentFeeRate = 0.025; // 2.5% de frais de paiement
    
    const platformFee = this.subtotal * platformFeeRate;
    const paymentFee = this.total * paymentFeeRate;
    
    this.payment.fees = {
      platform: Math.round(platformFee),
      payment: Math.round(paymentFee),
      total: Math.round(platformFee + paymentFee)
    };
    
    return this.payment.fees;
  };

  orderSchema.methods.reserveStock = async function() {
    const Product = mongoose.model('Product');
    
    for (const item of this.items) {
      const product = await Product.findById(item.product);
      if (product) {
        // S'assurer que le produit a le champ userType défini
        if (!product.userType) {
          // Déterminer le userType basé sur les champs existants
          if (product.producer) {
            product.userType = 'producer';
          } else if (product.transformer) {
            product.userType = 'transformer';
          } else {
            // Fallback - essayer de déterminer depuis le vendeur de la commande
            product.userType = 'producer'; // Valeur par défaut
          }
        }
        
        product.reserveStock(item.quantity, item.variant);
        await product.save();
      }
    }
  };

  orderSchema.methods.releaseStock = async function() {
    const Product = mongoose.model('Product');
    
    for (const item of this.items) {
      const product = await Product.findById(item.product);
      if (product) {
        // S'assurer que le produit a le champ userType défini
        if (!product.userType) {
          // Déterminer le userType basé sur les champs existants
          if (product.producer) {
            product.userType = 'producer';
          } else if (product.transformer) {
            product.userType = 'transformer';
          } else {
            // Fallback - essayer de déterminer depuis le vendeur de la commande
            product.userType = 'producer'; // Valeur par défaut
          }
        }
        
        product.releaseStock(item.quantity, item.variant);
        await product.save();
      }
    }
  };
}

module.exports = addOrderMethods;

