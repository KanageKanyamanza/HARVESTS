const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../controllers/auth/authMiddleware');
const { uploadLimiter, fileTypeValidation, fileSizeValidation } = require('../middleware/security');

const router = express.Router();

// Toutes les routes sont protégées
router.use(authMiddleware.protect);

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
