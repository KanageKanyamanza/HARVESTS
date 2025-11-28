const express = require('express');
const producerController = require('../controllers/producerController');
const authMiddleware = require('../controllers/auth/authMiddleware');
const { uploadLimiter, fileTypeValidation, fileSizeValidation } = require('../middleware/security');

const router = express.Router();

// ========================================
// ROUTES PUBLIQUES (sans authentification)
// ========================================

// Routes de recherche de producteurs
router.get('/', producerController.getAllProducers);
router.get('/search', producerController.searchProducers);
router.get('/by-region/:region', producerController.getProducersByRegion);
router.get('/by-crop/:crop', producerController.getProducersByCrop);

// Routes publiques pour un producteur spécifique (doivent être après /me/*)
// Ces routes utilisent des paramètres ObjectId valides
router.get('/:id([0-9a-fA-F]{24})', producerController.getProducer);
router.get('/:id([0-9a-fA-F]{24})/products', producerController.getProducerProducts);
router.get('/:id([0-9a-fA-F]{24})/reviews', producerController.getProducerReviews);

// ========================================
// ROUTES PRIVÉES (avec authentification)
// ========================================

// Toutes les routes suivantes nécessitent une authentification
router.use(authMiddleware.protect);

// Routes pour les producteurs seulement
router.use(authMiddleware.restrictTo('producer'));

// Routes de lecture qui ne nécessitent pas de vérification d'email
router.get('/me/stats', producerController.getMyStats);
router.get('/me/products', producerController.getMyProducts);
router.get('/me/orders', producerController.getMyOrders);

// Toutes les autres routes nécessitent une vérification d'email
router.use(authMiddleware.requireVerification);

// Routes protégées pour les producteurs connectés (/me/*)

// Gestion du profil producteur
router.get('/me/profile', producerController.getMyProfile);
router.patch('/me/profile', producerController.updateMyProfile);

// Gestion des cultures
router.route('/me/crops')
  .get(producerController.getMyCrops)
  .post(producerController.addCrop);

router.route('/me/crops/:cropId')
  .patch(producerController.updateCrop)
  .delete(producerController.removeCrop);

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

// Gestion des équipements
router.route('/me/equipment')
  .get(producerController.getMyEquipment)
  .post(producerController.addEquipment);

router.route('/me/equipment/:equipmentId')
  .patch(producerController.updateEquipment)
  .delete(producerController.removeEquipment);

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
