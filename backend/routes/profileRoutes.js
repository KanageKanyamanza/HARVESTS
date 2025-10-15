const express = require('express');
const authController = require('../controllers/authController');
const profileService = require('../services/profileService');
const profileImageService = require('../services/profileImageService');
const { uploadLimiter, fileTypeValidation, fileSizeValidation } = require('../middleware/security');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authController.protect);

// Routes de profil communes
router.route('/me')
  .get(profileService.getProfile)
  .patch(profileService.updateProfile);

// Routes d'upload d'images
router.patch('/me/avatar', 
  uploadLimiter,
  profileImageService.uploadAvatar,
  profileImageService.processImageUpload,
  profileService.updateProfile
);

router.patch('/me/banner', 
  uploadLimiter,
  profileImageService.uploadShopBanner,
  profileImageService.processImageUpload,
  profileService.updateProfile
);

router.patch('/me/logo', 
  uploadLimiter,
  profileImageService.uploadShopLogo,
  profileImageService.processImageUpload,
  profileService.updateProfile
);

// Routes de suppression d'images
router.delete('/me/images/:imageType', profileService.deleteProfileImage);

// Routes de statistiques communes
router.get('/me/stats', profileService.getCommonStats);

// Routes de préférences
router.patch('/me/notifications', profileService.updateNotificationPreferences);

module.exports = router;
