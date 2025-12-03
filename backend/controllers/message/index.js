// Export all message controllers
const messageConversationController = require('./messageConversationController');
const messageMessageController = require('./messageMessageController');
const messageStatsController = require('./messageStatsController');
const messageAdminController = require('./messageAdminController');
const messageUploadController = require('./messageUploadController');

module.exports = {
  // Uploads
  uploadAttachments: messageUploadController.uploadAttachments,
  processAttachments: messageUploadController.processAttachments,
  
  // Conversation routes
  getMyConversations: messageConversationController.getMyConversations,
  createConversation: messageConversationController.createConversation,
  getConversation: messageConversationController.getConversation,
  markConversationAsRead: messageConversationController.markConversationAsRead,
  addParticipant: messageConversationController.addParticipant,
  removeParticipant: messageConversationController.removeParticipant,
  leaveConversation: messageConversationController.leaveConversation,
  archiveConversation: messageConversationController.archiveConversation,
  unarchiveConversation: messageConversationController.unarchiveConversation,
  
  // Message routes
  getConversationMessages: messageMessageController.getConversationMessages,
  sendMessage: messageMessageController.sendMessage,
  editMessage: messageMessageController.editMessage,
  deleteMessage: messageMessageController.deleteMessage,
  addReaction: messageMessageController.addReaction,
  removeReaction: messageMessageController.removeReaction,
  pinMessage: messageMessageController.pinMessage,
  unpinMessage: messageMessageController.unpinMessage,
  reportMessage: messageMessageController.reportMessage,
  searchMessages: messageMessageController.searchMessages,
  shareProduct: messageMessageController.shareProduct,
  sendQuote: messageMessageController.sendQuote,
  
  // Stats routes
  getMessagingStats: messageStatsController.getMessagingStats,
  
  // Admin routes
  getAllConversations: messageAdminController.getAllConversations,
  getGlobalMessagingStats: messageAdminController.getGlobalMessagingStats,
  cleanupInactiveConversations: messageAdminController.cleanupInactiveConversations
};

