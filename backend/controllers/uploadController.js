const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuration multer pour la mémoire
const storage = multer.memoryStorage();

// Filtre de fichiers
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Seules les images sont autorisées!', 400), false);
  }
};

// Configuration multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB par image
    files: 10 // Maximum 10 images
  }
});

// Middleware d'upload
exports.uploadProductImages = upload.array('images', 10);

// Middleware d'upload pour un seul fichier (pour Cloudinary direct)
exports.uploadSingleFile = upload.single('file');

// Upload d'images de produits vers Cloudinary
exports.uploadProductImagesToCloudinary = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new AppError('Aucune image fournie', 400));
  }

  try {
    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'harvests/products',
            resource_type: 'image',
            transformation: [
              { width: 800, height: 600, crop: 'fit', quality: 'auto' },
              { format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve({
                public_id: result.public_id,
                secure_url: result.secure_url,
                original_filename: file.originalname,
                size: file.size,
                format: result.format,
                width: result.width,
                height: result.height
              });
            }
          }
        );

        uploadStream.end(file.buffer);
      });
    });

    const uploadResults = await Promise.all(uploadPromises);

    res.status(200).json({
      status: 'success',
      message: 'Images uploadées avec succès',
      data: {
        images: uploadResults,
        count: uploadResults.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload Cloudinary:', error);
    return next(new AppError('Erreur lors de l\'upload des images', 500));
  }
});

// Supprimer une image de Cloudinary
exports.deleteImage = catchAsync(async (req, res, next) => {
  const { publicId } = req.params;

  if (!publicId) {
    return next(new AppError('Public ID requis', 400));
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'not found') {
      return next(new AppError('Image non trouvée', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Image supprimée avec succès',
      data: { result }
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return next(new AppError('Erreur lors de la suppression de l\'image', 500));
  }
});

// Supprimer une image par URL
exports.deleteImageByUrl = catchAsync(async (req, res, next) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return next(new AppError('URL de l\'image requise', 400));
  }

  try {
    // Extraire le public_id de l'URL Cloudinary
    const publicId = extractPublicIdFromUrl(imageUrl);
    
    if (!publicId) {
      return next(new AppError('URL d\'image invalide', 400));
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'not found') {
      return next(new AppError('Image non trouvée', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Image supprimée avec succès',
      data: { result }
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return next(new AppError('Erreur lors de la suppression de l\'image', 500));
  }
});

// Upload direct vers Cloudinary (pour les blogs, etc.)
exports.uploadToCloudinary = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Aucun fichier fourni', 400));
  }

  try {
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: req.body.folder || 'harvests/general',
          resource_type: 'image',
          transformation: req.body.transformations ? JSON.parse(req.body.transformations) : [
            { width: 1200, height: 800, crop: 'fit', quality: 'auto' },
            { format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    res.status(200).json({
      status: 'success',
      message: 'Image uploadée avec succès',
      data: {
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        url: uploadResult.url,
        original_filename: req.file.originalname,
        size: req.file.size,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        folder: uploadResult.folder
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload Cloudinary:', error);
    return next(new AppError('Erreur lors de l\'upload de l\'image', 500));
  }
});

// Obtenir une URL optimisée
exports.getOptimizedImageUrl = catchAsync(async (req, res, next) => {
  const { publicId } = req.params;
  const { width, height, quality = 'auto', format = 'auto', crop = 'fit' } = req.query;

  if (!publicId) {
    return next(new AppError('Public ID requis', 400));
  }

  try {
    const options = {
      width: width ? parseInt(width) : undefined,
      height: height ? parseInt(height) : undefined,
      quality,
      format,
      crop
    };

    // Supprimer les options undefined
    Object.keys(options).forEach(key => {
      if (options[key] === undefined) {
        delete options[key];
      }
    });

    const optimizedUrl = cloudinary.url(publicId, options);

    res.status(200).json({
      status: 'success',
      data: {
        original_url: cloudinary.url(publicId),
        optimized_url: optimizedUrl,
        options
      }
    });
  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL:', error);
    return next(new AppError('Erreur lors de la génération de l\'URL', 500));
  }
});

// Fonction utilitaire pour extraire le public_id d'une URL Cloudinary
function extractPublicIdFromUrl(url) {
  if (!url || !url.includes('cloudinary.com')) return null;
  
  const parts = url.split('/');
  const uploadIndex = parts.findIndex(part => part === 'upload');
  
  if (uploadIndex === -1 || uploadIndex + 1 >= parts.length) return null;
  
  // Extraire le public_id (partie après 'upload' et avant l'extension)
  const publicIdWithVersion = parts.slice(uploadIndex + 1).join('/');
  return publicIdWithVersion.split('.')[0];
}
