const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Producer = require('../models/Producer');
const { createDynamicStorage } = require('../config/cloudinary');
const multer = require('multer');

// Import de la fonction de notification depuis orderController
const { sendStatusNotifications } = require('./orderController');

// Configuration Multer pour Cloudinary
const createUploadMiddleware = (contentType, category = null, fieldName = 'images', maxFiles = 5) => {
  const storage = createDynamicStorage('producer', contentType, category);
  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024, files: maxFiles },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image') || file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new AppError('Veuillez télécharger uniquement des images ou des PDF!', 400), false);
      }
    }
  });
  return maxFiles === 1 ? upload.single(fieldName) : upload.array(fieldName, maxFiles);
};

exports.uploadProductImages = createUploadMiddleware('product', 'cereals', 'images', 5);
exports.uploadCertificationDocument = createUploadMiddleware('document', null, 'document', 1);
exports.uploadDocument = createUploadMiddleware('document', null, 'document', 1);

// Middleware pour traiter les images de produits
exports.processProductImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  req.body.images = req.files.map((file, index) => ({
    url: file.path,
    alt: `Image ${index + 1}`,
    isPrimary: index === 0,
    order: index
  }));

  next();
});

// ROUTES PUBLIQUES

// Obtenir tous les producteurs
exports.getAllProducers = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'lang'];
  excludedFields.forEach((el) => delete queryObj[el]);

  // Ajouter les filtres de base
  queryObj.isActive = true;
  queryObj.isApproved = true;
  queryObj.isEmailVerified = true;

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let query = Producer.find(JSON.parse(queryStr));

  // Tri
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-salesStats.averageRating -createdAt');
  }

  // Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  const producers = await query;
  const total = await Producer.countDocuments(JSON.parse(queryStr));

  res.status(200).json({
    status: 'success',
    results: producers.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      producers,
    },
  });
});

// Recherche de producteurs
exports.searchProducers = catchAsync(async (req, res, next) => {
  const { q, region, crop, farmingType, minRating } = req.query;

  let searchQuery = {
    isActive: true,
    isApproved: true,
    isEmailVerified: true,
  };

  // Recherche textuelle
  if (q) {
    searchQuery.$or = [
      { farmName: { $regex: q, $options: 'i' } },
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
      { 'crops.name': { $regex: q, $options: 'i' } }
    ];
  }

  // Filtres spécifiques
  if (region) searchQuery['address.region'] = region;
  if (crop) searchQuery['crops.name'] = { $regex: crop, $options: 'i' };
  if (farmingType) searchQuery.farmingType = farmingType;
  if (minRating) searchQuery['salesStats.averageRating'] = { $gte: parseFloat(minRating) };

  const producers = await Producer.find(searchQuery)
    .sort('-salesStats.averageRating -salesStats.totalOrders')
    .limit(50);

  res.status(200).json({
    status: 'success',
    results: producers.length,
    data: {
      producers,
    },
  });
});

// Obtenir les producteurs par région
exports.getProducersByRegion = catchAsync(async (req, res, next) => {
  const producers = await Producer.find({
    'address.region': req.params.region,
    isActive: true,
    isApproved: true,
    isEmailVerified: true,
  }).sort('-salesStats.averageRating');

  res.status(200).json({
    status: 'success',
    results: producers.length,
    data: {
      producers,
    },
  });
});

// Obtenir les producteurs par culture
exports.getProducersByCrop = catchAsync(async (req, res, next) => {
  const producers = await Producer.find({
    'crops.name': { $regex: req.params.crop, $options: 'i' },
    isActive: true,
    isApproved: true,
    isEmailVerified: true,
  }).sort('-salesStats.averageRating');

  res.status(200).json({
    status: 'success',
    results: producers.length,
    data: {
      producers,
    },
  });
});

// Obtenir un producteur par ID
exports.getProducer = catchAsync(async (req, res, next) => {
  const producer = await Producer.findOne({
    _id: req.params.id,
    isActive: true,
    isEmailVerified: true,
  });

  if (!producer) {
    return next(new AppError('Producteur non trouvé', 404));
  }

  // Calculer les statistiques de notation
  const Review = require('../models/Review');
  const reviews = await Review.find({ 
    producer: req.params.id,
    status: 'approved'
  });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
    : 0;

  // Ajouter les statistiques de notation au producteur
  const producerWithStats = {
    ...producer.toObject(),
    ratings: {
      average: averageRating,
      count: totalReviews
    },
    stats: {
      totalReviews,
      averageRating,
      ...producer.stats
    }
  };

  res.status(200).json({
    status: 'success',
    data: {
      producer: producerWithStats,
    },
  });
});

