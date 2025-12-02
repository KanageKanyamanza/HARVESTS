const catchAsync = require('../../utils/catchAsync');

// Fonction temporaire pour les fonctionnalités en cours de développement
const temporaryResponse = (message) => catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: `Fonctionnalité en cours de développement - ${message}`,
    data: {}
  });
});

// Informations restaurant
exports.getRestaurantInfo = temporaryResponse('Infos restaurant');
exports.updateRestaurantInfo = temporaryResponse('Mise à jour restaurant');

// Horaires
exports.getOperatingHours = temporaryResponse('Horaires d\'ouverture');
exports.updateOperatingHours = temporaryResponse('Mise à jour horaires');

// Besoins d'approvisionnement
exports.getProcurementNeeds = temporaryResponse('Besoins approvisionnement');
exports.addProcurementNeed = temporaryResponse('Ajout besoin');
exports.updateProcurementNeed = temporaryResponse('Mise à jour besoin');
exports.removeProcurementNeed = temporaryResponse('Suppression besoin');

// Équipements cuisine
exports.getKitchenEquipment = temporaryResponse('Équipements cuisine');
exports.addKitchenEquipment = temporaryResponse('Ajout équipement');
exports.updateKitchenEquipment = temporaryResponse('Mise à jour équipement');
exports.removeKitchenEquipment = temporaryResponse('Suppression équipement');

// Capacité de stockage
exports.getStorageCapacity = temporaryResponse('Capacité stockage');
exports.updateStorageCapacity = temporaryResponse('Mise à jour stockage');

// Contrats
exports.getContracts = temporaryResponse('Contrats fournisseurs');
exports.createContract = temporaryResponse('Création contrat');
exports.getContract = temporaryResponse('Détail contrat');
exports.updateContract = temporaryResponse('Mise à jour contrat');
exports.terminateContract = temporaryResponse('Résiliation contrat');

// Préférences
exports.getPaymentPreferences = temporaryResponse('Préférences paiement');
exports.updatePaymentPreferences = temporaryResponse('Mise à jour paiement');
exports.getDeliveryPreferences = temporaryResponse('Préférences livraison');
exports.updateDeliveryPreferences = temporaryResponse('Mise à jour livraison');

// Avis
exports.getMyReviews = temporaryResponse('Mes avis');
exports.createReview = temporaryResponse('Création avis');
exports.updateMyReview = temporaryResponse('Mise à jour avis');
exports.deleteMyReview = temporaryResponse('Suppression avis');

// Planification menus
exports.getMenuPlanning = temporaryResponse('Planification menus');
exports.createMenuPlan = temporaryResponse('Création plan menu');
exports.updateMenuPlan = temporaryResponse('Mise à jour plan');
exports.deleteMenuPlan = temporaryResponse('Suppression plan');

// Prévisions approvisionnement
exports.getProcurementForecasts = temporaryResponse('Prévisions approvisionnement');
exports.createProcurementForecast = temporaryResponse('Création prévision');

// Services additionnels
exports.getAdditionalServices = temporaryResponse('Services additionnels');
exports.updateAdditionalServices = temporaryResponse('Mise à jour services');

// Documents
exports.getMyDocuments = temporaryResponse('Mes documents');
exports.addDocument = temporaryResponse('Ajout document');

// Notifications
exports.getNotifications = temporaryResponse('Notifications');
exports.markNotificationsAsRead = temporaryResponse('Lecture notifications');

// Alertes stock
exports.getStockAlerts = temporaryResponse('Alertes stock');
exports.createStockAlert = temporaryResponse('Création alerte');
exports.updateStockAlert = temporaryResponse('Mise à jour alerte');
exports.deleteStockAlert = temporaryResponse('Suppression alerte');

