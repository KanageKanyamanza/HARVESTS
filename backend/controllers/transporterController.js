const multer = require('multer');
const Transporter = require('../models/Transporter');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { getUserLocation, buildLocationQuery } = require('../utils/locationService');

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
  const baseQueryObj = { ...req.query, isActive: true, isApproved: true, isEmailVerified: true };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'useLocation'];
  excludedFields.forEach((el) => delete baseQueryObj[el]);

  // Détection automatique de la localisation si activée
  let userLocation = null;
  let noTransportersInZone = false;
  if (req.query.useLocation !== 'false') {
    try {
      userLocation = await getUserLocation(req);
      // Si on a une localisation valide, vérifier s'il y a des transporteurs dans la zone
      if (userLocation && (userLocation.city || userLocation.region || userLocation.country)) {
        const locationQuery = buildLocationQuery(userLocation, {
          prioritizeRegion: true,
          prioritizeCity: true
        }, 'transporter');
        
        // Vérifier d'abord s'il y a des transporteurs dans la zone
        const locationQueryObj = { ...baseQueryObj };
        if (locationQuery.$or && locationQuery.$or.length > 0) {
          locationQueryObj.$and = locationQueryObj.$and || [];
          locationQueryObj.$and.push({ $or: locationQuery.$or });
        }
        
        const countInZone = await Transporter.countDocuments(locationQueryObj);
        
        // Si des transporteurs existent dans la zone, utiliser le filtre
        if (countInZone > 0) {
          if (locationQuery.$or && locationQuery.$or.length > 0) {
            baseQueryObj.$and = baseQueryObj.$and || [];
            baseQueryObj.$and.push({ $or: locationQuery.$or });
          }
        } else {
          // Sinon, marquer qu'on affiche tous les transporteurs
          noTransportersInZone = true;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la détection de localisation:', error);
      // Continuer sans filtre de localisation en cas d'erreur
    }
  }

  let queryStr = JSON.stringify(baseQueryObj);
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
    data: { 
      transporters,
      location: userLocation ? {
        detected: true,
        country: userLocation.country,
        region: userLocation.region,
        city: userLocation.city,
        source: userLocation.source,
        noTransportersInZone: noTransportersInZone
      } : {
        detected: false
      }
    },
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
  const allowedFields = [
    // Informations personnelles
    'firstName', 'lastName', 'phone', 'email',
    // Informations entreprise
    'companyName', 'transportType', 'serviceTypes',
    // Zones de service
    'serviceAreas',
    // Adresse
    'address', 'city', 'region', 'country', 'postalCode',
    // Biographie
    'bio', 'biography',
    // Images
    'avatar', 'shopBanner', 'shopLogo'
  ];
  
  const filteredBody = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  // Filtrer les valeurs undefined/null/vides pour éviter de les écraser
  Object.keys(filteredBody).forEach(key => {
    if (filteredBody[key] === undefined || filteredBody[key] === null || filteredBody[key] === '') {
      delete filteredBody[key];
    }
  });

  const transporter = await Transporter.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, runValidators: true,
  });

  if (!transporter) {
    return next(new AppError('Transporteur non trouvé', 404));
  }

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
  
  // Préparer les données du véhicule
  const vehicleData = {
    vehicleType: req.body.vehicleType,
    registrationNumber: req.body.registrationNumber,
    capacity: req.body.capacity,
    specialFeatures: req.body.specialFeatures || [],
    condition: req.body.condition || 'good',
    isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true,
    lastMaintenanceDate: req.body.lastMaintenanceDate ? new Date(req.body.lastMaintenanceDate) : undefined,
    nextMaintenanceDate: req.body.nextMaintenanceDate ? new Date(req.body.nextMaintenanceDate) : undefined,
    // Image du véhicule (si fournie)
    image: req.body.image ? {
      url: req.body.image.url,
      publicId: req.body.image.publicId,
      alt: req.body.image.alt || 'Véhicule'
    } : undefined
  };

  // Filtrer les valeurs undefined pour éviter de les écraser
  Object.keys(vehicleData).forEach(key => {
    if (vehicleData[key] === undefined) {
      delete vehicleData[key];
    }
  });

  transporter.fleet.push(vehicleData);
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

  // Mettre à jour les champs autorisés
  const allowedFields = [
    'vehicleType', 'registrationNumber', 'capacity', 'specialFeatures',
    'condition', 'isAvailable', 'lastMaintenanceDate', 'nextMaintenanceDate', 'image'
  ];

  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      if (key === 'lastMaintenanceDate' || key === 'nextMaintenanceDate') {
        vehicle[key] = req.body[key] ? new Date(req.body[key]) : undefined;
      } else if (key === 'image') {
        // Gérer l'image : mettre à jour si fournie, supprimer si null
        if (req.body.image === null) {
          vehicle.image = undefined;
        } else if (req.body.image && req.body.image.url) {
          vehicle.image = {
            url: req.body.image.url,
            publicId: req.body.image.publicId || null,
            alt: req.body.image.alt || 'Véhicule'
          };
        }
      } else {
        vehicle[key] = req.body[key];
      }
    }
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

