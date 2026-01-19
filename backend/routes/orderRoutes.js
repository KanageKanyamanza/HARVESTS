const express = require("express");
const orderController = require("../controllers/orderController");
const authMiddleware = require("../controllers/auth/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: 📦 Gestion des commandes
 */

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware.protect);

/**
 * @swagger
 * /api/v1/orders/my:
 *   get:
 *     summary: Obtenir mes commandes
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, preparing, ready-for-pickup, in-transit, delivered, cancelled, refunded]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Liste des commandes
 */
router.get("/my", orderController.getMyOrders);

/**
 * @swagger
 * /api/v1/orders/{id}/tracking:
 *   get:
 *     summary: Suivre une commande
 *     tags: [Orders]
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
 *         description: Informations de suivi
 */
router.get("/:id/tracking", orderController.trackOrder);

/**
 * @swagger
 * /api/v1/orders/{id}/invoice:
 *   get:
 *     summary: Générer une facture PDF pour une commande
 *     tags: [Orders]
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
 *         description: Facture PDF générée
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Commande non trouvée
 */
router.get("/:id/invoice", orderController.generateInvoice);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Obtenir une commande spécifique
 *     tags: [Orders]
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
 *         description: Détails de la commande
 */
router.get("/:id", orderController.getOrder);

/**
 * @swagger
 * /api/v1/orders/estimate:
 *   post:
 *     summary: Estimer les coûts d'une commande
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *               deliveryAddress:
 *                 type: object
 *     responses:
 *       200:
 *         description: Estimation des coûts
 */
router.post("/estimate", orderController.estimateOrderCosts);

// Routes d'écriture (nécessitent une vérification d'email)
router.use(authMiddleware.requireVerification);

// ROUTES COMMUNES

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Créer une nouvelle commande
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - product
 *                     - quantity
 *                   properties:
 *                     product:
 *                       type: string
 *                       format: objectId
 *                     variant:
 *                       type: string
 *                       format: objectId
 *                     quantity:
 *                       type: number
 *                       minimum: 1
 *               deliveryAddress:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   region:
 *                     type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, wave, orange-money, stripe, paypal]
 *     responses:
 *       201:
 *         description: Commande créée avec succès
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post("/", orderController.createOrder);

// Ces routes sont maintenant définies avant requireVerification

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   patch:
 *     summary: Mettre à jour le statut d'une commande
 *     tags: [Orders]
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
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, preparing, ready-for-pickup, in-transit, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Statut mis à jour
 */
router.patch("/:id/status", orderController.updateOrderStatus);

// Annuler une commande
router.patch("/:id/cancel", orderController.cancelOrder);

// Cette route est maintenant définie avant requireVerification

// ROUTES ADMIN

router.use(authMiddleware.restrictTo("admin"));

// Obtenir toutes les commandes
router.get("/", orderController.getAllOrders);

// Statistiques des commandes
router.get("/stats/overview", orderController.getOrderStats);

module.exports = router;
