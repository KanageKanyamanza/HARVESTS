const express = require('express');
const restaurateurController = require('../controllers/restaurateurController');
const authController = require('../controllers/authController');
const { uploadLimiter, fileTypeValidation, fileSizeValidation } = require('../middleware/security');

const router = express.Router();

// Routes publiques pour recherche de restaurateurs
router.get('/', restaurateurController.getAllRestaurateurs);
router.get('/search', restaurateurController.searchRestaurateurs);
router.get('/by-region/:region', restaurateurController.getRestaurateursByRegion);
router.get('/by-cuisine/:cuisine', restaurateurController.getRestaurateursByCuisine);
router.get('/:id', restaurateurController.getRestaurateur);

// Toutes les routes suivantes nécessitent une authentification
router.use(authController.protect);
router.use(authController.restrictTo('restaurateur'));
router.use(authController.requireVerification);

// Gestion du profil restaurateur
router.get('/me/profile', restaurateurController.getMyProfile);
router.patch('/me/profile', restaurateurController.updateMyProfile);

// Gestion des informations du restaurant
router.route('/me/restaurant-info')
  .get(restaurateurController.getRestaurantInfo)
  .patch(restaurateurController.updateRestaurantInfo);

// Gestion des horaires d'ouverture
router.route('/me/operating-hours')
  .get(restaurateurController.getOperatingHours)
  .patch(restaurateurController.updateOperatingHours);

// Gestion des besoins d'approvisionnement
router.route('/me/procurement-needs')
  .get(restaurateurController.getProcurementNeeds)
  .post(restaurateurController.addProcurementNeed);

router.route('/me/procurement-needs/:needId')
  .patch(restaurateurController.updateProcurementNeed)
  .delete(restaurateurController.removeProcurementNeed);

// Gestion des fournisseurs préférés
router.route('/me/preferred-suppliers')
  .get(restaurateurController.getPreferredSuppliers)
  .post(restaurateurController.addPreferredSupplier);

router.route('/me/preferred-suppliers/:supplierId')
  .patch(restaurateurController.updateSupplierRating)
  .delete(restaurateurController.removePreferredSupplier);

// Gestion des certifications
router.route('/me/certifications')
  .get(restaurateurController.getMyCertifications)
  .post(
    uploadLimiter,
    restaurateurController.uploadCertificationDocument,
    fileTypeValidation(['application/pdf', 'image/jpeg', 'image/png']),
    fileSizeValidation(10 * 1024 * 1024), // 10MB
    restaurateurController.addCertification
  );

router.route('/me/certifications/:certId')
  .patch(restaurateurController.updateCertification)
  .delete(restaurateurController.removeCertification);

// Gestion des équipements de cuisine
router.route('/me/kitchen-equipment')
  .get(restaurateurController.getKitchenEquipment)
  .post(restaurateurController.addKitchenEquipment);

router.route('/me/kitchen-equipment/:equipmentId')
  .patch(restaurateurController.updateKitchenEquipment)
  .delete(restaurateurController.removeKitchenEquipment);

// Gestion de la capacité de stockage
router.route('/me/storage-capacity')
  .get(restaurateurController.getStorageCapacity)
  .patch(restaurateurController.updateStorageCapacity);

// Gestion des commandes d'approvisionnement
router.route('/me/orders')
  .get(restaurateurController.getMyOrders)
  .post(restaurateurController.createOrder);

router.route('/me/orders/:orderId')
  .get(restaurateurController.getMyOrder)
  .patch(restaurateurController.updateOrder)
  .delete(restaurateurController.cancelOrder);

// Suivi des commandes
router.get('/me/orders/:orderId/tracking', restaurateurController.trackOrder);

// Gestion des contrats avec fournisseurs
router.route('/me/contracts')
  .get(restaurateurController.getContracts)
  .post(restaurateurController.createContract);

router.route('/me/contracts/:contractId')
  .get(restaurateurController.getContract)
  .patch(restaurateurController.updateContract)
  .delete(restaurateurController.terminateContract);

// Gestion des préférences de paiement
router.route('/me/payment-preferences')
  .get(restaurateurController.getPaymentPreferences)
  .patch(restaurateurController.updatePaymentPreferences);

// Gestion des préférences de livraison
router.route('/me/delivery-preferences')
  .get(restaurateurController.getDeliveryPreferences)
  .patch(restaurateurController.updateDeliveryPreferences);

// Évaluations et avis
router.route('/me/reviews')
  .get(restaurateurController.getMyReviews)
  .post(restaurateurController.createReview);

router.route('/me/reviews/:reviewId')
  .patch(restaurateurController.updateMyReview)
  .delete(restaurateurController.deleteMyReview);

// Statistiques et analytics
router.get('/me/stats', restaurateurController.getMyStats);
router.get('/me/purchase-analytics', restaurateurController.getPurchaseAnalytics);
router.get('/me/supplier-performance', restaurateurController.getSupplierPerformance);

// Planification des menus et prévisions
router.route('/me/menu-planning')
  .get(restaurateurController.getMenuPlanning)
  .post(restaurateurController.createMenuPlan);

router.route('/me/menu-planning/:planId')
  .patch(restaurateurController.updateMenuPlan)
  .delete(restaurateurController.deleteMenuPlan);

// Gestion des prévisions d'approvisionnement
router.route('/me/procurement-forecasts')
  .get(restaurateurController.getProcurementForecasts)
  .post(restaurateurController.createProcurementForecast);

// Services additionnels
router.route('/me/additional-services')
  .get(restaurateurController.getAdditionalServices)
  .patch(restaurateurController.updateAdditionalServices);

// Documents légaux
router.route('/me/documents')
  .get(restaurateurController.getMyDocuments)
  .post(
    uploadLimiter,
    restaurateurController.uploadDocument,
    fileTypeValidation(['application/pdf', 'image/jpeg', 'image/png']),
    fileSizeValidation(10 * 1024 * 1024), // 10MB
    restaurateurController.addDocument
  );

// Notifications et alertes
router.route('/me/notifications')
  .get(restaurateurController.getNotifications)
  .patch(restaurateurController.markNotificationsAsRead);

// Alertes de stock et approvisionnement
router.route('/me/stock-alerts')
  .get(restaurateurController.getStockAlerts)
  .post(restaurateurController.createStockAlert);

router.route('/me/stock-alerts/:alertId')
  .patch(restaurateurController.updateStockAlert)
  .delete(restaurateurController.deleteStockAlert);

module.exports = router;
