const multer = require('multer');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');

// Configuration Multer pour les images de produits
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Veuillez télécharger uniquement des images!', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB par image
    files: 10 // Maximum 10 images
  }
});

exports.uploadProductImages = upload.array('images', 10);

// Middleware pour redimensionner les images (placeholder)
exports.resizeProductImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  req.body.images = [];

  await Promise.all(
    req.files.map(async (file, i) => {
      const filename = `product-${req.user.id}-${Date.now()}-${i + 1}.jpeg`;
      
      // Ici on devrait utiliser Sharp pour redimensionner
      // Pour l'instant, on simule juste
      req.body.images.push({
        url: `/img/products/${filename}`,
        alt: `Image ${i + 1}`,
        isPrimary: i === 0
      });
    })
  );

  next();
});

