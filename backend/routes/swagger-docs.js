/**
 * Documentation Swagger complémentaire pour les routes
 * Ce fichier contient les annotations Swagger manquantes
 * qui seront automatiquement incluses par swagger-jsdoc
 */

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: 📦 Gestion des commandes
 *   - name: Payments
 *     description: 💳 Paiements (Wave, Stripe, PayPal)
 *   - name: Users
 *     description: 👥 Gestion des utilisateurs
 *   - name: Profiles
 *     description: 👤 Profils utilisateurs centralisés
 *   - name: Reviews
 *     description: ⭐ Avis et évaluations
 *   - name: Messages
 *     description: 💬 Messagerie et conversations
 *   - name: Notifications
 *     description: 🔔 Notifications multi-canaux
 *   - name: Blog
 *     description: 📝 Blog et articles
 *   - name: Upload
 *     description: 📸 Upload d'images (Cloudinary)
 *   - name: Subscriptions
 *     description: 📋 Abonnements
 */

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Obtenir mes commandes
 *     description: Liste toutes les commandes de l'utilisateur connecté
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, preparing, ready-for-pickup, in-transit, delivered, cancelled, refunded]
 *         description: Filtrer par statut
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Liste des commandes
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     summary: Créer une nouvelle commande
 *     description: Créer une commande avec les produits sélectionnés
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
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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

/**
 * @swagger
 * /api/v1/payments/initiate:
 *   post:
 *     summary: Initier un paiement
 *     description: Créer une transaction de paiement pour une commande
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - method
 *               - amount
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: objectId
 *               method:
 *                 type: string
 *                 enum: [wave, orange-money, stripe, paypal]
 *               amount:
 *                 type: number
 *               phone:
 *                 type: string
 *                 description: Requis pour Wave et Orange Money
 *                 example: "+221771234567"
 *     responses:
 *       201:
 *         description: Paiement initié
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */

/**
 * @swagger
 * /api/v1/payments/{id}:
 *   get:
 *     summary: Obtenir un paiement spécifique
 *     tags: [Payments]
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
 *         description: Détails du paiement
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Obtenir mon profil utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *   patch:
 *     summary: Mettre à jour mon profil
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: object
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil mis à jour
 */

/**
 * @swagger
 * /api/v1/profiles/me:
 *   get:
 *     summary: Obtenir mon profil (service centralisé)
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *   patch:
 *     summary: Mettre à jour mon profil (service centralisé)
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profil mis à jour
 */

/**
 * @swagger
 * /api/v1/profiles/me/avatar:
 *   patch:
 *     summary: Upload avatar de profil
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploadé avec succès
 */

/**
 * @swagger
 * /api/v1/reviews:
 *   get:
 *     summary: Obtenir tous les avis
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: product
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Filtrer par produit
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Filtrer par utilisateur
 *     responses:
 *       200:
 *         description: Liste des avis
 *   post:
 *     summary: Créer un avis
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - product
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *               comment:
 *                 type: string
 *               product:
 *                 type: string
 *                 format: objectId
 *     responses:
 *       201:
 *         description: Avis créé
 */

/**
 * @swagger
 * /api/v1/messages:
 *   get:
 *     summary: Obtenir mes conversations
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des conversations
 *   post:
 *     summary: Créer une conversation ou envoyer un message
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
 *         description: Message envoyé
 */

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Obtenir mes notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unread
 *         schema:
 *           type: boolean
 *         description: Filtrer les non lues
 *     responses:
 *       200:
 *         description: Liste des notifications
 */

/**
 * @swagger
 * /api/v1/blogs:
 *   get:
 *     summary: Obtenir tous les articles de blog
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: Filtrer par statut
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des articles
 *   post:
 *     summary: Créer un article de blog (Admin)
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Article créé
 */

/**
 * @swagger
 * /api/v1/upload/image:
 *   post:
 *     summary: Upload une image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 example: products
 *     responses:
 *       200:
 *         description: Image uploadée avec succès
 */

module.exports = {};

