const express = require('express');
const producerController = require('../controllers/producerController');
const authMiddleware = require('../controllers/auth/authMiddleware');
const { uploadLimiter, fileTypeValidation, fileSizeValidation } = require('../middleware/security');

const router = express.Router();

// ========================================
// ROUTES PRIVÉES POUR PRODUCTEURS
// ========================================

// Toutes les routes nécessitent une authentification
router.use(authMiddleware.protect);

// Routes pour les producteurs seulement
router.use(authMiddleware.restrictTo('producer'));
router.use(authMiddleware.requireVerification);

// Gestion du profil producteur
router.get('/me/profile', producerController.getMyProfile);
router.patch('/me/profile', producerController.updateMyProfile);

// Gestion des cultures

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

// Gestion des produits
router.route('/me/products')
  .get(producerController.getMyProducts)
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

// Gestion des commandes
router.get('/me/orders', producerController.getMyOrders);
router.get('/me/orders/:orderId', producerController.getMyOrder);
router.patch('/me/orders/:orderId/status', producerController.updateOrderStatus);

// Statistiques et analytics
router.get('/me/stats', producerController.getMyStats);
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
