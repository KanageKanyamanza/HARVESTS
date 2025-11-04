const multer = require('multer');
const Product = require('../models/Product');
const Producer = require('../models/Producer');
const Review = require('../models/Review');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const notificationController = require('./notificationController');

// Configuration Multer pour les images de produits
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Veuillez télécharger uniquement des images!', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB par image
    files: 10 // Maximum 10 images
  }
});

exports.uploadProductImages = upload.array('images', 10);

// Middleware pour redimensionner les images (placeholder)
exports.resizeProductImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  req.body.images = [];

  await Promise.all(
    req.files.map(async (file, i) => {
      const filename = `product-${req.user.id}-${Date.now()}-${i + 1}.jpeg`;
      
      // Ici on devrait utiliser Sharp pour redimensionner
      // Pour l'instant, on simule juste
      req.body.images.push({
        url: `/img/products/${filename}`,
        alt: `Image ${i + 1}`,
        isPrimary: i === 0
      });
    })
  );

  next();
});

// ROUTES PUBLIQUES

// Obtenir tous les produits (avec filtres et recherche)
exports.getAllProducts = catchAsync(async (req, res, next) => {
  // Construction de la requête de base
  const queryObj = { 
    status: 'approved', 
    isActive: true,
    isPublic: { $ne: false }
  };

  // Filtres
  if (req.query.category) queryObj.category = req.query.category;
  if (req.query.subcategory) queryObj.subcategory = req.query.subcategory;
  if (req.query.region) queryObj['producer.address.region'] = req.query.region;
  if (req.query.farmingMethod) queryObj['agricultureInfo.farmingMethod'] = req.query.farmingMethod;
  if (req.query.certified) queryObj['certifications.0'] = { $exists: true };

  // Filtres de prix
  if (req.query.minPrice || req.query.maxPrice) {
    queryObj.price = {};
    if (req.query.minPrice) queryObj.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) queryObj.price.$lte = parseFloat(req.query.maxPrice);
  }

  // Recherche textuelle
  if (req.query.search) {
    const searchTerm = req.query.search.trim();
    // Recherche flexible avec regex (insensible à la casse et aux accents)
    queryObj.$or = [
      { 'name.fr': { $regex: searchTerm, $options: 'i' } },
      { 'name.en': { $regex: searchTerm, $options: 'i' } },
      { 'description.fr': { $regex: searchTerm, $options: 'i' } },
      { 'description.en': { $regex: searchTerm, $options: 'i' } },
      { 'shortDescription.fr': { $regex: searchTerm, $options: 'i' } },
      { 'shortDescription.en': { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } },
      { subcategory: { $regex: searchTerm, $options: 'i' } }
    ];
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Construction de la requête
  let query = Product.find(queryObj)
    .populate('producer', 'farmName firstName lastName address salesStats createdAt country')
    .populate('transformer', 'companyName firstName lastName address salesStats createdAt country')
    .select('-__v');

  // Tri
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
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

  res.status(200).json({
    status: 'success',
    results: products.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      products,
      filters: {
        categories: categoryStats
      }
    }
  });
});

// Recherche avancée de produits
exports.searchProducts = catchAsync(async (req, res, next) => {
  const { q, filters = {} } = req.query;

  const searchResults = await Product.search(q, filters);

  res.status(200).json({
    status: 'success',
    results: searchResults.length,
    data: {
      products: searchResults
    }
  });
});

// Obtenir un produit par ID ou slug
exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({
    $or: [
      { _id: req.params.id },
      { slug: req.params.id }
    ],
    status: 'approved',
    isActive: true,
    isPublic: { $ne: false }
  })
  .populate('producer', 'farmName firstName lastName address salesStats certifications createdAt country region userType shopLogo shopBanner avatar')
  .populate('transformer', 'companyName firstName lastName address salesStats certifications createdAt country region userType shopLogo shopBanner avatar');

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
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

  res.status(200).json({
    status: 'success',
    data: {
      product,
      reviewStats: reviewStats[0] || null,
      similarProducts
    }
  });
});

// Obtenir les produits en vedette
exports.getFeaturedProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({
    isFeatured: true,
    status: 'approved',
    isActive: true
  })
  .populate('producer', 'farmName firstName lastName address createdAt country')
  .populate('transformer', 'companyName firstName lastName address createdAt country')
  .sort('-createdAt')
  .limit(12);

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products
    }
  });
});

// Obtenir les nouveaux produits
exports.getNewProducts = catchAsync(async (req, res, next) => {
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

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products
    }
  });
});

