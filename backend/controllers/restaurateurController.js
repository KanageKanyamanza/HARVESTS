const multer = require('multer');
const Restaurateur = require('../models/Restaurateur');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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
  const queryObj = { ...req.query };
  // Filtrer seulement les champs de requête, pas les champs de statut pour l'instant
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let query = Restaurateur.find(JSON.parse(queryStr));

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-businessStats.supplierRating -createdAt');
  }

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  const restaurateurs = await query;
  const total = await Restaurateur.countDocuments(JSON.parse(queryStr));

  res.status(200).json({
    status: 'success',
    results: restaurateurs.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: { restaurateurs },
  });
});

exports.searchRestaurateurs = catchAsync(async (req, res, next) => {
  const { q, region, restaurantType, cuisineType } = req.query;
  let searchQuery = { isActive: true, isApproved: true, isEmailVerified: true };

  if (q) {
    searchQuery.$or = [
      { restaurantName: { $regex: q, $options: 'i' } },
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } }
    ];
  }

  if (region) searchQuery['address.region'] = region;
  if (restaurantType) searchQuery.restaurantType = restaurantType;
  if (cuisineType) searchQuery.cuisineTypes = cuisineType;

  const restaurateurs = await Restaurateur.find(searchQuery)
    .sort('-businessStats.supplierRating')
    .limit(50);

  res.status(200).json({
    status: 'success',
    results: restaurateurs.length,
    data: { restaurateurs },
  });
});

exports.getRestaurateursByRegion = catchAsync(async (req, res, next) => {
  const restaurateurs = await Restaurateur.find({
    'address.region': req.params.region,
    isActive: true, isApproved: true, isEmailVerified: true,
  }).sort('-businessStats.supplierRating');

  res.status(200).json({
    status: 'success',
    results: restaurateurs.length,
    data: { restaurateurs },
  });
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
  const restaurateur = await Restaurateur.findOne({
    _id: req.params.id,
    isActive: true, isEmailVerified: true,
  });

  if (!restaurateur) {
    return next(new AppError('Restaurateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { restaurateur },
  });
});

// ROUTES PROTÉGÉES RESTAURATEUR
exports.getMyProfile = catchAsync(async (req, res, next) => {
  const restaurateur = await Restaurateur.findById(req.user.id);
  res.status(200).json({ status: 'success', data: { restaurateur } });
});

exports.updateMyProfile = catchAsync(async (req, res, next) => {
  const allowedFields = [
    'restaurantName', 
    'restaurantType', 
    'cuisineTypes', 
    'seatingCapacity',
    'address',
    'additionalServices',
    'operatingHours',
    'restaurantBanner',
    'dishes'
  ];
  
  const filteredBody = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  const restaurateur = await Restaurateur.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { restaurateur } });
});

// Récupérer les plats du restaurateur
exports.getMyDishes = catchAsync(async (req, res, next) => {
  console.log('🔍 getMyDishes appelé pour user ID:', req.user.id);
  
  const restaurateur = await Restaurateur.findById(req.user.id).select('dishes');
  console.log('📋 Restaurateur trouvé:', !!restaurateur);
  console.log('🍽️ Plats:', restaurateur?.dishes?.length || 0);
  
  if (!restaurateur) {
    return res.status(404).json({
      status: 'error',
      message: 'Restaurateur non trouvé'
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: { dishes: restaurateur.dishes || [] }
  });
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
  const { id } = req.params;
  
  const restaurateur = await Restaurateur.findById(id).select('dishes restaurantName');
  if (!restaurateur) {
    return res.status(404).json({
      status: 'error',
      message: 'Restaurateur non trouvé'
    });
  }
  
  // Filtrer seulement les plats disponibles ET approuvés
  const availableDishes = restaurateur.dishes.filter(dish => 
    dish.isAvailable && dish.status === 'approved'
  );
  
  res.status(200).json({
    status: 'success',
    data: { 
      dishes: availableDishes,
      restaurantName: restaurateur.restaurantName
    }
  });
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
  const { name, description, price, image, category, preparationTime, allergens } = req.body;
  
  const restaurateur = await Restaurateur.findById(req.user.id);
  if (!restaurateur) {
    return res.status(404).json({
      status: 'error',
      message: 'Restaurateur non trouvé'
    });
  }
  
  const newDish = {
    name,
    description,
    price,
    image,
    category: category || 'plat',
    preparationTime: preparationTime || 30,
    allergens: allergens || []
  };
  
  restaurateur.dishes.push(newDish);
  await restaurateur.save();
  
  res.status(201).json({
    status: 'success',
    data: { dish: newDish }
  });
});

exports.updateDish = catchAsync(async (req, res, next) => {
  const { dishId } = req.params;
  const updateData = req.body;
  
  const restaurateur = await Restaurateur.findById(req.user.id);
  if (!restaurateur) {
    return res.status(404).json({
      status: 'error',
      message: 'Restaurateur non trouvé'
    });
  }
  
  const dish = restaurateur.dishes.id(dishId);
  if (!dish) {
    return res.status(404).json({
      status: 'error',
      message: 'Plat non trouvé'
    });
  }
  
  Object.assign(dish, updateData);
  await restaurateur.save();
  
  res.status(200).json({
    status: 'success',
    data: { dish }
  });
});

exports.deleteDish = catchAsync(async (req, res, next) => {
  const { dishId } = req.params;
  
  const restaurateur = await Restaurateur.findById(req.user.id);
  if (!restaurateur) {
    return res.status(404).json({
      status: 'error',
      message: 'Restaurateur non trouvé'
    });
  }
  
  restaurateur.dishes.pull(dishId);
  await restaurateur.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Plat supprimé avec succès'
  });
});

