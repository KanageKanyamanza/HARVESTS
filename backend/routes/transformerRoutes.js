const express = require('express');
const transformerController = require('../controllers/transformerController');
const authMiddleware = require('../controllers/auth/authMiddleware');
const { uploadLimiter, fileTypeValidation, fileSizeValidation } = require('../middleware/security');

/**
 * @swagger
 * tags:
 *   name: Transformers
 *   description: 🏭 Gestion des transformateurs
 */

const router = express.Router();

/**
 * @swagger
 * /api/v1/transformers:
 *   get:
 *     summary: Obtenir tous les transformateurs (public)
 *     tags: [Transformers]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des transformateurs
 */
router.get('/', transformerController.getAllTransformers);

/**
 * @swagger
 * /api/v1/transformers/search:
 *   get:
 *     summary: Rechercher des transformateurs
 *     tags: [Transformers]
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
router.get('/search', transformerController.searchTransformers);

/**
 * @swagger
 * /api/v1/transformers/by-region/{region}:
 *   get:
 *     summary: Obtenir les transformateurs par région
 *     tags: [Transformers]
 *     parameters:
 *       - in: path
 *         name: region
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des transformateurs de la région
 */
router.get('/by-region/:region', transformerController.getTransformersByRegion);

/**
 * @swagger
 * /api/v1/transformers/by-type/{type}:
 *   get:
 *     summary: Obtenir les transformateurs par type
 *     tags: [Transformers]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des transformateurs du type
 */
router.get('/by-type/:type', transformerController.getTransformersByType);
router.get('/:id/public', transformerController.getPublicTransformer);
router.get('/:id/services', transformerController.getTransformerServices);
// Route pour les avis d'un transformateur spécifique (avec gestion spéciale pour "me")
router.get('/:id/reviews', (req, res, next) => {
  if (req.params.id === 'me') {
    // Appliquer l'authentification pour la route /me/reviews
    return authMiddleware.protect(req, res, () => {
      authMiddleware.restrictTo('transformer')(req, res, () => {
        authMiddleware.requireVerification(req, res, () => {
          transformerController.getMyReviews(req, res, next);
        });
      });
    });
  }
  // Continuer vers la route publique
  transformerController.getTransformerReviews(req, res, next);
});
// Route publique pour les produits d'un transformateur spécifique (sans authentification)
// Vérifier si l'ID est "me" et appliquer l'authentification
router.get('/:id/products', (req, res, next) => {
  if (req.params.id === 'me') {
    // Appliquer l'authentification pour la route /me/products
    return authMiddleware.protect(req, res, () => {
      authMiddleware.restrictTo('transformer')(req, res, () => {
        authMiddleware.requireVerification(req, res, () => {
          transformerController.getMyProducts(req, res, next);
        });
      });
    });
  }
  // Continuer vers la route publique
  transformerController.getPublicProducts(req, res, next);
});
// Route générique /:id doit être en dernier pour éviter de capturer les routes spécifiques
router.get('/:id', transformerController.getTransformer);

// Toutes les routes suivantes nécessitent une authentification
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('transformer'));
router.use(authMiddleware.requireVerification);
router.use(authMiddleware.checkApprovalStatus); // Vérifier le statut d'approbation

// Routes accessibles même sans approbation (dashboard, profil)
router.get('/me/profile', transformerController.getMyProfile);
router.patch('/me/profile', transformerController.updateMyProfile);
router.get('/me/business-stats', transformerController.getBusinessStats);
router.get('/me/stats', transformerController.getBusinessStats); // Alias pour compatibilité avec GenericDashboard
router.get('/me/production-analytics', transformerController.getProductionAnalytics);
// Route /me/reviews gérée par la route générique /:id/reviews ci-dessus
router.patch('/me/reviews/:reviewId/read', transformerController.markReviewAsRead);
router.patch('/me/reviews/read-all', transformerController.markAllReviewsAsRead);
router.get('/me/notifications', transformerController.getNotifications);
router.get('/me/documents', transformerController.getMyDocuments);

