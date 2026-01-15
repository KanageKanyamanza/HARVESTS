const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { protect } = require("../controllers/auth/authMiddleware");
const adminAuthController = require("../controllers/adminAuthController");

/**
 * @swagger
 * /api/v1/chat/search-products:
 *   get:
 *     summary: Recherche de produits pour le chatbot (avec détection géographique)
 *     description: |
 *       Recherche intelligente pour le chatbot avec :
 *       - **Gestion pluriel/singulier** : "tomates" trouve "tomate"
 *       - **Détection automatique de localisation** : "tomates à Dakar" filtre par ville
 *       - **Recherche flexible** : Insensible à la casse et accents
 *     tags: [Chat]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: |
 *           Terme de recherche. Peut inclure une localisation :
 *           - "tomates" → recherche flexible
 *           - "tomates à Dakar" → filtre par localisation
 *           - "Dakar" → tous les produits de Dakar
 *         example: "tomates à Dakar"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Nombre de résultats maximum
 *     responses:
 *       200:
 *         description: Produits trouvés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: number
 *                   example: 5
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                           images:
 *                             type: array
 *                           category:
 *                             type: string
 *                     location:
 *                       type: object
 *                       nullable: true
 *                       description: Localisation détectée dans la recherche
 *                       properties:
 *                         city:
 *                           type: string
 *                           example: "dakar"
 *                         region:
 *                           type: string
 *                           nullable: true
 *       400:
 *         description: Terme de recherche trop court (minimum 2 caractères)
 */
router.get("/search-products", chatController.searchProducts);

/**
 * @swagger
 * /api/v1/chat/message:
 *   post:
 *     summary: Envoyer un message au chatbot (NLP)
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *               context:
 *                 type: object
 *     responses:
 *       200:
 *         description: Réponse du chatbot
 */
router.post("/message", chatController.processMessage);

/**
 * @swagger
 * /api/v1/chat/search-sellers:
 *   get:
 *     summary: Recherche de vendeurs pour le chatbot (avec détection géographique)
 *     description: |
 *       Recherche de producteurs, transformateurs et restaurateurs avec :
 *       - **Détection automatique de localisation** : "producteurs Yaoundé" filtre par ville
 *       - **Recherche flexible** : Nom, ferme, entreprise
 *     tags: [Chat]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: |
 *           Terme de recherche. Peut inclure une localisation :
 *           - "producteurs" → tous les producteurs
 *           - "producteurs Yaoundé" → producteurs de Yaoundé
 *           - "Yaoundé" → tous les vendeurs de Yaoundé
 *         example: "producteurs Yaoundé"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Nombre de résultats maximum
 *     responses:
 *       200:
 *         description: Vendeurs trouvés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: number
 *                   example: 3
 *                 data:
 *                   type: object
 *                   properties:
 *                     sellers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           farmName:
 *                             type: string
 *                           companyName:
 *                             type: string
 *                           userType:
 *                             type: string
 *                           address:
 *                             type: object
 *                           city:
 *                             type: string
 *                           region:
 *                             type: string
 *                     location:
 *                       type: object
 *                       nullable: true
 *                       description: Localisation détectée dans la recherche
 *       400:
 *         description: Terme de recherche trop court (minimum 2 caractères)
 */
router.get("/search-sellers", chatController.searchSellers);

/**
 * @swagger
 * /api/v1/chat/search-transporters:
 *   get:
 *     summary: Recherche de transporteurs pour le chatbot (avec détection géographique)
 *     description: |
 *       Recherche de transporteurs et exportateurs avec :
 *       - **Détection automatique de localisation** : "transporteurs Douala" filtre par ville
 *       - **Recherche dans zones de service** : Cherche aussi dans serviceAreas
 *     tags: [Chat]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: |
 *           Terme de recherche. Peut inclure une localisation :
 *           - "transporteurs" → tous les transporteurs
 *           - "transporteurs Douala" → transporteurs de Douala
 *           - "Douala" → tous les transporteurs de Douala
 *         example: "transporteurs Douala"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Nombre de résultats maximum
 *     responses:
 *       200:
 *         description: Transporteurs trouvés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: number
 *                   example: 2
 *                 data:
 *                   type: object
 *                   properties:
 *                     transporters:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           companyName:
 *                             type: string
 *                           userType:
 *                             type: string
 *                           address:
 *                             type: object
 *                           serviceAreas:
 *                             type: array
 *                           city:
 *                             type: string
 *                           region:
 *                             type: string
 *                     location:
 *                       type: object
 *                       nullable: true
 *                       description: Localisation détectée dans la recherche
 *       400:
 *         description: Terme de recherche trop court (minimum 2 caractères)
 */
