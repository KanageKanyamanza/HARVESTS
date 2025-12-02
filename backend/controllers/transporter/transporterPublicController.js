const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Transporter = require('../../models/Transporter');
const { getUserLocation, buildLocationQuery } = require('../../utils/locationService');

// Obtenir tous les transporteurs
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
      if (userLocation && (userLocation.city || userLocation.region || userLocation.country)) {
        const locationQuery = buildLocationQuery(userLocation, {
          prioritizeRegion: true,
          prioritizeCity: true
        }, 'transporter');
        
        const locationQueryObj = { ...baseQueryObj };
        if (locationQuery.$or && locationQuery.$or.length > 0) {
          locationQueryObj.$and = locationQueryObj.$and || [];
          locationQueryObj.$and.push({ $or: locationQuery.$or });
        }
        
        const countInZone = await Transporter.countDocuments(locationQueryObj);
        
        if (countInZone > 0) {
          if (locationQuery.$or && locationQuery.$or.length > 0) {
            baseQueryObj.$and = baseQueryObj.$and || [];
            baseQueryObj.$and.push({ $or: locationQuery.$or });
          }
        } else {
          noTransportersInZone = true;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la détection de localisation:', error);
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

// Rechercher des transporteurs
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

// Obtenir les transporteurs par région
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

// Obtenir les transporteurs par service
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

// Obtenir un transporteur
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

// Vérifier la disponibilité
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

// Calculer le tarif d'expédition
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

