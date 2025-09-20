const multer = require('multer');
const { createDynamicStorage } = require('../config/cloudinary');
const AppError = require('../utils/appError');

// Configuration générale de multer
const multerConfig = {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 10 // 10 fichiers max
  },
  fileFilter: (req, file, cb) => {
    // Vérifier le type de fichier
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Seules les images sont autorisées', 400), false);
    }
  }
};

// Middleware pour upload d'image de profil
const uploadProfilePicture = (userType = 'producer') => {
  const storage = createDynamicStorage(userType, 'profile');
  
  return multer({
    storage: storage,
    ...multerConfig
  }).single('profilePicture');
};

// Middleware pour upload d'images produit
const uploadProductImages = (category = 'cereals') => {
  const storage = createDynamicStorage('producer', 'product', category);
  
  return multer({
    storage: storage,
    ...multerConfig
  }).array('productImages', 5); // Max 5 images par produit
};

// Middleware pour upload de documents
const uploadDocument = () => {
  const storage = createDynamicStorage('producer', 'document');
  
  return multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB pour documents
      files: 5
    },
    fileFilter: (req, file, cb) => {
      // Accepter images et PDFs pour documents
      if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new AppError('Seules les images et PDFs sont autorisés pour les documents', 400), false);
      }
    }
  }).array('documents', 5);
};

// Middleware pour upload de banners marketing
const uploadMarketingBanner = () => {
  const storage = createDynamicStorage('producer', 'marketing');
  
  return multer({
    storage: storage,
    ...multerConfig
  }).single('banner');
};

// Middleware générique avec storage dynamique
const createUploadMiddleware = (userType, contentType, category = null, fieldName = 'image', maxFiles = 1) => {
  const storage = createDynamicStorage(userType, contentType, category);
  
  const upload = multer({
    storage: storage,
    ...multerConfig
  });
  
  if (maxFiles === 1) {
    return upload.single(fieldName);
  } else {
    return upload.array(fieldName, maxFiles);
  }
};

// Middleware pour traiter les erreurs d'upload
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('Fichier trop volumineux. Maximum 5MB autorisé', 400));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new AppError('Trop de fichiers. Maximum 10 fichiers autorisés', 400));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new AppError('Champ de fichier inattendu', 400));
    }
  }
  
  if (err) {
    return next(new AppError('Erreur lors de l\'upload: ' + err.message, 400));
  }
  
  next();
};

// Middleware pour optimiser les données d'image après upload
const processUploadedImages = (req, res, next) => {
  // Traiter image unique
  if (req.file) {
    req.file.optimizedUrl = req.file.path; // Cloudinary retourne déjà l'URL optimisée
    req.file.publicId = req.file.filename; // Public ID pour suppression future
  }
  
  // Traiter images multiples
  if (req.files && req.files.length > 0) {
    req.files = req.files.map(file => ({
      ...file,
      optimizedUrl: file.path,
      publicId: file.filename
    }));
  }
  
  next();
};

module.exports = {
  uploadProfilePicture,
  uploadProductImages,
  uploadDocument,
  uploadMarketingBanner,
  createUploadMiddleware,
  handleUploadError,
  processUploadedImages
};
