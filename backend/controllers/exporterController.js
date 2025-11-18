const multer = require('multer');
const Exporter = require('../models/Exporter');
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

exports.uploadLicenseDocument = upload.single('document');
exports.uploadCertificationDocument = upload.single('document');
exports.uploadInsuranceDocument = upload.single('document');
exports.uploadExportDocument = upload.single('document');
exports.uploadDocument = upload.single('document');

// ROUTES PUBLIQUES
exports.getAllExporters = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query, isActive: true, isApproved: true, isEmailVerified: true };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let query = Exporter.find(JSON.parse(queryStr));

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-exportStats.averageRating -exportStats.totalValue');
  }

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  const exporters = await query;
  const total = await Exporter.countDocuments(JSON.parse(queryStr));

  res.status(200).json({
    status: 'success',
    results: exporters.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: { exporters },
  });
});

exports.searchExporters = catchAsync(async (req, res, next) => {
  const { q, targetMarket, product, minRating } = req.query;
  let searchQuery = { isActive: true, isApproved: true, isEmailVerified: true };

  if (q) {
    searchQuery.$or = [
      { companyName: { $regex: q, $options: 'i' } },
      { 'exportProducts.specificProducts': { $regex: q, $options: 'i' } }
    ];
  }

  if (targetMarket) searchQuery['targetMarkets.country'] = targetMarket;
  if (product) searchQuery['exportProducts.specificProducts'] = { $regex: product, $options: 'i' };
  if (minRating) searchQuery['exportStats.averageRating'] = { $gte: parseFloat(minRating) };

  const exporters = await Exporter.find(searchQuery)
    .sort('-exportStats.averageRating -exportStats.totalValue')
    .limit(50);

  res.status(200).json({
    status: 'success',
    results: exporters.length,
    data: { exporters },
  });
});

exports.getExportersByMarket = catchAsync(async (req, res, next) => {
  const exporters = await Exporter.find({
    'targetMarkets.country': req.params.country,
    isActive: true, isApproved: true, isEmailVerified: true,
  }).sort('-exportStats.averageRating');

  res.status(200).json({
    status: 'success',
    results: exporters.length,
    data: { exporters },
  });
});

exports.getExportersByProduct = catchAsync(async (req, res, next) => {
  const exporters = await Exporter.find({
    'exportProducts.specificProducts': { $regex: req.params.product, $options: 'i' },
    isActive: true, isApproved: true, isEmailVerified: true,
  }).sort('-exportStats.averageRating');

  res.status(200).json({
    status: 'success',
    results: exporters.length,
    data: { exporters },
  });
});

exports.getExporter = catchAsync(async (req, res, next) => {
  const exporter = await Exporter.findOne({
    _id: req.params.id,
    isActive: true, isEmailVerified: true,
  });

  if (!exporter) {
    return next(new AppError('Exportateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { exporter },
  });
});

// ROUTES PROTÉGÉES EXPORTATEUR
exports.getMyProfile = catchAsync(async (req, res, next) => {
  const exporter = await Exporter.findById(req.user.id);
  res.status(200).json({ status: 'success', data: { exporter } });
});

exports.updateMyProfile = catchAsync(async (req, res, next) => {
  const allowedFields = ['companyName'];
  const filteredBody = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) filteredBody[key] = req.body[key];
  });

  const exporter = await Exporter.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { exporter } });
});

// Gestion des licences d'exportation (implémentation basique)
exports.getExportLicenses = catchAsync(async (req, res, next) => {
  const exporter = await Exporter.findById(req.user.id).select('exportLicenses');
  res.status(200).json({
    status: 'success',
    results: exporter.exportLicenses.length,
    data: { licenses: exporter.exportLicenses },
  });
});

exports.addExportLicense = catchAsync(async (req, res, next) => {
  const exporter = await Exporter.findById(req.user.id);
  const licenseData = { ...req.body };
  if (req.file) licenseData.document = req.file.filename;

  exporter.exportLicenses.push(licenseData);
  await exporter.save();

  res.status(201).json({
    status: 'success',
    data: { license: exporter.exportLicenses[exporter.exportLicenses.length - 1] },
  });
});

exports.updateExportLicense = catchAsync(async (req, res, next) => {
  const exporter = await Exporter.findById(req.user.id);
  const license = exporter.exportLicenses.id(req.params.licenseId);

  if (!license) return next(new AppError('Licence non trouvée', 404));

  Object.keys(req.body).forEach(key => {
    license[key] = req.body[key];
  });

  await exporter.save();
  res.status(200).json({ status: 'success', data: { license } });
});