// Obtenir les produits d'un producteur
exports.getProducerProducts = catchAsync(async (req, res, next) => {
  const Product = require('../models/Product');
  
  const queryObj = { 
    producer: req.params.id,
    status: { $in: ['approved', 'active'] } // Seulement les produits approuvés pour l'affichage public
  };
  
  // Filtres optionnels
  if (req.query.category) queryObj.category = req.query.category;
  if (req.query.status) queryObj.status = req.query.status;

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const products = await Product.find(queryObj)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('producer', 'firstName lastName farmName');

  const total = await Product.countDocuments(queryObj);

  res.status(200).json({
    status: 'success',
    results: products.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      products,
    },
  });
});

// Obtenir les avis d'un producteur
exports.getProducerReviews = catchAsync(async (req, res, next) => {
  const producerId = req.params.id;
  
  // Vérifier que le producteur existe
  const producer = await Producer.findById(producerId);
  if (!producer) {
    return next(new AppError('Producteur non trouvé', 404));
  }

  // Récupérer tous les produits du producteur
  const products = await Product.find({ 
    producer: producerId,
    isActive: true,
    status: 'approved'
  }).select('_id');

  const productIds = products.map(p => p._id);

  // Récupérer les avis pour les produits de ce producteur
  const reviews = await Review.find({ 
    product: { $in: productIds },
    isActive: true 
  })
  .populate('reviewer', 'firstName lastName avatar')
  .populate('product', 'name.fr name.en images')
  .sort('-createdAt')
  .limit(20);

  // Calculer les statistiques des avis
  const stats = await Review.aggregate([
    { $match: { product: { $in: productIds }, isActive: true } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  const reviewStats = stats[0] || {
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: []
  };

  res.status(200).json({
    status: 'success',
    data: { 
      reviews,
      stats: {
        totalReviews: reviewStats.totalReviews,
        averageRating: Math.round(reviewStats.averageRating * 10) / 10,
        ratingDistribution: {
          5: reviewStats.ratingDistribution.filter(r => r === 5).length,
          4: reviewStats.ratingDistribution.filter(r => r === 4).length,
          3: reviewStats.ratingDistribution.filter(r => r === 3).length,
          2: reviewStats.ratingDistribution.filter(r => r === 2).length,
          1: reviewStats.ratingDistribution.filter(r => r === 1).length,
        }
      }
    },
  });
});

// ROUTES PROTÉGÉES PRODUCTEUR

// Obtenir mon profil
exports.getMyProfile = catchAsync(async (req, res, next) => {
  const producer = await Producer.findById(req.user._id);

  res.status(200).json({
    status: 'success',
    data: {
      producer,
    },
  });
});

// Mettre à jour mon profil
exports.updateMyProfile = catchAsync(async (req, res, next) => {
  // Filtrer les champs autorisés
  const allowedFields = [
    'farmName', 'farmSize', 'farmingType', 'storageCapacity',
    'deliveryOptions', 'minimumOrderQuantity'
  ];
  
  const filteredBody = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  const producer = await Producer.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      producer,
    },
  });
});

// Gestion des cultures
exports.getMyCrops = catchAsync(async (req, res, next) => {
  const producer = await Producer.findById(req.user._id).select('crops');

  res.status(200).json({
    status: 'success',
    results: producer.crops.length,
    data: {
      crops: producer.crops,
    },
  });
});

exports.addCrop = catchAsync(async (req, res, next) => {
  const producer = await Producer.findById(req.user._id);
  
  producer.crops.push(req.body);
  await producer.save();

  res.status(201).json({
    status: 'success',
    data: {
      crop: producer.crops[producer.crops.length - 1],
    },
  });
});

exports.updateCrop = catchAsync(async (req, res, next) => {
  const producer = await Producer.findById(req.user._id);
  const crop = producer.crops.id(req.params.cropId);

  if (!crop) {
    return next(new AppError('Culture non trouvée', 404));
  }

  Object.keys(req.body).forEach(key => {
    crop[key] = req.body[key];
  });

  await producer.save();

  res.status(200).json({
    status: 'success',
    data: {
      crop,
    },
  });
});

