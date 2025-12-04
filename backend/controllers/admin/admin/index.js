/**
 * Contrôleurs pour la gestion des administrateurs
 * Réorganisés en sous-modules pour une meilleure maintenabilité
 */
const adminCRUDController = require('./adminCRUDController');
const adminProfileController = require('./adminProfileController');
const adminPasswordController = require('./adminPasswordController');
const adminStatusController = require('./adminStatusController');
const adminStatsController = require('./adminStatsController');

module.exports = {
  // CRUD
  createAdmin: adminCRUDController.createAdmin,
  getAllAdmins: adminCRUDController.getAllAdmins,
  getAdmin: adminCRUDController.getAdmin,
  updateAdmin: adminCRUDController.updateAdmin,
  deleteAdmin: adminCRUDController.deleteAdmin,
  
  // Profil
  getMe: adminProfileController.getMe,
  updateMe: adminProfileController.updateMe,
  uploadAvatar: adminProfileController.uploadAvatar,
  uploadAdminPhoto: adminProfileController.uploadAdminPhoto,
  
  // Mot de passe
  changePassword: adminPasswordController.changePassword,
  
  // Statut
  toggleAdminStatus: adminStatusController.toggleAdminStatus,
  
  // Statistiques
  getAdminStats: adminStatsController.getAdminStats
};

