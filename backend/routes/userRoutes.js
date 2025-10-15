const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { uploadLimiter, fileTypeValidation, fileSizeValidation } = require('../middleware/security');

const router = express.Router();

// Toutes les routes sont protégées
router.use(authController.protect);

// Routes communes à tous les utilisateurs
router.get('/me', userController.getMe, userController.getUser);
router.patch('/update-me', userController.updateMe);
router.delete('/delete-me', userController.deleteMe);

// Import des services centralisés
const profileImageService = require('../services/profileImageService');
const profileService = require('../services/profileService');

// Upload d'avatar
router.patch('/upload-avatar', 
  uploadLimiter,
  profileImageService.uploadAvatar,
  profileImageService.processImageUpload,
  profileService.updateProfile
);

// Upload de bannière de boutique
router.patch('/upload-shop-banner', 
  uploadLimiter,
  profileImageService.uploadShopBanner,
  profileImageService.processImageUpload,
  profileService.updateProfile
);

// Upload de logo de boutique
router.patch('/upload-shop-logo', 
  uploadLimiter,
  profileImageService.uploadShopLogo,
  profileImageService.processImageUpload,
  profileService.updateProfile
);

// Gestion des adresses (pour les consommateurs principalement)
router.route('/addresses')
  .get(userController.getMyAddresses)
  .post(userController.addAddress);

router.route('/addresses/:addressId')
  .patch(userController.updateAddress)
  .delete(userController.deleteAddress);

// Routes administratives (admin seulement)
router.use(authController.restrictTo('admin'));

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
