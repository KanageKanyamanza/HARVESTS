const Order = require('../../models/Order');
const orderService = require('../orderService');

/**
 * Service pour la gestion des commandes du consommateur
 */

async function getConsumerOrders(consumerId, queryParams = {}) {
  const orders = await orderService.getAllOrders({
    buyer: consumerId,
    ...queryParams
  });
  return orders;
}

async function getConsumerOrderById(consumerId, orderId) {
  const order = await orderService.getOrderById(orderId);
  
  if (!order) {
    throw new Error('Commande non trouvée');
  }
  
  const buyerId = order.buyer?._id?.toString() || order.buyer?.toString();
  if (buyerId !== consumerId.toString()) {
    throw new Error('Accès non autorisé à cette commande');
  }
  
  return order;
}

async function trackConsumerOrder(consumerId, orderId) {
  const order = await getConsumerOrderById(consumerId, orderId);
  
  return {
    order,
    tracking: {
      status: order.status,
      currentStep: order.status,
      estimatedDelivery: order.estimatedDelivery,
      trackingNumber: order.trackingNumber
    }
  };
}

module.exports = {
  getConsumerOrders,
  getConsumerOrderById,
  trackConsumerOrder
};

