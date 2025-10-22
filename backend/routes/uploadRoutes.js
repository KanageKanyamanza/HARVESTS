const express = require('express');
const uploadController = require('../controllers/uploadController');
const authController = require('../controllers/authController');
const { uploadLimiter, fileTypeValidation, fileSizeValidation } = require('../middleware/security');

const router = express.Router();

// Toutes les routes d'upload nécessitent une authentification
router.use(authController.protect);

// Upload d'images de produits
router.post(
  '/product-images',
  uploadLimiter,
  uploadController.uploadProductImages,
  fileTypeValidation(['image/jpeg', 'image/png', 'image/webp']),
  fileSizeValidation(5 * 1024 * 1024), // 5MB par image
  uploadController.uploadProductImagesToCloudinary
);

// Supprimer une image par public ID
router.delete('/image/:publicId', uploadController.deleteImage);

// Supprimer une image par URL
router.delete('/image-by-url', uploadController.deleteImageByUrl);

// Obtenir une URL optimisée
router.get('/optimize/:publicId', uploadController.getOptimizedImageUrl);

module.exports = router;
