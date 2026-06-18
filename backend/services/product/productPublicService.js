const Product = require('../../models/Product');
const Review = require('../../models/Review');
const { buildSearchWithLocation } = require('../../utils/searchUtils');
const { getUserLocation, buildLocationQuery } = require('../../utils/locationService');

const countrySynonyms = {
  'SN': ['SN', 'Sénégal', 'Senegal'],
  'Sénégal': ['SN', 'Sénégal', 'Senegal'],
  'Senegal': ['SN', 'Sénégal', 'Senegal'],
  'CM': ['CM', 'Cameroun', 'Cameroon'],
  'Cameroun': ['CM', 'Cameroun', 'Cameroon'],
  'Cameroon': ['CM', 'Cameroun', 'Cameroon'],
  'CI': ['CI', "Côte d'Ivoire", "Cote d'Ivoire", 'Ivory Coast'],
  "Côte d'Ivoire": ['CI', "Côte d'Ivoire", "Cote d'Ivoire", 'Ivory Coast'],
  "Cote d'Ivoire": ['CI', "Côte d'Ivoire", "Cote d'Ivoire", 'Ivory Coast'],
  'BF': ['BF', 'Burkina Faso', 'Burkina'],
  'Burkina Faso': ['BF', 'Burkina Faso', 'Burkina'],
  'Burkina': ['BF', 'Burkina Faso', 'Burkina'],
  'ML': ['ML', 'Mali'],
  'Mali': ['ML', 'Mali'],
  'GH': ['GH', 'Ghana'],
  'Ghana': ['GH', 'Ghana'],
  'NG': ['NG', 'Nigeria'],
  'Nigeria': ['NG', 'Nigeria'],
  'NE': ['NE', 'Niger'],
  'Niger': ['NE', 'Niger'],
  'BJ': ['BJ', 'Bénin', 'Benin'],
  'Bénin': ['BJ', 'Bénin', 'Benin'],
  'Benin': ['BJ', 'Bénin', 'Benin'],
  'TG': ['TG', 'Togo'],
  'Togo': ['TG', 'Togo'],
  'GA': ['GA', 'Gabon'],
  'Gabon': ['GA', 'Gabon'],
  'CG': ['CG', 'Congo'],
  'Congo': ['CG', 'Congo'],
  'CD': ['CD', 'République démocratique du Congo', 'RDC', 'DRC', 'Democratic Republic of Congo'],
  'République démocratique du Congo': ['CD', 'République démocratique du Congo', 'RDC', 'DRC', 'Democratic Republic of Congo'],
  'TD': ['TD', 'Tchad', 'Chad'],
  'Tchad': ['TD', 'Tchad', 'Chad'],
  'CF': ['CF', 'République centrafricaine', 'Central African Republic'],
  'République centrafricaine': ['CF', 'République centrafricaine', 'Central African Republic'],
  'GQ': ['GQ', 'Guinée équatoriale', 'Equatorial Guinea'],
  'Guinée équatoriale': ['GQ', 'Guinée équatoriale', 'Equatorial Guinea']
};

function getCountryFilterList(country) {
  if (!country) return [];
  if (country === 'West Africa') {
    return ['SN', 'Sénégal', 'Senegal', 'CI', "Côte d'Ivoire", "Cote d'Ivoire", 'BF', 'Burkina Faso', 'ML', 'Mali', 'GH', 'Ghana', 'NG', 'Nigeria', 'NE', 'Niger', 'BJ', 'Bénin', 'Benin', 'TG', 'Togo'];
  }
  if (country === 'Central Africa') {
    return ['CM', 'Cameroun', 'Cameroon', 'GA', 'Gabon', 'CG', 'Congo', 'CD', 'République démocratique du Congo', 'TD', 'Tchad', 'CF', 'République centrafricaine', 'GQ', 'Guinée équatoriale'];
  }
  const normalized = country.trim();
  return countrySynonyms[normalized] || [normalized];
}

/**
 * Service pour les routes publiques des produits
 * Toutes les fonctions ont été fusionnées ici pour éviter les problèmes de résolution de module
 */

/**
 * Recherche de produits (améliorée avec gestion pluriel/singulier et localisation)
 */
