const express = require('express');
const adminManagementController = require('../controllers/admin/adminManagementController');
const adminAuthController = require('../controllers/adminAuthController');
const { protect, restrictTo } = require('../controllers/adminAuthController');

/**
 * @swagger
 * tags:
 *   name: Admin Management
 *   description: 👥 Gestion des administrateurs
 */

const router = express.Router();

// Routes publiques
router.post('/auth/login', adminAuthController.login);
router.post('/auth/logout', adminAuthController.logout);

// Routes protégées
router.use(adminAuthController.protect);

/**
 * @swagger
 * /api/v1/admin-management/me:
 *   get:
 *     summary: Obtenir mon profil admin
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil admin
 *   put:
 *     summary: Mettre à jour mon profil admin
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profil mis à jour
 */
router.get('/me', adminManagementController.getMe);
router.put('/me', adminManagementController.updateMe);

/**
 * @swagger
 * /api/v1/admin-management/me/avatar:
 *   patch:
 *     summary: Upload avatar admin
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploadé
 */
router.patch('/me/avatar', 
  adminManagementController.uploadAdminPhoto,
  adminManagementController.uploadAvatar
);

/**
 * @swagger
 * /api/v1/admin-management/me/password:
 *   put:
 *     summary: Changer mon mot de passe admin
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mot de passe changé
 */
router.put('/me/password', adminManagementController.changeMyPassword);

/**
 * @swagger
 * /api/v1/admin-management/admins:
 *   get:
 *     summary: Obtenir tous les administrateurs (Super Admin/Admin)
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des administrateurs
 *   post:
 *     summary: Créer un nouvel administrateur (Super Admin/Admin)
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - role
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [super-admin, admin, moderator]
 *     responses:
 *       201:
 *         description: Administrateur créé
 */
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
