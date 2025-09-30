const multer = require('multer');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/User');
const { 
  createDynamicStorage, 
  cloudinary, 
  deleteImage,
  getOptimizedUrl 
} = require('../config/cloudinary');

// Configuration Multer pour Cloudinary
const createUploadMiddleware = (contentType, category = null, fieldName = 'image', maxFiles = 1) => {
  const storage = createDynamicStorage('producer', contentType, category);
  
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB maximum
      files: maxFiles
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image')) {
        cb(null, true);
      } else {
        cb(new AppError('Seules les images sont autorisées!', 400), false);
      }
    }
  });

  if (maxFiles === 1) {
    return upload.single(fieldName);
  } else {
    return upload.array(fieldName, maxFiles);
  }
};

// Middleware d'upload pour avatar
exports.uploadAvatar = createUploadMiddleware('profile', null, 'avatar', 1);

// Middleware d'upload pour bannière de boutique
exports.uploadShopBanner = createUploadMiddleware('marketing', null, 'shopBanner', 1);

// Middleware d'upload pour logo de boutique
exports.uploadShopLogo = createUploadMiddleware('profile', null, 'shopLogo', 1);

// Middleware d'upload multiple pour images de produits
exports.uploadProductImages = createUploadMiddleware('product', 'cereals', 'images', 10);

// Traiter l'avatar uploadé avec Cloudinary
exports.processAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) return next();


  // Cloudinary retourne déjà l'URL optimisée dans req.file.path
  req.body.avatar = req.file.path;

  next();
});

// Traiter la bannière de boutique uploadée avec Cloudinary
exports.processShopBanner = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // Cloudinary retourne déjà l'URL optimisée dans req.file.path
  req.body.shopBanner = req.file.path;

  next();
});

// Traiter le logo de boutique uploadé avec Cloudinary
exports.processShopLogo = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // Cloudinary retourne déjà l'URL optimisée dans req.file.path
  req.body.shopLogo = req.file.path;

  next();
});

// Traiter les images de produits uploadées avec Cloudinary
exports.processProductImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  req.body.images = req.files.map((file, i) => ({
    url: file.path, // Cloudinary retourne déjà l'URL optimisée
    alt: `Image ${i + 1}`,
    isPrimary: i === 0,
    publicId: file.filename // Pour suppression future si nécessaire
  }));

  next();
});

// Upload d'avatar avec mise à jour du profil
exports.uploadUserAvatar = catchAsync(async (req, res, next) => {
  // Récupérer l'utilisateur actuel pour voir l'ancien avatar
  const currentUser = await User.findById(req.user.id);
  const oldAvatar = currentUser.avatar;
  
  // Mettre à jour l'avatar
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: req.body.avatar },
    { new: true, runValidators: true }
  );

  // Supprimer l'ancien avatar si c'est une image locale
  if (oldAvatar && oldAvatar.startsWith('/img/')) {
    try {
      const fs = require('fs');
      const path = require('path');
      const fullPath = path.join(__dirname, '..', 'public', oldAvatar);
      
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error('uploadUserAvatar - erreur suppression ancien avatar:', error.message);
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        avatar: user.avatar
      }
    }
  });
});

// Upload de bannière de boutique
exports.uploadShopBannerImage = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { shopBanner: req.body.shopBanner },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        shopBanner: user.shopBanner
      }
    }
  });
});

// Supprimer une image de Cloudinary
exports.deleteImage = catchAsync(async (req, res, next) => {
  const { publicId } = req.params;
  
  if (!publicId) {
    return next(new AppError('ID public de l\'image requis', 400));
  }

  try {
    const result = await deleteImage(publicId);
    
    if (result.result === 'ok') {
      res.status(204).json({
        status: 'success',
        data: null
      });
    } else {
      return next(new AppError('Erreur lors de la suppression de l\'image', 400));
    }
  } catch (error) {
    return next(new AppError('Erreur lors de la suppression de l\'image: ' + error.message, 500));
  }
});

// Supprimer une image par URL (utile pour migration depuis stockage local)
exports.deleteImageByUrl = catchAsync(async (req, res, next) => {
  const { imageUrl } = req.body;
  
  if (!imageUrl) {
    return next(new AppError('URL de l\'image requise', 400));
  }

  try {
    // Extraire le public_id de l'URL Cloudinary
    const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
    const result = await deleteImage(publicId);
    
    if (result.result === 'ok') {
      res.status(204).json({
        status: 'success',
        data: null
      });
    } else {
      return next(new AppError('Erreur lors de la suppression de l\'image', 400));
    }
  } catch (error) {
    return next(new AppError('Erreur lors de la suppression de l\'image: ' + error.message, 500));
  }
});

// Obtenir une URL optimisée pour une image existante
exports.getOptimizedImageUrl = catchAsync(async (req, res, next) => {
  const { publicId } = req.params;
  const { width, height, quality, format } = req.query;
  
  if (!publicId) {
    return next(new AppError('ID public de l\'image requis', 400));
  }

  const options = {};
  if (width) options.width = parseInt(width);
  if (height) options.height = parseInt(height);
  if (quality) options.quality = quality;
  if (format) options.format = format;

  const optimizedUrl = getOptimizedUrl(publicId, options);

  res.status(200).json({
    status: 'success',
    data: {
      originalUrl: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`,
      optimizedUrl: optimizedUrl,
      options: options
    }
  });
});

// Upload direct vers Cloudinary (pour utilisation avec des fichiers existants)
exports.uploadToCloudinary = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Aucun fichier fourni', 400));
  }

  try {
    // Utiliser Cloudinary pour uploader directement
    const result = await cloudinary.uploader.upload(req.file.buffer, {
      folder: 'harvests/uploads',
      quality: 'auto:best',
      fetch_format: 'auto'
    });

    res.status(200).json({
      status: 'success',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      }
    });
  } catch (error) {
    return next(new AppError('Erreur lors de l\'upload: ' + error.message, 500));
  }
});
