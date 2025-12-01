const multer = require('multer');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const Restaurateur = require('../models/Restaurateur');
const Product = require('../models/Product');
const Order = require('../models/Order');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const orderController = require('./orderController');
const { toPlainText } = require('../utils/localization');
// Services organisés par type
const restaurateurSearchService = require('../services/restaurateur/restaurateurSearchService');
const restaurateurProfileService = require('../services/restaurateur/restaurateurProfileService');
const restaurateurDishService = require('../services/restaurateur/restaurateurDishService');
const restaurateurCertificationService = require('../services/restaurateur/restaurateurCertificationService');
const restaurateurStatsService = require('../services/restaurateur/restaurateurStatsService');
const restaurateurSupplierService = require('../services/restaurateur/restaurateurSupplierService');

// Configuration Multer
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new AppError('Veuillez télécharger uniquement des images ou des PDF!', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadCertificationDocument = upload.single('document');
exports.uploadDocument = upload.single('document');

// ROUTES PUBLIQUES
exports.getAllRestaurateurs = catchAsync(async (req, res, next) => {
  try {
    const result = await restaurateurSearchService.getAllRestaurateurs(req.query);
    res.status(200).json({
      status: 'success',
      results: result.restaurateurs.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: { restaurateurs: result.restaurateurs },
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.searchRestaurateurs = catchAsync(async (req, res, next) => {
  try {
    const restaurateurs = await restaurateurSearchService.searchRestaurateurs(req.query);
    res.status(200).json({
      status: 'success',
      results: restaurateurs.length,
      data: { restaurateurs },
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getRestaurateursByRegion = catchAsync(async (req, res, next) => {
  try {
    const restaurateurs = await restaurateurSearchService.getRestaurateursByRegion(req.params.region);
    res.status(200).json({
      status: 'success',
      results: restaurateurs.length,
      data: { restaurateurs },
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getRestaurateursByCuisine = catchAsync(async (req, res, next) => {
  const restaurateurs = await Restaurateur.find({
    cuisineTypes: req.params.cuisine,
    isActive: true, isApproved: true, isEmailVerified: true,
  }).sort('-businessStats.supplierRating');

  res.status(200).json({
    status: 'success',
    results: restaurateurs.length,
    data: { restaurateurs },
  });
});

exports.getRestaurateur = catchAsync(async (req, res, next) => {
  try {
    const restaurateur = await restaurateurSearchService.getRestaurateur(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { restaurateur },
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// ROUTES PROTÉGÉES RESTAURATEUR
exports.getMyProfile = catchAsync(async (req, res, next) => {
  const restaurateur = await Restaurateur.findById(req.user.id);
  res.status(200).json({ status: 'success', data: { restaurateur } });
});

exports.updateMyProfile = catchAsync(async (req, res, next) => {
  try {
    const restaurateur = await restaurateurProfileService.updateMyProfile(req.user.id, req.body);
    res.status(200).json({ status: 'success', data: { restaurateur } });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Récupérer les plats du restaurateur
exports.getMyDishes = catchAsync(async (req, res, next) => {
  try {
    const dishes = await restaurateurDishService.getMyDishes(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { dishes }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Récupérer les produits du restaurateur connecté
exports.getMyProducts = catchAsync(async (req, res, next) => {
  console.log('🔍 getMyProducts appelé pour user ID:', req.user.id);
  
  const restaurateur = await Restaurateur.findById(req.user.id).select('products');
  console.log('📋 Restaurateur trouvé:', !!restaurateur);
  console.log('📦 Produits:', restaurateur?.products?.length || 0);
  
  if (!restaurateur) {
    return res.status(404).json({
      status: 'error',
      message: 'Restaurateur non trouvé'
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: { products: restaurateur.products || [] }
  });
});

// Récupérer les plats d'un restaurateur (public)
exports.getRestaurateurDishes = catchAsync(async (req, res, next) => {
  try {
    const result = await restaurateurDishService.getRestaurateurDishes(req.params.id);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getDishDetail = catchAsync(async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    const dish = await restaurateurDishService.getDishDetail(req.params.dishId, req.user?.id || null, token);
    res.status(200).json({
      status: 'success',
      data: {
        dish,
        restaurateur: dish.restaurateur
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Récupérer les produits d'un restaurateur (public)
exports.getRestaurateurProducts = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const restaurateur = await Restaurateur.findById(id).select('products restaurantName');
  if (!restaurateur) {
    return res.status(404).json({
      status: 'error',
      message: 'Restaurateur non trouvé'
    });
  }
  
  // Filtrer seulement les produits disponibles (vérifier que products existe)
  const availableProducts = (restaurateur.products || []).filter(product => product.isAvailable);
  
  res.status(200).json({
    status: 'success',
    data: { 
      products: availableProducts,
      restaurantName: restaurateur.restaurantName
    }
  });
});

// Gestion des plats
exports.addDish = catchAsync(async (req, res, next) => {
  try {
    const product = await restaurateurDishService.addDish(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      message: 'Plat soumis pour validation',
      data: { dish: product }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.updateDish = catchAsync(async (req, res, next) => {
  try {
    const { product, requiresReview } = await restaurateurDishService.updateDish(req.params.dishId, req.user.id, req.body);
    res.status(200).json({
      status: 'success',
      message: requiresReview ? 'Plat mis à jour. Une nouvelle validation est nécessaire.' : 'Plat mis à jour avec succès',
      data: { dish: product }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.deleteDish = catchAsync(async (req, res, next) => {
  try {
    await restaurateurDishService.deleteDish(req.params.dishId, req.user.id);
    res.status(200).json({
      status: 'success',
      message: 'Plat supprimé avec succès'
    });
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

// Informations restaurant
exports.getRestaurantInfo = temporaryResponse('Infos restaurant');
exports.updateRestaurantInfo = temporaryResponse('Mise à jour restaurant');

// Horaires
exports.getOperatingHours = temporaryResponse('Horaires d\'ouverture');
exports.updateOperatingHours = temporaryResponse('Mise à jour horaires');

// Besoins d'approvisionnement
exports.getProcurementNeeds = temporaryResponse('Besoins approvisionnement');
exports.addProcurementNeed = temporaryResponse('Ajout besoin');
exports.updateProcurementNeed = temporaryResponse('Mise à jour besoin');
exports.removeProcurementNeed = temporaryResponse('Suppression besoin');

// Fournisseurs préférés
exports.getPreferredSuppliers = temporaryResponse('Fournisseurs préférés');
exports.addPreferredSupplier = temporaryResponse('Ajout fournisseur');
exports.updateSupplierRating = temporaryResponse('Note fournisseur');
exports.removePreferredSupplier = temporaryResponse('Suppression fournisseur');

// Certifications (implémentation basique)
exports.getMyCertifications = catchAsync(async (req, res, next) => {
  const restaurateur = await Restaurateur.findById(req.user.id).select('certifications');
  res.status(200).json({
    status: 'success',
    results: restaurateur.certifications.length,
    data: { certifications: restaurateur.certifications }
  });
});

exports.addCertification = catchAsync(async (req, res, next) => {
  try {
    const certificationData = { ...req.body };
    if (req.file) certificationData.document = req.file.filename;
    const certification = await restaurateurCertificationService.addCertification(req.user.id, certificationData);
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
    const certification = await restaurateurCertificationService.updateCertification(req.user.id, req.params.certId, req.body);
    res.status(200).json({ status: 'success', data: { certification } });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.removeCertification = catchAsync(async (req, res, next) => {
  try {
    await restaurateurCertificationService.removeCertification(req.user.id, req.params.certId);
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Toutes les autres fonctions temporaires
exports.getKitchenEquipment = temporaryResponse('Équipements cuisine');
exports.addKitchenEquipment = temporaryResponse('Ajout équipement');
exports.updateKitchenEquipment = temporaryResponse('Mise à jour équipement');
exports.removeKitchenEquipment = temporaryResponse('Suppression équipement');

exports.getStorageCapacity = temporaryResponse('Capacité stockage');
exports.updateStorageCapacity = temporaryResponse('Mise à jour stockage');

exports.createOrder = (req, res, next) => orderController.createOrder(req, res, next);

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

exports.updateOrder = temporaryResponse('Mise à jour commande');

exports.cancelOrder = temporaryResponse('Annulation commande');
exports.trackOrder = temporaryResponse('Suivi commande');

exports.getContracts = temporaryResponse('Contrats fournisseurs');
exports.createContract = temporaryResponse('Création contrat');
exports.getContract = temporaryResponse('Détail contrat');
exports.updateContract = temporaryResponse('Mise à jour contrat');
exports.terminateContract = temporaryResponse('Résiliation contrat');

exports.getPaymentPreferences = temporaryResponse('Préférences paiement');
exports.updatePaymentPreferences = temporaryResponse('Mise à jour paiement');

exports.getDeliveryPreferences = temporaryResponse('Préférences livraison');
exports.updateDeliveryPreferences = temporaryResponse('Mise à jour livraison');

exports.getMyReviews = temporaryResponse('Mes avis');
exports.createReview = temporaryResponse('Création avis');
exports.updateMyReview = temporaryResponse('Mise à jour avis');
exports.deleteMyReview = temporaryResponse('Suppression avis');

exports.getMyStats = catchAsync(async (req, res, next) => {
  try {
    const stats = await restaurateurStatsService.getMyStats(req.user._id);
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
    const stats = await restaurateurStatsService.getStats(req.user._id);
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
    const analytics = await restaurateurStatsService.getSalesAnalytics(req.user._id);
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
    const analytics = await restaurateurStatsService.getRevenueAnalytics(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { analytics }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});
exports.getPurchaseAnalytics = temporaryResponse('Analytics achats');
exports.getSupplierPerformance = temporaryResponse('Performance fournisseurs');

exports.getMenuPlanning = temporaryResponse('Planification menus');
exports.createMenuPlan = temporaryResponse('Création plan menu');
exports.updateMenuPlan = temporaryResponse('Mise à jour plan');
exports.deleteMenuPlan = temporaryResponse('Suppression plan');

exports.getProcurementForecasts = temporaryResponse('Prévisions approvisionnement');
exports.createProcurementForecast = temporaryResponse('Création prévision');

exports.getAdditionalServices = temporaryResponse('Services additionnels');
exports.updateAdditionalServices = temporaryResponse('Mise à jour services');

exports.getMyDocuments = temporaryResponse('Mes documents');
exports.addDocument = temporaryResponse('Ajout document');

exports.getNotifications = temporaryResponse('Notifications');
exports.markNotificationsAsRead = temporaryResponse('Lecture notifications');

exports.getStockAlerts = temporaryResponse('Alertes stock');
exports.createStockAlert = temporaryResponse('Création alerte');
exports.updateStockAlert = temporaryResponse('Mise à jour alerte');
exports.deleteStockAlert = temporaryResponse('Suppression alerte');

// DÉCOUVERTE DES FOURNISSEURS (PRODUCTEURS ET TRANSFORMATEURS)
exports.discoverSuppliers = catchAsync(async (req, res, next) => {
  try {
    const result = await restaurateurSupplierService.discoverSuppliers(req.query);
    res.status(200).json({
      status: 'success',
      results: result.suppliers.length,
      total: result.total,
      data: { suppliers: result.suppliers }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.searchSuppliers = catchAsync(async (req, res, next) => {
  // Utiliser la même logique que discoverSuppliers mais avec des filtres de recherche plus avancés
  return exports.discoverSuppliers(req, res, next);
});

exports.getSupplierDetails = catchAsync(async (req, res, next) => {
  const { supplierId } = req.params;
  const Producer = require('../models/Producer');
  const Transformer = require('../models/Transformer');
  
  try {
    // Essayer de trouver dans les producteurs
    let supplier = await Producer.findById(supplierId)
      .select('-password -__v');
    
    if (supplier) {
      return res.status(200).json({
        status: 'success',
        data: {
          supplier: {
            ...supplier.toObject(),
            userType: 'producer',
            supplierType: 'Producteur'
          }
        }
      });
    }
    
    // Essayer de trouver dans les transformateurs
    supplier = await Transformer.findById(supplierId)
      .select('-password -__v');
    
    if (supplier) {
      return res.status(200).json({
        status: 'success',
        data: {
          supplier: {
            ...supplier.toObject(),
            userType: 'transformer',
            supplierType: 'Transformateur'
          }
        }
      });
    }
    
    res.status(404).json({
      status: 'fail',
      message: 'Fournisseur non trouvé'
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du fournisseur:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération du fournisseur'
    });
  }
});

module.exports = exports;
