const multer = require('multer');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { createDynamicStorage } = require('../../config/cloudinary');

// Configuration Multer pour Cloudinary
const createUploadMiddleware = (contentType, category = null, fieldName = 'images', maxFiles = 5) => {
  const storage = createDynamicStorage('producer', contentType, category);
  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024, files: maxFiles },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image') || file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new AppError('Veuillez télécharger uniquement des images ou des PDF!', 400), false);
      }
    }
  });
  return maxFiles === 1 ? upload.single(fieldName) : upload.array(fieldName, maxFiles);
};

exports.uploadProductImages = createUploadMiddleware('product', 'cereals', 'images', 5);
exports.uploadCertificationDocument = createUploadMiddleware('document', null, 'document', 1);
exports.uploadDocument = createUploadMiddleware('document', null, 'document', 1);

// Middleware pour traiter les images de produits
exports.processProductImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  req.body.images = req.files.map((file, index) => ({
    url: file.path,
    alt: `Image ${index + 1}`,
    isPrimary: index === 0,
    order: index
  }));

  next();
});