// Obtenir toutes les livraisons assignées au transporteur
exports.getMyDeliveries = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const status = req.query.status;

  // Construire la requête
  const query = {
    'delivery.transporter': req.user.id
  };

  // Filtrer par statut si fourni
  if (status && status !== 'all') {
    if (status === 'ready-for-pickup' || status === 'in-transit' || status === 'delivered' || status === 'completed') {
      query.status = status;
    }
  }

  const orders = await Order.find(query)
    .populate('buyer', 'firstName lastName email phone')
    .populate('seller', 'firstName lastName companyName farmName email phone')
    .populate('delivery.transporter', 'firstName lastName companyName email phone')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: orders.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      deliveries: orders,
      orders: orders // Compatibilité avec le frontend
    }
  });
});

// Obtenir les détails d'une livraison spécifique
exports.getMyDelivery = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  const order = await Order.findOne({
    _id: req.params.deliveryId,
    'delivery.transporter': req.user.id
  })
    .populate('buyer', 'firstName lastName email phone address city region country')
    .populate('seller', 'firstName lastName companyName farmName email phone address city region')
    .populate('delivery.transporter', 'firstName lastName companyName email phone')
    .populate('items.product', 'name images price category');

  if (!order) {
    return next(new AppError('Livraison non trouvée ou non assignée à ce transporteur', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order,
      delivery: order
    }
  });
});

