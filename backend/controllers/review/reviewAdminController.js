const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Review = require('../../models/Review');

// Obtenir tous les avis (admin)
exports.getAllReviews = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const queryObj = {};
  
  // Filtres admin
  if (req.query.status) queryObj.status = req.query.status;
  if (req.query.rating && req.query.rating !== 'all') {
    const rating = parseInt(req.query.rating, 10);
    if (!isNaN(rating)) {
      queryObj.rating = rating;
    }
  }
  if (req.query.reported === 'true') {
    queryObj['reports.0'] = { $exists: true };
  }

  const reviews = await Review.find(queryObj)
    .populate('reviewer', 'firstName lastName email')
    .populate('producer', 'farmName firstName lastName')
    .populate('product', 'name')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments(queryObj);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      reviews
    }
  });
});

// Modérer un avis (admin)
exports.moderateReview = catchAsync(async (req, res, next) => {
  const { action, reason } = req.body; // action: 'approve', 'reject', 'delete'

  if (!['approve', 'reject', 'delete'].includes(action)) {
    return next(new AppError('Action de modération invalide', 400));
  }

  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }

  switch (action) {
    case 'approve':
      review.status = 'approved';
      review.moderatedAt = new Date();
      review.moderatedBy = req.user.id;
      break;
    case 'reject':
      if (!reason) {
        return next(new AppError('Raison du rejet requise', 400));
      }
      review.status = 'rejected';
      review.rejectionReason = reason;
      review.moderatedAt = new Date();
      review.moderatedBy = req.user.id;
      break;
    case 'delete':
      review.status = 'deleted';
      review.moderatedAt = new Date();
      review.moderatedBy = req.user.id;
      break;
  }

  await review.save();

  res.status(200).json({
    status: 'success',
    message: `Avis ${action === 'approve' ? 'approuvé' : action === 'reject' ? 'rejeté' : 'supprimé'} avec succès`,
    data: {
      review
    }
  });
});

// Obtenir les avis signalés (admin)
exports.getReportedReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({
    'reports.0': { $exists: true }
  })
  .populate('reviewer', 'firstName lastName email')
  .populate('producer', 'farmName firstName lastName')
  .populate('product', 'name')
  .sort('-reports.0.reportedAt')
  .limit(50);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

// Obtenir les statistiques des avis (admin)
exports.getReviewStats = catchAsync(async (req, res, next) => {
  const { period = '30d' } = req.query;
  const periodDays = parseInt(period.replace('d', ''), 10);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  // Statistiques générales
  const generalStats = await Review.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        approvedReviews: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        pendingReviews: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        rejectedReviews: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        },
        reportedReviews: {
          $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ['$reports', []] } }, 0] }, 1, 0] }
        }
      }
    }
  ]);

  // Distribution des notes
  const ratingDistribution = await Review.aggregate([
    { $match: { createdAt: { $gte: startDate }, status: 'approved' } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Évolution dans le temps
  const timeline = await Review.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 },
        averageRating: { $avg: '$rating' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      overview: generalStats[0] || {},
      ratingDistribution,
      timeline,
      period
    }
  });
});

