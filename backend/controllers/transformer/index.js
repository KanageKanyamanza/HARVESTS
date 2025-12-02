// Export all transformer controllers
const transformerPublicController = require('./transformerPublicController');
const transformerProfileController = require('./transformerProfileController');
const transformerSupplierController = require('./transformerSupplierController');
const transformerOrderController = require('./transformerOrderController');
const transformerProductController = require('./transformerProductController');
const transformerStatsController = require('./transformerStatsController');
const transformerReviewController = require('./transformerReviewController');
const transformerUploadController = require('./transformerUploadController');
const transformerTemporaryController = require('./transformerTemporaryController');

module.exports = {
  // Uploads
  uploadCertificationDocument: transformerUploadController.uploadCertificationDocument,
  uploadDocument: transformerUploadController.uploadDocument,
  uploadQualityReport: transformerUploadController.uploadQualityReport,
  uploadMaintenanceDocument: transformerUploadController.uploadMaintenanceDocument,
  
  // Public routes
  getAllTransformers: transformerPublicController.getAllTransformers,
  searchTransformers: transformerPublicController.searchTransformers,
  getTransformersByRegion: transformerPublicController.getTransformersByRegion,
  getTransformersByType: transformerPublicController.getTransformersByType,
  getTransformer: transformerPublicController.getTransformer,
  getPublicTransformer: transformerPublicController.getPublicTransformer,
  getTransformerServices: transformerPublicController.getTransformerServices,
  getTransformerReviews: transformerPublicController.getTransformerReviews,
  
  // Profile routes
  getMyProfile: transformerProfileController.getMyProfile,
  updateMyProfile: transformerProfileController.updateMyProfile,
  getCompanyInfo: transformerProfileController.getCompanyInfo,
  updateCompanyInfo: transformerProfileController.updateCompanyInfo,
  getMyCertifications: transformerProfileController.getMyCertifications,
  addCertification: transformerProfileController.addCertification,
  updateCertification: transformerProfileController.updateCertification,
  removeCertification: transformerProfileController.removeCertification,
  
  // Supplier routes
  getPreferredSuppliers: transformerSupplierController.getPreferredSuppliers,
  addPreferredSupplier: transformerSupplierController.addPreferredSupplier,
  updateSupplierPreference: transformerSupplierController.updateSupplierPreference,
  removePreferredSupplier: transformerSupplierController.removePreferredSupplier,
  
  // Order routes
  getMyOrders: transformerOrderController.getMyOrders,
  acceptOrder: transformerOrderController.acceptOrder,
  getMyOrder: transformerOrderController.getMyOrder,
  updateOrderStatus: transformerOrderController.updateOrderStatus,
  cancelOrder: transformerOrderController.cancelOrder,
  trackOrder: transformerOrderController.trackOrder,
  updateOrderProgress: transformerOrderController.updateOrderProgress,
  
  // Product routes
  getMyProducts: transformerProductController.getMyProducts,
  getProduct: transformerProductController.getProduct,
  createProduct: transformerProductController.createProduct,
  updateProduct: transformerProductController.updateProduct,
  deleteProduct: transformerProductController.deleteProduct,
  submitProductForReview: transformerProductController.submitProductForReview,
  getPublicProducts: transformerProductController.getPublicProducts,
  
  // Stats routes
  getBusinessStats: transformerStatsController.getBusinessStats,
  getProductionAnalytics: transformerStatsController.getProductionAnalytics,
  getEfficiencyMetrics: transformerStatsController.getEfficiencyMetrics,
  getRevenueAnalytics: transformerStatsController.getRevenueAnalytics,
  
  // Review routes
  getMyReviews: transformerReviewController.getMyReviews,
  respondToReview: transformerReviewController.respondToReview,
  markReviewAsRead: transformerReviewController.markReviewAsRead,
  markAllReviewsAsRead: transformerReviewController.markAllReviewsAsRead,
  
  // Temporary routes
  getComplaints: transformerTemporaryController.getComplaints,
  handleComplaint: transformerTemporaryController.handleComplaint,
  updateComplaint: transformerTemporaryController.updateComplaint,
  getMyDocuments: transformerTemporaryController.getMyDocuments,
  addDocument: transformerTemporaryController.addDocument,
  getNotifications: transformerTemporaryController.getNotifications,
  markNotificationsAsRead: transformerTemporaryController.markNotificationsAsRead,
  getProductionAlerts: transformerTemporaryController.getProductionAlerts,
  createProductionAlert: transformerTemporaryController.createProductionAlert,
  getComplianceReports: transformerTemporaryController.getComplianceReports,
  generateComplianceReport: transformerTemporaryController.generateComplianceReport
};

