const multer = require('multer');
const Transformer = require('../models/Transformer');
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

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadCertificationDocument = upload.single('document');
exports.uploadDocument = upload.single('document');
exports.uploadQualityReport = upload.single('report');
exports.uploadMaintenanceDocument = upload.single('document');

// ROUTES PUBLIQUES
exports.getAllTransformers = catchAsync(async (req, res, next) => {
  // Temporairement, afficher tous les transformateurs pour debug
  const queryObj = { ...req.query };
  // const queryObj = { ...req.query, isActive: true, isApproved: true, isEmailVerified: true };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'lang'];
  excludedFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let query = Transformer.find(JSON.parse(queryStr));

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    // Tri simple par date de création (plus récent en premier)
    query = query.sort('-createdAt');
  }

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  const transformers = await query;
  const total = await Transformer.countDocuments(JSON.parse(queryStr));

  res.status(200).json({
    status: 'success',
    results: transformers.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: { transformers },
  });
});

exports.searchTransformers = catchAsync(async (req, res, next) => {
  const { q, region, transformationType, minRating } = req.query;
  let searchQuery = { isActive: true, isApproved: true, isEmailVerified: true };

  if (q) {
    searchQuery.$or = [
      { companyName: { $regex: q, $options: 'i' } },
      { 'processingCapabilities.inputProduct': { $regex: q, $options: 'i' } },
      { 'processingCapabilities.outputProducts': { $regex: q, $options: 'i' } }
    ];
  }

  if (region) searchQuery['address.region'] = region;
  if (transformationType) searchQuery.transformationType = transformationType;
  if (minRating) searchQuery['businessStats.averageRating'] = { $gte: parseFloat(minRating) };

  const transformers = await Transformer.find(searchQuery)
    .sort('-businessStats.averageRating -businessStats.totalOrders')
    .limit(50);

  res.status(200).json({
    status: 'success',
    results: transformers.length,
    data: { transformers },
  });
});

exports.getTransformersByRegion = catchAsync(async (req, res, next) => {
  const transformers = await Transformer.find({
    'address.region': req.params.region,
    isActive: true, isApproved: true, isEmailVerified: true,
  }).sort('-businessStats.averageRating');

  res.status(200).json({
    status: 'success',
    results: transformers.length,
    data: { transformers },
  });
});

exports.getTransformersByType = catchAsync(async (req, res, next) => {
  const transformers = await Transformer.find({
    transformationType: req.params.type,
    isActive: true, isApproved: true, isEmailVerified: true,
  }).sort('-businessStats.averageRating');

  res.status(200).json({
    status: 'success',
    results: transformers.length,
    data: { transformers },
  });
});

exports.getTransformer = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findOne({
    _id: req.params.id,
    isActive: true, isEmailVerified: true,
  });

  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { transformer },
  });
});

exports.getPublicTransformer = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findOne({
    _id: req.params.id,
    isActive: true, 
    isEmailVerified: true,
    'shopInfo.isShopActive': true
  })
  .select('+shopInfo')
  .populate('certifications')
  .populate('equipment');

  if (!transformer) {
    return next(new AppError('Transformateur non trouvé ou boutique inactive', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      transformer
    }
  });
});

exports.getTransformerServices = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findById(req.params.id).select('services processingCapabilities');
  
  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      services: transformer.services,
      capabilities: transformer.processingCapabilities,
    },
  });
});

exports.getTransformerReviews = catchAsync(async (req, res, next) => {
  const transformerId = req.params.id;
  
  // Vérifier que le transformateur existe
  const transformer = await Transformer.findById(transformerId);
  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  // Récupérer les avis pour ce transformateur
  const reviews = await Review.find({ 
    transformer: transformerId,
    isActive: true 
  })
  .populate('reviewer', 'firstName lastName avatar')
  .populate('product', 'name.fr name.en')
  .sort('-createdAt')
  .limit(20);

  // Calculer les statistiques des avis
  const stats = await Review.aggregate([
    { $match: { transformer: transformer._id, isActive: true } },
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

// ROUTES PROTÉGÉES TRANSFORMATEUR
exports.getMyProfile = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findById(req.user.id);
  res.status(200).json({ status: 'success', data: { transformer } });
});

exports.updateMyProfile = catchAsync(async (req, res, next) => {
  const allowedFields = ['companyName', 'transformationType', 'services', 'pricing'];
  const filteredBody = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) filteredBody[key] = req.body[key];
  });

  const transformer = await Transformer.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { transformer } });
});

