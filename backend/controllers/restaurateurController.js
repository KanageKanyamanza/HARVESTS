const multer = require('multer');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const Restaurateur = require('../models/Restaurateur');
const Product = require('../models/Product');
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
  // Récupérer tous les produits de type 'dish' du restaurateur avec les images
  const dishes = await Product.find({
    restaurateur: req.user.id,
    originType: 'dish'
  })
  .select('name description shortDescription price images primaryImage image dishInfo status isActive createdAt updatedAt slug restaurateur inventory')
  .sort('-createdAt');
  
  // Pour les plats existants sans gestion de stock, initialiser le stock à 10 par défaut
  const dishesToUpdate = [];
  dishes.forEach(p => {
    if (!p.inventory || p.inventory.trackQuantity === false) {
      if (!p.inventory) p.inventory = {};
      p.inventory.quantity = p.inventory.quantity || 10;
      p.inventory.lowStockThreshold = p.inventory.lowStockThreshold || Math.max(1, Math.floor(p.inventory.quantity * 0.2));
      p.inventory.trackQuantity = true;
      p.inventory.allowBackorder = false;
      p.inventory.reservedQuantity = p.inventory.reservedQuantity || 0;
      dishesToUpdate.push(p._id);
    }
  });
  
  if (dishesToUpdate.length > 0) {
    await Promise.all(dishesToUpdate.map(id => {
      const dish = dishes.find(d => d._id.toString() === id.toString());
      return Product.findByIdAndUpdate(id, { inventory: dish.inventory }, { new: true });
    }));
  }
  
  // S'assurer que tous les plats approuvés ont isActive à true
  const approvedDishesToUpdate = dishes.filter(p => p.status === 'approved' && !p.isActive);
  if (approvedDishesToUpdate.length > 0) {
    await Product.updateMany(
      { _id: { $in: approvedDishesToUpdate.map(p => p._id) } },
      { $set: { isActive: true } }
    );
    // Mettre à jour localement pour la réponse
    approvedDishesToUpdate.forEach(p => { p.isActive = true; });
  }
  
  res.status(200).json({
    status: 'success',
    data: { dishes }
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
  
  const restaurateur = await Restaurateur.findById(id).select('restaurantName');
  if (!restaurateur) {
    return res.status(404).json({
      status: 'error',
      message: 'Restaurateur non trouvé'
    });
  }
  
  // Récupérer directement depuis Product (comme producteurs/transformateurs)
  // Récupérer tous les plats approuvés avec stock disponible
  const products = await Product.find({
    restaurateur: id,
    originType: 'dish',
    status: 'approved',
    $or: [
      { 'inventory.trackQuantity': false }, // Anciens plats sans gestion de stock
      { 'inventory.trackQuantity': true, 'inventory.quantity': { $gt: 0 } }, // Plats avec stock > 0
      { 'inventory': { $exists: false } } // Plats sans inventory (fallback)
    ]
  }).select('name description shortDescription price images primaryImage image dishInfo slug isActive inventory').sort('-createdAt');
  
  // Pour les plats existants sans gestion de stock, initialiser le stock à 10 par défaut
  const productsToUpdateStock = [];
  products.forEach(p => {
    if (!p.inventory || p.inventory.trackQuantity === false) {
      if (!p.inventory) p.inventory = {};
      p.inventory.quantity = p.inventory.quantity || 10;
      p.inventory.lowStockThreshold = p.inventory.lowStockThreshold || Math.max(1, Math.floor(p.inventory.quantity * 0.2));
      p.inventory.trackQuantity = true;
      p.inventory.allowBackorder = false;
      p.inventory.reservedQuantity = p.inventory.reservedQuantity || 0;
      productsToUpdateStock.push(p._id);
    }
  });
  
  if (productsToUpdateStock.length > 0) {
    await Promise.all(productsToUpdateStock.map(id => {
      const product = products.find(p => p._id.toString() === id.toString());
      return Product.findByIdAndUpdate(id, { inventory: product.inventory }, { new: true });
    }));
    // Recharger les produits mis à jour
    const updatedProducts = await Product.find({
      restaurateur: id,
      originType: 'dish',
      status: 'approved'
    }).select('name description shortDescription price images primaryImage image dishInfo slug isActive inventory').sort('-createdAt');
    updatedProducts.forEach((updated, idx) => {
      const original = products.find(p => p._id.toString() === updated._id.toString());
      if (original) {
        products[idx] = updated;
      }
    });
  }
  
  // S'assurer que tous les plats approuvés ont isActive à true
  const productsToUpdate = products.filter(p => !p.isActive);
  if (productsToUpdate.length > 0) {
    await Product.updateMany(
      { _id: { $in: productsToUpdate.map(p => p._id) } },
      { $set: { isActive: true } }
    );
    // Mettre à jour localement pour la réponse
    productsToUpdate.forEach(p => { p.isActive = true; });
  }

  // Formater pour compatibilité avec le frontend existant
  const dishes = products.map((product) => {
    // Extraire l'image de manière exhaustive
    let imageUrl = null;
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'object' && firstImage !== null) {
        imageUrl = firstImage.url || firstImage.src || null;
      } else if (typeof firstImage === 'string') {
        imageUrl = firstImage;
      }
    }
    
    if (!imageUrl && product.primaryImage) {
      if (typeof product.primaryImage === 'object' && product.primaryImage !== null) {
        imageUrl = product.primaryImage.url || product.primaryImage.src || null;
      } else if (typeof product.primaryImage === 'string') {
        imageUrl = product.primaryImage;
      }
    }
    
    if (!imageUrl) {
      imageUrl = product.image || null;
    }
    
    return {
      _id: product._id,
      productId: product._id,
      name: product.name?.fr || product.name?.en || '',
      description: product.description?.fr || product.description?.en || product.shortDescription?.fr || '',
      price: product.price,
      image: imageUrl,
      images: product.images || [],
      dishInfo: product.dishInfo,
      category: product.dishInfo?.category,
      preparationTime: product.dishInfo?.preparationTime || null,
      allergens: product.dishInfo?.allergens || [],
      slug: product.slug,
      inventory: product.inventory || { quantity: 10, trackQuantity: true },
      stock: product.inventory?.quantity || 10,
      isInStock: (product.inventory?.quantity || 10) > 0,
      trackQuantity: product.inventory?.trackQuantity !== false
    };
  });
  
  res.status(200).json({
    status: 'success',
    data: { 
      dishes,
      restaurantName: restaurateur.restaurantName
    }
  });
});