exports.removeCrop = catchAsync(async (req, res, next) => {
  const producer = await Producer.findById(req.user._id);
  
  producer.crops.pull(req.params.cropId);
  await producer.save();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Gestion des certifications
exports.getMyCertifications = catchAsync(async (req, res, next) => {
  const producer = await Producer.findById(req.user._id).select('certifications');

  res.status(200).json({
    status: 'success',
    results: producer.certifications.length,
    data: {
      certifications: producer.certifications,
    },
  });
});

exports.addCertification = catchAsync(async (req, res, next) => {
  const producer = await Producer.findById(req.user._id);
  
  const certificationData = { ...req.body };
  
  // Ajouter le document s'il y en a un
  if (req.file) {
    // Ici, on devrait uploader vers Cloudinary
    // Pour l'instant, on sauvegarde localement
    certificationData.document = req.file.filename;
  }

  producer.certifications.push(certificationData);
  await producer.save();

  res.status(201).json({
    status: 'success',
    data: {
      certification: producer.certifications[producer.certifications.length - 1],
    },
  });
});

exports.updateCertification = catchAsync(async (req, res, next) => {
  const producer = await Producer.findById(req.user._id);
  const certification = producer.certifications.id(req.params.certId);

  if (!certification) {
    return next(new AppError('Certification non trouvée', 404));
  }

  Object.keys(req.body).forEach(key => {
    certification[key] = req.body[key];
  });

  await producer.save();

  res.status(200).json({
    status: 'success',
    data: {
      certification,
    },
  });
});

exports.removeCertification = catchAsync(async (req, res, next) => {
  const producer = await Producer.findById(req.user._id);
  
  producer.certifications.pull(req.params.certId);
  await producer.save();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Gestion des équipements
exports.getMyEquipment = catchAsync(async (req, res, next) => {
  const producer = await Producer.findById(req.user._id).select('equipment');

  res.status(200).json({
    status: 'success',
    results: producer.equipment.length,
    data: {
      equipment: producer.equipment,
    },
  });
});

exports.addEquipment = catchAsync(async (req, res, next) => {
  const producer = await Producer.findById(req.user._id);
  
  producer.equipment.push(req.body);
  await producer.save();

  res.status(201).json({
    status: 'success',
    data: {
      equipment: producer.equipment[producer.equipment.length - 1],
    },
  });
});

exports.updateEquipment = catchAsync(async (req, res, next) => {
  const producer = await Producer.findById(req.user._id);
  const equipment = producer.equipment.id(req.params.equipmentId);

  if (!equipment) {
    return next(new AppError('Équipement non trouvé', 404));
  }

  Object.keys(req.body).forEach(key => {
    equipment[key] = req.body[key];
  });

  await producer.save();

  res.status(200).json({
    status: 'success',
    data: {
      equipment,
    },
  });
});

exports.removeEquipment = catchAsync(async (req, res, next) => {
  const producer = await Producer.findById(req.user._id);
  
  producer.equipment.pull(req.params.equipmentId);
  await producer.save();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Gestion des produits (implémentation complète)
exports.getMyProducts = catchAsync(async (req, res, next) => {
  console.log('🔍 getMyProducts appelé avec req.user:', req.user);
  console.log('🔍 req.user._id:', req.user?.id);
  console.log('🔍 req.user._id:', req.user?._id);
  
  const Product = require('../models/Product');
  
  // Utiliser _id au lieu de id car req.user est un document Mongoose
  const queryObj = { 
    producer: req.user._id,
    isActive: true  // Ne retourner que les produits actifs
  };
  if (req.query.status) queryObj.status = req.query.status;
  if (req.query.category) queryObj.category = req.query.category;

  console.log('🔍 Query object:', queryObj);

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const products = await Product.find(queryObj)
    .populate('producer', 'farmName firstName lastName address salesStats certifications businessName createdAt country')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(queryObj);

  console.log('🔍 Produits trouvés:', products.length, 'sur', total);

  res.status(200).json({
    status: 'success',
    results: products.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: { products }
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const Product = require('../models/Product');
  
  const {
    name,
    description,
    shortDescription,
    category,
    subcategory,
    tags,
    price,
    compareAtPrice,
    stock,
    minimumOrderQuantity,
    maximumOrderQuantity,
    unit,
    status,
    images
  } = req.body;

  // Validation des champs obligatoires
  if (!name || !description || !category || !price || stock === undefined) {
    return next(new AppError('Tous les champs obligatoires doivent être remplis', 400));
  }

  // Créer le produit avec structure multilingue
  const productData = {
    name: typeof name === 'object' ? name : { fr: name, en: name },
    description: typeof description === 'object' ? description : { fr: description, en: description },
    shortDescription: typeof shortDescription === 'object' ? shortDescription : { fr: shortDescription, en: shortDescription },
    category,
    subcategory: subcategory || category,
    tags: tags || [],
    price: parseFloat(price),
    compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
    inventory: {
      quantity: parseInt(stock) || 0
    },
    minimumOrderQuantity: minimumOrderQuantity || 1,
    maximumOrderQuantity: maximumOrderQuantity || undefined,
    unit: unit || 'kg',
    status: status || 'draft',
    images: images ? images.map((img, index) => ({
      ...img,
      order: index,
      isPrimary: index === 0
    })) : [],
    producer: req.user._id,
    userType: 'producer'
  };
  
  const product = await Product.create(productData);

  res.status(201).json({
    status: 'success',
    data: { product }
  });
});

exports.getMyProduct = catchAsync(async (req, res, next) => {
  const Product = require('../models/Product');
  
  const product = await Product.findOne({
    _id: req.params.productId,
    producer: req.user._id
  })
  .populate('producer', 'farmName firstName lastName address salesStats certifications businessName createdAt country');

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { product }
  });
});

exports.updateMyProduct = catchAsync(async (req, res, next) => {
  const Product = require('../models/Product');
  
  const product = await Product.findOneAndUpdate(
    { _id: req.params.productId, producer: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { product }
  });
});

exports.deleteMyProduct = catchAsync(async (req, res, next) => {
  const Product = require('../models/Product');
  
  const product = await Product.findOneAndUpdate(
    { _id: req.params.productId, producer: req.user._id },
    { isActive: false, status: 'inactive' },
    { new: true }
  );

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Gestion des commandes (implémentation complète)
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const queryObj = { seller: req.user._id };
  if (req.query.status) queryObj.status = req.query.status;

  const orders = await Order.find(queryObj)
    .populate('buyer', 'firstName lastName email phone')
    .populate('items.product', 'name images')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(queryObj);

  res.status(200).json({
    status: 'success',
    results: orders.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: { orders }
  });
});

exports.getMyOrder = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  
  const order = await Order.findOne({
    _id: req.params.orderId,
    seller: req.user._id
  })
  .populate('buyer', 'firstName lastName email phone')
  .populate('items.product', 'name images category');

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { order }
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  const { status, reason, note } = req.body;

  const order = await Order.findOne({
    _id: req.params.orderId,
    seller: req.user._id
  });

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  await order.updateStatus(status, req.user._id, reason, note);

  // Envoyer notifications selon le nouveau statut
  await sendStatusNotifications(order, status);

  res.status(200).json({
    status: 'success',
    data: { order }
  });
});

// Statistiques
exports.getMyStats = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  const Product = require('../models/Product');
  
  const producer = await Producer.findById(req.user._id).select('salesStats');
  
  // Récupérer toutes les commandes du producteur
  const orders = await Order.find({ 
    seller: req.user._id 
  }).populate('buyer', 'firstName lastName');
  
  // Récupérer tous les produits du producteur
  const products = await Product.find({ 
    producer: req.user._id 
  });
  
  // Calculer les statistiques
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered');
  const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
  
  // Total de produits vendus
  let totalProductsSold = 0;
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      totalProductsSold += item.quantity;
    });
  });
  
  // Clients uniques
  const uniqueCustomers = new Set(orders.map(o => o.buyer?._id?.toString() || o.buyer?.toString())).size;
  
  // Produits les plus vendus
  const productSales = {};
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      const productId = item.product?._id?.toString() || item.product?.toString();
      if (!productSales[productId]) {
        productSales[productId] = {
          quantity: 0,
          revenue: 0
        };
      }
      productSales[productId].quantity += item.quantity;
      productSales[productId].revenue += item.totalPrice || (item.quantity * item.unitPrice);
    });
  });
  
  const topProducts = await Promise.all(
    Object.entries(productSales)
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 5)
      .map(async ([productId, sales]) => {
        const product = await Product.findById(productId).select('name category');
        return {
          id: productId,
          name: product?.name?.fr || product?.name?.en || 'Produit',
          category: product?.category,
          quantitySold: sales.quantity,
          revenue: sales.revenue
        };
      })
  );
  
  // Taux de conversion (produits actifs / total produits)
  const activeProducts = products.filter(p => p.isActive && p.status === 'approved').length;
  const conversionRate = products.length > 0 ? Math.round((activeProducts / products.length) * 100) : 0;
  
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
        totalProductsSold,
        uniqueCustomers,
        topProducts,
        averageOrderValue,
        conversionRate,
        customerRetentionRate,
        totalProducts: products.length,
        activeProducts
      }
    }
  });
});

