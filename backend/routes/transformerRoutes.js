const express = require('express');
const transformerController = require('../controllers/transformerController');
const authController = require('../controllers/authController');
const { uploadLimiter, fileTypeValidation, fileSizeValidation } = require('../middleware/security');

const router = express.Router();

// Routes publiques pour recherche de transformateurs
router.get('/', transformerController.getAllTransformers);
router.get('/search', transformerController.searchTransformers);
router.get('/by-region/:region', transformerController.getTransformersByRegion);
router.get('/by-type/:type', transformerController.getTransformersByType);
router.get('/:id', transformerController.getTransformer);
router.get('/:id/services', transformerController.getTransformerServices);
router.get('/:id/reviews', transformerController.getTransformerReviews);

// Toutes les routes suivantes nécessitent une authentification
router.use(authController.protect);
router.use(authController.restrictTo('transformer'));
router.use(authController.requireVerification);
router.use(authController.requireApproval); // Les transformateurs doivent être approuvés

// Gestion du profil transformateur
router.get('/me/profile', transformerController.getMyProfile);
router.patch('/me/profile', transformerController.updateMyProfile);

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

// Gestion des équipements
router.route('/me/equipment')
  .get(transformerController.getMyEquipment)
  .post(transformerController.addEquipment);

router.route('/me/equipment/:equipmentId')
  .patch(transformerController.updateEquipment)
  .delete(transformerController.removeEquipment);

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

// Gestion des devis personnalisés
router.route('/me/custom-quotes')
  .get(transformerController.getCustomQuotes)
  .post(transformerController.createCustomQuote);

router.route('/me/custom-quotes/:quoteId')
  .get(transformerController.getCustomQuote)
  .patch(transformerController.updateCustomQuote)
  .delete(transformerController.deleteCustomQuote);

// Conversion de devis en commandes
router.post('/me/custom-quotes/:quoteId/convert', transformerController.convertQuoteToOrder);

// Gestion des horaires d'opération
router.route('/me/operating-hours')
  .get(transformerController.getOperatingHours)
  .patch(transformerController.updateOperatingHours);

// Gestion du contrôle qualité
router.route('/me/quality-control')
  .get(transformerController.getQualityControlSettings)
  .patch(transformerController.updateQualityControlSettings);

// Rapports de qualité
router.route('/me/quality-reports')
  .get(transformerController.getQualityReports)
  .post(
    uploadLimiter,
    transformerController.uploadQualityReport,
    fileTypeValidation(['application/pdf', 'image/jpeg', 'image/png']),
    fileSizeValidation(10 * 1024 * 1024), // 10MB
    transformerController.createQualityReport
  );

// Gestion des lots de production
router.route('/me/production-batches')
  .get(transformerController.getProductionBatches)
  .post(transformerController.createProductionBatch);

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

// Évaluations et avis
router.route('/me/reviews')
  .get(transformerController.getMyReviews);

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
