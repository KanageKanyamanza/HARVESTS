const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Restaurateur = require('../../models/Restaurateur');
const restaurateurSearchService = require('../../services/restaurateur/restaurateurSearchService');
const restaurateurDishService = require('../../services/restaurateur/restaurateurDishService');
const {
  isTestViewer,
  testAccountScope,
  testReviewViewerFilter,
} = require('../../utils/testAccounts');

// Obtenir tous les restaurateurs
exports.getAllRestaurateurs = catchAsync(async (req, res, next) => {
  try {
    const result = await restaurateurSearchService.getAllRestaurateurs(req.query, isTestViewer(req));
    res.status(200).json({
      status: 'success',
      results: result.restaurateurs.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: { restaurateurs: result.restaurateurs },
    });
  } catch (error) {
    return next(AppError.from(error, 404));
  }
});

// Rechercher des restaurateurs
exports.searchRestaurateurs = catchAsync(async (req, res, next) => {
  try {
    const restaurateurs = await restaurateurSearchService.searchRestaurateurs(req.query, isTestViewer(req));
    res.status(200).json({
      status: 'success',
      results: restaurateurs.length,
      data: { restaurateurs },
    });
  } catch (error) {
    return next(AppError.from(error, 404));
  }
});

// Obtenir les restaurateurs par région
exports.getRestaurateursByRegion = catchAsync(async (req, res, next) => {
  try {
    const restaurateurs = await restaurateurSearchService.getRestaurateursByRegion(req.params.region, isTestViewer(req));
    res.status(200).json({
      status: 'success',
      results: restaurateurs.length,
      data: { restaurateurs },
    });
  } catch (error) {
    return next(AppError.from(error, 404));
  }
});

// Obtenir les restaurateurs par type de cuisine
exports.getRestaurateursByCuisine = catchAsync(async (req, res, next) => {
  const restaurateurs = await Restaurateur.find({
    cuisineTypes: req.params.cuisine,
    isActive: true, 
    isApproved: true, 
    isEmailVerified: true,
    ...testAccountScope(isTestViewer(req)),
    // Les restaurateurs doivent avoir une bannière pour être visibles en public
    ...(isTestViewer(req) ? {} : { restaurantBanner: { $exists: true, $ne: null } }),
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
    const restaurateur = await restaurateurSearchService.getRestaurateur(req.params.id, isTestViewer(req));
    res.status(200).json({
      status: 'success',
      data: { restaurateur },
    });
  } catch (error) {
    return next(AppError.from(error, 404));
  }
});

// Récupérer les plats d'un restaurateur (public)
exports.getRestaurateurDishes = catchAsync(async (req, res, next) => {
  try {
    const result = await restaurateurDishService.getRestaurateurDishes(req.params.id, isTestViewer(req));
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return next(AppError.from(error, 404));
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
    const dish = await restaurateurDishService.getDishDetail(req.params.dishId, req.user?.id || null, token, isTestViewer(req));
    res.status(200).json({
      status: 'success',
      data: {
        dish,
        restaurateur: dish.restaurateur
      }
    });
  } catch (error) {
    return next(AppError.from(error, 404));
  }
});

// Récupérer les produits d'un restaurateur (public)
exports.getRestaurateurProducts = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const restaurateur = await Restaurateur.findOne({
    _id: id,
    ...testAccountScope(isTestViewer(req)),
  }).select('products restaurantName');
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

// Récupérer les avis d'un restaurateur (public)
exports.getRestaurateurReviews = catchAsync(async (req, res, next) => {
  const Review = require('../../models/Review');

  const vendorExists = await Restaurateur.exists({
    _id: req.params.id,
    ...testAccountScope(isTestViewer(req)),
  });
  if (!vendorExists) {
    return next(new AppError('restaurateur.not_found', 404));
  }
  
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const reviewFilter = await testReviewViewerFilter(isTestViewer(req));

  const reviews = await Review.find({
    producer: req.params.id, // Dans le modèle Review, 'producer' est utilisé pour tous les vendeurs
    status: 'approved',
    ...reviewFilter,
  })
    .populate('reviewer', 'firstName lastName avatar')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments({
    producer: req.params.id,
    status: 'approved',
    ...reviewFilter,
  });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      reviews,
    },
  });
});

