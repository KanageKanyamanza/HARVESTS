const Producer = require('../models/Producer');
const Product = require('../models/Product');
const Order = require('../models/Order');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const orderController = require('./orderController');
const { createDynamicStorage } = require('../config/cloudinary');
const multer = require('multer');
const { toPlainText } = require('../utils/localization');

// Import de la fonction de notification depuis orderController
const { sendStatusNotifications } = require('./orderController');

// Services organisés par type
const producerSearchService = require('../services/producer/producerSearchService');
const producerProfileService = require('../services/producer/producerProfileService');
const producerCropService = require('../services/producer/producerCropService');
const producerCertificationService = require('../services/producer/producerCertificationService');
const producerEquipmentService = require('../services/producer/producerEquipmentService');
const producerProductService = require('../services/producer/producerProductService');
const producerStatsService = require('../services/producer/producerStatsService');
const producerTransporterService = require('../services/producer/producerTransporterService');
const producerDocumentService = require('../services/producer/producerDocumentService');
const producerDeliveryService = require('../services/producer/producerDeliveryService');

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

// ROUTES PUBLIQUES

// Obtenir tous les producteurs
exports.getAllProducers = catchAsync(async (req, res, next) => {
  try {
    let userLocation = null;
    if (req.query.useLocation !== 'false') {
      try {
        const { getUserLocation, buildLocationQuery } = require('../utils/location');
        userLocation = await getUserLocation(req);
        if (userLocation && (userLocation.city || userLocation.region || userLocation.country)) {
          const locationQuery = buildLocationQuery(userLocation, {
            prioritizeRegion: true,
            prioritizeCity: true
          }, 'producer');
          const baseQueryObj = producerSearchService.buildAllProducersQuery(req.query);
          const locationQueryObj = { ...baseQueryObj };
          if (locationQuery.$or && locationQuery.$or.length > 0) {
            locationQueryObj.$and = locationQueryObj.$and || [];
            locationQueryObj.$and.push({ $or: locationQuery.$or });
          }
          const countInZone = await Producer.countDocuments(locationQueryObj);
          if (countInZone > 0 && locationQuery.$or && locationQuery.$or.length > 0) {
            req.query.locationQuery = locationQuery;
          }
        }
      } catch (error) {
        console.error('Erreur lors de la détection de localisation:', error);
      }
    }
    const result = await producerSearchService.getAllProducers(req.query, userLocation);
    res.status(200).json({
      status: 'success',
      results: result.producers.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: {
        producers: result.producers,
        location: result.userLocation ? {
          detected: true,
          country: result.userLocation.country,
          region: result.userLocation.region,
          city: result.userLocation.city,
          source: result.userLocation.source
        } : { detected: false }
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Recherche de producteurs
exports.searchProducers = catchAsync(async (req, res, next) => {
  try {
    const producers = await producerSearchService.searchProducers(req.query);
    res.status(200).json({
      status: 'success',
      results: producers.length,
      data: { producers }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Obtenir les producteurs par région
exports.getProducersByRegion = catchAsync(async (req, res, next) => {
  try {
    const producers = await producerSearchService.getProducersByRegion(req.params.region);
    res.status(200).json({
      status: 'success',
      results: producers.length,
      data: { producers }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Obtenir les producteurs par culture
exports.getProducersByCrop = catchAsync(async (req, res, next) => {
  try {
    const producers = await producerSearchService.getProducersByCrop(req.params.crop);
    res.status(200).json({
      status: 'success',
      results: producers.length,
      data: { producers }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Obtenir un producteur par ID
exports.getProducer = catchAsync(async (req, res, next) => {
  try {
    const producer = await producerSearchService.getProducer(req.params.id);
    const Review = require('../models/Review');
    const reviews = await Review.find({ 
      producer: req.params.id,
      status: 'approved'
    });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;
    const producerWithStats = {
      ...producer.toObject(),
      ratings: { average: averageRating, count: totalReviews },
      stats: { totalReviews, averageRating, ...producer.stats }
    };
    res.status(200).json({
      status: 'success',
      data: { producer: producerWithStats }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Obtenir les produits d'un producteur
exports.getProducerProducts = catchAsync(async (req, res, next) => {
  try {
    const products = await producerSearchService.getProducerProducts(req.params.id);
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: { products }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Obtenir les avis d'un producteur
exports.getProducerReviews = catchAsync(async (req, res, next) => {
  try {
    const result = await producerSearchService.getProducerReviews(req.params.id);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// ROUTES PROTÉGÉES PRODUCTEUR

// Obtenir mon profil
exports.getMyProfile = catchAsync(async (req, res, next) => {
  try {
    const producer = await producerProfileService.getProducerProfile(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { producer }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Mettre à jour mon profil
exports.updateMyProfile = catchAsync(async (req, res, next) => {
  try {
    const producer = await producerProfileService.updateProducerProfile(req.user._id, req.body);
    res.status(200).json({
      status: 'success',
      data: { producer }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});


// Gestion des certifications
exports.getMyCertifications = catchAsync(async (req, res, next) => {
  try {
    const certifications = await producerCertificationService.getCertifications(req.user._id);
    res.status(200).json({
      status: 'success',
      results: certifications.length,
      data: { certifications }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.addCertification = catchAsync(async (req, res, next) => {
  try {
    const certificationData = { ...req.body };
    if (req.file) certificationData.document = req.file.filename;
    const certification = await producerCertificationService.addCertification(req.user._id, certificationData);
    res.status(201).json({
      status: 'success',
      data: { certification }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateCertification = catchAsync(async (req, res, next) => {
  try {
    const certification = await producerCertificationService.updateCertification(req.user._id, req.params.certId, req.body);
    res.status(200).json({
      status: 'success',
      data: { certification }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.removeCertification = catchAsync(async (req, res, next) => {
  try {
    await producerCertificationService.removeCertification(req.user._id, req.params.certId);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});


// Gestion des produits
exports.getMyProducts = catchAsync(async (req, res, next) => {
  try {
    const products = await producerProductService.getProducts(req.user._id);
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: { products }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.createProduct = catchAsync(async (req, res, next) => {
  try {
    const product = await producerProductService.createProduct(req.user._id, req.body);
    res.status(201).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.getMyProduct = catchAsync(async (req, res, next) => {
  try {
    const product = await producerProductService.getProduct(req.params.productId, req.user._id);
    res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateMyProduct = catchAsync(async (req, res, next) => {
  try {
    const product = await producerProductService.updateProduct(req.params.productId, req.user._id, req.body);
    res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.deleteMyProduct = catchAsync(async (req, res, next) => {
  try {
    await producerProductService.deleteProduct(req.params.productId, req.user._id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Gestion des commandes
exports.getMyOrders = (req, res, next) => orderController.getMyOrders(req, res, next);

exports.getMyOrder = (req, res, next) => {
  if (!req.params.id && req.params.orderId) {
    req.params.id = req.params.orderId;
  }
  return orderController.getOrder(req, res, next);
};

exports.updateOrderStatus = (req, res, next) => {
  if (!req.params.id && req.params.orderId) {
    req.params.id = req.params.orderId;
  }
  return orderController.updateOrderStatus(req, res, next);
};

// Statistiques
exports.getMyStats = catchAsync(async (req, res, next) => {
  try {
    const stats = await producerStatsService.getMyStats(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getStats = catchAsync(async (req, res, next) => {
  try {
    const stats = await producerStatsService.getStats(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getSalesAnalytics = catchAsync(async (req, res, next) => {
  try {
    const analytics = await producerStatsService.getSalesAnalytics(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { analytics }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getRevenueAnalytics = catchAsync(async (req, res, next) => {
  try {
    const analytics = await producerStatsService.getRevenueAnalytics(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { analytics }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Gestion des transporteurs préférés
exports.getPreferredTransporters = catchAsync(async (req, res, next) => {
  try {
    const transporters = await producerTransporterService.getPreferredTransporters(req.user._id);
    res.status(200).json({
      status: 'success',
      results: transporters.length,
      data: { transporters }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.addPreferredTransporter = catchAsync(async (req, res, next) => {
  try {
    await producerTransporterService.addPreferredTransporter(req.user._id, req.body.transporterId);
    res.status(201).json({
      status: 'success',
      message: 'Transporteur ajouté aux préférés'
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.removePreferredTransporter = catchAsync(async (req, res, next) => {
  try {
    await producerTransporterService.removePreferredTransporter(req.user._id, req.params.transporterId);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Gestion des documents
exports.getMyDocuments = catchAsync(async (req, res, next) => {
  try {
    const documents = await producerDocumentService.getDocuments(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { documents }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.addDocument = catchAsync(async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Veuillez télécharger un document', 400));
    }
    const documentData = {
      ...req.body,
      document: req.file.filename
    };
    const document = await producerDocumentService.addDocument(req.user._id, documentData);
    res.status(201).json({
      status: 'success',
      data: { document }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// Paramètres de livraison
exports.getDeliverySettings = catchAsync(async (req, res, next) => {
  try {
    const deliverySettings = await producerDeliveryService.getDeliverySettings(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { deliverySettings }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateDeliverySettings = catchAsync(async (req, res, next) => {
  try {
    const deliverySettings = await producerDeliveryService.updateDeliverySettings(req.user._id, req.body);
    res.status(200).json({
      status: 'success',
      data: { deliverySettings }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});
