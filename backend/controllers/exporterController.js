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

exports.getMyExportOrders = temporaryResponse('Commandes export - Modèle Order requis');
exports.createExportOrder = temporaryResponse('Création commande');
exports.getMyExportOrder = temporaryResponse('Détail commande');
exports.updateExportOrder = temporaryResponse('Mise à jour commande');
exports.cancelExportOrder = temporaryResponse('Annulation commande');
exports.trackExportOrder = temporaryResponse('Suivi commande');
exports.updateExportOrderStatus = temporaryResponse('Statut commande');

exports.getExportDocuments = temporaryResponse('Documents export');
exports.addExportDocument = temporaryResponse('Ajout document');

exports.getLettersOfCredit = temporaryResponse('Lettres de crédit');
exports.createLetterOfCredit = temporaryResponse('Création LC');
exports.getLetterOfCredit = temporaryResponse('Détail LC');
exports.updateLetterOfCredit = temporaryResponse('Mise à jour LC');

exports.getExportStats = temporaryResponse('Statistiques export');
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
