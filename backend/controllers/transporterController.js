const multer = require('multer');
const Transporter = require('../models/Transporter');
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

exports.uploadInsuranceDocument = upload.single('document');
exports.uploadProofOfDelivery = upload.single('proof');
exports.uploadMaintenanceDocument = upload.single('document');
exports.uploadDocument = upload.single('document');

// ROUTES PUBLIQUES
exports.getAllTransporters = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query, isActive: true, isApproved: true, isEmailVerified: true };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let query = Transporter.find(JSON.parse(queryStr));

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-performanceStats.averageRating -performanceStats.onTimeDeliveryRate');
  }

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  const transporters = await query;
  const total = await Transporter.countDocuments(JSON.parse(queryStr));

  res.status(200).json({
    status: 'success',
    results: transporters.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: { transporters },
  });
});

exports.searchTransporters = catchAsync(async (req, res, next) => {
  const { q, region, serviceType, vehicleType, minRating } = req.query;
  let searchQuery = { isActive: true, isApproved: true, isEmailVerified: true };

  if (q) {
    searchQuery.$or = [
      { companyName: { $regex: q, $options: 'i' } },
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } }
    ];
  }

  if (region) searchQuery['serviceAreas.region'] = region;
  if (serviceType) searchQuery.serviceTypes = serviceType;
  if (vehicleType) searchQuery['fleet.vehicleType'] = vehicleType;
  if (minRating) searchQuery['performanceStats.averageRating'] = { $gte: parseFloat(minRating) };

  const transporters = await Transporter.find(searchQuery)
    .sort('-performanceStats.averageRating -performanceStats.onTimeDeliveryRate')
    .limit(50);

  res.status(200).json({
    status: 'success',
    results: transporters.length,
    data: { transporters },
  });
});

exports.getTransportersByRegion = catchAsync(async (req, res, next) => {
  const transporters = await Transporter.find({
    'serviceAreas.region': req.params.region,
    isActive: true, isApproved: true, isEmailVerified: true,
  }).sort('-performanceStats.averageRating');

  res.status(200).json({
    status: 'success',
    results: transporters.length,
    data: { transporters },
  });
});

exports.getTransportersByService = catchAsync(async (req, res, next) => {
  const transporters = await Transporter.find({
    serviceTypes: req.params.service,
    isActive: true, isApproved: true, isEmailVerified: true,
  }).sort('-performanceStats.averageRating');

  res.status(200).json({
    status: 'success',
    results: transporters.length,
    data: { transporters },
  });
});

exports.getTransporter = catchAsync(async (req, res, next) => {
  const transporter = await Transporter.findOne({
    _id: req.params.id,
    isActive: true, isEmailVerified: true,
  });

  if (!transporter) {
    return next(new AppError('Transporteur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { transporter },
  });
});

exports.checkAvailability = catchAsync(async (req, res, next) => {
  const { date, serviceArea } = req.query;
  const transporter = await Transporter.findById(req.params.id);

  if (!transporter) {
    return next(new AppError('Transporteur non trouvé', 404));
  }

  const isAvailable = transporter.checkAvailability(new Date(date), serviceArea);

  res.status(200).json({
    status: 'success',
    data: {
      available: isAvailable,
      date,
      serviceArea,
    },
  });
});

exports.calculateShippingRate = catchAsync(async (req, res, next) => {
  const { distance, weight, serviceType } = req.body;
  
  // Calcul de tarif basique (à personnaliser selon les besoins)
  let baseRate = 0;
  switch (serviceType) {
    case 'local-delivery':
      baseRate = 500; // XAF par km
      break;
    case 'regional-transport':
      baseRate = 300;
      break;
    case 'national-transport':
      baseRate = 200;
      break;
    default:
      baseRate = 400;
  }

  const estimatedCost = (distance * baseRate) + (weight * 50); // 50 XAF par kg

  res.status(200).json({
    status: 'success',
    data: {
      estimatedCost,
      currency: 'XAF',
      distance,
      weight,
      serviceType,
    },
  });
});

// ROUTES PROTÉGÉES TRANSPORTEUR
exports.getMyProfile = catchAsync(async (req, res, next) => {
  const transporter = await Transporter.findById(req.user.id);
  res.status(200).json({ status: 'success', data: { transporter } });
});

exports.updateMyProfile = catchAsync(async (req, res, next) => {
  const allowedFields = ['companyName', 'transportType', 'serviceTypes'];
  const filteredBody = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) filteredBody[key] = req.body[key];
  });

  const transporter = await Transporter.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { transporter } });
});

// Gestion de la flotte (implémentation basique)
exports.getMyFleet = catchAsync(async (req, res, next) => {
  const transporter = await Transporter.findById(req.user.id).select('fleet');
  res.status(200).json({
    status: 'success',
    results: transporter.fleet.length,
    data: { fleet: transporter.fleet },
  });
});

exports.addVehicle = catchAsync(async (req, res, next) => {
  const transporter = await Transporter.findById(req.user.id);
  transporter.fleet.push(req.body);
  await transporter.save();

  res.status(201).json({
    status: 'success',
    data: { vehicle: transporter.fleet[transporter.fleet.length - 1] },
  });
});

exports.updateVehicle = catchAsync(async (req, res, next) => {
  const transporter = await Transporter.findById(req.user.id);
  const vehicle = transporter.fleet.id(req.params.vehicleId);

  if (!vehicle) return next(new AppError('Véhicule non trouvé', 404));

  Object.keys(req.body).forEach(key => {
    vehicle[key] = req.body[key];
  });

  await transporter.save();
  res.status(200).json({ status: 'success', data: { vehicle } });
});