exports.getCompanyInfo = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findById(req.user.id)
    .select('companyName companyRegistrationNumber transformationType');
  
  res.status(200).json({
    status: 'success',
    data: { companyInfo: transformer },
  });
});

exports.updateCompanyInfo = catchAsync(async (req, res, next) => {
  const allowedFields = ['companyName', 'transformationType'];
  const filteredBody = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) filteredBody[key] = req.body[key];
  });

  const transformer = await Transformer.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { transformer } });
});

// Gestion des capacités de transformation
exports.getProcessingCapabilities = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findById(req.user.id).select('processingCapabilities');
  
  res.status(200).json({
    status: 'success',
    results: transformer.processingCapabilities.length,
    data: { capabilities: transformer.processingCapabilities },
  });
});

exports.addProcessingCapability = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findById(req.user.id);
  transformer.processingCapabilities.push(req.body);
  await transformer.save();

  res.status(201).json({
    status: 'success',
    data: {
      capability: transformer.processingCapabilities[transformer.processingCapabilities.length - 1],
    },
  });
});

exports.updateProcessingCapability = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findById(req.user.id);
  const capability = transformer.processingCapabilities.id(req.params.capabilityId);

  if (!capability) {
    return next(new AppError('Capacité non trouvée', 404));
  }

  Object.keys(req.body).forEach(key => {
    capability[key] = req.body[key];
  });

  await transformer.save();
  res.status(200).json({ status: 'success', data: { capability } });
});

exports.removeProcessingCapability = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findById(req.user.id);
  transformer.processingCapabilities.pull(req.params.capabilityId);
  await transformer.save();

  res.status(204).json({ status: 'success', data: null });
});

// Gestion des certifications (similaire aux autres controllers)
exports.getMyCertifications = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findById(req.user.id).select('certifications');
  res.status(200).json({
    status: 'success',
    results: transformer.certifications.length,
    data: { certifications: transformer.certifications },
  });
});

exports.addCertification = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findById(req.user.id);
  const certificationData = { ...req.body };
  if (req.file) certificationData.document = req.file.filename;

  transformer.certifications.push(certificationData);
  await transformer.save();

  res.status(201).json({
    status: 'success',
    data: { certification: transformer.certifications[transformer.certifications.length - 1] },
  });
});

exports.updateCertification = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findById(req.user.id);
  const certification = transformer.certifications.id(req.params.certId);

  if (!certification) return next(new AppError('Certification non trouvée', 404));

  Object.keys(req.body).forEach(key => {
    certification[key] = req.body[key];
  });

  await transformer.save();
  res.status(200).json({ status: 'success', data: { certification } });
});

exports.removeCertification = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findById(req.user.id);
  transformer.certifications.pull(req.params.certId);
  await transformer.save();
  res.status(204).json({ status: 'success', data: null });
});

// Fonctions temporaires pour les fonctionnalités nécessitant d'autres modèles
const temporaryResponse = (message) => catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: `Fonctionnalité en cours de développement - ${message}`,
    data: {},
  });
});

// Équipements
exports.getMyEquipment = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findById(req.user._id).select('equipment');
  
  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      equipment: transformer.equipment || []
    }
  });
});

exports.addEquipment = catchAsync(async (req, res, next) => {
  const { name, type, capacity, status, lastMaintenance, nextMaintenance } = req.body;
  
  const transformer = await Transformer.findById(req.user._id);
  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  const newEquipment = {
    name,
    type,
    capacity,
    status: status || 'active',
    lastMaintenance: lastMaintenance ? new Date(lastMaintenance) : null,
    nextMaintenance: nextMaintenance ? new Date(nextMaintenance) : null,
    addedAt: new Date()
  };

  if (!transformer.equipment) {
    transformer.equipment = [];
  }
  
  transformer.equipment.push(newEquipment);
  await transformer.save();

  res.status(201).json({
    status: 'success',
    message: 'Équipement ajouté avec succès',
    data: {
      equipment: newEquipment
    }
  });
});

exports.updateEquipment = catchAsync(async (req, res, next) => {
  const { equipmentId } = req.params;
  const updateData = req.body;
  
  const transformer = await Transformer.findById(req.user._id);
  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  const equipment = transformer.equipment.id(equipmentId);
  if (!equipment) {
    return next(new AppError('Équipement non trouvé', 404));
  }

  // Mettre à jour les champs fournis
  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      if (key === 'lastMaintenance' || key === 'nextMaintenance') {
        equipment[key] = updateData[key] ? new Date(updateData[key]) : null;
      } else {
        equipment[key] = updateData[key];
      }
    }
  });

  equipment.updatedAt = new Date();
  await transformer.save();

  res.status(200).json({
    status: 'success',
    message: 'Équipement mis à jour avec succès',
    data: {
      equipment
    }
  });
});

