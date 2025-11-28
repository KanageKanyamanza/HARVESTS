const express = require('express');
const transformerController = require('../controllers/transformerController');
const authMiddleware = require('../controllers/auth/authMiddleware');
const { uploadLimiter, fileTypeValidation, fileSizeValidation } = require('../middleware/security');

const router = express.Router();

// Routes publiques pour recherche de transformateurs
router.get('/', transformerController.getAllTransformers);
router.get('/search', transformerController.searchTransformers);
router.get('/by-region/:region', transformerController.getTransformersByRegion);
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
router.get('/me/production-batches', transformerController.getProductionBatches);
router.get('/me/production-batches/:batchId', transformerController.getProductionBatch);
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

// Gestion des capacités de transformation
router.route('/me/processing-capabilities')
  .get(transformerController.getProcessingCapabilities)
  .post(transformerController.addProcessingCapability);

router.route('/me/processing-capabilities/:capabilityId')
  .patch(transformerController.updateProcessingCapability)
  .delete(transformerController.removeProcessingCapability);

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


// Gestion des capacités de stockage
router.route('/me/storage-capabilities')
  .get(transformerController.getStorageCapabilities)
  .patch(transformerController.updateStorageCapabilities);

// Gestion des services offerts
router.route('/me/services')
  .get(transformerController.getMyServices)
  .patch(transformerController.updateMyServices);

// Gestion de la tarification
router.route('/me/pricing')
  .get(transformerController.getMyPricing)
  .patch(transformerController.updateMyPricing);

// Gestion des délais de traitement
router.route('/me/processing-times')
  .get(transformerController.getProcessingTimes)
  .patch(transformerController.updateProcessingTimes);

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


// Gestion des horaires d'opération
router.route('/me/operating-hours')
  .get(transformerController.getOperatingHours)
  .patch(transformerController.updateOperatingHours);



router.route('/me/production-batches/:batchId')
  .get(transformerController.getProductionBatch)
  .patch(transformerController.updateProductionBatch);

// Traçabilité des produits
router.get('/me/production-batches/:batchId/traceability', transformerController.getBatchTraceability);

// Gestion des déchets et sous-produits
router.route('/me/waste-management')
  .get(transformerController.getWasteManagement)
  .patch(transformerController.updateWasteManagement);


// Statistiques et analytics
router.get('/me/business-stats', transformerController.getBusinessStats);
router.get('/me/production-analytics', transformerController.getProductionAnalytics);
router.get('/me/efficiency-metrics', transformerController.getEfficiencyMetrics);
router.get('/me/revenue-analytics', transformerController.getRevenueAnalytics);

// Gestion des contrats avec clients
router.route('/me/contracts')
  .get(transformerController.getContracts)
  .post(transformerController.createContract);

router.route('/me/contracts/:contractId')
  .get(transformerController.getContract)
  .patch(transformerController.updateContract)
  .delete(transformerController.terminateContract);

// Évaluations et avis - Route déjà définie plus haut

// Répondre aux avis clients
router.patch('/me/reviews/:reviewId/response', transformerController.respondToReview);

// Gestion des réclamations
router.route('/me/complaints')
  .get(transformerController.getComplaints)
  .post(transformerController.handleComplaint);

router.route('/me/complaints/:complaintId')
  .patch(transformerController.updateComplaint);

// Planification de la production
router.route('/me/production-planning')
  .get(transformerController.getProductionPlanning)
  .post(transformerController.createProductionPlan);

router.route('/me/production-planning/:planId')
  .patch(transformerController.updateProductionPlan)
  .delete(transformerController.deleteProductionPlan);

// Gestion des maintenances
router.route('/me/maintenance-schedule')
  .get(transformerController.getMaintenanceSchedule)
  .post(transformerController.scheduleMaintenance);

router.route('/me/maintenance-records')
  .get(transformerController.getMaintenanceRecords)
  .post(
    uploadLimiter,
    transformerController.uploadMaintenanceDocument,
    fileTypeValidation(['application/pdf', 'image/jpeg', 'image/png']),
    fileSizeValidation(10 * 1024 * 1024), // 10MB
    transformerController.addMaintenanceRecord
  );

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
