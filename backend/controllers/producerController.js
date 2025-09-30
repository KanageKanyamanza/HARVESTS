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

  res.status(200).json({
    status: 'success',
    data: {
      producer,
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
  // Cette fonction nécessitera le modèle Review qui n'est pas encore créé
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement - Modèle Review requis',
    data: {
      reviews: [],
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
  const queryObj = { producer: req.user._id };
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
  
  req.body.producer = req.user._id;
  
  // Traiter les images si présentes
  if (req.body.images && req.body.images.length > 0) {
    req.body.images = req.body.images.map((img, index) => ({
      ...img,
      order: index,
      isPrimary: index === 0
    }));
  }
  
  const product = await Product.create(req.body);

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
  const producer = await Producer.findById(req.user._id).select('salesStats');

  res.status(200).json({
    status: 'success',
    data: {
      stats: producer.salesStats,
    },
  });
});

exports.getSalesAnalytics = catchAsync(async (req, res, next) => {
  // Cette fonction nécessitera des agrégations complexes avec les commandes
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement - Modèle Order requis',
    data: { analytics: {} },
  });
});

exports.getRevenueAnalytics = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement - Modèle Order requis',
    data: { revenue: {} },
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