// Fonctions temporaires pour les fonctionnalités nécessitant d'autres modèles
const temporaryResponse = (message) => catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: `Fonctionnalité en cours de développement - ${message}`,
    data: {},
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
    data: { certifications: restaurateur.certifications },
  });
});

exports.addCertification = catchAsync(async (req, res, next) => {
  const restaurateur = await Restaurateur.findById(req.user.id);
  const certificationData = { ...req.body };
  if (req.file) certificationData.document = req.file.filename;

  restaurateur.certifications.push(certificationData);
  await restaurateur.save();

  res.status(201).json({
    status: 'success',
    data: { certification: restaurateur.certifications[restaurateur.certifications.length - 1] },
  });
});

exports.updateCertification = catchAsync(async (req, res, next) => {
  const restaurateur = await Restaurateur.findById(req.user.id);
  const certification = restaurateur.certifications.id(req.params.certId);

  if (!certification) return next(new AppError('Certification non trouvée', 404));

  Object.keys(req.body).forEach(key => {
    certification[key] = req.body[key];
  });

  await restaurateur.save();
  res.status(200).json({ status: 'success', data: { certification } });
});

exports.removeCertification = catchAsync(async (req, res, next) => {
  const restaurateur = await Restaurateur.findById(req.user.id);
  restaurateur.certifications.pull(req.params.certId);
  await restaurateur.save();
  res.status(204).json({ status: 'success', data: null });
});

// Toutes les autres fonctions temporaires
exports.getKitchenEquipment = temporaryResponse('Équipements cuisine');
exports.addKitchenEquipment = temporaryResponse('Ajout équipement');
exports.updateKitchenEquipment = temporaryResponse('Mise à jour équipement');
exports.removeKitchenEquipment = temporaryResponse('Suppression équipement');

exports.getStorageCapacity = temporaryResponse('Capacité stockage');
exports.updateStorageCapacity = temporaryResponse('Mise à jour stockage');

exports.getMyOrders = temporaryResponse('Commandes - Modèle Order requis');
exports.createOrder = temporaryResponse('Création commande');
exports.getMyOrder = temporaryResponse('Détail commande');
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

exports.getMyStats = temporaryResponse('Mes statistiques');
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
  const Producer = require('../models/Producer');
  const Transformer = require('../models/Transformer');
  
  const { limit = 20, page = 1, type, region, search } = req.query;
  const skip = (page - 1) * limit;
  
  try {
    // Construire les filtres de base
    const baseFilters = {
      isActive: true,
      isApproved: true,
      isEmailVerified: true
    };
    
    // Filtres optionnels
    const filters = { ...baseFilters };
    if (region) filters.region = new RegExp(region, 'i');
    if (search) {
      filters.$or = [
        { companyName: new RegExp(search, 'i') },
        { businessName: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }
    
    let suppliers = [];
    let total = 0;
    
    // Récupérer les producteurs
    if (!type || type === 'producer') {
      const producerFilters = { ...filters };
      if (type === 'producer') {
        // Filtres spécifiques aux producteurs
      }
      
      const producers = await Producer.find(producerFilters)
        .select('companyName businessName description region contactInfo businessStats createdAt')
        .sort('-businessStats.supplierRating -createdAt')
        .skip(type === 'producer' ? skip : 0)
        .limit(type === 'producer' ? limit : Math.ceil(limit / 2));
      
      const producerCount = await Producer.countDocuments(producerFilters);
      
      suppliers = suppliers.concat(producers.map(p => ({
        ...p.toObject(),
        userType: 'producer',
        supplierType: 'Producteur'
      })));
      
      total += producerCount;
    }
    
    // Récupérer les transformateurs
    if (!type || type === 'transformer') {
      const transformerFilters = { ...filters };
      if (type === 'transformer') {
        // Filtres spécifiques aux transformateurs
      }
      
      const transformers = await Transformer.find(transformerFilters)
        .select('companyName businessName description region contactInfo businessStats transformationType createdAt')
        .sort('-businessStats.supplierRating -createdAt')
        .skip(type === 'transformer' ? skip : 0)
        .limit(type === 'transformer' ? limit : Math.ceil(limit / 2));
      
      const transformerCount = await Transformer.countDocuments(transformerFilters);
      
      suppliers = suppliers.concat(transformers.map(t => ({
        ...t.toObject(),
        userType: 'transformer',
        supplierType: 'Transformateur'
      })));
      
      total += transformerCount;
    }
    
    // Trier par note de fournisseur et date de création
    suppliers.sort((a, b) => {
      const ratingA = a.businessStats?.supplierRating || 0;
      const ratingB = b.businessStats?.supplierRating || 0;
      if (ratingA !== ratingB) return ratingB - ratingA;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    // Limiter les résultats si on a récupéré des deux types
    if (!type) {
      suppliers = suppliers.slice(0, limit);
    }
    
    res.status(200).json({
      status: 'success',
      results: suppliers.length,
      total,
      data: {
        suppliers
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la découverte des fournisseurs:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des fournisseurs'
    });
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
