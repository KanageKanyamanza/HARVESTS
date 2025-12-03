// Export all user controllers
const userProfileController = require('./userProfileController');
const userAdminController = require('./userAdminController');
const userSettingsController = require('./userSettingsController');
const userUploadController = require('./userUploadController');

module.exports = {
  // Uploads
  uploadUserPhoto: userUploadController.uploadUserPhoto,
  uploadShopBanner: userUploadController.uploadShopBanner,
  uploadShopLogo: userUploadController.uploadShopLogo,
  resizeUserPhoto: userUploadController.resizeUserPhoto,
  
  // Profile routes
  getMe: userProfileController.getMe,
  updateMe: userProfileController.updateMe,
  deleteMe: userProfileController.deleteMe,
  getMyAddresses: userProfileController.getMyAddresses,
  addAddress: userProfileController.addAddress,
  updateAddress: userProfileController.updateAddress,
  deleteAddress: userProfileController.deleteAddress,
  
  // Admin routes
  getAllUsers: userAdminController.getAllUsers,
  getUser: userAdminController.getUser,
  createUser: userAdminController.createUser,
  updateUser: userAdminController.updateUser,
  deleteUser: userAdminController.deleteUser,
  approveUser: userAdminController.approveUser,
  rejectUser: userAdminController.rejectUser,
  suspendUser: userAdminController.suspendUser,
  reactivateUser: userAdminController.reactivateUser,
  getCommonStats: userAdminController.getCommonStats,
  
  // Settings routes
  getFinancialInfo: userSettingsController.getFinancialInfo,
  updateFinancialInfo: userSettingsController.updateFinancialInfo,
  getNotificationSettings: userSettingsController.getNotificationSettings,
  updateNotificationSettings: userSettingsController.updateNotificationSettings,
  getVerificationStatus: userSettingsController.getVerificationStatus,
  getDeliveryAddresses: userSettingsController.getDeliveryAddresses,
  addDeliveryAddress: userSettingsController.addDeliveryAddress,
  updateDeliveryAddress: userSettingsController.updateDeliveryAddress,
  deleteDeliveryAddress: userSettingsController.deleteDeliveryAddress
};