exports.removeEquipment = catchAsync(async (req, res, next) => {
  const { equipmentId } = req.params;
  
  const transformer = await Transformer.findById(req.user._id);
  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  const equipment = transformer.equipment.id(equipmentId);
  if (!equipment) {
    return next(new AppError('Équipement non trouvé', 404));
  }

  equipment.remove();
  await transformer.save();

  res.status(200).json({
    status: 'success',
    message: 'Équipement supprimé avec succès'
  });
});

// Stockage
exports.getStorageCapabilities = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findById(req.user._id).select('storageCapabilities');
  
  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      storageCapabilities: transformer.storageCapabilities || {
        totalCapacity: 0,
        availableCapacity: 0,
        storageTypes: [],
        temperatureControlled: false,
        humidityControlled: false
      }
    }
  });
});

exports.updateStorageCapabilities = catchAsync(async (req, res, next) => {
  const { totalCapacity, availableCapacity, storageTypes, temperatureControlled, humidityControlled } = req.body;
  
  const transformer = await Transformer.findById(req.user._id);
  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  transformer.storageCapabilities = {
    totalCapacity: totalCapacity || transformer.storageCapabilities?.totalCapacity || 0,
    availableCapacity: availableCapacity || transformer.storageCapabilities?.availableCapacity || 0,
    storageTypes: storageTypes || transformer.storageCapabilities?.storageTypes || [],
    temperatureControlled: temperatureControlled !== undefined ? temperatureControlled : transformer.storageCapabilities?.temperatureControlled || false,
    humidityControlled: humidityControlled !== undefined ? humidityControlled : transformer.storageCapabilities?.humidityControlled || false
  };

  await transformer.save();

  res.status(200).json({
    status: 'success',
    message: 'Capacités de stockage mises à jour avec succès',
    data: {
      storageCapabilities: transformer.storageCapabilities
    }
  });
});

// Services
exports.getMyServices = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findById(req.user._id).select('services');
  
  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      services: transformer.services || []
    }
  });
});

exports.updateMyServices = catchAsync(async (req, res, next) => {
  const { services } = req.body;
  
  const transformer = await Transformer.findById(req.user._id);
  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  transformer.services = services || [];
  await transformer.save();

  res.status(200).json({
    status: 'success',
    message: 'Services mis à jour avec succès',
    data: {
      services: transformer.services
    }
  });
});

// Tarification
exports.getMyPricing = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findById(req.user._id).select('pricing');
  
  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      pricing: transformer.pricing || {
        basePrice: 0,
        pricePerUnit: 0,
        minimumOrder: 0,
        bulkDiscounts: [],
        additionalServices: []
      }
    }
  });
});

exports.updateMyPricing = catchAsync(async (req, res, next) => {
  const { basePrice, pricePerUnit, minimumOrder, bulkDiscounts, additionalServices } = req.body;
  
  const transformer = await Transformer.findById(req.user._id);
  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  transformer.pricing = {
    basePrice: basePrice || transformer.pricing?.basePrice || 0,
    pricePerUnit: pricePerUnit || transformer.pricing?.pricePerUnit || 0,
    minimumOrder: minimumOrder || transformer.pricing?.minimumOrder || 0,
    bulkDiscounts: bulkDiscounts || transformer.pricing?.bulkDiscounts || [],
    additionalServices: additionalServices || transformer.pricing?.additionalServices || []
  };

  await transformer.save();

  res.status(200).json({
    status: 'success',
    message: 'Tarification mise à jour avec succès',
    data: {
      pricing: transformer.pricing
    }
  });
});

// Délais
exports.getProcessingTimes = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findById(req.user._id).select('processingTimes');
  
  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      processingTimes: transformer.processingTimes || {
        standardProcessing: 0,
        rushProcessing: 0,
        bulkProcessing: 0,
        customProcessing: []
      }
    }
  });
});

