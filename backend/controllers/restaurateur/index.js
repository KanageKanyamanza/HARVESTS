// Export all restaurateur controllers
const restaurateurPublicController = require('./restaurateurPublicController');
const restaurateurProfileController = require('./restaurateurProfileController');
const restaurateurDishController = require('./restaurateurDishController');
const restaurateurOrderController = require('./restaurateurOrderController');
const restaurateurStatsController = require('./restaurateurStatsController');
const restaurateurSupplierController = require('./restaurateurSupplierController');
const restaurateurTemporaryController = require('./restaurateurTemporaryController');
const restaurateurUploadController = require('./restaurateurUploadController');

module.exports = {
  // Uploads
  uploadCertificationDocument: restaurateurUploadController.uploadCertificationDocument,
  uploadDocument: restaurateurUploadController.uploadDocument,
  
  // Public routes
  getAllRestaurateurs: restaurateurPublicController.getAllRestaurateurs,
  searchRestaurateurs: restaurateurPublicController.searchRestaurateurs,
  getRestaurateursByRegion: restaurateurPublicController.getRestaurateursByRegion,
  getRestaurateursByCuisine: restaurateurPublicController.getRestaurateursByCuisine,
  getRestaurateur: restaurateurPublicController.getRestaurateur,
  getRestaurateurDishes: restaurateurPublicController.getRestaurateurDishes,
  getDishDetail: restaurateurPublicController.getDishDetail,
  getRestaurateurProducts: restaurateurPublicController.getRestaurateurProducts,
  
  // Profile routes
  getMyProfile: restaurateurProfileController.getMyProfile,
  updateMyProfile: restaurateurProfileController.updateMyProfile,
  getMyCertifications: restaurateurProfileController.getMyCertifications,
  addCertification: restaurateurProfileController.addCertification,
  updateCertification: restaurateurProfileController.updateCertification,
  removeCertification: restaurateurProfileController.removeCertification,
  
  // Dish routes
  getMyDishes: restaurateurDishController.getMyDishes,
  getMyProducts: restaurateurDishController.getMyProducts,
  addDish: restaurateurDishController.addDish,
  updateDish: restaurateurDishController.updateDish,
  deleteDish: restaurateurDishController.deleteDish,
  
  // Order routes
  createOrder: restaurateurOrderController.createOrder,
  getMyOrders: restaurateurOrderController.getMyOrders,
  getMyOrder: restaurateurOrderController.getMyOrder,
  updateOrderStatus: restaurateurOrderController.updateOrderStatus,
  updateOrder: restaurateurOrderController.updateOrder,
  cancelOrder: restaurateurOrderController.cancelOrder,
  trackOrder: restaurateurOrderController.trackOrder,
  
  // Stats routes
  getMyStats: restaurateurStatsController.getMyStats,
  getStats: restaurateurStatsController.getStats,
  getSalesAnalytics: restaurateurStatsController.getSalesAnalytics,
  getRevenueAnalytics: restaurateurStatsController.getRevenueAnalytics,
  getPurchaseAnalytics: restaurateurStatsController.getPurchaseAnalytics,
  getSupplierPerformance: restaurateurStatsController.getSupplierPerformance,
  
  // Supplier routes
  discoverSuppliers: restaurateurSupplierController.discoverSuppliers,
  searchSuppliers: restaurateurSupplierController.searchSuppliers,
  getSupplierDetails: restaurateurSupplierController.getSupplierDetails,
  getPreferredSuppliers: restaurateurSupplierController.getPreferredSuppliers,
  addPreferredSupplier: restaurateurSupplierController.addPreferredSupplier,
  updateSupplierRating: restaurateurSupplierController.updateSupplierRating,
  removePreferredSupplier: restaurateurSupplierController.removePreferredSupplier,
  
  // Temporary routes
  getRestaurantInfo: restaurateurTemporaryController.getRestaurantInfo,
  updateRestaurantInfo: restaurateurTemporaryController.updateRestaurantInfo,
  getOperatingHours: restaurateurTemporaryController.getOperatingHours,
  updateOperatingHours: restaurateurTemporaryController.updateOperatingHours,
  getProcurementNeeds: restaurateurTemporaryController.getProcurementNeeds,
  addProcurementNeed: restaurateurTemporaryController.addProcurementNeed,
  updateProcurementNeed: restaurateurTemporaryController.updateProcurementNeed,
  removeProcurementNeed: restaurateurTemporaryController.removeProcurementNeed,
  getKitchenEquipment: restaurateurTemporaryController.getKitchenEquipment,
  addKitchenEquipment: restaurateurTemporaryController.addKitchenEquipment,
  updateKitchenEquipment: restaurateurTemporaryController.updateKitchenEquipment,
  removeKitchenEquipment: restaurateurTemporaryController.removeKitchenEquipment,
  getStorageCapacity: restaurateurTemporaryController.getStorageCapacity,
  updateStorageCapacity: restaurateurTemporaryController.updateStorageCapacity,
  getContracts: restaurateurTemporaryController.getContracts,
  createContract: restaurateurTemporaryController.createContract,
  getContract: restaurateurTemporaryController.getContract,
  updateContract: restaurateurTemporaryController.updateContract,
  terminateContract: restaurateurTemporaryController.terminateContract,
  getPaymentPreferences: restaurateurTemporaryController.getPaymentPreferences,
  updatePaymentPreferences: restaurateurTemporaryController.updatePaymentPreferences,
  getDeliveryPreferences: restaurateurTemporaryController.getDeliveryPreferences,
  updateDeliveryPreferences: restaurateurTemporaryController.updateDeliveryPreferences,
  getMyReviews: restaurateurTemporaryController.getMyReviews,
  createReview: restaurateurTemporaryController.createReview,
  updateMyReview: restaurateurTemporaryController.updateMyReview,
  deleteMyReview: restaurateurTemporaryController.deleteMyReview,
  getMenuPlanning: restaurateurTemporaryController.getMenuPlanning,
  createMenuPlan: restaurateurTemporaryController.createMenuPlan,
  updateMenuPlan: restaurateurTemporaryController.updateMenuPlan,
  deleteMenuPlan: restaurateurTemporaryController.deleteMenuPlan,
  getProcurementForecasts: restaurateurTemporaryController.getProcurementForecasts,
  createProcurementForecast: restaurateurTemporaryController.createProcurementForecast,
  getAdditionalServices: restaurateurTemporaryController.getAdditionalServices,
  updateAdditionalServices: restaurateurTemporaryController.updateAdditionalServices,
  getMyDocuments: restaurateurTemporaryController.getMyDocuments,
  addDocument: restaurateurTemporaryController.addDocument,
  getNotifications: restaurateurTemporaryController.getNotifications,
  markNotificationsAsRead: restaurateurTemporaryController.markNotificationsAsRead,
  getStockAlerts: restaurateurTemporaryController.getStockAlerts,
  createStockAlert: restaurateurTemporaryController.createStockAlert,
  updateStockAlert: restaurateurTemporaryController.updateStockAlert,
  deleteStockAlert: restaurateurTemporaryController.deleteStockAlert
};

