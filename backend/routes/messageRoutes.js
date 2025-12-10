const express = require('express');
const messageController = require('../controllers/messageController');
const authMiddleware = require('../controllers/auth/authMiddleware');
const { uploadLimiter, fileTypeValidation, fileSizeValidation } = require('../middleware/security');

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: 💬 Messagerie et conversations
 */

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware.protect);
router.use(authMiddleware.requireVerification);

// ROUTES DES CONVERSATIONS

/**
 * @swagger
 * /api/v1/messages/conversations:
 *   get:
 *     summary: Obtenir mes conversations
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des conversations
 */
router.get('/conversations', messageController.getMyConversations);

/**
 * @swagger
 * /api/v1/messages/conversations:
 *   post:
 *     summary: Créer une nouvelle conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipient
 *               - content
 *             properties:
 *               recipient:
 *                 type: string
 *                 format: objectId
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conversation créée
 */
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
  authMiddleware.restrictTo('producer', 'transformer', 'exporter'),
  messageController.sendQuote
);

// RECHERCHE

// Rechercher dans les messages
router.get('/search', messageController.searchMessages);

// STATISTIQUES

// Mes statistiques de messagerie
router.get('/my/stats', messageController.getMessagingStats);

// ROUTES ADMIN

router.use(authMiddleware.restrictTo('admin'));

// Obtenir toutes les conversations
router.get('/admin/conversations', messageController.getAllConversations);

// Statistiques globales de messagerie
router.get('/admin/stats', messageController.getGlobalMessagingStats);

// Nettoyer les conversations inactives
router.post('/admin/cleanup-inactive', messageController.cleanupInactiveConversations);

module.exports = router;