// Mettre à jour le statut de livraison (collectée, livrée)
exports.updateDeliveryStatus = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  const { status, location, note } = req.body;

  // Vérifier que le statut est valide
  const validStatuses = ['picked-up', 'in-transit', 'out-for-delivery', 'delivered'];
  if (!validStatuses.includes(status)) {
    return next(new AppError(`Statut invalide. Statuts autorisés: ${validStatuses.join(', ')}`, 400));
  }

  const order = await Order.findOne({
    _id: req.params.deliveryId,
    'delivery.transporter': req.user.id
  });

  if (!order) {
    return next(new AppError('Livraison non trouvée ou non assignée à ce transporteur', 404));
  }

  // Valider la transition de statut selon les règles métier
  const currentStatus = order.delivery?.status || order.status || 'pending';
  const userType = req.user.userType || 'transporter';
  
  // Fonction pour obtenir les transitions valides (dupliquée depuis orderController pour cohérence)
  const getValidTransitions = (currentStat, userTyp) => {
    const transitions = {
      'ready-for-pickup': {
        transporter: ['picked-up', 'in-transit'],
        exporter: ['picked-up', 'in-transit']
      },
      'picked-up': {
        transporter: ['in-transit', 'delivered'],
        exporter: ['in-transit', 'delivered']
      },
      'in-transit': {
        transporter: ['delivered'],
        exporter: ['delivered']
      },
      'out-for-delivery': {
        transporter: ['delivered'],
        exporter: ['delivered']
      }
    };
    return transitions[currentStat]?.[userTyp] || [];
  };

  // Mapper le statut actuel de la commande vers le statut de livraison
  let deliveryStatusToCheck = currentStatus;
  if (currentStatus === 'ready-for-pickup' || currentStatus === 'preparing') {
    deliveryStatusToCheck = 'ready-for-pickup';
  } else if (currentStatus === 'in-transit') {
    deliveryStatusToCheck = 'in-transit';
  }

  const validTransitions = getValidTransitions(deliveryStatusToCheck, userType);
  
  // Pour picked-up, accepter aussi in-transit (comme transition valide)
  if (status === 'picked-up' && (currentStatus === 'ready-for-pickup' || currentStatus === 'preparing')) {
    // C'est valide
  } else if (status === 'in-transit' && (currentStatus === 'ready-for-pickup' || currentStatus === 'preparing' || currentStatus === 'picked-up')) {
    // C'est valide
  } else if (status === 'delivered' && (currentStatus === 'in-transit' || currentStatus === 'picked-up' || currentStatus === 'out-for-delivery')) {
    // C'est valide
  } else if (!validTransitions.includes(status) && status !== 'picked-up') {
    return next(new AppError(
      `Transition de statut invalide pour un livreur: de "${currentStatus}" à "${status}". Transitions autorisées: ${validTransitions.join(', ')}`,
      403
    ));
  }

  // Utiliser la méthode addDeliveryUpdate du modèle Order
  await order.addDeliveryUpdate(status, location, note, req.user.id);

  // Envoyer les notifications appropriées
  const sendStatusNotifications = require('./orderController').sendStatusNotifications || (async () => {});
  try {
    await sendStatusNotifications(order, status === 'picked-up' ? 'in-transit' : status === 'delivered' ? 'delivered' : order.status);
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error);
  }

  // Récupérer la commande mise à jour
  const updatedOrder = await Order.findById(order._id)
    .populate('buyer', 'firstName lastName email phone')
    .populate('seller', 'firstName lastName companyName farmName email phone')
    .populate('delivery.transporter', 'firstName lastName companyName email phone');

  res.status(200).json({
    status: 'success',
    message: `Statut de livraison mis à jour: ${status === 'picked-up' ? 'Collectée' : status === 'delivered' ? 'Livrée' : status}`,
    data: {
      order: updatedOrder,
      delivery: updatedOrder
    }
  });
});

exports.acceptDelivery = temporaryResponse('Acceptation livraison');
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