exports.getStats = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  const Product = require('../models/Product');
  
  // Récupérer toutes les commandes du producteur
  const orders = await Order.find({ seller: req.user._id });
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered');
  
  // Calculer les revenus totaux
  const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  
  // Récupérer les produits du producteur
  const products = await Product.find({ producer: req.user._id });
  const activeProducts = products.filter(p => p.isActive && p.status === 'approved');
  
  // Calculer les produits vendus
  const totalProductsSold = completedOrders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);
  
  // Clients uniques
  const uniqueCustomers = new Set(completedOrders.map(order => order.buyer.toString())).size;
  
  // Produits les plus vendus
  const productSales = {};
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      if (!productSales[item.product]) {
        productSales[item.product] = {
          name: item.name,
          category: item.category,
          quantitySold: 0,
          revenue: 0
        };
      }
      productSales[item.product].quantitySold += item.quantity;
      productSales[item.product].revenue += item.price * item.quantity;
    });
  });
  
  const topProducts = Object.values(productSales)
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
        totalProducts: products.length,
        activeProducts: activeProducts.length,
        totalProductsSold,
        uniqueCustomers,
        topProducts,
        averageOrderValue,
        conversionRate: orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0,
        customerRetentionRate: 0 // À implémenter si nécessaire
      }
    }
  });
});

