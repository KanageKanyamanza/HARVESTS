const Order = require('../../models/Order');
const Product = require('../../models/Product');
const User = require('../../models/User');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

// Rechercher des produits pour le chatbot
exports.searchProducts = catchAsync(async (req, res, next) => {
  const { query, limit = 5 } = req.query;

  if (!query || query.length < 2) {
    return next(new AppError('Le terme de recherche doit contenir au moins 2 caractères', 400));
  }

  // Utiliser la recherche améliorée avec détection de localisation
  const { buildSearchWithLocation } = require('../../utils/searchUtils');
  const { searchQuery, locationQuery, extractedLocation } = buildSearchWithLocation(query, [
    'name',
    'description',
    'shortDescription',
    'tags',
    'category',
    'subcategory'
  ]);
  
  // Construire la requête MongoDB
  const mongoQuery = {
    status: 'approved',
    isActive: true
  };
  
  // Ajouter la recherche textuelle
  if (searchQuery.$or && searchQuery.$or.length > 0) {
    mongoQuery.$and = mongoQuery.$and || [];
    mongoQuery.$and.push({ $or: searchQuery.$or });
  }
  
  // Ajouter le filtre de localisation
  if (locationQuery.$or && locationQuery.$or.length > 0) {
    mongoQuery.$and = mongoQuery.$and || [];
    // Pour les produits, on cherche dans l'adresse du producteur/transformateur
    const locationConditions = locationQuery.$or.map(cond => {
      // Adapter les conditions pour chercher dans producer.address ou transformer.address
      const newCond = {};
      Object.keys(cond).forEach(key => {
        if (key.startsWith('address.')) {
          newCond[`producer.${key}`] = cond[key];
          newCond[`transformer.${key}`] = cond[key];
        } else if (key === 'city' || key === 'region') {
          newCond[`producer.address.${key}`] = cond[key];
          newCond[`transformer.address.${key}`] = cond[key];
        } else {
          newCond[key] = cond[key];
        }
      });
      return newCond;
    });
    mongoQuery.$and.push({ $or: locationConditions });
  }
  
  const products = await Product.find(mongoQuery)
    .populate('producer', 'farmName firstName lastName address city region country')
    .populate('transformer', 'companyName firstName lastName address city region country')
    .select('name price images category')
    .limit(parseInt(limit))
    .lean();

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { 
      products,
      location: extractedLocation || null
    }
  });
});

// Obtenir le statut d'une commande par numéro
exports.trackOrder = catchAsync(async (req, res, next) => {
  const { orderNumber } = req.params;

  const order = await Order.findOne({ orderNumber })
    .select('orderNumber status total createdAt delivery.estimatedDelivery')
    .lean();

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  // Vérifier que l'utilisateur est propriétaire de la commande ou admin
  if (req.user && order.buyer && order.buyer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Vous n\'êtes pas autorisé à voir cette commande', 403));
  }

  res.status(200).json({
    status: 'success',
    data: { order }
  });
});

// Obtenir les commandes récentes de l'utilisateur connecté
exports.getMyRecentOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ buyer: req.user._id })
    .select('orderNumber status total createdAt')
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: { orders }
  });
});

// Rechercher des vendeurs
exports.searchSellers = catchAsync(async (req, res, next) => {
  const { query, limit = 5 } = req.query;

  if (!query || query.length < 2) {
    return next(new AppError('Le terme de recherche doit contenir au moins 2 caractères', 400));
  }

  // Utiliser la recherche améliorée avec détection de localisation
  const { buildSearchWithLocation, buildFlexibleSearchQuery } = require('../../utils/searchUtils');
  const { searchQuery, locationQuery, extractedLocation } = buildSearchWithLocation(query, [
    'firstName',
    'lastName',
    'farmName',
    'companyName',
    'restaurantName'
  ]);
  
  // Construire la requête MongoDB
  const mongoQuery = {
    userType: { $in: ['producer', 'transformer', 'restaurateur'] },
    isActive: true,
    isVerified: true
  };
  
  // Ajouter la recherche textuelle
  if (searchQuery.$or && searchQuery.$or.length > 0) {
    mongoQuery.$and = mongoQuery.$and || [];
    mongoQuery.$and.push({ $or: searchQuery.$or });
  }
  
  // Ajouter le filtre de localisation
  if (locationQuery.$or && locationQuery.$or.length > 0) {
    mongoQuery.$and = mongoQuery.$and || [];
    mongoQuery.$and.push({ $or: locationQuery.$or });
  }
  
  const sellers = await User.find(mongoQuery)
    .select('firstName lastName farmName companyName restaurantName userType address city region country profileImage')
    .limit(parseInt(limit))
    .lean();

  res.status(200).json({
    status: 'success',
    results: sellers.length,
    data: { 
      sellers,
      location: extractedLocation || null
    }
  });
});

// Rechercher des transporteurs
exports.searchTransporters = catchAsync(async (req, res, next) => {
  const { query, limit = 5 } = req.query;

  if (!query || query.length < 2) {
    return next(new AppError('Le terme de recherche doit contenir au moins 2 caractères', 400));
  }

  // Utiliser la recherche améliorée avec détection de localisation
  const { buildSearchWithLocation } = require('../../utils/searchUtils');
  const { buildLocationQuery } = require('../../utils/locationService');
  
  const { searchQuery, locationQuery, extractedLocation } = buildSearchWithLocation(query, [
    'firstName',
    'lastName',
    'companyName'
  ]);
  
  // Construire la requête MongoDB
  const mongoQuery = {
    userType: { $in: ['transporter', 'exporter'] },
    isActive: true,
    isVerified: true
  };
  
  // Ajouter la recherche textuelle
  if (searchQuery.$or && searchQuery.$or.length > 0) {
    mongoQuery.$and = mongoQuery.$and || [];
    mongoQuery.$and.push({ $or: searchQuery.$or });
  }
  
  // Ajouter le filtre de localisation (spécial pour transporteurs avec serviceAreas)
  if (locationQuery.$or && locationQuery.$or.length > 0) {
    mongoQuery.$and = mongoQuery.$and || [];
    // Pour les transporteurs, chercher dans serviceAreas
    const transporterLocationConditions = locationQuery.$or.map(cond => {
      const newCond = {};
      Object.keys(cond).forEach(key => {
        if (key.startsWith('address.')) {
          const field = key.replace('address.', '');
          newCond[`serviceAreas.${field}`] = cond[key];
          newCond[`address.${field}`] = cond[key];
          newCond[field] = cond[key];
        } else if (key === 'city' || key === 'region') {
          newCond[`serviceAreas.cities`] = cond[key];
          newCond[`serviceAreas.region`] = cond[key];
          newCond[`address.${key}`] = cond[key];
          newCond[key] = cond[key];
        } else {
          newCond[key] = cond[key];
        }
      });
      return newCond;
    });
    mongoQuery.$and.push({ $or: transporterLocationConditions });
  }
  
  const transporters = await User.find(mongoQuery)
    .select('firstName lastName companyName userType address serviceAreas city region country profileImage')
    .limit(parseInt(limit))
    .lean();

  res.status(200).json({
    status: 'success',
    results: transporters.length,
    data: { 
      transporters,
      location: extractedLocation || null
    }
  });
});

// Obtenir les catégories disponibles
exports.getCategories = catchAsync(async (req, res, next) => {
  const categories = await Product.distinct('category', {
    status: 'approved',
    isActive: true
  });

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: { categories }
  });
});

