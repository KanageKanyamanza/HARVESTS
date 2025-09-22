const express = require('express');
const uploadController = require('../controllers/uploadController');
const authController = require('../controllers/authController');
const { fileTypeValidation, fileSizeValidation } = require('../middleware/security');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authController.protect);

// Upload d'avatar utilisateur
router.patch('/avatar',
  uploadController.uploadAvatar,
  uploadController.processAvatar,
  uploadController.uploadUserAvatar
);

// Upload de bannière de boutique
router.patch('/shop-banner',
  uploadController.uploadShopBanner,
  uploadController.processShopBanner,
  uploadController.uploadShopBannerImage
);

// Upload de logo de boutique
router.patch('/shop-logo',
  uploadController.uploadShopLogo,
  uploadController.processShopLogo,
  uploadController.uploadShopBannerImage // Réutiliser la même logique
);

// Upload d'images de produits
router.post('/product-images',
  uploadController.uploadProductImages,
  uploadController.processProductImages,
  (req, res) => {
    res.status(200).json({
      status: 'success',
      data: {
        images: req.body.images
      }
    });
  }
);

// Upload direct vers Cloudinary
router.post('/cloudinary',
  fileTypeValidation(['image/jpeg', 'image/png', 'image/webp']),
  fileSizeValidation(5 * 1024 * 1024), // 5MB
  uploadController.uploadToCloudinary
);

// Supprimer une image par public ID
router.delete('/image/:publicId',
  uploadController.deleteImage
);

// Supprimer une image par URL
router.delete('/image-by-url',
  uploadController.deleteImageByUrl
);

// Obtenir URL optimisée
router.get('/optimize/:publicId',
  uploadController.getOptimizedImageUrl
);

module.exports = router;
