// Export all order controllers
const orderUserController = require('./orderUserController');
const orderAdminController = require('./orderAdminController');
const orderTestController = require('./orderTestController');
const orderNotificationService = require('../../services/orderNotificationService');

module.exports = {
  // User routes
  estimateOrderCosts: orderUserController.estimateOrderCosts,
  createOrder: orderUserController.createOrder,
  getMyOrders: orderUserController.getMyOrders,
  getOrder: orderUserController.getOrder,
  updateOrderStatus: orderUserController.updateOrderStatus,
  cancelOrder: orderUserController.cancelOrder,
  trackOrder: orderUserController.trackOrder,
  
  // Admin routes
  getAllOrders: orderAdminController.getAllOrders,
  getOrderStats: orderAdminController.getOrderStats,
  
  // Test routes
  createTestOrder: orderTestController.createTestOrder,
  
  // Utility exports
  sendStatusNotifications: orderNotificationService.sendStatusNotifications
};

