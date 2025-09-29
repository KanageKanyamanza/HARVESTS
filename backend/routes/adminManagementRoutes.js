const express = require('express');
const adminController = require('../controllers/adminController');
const adminAuthController = require('../controllers/adminAuthController');
const { protect, restrictTo } = require('../controllers/adminAuthController');

const router = express.Router();

// Routes publiques
router.post('/auth/login', adminAuthController.login);
router.post('/auth/logout', adminAuthController.logout);

// Routes protégées
router.use(adminAuthController.protect);

// Routes pour le profil de l'admin connecté
router.get('/me', adminController.getMe);
router.put('/me', adminController.updateMe);

// Routes pour la gestion des administrateurs
router.route('/admins')
  .get(restrictTo('super-admin', 'admin'), adminController.getAllAdmins)
  .post(restrictTo('super-admin', 'admin'), adminController.createAdmin);

router.route('/admins/stats')
  .get(restrictTo('super-admin', 'admin'), adminController.getAdminStats);

router.route('/admins/:id')
  .get(restrictTo('super-admin', 'admin'), adminController.getAdmin)
  .put(restrictTo('super-admin', 'admin'), adminController.updateAdmin)
  .delete(restrictTo('super-admin'), adminController.deleteAdmin);

router.route('/admins/:id/password')
  .put(restrictTo('super-admin', 'admin'), adminController.changePassword);

router.route('/admins/:id/toggle-status')
  .put(restrictTo('super-admin', 'admin'), adminController.toggleAdminStatus);

module.exports = router;