exports.removeVehicle = catchAsync(async (req, res, next) => {
  const transporter = await Transporter.findById(req.user.id);
  transporter.fleet.pull(req.params.vehicleId);
  await transporter.save();
  res.status(204).json({ status: 'success', data: null });
});

exports.updateVehicleAvailability = catchAsync(async (req, res, next) => {
  const transporter = await Transporter.findById(req.user.id);
  const vehicle = transporter.fleet.id(req.params.vehicleId);

  if (!vehicle) return next(new AppError('Véhicule non trouvé', 404));

  vehicle.isAvailable = req.body.isAvailable;
  await transporter.save();

  res.status(200).json({
    status: 'success',
    data: { vehicle },
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

// Toutes les autres fonctions temporaires
exports.scheduleVehicleMaintenance = temporaryResponse('Planification maintenance');

exports.getServiceAreas = temporaryResponse('Zones de service');
exports.addServiceArea = temporaryResponse('Ajout zone');
exports.updateServiceArea = temporaryResponse('Mise à jour zone');
exports.removeServiceArea = temporaryResponse('Suppression zone');

exports.getPricingStructure = temporaryResponse('Structure tarifaire');
exports.updatePricingStructure = temporaryResponse('Mise à jour tarifs');

exports.getOperatingHours = temporaryResponse('Horaires d\'opération');
exports.updateOperatingHours = temporaryResponse('Mise à jour horaires');

exports.getSpecialCapabilities = temporaryResponse('Capacités spéciales');
exports.updateSpecialCapabilities = temporaryResponse('Mise à jour capacités');

exports.getDrivers = temporaryResponse('Conducteurs');
exports.addDriver = temporaryResponse('Ajout conducteur');
exports.updateDriver = temporaryResponse('Mise à jour conducteur');
exports.removeDriver = temporaryResponse('Suppression conducteur');
exports.updateDriverAvailability = temporaryResponse('Disponibilité conducteur');

exports.getInsurance = temporaryResponse('Assurances');
exports.addInsurance = temporaryResponse('Ajout assurance');
exports.updateInsurance = temporaryResponse('Mise à jour assurance');
exports.removeInsurance = temporaryResponse('Suppression assurance');

exports.getPartners = temporaryResponse('Partenaires');
exports.addPartner = temporaryResponse('Ajout partenaire');
exports.updatePartner = temporaryResponse('Mise à jour partenaire');
exports.removePartner = temporaryResponse('Suppression partenaire');

exports.getMyDeliveries = temporaryResponse('Livraisons - Modèle Delivery requis');
exports.acceptDelivery = temporaryResponse('Acceptation livraison');
exports.getMyDelivery = temporaryResponse('Détail livraison');
exports.updateDeliveryStatus = temporaryResponse('Statut livraison');
exports.updateDeliveryLocation = temporaryResponse('Localisation livraison');
exports.submitProofOfDelivery = temporaryResponse('Preuve de livraison');
exports.reportIncident = temporaryResponse('Signalement incident');
exports.updateIncident = temporaryResponse('Mise à jour incident');

exports.getWorkPreferences = temporaryResponse('Préférences travail');
exports.updateWorkPreferences = temporaryResponse('Mise à jour préférences');

exports.getPreferredCustomers = temporaryResponse('Clients préférés');
exports.addPreferredCustomer = temporaryResponse('Ajout client');
exports.updateCustomerPriority = temporaryResponse('Priorité client');
exports.removePreferredCustomer = temporaryResponse('Suppression client');

exports.getTrackingCapabilities = temporaryResponse('Capacités suivi');
exports.updateTrackingCapabilities = temporaryResponse('Mise à jour suivi');

exports.getPerformanceStats = temporaryResponse('Statistiques performance');
exports.getDeliveryAnalytics = temporaryResponse('Analytics livraisons');
exports.getRevenueAnalytics = temporaryResponse('Analytics revenus');
exports.getFuelEfficiencyStats = temporaryResponse('Efficacité carburant');

exports.getMyReviews = temporaryResponse('Mes avis');
exports.respondToReview = temporaryResponse('Réponse avis');

exports.getRouteOptimization = temporaryResponse('Optimisation itinéraires');
exports.planRoute = temporaryResponse('Planification itinéraire');

exports.getCostAnalysis = temporaryResponse('Analyse coûts');
exports.getProfitabilityReport = temporaryResponse('Rapport rentabilité');

exports.getMaintenanceSchedule = temporaryResponse('Planning maintenance');
exports.scheduleMaintenance = temporaryResponse('Planification maintenance');
exports.getMaintenanceRecords = temporaryResponse('Historique maintenance');
exports.addMaintenanceRecord = temporaryResponse('Ajout maintenance');

exports.getMyDocuments = temporaryResponse('Mes documents');
exports.addDocument = temporaryResponse('Ajout document');

exports.getNotifications = temporaryResponse('Notifications');
exports.markNotificationsAsRead = temporaryResponse('Lecture notifications');

exports.getMaintenanceAlerts = temporaryResponse('Alertes maintenance');
exports.createMaintenanceAlert = temporaryResponse('Création alerte');

exports.requestEmergencySupport = temporaryResponse('Support urgence');
exports.getSupportTickets = temporaryResponse('Tickets support');

exports.getComplianceReports = temporaryResponse('Rapports conformité');
exports.generateComplianceReport = temporaryResponse('Génération rapport');

module.exports = exports;