exports.getDishDetail = catchAsync(async (req, res, next) => {
  const dishId = req.params.dishId;
  
  // Chercher le plat sans restriction de status d'abord
  const product = await Product.findOne({
    originType: 'dish',
    _id: dishId
  })
    .select('name description shortDescription price images primaryImage image dishInfo status isActive createdAt updatedAt slug restaurateur inventory')
    .populate('restaurateur', 'restaurantName firstName lastName address city region phone email');
  
  if (!product) {
    return next(new AppError('Plat non trouvé', 404));
  }
  
  // Si le plat est approuvé, il est visible par tous - pas besoin de vérifier l'authentification
  if (product.status === 'approved') {
    // Plat approuvé, accessible à tous
  } else {
    // Pour les plats non approuvés, vérifier si l'utilisateur est le propriétaire
    let currentUser = null;
    try {
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
      }
      
      if (token) {
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        const User = require('../models/User');
        currentUser = await User.findById(decoded.id).select('userType');
      }
    } catch (error) {
      // Si le token est invalide, on continue sans utilisateur
      currentUser = null;
    }
    
    const isOwner = currentUser && 
                    currentUser.userType === 'restaurateur' && 
                    product.restaurateur && 
                    (product.restaurateur._id?.toString() === currentUser._id?.toString() || 
                     product.restaurateur.toString() === currentUser._id?.toString());
    
    if (!isOwner) {
      return next(new AppError('Plat non trouvé', 404));
    }
  }
  
  // Si le plat est approuvé mais isActive est false, le mettre à true (pas de gestion de stock)
  if (product && product.status === 'approved' && !product.isActive) {
    product.isActive = true;
    await product.save();
  }

  // Formater pour compatibilité avec le frontend
  // Extraire l'image de manière exhaustive
  let imageUrl = null;
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0];
    if (typeof firstImage === 'object' && firstImage !== null) {
      imageUrl = firstImage.url || firstImage.src || null;
    } else if (typeof firstImage === 'string') {
      imageUrl = firstImage;
    }
  }
  
  if (!imageUrl && product.primaryImage) {
    if (typeof product.primaryImage === 'object' && product.primaryImage !== null) {
      imageUrl = product.primaryImage.url || product.primaryImage.src || null;
    } else if (typeof product.primaryImage === 'string') {
      imageUrl = product.primaryImage;
    }
  }
  
  if (!imageUrl) {
    imageUrl = product.image || null;
  }
  
  const dish = {
    _id: product._id,
    productId: product._id,
    name: product.name?.fr || product.name?.en || '',
    description: product.description?.fr || product.description?.en || product.shortDescription?.fr || '',
    price: product.price,
    images: product.images || [],
    image: imageUrl,
    dishInfo: product.dishInfo,
    category: product.dishInfo?.category,
    preparationTime: product.dishInfo?.preparationTime || null,
    allergens: product.dishInfo?.allergens || [],
    slug: product.slug,
    inventory: product.inventory || { quantity: 0, trackQuantity: true },
    stock: product.inventory?.quantity || 0,
    isInStock: (product.inventory?.quantity || 0) > 0,
    trackQuantity: product.inventory?.trackQuantity !== false
  };

  res.status(200).json({
    status: 'success',
    data: {
      dish,
      restaurateur: product.restaurateur
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
  const { name, description, price, image, category, preparationTime, allergens, stock } = req.body;
  
  const restaurateur = await Restaurateur.findById(req.user.id);
  if (!restaurateur) {
    return res.status(404).json({
      status: 'error',
      message: 'Restaurateur non trouvé'
    });
  }
  
  // Validation des champs obligatoires
  if (!name || !price) {
    return next(new AppError('Le nom et le prix sont requis', 400));
  }

  // Préparer les images
  const images = [];
  if (image) {
    images.push({ url: image, alt: typeof name === 'string' ? name : (name.fr || name.en || 'Plat'), isPrimary: true, order: 0 });
  }

  // Gérer le stock : par défaut 10, ou la valeur fournie (doit être >= 0)
  const initialStock = stock !== undefined && stock !== null ? Math.max(0, parseInt(stock) || 10) : 10;

  // Créer le produit avec structure multilingue (comme producteurs/transformateurs)
  const productData = {
    name: typeof name === 'object' ? name : { fr: name, en: name },
    description: typeof description === 'object' ? description : { fr: description || '', en: description || '' },
    shortDescription: description ? { fr: (typeof description === 'string' ? description : description.fr || '').slice(0, 160), en: (typeof description === 'string' ? description : description.en || '').slice(0, 160) } : { fr: 'Plat proposé par le restaurateur', en: 'Dish offered by the restaurant' },
    price: parseFloat(price),
    images,
    userType: 'restaurateur',
    restaurateur: req.user.id,
    category: 'processed-foods',
    subcategory: `dish-${category || 'plat'}`,
    originType: 'dish',
    dishInfo: {
      category: category || 'plat',
      preparationTime: preparationTime || 30,
      allergens: allergens || []
    },
    status: 'pending-review', // Toujours en attente de validation
    isActive: false, // Non disponible jusqu'à approbation
    isPublic: false, // Jamais visible dans les pages produits publiques
    inventory: {
      quantity: initialStock,
      lowStockThreshold: Math.max(1, Math.floor(initialStock * 0.2)), // 20% du stock initial
      trackQuantity: true, // Activer la gestion de stock pour les plats
      allowBackorder: false, // Pas de commande en arrière-plan
      reservedQuantity: 0
    },
    minimumOrderQuantity: 0
  };
  
  const product = await Product.create(productData);
  
  res.status(201).json({
    status: 'success',
    message: 'Plat soumis pour validation',
    data: { dish: product }
  });
});

exports.updateDish = catchAsync(async (req, res, next) => {
  const { dishId } = req.params;
  const updateData = req.body;
  
  // Vérifier que le produit appartient au restaurateur
  const product = await Product.findOne({
    _id: dishId,
    restaurateur: req.user.id,
    originType: 'dish'
  });

  if (!product) {
    return next(new AppError('Plat non trouvé', 404));
  }

  // Empêcher les restaurateurs de modifier manuellement l'état d'approbation
  delete updateData.status;
  delete updateData.approvedAt;
  delete updateData.rejectionReason;
  delete updateData.isPublic; // Ne jamais permettre de changer isPublic

  // Préparer les données de mise à jour
  const fieldsRequiringReview = ['name', 'description', 'price', 'category', 'image'];
  let requiresReview = fieldsRequiringReview.some((field) => Object.prototype.hasOwnProperty.call(updateData, field));

  // Traiter les champs spécifiques aux plats
  if (updateData.category || updateData.preparationTime !== undefined || updateData.allergens) {
    if (!product.dishInfo) product.dishInfo = {};
    if (updateData.category) product.dishInfo.category = updateData.category;
    if (updateData.preparationTime !== undefined) product.dishInfo.preparationTime = updateData.preparationTime;
    if (updateData.allergens) product.dishInfo.allergens = updateData.allergens;
    delete updateData.category;
    delete updateData.preparationTime;
    delete updateData.allergens;
    requiresReview = true; // Les modifications de dishInfo nécessitent une révision
  }

  // Traiter les champs multilingues
  if (updateData.name) {
    updateData.name = typeof updateData.name === 'object' ? updateData.name : { fr: updateData.name, en: updateData.name };
  }
  if (updateData.description) {
    updateData.description = typeof updateData.description === 'object' ? updateData.description : { fr: updateData.description, en: updateData.description };
    if (updateData.description.fr || updateData.description.en) {
      updateData.shortDescription = {
        fr: (updateData.description.fr || product.description?.fr || '').slice(0, 160),
        en: (updateData.description.en || product.description?.en || '').slice(0, 160)
      };
    }
  }

  // Traiter l'image
  if (updateData.image) {
    const imageUrl = typeof updateData.image === 'string' ? updateData.image : updateData.image.url;
    updateData.images = [{ url: imageUrl, alt: updateData.name?.fr || updateData.name?.en || product.name?.fr || 'Plat', isPrimary: true, order: 0 }];
    delete updateData.image;
  }

  // Traiter le prix
  if (updateData.price !== undefined) {
    updateData.price = parseFloat(updateData.price);
  }

  // Traiter le stock
  if (updateData.stock !== undefined && updateData.stock !== null) {
    const newStock = Math.max(0, parseInt(updateData.stock) || 0);
    if (!product.inventory) {
      product.inventory = {
        quantity: newStock,
        lowStockThreshold: Math.max(1, Math.floor(newStock * 0.2)),
        trackQuantity: true,
        allowBackorder: false,
        reservedQuantity: 0
      };
    } else {
      product.inventory.quantity = newStock;
      product.inventory.lowStockThreshold = Math.max(1, Math.floor(newStock * 0.2));
      product.inventory.trackQuantity = true; // Toujours activer pour les plats
    }
    delete updateData.stock;
  }

  // Mettre à jour le statut si nécessaire
  if (requiresReview) {
    updateData.status = 'pending-review';
    updateData.isActive = false;
  }

  // Mettre à jour le produit
  Object.assign(product, updateData);
  await product.save();
  
  res.status(200).json({
    status: 'success',
    message: requiresReview ? 'Plat mis à jour. Une nouvelle validation est nécessaire.' : 'Plat mis à jour avec succès',
    data: { dish: product }
  });
});

exports.deleteDish = catchAsync(async (req, res, next) => {
  const { dishId } = req.params;
  
  // Vérifier que le produit appartient au restaurateur
  const product = await Product.findOneAndDelete({
    _id: dishId,
    restaurateur: req.user.id,
    originType: 'dish'
  });

  if (!product) {
    return next(new AppError('Plat non trouvé', 404));
  }
  
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

exports.getMyOrders = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Un restaurateur peut être à la fois acheteur (quand il achète des produits) 
  // et vendeur (quand ses plats sont commandés par des consommateurs)
  const query = {
    $or: [
      { buyer: req.user._id },      // Commandes où le restaurateur est acheteur
      { seller: req.user._id }      // Commandes où le restaurateur est vendeur
    ]
  };

  // Filtres optionnels
  if (req.query.status) query.status = req.query.status;
  if (req.query.dateFrom) {
    query.createdAt = { $gte: new Date(req.query.dateFrom) };
  }
  if (req.query.dateTo) {
    query.createdAt = { ...query.createdAt, $lte: new Date(req.query.dateTo) };
  }

  const orders = await Order.find(query)
    .populate('buyer', 'firstName lastName email userType')
    .populate('seller', 'restaurantName companyName farmName firstName lastName email userType')
    .populate('items.product', 'name images originType')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(query);

  // Enrichir les commandes avec le rôle du restaurateur (acheteur ou vendeur)
  const enrichedOrders = orders.map(order => {
    const orderObj = order.toObject();
    orderObj.role = order.buyer?._id?.toString() === req.user._id.toString() 
      ? 'buyer' 
      : 'seller';
    return orderObj;
  });

  res.status(200).json({
    status: 'success',
    results: enrichedOrders.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      orders: enrichedOrders
    }
  });
});
exports.createOrder = temporaryResponse('Création commande');