async function searchProducts(searchTerm, filters = {}) {
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
    } else if (searchTerm.trim()) {
      // Fallback : recherche simple si buildSearchWithLocation ne retourne rien
      // Cela peut arriver si le terme est trop court ou ne correspond à aucune variante
      const normalizedTerm = searchTerm.trim().toLowerCase();
      const searchRegex = new RegExp(normalizedTerm, 'i');
      queryObj.$and = queryObj.$and || [];
      queryObj.$and.push({
        $or: [
          { name: searchRegex },
          { 'name.fr': searchRegex },
          { 'name.en': searchRegex },
          { description: searchRegex },
          { shortDescription: searchRegex },
          { tags: { $in: [searchRegex] } },
          { subcategory: searchRegex }
        ]
      });
    }
    
    // Ajouter le filtre de localisation (chercher dans l'adresse du producteur/transformateur)
    if (locationQuery.$or && locationQuery.$or.length > 0) {
      const User = require('../../models/User');
      const vendors = await User.find({ $or: locationQuery.$or }).select('_id');
      const vendorIds = vendors.map(v => v._id);
      
      queryObj.$and = queryObj.$and || [];
      queryObj.$and.push({
        $or: [
          { producer: { $in: vendorIds } },
          { transformer: { $in: vendorIds } },
          { restaurateur: { $in: vendorIds } }
        ]
      });
    }
  }
  
  const searchResults = await Product.find(queryObj)
    .populate('producer', 'farmName firstName lastName address city region country isBio')
    .populate('transformer', 'companyName firstName lastName address city region country isBio')
    .sort('-createdAt')
    .limit(100);
  
  return searchResults;
}

/**
 * Obtenir tous les produits avec filtres (incluant recherche)
 */
