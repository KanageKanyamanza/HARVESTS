const Product = require('../../models/Product');
const Review = require('../../models/Review');
const { getUserLocation, buildLocationQuery } = require('../../utils/locationService');

/**
 * Service pour les routes publiques des produits
 */

/**
 * Obtenir tous les produits avec filtres
 */
async function getAllProducts(queryParams = {}, userLocation = null) {
  const queryObj = { 
    status: 'approved', 
    isActive: true,
    isPublic: { $ne: false }
  };

  let noProductsInZone = false;

  // Détection automatique de la localisation si activée
  if (queryParams.useLocation !== 'false' && userLocation && (userLocation.city || userLocation.region || userLocation.country)) {
    const locationQuery = buildLocationQuery(userLocation, {
      prioritizeRegion: true,
      prioritizeCity: true
    });
    
    const locationQueryObj = { ...queryObj };
    if (locationQuery.$or && locationQuery.$or.length > 0) {
      locationQueryObj.$and = locationQueryObj.$and || [];
      locationQueryObj.$and.push({ $or: locationQuery.$or });
    }
    
    const countInZone = await Product.countDocuments(locationQueryObj);
    
    if (countInZone > 0 && locationQuery.$or && locationQuery.$or.length > 0) {
      queryObj.$and = queryObj.$and || [];
      queryObj.$and.push({ $or: locationQuery.$or });
    } else {
      noProductsInZone = true;
    }
  }

  // Filtres explicites
  if (queryParams.category) queryObj.category = queryParams.category;
  if (queryParams.subcategory) queryObj.subcategory = queryParams.subcategory;
  if (queryParams.region) {
    queryObj['producer.address.region'] = queryParams.region;
    if (queryObj.$and) {
      queryObj.$and = queryObj.$and.filter(cond => !cond.$or);
    }
  }
  if (queryParams.farmingMethod) queryObj['agricultureInfo.farmingMethod'] = queryParams.farmingMethod;
  if (queryParams.certified) queryObj['certifications.0'] = { $exists: true };

  // Filtres de prix
  if (queryParams.minPrice || queryParams.maxPrice) {
    queryObj.price = {};
    if (queryParams.minPrice) queryObj.price.$gte = parseFloat(queryParams.minPrice);
    if (queryParams.maxPrice) queryObj.price.$lte = parseFloat(queryParams.maxPrice);
  }

  // Recherche textuelle améliorée (gère pluriel/singulier et localisation)
  if (queryParams.search) {
    const { buildSearchWithLocation } = require('../../utils/searchUtils');
    const { searchQuery, locationQuery } = buildSearchWithLocation(queryParams.search, [
      'name',
      'description',
      'shortDescription',
      'tags',
      'subcategory'
    ]);
    
    // Fusionner la recherche textuelle avec la requête existante
    if (searchQuery.$or && searchQuery.$or.length > 0) {
      // Si on a déjà un $or, on le combine avec $and
      if (queryObj.$or) {
        queryObj.$and = queryObj.$and || [];
        queryObj.$and.push({ $or: queryObj.$or });
        queryObj.$and.push({ $or: searchQuery.$or });
        delete queryObj.$or;
      } else {
        queryObj.$or = searchQuery.$or;
      }
    }
    
    // Ajouter le filtre de localisation si détecté
    if (locationQuery.$or && locationQuery.$or.length > 0) {
      queryObj.$and = queryObj.$and || [];
      const locationConditions = locationQuery.$or.map(cond => {
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
      queryObj.$and.push({ $or: locationConditions });
    }
  }

  // Pagination
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Construction de la requête
  let query = Product.find(queryObj)
    .populate('producer', 'farmName firstName lastName address salesStats createdAt country')
    .populate('transformer', 'companyName firstName lastName address salesStats createdAt country')
    .select('-__v');

  // Tri
  if (queryParams.sort) {
    const sortBy = queryParams.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Appliquer pagination
  query = query.skip(skip).limit(limit);

  // Exécuter la requête
  const products = await query;
  const total = await Product.countDocuments(queryObj);

  // Statistiques pour les filtres
  const categoryStats = await Product.aggregate([
    { $match: { status: 'approved', isActive: true, isPublic: { $ne: false } } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    categoryStats,
    userLocation,
    noProductsInZone
  };
}

/**
 * Obtenir les produits par localisation
 */
async function getProductsByLocation(queryParams = {}) {
  const userLocation = await getUserLocation({ query: queryParams });
  
  const baseQueryObj = { 
    status: 'approved', 
    isActive: true,
    isPublic: { $ne: false }
  };

  if (queryParams.category) baseQueryObj.category = queryParams.category;
  if (queryParams.subcategory) baseQueryObj.subcategory = queryParams.subcategory;
  if (queryParams.farmingMethod) baseQueryObj['agricultureInfo.farmingMethod'] = queryParams.farmingMethod;

  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Si pas de localisation détectée
  if (!userLocation || (!userLocation.city && !userLocation.region && !userLocation.country)) {
    const products = await Product.find(baseQueryObj)
      .populate('producer', 'farmName firstName lastName address city region country salesStats createdAt')
      .populate('transformer', 'companyName firstName lastName address city region country salesStats createdAt')
      .select('-__v')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(baseQueryObj);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      location: { detected: false }
    };
  }

  // Construire la requête avec filtre de localisation
  const locationQueryObj = { ...baseQueryObj };
  const locationQuery = buildLocationQuery(userLocation, {
    prioritizeRegion: true,
    prioritizeCity: true,
    radius: queryParams.radius ? parseFloat(queryParams.radius) : null
  });

  if (locationQuery.$or && locationQuery.$or.length > 0) {
    locationQueryObj.$and = locationQueryObj.$and || [];
    locationQueryObj.$and.push({ $or: locationQuery.$or });
  } else if (locationQuery['producer.address.coordinates']) {
    locationQueryObj['producer.address.coordinates'] = locationQuery['producer.address.coordinates'];
  }

  let query = Product.find(locationQueryObj)
    .populate('producer', 'farmName firstName lastName address city region country salesStats createdAt')
    .populate('transformer', 'companyName firstName lastName address city region country salesStats createdAt')
    .select('-__v')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const products = await query;
  const totalInLocation = await Product.countDocuments(locationQueryObj);

  // Si aucun produit trouvé dans la zone
  if (totalInLocation === 0) {
    const allProducts = await Product.find(baseQueryObj)
      .populate('producer', 'farmName firstName lastName address city region country salesStats createdAt')
      .populate('transformer', 'companyName firstName lastName address city region country salesStats createdAt')
      .select('-__v')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const totalAll = await Product.countDocuments(baseQueryObj);

    return {
      products: allProducts,
      total: totalAll,
      page,
      totalPages: Math.ceil(totalAll / limit),
      location: {
        detected: true,
        country: userLocation.country,
        region: userLocation.region,
        city: userLocation.city,
        source: userLocation.source,
        noProductsInZone: true
      }
    };
  }

  return {
    products,
    total: totalInLocation,
    page,
    totalPages: Math.ceil(totalInLocation / limit),
    location: {
      detected: true,
      country: userLocation.country,
      region: userLocation.region,
      city: userLocation.city,
      source: userLocation.source,
      noProductsInZone: false
    }
  };
}

/**
 * Recherche de produits (améliorée avec gestion pluriel/singulier et localisation)
 */
async function searchProducts(searchTerm, filters = {}) {
  const { buildSearchWithLocation } = require('../../utils/searchUtils');
  
  const queryObj = {
    status: 'approved',
    isActive: true,
    isPublic: { $ne: false },
    ...filters
  };
  
  // Utiliser la recherche flexible avec détection de localisation si un terme de recherche est fourni
  if (searchTerm && searchTerm.trim()) {
    const { searchQuery, locationQuery, extractedLocation } = buildSearchWithLocation(searchTerm, [
      'name',
      'description',
      'shortDescription',
      'tags',
      'subcategory'
    ]);
    
    // Ajouter la recherche textuelle
    if (searchQuery.$or && searchQuery.$or.length > 0) {
      queryObj.$and = queryObj.$and || [];
      queryObj.$and.push({ $or: searchQuery.$or });
    }
    
    // Ajouter le filtre de localisation (chercher dans l'adresse du producteur/transformateur)
    if (locationQuery.$or && locationQuery.$or.length > 0) {
      queryObj.$and = queryObj.$and || [];
      const locationConditions = locationQuery.$or.map(cond => {
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
      queryObj.$and.push({ $or: locationConditions });
    }
  }
  
  const searchResults = await Product.find(queryObj)
    .populate('producer', 'farmName firstName lastName address city region country')
    .populate('transformer', 'companyName firstName lastName address city region country')
    .sort('-createdAt')
    .limit(100);
  
  return searchResults;
}

/**
 * Obtenir un produit par ID ou slug
 */
async function getProductById(productId) {
  const product = await Product.findOne({
    $or: [
      { _id: productId },
      { slug: productId }
    ],
    status: 'approved',
    isActive: true,
    isPublic: { $ne: false }
  })
  .populate('producer', 'farmName firstName lastName address salesStats certifications createdAt country region userType shopLogo shopBanner avatar')
  .populate('transformer', 'companyName firstName lastName address salesStats certifications createdAt country region userType shopLogo shopBanner avatar');

  if (!product) {
    throw new Error('Produit non trouvé');
  }

  // Incrémenter les vues
  await product.incrementViews();

  // Obtenir les statistiques des avis
  const reviewStats = await Review.getProductRatingStats(product._id);

  // Produits similaires
  const similarProducts = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    status: 'approved',
    isActive: true,
    isPublic: { $ne: false }
  })
  .populate('producer', 'farmName firstName lastName createdAt country')
  .populate('transformer', 'companyName firstName lastName createdAt country')
  .limit(6)
  .sort('-createdAt');

  return {
    product,
    reviewStats: reviewStats[0] || null,
    similarProducts
  };
}

/**
 * Obtenir les produits en vedette
 */
async function getFeaturedProducts() {
  const products = await Product.find({
    isFeatured: true,
    status: 'approved',
    isActive: true
  })
  .populate('producer', 'farmName firstName lastName address createdAt country')
  .populate('transformer', 'companyName firstName lastName address createdAt country')
  .sort('-createdAt')
  .limit(12);

  return products;
}

/**
 * Obtenir les nouveaux produits
 */
async function getNewProducts() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const products = await Product.find({
    createdAt: { $gte: sevenDaysAgo },
    status: 'approved',
    isActive: true
  })
  .populate('producer', 'farmName firstName lastName createdAt country')
  .populate('transformer', 'companyName firstName lastName createdAt country')
  .sort('-createdAt')
  .limit(20);

  return products;
}

/**
 * Obtenir les catégories
 */
async function getCategories() {
  const categories = await Product.distinct('category', {
    status: 'approved',
    isActive: true
  });

  return categories;
}

/**
 * Obtenir les produits par catégorie
 */
async function getProductsByCategory(category, queryParams = {}) {
  const queryObj = { 
    category,
    status: 'approved', 
    isActive: true
  };

  if (queryParams.subcategory) queryObj.subcategory = queryParams.subcategory;
  if (queryParams.region) queryObj['producer.address.region'] = queryParams.region;
  if (queryParams.farmingMethod) queryObj['agricultureInfo.farmingMethod'] = queryParams.farmingMethod;
  if (queryParams.certified) queryObj['certifications.0'] = { $exists: true };

  // Filtres de prix
  if (queryParams.minPrice || queryParams.maxPrice) {
    queryObj.price = {};
    if (queryParams.minPrice) queryObj.price.$gte = parseFloat(queryParams.minPrice);
    if (queryParams.maxPrice) queryObj.price.$lte = parseFloat(queryParams.maxPrice);
  }

  // Recherche textuelle améliorée (gère pluriel/singulier et localisation)
  if (queryParams.search) {
    const { buildSearchWithLocation } = require('../../utils/searchUtils');
    const { searchQuery, locationQuery } = buildSearchWithLocation(queryParams.search, [
      'name',
      'description',
      'shortDescription',
      'tags',
      'subcategory'
    ]);
    
    // Fusionner la recherche textuelle avec la requête existante
    if (searchQuery.$or && searchQuery.$or.length > 0) {
      if (queryObj.$or) {
        queryObj.$and = queryObj.$and || [];
        queryObj.$and.push({ $or: queryObj.$or });
        queryObj.$and.push({ $or: searchQuery.$or });
        delete queryObj.$or;
      } else {
        queryObj.$or = searchQuery.$or;
      }
    }
    
    // Ajouter le filtre de localisation si détecté
    if (locationQuery.$or && locationQuery.$or.length > 0) {
      queryObj.$and = queryObj.$and || [];
      const locationConditions = locationQuery.$or.map(cond => {
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
      queryObj.$and.push({ $or: locationConditions });
    }
  }

  // Pagination
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const skip = (page - 1) * limit;

  let query = Product.find(queryObj)
    .populate('producer', 'farmName firstName lastName address salesStats createdAt country')
    .populate('transformer', 'companyName firstName lastName address salesStats createdAt country')
    .select('-__v');

  // Tri
  if (queryParams.sort) {
    const sortBy = queryParams.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  query = query.skip(skip).limit(limit);

  const products = await query;
  const total = await Product.countDocuments(queryObj);

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

module.exports = {
  getAllProducts,
  getProductsByLocation,
  searchProducts,
  getProductById,
  getFeaturedProducts,
  getNewProducts,
  getCategories,
  getProductsByCategory
};

