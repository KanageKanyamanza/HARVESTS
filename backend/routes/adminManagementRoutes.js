const express = require('express');
const adminManagementController = require('../controllers/admin/adminManagementController');
const adminAuthController = require('../controllers/adminAuthController');
const { protect, restrictTo } = require('../controllers/adminAuthController');

const router = express.Router();

// Routes publiques
router.post('/auth/login', adminAuthController.login);
router.post('/auth/logout', adminAuthController.logout);

// Routes protégées
router.use(adminAuthController.protect);

// Routes pour le profil de l'admin connecté
router.get('/me', adminManagementController.getMe);
router.put('/me', adminManagementController.updateMe);

// Routes pour la gestion des administrateurs
router.route('/admins')
  .get(restrictTo('super-admin', 'admin'), adminManagementController.getAllAdmins)
  .post(restrictTo('super-admin', 'admin'), adminManagementController.createAdmin);

router.route('/admins/stats')
  .get(restrictTo('super-admin', 'admin'), adminManagementController.getAdminStats);

router.route('/admins/:id')
  .get(restrictTo('super-admin', 'admin'), adminManagementController.getAdmin)
  .put(restrictTo('super-admin', 'admin'), adminManagementController.updateAdmin)
  .delete(restrictTo('super-admin'), adminManagementController.deleteAdmin);

router.route('/admins/:id/password')
  .put(restrictTo('super-admin', 'admin'), adminManagementController.changePassword);

router.route('/admins/:id/toggle-status')
  .put(restrictTo('super-admin', 'admin'), adminManagementController.toggleAdminStatus);

module.exports = router;