async function getAllProducts(queryParams = {}, userLocation = null) {
  const queryObj = { 
    status: 'approved', 
    isActive: true,
    isPublic: { $ne: false }
  };

  // Filtres explicites
  if (queryParams.category) queryObj.category = queryParams.category;
  if (queryParams.subcategory) queryObj.subcategory = queryParams.subcategory;
  
  if (queryParams.userType) {
    if (queryParams.userType.includes(',')) {
      queryObj.userType = { $in: queryParams.userType.split(',') };
    } else {
      queryObj.userType = queryParams.userType;
    }
  }

  if (queryParams.originType) queryObj.originType = queryParams.originType;
  
  if (queryParams.country) {
    const User = require('../../models/User');
    
    // Gérer les zones géographiques et synonymes
    const countriesToFilter = getCountryFilterList(queryParams.country);
    const countryRegexes = countriesToFilter.map(c => new RegExp(`^${c}$`, 'i'));

    const countryQuery = {
      $or: [
        { country: { $in: countryRegexes } },
        { 'address.country': { $in: countryRegexes } }
      ]
    };
    
    const vendors = await User.find(countryQuery).select('_id');
    const vendorIds = vendors.map(v => v._id);
    
    queryObj.$and = queryObj.$and || [];
    queryObj.$and.push({
      $or: [
        { producer: { $in: vendorIds } },
        { transformer: { $in: vendorIds } },
        { restaurateur: { $in: vendorIds } }
      ]
    });
  }

  if (queryParams.region) {
    const User = require('../../models/User');
    const vendors = await User.find({ 
      'address.region': { $regex: new RegExp(queryParams.region, 'i') } 
    }).select('_id');
    const vendorIds = vendors.map(v => v._id);
    
    queryObj.$and = queryObj.$and || [];
    queryObj.$and.push({
      $or: [
        { producer: { $in: vendorIds } },
        { transformer: { $in: vendorIds } },
        { restaurateur: { $in: vendorIds } }
      ]
    });
  }
  
  if (queryParams.farmingMethod) queryObj['agricultureInfo.farmingMethod'] = queryParams.farmingMethod;
  if (queryParams.certified) queryObj['certifications.0'] = { $exists: true };
  if (queryParams.isBio === 'true') {
    const User = require('../../models/User');
    const bioVendors = await User.find({ isBio: true }).select('_id');
    const bioVendorIds = bioVendors.map(v => v._id);
    
    queryObj.$and = queryObj.$and || [];
    queryObj.$and.push({
      $or: [
        { producer: { $in: bioVendorIds } },
        { transformer: { $in: bioVendorIds } },
        { restaurateur: { $in: bioVendorIds } }
      ]
    });
  }

  // Filtres de prix
  if (queryParams.minPrice || queryParams.maxPrice) {
    queryObj.price = {};
    if (queryParams.minPrice) queryObj.price.$gte = parseFloat(queryParams.minPrice);
    if (queryParams.maxPrice) queryObj.price.$lte = parseFloat(queryParams.maxPrice);
  }

  // Recherche textuelle améliorée (gère pluriel/singulier et localisation)
  if (queryParams.search) {
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

  let products = [];
  let total = 0;
  let noProductsInZone = false;
  let localVendorIds = [];
  let isLocalPrioritized = false;

  // Détection automatique de la localisation si activée et pas de pays explicite
  const shouldPrioritizeLocal = queryParams.useLocation !== 'false' && !queryParams.country && userLocation && (userLocation.city || userLocation.region || userLocation.country);

  if (shouldPrioritizeLocal) {
    const locationQuery = buildLocationQuery(userLocation, {
      prioritizeRegion: true,
      prioritizeCity: true
    });

    if (locationQuery.$or && locationQuery.$or.length > 0) {
      const User = require('../../models/User');
      const vendors = await User.find({ $or: locationQuery.$or }).select('_id');
      localVendorIds = vendors.map(v => v._id);
    }
  }

  // Si des vendeurs locaux sont trouvés, on fait le tri "local en premier"
  if (localVendorIds.length > 0) {
    isLocalPrioritized = true;
    
    // Requête pour les produits locaux
    const localQueryObj = {
      ...queryObj,
      $or: [
        { producer: { $in: localVendorIds } },
        { transformer: { $in: localVendorIds } },
        { restaurateur: { $in: localVendorIds } }
      ]
    };

    // Requête pour les autres produits (excluant les vendeurs locaux)
    const otherQueryObj = {
      ...queryObj,
      $and: [
        ...(queryObj.$and || []),
        {
          $nor: [
            { producer: { $in: localVendorIds } },
            { transformer: { $in: localVendorIds } },
            { restaurateur: { $in: localVendorIds } }
          ]
        }
      ]
    };

    // Calculer les totaux de chaque groupe
    const totalLocal = await Product.countDocuments(localQueryObj);
    const totalOther = await Product.countDocuments(otherQueryObj);
    total = totalLocal + totalOther;

    if (totalLocal === 0) {
      noProductsInZone = true;
    }

    // Récupérer les produits pour la page courante
    if (skip < totalLocal) {
      // La page courante contient au moins quelques produits locaux
      const localLimit = Math.min(limit, totalLocal - skip);
      let queryLocal = Product.find(localQueryObj)
        .populate('producer', 'farmName firstName lastName address salesStats createdAt country isBio')
        .populate('transformer', 'companyName firstName lastName address salesStats createdAt country isBio')
        .populate('restaurateur', 'restaurantName firstName lastName address salesStats createdAt country isBio')
        .select('-__v');

      if (queryParams.sort) {
        const sortBy = queryParams.sort.split(',').join(' ');
        queryLocal = queryLocal.sort(sortBy);
      } else {
        queryLocal = queryLocal.sort('-createdAt');
      }

      const localProducts = await queryLocal.skip(skip).limit(localLimit);
      products = [...localProducts];

      // S'il reste de la place sur la page, on complète avec des produits d'autres pays
      if (products.length < limit && totalOther > 0) {
        const otherLimit = limit - products.length;
        let queryOther = Product.find(otherQueryObj)
          .populate('producer', 'farmName firstName lastName address salesStats createdAt country isBio')
          .populate('transformer', 'companyName firstName lastName address salesStats createdAt country isBio')
          .populate('restaurateur', 'restaurantName firstName lastName address salesStats createdAt country isBio')
          .select('-__v');

        if (queryParams.sort) {
          const sortBy = queryParams.sort.split(',').join(' ');
          queryOther = queryOther.sort(sortBy);
        } else {
          queryOther = queryOther.sort('-createdAt');
        }

        const otherProducts = await queryOther.skip(0).limit(otherLimit);
        products = [...products, ...otherProducts];
      }
    } else {
      // Tous les produits locaux ont déjà été affichés sur les pages précédentes
      const otherSkip = skip - totalLocal;
      let queryOther = Product.find(otherQueryObj)
        .populate('producer', 'farmName firstName lastName address salesStats createdAt country isBio')
        .populate('transformer', 'companyName firstName lastName address salesStats createdAt country isBio')
        .populate('restaurateur', 'restaurantName firstName lastName address salesStats createdAt country isBio')
        .select('-__v');

      if (queryParams.sort) {
        const sortBy = queryParams.sort.split(',').join(' ');
        queryOther = queryOther.sort(sortBy);
      } else {
        queryOther = queryOther.sort('-createdAt');
      }

      const otherProducts = await queryOther.skip(otherSkip).limit(limit);
      products = [...otherProducts];
    }
  } else {
    // Chemin standard (pas de localisation ou aucun vendeur correspondant)
    let query = Product.find(queryObj)
      .populate('producer', 'farmName firstName lastName address salesStats createdAt country isBio')
      .populate('transformer', 'companyName firstName lastName address salesStats createdAt country isBio')
      .populate('restaurateur', 'restaurantName firstName lastName address salesStats createdAt country isBio')
      .select('-__v');

    if (queryParams.sort) {
      const sortBy = queryParams.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    products = await query.skip(skip).limit(limit);
    total = await Product.countDocuments(queryObj);
  }

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
      .populate('producer', 'farmName firstName lastName address city region country salesStats createdAt isBio')
      .populate('transformer', 'companyName firstName lastName address city region country salesStats createdAt isBio')
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
    const User = require('../../models/User');
    const vendors = await User.find({ $or: locationQuery.$or }).select('_id');
    const vendorIds = vendors.map(v => v._id);
    
    locationQueryObj.$and = locationQueryObj.$and || [];
    locationQueryObj.$and.push({
      $or: [
        { producer: { $in: vendorIds } },
        { transformer: { $in: vendorIds } },
        { restaurateur: { $in: vendorIds } }
      ]
    });
  } else if (locationQuery['producer.address.coordinates']) {
    // Note: Geospatial queries on referenced fields are complex, 
    // but for now we focus on city/region which are most common
  }

  let query = Product.find(locationQueryObj)
    .populate('producer', 'farmName firstName lastName address city region country salesStats createdAt isBio')
    .populate('transformer', 'companyName firstName lastName address city region country salesStats createdAt isBio')
    .populate('restaurateur', 'restaurantName firstName lastName address city region country salesStats createdAt isBio')
    .select('-__v')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const products = await query;
  const totalInLocation = await Product.countDocuments(locationQueryObj);

  // Si aucun produit trouvé dans la zone
  if (totalInLocation === 0) {
    const allProducts = await Product.find(baseQueryObj)
      .populate('producer', 'farmName firstName lastName address city region country salesStats createdAt isBio')
      .populate('transformer', 'companyName firstName lastName address city region country salesStats createdAt isBio')
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
 * Obtenir les catégories
 */
async function getCategories() {
  const categories = await Product.distinct('category', {
    status: 'approved',
    isActive: true
  });

  const filtered = categories.filter(c => c !== 'other' && c !== 'Other');
  if (categories.includes('other') || categories.includes('Other')) {
    filtered.push('other');
  }

  return filtered;
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
  if (queryParams.region) {
    const User = require('../../models/User');
    const vendors = await User.find({ 
      'address.region': { $regex: new RegExp(queryParams.region, 'i') } 
    }).select('_id');
    const vendorIds = vendors.map(v => v._id);
    
    queryObj.$and = queryObj.$and || [];
    queryObj.$and.push({
      $or: [
        { producer: { $in: vendorIds } },
        { transformer: { $in: vendorIds } },
        { restaurateur: { $in: vendorIds } }
      ]
    });
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
    .populate('producer', 'farmName firstName lastName address salesStats createdAt country isBio')
    .populate('transformer', 'companyName firstName lastName address salesStats createdAt country isBio')
    .populate('restaurateur', 'restaurantName firstName lastName address salesStats createdAt country isBio')
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

/**
 * Obtenir un produit par ID ou slug
 * Supporte à la fois les ObjectId MongoDB et les slugs textuels
 */
async function getProductById(productId) {
  // Détecter si c'est un ObjectId valide (24 caractères hexadécimaux)
  const isObjectId = /^[a-f\d]{24}$/i.test(productId);

  const query = {
    status: 'approved',
    isActive: true,
    isPublic: { $ne: false }
  };

  // Si c'est un ObjectId valide, chercher par _id OU slug
  // Sinon, chercher uniquement par slug pour éviter une CastError Mongoose
  if (isObjectId) {
    query.$or = [
      { _id: productId },
      { slug: productId }
    ];
  } else {
    query.slug = productId;
  }

  const product = await Product.findOne(query)
  .populate('producer', 'farmName firstName lastName address salesStats certifications createdAt country region userType shopLogo shopBanner avatar isBio')
  .populate('transformer', 'companyName firstName lastName address salesStats certifications createdAt country region userType shopLogo shopBanner avatar isBio')
  .populate('restaurateur', 'restaurantName firstName lastName address salesStats certifications createdAt country region userType shopLogo shopBanner avatar isBio');

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
  .populate('producer', 'farmName firstName lastName createdAt country isBio')
  .populate('transformer', 'companyName firstName lastName createdAt country isBio')
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
 * Filtre par pays du vendeur si une localisation est détectée
 */
async function getFeaturedProducts(queryParams = {}, userLocation = null) {
  const User = require('../../models/User');

  const baseQuery = {
    isFeatured: true,
    status: 'approved',
    isActive: true
  };

  // Filtre par pays explicite (depuis le frontend)
  let countryFilter = queryParams.country || (userLocation && userLocation.country);

  if (countryFilter) {
    const countriesToFilter = getCountryFilterList(countryFilter);
    const countryRegexes = countriesToFilter.map(c => new RegExp(`^${c}$`, 'i'));

    const vendors = await User.find({
      $or: [
        { country: { $in: countryRegexes } },
        { 'address.country': { $in: countryRegexes } }
      ]
    }).select('_id');
    const vendorIds = vendors.map(v => v._id);

    const localQuery = {
      ...baseQuery,
      $or: [
        { producer: { $in: vendorIds } },
        { transformer: { $in: vendorIds } },
        { restaurateur: { $in: vendorIds } }
      ]
    };

    const localProducts = await Product.find(localQuery)
      .populate('producer', 'farmName firstName lastName address createdAt country isBio')
      .populate('transformer', 'companyName firstName lastName address createdAt country isBio')
      .populate('restaurateur', 'restaurantName firstName lastName address createdAt country isBio')
      .sort('-createdAt')
      .limit(12);

    if (localProducts.length > 0) {
      return localProducts;
    }
    // Fallback to global if no local featured products
  }

  // Global (no location filter or no local results)
  const products = await Product.find(baseQuery)
    .populate('producer', 'farmName firstName lastName address createdAt country isBio')
    .populate('transformer', 'companyName firstName lastName address createdAt country isBio')
    .populate('restaurateur', 'restaurantName firstName lastName address createdAt country isBio')
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
  .populate('producer', 'farmName firstName lastName createdAt country isBio')
  .populate('transformer', 'companyName firstName lastName createdAt country isBio')
  .populate('restaurateur', 'restaurantName firstName lastName createdAt country isBio')
  .sort('-createdAt')
  .limit(20);

  return products;
}

/**
 * Obtenir les produits en vente flash
 * Filtre par pays du vendeur si une localisation est détectée
 */
async function getFlashSales(queryParams = {}, userLocation = null) {
  const User = require('../../models/User');
  const now = new Date();

  const baseQuery = {
    status: 'approved',
    isActive: true,
    'flashSale.isActive': true,
    'flashSale.endDate': { $gt: now }
  };

  // Filtre par pays explicite (depuis le frontend) ou localisation IP
  let countryFilter = queryParams.country || (userLocation && userLocation.country);

  if (countryFilter) {
    const countriesToFilter = getCountryFilterList(countryFilter);
    const countryRegexes = countriesToFilter.map(c => new RegExp(`^${c}$`, 'i'));

    const vendors = await User.find({
      $or: [
        { country: { $in: countryRegexes } },
        { 'address.country': { $in: countryRegexes } }
      ]
    }).select('_id');
    const vendorIds = vendors.map(v => v._id);

    const localQuery = {
      ...baseQuery,
      $or: [
        { producer: { $in: vendorIds } },
        { transformer: { $in: vendorIds } },
        { restaurateur: { $in: vendorIds } }
      ]
    };

    const localProducts = await Product.find(localQuery)
      .populate('producer', 'farmName firstName lastName address createdAt country isBio')
      .populate('transformer', 'companyName firstName lastName address createdAt country isBio')
      .populate('restaurateur', 'restaurantName firstName lastName address createdAt country isBio')
      .sort('flashSale.endDate')
      .limit(10);

    if (localProducts.length > 0) {
      return localProducts;
    }
    // Fallback to global if no local flash sales
  }

  // Global (no location filter or no local results)
  const products = await Product.find(baseQuery)
    .populate('producer', 'farmName firstName lastName address createdAt country isBio')
    .populate('transformer', 'companyName firstName lastName address createdAt country isBio')
    .populate('restaurateur', 'restaurantName firstName lastName address createdAt country isBio')
    .sort('flashSale.endDate')
    .limit(10);

  return products;
}

module.exports = {
  getAllProducts,
  getProductsByLocation,
  searchProducts,
  getProductById,
  getFeaturedProducts,
  getNewProducts,
  getCategories,
  getProductsByCategory,
  getFlashSales
};
