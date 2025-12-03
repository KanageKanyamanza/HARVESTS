// Export all transporter controllers
const transporterPublicController = require('./transporterPublicController');
const transporterProfileController = require('./transporterProfileController');
const transporterDeliveryController = require('./transporterDeliveryController');
const transporterStatsController = require('./transporterStatsController');
const transporterTemporaryController = require('./transporterTemporaryController');
const transporterUploadController = require('./transporterUploadController');

module.exports = {
  // Uploads
  uploadInsuranceDocument: transporterUploadController.uploadInsuranceDocument,
  uploadProofOfDelivery: transporterUploadController.uploadProofOfDelivery,
  uploadMaintenanceDocument: transporterUploadController.uploadMaintenanceDocument,
  uploadDocument: transporterUploadController.uploadDocument,
  
  // Public routes
  getAllTransporters: transporterPublicController.getAllTransporters,
  searchTransporters: transporterPublicController.searchTransporters,
  getTransportersByRegion: transporterPublicController.getTransportersByRegion,
  getTransportersByService: transporterPublicController.getTransportersByService,
  getTransporter: transporterPublicController.getTransporter,
  checkAvailability: transporterPublicController.checkAvailability,
  calculateShippingRate: transporterPublicController.calculateShippingRate,
  
  // Profile routes
  getMyProfile: transporterProfileController.getMyProfile,
  updateMyProfile: transporterProfileController.updateMyProfile,
  getMyFleet: transporterProfileController.getMyFleet,
  addVehicle: transporterProfileController.addVehicle,
  updateVehicle: transporterProfileController.updateVehicle,
  removeVehicle: transporterProfileController.removeVehicle,
  updateVehicleAvailability: transporterProfileController.updateVehicleAvailability,
  
  // Delivery routes
  getMyDeliveries: transporterDeliveryController.getMyDeliveries,
  getMyDelivery: transporterDeliveryController.getMyDelivery,
  updateDeliveryStatus: transporterDeliveryController.updateDeliveryStatus,
  
  // Stats routes
  getStats: transporterStatsController.getStats,
  
  // Temporary routes (toutes les fonctions en développement)
  scheduleVehicleMaintenance: transporterTemporaryController.scheduleVehicleMaintenance,
  getServiceAreas: transporterTemporaryController.getServiceAreas,
  addServiceArea: transporterTemporaryController.addServiceArea,
  updateServiceArea: transporterTemporaryController.updateServiceArea,
  removeServiceArea: transporterTemporaryController.removeServiceArea,
  getPricingStructure: transporterTemporaryController.getPricingStructure,
  updatePricingStructure: transporterTemporaryController.updatePricingStructure,
  getOperatingHours: transporterTemporaryController.getOperatingHours,
  updateOperatingHours: transporterTemporaryController.updateOperatingHours,
  getSpecialCapabilities: transporterTemporaryController.getSpecialCapabilities,
  updateSpecialCapabilities: transporterTemporaryController.updateSpecialCapabilities,
  getDrivers: transporterTemporaryController.getDrivers,
  addDriver: transporterTemporaryController.addDriver,
  updateDriver: transporterTemporaryController.updateDriver,
  removeDriver: transporterTemporaryController.removeDriver,
  updateDriverAvailability: transporterTemporaryController.updateDriverAvailability,
  getInsurance: transporterTemporaryController.getInsurance,
  addInsurance: transporterTemporaryController.addInsurance,
  updateInsurance: transporterTemporaryController.updateInsurance,
  removeInsurance: transporterTemporaryController.removeInsurance,
  getPartners: transporterTemporaryController.getPartners,
  addPartner: transporterTemporaryController.addPartner,
  updatePartner: transporterTemporaryController.updatePartner,
  removePartner: transporterTemporaryController.removePartner,
  acceptDelivery: transporterTemporaryController.acceptDelivery,
  updateDeliveryLocation: transporterTemporaryController.updateDeliveryLocation,
  submitProofOfDelivery: transporterTemporaryController.submitProofOfDelivery,
  reportIncident: transporterTemporaryController.reportIncident,
  updateIncident: transporterTemporaryController.updateIncident,
  getWorkPreferences: transporterTemporaryController.getWorkPreferences,
  updateWorkPreferences: transporterTemporaryController.updateWorkPreferences,
  getPreferredCustomers: transporterTemporaryController.getPreferredCustomers,
  addPreferredCustomer: transporterTemporaryController.addPreferredCustomer,
  updateCustomerPriority: transporterTemporaryController.updateCustomerPriority,
  removePreferredCustomer: transporterTemporaryController.removePreferredCustomer,
  getTrackingCapabilities: transporterTemporaryController.getTrackingCapabilities,
  updateTrackingCapabilities: transporterTemporaryController.updateTrackingCapabilities,
  getPerformanceStats: transporterTemporaryController.getPerformanceStats,
  getDeliveryAnalytics: transporterTemporaryController.getDeliveryAnalytics,
  getRevenueAnalytics: transporterTemporaryController.getRevenueAnalytics,
  getFuelEfficiencyStats: transporterTemporaryController.getFuelEfficiencyStats,
  getMyReviews: transporterTemporaryController.getMyReviews,
  respondToReview: transporterTemporaryController.respondToReview,
  getRouteOptimization: transporterTemporaryController.getRouteOptimization,
  planRoute: transporterTemporaryController.planRoute,
  getCostAnalysis: transporterTemporaryController.getCostAnalysis,
  getProfitabilityReport: transporterTemporaryController.getProfitabilityReport,
  getMaintenanceSchedule: transporterTemporaryController.getMaintenanceSchedule,
  scheduleMaintenance: transporterTemporaryController.scheduleMaintenance,
  getMaintenanceRecords: transporterTemporaryController.getMaintenanceRecords,
  addMaintenanceRecord: transporterTemporaryController.addMaintenanceRecord,
  getMyDocuments: transporterTemporaryController.getMyDocuments,
  addDocument: transporterTemporaryController.addDocument,
  getNotifications: transporterTemporaryController.getNotifications,
  markNotificationsAsRead: transporterTemporaryController.markNotificationsAsRead,
  getMaintenanceAlerts: transporterTemporaryController.getMaintenanceAlerts,
  createMaintenanceAlert: transporterTemporaryController.createMaintenanceAlert,
  requestEmergencySupport: transporterTemporaryController.requestEmergencySupport,
  getSupportTickets: transporterTemporaryController.getSupportTickets,
  getComplianceReports: transporterTemporaryController.getComplianceReports,
  generateComplianceReport: transporterTemporaryController.generateComplianceReport
};

