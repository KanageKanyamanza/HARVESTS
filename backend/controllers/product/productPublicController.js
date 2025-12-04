const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const productPublicService = require('../../services/product/productPublicService');
const { getUserLocation } = require('../../utils/locationService');

/**
 * Récupère tous les produits avec filtres et recherche
 * Supporte la détection automatique de localisation
 */
exports.getAllProducts = catchAsync(async (req, res, next) => {
  try {
    let userLocation = null;
    if (req.query.useLocation !== 'false') {
      try {
        userLocation = await getUserLocation(req);
      } catch (error) {
        console.error('Erreur lors de la détection de localisation:', error);
      }
    }

    const result = await productPublicService.getAllProducts(req.query, userLocation);

    res.status(200).json({
      status: 'success',
      results: result.products.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: {
        products: result.products,
        filters: {
          categories: result.categoryStats
        },
        location: result.userLocation ? {
          detected: true,
          country: result.userLocation.country,
          region: result.userLocation.region,
          city: result.userLocation.city,
          source: result.userLocation.source,
          noProductsInZone: result.noProductsInZone
        } : {
          detected: false
        }
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

/**
 * Récupère les produits basés sur la localisation de l'utilisateur
 */
exports.getProductsByLocation = catchAsync(async (req, res, next) => {
  try {
    const result = await productPublicService.getProductsByLocation(req.query);

    res.status(200).json({
      status: 'success',
      results: result.products.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: {
        products: result.products,
        location: result.location
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

/**
 * Recherche avancée de produits avec détection géographique
 */
exports.searchProducts = catchAsync(async (req, res, next) => {
  try {
    const { q, filters = {} } = req.query;
    const searchResults = await productPublicService.searchProducts(q, filters);

    res.status(200).json({
      status: 'success',
      results: searchResults.length,
      data: {
        products: searchResults
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Obtenir un produit par ID ou slug
exports.getProduct = catchAsync(async (req, res, next) => {
  try {
    const result = await productPublicService.getProductById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        product: result.product,
        reviewStats: result.reviewStats,
        similarProducts: result.similarProducts
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Obtenir les produits en vedette
exports.getFeaturedProducts = catchAsync(async (req, res, next) => {
  try {
    const products = await productPublicService.getFeaturedProducts();

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Obtenir les nouveaux produits
exports.getNewProducts = catchAsync(async (req, res, next) => {
  try {
    const products = await productPublicService.getNewProducts();

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Obtenir les catégories de produits
exports.getCategories = catchAsync(async (req, res, next) => {
  try {
    const categories = await productPublicService.getCategories();

    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: categories
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Obtenir les produits par catégorie
exports.getProductsByCategory = catchAsync(async (req, res, next) => {
  try {
    const { category } = req.params;
    const result = await productPublicService.getProductsByCategory(category, req.query);

    res.status(200).json({
      status: 'success',
      results: result.products.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: {
        products: result.products
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

