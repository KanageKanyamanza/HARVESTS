const express = require('express');
const messageController = require('../controllers/messageController');
const authController = require('../controllers/authController');
const { uploadLimiter, fileTypeValidation, fileSizeValidation } = require('../middleware/security');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authController.protect);
router.use(authController.requireVerification);

// ROUTES DES CONVERSATIONS

// Obtenir mes conversations
router.get('/conversations', messageController.getMyConversations);

// Créer une nouvelle conversation
router.post('/conversations', messageController.createConversation);

// Obtenir une conversation spécifique
router.get('/conversations/:id', messageController.getConversation);

// Obtenir les messages d'une conversation
router.get('/conversations/:id/messages', messageController.getConversationMessages);

// Envoyer un message dans une conversation
router.post('/conversations/:id/messages',
  uploadLimiter,
  messageController.uploadAttachments,
  fileTypeValidation([
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'audio/mpeg', 'audio/wav', 'video/mp4', 'video/webm'
  ]),
  fileSizeValidation(25 * 1024 * 1024), // 25MB
  messageController.processAttachments,
  messageController.sendMessage
);

// Marquer une conversation comme lue
router.patch('/conversations/:id/read', messageController.markConversationAsRead);

// Gestion des participants (conversations de groupe)
router.post('/conversations/:id/participants', messageController.addParticipant);
router.delete('/conversations/:id/participants/:userId', messageController.removeParticipant);

// Quitter une conversation
router.post('/conversations/:id/leave', messageController.leaveConversation);

// Archiver/désarchiver une conversation
router.patch('/conversations/:id/archive', messageController.archiveConversation);
router.patch('/conversations/:id/unarchive', messageController.unarchiveConversation);

// ROUTES DES MESSAGES

// Modifier un message
router.patch('/conversations/:id/messages/:messageId', messageController.editMessage);

// Supprimer un message
router.delete('/conversations/:id/messages/:messageId', messageController.deleteMessage);

// Réactions aux messages
router.post('/conversations/:id/messages/:messageId/reactions', messageController.addReaction);
router.delete('/conversations/:id/messages/:messageId/reactions', messageController.removeReaction);

// Épingler/désépingler un message
router.patch('/conversations/:id/messages/:messageId/pin', messageController.pinMessage);
router.patch('/conversations/:id/messages/:messageId/unpin', messageController.unpinMessage);

// Signaler un message
router.post('/conversations/:id/messages/:messageId/report', messageController.reportMessage);

// FONCTIONS SPÉCIALISÉES

// Partager un produit dans une conversation
router.post('/conversations/:id/share-product', messageController.shareProduct);

// Envoyer un devis dans une conversation
router.post('/conversations/:id/quote', 
  authController.restrictTo('producer', 'transformer', 'exporter'),
  messageController.sendQuote
);

// RECHERCHE

// Rechercher dans les messages
router.get('/search', messageController.searchMessages);

// STATISTIQUES

// Mes statistiques de messagerie
router.get('/my/stats', messageController.getMessagingStats);

// ROUTES ADMIN

router.use(authController.restrictTo('admin'));

// Obtenir toutes les conversations
router.get('/admin/conversations', messageController.getAllConversations);

// Statistiques globales de messagerie
router.get('/admin/stats', messageController.getGlobalMessagingStats);

// Nettoyer les conversations inactives
router.post('/admin/cleanup-inactive', messageController.cleanupInactiveConversations);

module.exports = router;