exports.getMyOrder = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  
  // Un restaurateur peut être à la fois acheteur et vendeur
  const order = await Order.findOne({
    _id: req.params.orderId,
    $or: [
      { buyer: req.user._id },      // Commandes où le restaurateur est acheteur
      { seller: req.user._id }      // Commandes où le restaurateur est vendeur
    ]
  })
  .populate('buyer', 'firstName lastName email phone userType')
  .populate('seller', 'restaurantName companyName farmName firstName lastName email phone userType')
  .populate('items.product', 'name images category originType')
  .populate('delivery.transporter', 'companyName firstName lastName phone');

  if (!order) {
    return next(new AppError('Commande non trouvée ou vous n\'êtes pas autorisé à voir cette commande', 404));
  }

  // Ajouter le rôle du restaurateur dans cette commande
  const orderObj = order.toObject();
  orderObj.role = order.buyer?._id?.toString() === req.user._id.toString() 
    ? 'buyer' 
    : 'seller';

  res.status(200).json({
    status: 'success',
    data: { order: orderObj }
  });
});

exports.updateOrder = temporaryResponse('Mise à jour commande');

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  const { sendStatusNotifications } = require('./orderController');
  const { status, reason, note } = req.body;

  // Vérifier que la commande appartient au restaurateur (en tant que vendeur)
  const order = await Order.findOne({
    _id: req.params.orderId,
    seller: req.user._id
  });

  if (!order) {
    return next(new AppError('Commande non trouvée ou vous n\'êtes pas autorisé à modifier cette commande', 404));
  }

  await order.updateStatus(status, req.user._id, reason, note);

  // Envoyer notifications selon le nouveau statut
  await sendStatusNotifications(order, status);

  res.status(200).json({
    status: 'success',
    data: { order }
  });
});

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
  const Order = require('../models/Order');
  const Product = require('../models/Product');
  
  // Récupérer toutes les commandes où le restaurateur est vendeur (vente de plats)
  const orders = await Order.find({ 
    seller: req.user._id 
  }).populate('buyer', 'firstName lastName');
  
  // Récupérer tous les plats du restaurateur
  const dishes = await Product.find({ 
    restaurateur: req.user._id,
    originType: 'dish'
  });
  
  // Calculer les statistiques
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered');
  const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
  
  // Total de plats vendus
  let totalDishesSold = 0;
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      totalDishesSold += item.quantity;
    });
  });
  
  // Clients uniques
  const uniqueCustomers = new Set(orders.map(o => o.buyer?._id?.toString() || o.buyer?.toString())).size;
  
  // Plats les plus vendus
  const dishSales = {};
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      const productId = item.product?._id?.toString() || item.product?.toString();
      if (!dishSales[productId]) {
        dishSales[productId] = {
          quantity: 0,
          revenue: 0
        };
      }
      dishSales[productId].quantity += item.quantity;
      dishSales[productId].revenue += item.totalPrice || (item.quantity * item.unitPrice);
    });
  });
  
  const topDishes = await Promise.all(
    Object.entries(dishSales)
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 5)
      .map(async ([dishId, sales]) => {
        const dish = await Product.findById(dishId).select('name category dishInfo');
        return {
          id: dishId,
          name: dish?.name?.fr || dish?.name?.en || 'Plat',
          category: dish?.dishInfo?.category || dish?.category || 'plat',
          quantitySold: sales.quantity,
          revenue: sales.revenue
        };
      })
  );
  
  // Taux de conversion (plats actifs / total plats)
  const activeDishes = dishes.filter(d => d.isActive && d.status === 'approved').length;
  const conversionRate = dishes.length > 0 ? Math.round((activeDishes / dishes.length) * 100) : 0;
  
  // Taux de fidélisation (clients qui ont commandé plus d'une fois)
  const customerOrderCounts = {};
  orders.forEach(order => {
    const customerId = order.buyer?._id?.toString() || order.buyer?.toString();
    customerOrderCounts[customerId] = (customerOrderCounts[customerId] || 0) + 1;
  });
  const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
  const customerRetentionRate = uniqueCustomers > 0 ? Math.round((repeatCustomers / uniqueCustomers) * 100) : 0;

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalRevenue,
        totalOrders: orders.length,
        completedOrders: completedOrders.length,
        totalDishesSold,
        uniqueCustomers,
        topProducts: topDishes, // Utilisé comme topProducts dans le frontend pour compatibilité
        averageOrderValue,
        conversionRate,
        customerRetentionRate,
        totalProducts: dishes.length,
        activeProducts: activeDishes,
        totalProductsSold: totalDishesSold // Alias pour compatibilité
      }
    }
  });
});

