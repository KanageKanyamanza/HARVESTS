const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Exporter = require('../../models/Exporter');

// Obtenir tous les exportateurs
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

// Rechercher des exportateurs
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

// Obtenir les exportateurs par marché
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

// Obtenir les exportateurs par produit
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

// Obtenir un exportateur
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

