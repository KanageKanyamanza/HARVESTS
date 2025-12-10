const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../controllers/auth/authMiddleware');
const adminAuthController = require('../controllers/adminAuthController');
const { uploadLimiter, fileTypeValidation, fileSizeValidation } = require('../middleware/security');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: 📸 Upload d'images et fichiers (Cloudinary)
 */

const router = express.Router();

// Middleware qui accepte à la fois les utilisateurs normaux et les admins
const protectUserOrAdmin = catchAsync(async (req, res, next) => {
  // 1) Récupérer le token
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('Vous n\'êtes pas connecté. Veuillez vous connecter pour accéder à cette page.', 401));
  }

  // 2) Vérifier le token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Essayer d'abord de trouver un admin avec cet ID
  const admin = await Admin.findById(decoded.id);
  if (admin && admin.isActive) {
    req.admin = admin;
    return next();
  }

  // 4) Si ce n'est pas un admin, essayer de trouver un utilisateur normal
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('L\'utilisateur propriétaire de ce token n\'existe plus.', 401));
  }

  // 5) Vérifier si l'utilisateur a changé de mot de passe après l'émission du token
  if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('L\'utilisateur a récemment changé de mot de passe! Veuillez vous reconnecter.', 401));
  }

  // 6) Vérifier si le compte est actif
  if (!user.isActive) {
    return next(new AppError('Votre compte a été désactivé.', 401));
  }

  // 7) Donner accès à la route protégée
  req.user = user;
  next();
});

// Toutes les routes d'upload nécessitent une authentification (utilisateur ou admin)
router.use(protectUserOrAdmin);

/**
 * @swagger
 * /api/v1/upload/product-images:
 *   post:
 *     summary: Upload d'images de produits
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploadées avec succès
 */
router.post(
  '/product-images',
  uploadLimiter,
  uploadController.uploadProductImages,
  fileTypeValidation(['image/jpeg', 'image/png', 'image/webp']),
  fileSizeValidation(5 * 1024 * 1024), // 5MB par image
  uploadController.uploadProductImagesToCloudinary
);

/**
 * @swagger
 * /api/v1/upload/image/{publicId}:
 *   delete:
 *     summary: Supprimer une image par public ID
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image supprimée
 */
router.delete('/image/:publicId', uploadController.deleteImage);

// Supprimer une image par URL
router.delete('/image-by-url', uploadController.deleteImageByUrl);

// Obtenir une URL optimisée
router.get('/optimize/:publicId', uploadController.getOptimizedImageUrl);

/**
 * @swagger
 * /api/v1/upload/cloudinary:
 *   post:
 *     summary: Upload direct vers Cloudinary (images générales)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 example: blog
 *     responses:
 *       200:
 *         description: Fichier uploadé avec succès
 */
router.post(
  '/cloudinary',
  uploadLimiter,
  uploadController.uploadSingleFile,
  fileTypeValidation(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  fileSizeValidation(10 * 1024 * 1024), // 10MB pour les images de blog
  uploadController.uploadToCloudinary
);

module.exports = router;