exports.updateProcessingTimes = catchAsync(async (req, res, next) => {
  const { standardProcessing, rushProcessing, bulkProcessing, customProcessing } = req.body;
  
  const transformer = await Transformer.findById(req.user._id);
  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  transformer.processingTimes = {
    standardProcessing: standardProcessing || transformer.processingTimes?.standardProcessing || 0,
    rushProcessing: rushProcessing || transformer.processingTimes?.rushProcessing || 0,
    bulkProcessing: bulkProcessing || transformer.processingTimes?.bulkProcessing || 0,
    customProcessing: customProcessing || transformer.processingTimes?.customProcessing || []
  };

  await transformer.save();

  res.status(200).json({
    status: 'success',
    message: 'Délais de traitement mis à jour avec succès',
    data: {
      processingTimes: transformer.processingTimes
    }
  });
});

// Fournisseurs
exports.getPreferredSuppliers = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findById(req.user._id).select('preferredSuppliers');
  
  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      preferredSuppliers: transformer.preferredSuppliers || []
    }
  });
});

exports.addPreferredSupplier = catchAsync(async (req, res, next) => {
  const { name, contact, products, rating, notes } = req.body;
  
  const transformer = await Transformer.findById(req.user._id);
  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  const newSupplier = {
    name,
    contact,
    products: products || [],
    rating: rating || 0,
    notes: notes || '',
    addedAt: new Date()
  };

  if (!transformer.preferredSuppliers) {
    transformer.preferredSuppliers = [];
  }
  
  transformer.preferredSuppliers.push(newSupplier);
  await transformer.save();

  res.status(201).json({
    status: 'success',
    message: 'Fournisseur ajouté avec succès',
    data: {
      supplier: newSupplier
    }
  });
});

exports.updateSupplierPreference = catchAsync(async (req, res, next) => {
  const { supplierId } = req.params;
  const updateData = req.body;
  
  const transformer = await Transformer.findById(req.user._id);
  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  const supplier = transformer.preferredSuppliers.id(supplierId);
  if (!supplier) {
    return next(new AppError('Fournisseur non trouvé', 404));
  }

  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      supplier[key] = updateData[key];
    }
  });

  supplier.updatedAt = new Date();
  await transformer.save();

  res.status(200).json({
    status: 'success',
    message: 'Fournisseur mis à jour avec succès',
    data: {
      supplier
    }
  });
});

exports.removePreferredSupplier = catchAsync(async (req, res, next) => {
  const { supplierId } = req.params;
  
  const transformer = await Transformer.findById(req.user._id);
  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  const supplier = transformer.preferredSuppliers.id(supplierId);
  if (!supplier) {
    return next(new AppError('Fournisseur non trouvé', 404));
  }

  supplier.remove();
  await transformer.save();

  res.status(200).json({
    status: 'success',
    message: 'Fournisseur supprimé avec succès'
  });
});

// Commandes
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ 
    transformer: req.user._id 
  })
  .populate('customer', 'firstName lastName email phone')
  .populate('items.product', 'name.fr name.en price')
  .sort('-createdAt')
  .skip(skip)
  .limit(limit);

  const total = await Order.countDocuments({ transformer: req.user._id });

  res.status(200).json({
    status: 'success',
    results: orders.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      orders
    }
  });
});

exports.acceptOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { estimatedDelivery, notes } = req.body;

  const order = await Order.findOne({
    _id: orderId,
    transformer: req.user._id,
    status: 'pending'
  });

  if (!order) {
    return next(new AppError('Commande non trouvée ou déjà traitée', 404));
  }

  order.status = 'accepted';
  order.estimatedDelivery = estimatedDelivery ? new Date(estimatedDelivery) : null;
  order.transformerNotes = notes || '';
  order.acceptedAt = new Date();

  await order.save();

  res.status(200).json({
    status: 'success',
    message: 'Commande acceptée avec succès',
    data: {
      order
    }
  });
});

exports.getMyOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;

  const order = await Order.findOne({
    _id: orderId,
    transformer: req.user._id
  })
  .populate('customer', 'firstName lastName email phone address')
  .populate('items.product', 'name.fr name.en price description.fr description.en')
  .populate('payment', 'amount status method');

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { status, notes } = req.body;

  const order = await Order.findOne({
    _id: orderId,
    transformer: req.user._id
  });

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  order.status = status;
  if (notes) {
    order.transformerNotes = notes;
  }

  // Mettre à jour les timestamps selon le statut
  if (status === 'in_progress' && !order.startedAt) {
    order.startedAt = new Date();
  } else if (status === 'completed' && !order.completedAt) {
    order.completedAt = new Date();
  }

  await order.save();

  res.status(200).json({
    status: 'success',
    message: 'Statut de la commande mis à jour avec succès',
    data: {
      order
    }
  });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { reason } = req.body;

  const order = await Order.findOne({
    _id: orderId,
    transformer: req.user._id,
    status: { $in: ['pending', 'accepted'] }
  });

  if (!order) {
    return next(new AppError('Commande non trouvée ou ne peut pas être annulée', 404));
  }

  order.status = 'cancelled';
  order.cancellationReason = reason || 'Annulée par le transformateur';
  order.cancelledAt = new Date();

  await order.save();

  res.status(200).json({
    status: 'success',
    message: 'Commande annulée avec succès',
    data: {
      order
    }
  });
});

