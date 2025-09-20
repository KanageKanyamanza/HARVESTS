const express = require('express');
const transporterController = require('../controllers/transporterController');
const authController = require('../controllers/authController');
const { uploadLimiter, fileTypeValidation, fileSizeValidation } = require('../middleware/security');

const router = express.Router();

// Routes publiques pour recherche de transporteurs
router.get('/', transporterController.getAllTransporters);
router.get('/search', transporterController.searchTransporters);
router.get('/by-region/:region', transporterController.getTransportersByRegion);
router.get('/by-service/:service', transporterController.getTransportersByService);
router.get('/:id', transporterController.getTransporter);
router.get('/:id/availability', transporterController.checkAvailability);

// Calculateur de tarifs public
router.post('/calculate-rate', transporterController.calculateShippingRate);

// Toutes les routes suivantes nécessitent une authentification
router.use(authController.protect);
router.use(authController.restrictTo('transporter'));
router.use(authController.requireVerification);
router.use(authController.requireApproval); // Les transporteurs doivent être approuvés

// Gestion du profil transporteur
router.get('/me/profile', transporterController.getMyProfile);
router.patch('/me/profile', transporterController.updateMyProfile);

// Gestion de la flotte de véhicules
router.route('/me/fleet')
  .get(transporterController.getMyFleet)
  .post(transporterController.addVehicle);

router.route('/me/fleet/:vehicleId')
  .patch(transporterController.updateVehicle)
  .delete(transporterController.removeVehicle);

// Gestion de la disponibilité des véhicules
router.patch('/me/fleet/:vehicleId/availability', transporterController.updateVehicleAvailability);
router.patch('/me/fleet/:vehicleId/maintenance', transporterController.scheduleVehicleMaintenance);

// Gestion des zones de service
router.route('/me/service-areas')
  .get(transporterController.getServiceAreas)
  .post(transporterController.addServiceArea);

router.route('/me/service-areas/:areaId')
  .patch(transporterController.updateServiceArea)
  .delete(transporterController.removeServiceArea);

// Gestion de la structure tarifaire
router.route('/me/pricing')
  .get(transporterController.getPricingStructure)
  .patch(transporterController.updatePricingStructure);

// Gestion des horaires d'opération
router.route('/me/operating-hours')
  .get(transporterController.getOperatingHours)
  .patch(transporterController.updateOperatingHours);

// Gestion des capacités spéciales
router.route('/me/special-capabilities')
  .get(transporterController.getSpecialCapabilities)
  .patch(transporterController.updateSpecialCapabilities);

// Gestion de l'équipe de conducteurs
router.route('/me/drivers')
  .get(transporterController.getDrivers)
  .post(transporterController.addDriver);

router.route('/me/drivers/:driverId')
  .patch(transporterController.updateDriver)
  .delete(transporterController.removeDriver);

// Gestion de la disponibilité des conducteurs
router.patch('/me/drivers/:driverId/availability', transporterController.updateDriverAvailability);

// Gestion des assurances
router.route('/me/insurance')
  .get(transporterController.getInsurance)
  .post(
    uploadLimiter,
    transporterController.uploadInsuranceDocument,
    fileTypeValidation(['application/pdf', 'image/jpeg', 'image/png']),
    fileSizeValidation(10 * 1024 * 1024), // 10MB
    transporterController.addInsurance
  );

router.route('/me/insurance/:insuranceId')
  .patch(transporterController.updateInsurance)
  .delete(transporterController.removeInsurance);

// Gestion des partenaires et sous-traitants
router.route('/me/partners')
  .get(transporterController.getPartners)
  .post(transporterController.addPartner);

router.route('/me/partners/:partnerId')
  .patch(transporterController.updatePartner)
  .delete(transporterController.removePartner);

// Gestion des livraisons
router.route('/me/deliveries')
  .get(transporterController.getMyDeliveries)
  .post(transporterController.acceptDelivery);