// Gestion des produits de la boutique (accessible sans approbation)
router.route('/me/products')
  .get(transformerController.getMyProducts)
  .post(transformerController.createProduct);

router.route('/me/products/:productId')
  .get(transformerController.getProduct)
  .patch(transformerController.updateProduct)
  .delete(transformerController.deleteProduct);

// Soumettre un produit pour révision
router.patch('/me/products/:productId/submit', transformerController.submitProductForReview);


// Routes nécessitant une approbation (opérations sensibles)
router.use(authMiddleware.requireApproval); // Appliquer l'approbation aux routes suivantes

// Gestion des informations de l'entreprise
router.route('/me/company-info')
  .get(transformerController.getCompanyInfo)
  .patch(transformerController.updateCompanyInfo);


// Gestion des certifications
router.route('/me/certifications')
  .get(transformerController.getMyCertifications)
  .post(
    uploadLimiter,
    transformerController.uploadCertificationDocument,
    fileTypeValidation(['application/pdf', 'image/jpeg', 'image/png']),
    fileSizeValidation(10 * 1024 * 1024), // 10MB
    transformerController.addCertification
  );

router.route('/me/certifications/:certId')
  .patch(transformerController.updateCertification)
  .delete(transformerController.removeCertification);



// Gestion des fournisseurs préférés
router.route('/me/preferred-suppliers')
  .get(transformerController.getPreferredSuppliers)
  .post(transformerController.addPreferredSupplier);

router.route('/me/preferred-suppliers/:supplierId')
  .patch(transformerController.updateSupplierPreference)
  .delete(transformerController.removePreferredSupplier);

// Gestion des commandes de transformation
router.route('/me/orders')
  .get(transformerController.getMyOrders)
  .post(transformerController.acceptOrder);

router.route('/me/orders/:orderId')
  .get(transformerController.getMyOrder)
  .patch(transformerController.updateOrderStatus)
  .delete(transformerController.cancelOrder);

// Suivi des commandes de transformation
router.get('/me/orders/:orderId/tracking', transformerController.trackOrder);
router.patch('/me/orders/:orderId/progress', transformerController.updateOrderProgress);



// Statistiques et analytics
router.get('/me/business-stats', transformerController.getBusinessStats);
router.get('/me/production-analytics', transformerController.getProductionAnalytics);
router.get('/me/efficiency-metrics', transformerController.getEfficiencyMetrics);
router.get('/me/revenue-analytics', transformerController.getRevenueAnalytics);


// Évaluations et avis

// Répondre aux avis clients
router.patch('/me/reviews/:reviewId/response', transformerController.respondToReview);

// Gestion des réclamations
router.route('/me/complaints')
  .get(transformerController.getComplaints)
  .post(transformerController.handleComplaint);

router.route('/me/complaints/:complaintId')
  .patch(transformerController.updateComplaint);

// Documents légaux
router.route('/me/documents')
  .get(transformerController.getMyDocuments)
  .post(
    uploadLimiter,
    transformerController.uploadDocument,
    fileTypeValidation(['application/pdf', 'image/jpeg', 'image/png']),
    fileSizeValidation(10 * 1024 * 1024), // 10MB
    transformerController.addDocument
  );


// Routes d'upload supprimées - utiliser le système d'upload existant

// Notifications et alertes
router.route('/me/notifications')
  .get(transformerController.getNotifications)
  .patch(transformerController.markNotificationsAsRead);

// Alertes de production
router.route('/me/production-alerts')
  .get(transformerController.getProductionAlerts)
  .post(transformerController.createProductionAlert);

// Rapports de conformité
router.get('/me/compliance-reports', transformerController.getComplianceReports);
router.post('/me/compliance-reports', transformerController.generateComplianceReport);


module.exports = router;