exports.removeExportLicense = catchAsync(async (req, res, next) => {
  const exporter = await Exporter.findById(req.user.id);
  exporter.exportLicenses.pull(req.params.licenseId);
  await exporter.save();
  res.status(204).json({ status: 'success', data: null });
});

// Gestion de la flotte d'export
exports.getMyFleet = catchAsync(async (req, res, next) => {
  const exporter = await Exporter.findById(req.user.id).select('fleet');
  res.status(200).json({
    status: 'success',
    results: exporter.fleet.length,
    data: { fleet: exporter.fleet },
  });
});

exports.addVehicle = catchAsync(async (req, res, next) => {
  const exporter = await Exporter.findById(req.user.id);
  exporter.fleet.push(req.body);
  await exporter.save();

  res.status(201).json({
    status: 'success',
    data: { vehicle: exporter.fleet[exporter.fleet.length - 1] },
  });
});

exports.updateVehicle = catchAsync(async (req, res, next) => {
  const exporter = await Exporter.findById(req.user.id);
  const vehicle = exporter.fleet.id(req.params.vehicleId);

  if (!vehicle) return next(new AppError('Véhicule non trouvé', 404));

  Object.keys(req.body).forEach(key => {
    vehicle[key] = req.body[key];
  });

  await exporter.save();
  res.status(200).json({ status: 'success', data: { vehicle } });
});

exports.removeVehicle = catchAsync(async (req, res, next) => {
  const exporter = await Exporter.findById(req.user.id);
  exporter.fleet.pull(req.params.vehicleId);
  await exporter.save();
  res.status(204).json({ status: 'success', data: null });
});

exports.updateVehicleAvailability = catchAsync(async (req, res, next) => {
  const exporter = await Exporter.findById(req.user.id);
  const vehicle = exporter.fleet.id(req.params.vehicleId);

  if (!vehicle) return next(new AppError('Véhicule non trouvé', 404));

  vehicle.isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : vehicle.isAvailable;
  await exporter.save();

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
exports.getTargetMarkets = temporaryResponse('Marchés cibles');
exports.addTargetMarket = temporaryResponse('Ajout marché');
exports.updateTargetMarket = temporaryResponse('Mise à jour marché');
exports.removeTargetMarket = temporaryResponse('Suppression marché');

exports.getExportProducts = temporaryResponse('Produits d\'export');
exports.addExportProduct = temporaryResponse('Ajout produit');
exports.updateExportProduct = temporaryResponse('Mise à jour produit');
exports.removeExportProduct = temporaryResponse('Suppression produit');

exports.getInternationalCertifications = temporaryResponse('Certifications internationales');
exports.addInternationalCertification = temporaryResponse('Ajout certification');
exports.updateInternationalCertification = temporaryResponse('Mise à jour certification');
exports.removeInternationalCertification = temporaryResponse('Suppression certification');

exports.getLogisticsCapabilities = temporaryResponse('Capacités logistiques');
exports.updateLogisticsCapabilities = temporaryResponse('Mise à jour logistique');

exports.getShippingPartners = temporaryResponse('Partenaires transport');
exports.addShippingPartner = temporaryResponse('Ajout partenaire');
exports.updateShippingPartner = temporaryResponse('Mise à jour partenaire');
exports.removeShippingPartner = temporaryResponse('Suppression partenaire');

exports.getTradingTerms = temporaryResponse('Conditions commerciales');
exports.updateTradingTerms = temporaryResponse('Mise à jour conditions');

exports.getLocalSuppliers = temporaryResponse('Fournisseurs locaux');
exports.addLocalSupplier = temporaryResponse('Ajout fournisseur');
exports.updateLocalSupplier = temporaryResponse('Mise à jour fournisseur');
exports.removeLocalSupplier = temporaryResponse('Suppression fournisseur');

exports.getBankAccounts = temporaryResponse('Comptes bancaires');
exports.addBankAccount = temporaryResponse('Ajout compte');
exports.updateBankAccount = temporaryResponse('Mise à jour compte');
exports.removeBankAccount = temporaryResponse('Suppression compte');

exports.getInsurancePolicies = temporaryResponse('Polices d\'assurance');
exports.addInsurancePolicy = temporaryResponse('Ajout assurance');
exports.updateInsurancePolicy = temporaryResponse('Mise à jour assurance');
exports.removeInsurancePolicy = temporaryResponse('Suppression assurance');

exports.getTeam = temporaryResponse('Équipe');
exports.addTeamMember = temporaryResponse('Ajout membre');
exports.updateTeamMember = temporaryResponse('Mise à jour membre');
exports.removeTeamMember = temporaryResponse('Suppression membre');

// Obtenir toutes les commandes assignées à l'exportateur
exports.getMyExportOrders = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const status = req.query.status;

  // Construire la requête - les exportateurs récupèrent les commandes assignées via delivery.transporter
  // Pour un exportateur, on cherche les commandes qui lui sont assignées
  // On vérifie aussi que c'est bien un exportateur (via le userType dans delivery.transporter peuplé)
  const query = {
    'delivery.transporter': req.user.id
    // Note: On ne filtre pas par isExport car certaines commandes peuvent ne pas avoir ce champ défini
    // mais être assignées à un exportateur
  };

  // Filtrer par statut si fourni
  if (status && status !== 'all') {
    if (status === 'ready-for-pickup' || status === 'in-transit' || status === 'delivered' || status === 'completed') {
      query.status = status;
    }
  }

  console.log('[getMyExportOrders] Query:', JSON.stringify(query, null, 2));
  console.log('[getMyExportOrders] User ID:', req.user.id);
  console.log('[getMyExportOrders] User type:', req.user.userType);

  const orders = await Order.find(query)
    .populate('buyer', 'firstName lastName email phone')
    .populate('seller', 'firstName lastName companyName farmName email phone')
    .populate('delivery.transporter', 'firstName lastName companyName email phone userType')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  // Filtrer pour ne garder que les commandes assignées à un exportateur (double vérification)
  // Si delivery.transporter est peuplé et est un exportateur, ou si isExport est true
  const filteredOrders = orders.filter(order => {
    const transporter = order.delivery?.transporter;
    // Si le transporteur est peuplé, vérifier son userType
    if (transporter && typeof transporter === 'object' && transporter.userType) {
      return transporter.userType === 'exporter';
    }
    // Sinon, vérifier isExport
    return order.isExport === true;
  });

  console.log('[getMyExportOrders] Orders found:', orders.length);
  console.log('[getMyExportOrders] Filtered orders (exporters only):', filteredOrders.length);

  const total = await Order.countDocuments(query);
  
  // Compter aussi après filtrage
  const totalFiltered = filteredOrders.length;

  res.status(200).json({
    status: 'success',
    results: filteredOrders.length,
    total: totalFiltered,
    page,
    totalPages: Math.ceil(totalFiltered / limit),
    data: {
      exportOrders: filteredOrders,
      orders: filteredOrders
    }
  });
});