exports.getSalesAnalytics = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  
  // Récupérer les commandes des 12 derniers mois
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

// Gestion des transporteurs préférés
exports.getPreferredTransporters = catchAsync(async (req, res, next) => {
  const producer = await Producer.findById(req.user._id)
    .select('preferredTransporters')
    .populate('preferredTransporters', 'companyName phone address performanceStats');

  res.status(200).json({
    status: 'success',
    results: producer.preferredTransporters.length,
    data: {
      transporters: producer.preferredTransporters,
    },
  });
});

exports.addPreferredTransporter = catchAsync(async (req, res, next) => {
  const producer = await Producer.findById(req.user._id);
  
  // Vérifier si le transporteur n'est pas déjà dans la liste
  if (producer.preferredTransporters.includes(req.body.transporterId)) {
    return next(new AppError('Ce transporteur est déjà dans vos préférés', 400));
  }

  producer.preferredTransporters.push(req.body.transporterId);
  await producer.save();

  res.status(201).json({
    status: 'success',
    message: 'Transporteur ajouté aux préférés',
  });
});

exports.removePreferredTransporter = catchAsync(async (req, res, next) => {
  const producer = await Producer.findById(req.user._id);
  
  producer.preferredTransporters.pull(req.params.transporterId);
  await producer.save();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Gestion des documents
exports.getMyDocuments = catchAsync(async (req, res, next) => {
  const producer = await Producer.findById(req.user._id).select('documents');

  res.status(200).json({
    status: 'success',
    data: {
      documents: producer.documents,
    },
  });
});

exports.addDocument = catchAsync(async (req, res, next) => {
  const producer = await Producer.findById(req.user._id);
  
  if (!req.file) {
    return next(new AppError('Veuillez télécharger un document', 400));
  }

  // Ici, on devrait uploader vers Cloudinary
  const documentData = {
    ...req.body,
    document: req.file.filename,
  };

  // Mettre à jour le document spécifique
  const { documentType } = req.body;
  if (producer.documents[documentType]) {
    producer.documents[documentType] = {
      ...producer.documents[documentType],
      ...documentData,
    };
  }

  await producer.save();

  res.status(201).json({
    status: 'success',
    data: {
      document: producer.documents[documentType],
    },
  });
});

// Paramètres de livraison
exports.getDeliverySettings = catchAsync(async (req, res, next) => {
  const producer = await Producer.findById(req.user._id).select('deliveryOptions');

  res.status(200).json({
    status: 'success',
    data: {
      deliverySettings: producer.deliveryOptions,
    },
  });
});

exports.updateDeliverySettings = catchAsync(async (req, res, next) => {
  const producer = await Producer.findByIdAndUpdate(
    req.user._id,
    { deliveryOptions: req.body },
    { new: true, runValidators: true }
  ).select('deliveryOptions');

  res.status(200).json({
    status: 'success',
    data: {
      deliverySettings: producer.deliveryOptions,
    },
  });
});