exports.trackOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;

  const order = await Order.findOne({
    _id: orderId,
    transformer: req.user._id
  })
  .populate('customer', 'firstName lastName email')
  .select('status createdAt acceptedAt startedAt completedAt estimatedDelivery trackingUpdates');

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order: {
        id: order._id,
        status: order.status,
        createdAt: order.createdAt,
        acceptedAt: order.acceptedAt,
        startedAt: order.startedAt,
        completedAt: order.completedAt,
        estimatedDelivery: order.estimatedDelivery,
        trackingUpdates: order.trackingUpdates || []
      }
    }
  });
});

exports.updateOrderProgress = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { progress, notes, status } = req.body;

  const order = await Order.findOne({
    _id: orderId,
    transformer: req.user._id
  });

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  // Ajouter une mise à jour de progression
  const trackingUpdate = {
    progress: progress || order.status,
    notes: notes || '',
    timestamp: new Date(),
    updatedBy: 'transformer'
  };

  if (!order.trackingUpdates) {
    order.trackingUpdates = [];
  }
  
  order.trackingUpdates.push(trackingUpdate);

  // Mettre à jour le statut si fourni
  if (status) {
    order.status = status;
  }

  await order.save();

  res.status(200).json({
    status: 'success',
    message: 'Progression de la commande mise à jour avec succès',
    data: {
      order: {
        id: order._id,
        status: order.status,
        trackingUpdates: order.trackingUpdates
      }
    }
  });
});

// Devis
exports.getCustomQuotes = temporaryResponse('Devis personnalisés');
exports.createCustomQuote = temporaryResponse('Création devis');
exports.getCustomQuote = temporaryResponse('Détail devis');
exports.updateCustomQuote = temporaryResponse('Mise à jour devis');
exports.deleteCustomQuote = temporaryResponse('Suppression devis');
exports.convertQuoteToOrder = temporaryResponse('Conversion devis');

// Horaires
exports.getOperatingHours = temporaryResponse('Horaires d\'opération');
exports.updateOperatingHours = temporaryResponse('Mise à jour horaires');

// Qualité
exports.getQualityControlSettings = temporaryResponse('Contrôle qualité');
exports.updateQualityControlSettings = temporaryResponse('Paramètres qualité');
exports.getQualityReports = temporaryResponse('Rapports qualité');
exports.createQualityReport = temporaryResponse('Création rapport');

// Production
exports.getProductionBatches = temporaryResponse('Lots de production');
exports.createProductionBatch = temporaryResponse('Création lot');
exports.getProductionBatch = temporaryResponse('Détail lot');
exports.updateProductionBatch = temporaryResponse('Mise à jour lot');
exports.getBatchTraceability = temporaryResponse('Traçabilité lot');

// Déchets
exports.getWasteManagement = temporaryResponse('Gestion déchets');
exports.updateWasteManagement = temporaryResponse('Mise à jour déchets');

// Statistiques
exports.getBusinessStats = temporaryResponse('Statistiques business');
exports.getProductionAnalytics = temporaryResponse('Analytics production');
exports.getEfficiencyMetrics = temporaryResponse('Métriques efficacité');
exports.getRevenueAnalytics = temporaryResponse('Analytics revenus');

// Contrats
exports.getContracts = temporaryResponse('Contrats clients');
exports.createContract = temporaryResponse('Création contrat');
exports.getContract = temporaryResponse('Détail contrat');
exports.updateContract = temporaryResponse('Mise à jour contrat');
exports.terminateContract = temporaryResponse('Résiliation contrat');

// Avis
exports.getMyReviews = temporaryResponse('Mes avis');
exports.respondToReview = temporaryResponse('Réponse avis');

// Réclamations
exports.getComplaints = temporaryResponse('Réclamations');
exports.handleComplaint = temporaryResponse('Traitement réclamation');
exports.updateComplaint = temporaryResponse('Mise à jour réclamation');