// Obtenir les catégories de produits
exports.getCategories = catchAsync(async (req, res, next) => {
  const categories = await Product.distinct('category', {
    status: 'approved',
    isActive: true
  });

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: categories
  });
});

// Obtenir les produits par catégorie
exports.getProductsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  
  // Construction de la requête de base
  const queryObj = { 
    category,
    status: 'approved', 
    isActive: true
  };

  // Filtres additionnels
  if (req.query.subcategory) queryObj.subcategory = req.query.subcategory;
  if (req.query.region) queryObj['producer.address.region'] = req.query.region;
  if (req.query.farmingMethod) queryObj['agricultureInfo.farmingMethod'] = req.query.farmingMethod;
  if (req.query.certified) queryObj['certifications.0'] = { $exists: true };

  // Filtres de prix
  if (req.query.minPrice || req.query.maxPrice) {
    queryObj.price = {};
    if (req.query.minPrice) queryObj.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) queryObj.price.$lte = parseFloat(req.query.maxPrice);
  }

  // Recherche textuelle
  if (req.query.search) {
    queryObj.$text = { $search: req.query.search };
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Construction de la requête
  let query = Product.find(queryObj)
    .populate('producer', 'farmName firstName lastName address salesStats createdAt country')
    .populate('transformer', 'companyName firstName lastName address salesStats createdAt country')
    .select('-__v');

  // Tri
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Appliquer pagination
  query = query.skip(skip).limit(limit);

  // Exécuter la requête
  const products = await query;
  const total = await Product.countDocuments(queryObj);

  res.status(200).json({
    status: 'success',
    results: products.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      products
    }
  });
});

// ROUTES PROTÉGÉES PRODUCTEUR

// Obtenir mes produits
exports.getMyProducts = catchAsync(async (req, res, next) => {
  const queryObj = { producer: req.user.id };
  
  // Filtres optionnels
  if (req.query.status) queryObj.status = req.query.status;
  if (req.query.category) queryObj.category = req.query.category;

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const products = await Product.find(queryObj)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(queryObj);

  res.status(200).json({
    status: 'success',
    results: products.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      products
    }
  });
});

// Créer un nouveau produit
exports.createProduct = catchAsync(async (req, res, next) => {
  // Ajouter le producteur
  req.body.producer = req.user.id;

  // Traiter les images si présentes
  if (req.body.images && req.body.images.length > 0) {
    req.body.images = req.body.images.map((img, index) => ({
      ...img,
      order: index,
      isPrimary: index === 0
    }));
  }

  const product = await Product.create(req.body);

  // Notifier les admins d'un nouveau produit en attente d'approbation
  try {
    const producer = await Producer.findById(req.user.id).select('firstName lastName farmName');
    const producerName = producer.farmName || `${producer.firstName} ${producer.lastName}`;
    const productName = typeof product.name === 'object' ? 
      (product.name.fr || product.name.en || 'Sans nom') : 
      product.name;
    
    await notificationController.notifyProductPendingApproval(
      product._id, 
      productName, 
      producerName
    );
  } catch (error) {
    console.error('Erreur lors de l\'envoi de notification admin:', error);
    // Ne pas faire échouer la création du produit si la notification échoue
  }

  res.status(201).json({
    status: 'success',
    data: {
      product
    }
  });
});

// Obtenir un de mes produits
exports.getMyProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({
    _id: req.params.id,
    producer: req.user.id
  });

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

// Mettre à jour un de mes produits
exports.updateMyProduct = catchAsync(async (req, res, next) => {
  // Champs autorisés à la modification
  const allowedFields = [
    'name', 'description', 'shortDescription', 'price', 'compareAtPrice',
    'category', 'subcategory', 'tags', 'hasVariants', 'variants',
    'images', 'inventory', 'minimumOrderQuantity', 'maximumOrderQuantity'
  ];

  const filteredBody = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  // Si le produit était approuvé et qu'on modifie des champs importants,
  // repasser en révision
  const importantFields = ['name', 'description', 'price', 'category', 'images'];
  const hasImportantChanges = Object.keys(filteredBody).some(key => 
    importantFields.includes(key)
  );

  if (hasImportantChanges) {
    filteredBody.status = 'pending-review';
  }

  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, producer: req.user.id },
    filteredBody,
    { new: true, runValidators: true }
  );

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

// Supprimer un de mes produits
exports.deleteMyProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({
    _id: req.params.id,
    producer: req.user.id
  });

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  // Soft delete - marquer comme inactif
  product.isActive = false;
  product.status = 'inactive';
  await product.save();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Gestion des variantes
