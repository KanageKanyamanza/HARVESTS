// Export all producer controllers
const producerPublicController = require('./producerPublicController');
const producerProfileController = require('./producerProfileController');
const producerProductController = require('./producerProductController');
const producerOrderController = require('./producerOrderController');
const producerStatsController = require('./producerStatsController');
const producerSettingsController = require('./producerSettingsController');
const producerUploadController = require('./producerUploadController');

module.exports = {
  // Uploads
  uploadProductImages: producerUploadController.uploadProductImages,
  uploadCertificationDocument: producerUploadController.uploadCertificationDocument,
  uploadDocument: producerUploadController.uploadDocument,
  processProductImages: producerUploadController.processProductImages,
  
  // Public routes
  getAllProducers: producerPublicController.getAllProducers,
  searchProducers: producerPublicController.searchProducers,
  getProducersByRegion: producerPublicController.getProducersByRegion,
  getProducersByCrop: producerPublicController.getProducersByCrop,
  getProducer: producerPublicController.getProducer,
  getProducerProducts: producerPublicController.getProducerProducts,
  getProducerReviews: producerPublicController.getProducerReviews,
  
  // Profile routes
  getMyProfile: producerProfileController.getMyProfile,
  updateMyProfile: producerProfileController.updateMyProfile,
  getMyCertifications: producerProfileController.getMyCertifications,
  addCertification: producerProfileController.addCertification,
  updateCertification: producerProfileController.updateCertification,
  removeCertification: producerProfileController.removeCertification,
  
  // Product routes
  getMyProducts: producerProductController.getMyProducts,
  createProduct: producerProductController.createProduct,
  getMyProduct: producerProductController.getMyProduct,
  updateMyProduct: producerProductController.updateMyProduct,
  deleteMyProduct: producerProductController.deleteMyProduct,
  
  // Order routes
  getMyOrders: producerOrderController.getMyOrders,
  getMyOrder: producerOrderController.getMyOrder,
  updateOrderStatus: producerOrderController.updateOrderStatus,
  
  // Stats routes
  getMyStats: producerStatsController.getMyStats,
  getStats: producerStatsController.getStats,
  getSalesAnalytics: producerStatsController.getSalesAnalytics,
  getRevenueAnalytics: producerStatsController.getRevenueAnalytics,
  
  // Settings routes
  getPreferredTransporters: producerSettingsController.getPreferredTransporters,
  addPreferredTransporter: producerSettingsController.addPreferredTransporter,
  removePreferredTransporter: producerSettingsController.removePreferredTransporter,
  getMyDocuments: producerSettingsController.getMyDocuments,
  addDocument: producerSettingsController.addDocument,
  getDeliverySettings: producerSettingsController.getDeliverySettings,
  updateDeliverySettings: producerSettingsController.updateDeliverySettings
};