exports.getStats = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  const Product = require('../models/Product');
  
  // Récupérer toutes les commandes où le restaurateur est vendeur
  const orders = await Order.find({ seller: req.user._id });
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered');
  
  // Calculer les revenus totaux
  const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  
  // Récupérer les plats du restaurateur
  const dishes = await Product.find({ 
    restaurateur: req.user._id,
    originType: 'dish'
  });
  const activeDishes = dishes.filter(d => d.isActive && d.status === 'approved');
  
  // Calculer les plats vendus
  const totalDishesSold = completedOrders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);
  
  // Clients uniques
  const uniqueCustomers = new Set(completedOrders.map(order => {
    const buyerId = order.buyer?._id?.toString() || order.buyer?.toString();
    return buyerId;
  }).filter(Boolean)).size;
  
  // Plats les plus vendus
  const dishSales = {};
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      const productId = item.product?._id?.toString() || item.product?.toString();
      if (!dishSales[productId]) {
        dishSales[productId] = {
          name: item.productSnapshot?.name?.fr || item.productSnapshot?.name?.en || 'Plat',
          category: item.productSnapshot?.dishInfo?.category || 'plat',
          quantitySold: 0,
          revenue: 0
        };
      }
      dishSales[productId].quantitySold += item.quantity;
      dishSales[productId].revenue += item.totalPrice || (item.quantity * item.unitPrice);
    });
  });
  
  const topProducts = Object.values(dishSales)
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 5);
  
  // Valeur moyenne des commandes
  const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
  
  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalRevenue,
        totalOrders: orders.length,
        completedOrders: completedOrders.length,
        totalProducts: dishes.length,
        activeProducts: activeDishes.length,
        totalProductsSold: totalDishesSold,
        uniqueCustomers,
        topProducts,
        averageOrderValue,
        conversionRate: orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0,
        customerRetentionRate: 0
      }
    }
  });
});

