const multer = require('multer');
const Transformer = require('../models/Transformer');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const orderController = require('./orderController');
const { toPlainText } = require('../utils/localization');
// Services organisés par type
const transformerSearchService = require('../services/transformer/transformerSearchService');
const transformerProfileService = require('../services/transformer/transformerProfileService');
const transformerProcessingService = require('../services/transformer/transformerProcessingService');
const transformerCertificationService = require('../services/transformer/transformerCertificationService');
const transformerStorageService = require('../services/transformer/transformerStorageService');
const transformerServiceService = require('../services/transformer/transformerServiceService');
const transformerPricingService = require('../services/transformer/transformerPricingService');
const transformerSupplierService = require('../services/transformer/transformerSupplierService');
const transformerProductService = require('../services/transformer/transformerProductService');
const transformerOrderService = require('../services/transformer/transformerOrderService');
const transformerReviewService = require('../services/transformer/transformerReviewService');
const transformerStatsService = require('../services/transformer/transformerStatsService');

// Configuration Multer
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new AppError('Veuillez télécharger uniquement des images ou des PDF!', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadCertificationDocument = upload.single('document');
exports.uploadDocument = upload.single('document');
exports.uploadQualityReport = upload.single('report');
exports.uploadMaintenanceDocument = upload.single('document');

// ROUTES PUBLIQUES
exports.getAllTransformers = catchAsync(async (req, res, next) => {
  try {
    const result = await transformerSearchService.getAllTransformers(req.query);
    res.status(200).json({
      status: 'success',
      results: result.transformers.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: { transformers: result.transformers }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.searchTransformers = catchAsync(async (req, res, next) => {
  try {
    const transformers = await transformerSearchService.searchTransformers(req.query);
    res.status(200).json({
      status: 'success',
      results: transformers.length,
      data: { transformers }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getTransformersByRegion = catchAsync(async (req, res, next) => {
  try {
    const transformers = await transformerSearchService.getTransformersByRegion(req.params.region);
    res.status(200).json({
      status: 'success',
      results: transformers.length,
      data: { transformers }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getTransformersByType = catchAsync(async (req, res, next) => {
  try {
    const transformers = await transformerSearchService.getTransformersByType(req.params.type);
    res.status(200).json({
      status: 'success',
      results: transformers.length,
      data: { transformers }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getTransformer = catchAsync(async (req, res, next) => {
  try {
    const transformer = await transformerSearchService.getTransformer(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { transformer }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getPublicTransformer = catchAsync(async (req, res, next) => {
  try {
    const transformer = await transformerSearchService.getPublicTransformer(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { transformer }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getTransformerServices = catchAsync(async (req, res, next) => {
  try {
    const result = await transformerSearchService.getTransformerServices(req.params.id);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getTransformerReviews = catchAsync(async (req, res, next) => {
  try {
    const reviews = await transformerSearchService.getTransformerReviews(req.params.id);
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: { reviews }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// ROUTES PROTÉGÉES TRANSFORMATEUR
exports.getMyProfile = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findById(req.user._id);
  res.status(200).json({ status: 'success', data: { transformer } });
});

exports.updateMyProfile = catchAsync(async (req, res, next) => {
  try {
    const transformer = await transformerProfileService.updateTransformerProfile(req.user._id, req.body);
    res.status(200).json({ status: 'success', data: { transformer } });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getCompanyInfo = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findById(req.user._id)
    .select('companyName companyRegistrationNumber transformationType');
  res.status(200).json({
    status: 'success',
    data: { companyInfo: transformer }
  });
});

exports.updateCompanyInfo = catchAsync(async (req, res, next) => {
  try {
    const transformer = await transformerProfileService.updateCompanyInfo(req.user._id, req.body);
    res.status(200).json({ status: 'success', data: { transformer } });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});


// Gestion des certifications 
exports.getMyCertifications = catchAsync(async (req, res, next) => {
  try {
    const certifications = await transformerCertificationService.getCertifications(req.user._id);
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
    const certification = await transformerCertificationService.addCertification(req.user._id, certificationData);
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
    const certification = await transformerCertificationService.updateCertification(req.user._id, req.params.certId, req.body);
    res.status(200).json({ status: 'success', data: { certification } });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.removeCertification = catchAsync(async (req, res, next) => {
  try {
    await transformerCertificationService.removeCertification(req.user._id, req.params.certId);
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Fonctions temporaires pour les fonctionnalités nécessitant d'autres modèles
const temporaryResponse = (message) => catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: `Fonctionnalité en cours de développement - ${message}`,
    data: {}
  });
});

// Helper pour les réponses JSON standardisées
const sendResponse = (res, statusCode, data, message = null) => {
  const response = { status: 'success', data };
  if (message) response.message = message;
  res.status(statusCode).json(response);
};



// Fournisseurs
exports.getPreferredSuppliers = catchAsync(async (req, res, next) => {
  try {
    const preferredSuppliers = await transformerSupplierService.getPreferredSuppliers(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { preferredSuppliers }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.addPreferredSupplier = catchAsync(async (req, res, next) => {
  try {
    const supplier = await transformerSupplierService.addPreferredSupplier(req.user._id, req.body);
    res.status(201).json({
      status: 'success',
      message: 'Fournisseur ajouté avec succès',
      data: { supplier }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateSupplierPreference = catchAsync(async (req, res, next) => {
  try {
    const supplier = await transformerSupplierService.updateSupplierPreference(req.user._id, req.params.supplierId, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Fournisseur mis à jour avec succès',
      data: { supplier }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.removePreferredSupplier = catchAsync(async (req, res, next) => {
  try {
    await transformerSupplierService.removePreferredSupplier(req.user._id, req.params.supplierId);
    res.status(200).json({
      status: 'success',
      message: 'Fournisseur supprimé avec succès'
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Commandes
exports.getMyOrders = (req, res, next) => orderController.getMyOrders(req, res, next);

exports.acceptOrder = catchAsync(async (req, res, next) => {
  try {
    const order = await transformerOrderService.acceptOrder(req.params.orderId, req.user._id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Commande acceptée avec succès',
      data: { order }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

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

exports.cancelOrder = catchAsync(async (req, res, next) => {
  try {
    const order = await transformerOrderService.cancelOrderByTransformer(req.params.orderId, req.user._id, req.body.reason);
    res.status(200).json({
      status: 'success',
      message: 'Commande annulée avec succès',
      data: { order }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.trackOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;

  const order = await Order.findOne({
    _id: orderId,
    transformer: req.user._id
  })
  .populate('customer', 'firstName lastName email')
  .select('status createdAt acceptedAt startedAt completedAt estimatedDelivery trackingUpdates');

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order: {
        id: order._id,
        status: order.status,
        createdAt: order.createdAt,
        acceptedAt: order.acceptedAt,
        startedAt: order.startedAt,
        completedAt: order.completedAt,
        estimatedDelivery: order.estimatedDelivery,
        trackingUpdates: order.trackingUpdates || []
      }
    }
  });
});

exports.updateOrderProgress = catchAsync(async (req, res, next) => {
  try {
    const order = await transformerOrderService.updateOrderProgress(req.params.orderId, req.user._id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Progression de la commande mise à jour avec succès',
      data: {
        order: {
          id: order._id,
          status: order.status,
          trackingUpdates: order.trackingUpdates
        }
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});




// Produits de la boutique
exports.getMyProducts = catchAsync(async (req, res, next) => {
  try {
    const products = await transformerProductService.getMyProducts(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { products }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getProduct = catchAsync(async (req, res, next) => {
  try {
    const product = await transformerProductService.getProduct(req.params.productId, req.user._id);
    res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});
exports.createProduct = catchAsync(async (req, res, next) => {
  if (!req.body.name || !req.body.description || !req.body.category || !req.body.price || req.body.stock === undefined) {
    return next(new AppError('Tous les champs obligatoires doivent être remplis', 400));
  }

  try {
    const product = await transformerProductService.createProduct(req.user._id, req.body);
    res.status(201).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});
exports.updateProduct = temporaryResponse('Mise à jour produit');
exports.deleteProduct = catchAsync(async (req, res, next) => {
  try {
    await transformerProductService.deleteProduct(req.params.productId, req.user._id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Soumettre un produit pour révision
exports.submitProductForReview = catchAsync(async (req, res, next) => {
  try {
    const product = await transformerProductService.submitProductForReview(req.params.productId, req.user._id);
    res.status(200).json({
      status: 'success',
      message: 'Produit soumis pour révision avec succès',
      data: { product }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});


// Produits publics (pour la boutique publique)
exports.getPublicProducts = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  if (id === 'me') {
    return next(new AppError('Route non autorisée', 403));
  }
  
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new AppError('ID de transformateur invalide', 400));
  }
  
  try {
    const products = await transformerProductService.getPublicProducts(id);
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: { products }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Statistiques
exports.getBusinessStats = catchAsync(async (req, res, next) => {
  try {
    const stats = await transformerStatsService.getBusinessStats(req.user._id);
    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});
exports.getProductionAnalytics = catchAsync(async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    const analytics = await transformerStatsService.getProductionAnalytics(req.user._id, period);
    res.status(200).json({
      status: 'success',
      data: analytics
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});
exports.getEfficiencyMetrics = temporaryResponse('Métriques efficacité');
exports.getRevenueAnalytics = temporaryResponse('Analytics revenus');


// Avis
exports.getMyReviews = catchAsync(async (req, res, next) => {
  try {
    const result = await transformerReviewService.getMyReviews(req.user._id, req.query);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});
exports.respondToReview = temporaryResponse('Réponse avis');

// Marquer un avis comme lu
exports.markReviewAsRead = catchAsync(async (req, res, next) => {
  try {
    const review = await transformerReviewService.markReviewAsRead(req.params.reviewId, req.user._id);
    res.status(200).json({
      status: 'success',
      message: 'Avis marqué comme lu',
      data: { review }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.markAllReviewsAsRead = catchAsync(async (req, res, next) => {
  try {
    await transformerReviewService.markAllReviewsAsRead(req.user._id);
    res.status(200).json({
      status: 'success',
      message: 'Tous les avis marqués comme lus'
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Réclamations
exports.getComplaints = temporaryResponse('Réclamations');
exports.handleComplaint = temporaryResponse('Traitement réclamation');
exports.updateComplaint = temporaryResponse('Mise à jour réclamation');


// Documents
exports.getMyDocuments = temporaryResponse('Mes documents');
exports.addDocument = temporaryResponse('Ajout document');

// Notifications
exports.getNotifications = temporaryResponse('Notifications');
exports.markNotificationsAsRead = temporaryResponse('Lecture notifications');
exports.getProductionAlerts = temporaryResponse('Alertes production');
exports.createProductionAlert = temporaryResponse('Création alerte');

// Conformité
exports.getComplianceReports = temporaryResponse('Rapports conformité');
exports.generateComplianceReport = temporaryResponse('Génération rapport');



module.exports = exports;
