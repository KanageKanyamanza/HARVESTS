const multer = require('multer');
const { createDynamicStorage } = require('../../config/cloudinary');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');

// Configuration Multer pour upload d'images utilisateur
const createUploadMiddleware = (contentType, fieldName = 'avatar') => {
  return (req, res, next) => {
    const userType = req.user?.userType || 'consumer';
    const storage = createDynamicStorage(userType, contentType);
    const upload = multer({
      storage: storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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

// Middleware d'upload d'avatar
exports.uploadUserPhoto = (req, res, next) => {
  const upload = createUploadMiddleware('profile', 'avatar');
  upload(req, res, next);
};

// Middleware d'upload de bannière
exports.uploadShopBanner = (req, res, next) => {
  const upload = createUploadMiddleware('marketing', 'shopBanner');
  upload(req, res, next);
};

// Middleware d'upload de logo
exports.uploadShopLogo = (req, res, next) => {
  const upload = createUploadMiddleware('profile', 'shopLogo');
  upload(req, res, next);
};

// Traitement après upload
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  
  // L'image est déjà traitée par Cloudinary
  // On peut ajouter des transformations supplémentaires ici si nécessaire
  next();
});