exports.createExportOrder = temporaryResponse('Création commande');
// Obtenir une commande spécifique assignée à l'exportateur
exports.getMyExportOrder = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  const order = await Order.findOne({
    _id: req.params.orderId,
    'delivery.transporter': req.user.id
    // Note: On ne filtre pas par isExport car certaines commandes peuvent ne pas avoir ce champ défini
    // mais être assignées à un exportateur. On vérifiera après si c'est bien un exportateur.
  })
    .populate('buyer', 'firstName lastName email phone address city region country')
    .populate('seller', 'firstName lastName companyName farmName email phone address city region')
    .populate('delivery.transporter', 'firstName lastName companyName email phone userType')
    .populate('items.product', 'name images price category');

  if (!order) {
    return next(new AppError('Commande d\'export non trouvée ou non assignée à cet exportateur', 404));
  }

  // Vérifier que c'est bien un exportateur qui est assigné (double vérification)
  const transporter = order.delivery?.transporter;
  const isExporterAssigned = transporter && typeof transporter === 'object' && transporter.userType === 'exporter';
  const isExportOrder = order.isExport === true;

  if (!isExporterAssigned && !isExportOrder) {
    return next(new AppError('Cette commande n\'est pas assignée à un exportateur', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order,
      exportOrder: order
    }
  });
});
exports.updateExportOrder = temporaryResponse('Mise à jour commande');
exports.cancelExportOrder = temporaryResponse('Annulation commande');
exports.trackExportOrder = temporaryResponse('Suivi commande');

