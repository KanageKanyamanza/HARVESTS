const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Restaurateur = require('../../models/Restaurateur');
const restaurateurSearchService = require('../../services/restaurateur/restaurateurSearchService');
const restaurateurDishService = require('../../services/restaurateur/restaurateurDishService');

// Obtenir tous les restaurateurs
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

// Rechercher des restaurateurs
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

// Obtenir les restaurateurs par région
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

// Obtenir les restaurateurs par type de cuisine
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

// Obtenir un restaurateur par ID
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

// Obtenir les détails d'un plat
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
  
  // Filtrer seulement les produits disponibles
  const availableProducts = (restaurateur.products || []).filter(product => product.isAvailable);
  
  res.status(200).json({
    status: 'success',
    data: { 
      products: availableProducts,
      restaurantName: restaurateur.restaurantName
    }
  });
});

