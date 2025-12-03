const { getCountryPrefix } = require('./orderHelpers');

// Middleware pre-save
function addOrderMiddleware(orderSchema) {
  orderSchema.pre('validate', async function(next) {
    try {
      if (this.payment) {
        const method = (this.payment.method || '').toLowerCase();
        const normalizedMethod = method === 'paypal' ? 'paypal' : 'cash';
        if (!this.payment.method) {
          this.payment.method = normalizedMethod;
        }
        if (!this.payment.provider || this.payment.provider === '') {
          this.payment.provider = normalizedMethod === 'paypal' ? 'paypal' : 'cash-on-delivery';
        }
      }

      if (!this.orderNumber) {
        const countryCode = this.delivery?.deliveryAddress?.country ||
          this.billingAddress?.country ||
          'CM';
        const countryPrefix = getCountryPrefix(countryCode);
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        const count = await this.constructor.countDocuments();
        const countStr = count.toString().padStart(4, '0');
        this.orderNumber = `H${countryPrefix}${countStr}${timestamp.substring(-4)}${random}`;
      }

      next();
    } catch (error) {
      next(error);
    }
  });

  orderSchema.pre('save', async function(next) {
    // Générer le numéro de commande seulement s'il n'est pas déjà défini
    if (this.isNew && !this.orderNumber) {
      // Format: H + code pays + alphanumérique
      const countryCode = this.delivery?.deliveryAddress?.country || 
                         this.billingAddress?.country || 
                         'CM';
      const countryPrefix = getCountryPrefix(countryCode);
      
      // Générer un identifiant alphanumérique unique
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const count = await this.constructor.countDocuments();
      const countStr = count.toString().padStart(4, '0');
      
      this.orderNumber = `H${countryPrefix}${countStr}${timestamp.substring(-4)}${random}`;
      
      console.log('🔢 Génération orderNumber dans middleware:', {
        countryCode,
        countryPrefix,
        count,
        orderNumber: this.orderNumber
      });
    }
    
    // Calculer le total
    this.total = this.subtotal + this.deliveryFee + this.taxes - this.discount - this.couponDiscount;
    
    // Ajouter à l'historique des statuts si le statut change
    if (this.isModified('status')) {
      this.statusHistory.push({
        status: this.status,
        timestamp: new Date(),
        updatedBy: this.modifiedBy || null // Doit être défini par l'application
      });
    }
    
    next();
  });
}

module.exports = addOrderMiddleware;

