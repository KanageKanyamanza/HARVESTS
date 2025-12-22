// Export all notification controllers
const notificationUserController = require("./notificationUserController");
const notificationAdminController = require("./notificationAdminController");
const notificationSystemController = require("./notificationSystemController");
const notificationWebhookController = require("./notificationWebhookController");

module.exports = {
	// User routes
	getMyNotifications: notificationUserController.getMyNotifications,
	getUnreadCount: notificationUserController.getUnreadCount,
	getNotificationsByCategory:
		notificationUserController.getNotificationsByCategory,
	markAsRead: notificationUserController.markAsRead,
	markAllAsRead: notificationUserController.markAllAsRead,
	markAsClicked: notificationUserController.markAsClicked,
	dismissNotification: notificationUserController.dismissNotification,
	deleteNotification: notificationUserController.deleteNotification,
	getNotificationPreferences:
		notificationUserController.getNotificationPreferences,
	updateNotificationPreferences:
		notificationUserController.updateNotificationPreferences,
	subscribeToPush: notificationUserController.subscribeToPush,
	unsubscribeFromPush: notificationUserController.unsubscribeFromPush,

	// Admin routes
	createSystemNotification:
		notificationAdminController.createSystemNotification,
	getAllNotifications: notificationAdminController.getAllNotifications,
	getNotificationStats: notificationAdminController.getNotificationStats,
	retryFailedNotification: notificationAdminController.retryFailedNotification,
	cleanupExpiredNotifications:
		notificationAdminController.cleanupExpiredNotifications,
	processScheduledNotifications:
		notificationAdminController.processScheduledNotifications,
	sendTestNotification: notificationAdminController.sendTestNotification,
	getPerformanceStats: notificationAdminController.getPerformanceStats,
	notifyLowStock: notificationAdminController.notifyLowStock,
	notifyBackInStock: notificationAdminController.notifyBackInStock,
	notifyPromotion: notificationAdminController.notifyPromotion,

	// System notifications (internal use)
	notifyProductPendingApproval:
		notificationSystemController.notifyProductPendingApproval,
	notifyUserReported: notificationSystemController.notifyUserReported,
	notifyHighValueOrder: notificationSystemController.notifyHighValueOrder,
	notifyPaymentIssue: notificationSystemController.notifyPaymentIssue,
	notifyDisputeCreated: notificationSystemController.notifyDisputeCreated,
	notifySecurityAlert: notificationSystemController.notifySecurityAlert,

	// Webhooks
	handleNotificationWebhook:
		notificationWebhookController.handleNotificationWebhook,
};
