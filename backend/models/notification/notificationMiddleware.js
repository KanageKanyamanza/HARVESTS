// Middleware pre-save
function addNotificationMiddleware(notificationSchema) {
  notificationSchema.pre('save', function(next) {
    // Définir la catégorie automatiquement basée sur le type
    if (!this.category) {
      const typeToCategory = {
        'order_': 'order',
        'product_': 'product',
        'account_': 'account',
        'payment_': 'payment',
        'message_': 'message',
        'delivery_': 'order',
        'review_': 'product',
        'system_': 'system',
        'promotion_': 'marketing'
      };
      
      for (const [prefix, cat] of Object.entries(typeToCategory)) {
        if (this.type.startsWith(prefix)) {
          this.category = cat;
          break;
        }
      }
    }
    
    // Générer une clé de groupe si non définie
    if (!this.groupKey) {
      this.groupKey = `${this.recipient}_${this.type}_${this.data?.orderId || this.data?.productId || 'general'}`;
    }
    
    next();
  });
}

module.exports = addNotificationMiddleware;