// Obtenir les statistiques du dashboard
exports.getStats = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  const Review = require('../models/Review');
  
  const transporter = await Transporter.findById(req.user.id);
  if (!transporter) {
    return next(new AppError('Transporteur non trouvé', 404));
  }

  console.log('[getStats] Transporteur ID:', transporter._id.toString());
  console.log('[getStats] Transporteur userType:', transporter.userType);

  // Récupérer toutes les commandes assignées au transporteur
  const allOrders = await Order.find({
    'delivery.transporter': transporter._id
  })
    .populate('delivery.transporter', 'userType');

  console.log('[getStats] Commandes trouvées:', allOrders.length);

  // Filtrer pour ne garder que les commandes assignées à un transporteur (pas un exportateur)
  const transporterOrders = allOrders.filter(order => {
    const assignedTransporter = order.delivery?.transporter;
    // Si le transporteur est peuplé, vérifier son userType
    if (assignedTransporter && typeof assignedTransporter === 'object' && assignedTransporter.userType) {
      return assignedTransporter.userType === 'transporter';
    }
    // Si pas de userType, accepter si isExport n'est pas true
    return order.isExport !== true;
  });

  console.log('[getStats] Commandes filtrées (transporteurs seulement):', transporterOrders.length);

  // Calculer les statistiques depuis les commandes filtrées
  const orderStats = transporterOrders.reduce((acc, order) => {
    acc.totalDeliveries += 1;
    
    if (['delivered', 'completed'].includes(order.status)) {
      acc.completedDeliveries += 1;
      acc.totalRevenue += order.deliveryFee || order.delivery?.deliveryFee || 0;
    }
    
    if (order.status === 'in-transit') {
      acc.inTransitDeliveries += 1;
    }
    
    if (['ready-for-pickup', 'preparing'].includes(order.status)) {
      acc.pendingDeliveries += 1;
    }
    
    return acc;
  }, {
    totalDeliveries: 0,
    completedDeliveries: 0,
    inTransitDeliveries: 0,
    pendingDeliveries: 0,
    totalRevenue: 0
  });

  // Calculer le taux de ponctualité
  const onTimeStats = transporterOrders
    .filter(order => ['delivered', 'completed'].includes(order.status))
    .reduce((acc, order) => {
      acc.totalDelivered += 1;
      if (order.delivery?.estimatedDeliveryDate && order.deliveredAt) {
        const estimatedDate = new Date(order.delivery.estimatedDeliveryDate);
        const deliveredDate = new Date(order.deliveredAt);
        if (deliveredDate <= estimatedDate) {
          acc.onTimeDeliveries += 1;
        }
      }
      return acc;
    }, {
      onTimeDeliveries: 0,
      totalDelivered: 0
    });

  // Statistiques des avis (chercher via les commandes assignées au transporteur)
  // Utiliser les IDs des commandes filtrées
  const transporterOrderIds = transporterOrders.map(order => order._id);
  
  const reviewStats = await Review.aggregate([
    {
      $match: {
        $or: [
          { order: { $in: transporterOrderIds } },
          { transporter: transporter._id }
        ]
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  // Compter les vues du profil (si disponible)
  const profileViews = transporter.profileViews || 0;

  // orderStats et onTimeStats sont déjà des objets, pas des tableaux
  const deliveryData = orderStats || {
    totalDeliveries: 0,
    completedDeliveries: 0,
    inTransitDeliveries: 0,
    pendingDeliveries: 0,
    totalRevenue: 0
  };

  const onTimeData = onTimeStats || {
    onTimeDeliveries: 0,
    totalDelivered: 0
  };

  const reviewData = reviewStats.length > 0 ? reviewStats[0] : {
    averageRating: 0,
    totalReviews: 0
  };

  // Calculer le taux de ponctualité
  const onTimeDeliveryRate = onTimeData.totalDelivered > 0
    ? Math.round((onTimeData.onTimeDeliveries / onTimeData.totalDelivered) * 100)
    : transporter.performanceStats?.onTimeDeliveryRate || 0;

  // Préparer la réponse
  const stats = {
    // Statistiques de base
    profileViews: profileViews,
    
    // Statistiques des avis
    ratings: {
      average: reviewData.averageRating ? Math.round(reviewData.averageRating * 10) / 10 : 0,
      count: reviewData.totalReviews || 0
    },
    averageRating: reviewData.averageRating ? Math.round(reviewData.averageRating * 10) / 10 : 0,
    totalReviews: reviewData.totalReviews || 0,

    // Statistiques de performance
    performanceStats: {
      totalDeliveries: deliveryData.totalDeliveries || transporter.performanceStats?.totalDeliveries || 0,
      completedDeliveries: deliveryData.completedDeliveries || 0,
      inTransitDeliveries: deliveryData.inTransitDeliveries || 0,
      pendingDeliveries: deliveryData.pendingDeliveries || 0,
      onTimeDeliveryRate: onTimeDeliveryRate,
      totalRevenue: deliveryData.totalRevenue || 0
    },

    // Statistiques additionnelles
    totalOrders: deliveryData.totalDeliveries || 0,
    activeDeliveries: deliveryData.inTransitDeliveries + deliveryData.pendingDeliveries || 0
  };

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

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