router.get("/search-transporters", chatController.searchTransporters);

/**
 * @swagger
 * /api/v1/chat/categories:
 *   get:
 *     summary: Obtenir toutes les catégories de produits
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: Liste des catégories
 */
router.get("/categories", chatController.getCategories);

/**
 * @swagger
 * /api/v1/chat/custom-answers:
 *   get:
 *     summary: Obtenir les réponses personnalisées du chatbot
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: Réponses personnalisées
 */
router.get("/custom-answers", chatController.getCustomAnswers);

/**
 * @swagger
 * /api/v1/chat/track/{orderNumber}:
 *   get:
 *     summary: Suivre une commande par numéro
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         example: HRV-SN-2025-001
 *     responses:
 *       200:
 *         description: Informations de suivi
 *       404:
 *         description: Commande non trouvée
 */
router.get("/track/:orderNumber", chatController.trackOrder);

/**
 * @swagger
 * /api/v1/chat/log-interaction:
 *   post:
 *     summary: Enregistrer une interaction avec le chatbot
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *               response:
 *                 type: string
 *               intent:
 *                 type: string
 *     responses:
 *       200:
 *         description: Interaction enregistrée
 */
router.post("/log-interaction", chatController.logInteraction);

/**
 * @swagger
 * /api/v1/chat/log-feedback:
 *   post:
 *     summary: Enregistrer un feedback sur le chatbot
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               helpful:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Feedback enregistré
 */
router.post("/log-feedback", chatController.logFeedback);

/**
 * @swagger
 * /api/v1/chat/my-orders:
 *   get:
 *     summary: Obtenir mes commandes récentes (utilisateur connecté)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Liste des commandes récentes
 */
router.get("/my-orders", protect, chatController.getMyRecentOrders);

// ========================================
// ROUTES ADMIN
// ========================================
router.use("/admin", adminAuthController.protect);

/**
 * @swagger
 * /api/v1/chat/admin/unanswered:
 *   get:
 *     summary: Obtenir les questions sans réponse (Admin)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des questions sans réponse
 */
router.get("/admin/unanswered", chatController.getUnansweredQuestions);

/**
 * @swagger
 * /api/v1/chat/admin/unanswered/{id}/answer:
 *   patch:
 *     summary: Répondre à une question (Admin)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answer
 *             properties:
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Question répondue
 */
router.patch("/admin/unanswered/:id/answer", chatController.answerQuestion);

/**
 * @swagger
 * /api/v1/chat/admin/unanswered/{id}/ignore:
 *   patch:
 *     summary: Ignorer une question (Admin)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     responses:
 *       200:
 *         description: Question ignorée
 */
router.patch("/admin/unanswered/:id/ignore", chatController.ignoreQuestion);

/**
 * @swagger
 * /api/v1/chat/admin/stats:
 *   get:
 *     summary: Obtenir les statistiques du chatbot (Admin)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques du chatbot
 */
router.get("/admin/stats", chatController.getChatStats);

/**
 * @swagger
 * /api/v1/chat/admin/interactions:
 *   get:
 *     summary: Obtenir toutes les interactions (Admin)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des interactions
 */
router.get("/admin/interactions", chatController.getAllInteractions);

/**
 * @swagger
 * /api/v1/chat/admin/user/{userId}/history:
 *   get:
 *     summary: Obtenir l'historique de chat d'un utilisateur (Admin)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     responses:
 *       200:
 *         description: Historique de chat
 */
// Routes Gestion FAQs
router.get("/admin/faqs", chatController.getFaqs);
router.post("/admin/faqs", chatController.createFaq);
router.patch("/admin/faqs/:id", chatController.updateFaq);
router.delete("/admin/faqs/:id", chatController.deleteFaq);

module.exports = router;