// Mettre à jour le statut de commande d'export (collectée, livrée) - similaire aux transporteurs
exports.updateExportOrderStatus = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  const { status, location, note } = req.body;

  // Vérifier que le statut est valide
  const validStatuses = ['picked-up', 'in-transit', 'out-for-delivery', 'delivered'];
  if (!validStatuses.includes(status)) {
    return next(new AppError(`Statut invalide. Statuts autorisés: ${validStatuses.join(', ')}`, 400));
  }

  const order = await Order.findOne({
    _id: req.params.orderId,
    'delivery.transporter': req.user.id
    // Note: On ne filtre pas par isExport car certaines commandes peuvent ne pas avoir ce champ défini
    // mais être assignées à un exportateur. On vérifiera après si c'est bien un exportateur.
  })
    .populate('delivery.transporter', 'userType');

  if (!order) {
    return next(new AppError('Commande d\'export non trouvée ou non assignée à cet exportateur', 404));
  }

  // Vérifier que c'est bien un exportateur qui est assigné (double vérification)
  const transporter = order.delivery?.transporter;
  const isExporterAssigned = transporter && typeof transporter === 'object' && transporter.userType === 'exporter';
  const isExportOrder = order.isExport === true;

  if (!isExporterAssigned && !isExportOrder) {
    return next(new AppError('Cette commande n\'est pas assignée à un exportateur', 403));
  }

  // Valider la transition de statut selon les règles métier
  const currentStatus = order.delivery?.status || order.status || 'pending';
  const userType = req.user.userType || 'exporter';
  
  // Fonction pour obtenir les transitions valides (identique à transporter)
  const getValidTransitions = (currentStat, userTyp) => {
    const transitions = {
      'ready-for-pickup': {
        exporter: ['picked-up', 'in-transit']
      },
      'picked-up': {
        exporter: ['in-transit', 'delivered']
      },
      'in-transit': {
        exporter: ['delivered']
      },
      'out-for-delivery': {
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
  
  // Valider les transitions
  if (status === 'picked-up' && (currentStatus === 'ready-for-pickup' || currentStatus === 'preparing')) {
    // C'est valide
  } else if (status === 'in-transit' && (currentStatus === 'ready-for-pickup' || currentStatus === 'preparing' || currentStatus === 'picked-up')) {
    // C'est valide
  } else if (status === 'delivered' && (currentStatus === 'in-transit' || currentStatus === 'picked-up' || currentStatus === 'out-for-delivery')) {
    // C'est valide
  } else if (!validTransitions.includes(status) && status !== 'picked-up') {
    return next(new AppError(
      `Transition de statut invalide pour un exportateur: de "${currentStatus}" à "${status}". Transitions autorisées: ${validTransitions.join(', ')}`,
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
    message: `Statut de commande d'export mis à jour: ${status === 'picked-up' ? 'Collectée' : status === 'delivered' ? 'Livrée' : status}`,
    data: {
      order: updatedOrder,
      exportOrder: updatedOrder
    }
  });
});

exports.getExportDocuments = temporaryResponse('Documents export');
exports.addExportDocument = temporaryResponse('Ajout document');

exports.getLettersOfCredit = temporaryResponse('Lettres de crédit');
exports.createLetterOfCredit = temporaryResponse('Création LC');
exports.getLetterOfCredit = temporaryResponse('Détail LC');
exports.updateLetterOfCredit = temporaryResponse('Mise à jour LC');

exports.getExportStats = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  const Review = require('../models/Review');
  
  const exporter = await Exporter.findById(req.user.id);
  if (!exporter) {
    return next(new AppError('Exportateur non trouvé', 404));
  }

  // Récupérer toutes les commandes assignées à l'exportateur (sans filtre isExport)
  const allOrders = await Order.find({
    'delivery.transporter': exporter._id
  })
    .populate('delivery.transporter', 'userType');

  // Filtrer pour ne garder que les commandes assignées à un exportateur
  const exportOrders = allOrders.filter(order => {
    const transporter = order.delivery?.transporter;
    // Si le transporteur est peuplé, vérifier son userType
    if (transporter && typeof transporter === 'object' && transporter.userType) {
      return transporter.userType === 'exporter';
    }
    // Sinon, vérifier isExport
    return order.isExport === true;
  });

  // Calculer les statistiques depuis les commandes filtrées
  const orderStats = exportOrders.reduce((acc, order) => {
    acc.totalExports += 1;
    
    if (['delivered', 'completed'].includes(order.status)) {
      acc.completedExports += 1;
      acc.totalValue += order.deliveryFee || order.delivery?.deliveryFee || 0;
    }
    
    if (order.status === 'in-transit') {
      acc.inTransitExports += 1;
    }
    
    if (['ready-for-pickup', 'preparing'].includes(order.status)) {
      acc.pendingExports += 1;
    }
    
    return acc;
  }, {
    totalExports: 0,
    completedExports: 0,
    inTransitExports: 0,
    pendingExports: 0,
    totalValue: 0
  });

  // Calculer le taux de livraison réussie
  const successfulStats = exportOrders.reduce((acc, order) => {
    acc.totalOrders += 1;
    if (['delivered', 'completed'].includes(order.status)) {
      acc.successfulDeliveries += 1;
    }
    return acc;
  }, {
    totalOrders: 0,
    successfulDeliveries: 0
  });

  // Statistiques des avis (chercher via les commandes assignées à l'exportateur)
  // Utiliser les IDs des commandes filtrées
  const exportOrderIds = exportOrders.map(order => order._id);
  
  const reviewStats = await Review.aggregate([
    {
      $match: {
        $or: [
          { order: { $in: exportOrderIds } },
          { exporter: exporter._id }
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
  const profileViews = exporter.profileViews || 0;

  // Compter les marchés cibles
  const exportCountries = exporter.targetMarkets?.length || 0;
  
  // Compter les produits d'export
  const exportProductsCount = exporter.exportProducts?.length || 0;
  
  // Licences actives
  const activeLicenses = exporter.exportLicenses?.filter(license => {
    if (!license.validUntil) return license.isVerified;
    return license.isVerified && new Date(license.validUntil) > new Date();
  }).length || 0;

  // orderStats et successfulStats sont déjà des objets, pas des tableaux
  const deliveryData = orderStats || {
    totalExports: 0,
    completedExports: 0,
    inTransitExports: 0,
    pendingExports: 0,
    totalValue: 0
  };

  const successfulData = successfulStats || {
    totalOrders: 0,
    successfulDeliveries: 0
  };

  const reviewData = reviewStats.length > 0 ? reviewStats[0] : {
    averageRating: 0,
    totalReviews: 0
  };

  // Calculer le taux de livraison réussie
  const successfulDeliveryRate = successfulData.totalOrders > 0
    ? Math.round((successfulData.successfulDeliveries / successfulData.totalOrders) * 100)
    : exporter.exportStats?.successfulDeliveryRate || 0;

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

    // Statistiques d'export depuis les commandes assignées
    totalExports: deliveryData.totalExports || exporter.exportStats?.totalExports || 0,
    totalValue: deliveryData.totalValue || exporter.exportStats?.totalValue || 0,
    exportValue: deliveryData.totalValue || exporter.exportStats?.totalValue || 0,
    successfulDeliveryRate: successfulDeliveryRate,

    // Statistiques détaillées
    completedExports: deliveryData.completedExports || 0,
    inTransitExports: deliveryData.inTransitExports || 0,
    pendingExports: deliveryData.pendingExports || 0,
    
    // Statistiques additionnelles
    exportCountries: exportCountries,
    exportProductsCount: exportProductsCount,
    activeLicenses: activeLicenses,
    
    // Produits d'export (depuis exportProducts du modèle, pas le modèle Product)
    totalProducts: exportProductsCount,
    activeProducts: exportProductsCount,
    
    // Pour compatibilité
    totalOrders: deliveryData.totalExports || 0
  };

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

// Alias pour compatibilité avec le service générique
exports.getStats = exports.getExportStats;
exports.getExportAnalytics = temporaryResponse('Analytics export');
exports.getMarketPerformance = temporaryResponse('Performance marchés');
exports.getRevenueAnalytics = temporaryResponse('Analytics revenus');

exports.getRegulatoryReports = temporaryResponse('Rapports réglementaires');
exports.generateRegulatoryReport = temporaryResponse('Génération rapport');

exports.getInternationalQuotes = temporaryResponse('Devis internationaux');
exports.createInternationalQuote = temporaryResponse('Création devis');
exports.getInternationalQuote = temporaryResponse('Détail devis');
exports.updateInternationalQuote = temporaryResponse('Mise à jour devis');
exports.deleteInternationalQuote = temporaryResponse('Suppression devis');
exports.convertQuoteToOrder = temporaryResponse('Conversion devis');

exports.getExchangeRates = temporaryResponse('Taux de change');
exports.getHedgingPositions = temporaryResponse('Positions de couverture');
exports.createHedgingPosition = temporaryResponse('Création position');

exports.getMyDocuments = temporaryResponse('Mes documents');
exports.addDocument = temporaryResponse('Ajout document');

exports.getNotifications = temporaryResponse('Notifications');
exports.markNotificationsAsRead = temporaryResponse('Lecture notifications');

exports.getMarketAlerts = temporaryResponse('Alertes marché');
exports.createMarketAlert = temporaryResponse('Création alerte');

module.exports = exports;
