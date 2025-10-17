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

// Routes publiques pour profils individuels (DOIVENT être avant l'authentification)
router.get('/:id', restaurateurController.getRestaurateur);
router.get('/:id/dishes', restaurateurController.getRestaurateurDishes);

// Toutes les routes suivantes nécessitent une authentification
router.use(authController.protect);
router.use(authController.restrictTo('restaurateur'));

// Routes protégées spécifiques (doivent être AVANT les routes génériques)
router.get('/me/profile', restaurateurController.getMyProfile);
router.get('/me/dishes', restaurateurController.getMyDishes);

// Routes de lecture (autorisées sans vérification d'email)
router.get('/me/restaurant-info', restaurateurController.getRestaurantInfo);
router.get('/me/operating-hours', restaurateurController.getOperatingHours);
router.get('/me/procurement-needs', restaurateurController.getProcurementNeeds);
router.get('/me/preferred-suppliers', restaurateurController.getPreferredSuppliers);
router.get('/me/certifications', restaurateurController.getMyCertifications);
router.get('/me/kitchen-equipment', restaurateurController.getKitchenEquipment);
router.get('/me/storage-capacity', restaurateurController.getStorageCapacity);
router.get('/me/orders', restaurateurController.getMyOrders);
router.get('/me/orders/:orderId', restaurateurController.getMyOrder);
router.get('/me/orders/:orderId/tracking', restaurateurController.trackOrder);
router.get('/me/contracts', restaurateurController.getContracts);
router.get('/me/contracts/:contractId', restaurateurController.getContract);
router.get('/me/payment-preferences', restaurateurController.getPaymentPreferences);
router.get('/me/delivery-preferences', restaurateurController.getDeliveryPreferences);
router.get('/me/reviews', restaurateurController.getMyReviews);
router.get('/me/stats', restaurateurController.getMyStats);
router.get('/me/purchase-analytics', restaurateurController.getPurchaseAnalytics);
router.get('/me/supplier-performance', restaurateurController.getSupplierPerformance);
router.get('/me/menu-planning', restaurateurController.getMenuPlanning);
router.get('/me/procurement-forecasts', restaurateurController.getProcurementForecasts);
router.get('/me/additional-services', restaurateurController.getAdditionalServices);
router.get('/me/documents', restaurateurController.getMyDocuments);
router.get('/me/notifications', restaurateurController.getNotifications);
router.get('/me/stock-alerts', restaurateurController.getStockAlerts);

// Routes pour découvrir les fournisseurs (producteurs et transformateurs)
router.get('/suppliers/discover', restaurateurController.discoverSuppliers);
router.get('/suppliers/search', restaurateurController.searchSuppliers);
router.get('/suppliers/:supplierId', restaurateurController.getSupplierDetails);

// Routes pour les plats (lecture autorisée sans vérification d'email)

// Routes d'écriture (nécessitent une vérification d'email)
router.use(authController.requireVerification);

// Gestion du profil restaurateur
router.patch('/me/profile', restaurateurController.updateMyProfile);

// Gestion des plats
router.post('/me/dishes', restaurateurController.addDish);
router.patch('/me/dishes/:dishId', restaurateurController.updateDish);
router.delete('/me/dishes/:dishId', restaurateurController.deleteDish);

// Gestion des informations du restaurant
router.patch('/me/restaurant-info', restaurateurController.updateRestaurantInfo);

// Gestion des horaires d'ouverture
router.patch('/me/operating-hours', restaurateurController.updateOperatingHours);

// Gestion des besoins d'approvisionnement
router.post('/me/procurement-needs', restaurateurController.addProcurementNeed);

router.route('/me/procurement-needs/:needId')
  .patch(restaurateurController.updateProcurementNeed)
  .delete(restaurateurController.removeProcurementNeed);

// Gestion des fournisseurs préférés
router.post('/me/preferred-suppliers', restaurateurController.addPreferredSupplier);

router.route('/me/preferred-suppliers/:supplierId')
  .patch(restaurateurController.updateSupplierRating)
  .delete(restaurateurController.removePreferredSupplier);

// Gestion des certifications
router.post(
  '/me/certifications',
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
router.post('/me/kitchen-equipment', restaurateurController.addKitchenEquipment);

router.route('/me/kitchen-equipment/:equipmentId')
  .patch(restaurateurController.updateKitchenEquipment)
  .delete(restaurateurController.removeKitchenEquipment);

// Gestion de la capacité de stockage
router.patch('/me/storage-capacity', restaurateurController.updateStorageCapacity);

// Gestion des commandes d'approvisionnement
router.post('/me/orders', restaurateurController.createOrder);

router.route('/me/orders/:orderId')
  .patch(restaurateurController.updateOrder)
  .delete(restaurateurController.cancelOrder);

// Gestion des contrats avec fournisseurs
router.post('/me/contracts', restaurateurController.createContract);

router.route('/me/contracts/:contractId')
  .patch(restaurateurController.updateContract)
  .delete(restaurateurController.terminateContract);

// Gestion des préférences de paiement
router.patch('/me/payment-preferences', restaurateurController.updatePaymentPreferences);

// Gestion des préférences de livraison
router.patch('/me/delivery-preferences', restaurateurController.updateDeliveryPreferences);

// Évaluations et avis
router.post('/me/reviews', restaurateurController.createReview);

router.route('/me/reviews/:reviewId')
  .patch(restaurateurController.updateMyReview)
  .delete(restaurateurController.deleteMyReview);

// Planification des menus et prévisions
router.post('/me/menu-planning', restaurateurController.createMenuPlan);

router.route('/me/menu-planning/:planId')
  .patch(restaurateurController.updateMenuPlan)
  .delete(restaurateurController.deleteMenuPlan);

// Gestion des prévisions d'approvisionnement
router.post('/me/procurement-forecasts', restaurateurController.createProcurementForecast);

// Services additionnels
router.patch('/me/additional-services', restaurateurController.updateAdditionalServices);

// Documents légaux
router.post(
  '/me/documents',
  uploadLimiter,
  restaurateurController.uploadDocument,
  fileTypeValidation(['application/pdf', 'image/jpeg', 'image/png']),
  fileSizeValidation(10 * 1024 * 1024), // 10MB
  restaurateurController.addDocument
);

// Notifications et alertes
router.patch('/me/notifications', restaurateurController.markNotificationsAsRead);

// Alertes de stock et approvisionnement
router.post('/me/stock-alerts', restaurateurController.createStockAlert);

router.route('/me/stock-alerts/:alertId')
  .patch(restaurateurController.updateStockAlert)
  .delete(restaurateurController.deleteStockAlert);

module.exports = router;
