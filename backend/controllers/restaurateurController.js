const multer = require('multer');
const Restaurateur = require('../models/Restaurateur');
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
  const queryObj = { ...req.query, isActive: true, isApproved: true, isEmailVerified: true };
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
  const allowedFields = ['restaurantName', 'restaurantType', 'cuisineTypes', 'seatingCapacity'];
  const filteredBody = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) filteredBody[key] = req.body[key];
  });

  const restaurateur = await Restaurateur.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { restaurateur } });
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

exports.getMyOrders = temporaryResponse('Commandes - Modèle Order requis');
exports.createOrder = temporaryResponse('Création commande');
exports.getMyOrder = temporaryResponse('Détail commande');
exports.updateOrder = temporaryResponse('Mise à jour commande');
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

exports.getMyStats = temporaryResponse('Mes statistiques');
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

module.exports = exports;
