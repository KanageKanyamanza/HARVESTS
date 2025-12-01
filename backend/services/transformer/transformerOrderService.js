const Order = require('../../models/Order');
const AppError = require('../../utils/appError');

/**
 * Service pour la gestion des commandes du transformateur
 */

async function acceptOrder(orderId, transformerId, orderData) {
  const order = await Order.findOne({
    _id: orderId,
    seller: transformerId,
    status: 'pending'
  });
  
  if (!order) {
    throw new Error('Commande non trouvée ou déjà traitée');
  }
  
  order.status = 'processing';
  order.processingDetails = orderData.processingDetails || {};
  order.acceptedAt = new Date();
  
  await order.save();
  return order;
}

async function cancelOrderByTransformer(orderId, transformerId, reason) {
  const order = await Order.findOne({
    _id: orderId,
    seller: transformerId
  });
  
  if (!order) {
    throw new Error('Commande non trouvée');
  }
  
  if (['completed', 'delivered', 'cancelled'].includes(order.status)) {
    throw new Error('Cette commande ne peut pas être annulée');
  }
  
  order.status = 'cancelled';
  order.cancellationReason = reason;
  order.cancelledAt = new Date();
  
  await order.save();
  return order;
}

async function updateOrderProgress(orderId, transformerId, progressData) {
  const order = await Order.findOne({
    _id: orderId,
    seller: transformerId
  });
  
  if (!order) {
    throw new Error('Commande non trouvée');
  }
  
  if (!order.processingDetails) {
    order.processingDetails = {};
  }
  
  order.processingDetails.progress = progressData.progress || order.processingDetails.progress;
  order.processingDetails.notes = progressData.notes || order.processingDetails.notes;
  order.processingDetails.updatedAt = new Date();
  
  await order.save();
  return order;
}

module.exports = {
  acceptOrder,
  cancelOrderByTransformer,
  updateOrderProgress
};

