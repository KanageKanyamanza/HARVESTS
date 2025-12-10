const express = require('express');
const producerController = require('../controllers/producerController');
const authMiddleware = require('../controllers/auth/authMiddleware');
const { uploadLimiter, fileTypeValidation, fileSizeValidation } = require('../middleware/security');

/**
 * @swagger
 * tags:
 *   name: Producers
 *   description: 👨‍🌾 Gestion des producteurs
 */

const router = express.Router();

// ========================================
// ROUTES PUBLIQUES (sans authentification)
// ========================================

/**
 * @swagger
 * /api/v1/producers:
 *   get:
 *     summary: Obtenir tous les producteurs (public)
 *     tags: [Producers]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *       - in: query
 *         name: farmingType
 *         schema:
 *           type: string
 *           enum: [organic, conventional, mixed]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des producteurs
 */
router.get('/', producerController.getAllProducers);

/**
 * @swagger
 * /api/v1/producers/search:
 *   get:
 *     summary: Rechercher des producteurs
 *     tags: [Producers]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Résultats de recherche
 */
router.get('/search', producerController.searchProducers);

/**
 * @swagger
 * /api/v1/producers/by-region/{region}:
 *   get:
 *     summary: Obtenir les producteurs par région
 *     tags: [Producers]
 *     parameters:
 *       - in: path
 *         name: region
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des producteurs de la région
 */
router.get('/by-region/:region', producerController.getProducersByRegion);

/**
 * @swagger
 * /api/v1/producers/by-crop/{crop}:
 *   get:
 *     summary: Obtenir les producteurs par culture
 *     tags: [Producers]
 *     parameters:
 *       - in: path
 *         name: crop
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des producteurs pour cette culture
 */
router.get('/by-crop/:crop', producerController.getProducersByCrop);

/**
 * @swagger
 * /api/v1/producers/{id}:
 *   get:
 *     summary: Obtenir un producteur spécifique (public)
 *     tags: [Producers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     responses:
 *       200:
 *         description: Détails du producteur
 */
router.get('/:id([0-9a-fA-F]{24})', producerController.getProducer);

/**
 * @swagger
 * /api/v1/producers/{id}/products:
 *   get:
 *     summary: Obtenir les produits d'un producteur (public)
 *     tags: [Producers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     responses:
 *       200:
 *         description: Liste des produits
 */
router.get('/:id([0-9a-fA-F]{24})/products', producerController.getProducerProducts);

/**
 * @swagger
 * /api/v1/producers/{id}/reviews:
 *   get:
 *     summary: Obtenir les avis d'un producteur (public)
 *     tags: [Producers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     responses:
 *       200:
 *         description: Liste des avis
 */
router.get('/:id([0-9a-fA-F]{24})/reviews', producerController.getProducerReviews);

// ========================================
// ROUTES PRIVÉES (avec authentification)
// ========================================

// Toutes les routes suivantes nécessitent une authentification
router.use(authMiddleware.protect);

// Routes pour les producteurs seulement
router.use(authMiddleware.restrictTo('producer'));

/**
 * @swagger
 * /api/v1/producers/me/stats:
 *   get:
 *     summary: Obtenir mes statistiques (Producteur)
 *     tags: [Producers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques du producteur
 */
router.get('/me/stats', producerController.getMyStats);

/**
 * @swagger
 * /api/v1/producers/me/products:
 *   get:
 *     summary: Obtenir mes produits (Producteur)
 *     tags: [Producers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de mes produits
 */
router.get('/me/products', producerController.getMyProducts);

/**
 * @swagger
 * /api/v1/producers/me/orders:
 *   get:
 *     summary: Obtenir mes commandes (Producteur)
 *     tags: [Producers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de mes commandes
 */
router.get('/me/orders', producerController.getMyOrders);

// Toutes les autres routes nécessitent une vérification d'email
router.use(authMiddleware.requireVerification);

// Routes protégées pour les producteurs connectés (/me/*)

// Gestion du profil producteur
router.get('/me/profile', producerController.getMyProfile);
router.patch('/me/profile', producerController.updateMyProfile);


// Gestion des certifications
router.route('/me/certifications')
  .get(producerController.getMyCertifications)
  .post(
    uploadLimiter,
    producerController.uploadCertificationDocument,
    fileTypeValidation(['application/pdf', 'image/jpeg', 'image/png']),
    fileSizeValidation(10 * 1024 * 1024), // 10MB
    producerController.addCertification
  );

router.route('/me/certifications/:certId')
  .patch(producerController.updateCertification)
  .delete(producerController.removeCertification);


// Gestion des produits (création, modification, suppression nécessitent vérification)
router.route('/me/products')
  .post(
    uploadLimiter,
    producerController.uploadProductImages,
    producerController.processProductImages,
    fileTypeValidation(['image/jpeg', 'image/png', 'image/webp']),
    fileSizeValidation(5 * 1024 * 1024), // 5MB par image
    producerController.createProduct
  );

router.route('/me/products/:productId')
  .get(producerController.getMyProduct)
  .patch(producerController.updateMyProduct)
  .delete(producerController.deleteMyProduct);

// Gestion des commandes (modification nécessite vérification)
router.get('/me/orders/:orderId', producerController.getMyOrder);
router.patch('/me/orders/:orderId/status', producerController.updateOrderStatus);
router.get('/me/stats', producerController.getStats);
router.get('/me/sales-analytics', producerController.getSalesAnalytics);
router.get('/me/revenue-analytics', producerController.getRevenueAnalytics);

// Gestion des transporteurs préférés
router.route('/me/preferred-transporters')
  .get(producerController.getPreferredTransporters)
  .post(producerController.addPreferredTransporter);

router.delete('/me/preferred-transporters/:transporterId', producerController.removePreferredTransporter);

// Documents et vérifications
router.route('/me/documents')
  .get(producerController.getMyDocuments)
  .post(
    uploadLimiter,
    producerController.uploadDocument,
    fileTypeValidation(['application/pdf', 'image/jpeg', 'image/png']),
    fileSizeValidation(10 * 1024 * 1024), // 10MB
    producerController.addDocument
  );

// Paramètres de livraison
router.route('/me/delivery-settings')
  .get(producerController.getDeliverySettings)
  .patch(producerController.updateDeliverySettings);

module.exports = router;
