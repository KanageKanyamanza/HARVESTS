// Export all order controllers
const orderUserController = require("./orderUserController");
const orderAdminController = require("./orderAdminController");
const orderNotificationService = require("../../services/orderNotificationService");

module.exports = {
	// User routes
	estimateOrderCosts: orderUserController.estimateOrderCosts,
	createOrder: orderUserController.createOrder,
	getMyOrders: orderUserController.getMyOrders,
	getOrder: orderUserController.getOrder,
	updateOrderStatus: orderUserController.updateOrderStatus,
	cancelOrder: orderUserController.cancelOrder,
	trackOrder: orderUserController.trackOrder,
	generateInvoice: orderUserController.generateInvoice,

	// Admin routes
	getAllOrders: orderAdminController.getAllOrders,
	getOrderStats: orderAdminController.getOrderStats,

	// Utility exports
	sendStatusNotifications: orderNotificationService.sendStatusNotifications,
};
