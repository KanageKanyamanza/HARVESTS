// Index pour performance
function addOrderIndexes(orderSchema) {
  orderSchema.index({ orderNumber: 1 }, { unique: true });
  orderSchema.index({ buyer: 1, createdAt: -1 });
  orderSchema.index({ seller: 1, createdAt: -1 });
  orderSchema.index({ status: 1 });
  orderSchema.index({ 'payment.status': 1 });
  orderSchema.index({ 'delivery.status': 1 });
  orderSchema.index({ createdAt: -1 });
  orderSchema.index({ 'delivery.transporter': 1 });
  // Recherche des vendeurs payables (Jour 81) : les commandes non encore
  // reversées, les plus récemment mises à jour d'abord.
  orderSchema.index({ payoutState: 1, updatedAt: -1 });
}

module.exports = addOrderIndexes;

