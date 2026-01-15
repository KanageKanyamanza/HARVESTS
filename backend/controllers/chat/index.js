// Export all chat controllers
const chatSearchController = require("./chatSearchController");
const chatTrackingController = require("./chatTrackingController");
const chatAdminController = require("./chatAdminController");

module.exports = {
	// Search routes
	searchProducts: chatSearchController.searchProducts,
	trackOrder: chatSearchController.trackOrder,
	getMyRecentOrders: chatSearchController.getMyRecentOrders,
	searchSellers: chatSearchController.searchSellers,
	searchTransporters: chatSearchController.searchTransporters,
	getCategories: chatSearchController.getCategories,

	// Tracking routes
	logInteraction: chatTrackingController.logInteraction,
	logFeedback: chatTrackingController.logFeedback,
	getCustomAnswers: chatTrackingController.getCustomAnswers,

	// Admin routes
	getUnansweredQuestions: chatAdminController.getUnansweredQuestions,
	answerQuestion: chatAdminController.answerQuestion,
	ignoreQuestion: chatAdminController.ignoreQuestion,
	getChatStats: chatAdminController.getChatStats,
	getAllInteractions: chatAdminController.getAllInteractions,
	getUserChatHistory: chatAdminController.getUserChatHistory,

	// FAQ Management
	getFaqs: chatAdminController.getFaqs,
	createFaq: chatAdminController.createFaq,
	updateFaq: chatAdminController.updateFaq,
	deleteFaq: chatAdminController.deleteFaq,

	// Bot processing
	processMessage: require("./chatBotController").processMessage,
	trainBot: require("./chatBotController").trainBot,
};