exports.addVariant = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({
    _id: req.params.id,
    producer: req.user.id
  });

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  product.variants.push(req.body);
  product.hasVariants = true;
  await product.save();

  res.status(201).json({
    status: 'success',
    data: {
      variant: product.variants[product.variants.length - 1]
    }
  });
});

exports.updateVariant = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({
    _id: req.params.id,
    producer: req.user.id
  });

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  const variant = product.variants.id(req.params.variantId);
  if (!variant) {
    return next(new AppError('Variante non trouvée', 404));
  }

  Object.keys(req.body).forEach(key => {
    variant[key] = req.body[key];
  });

  await product.save();

  res.status(200).json({
    status: 'success',
    data: {
      variant
    }
  });
});

exports.deleteVariant = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({
    _id: req.params.id,
    producer: req.user.id
  });

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  product.variants.pull(req.params.variantId);
  
  // Si plus de variantes, désactiver hasVariants
  if (product.variants.length === 0) {
    product.hasVariants = false;
  }

  await product.save();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Gestion du stock
exports.updateStock = catchAsync(async (req, res, next) => {
  const { quantity, variantId } = req.body;

  const product = await Product.findOne({
    _id: req.params.id,
    producer: req.user.id
  });

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  if (product.hasVariants && variantId) {
    const variant = product.variants.id(variantId);
    if (!variant) {
      return next(new AppError('Variante non trouvée', 404));
    }
    variant.inventory.quantity = quantity;
  } else {
    product.inventory.quantity = quantity;
  }

  product.lastStockUpdate = new Date();
  product.updateAvailabilityStatus();
  await product.save();

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

// Statistiques de mes produits
exports.getMyProductStats = catchAsync(async (req, res, next) => {
  const stats = await Product.aggregate([
    { $match: { producer: req.user.id } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        activeProducts: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        approvedProducts: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        totalViews: { $sum: 0 },
        totalSales: { $sum: 0 },
        totalRevenue: { $sum: 0 },
        averageRating: { $avg: 0 }
      }
    }
  ]);

  // Statistiques par catégorie
  const categoryStats = await Product.aggregate([
    { $match: { producer: req.user.id, isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalSales: { $sum: 0 },
        revenue: { $sum: 0 }
      }
    },
    { $sort: { revenue: -1 } }
  ]);

  // Produits les plus performants
  const topProducts = await Product.find({
    producer: req.user.id,
    isActive: true
  })
  .sort('-createdAt')
  .limit(5)
  .select('name price createdAt');

  res.status(200).json({
    status: 'success',
    data: {
      overview: stats[0] || {},
      categoryStats,
      topProducts
    }
  });
});

// ROUTES ADMIN

// Approuver un produit
exports.approveProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { 
      status: 'approved',
      publishedAt: new Date()
    },
    { new: true }
  ).populate('producer', 'firstName lastName email')
  .populate('transformer', 'firstName lastName email');

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  // Envoyer notification au producteur
  const Notification = require('../models/Notification');
  await Notification.notifyProductApproved(product, product.producer);

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

// Rejeter un produit
exports.rejectProduct = catchAsync(async (req, res, next) => {
  const { reason } = req.body;

  if (!reason) {
    return next(new AppError('Raison du rejet requise', 400));
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { 
      status: 'rejected',
      rejectionReason: reason
    },
    { new: true }
  ).populate('producer', 'firstName lastName email')
  .populate('transformer', 'firstName lastName email');

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  // Envoyer notification au producteur
  const Notification = require('../models/Notification');
  await Notification.createNotification({
    recipient: product.producer._id,
    type: 'product_rejected',
    category: 'product',
    title: 'Produit rejeté',
    message: `Votre produit "${product.name}" a été rejeté. Raison: ${reason}`,
    data: {
      productId: product._id,
      productName: product.name
    },
    channels: {
      inApp: { enabled: true },
      email: { enabled: true }
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

// Mettre un produit en vedette
exports.featureProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isFeatured: true },
    { new: true }
  );

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

// Retirer un produit de la vedette
exports.unfeatureProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isFeatured: false },
    { new: true }
  );

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

// Obtenir les produits en attente de modération
exports.getPendingProducts = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const products = await Product.find({
    status: 'pending-review'
  })
  .populate('producer', 'farmName firstName lastName email')
  .populate('transformer', 'companyName firstName lastName email')
  .sort('-createdAt')
  .skip(skip)
  .limit(limit);

  const total = await Product.countDocuments({ status: 'pending-review' });

  res.status(200).json({
    status: 'success',
    results: products.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      products
    }
  });
});

module.exports = exports;
