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
}

module.exports = addOrderIndexes;

