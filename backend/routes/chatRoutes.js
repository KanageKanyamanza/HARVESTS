const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../controllers/auth/authMiddleware');
const adminAuthController = require('../controllers/adminAuthController');

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
router.get('/search-products', chatController.searchProducts);

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
router.get('/search-sellers', chatController.searchSellers);

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
router.get('/search-transporters', chatController.searchTransporters);
router.get('/categories', chatController.getCategories);
router.get('/custom-answers', chatController.getCustomAnswers);

// Routes avec authentification optionnelle (public pour l'instant)
router.get('/track/:orderNumber', chatController.trackOrder);

// Tracking des interactions (public mais enregistre l'utilisateur si connecté)
router.post('/log-interaction', chatController.logInteraction);
router.post('/log-feedback', chatController.logFeedback);

// Routes protégées (utilisateur connecté)
router.get('/my-orders', protect, chatController.getMyRecentOrders);

// ========================================
// ROUTES ADMIN
// ========================================
router.use('/admin', adminAuthController.protect);

// Questions sans réponse
router.get('/admin/unanswered', chatController.getUnansweredQuestions);
router.patch('/admin/unanswered/:id/answer', chatController.answerQuestion);
router.patch('/admin/unanswered/:id/ignore', chatController.ignoreQuestion);

// Statistiques
router.get('/admin/stats', chatController.getChatStats);

// Toutes les interactions avec filtres
router.get('/admin/interactions', chatController.getAllInteractions);

// Historique utilisateur
router.get('/admin/user/:userId/history', chatController.getUserChatHistory);

module.exports = router;