exports.getSalesAnalytics = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  
  // Récupérer les commandes des 12 derniers mois où le restaurateur est vendeur
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  
  const orders = await Order.find({ 
    seller: req.user._id,
    status: { $in: ['completed', 'delivered'] },
    createdAt: { $gte: twelveMonthsAgo }
  });
  
  // Grouper par mois
  const monthlySales = {};
  orders.forEach(order => {
    const month = new Date(order.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
    if (!monthlySales[month]) {
      monthlySales[month] = {
        orders: 0,
        revenue: 0,
        products: 0
      };
    }
    monthlySales[month].orders += 1;
    monthlySales[month].revenue += order.total || 0;
    order.items.forEach(item => {
      monthlySales[month].products += item.quantity;
    });
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      analytics: {
        monthlySales: Object.entries(monthlySales).map(([month, data]) => ({
          month,
          ...data
        }))
      }
    }
  });
});

exports.getRevenueAnalytics = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  
  const orders = await Order.find({ 
    seller: req.user._id,
    status: { $in: ['completed', 'delivered'] },
    createdAt: { $gte: twelveMonthsAgo }
  });
  
  // Grouper les revenus par mois
  const monthlyRevenue = {};
  orders.forEach(order => {
    const month = new Date(order.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
    if (!monthlyRevenue[month]) {
      monthlyRevenue[month] = 0;
    }
    monthlyRevenue[month] += order.total || 0;
  });
  
  // Mois actuel
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthRevenue = orders
    .filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    })
    .reduce((sum, order) => sum + (order.total || 0), 0);
  
  res.status(200).json({
    status: 'success',
    data: {
      analytics: {
        monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({
          month,
          revenue
        })),
        currentMonthRevenue,
        totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0)
      }
    }
  });
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
