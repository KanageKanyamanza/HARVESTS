// Virtuals
function addOrderVirtuals(orderSchema) {
  orderSchema.virtual('totalWeight').get(function() {
    if (!this.items || !Array.isArray(this.items)) {
      return 0;
    }
    return this.items.reduce((total, item) => {
      if (item.weight && item.weight.value) {
        return total + (item.weight.value * item.quantity);
      }
      return total;
    }, 0);
  });

  orderSchema.virtual('isPaymentPending').get(function() {
    if (!this.payment || !this.payment.status) {
      return false;
    }
    return ['pending', 'processing'].includes(this.payment.status);
  });

  orderSchema.virtual('isDelivered').get(function() {
    return this.status === 'delivered';
  });

  orderSchema.virtual('canBeCancelled').get(function() {
    return ['pending', 'confirmed'].includes(this.status);
  });

  orderSchema.virtual('estimatedDelivery').get(function() {
    if (this.delivery && this.delivery.estimatedDeliveryDate) {
      return this.delivery.estimatedDeliveryDate;
    }
    
    // Estimation basée sur la méthode de livraison
    const now = new Date();
    const deliveryDays = {
      'same-day': 0,
      'express-delivery': 1,
      'standard-delivery': 3,
      'scheduled': 7,
      'pickup': 0
    };
    
    const days = deliveryDays[this.delivery?.method] || 3;
    return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  });
}

module.exports = addOrderVirtuals;