// Planification
exports.getProductionPlanning = temporaryResponse('Planification production');
exports.createProductionPlan = temporaryResponse('Création plan');
exports.updateProductionPlan = temporaryResponse('Mise à jour plan');
exports.deleteProductionPlan = temporaryResponse('Suppression plan');

// Maintenance
exports.getMaintenanceSchedule = temporaryResponse('Planning maintenance');
exports.scheduleMaintenance = temporaryResponse('Planification maintenance');
exports.getMaintenanceRecords = temporaryResponse('Historique maintenance');
exports.addMaintenanceRecord = temporaryResponse('Ajout maintenance');

// Documents
exports.getMyDocuments = temporaryResponse('Mes documents');
exports.addDocument = temporaryResponse('Ajout document');

// Notifications
exports.getNotifications = temporaryResponse('Notifications');
exports.markNotificationsAsRead = temporaryResponse('Lecture notifications');
exports.getProductionAlerts = temporaryResponse('Alertes production');
exports.createProductionAlert = temporaryResponse('Création alerte');

// Conformité
exports.getComplianceReports = temporaryResponse('Rapports conformité');
exports.generateComplianceReport = temporaryResponse('Génération rapport');

// GESTION DE BOUTIQUE
exports.getMyShopInfo = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findById(req.user._id);
  
  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      shopInfo: transformer.shopInfo || {
        isShopActive: false,
        shopName: '',
        shopDescription: '',
        shopBanner: null,
        shopLogo: null,
        openingHours: {
          monday: { open: '08:00', close: '18:00', isOpen: true },
          tuesday: { open: '08:00', close: '18:00', isOpen: true },
          wednesday: { open: '08:00', close: '18:00', isOpen: true },
          thursday: { open: '08:00', close: '18:00', isOpen: true },
          friday: { open: '08:00', close: '18:00', isOpen: true },
          saturday: { open: '08:00', close: '16:00', isOpen: true },
          sunday: { open: '', close: '', isOpen: false }
        },
        contactInfo: {
          phone: '',
          email: '',
          website: '',
          socialMedia: {
            facebook: '',
            instagram: '',
            twitter: ''
          }
        }
      }
    }
  });
});

exports.updateMyShopInfo = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findByIdAndUpdate(
    req.user._id,
    { shopInfo: req.body },
    { new: true, runValidators: true }
  );

  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      shopInfo: transformer.shopInfo
    }
  });
});

exports.activateShop = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findByIdAndUpdate(
    req.user._id,
    { 'shopInfo.isShopActive': true },
    { new: true, runValidators: true }
  );

  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Boutique activée avec succès',
    data: {
      shopInfo: transformer.shopInfo
    }
  });
});

exports.deactivateShop = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findByIdAndUpdate(
    req.user._id,
    { 'shopInfo.isShopActive': false },
    { new: true, runValidators: true }
  );

  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Boutique désactivée avec succès',
    data: {
      shopInfo: transformer.shopInfo
    }
  });
});

// Upload de bannière
exports.uploadShopBanner = catchAsync(async (req, res, next) => {
  if (!req.body.shopBanner) {
    return next(new AppError('Aucune image fournie', 400));
  }

  // L'URL Cloudinary est déjà dans req.body.shopBanner grâce au middleware processTransformerShopBanner
  const imageUrl = req.body.shopBanner;

  const transformer = await Transformer.findByIdAndUpdate(
    req.user._id,
    { 'shopInfo.shopBanner': imageUrl },
    { new: true, runValidators: true }
  );

  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Bannière mise à jour avec succès',
    data: {
      url: imageUrl,
      shopInfo: transformer.shopInfo
    }
  });
});

// Upload de logo
exports.uploadShopLogo = catchAsync(async (req, res, next) => {
  if (!req.body.shopLogo) {
    return next(new AppError('Aucune image fournie', 400));
  }

  // L'URL Cloudinary est déjà dans req.body.shopLogo grâce au middleware processTransformerShopLogo
  const imageUrl = req.body.shopLogo;

  const transformer = await Transformer.findByIdAndUpdate(
    req.user._id,
    { 'shopInfo.shopLogo': imageUrl },
    { new: true, runValidators: true }
  );

  if (!transformer) {
    return next(new AppError('Transformateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Logo mis à jour avec succès',
    data: {
      url: imageUrl,
      shopInfo: transformer.shopInfo
    }
  });
});

module.exports = exports;
