const multer = require('multer');
const { createDynamicStorage } = require('../config/cloudinary');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Configuration Multer pour upload d'images de profil
const createImageUploadMiddleware = (imageType, fieldName) => {
  return (req, res, next) => {
    const userType = req.user?.userType || 'consumer';
    
    // Déterminer le type de contenu selon l'image
    let contentType;
    switch (imageType) {
      case 'avatar':
        contentType = 'profile';
        break;
      case 'banner':
        contentType = 'marketing';
        break;
      case 'logo':
        contentType = 'profile';
        break;
      default:
        contentType = 'profile';
    }
    
    const storage = createDynamicStorage(userType, contentType);
    const upload = multer({
      storage: storage,
      limits: { 
        fileSize: imageType === 'banner' ? 5 * 1024 * 1024 : 2 * 1024 * 1024 // 5MB pour bannière, 2MB pour le reste
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
          cb(null, true);
        } else {
          cb(new AppError('Veuillez télécharger uniquement des images!', 400), false);
        }
      }
    });
    
    upload.single(fieldName)(req, res, next);
  };
};

// Middlewares d'upload spécialisés (compatibles avec l'ancien système)
exports.uploadAvatar = createImageUploadMiddleware('avatar', 'avatar');
exports.uploadShopBanner = createImageUploadMiddleware('banner', 'shopBanner'); // Accepte 'shopBanner'
exports.uploadShopLogo = createImageUploadMiddleware('logo', 'shopLogo'); // Accepte 'shopLogo'

// Traitement après upload
exports.processImageUpload = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  
  // L'image est déjà traitée par Cloudinary
  // req.file.path contient l'URL Cloudinary
  next();
});

// Fonction utilitaire pour mettre à jour le profil avec l'image
exports.updateProfileWithImage = (Model, imageField) => {
  return catchAsync(async (req, res, next) => {
    if (!req.file) return next();
    
    const imageUrl = req.file.path;
    const updateData = {};
    
    // Mapper les champs de l'ancien système vers les nouveaux
    const fieldMapping = {
      'avatar': 'avatar',
      'shopBanner': 'shopBanner', 
      'shopLogo': 'shopLogo'
    };
    
    const actualField = fieldMapping[imageField] || imageField;
    updateData[actualField] = imageUrl;
    
    // Mettre à jour le profil
    const updatedProfile = await Model.findByIdAndUpdate(
      req.user.id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    // Ajouter l'URL à la réponse
    req.uploadedImageUrl = imageUrl;
    req.updatedProfile = updatedProfile;
    
    next();
  });
};

// Service pour supprimer une image
exports.deleteImage = catchAsync(async (req, res, next) => {
  const { imageType } = req.params;
  const userId = req.user.id;
  
  const updateData = {};
  switch (imageType) {
    case 'avatar':
      updateData.avatar = null;
      break;
    case 'banner':
      updateData.shopBanner = null;
      break;
    case 'logo':
      updateData.shopLogo = null;
      break;
    default:
      return next(new AppError('Type d\'image invalide', 400));
  }
  
  // Mettre à jour le profil
  const updatedProfile = await Model.findByIdAndUpdate(
    userId, 
    updateData, 
    { new: true, runValidators: true }
  );
  
  req.updatedProfile = updatedProfile;
  next();
});

module.exports = {
  uploadAvatar: exports.uploadAvatar,
  uploadShopBanner: exports.uploadShopBanner,
  uploadShopLogo: exports.uploadShopLogo,
  processImageUpload: exports.processImageUpload,
  updateProfileWithImage: exports.updateProfileWithImage,
  deleteImage: exports.deleteImage
};
