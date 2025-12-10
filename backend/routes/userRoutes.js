const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../controllers/auth/authMiddleware');
const { uploadLimiter, fileTypeValidation, fileSizeValidation } = require('../middleware/security');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 👥 Gestion des utilisateurs
 */

const router = express.Router();

// Toutes les routes sont protégées
router.use(authMiddleware.protect);

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Obtenir mon profil utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/me', userController.getMe, userController.getUser);

/**
 * @swagger
 * /api/v1/users/update-me:
 *   patch:
 *     summary: Mettre à jour mon profil
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: object
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil mis à jour
 */
router.patch('/update-me', userController.updateMe);

/**
 * @swagger
 * /api/v1/users/delete-me:
 *   delete:
 *     summary: Supprimer mon compte
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Compte supprimé
 */
router.delete('/delete-me', userController.deleteMe);

// Import des services centralisés
const profileImageService = require('../services/profileImageService');
const profileService = require('../services/profileService');

// Upload d'avatar
router.patch('/upload-avatar', 
  uploadLimiter,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

// Upload de bannière de boutique
router.patch('/upload-shop-banner', 
  uploadLimiter,
  userController.uploadShopBanner,
  userController.resizeUserPhoto,
  userController.updateMe
);

// Upload de logo de boutique
router.patch('/upload-shop-logo', 
  uploadLimiter,
  userController.uploadShopLogo,
  userController.resizeUserPhoto,
  userController.updateMe
);

// Gestion des adresses (pour les consommateurs principalement)
router.route('/addresses')
  .get(userController.getMyAddresses)
  .post(userController.addAddress);

router.route('/addresses/:addressId')
  .patch(userController.updateAddress)
  .delete(userController.deleteAddress);

// Routes communes pour tous les utilisateurs
// Statistiques communes
router.get('/me/common-stats', userController.getCommonStats);
router.get('/me/financial-info', userController.getFinancialInfo);
router.get('/me/notification-settings', userController.getNotificationSettings);
router.get('/me/verification-status', userController.getVerificationStatus);
router.get('/me/delivery-addresses', userController.getDeliveryAddresses);

// Mise à jour des informations communes
router.patch('/me/financial-info', userController.updateFinancialInfo);
router.patch('/me/notification-settings', userController.updateNotificationSettings);
router.post('/me/delivery-addresses', userController.addDeliveryAddress);
router.patch('/me/delivery-addresses/:addressId', userController.updateDeliveryAddress);
router.delete('/me/delivery-addresses/:addressId', userController.deleteDeliveryAddress);

// Routes administratives (admin seulement)
router.use(authMiddleware.restrictTo('admin'));

router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

// Approbation des comptes
router.patch('/:id/approve', userController.approveUser);
router.patch('/:id/reject', userController.rejectUser);
router.patch('/:id/suspend', userController.suspendUser);
router.patch('/:id/reactivate', userController.reactivateUser);

module.exports = router;
