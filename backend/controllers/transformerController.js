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
  const queryObj = { ...req.query, isActive: true, isApproved: true, isEmailVerified: true };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let query = Transformer.find(JSON.parse(queryStr));

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-businessStats.averageRating -createdAt');
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
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement - Modèle Review requis',
    data: { reviews: [] },
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
exports.getMyEquipment = temporaryResponse('Gestion équipements');
exports.addEquipment = temporaryResponse('Ajout équipement');
exports.updateEquipment = temporaryResponse('Mise à jour équipement');
exports.removeEquipment = temporaryResponse('Suppression équipement');

// Stockage
exports.getStorageCapabilities = temporaryResponse('Capacités de stockage');
exports.updateStorageCapabilities = temporaryResponse('Mise à jour stockage');

// Services
exports.getMyServices = temporaryResponse('Services offerts');
exports.updateMyServices = temporaryResponse('Mise à jour services');

// Tarification
exports.getMyPricing = temporaryResponse('Structure tarifaire');
exports.updateMyPricing = temporaryResponse('Mise à jour tarifs');

// Délais
exports.getProcessingTimes = temporaryResponse('Délais de traitement');
exports.updateProcessingTimes = temporaryResponse('Mise à jour délais');

// Fournisseurs
exports.getPreferredSuppliers = temporaryResponse('Fournisseurs préférés');
exports.addPreferredSupplier = temporaryResponse('Ajout fournisseur');
exports.updateSupplierPreference = temporaryResponse('Mise à jour fournisseur');
exports.removePreferredSupplier = temporaryResponse('Suppression fournisseur');

// Commandes
exports.getMyOrders = temporaryResponse('Commandes - Modèle Order requis');
exports.acceptOrder = temporaryResponse('Acceptation commande');
exports.getMyOrder = temporaryResponse('Détail commande');
exports.updateOrderStatus = temporaryResponse('Statut commande');
exports.cancelOrder = temporaryResponse('Annulation commande');
exports.trackOrder = temporaryResponse('Suivi commande');
exports.updateOrderProgress = temporaryResponse('Progression commande');

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

module.exports = exports;
