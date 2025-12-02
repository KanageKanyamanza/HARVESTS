// Export all exporter controllers
const exporterPublicController = require('./exporterPublicController');
const exporterProfileController = require('./exporterProfileController');
const exporterOrderController = require('./exporterOrderController');
const exporterStatsController = require('./exporterStatsController');
const exporterTemporaryController = require('./exporterTemporaryController');
const exporterUploadController = require('./exporterUploadController');

module.exports = {
  // Uploads
  uploadLicenseDocument: exporterUploadController.uploadLicenseDocument,
  uploadCertificationDocument: exporterUploadController.uploadCertificationDocument,
  uploadInsuranceDocument: exporterUploadController.uploadInsuranceDocument,
  uploadExportDocument: exporterUploadController.uploadExportDocument,
  uploadDocument: exporterUploadController.uploadDocument,
  
  // Public routes
  getAllExporters: exporterPublicController.getAllExporters,
  searchExporters: exporterPublicController.searchExporters,
  getExportersByMarket: exporterPublicController.getExportersByMarket,
  getExportersByProduct: exporterPublicController.getExportersByProduct,
  getExporter: exporterPublicController.getExporter,
  
  // Profile routes
  getMyProfile: exporterProfileController.getMyProfile,
  updateMyProfile: exporterProfileController.updateMyProfile,
  getExportLicenses: exporterProfileController.getExportLicenses,
  addExportLicense: exporterProfileController.addExportLicense,
  updateExportLicense: exporterProfileController.updateExportLicense,
  removeExportLicense: exporterProfileController.removeExportLicense,
  getMyFleet: exporterProfileController.getMyFleet,
  addVehicle: exporterProfileController.addVehicle,
  updateVehicle: exporterProfileController.updateVehicle,
  removeVehicle: exporterProfileController.removeVehicle,
  updateVehicleAvailability: exporterProfileController.updateVehicleAvailability,
  
  // Order routes
  getMyExportOrders: exporterOrderController.getMyExportOrders,
  getMyExportOrder: exporterOrderController.getMyExportOrder,
  updateExportOrderStatus: exporterOrderController.updateExportOrderStatus,
  
  // Stats routes
  getExportStats: exporterStatsController.getExportStats,
  getStats: exporterStatsController.getStats,
  
  // Temporary routes (toutes les fonctions en développement)
  getTargetMarkets: exporterTemporaryController.getTargetMarkets,
  addTargetMarket: exporterTemporaryController.addTargetMarket,
  updateTargetMarket: exporterTemporaryController.updateTargetMarket,
  removeTargetMarket: exporterTemporaryController.removeTargetMarket,
  getExportProducts: exporterTemporaryController.getExportProducts,
  addExportProduct: exporterTemporaryController.addExportProduct,
  updateExportProduct: exporterTemporaryController.updateExportProduct,
  removeExportProduct: exporterTemporaryController.removeExportProduct,
  getInternationalCertifications: exporterTemporaryController.getInternationalCertifications,
  addInternationalCertification: exporterTemporaryController.addInternationalCertification,
  updateInternationalCertification: exporterTemporaryController.updateInternationalCertification,
  removeInternationalCertification: exporterTemporaryController.removeInternationalCertification,
  getLogisticsCapabilities: exporterTemporaryController.getLogisticsCapabilities,
  updateLogisticsCapabilities: exporterTemporaryController.updateLogisticsCapabilities,
  getShippingPartners: exporterTemporaryController.getShippingPartners,
  addShippingPartner: exporterTemporaryController.addShippingPartner,
  updateShippingPartner: exporterTemporaryController.updateShippingPartner,
  removeShippingPartner: exporterTemporaryController.removeShippingPartner,
  getTradingTerms: exporterTemporaryController.getTradingTerms,
  updateTradingTerms: exporterTemporaryController.updateTradingTerms,
  getLocalSuppliers: exporterTemporaryController.getLocalSuppliers,
  addLocalSupplier: exporterTemporaryController.addLocalSupplier,
  updateLocalSupplier: exporterTemporaryController.updateLocalSupplier,
  removeLocalSupplier: exporterTemporaryController.removeLocalSupplier,
  getBankAccounts: exporterTemporaryController.getBankAccounts,
  addBankAccount: exporterTemporaryController.addBankAccount,
  updateBankAccount: exporterTemporaryController.updateBankAccount,
  removeBankAccount: exporterTemporaryController.removeBankAccount,
  getInsurancePolicies: exporterTemporaryController.getInsurancePolicies,
  addInsurancePolicy: exporterTemporaryController.addInsurancePolicy,
  updateInsurancePolicy: exporterTemporaryController.updateInsurancePolicy,
  removeInsurancePolicy: exporterTemporaryController.removeInsurancePolicy,
  getTeam: exporterTemporaryController.getTeam,
  addTeamMember: exporterTemporaryController.addTeamMember,
  updateTeamMember: exporterTemporaryController.updateTeamMember,
  removeTeamMember: exporterTemporaryController.removeTeamMember,
  createExportOrder: exporterTemporaryController.createExportOrder,
  updateExportOrder: exporterTemporaryController.updateExportOrder,
  cancelExportOrder: exporterTemporaryController.cancelExportOrder,
  trackExportOrder: exporterTemporaryController.trackExportOrder,
  getExportDocuments: exporterTemporaryController.getExportDocuments,
  addExportDocument: exporterTemporaryController.addExportDocument,
  getLettersOfCredit: exporterTemporaryController.getLettersOfCredit,
  createLetterOfCredit: exporterTemporaryController.createLetterOfCredit,
  getLetterOfCredit: exporterTemporaryController.getLetterOfCredit,
  updateLetterOfCredit: exporterTemporaryController.updateLetterOfCredit,
  getExportAnalytics: exporterTemporaryController.getExportAnalytics,
  getMarketPerformance: exporterTemporaryController.getMarketPerformance,
  getRevenueAnalytics: exporterTemporaryController.getRevenueAnalytics,
  getRegulatoryReports: exporterTemporaryController.getRegulatoryReports,
  generateRegulatoryReport: exporterTemporaryController.generateRegulatoryReport,
  getInternationalQuotes: exporterTemporaryController.getInternationalQuotes,
  createInternationalQuote: exporterTemporaryController.createInternationalQuote,
  getInternationalQuote: exporterTemporaryController.getInternationalQuote,
  updateInternationalQuote: exporterTemporaryController.updateInternationalQuote,
  deleteInternationalQuote: exporterTemporaryController.deleteInternationalQuote,
  convertQuoteToOrder: exporterTemporaryController.convertQuoteToOrder,
  getExchangeRates: exporterTemporaryController.getExchangeRates,
  getHedgingPositions: exporterTemporaryController.getHedgingPositions,
  createHedgingPosition: exporterTemporaryController.createHedgingPosition,
  getMyDocuments: exporterTemporaryController.getMyDocuments,
  addDocument: exporterTemporaryController.addDocument,
  getNotifications: exporterTemporaryController.getNotifications,
  markNotificationsAsRead: exporterTemporaryController.markNotificationsAsRead,
  getMarketAlerts: exporterTemporaryController.getMarketAlerts,
  createMarketAlert: exporterTemporaryController.createMarketAlert
};

