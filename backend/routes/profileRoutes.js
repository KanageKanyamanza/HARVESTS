const express = require('express');
const authMiddleware = require('../controllers/auth/authMiddleware');
const profileService = require('../services/profileService');
const profileImageService = require('../services/profileImageService');
const { uploadLimiter, fileTypeValidation, fileSizeValidation } = require('../middleware/security');

/**
 * @swagger
 * tags:
 *   name: Profiles
 *   description: 👤 Profils utilisateurs centralisés
 */

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware.protect);

/**
 * @swagger
 * /api/v1/profiles/me:
 *   get:
 *     summary: Obtenir mon profil (service centralisé)
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *   patch:
 *     summary: Mettre à jour mon profil (service centralisé)
 *     tags: [Profiles]
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
router.route('/me')
  .get(profileService.getProfile)
  .patch(profileService.updateProfile);

// Routes d'upload d'images
/**
 * @swagger
 * /api/v1/profiles/me/avatar:
 *   patch:
 *     summary: Upload avatar de profil
 *     tags: [Profiles]
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
 *         description: Avatar uploadé avec succès
 */
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