router.route('/me/deliveries/:deliveryId')
  .get(transporterController.getMyDelivery)
  .patch(transporterController.updateDeliveryStatus);

// Suivi en temps réel des livraisons
router.patch('/me/deliveries/:deliveryId/location', transporterController.updateDeliveryLocation);
router.post('/me/deliveries/:deliveryId/proof', 
  uploadLimiter,
  transporterController.uploadProofOfDelivery,
  fileTypeValidation(['image/jpeg', 'image/png', 'image/webp']),
  fileSizeValidation(5 * 1024 * 1024), // 5MB
  transporterController.submitProofOfDelivery
);

// Gestion des réclamations et incidents
router.route('/me/deliveries/:deliveryId/incident')
  .post(transporterController.reportIncident)
  .patch(transporterController.updateIncident);

// Gestion des préférences de travail
router.route('/me/work-preferences')
  .get(transporterController.getWorkPreferences)
  .patch(transporterController.updateWorkPreferences);

// Gestion des clients préférés
router.route('/me/preferred-customers')
  .get(transporterController.getPreferredCustomers)
  .post(transporterController.addPreferredCustomer);

router.route('/me/preferred-customers/:customerId')
  .patch(transporterController.updateCustomerPriority)
  .delete(transporterController.removePreferredCustomer);

// Gestion des capacités de suivi
router.route('/me/tracking-capabilities')
  .get(transporterController.getTrackingCapabilities)
  .patch(transporterController.updateTrackingCapabilities);

// Statistiques et analytics de performance
router.get('/me/performance-stats', transporterController.getPerformanceStats);
router.get('/me/delivery-analytics', transporterController.getDeliveryAnalytics);
router.get('/me/revenue-analytics', transporterController.getRevenueAnalytics);
router.get('/me/fuel-efficiency', transporterController.getFuelEfficiencyStats);

// Gestion des évaluations et avis
router.route('/me/reviews')
  .get(transporterController.getMyReviews);

// Répondre aux avis clients
router.patch('/me/reviews/:reviewId/response', transporterController.respondToReview);

// Planification et optimisation des itinéraires
router.get('/me/route-optimization', transporterController.getRouteOptimization);
router.post('/me/route-planning', transporterController.planRoute);

// Gestion des coûts et rentabilité
router.get('/me/cost-analysis', transporterController.getCostAnalysis);
router.get('/me/profitability-report', transporterController.getProfitabilityReport);

// Maintenance préventive
router.route('/me/maintenance-schedule')
  .get(transporterController.getMaintenanceSchedule)
  .post(transporterController.scheduleMaintenance);

router.route('/me/maintenance-records')
  .get(transporterController.getMaintenanceRecords)
  .post(
    uploadLimiter,
    transporterController.uploadMaintenanceDocument,
    fileTypeValidation(['application/pdf', 'image/jpeg', 'image/png']),
    fileSizeValidation(10 * 1024 * 1024), // 10MB
    transporterController.addMaintenanceRecord
  );

// Gestion des documents légaux
router.route('/me/documents')
  .get(transporterController.getMyDocuments)
  .post(
    uploadLimiter,
    transporterController.uploadDocument,
    fileTypeValidation(['application/pdf', 'image/jpeg', 'image/png']),
    fileSizeValidation(10 * 1024 * 1024), // 10MB
    transporterController.addDocument
  );

// Notifications et alertes
router.route('/me/notifications')
  .get(transporterController.getNotifications)
  .patch(transporterController.markNotificationsAsRead);

// Alertes de maintenance et conformité
router.route('/me/maintenance-alerts')
  .get(transporterController.getMaintenanceAlerts)
  .post(transporterController.createMaintenanceAlert);

// Gestion des urgences et support
router.post('/me/emergency-support', transporterController.requestEmergencySupport);
router.get('/me/support-tickets', transporterController.getSupportTickets);

// Rapports de conformité
router.get('/me/compliance-reports', transporterController.getComplianceReports);
router.post('/me/compliance-reports', transporterController.generateComplianceReport);

module.exports = router;
