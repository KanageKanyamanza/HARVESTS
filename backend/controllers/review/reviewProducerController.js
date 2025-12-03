const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Review = require('../../models/Review');
const Notification = require('../../models/Notification');

// Répondre à un avis (producteurs seulement)
exports.respondToReview = catchAsync(async (req, res, next) => {
  const { comment } = req.body;

  if (!comment || comment.trim().length === 0) {
    return next(new AppError('Commentaire de réponse requis', 400));
  }

  const review = await Review.findOne({
    _id: req.params.id,
    producer: req.user.id
  }).populate('reviewer', 'firstName lastName email');

  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }

  if (review.producerResponse && review.producerResponse.comment) {
    return next(new AppError('Vous avez déjà répondu à cet avis', 400));
  }

  await review.addProducerResponse(comment, req.user.id);

  // Notifier le client
  await Notification.createNotification({
    recipient: review.reviewer._id,
    type: 'review_response_received',
    category: 'product',
    title: 'Réponse à votre avis',
    message: `Le producteur a répondu à votre avis sur "${review.title}"`,
    data: {
      reviewId: review._id,
      productId: review.product
    },
    actions: [{
      type: 'view',
      label: 'Voir la réponse',
      url: `/reviews/${review._id}`
    }],
    channels: {
      inApp: { enabled: true },
      email: { enabled: true }
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

// Obtenir les avis reçus (producteurs)
exports.getReceivedReviews = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const queryObj = { producer: req.user.id };
  
  if (req.query.rating && req.query.rating !== 'all') {
    const rating = parseInt(req.query.rating, 10);
    if (!isNaN(rating) && rating >= 1 && rating <= 5) {
      queryObj.rating = rating;
    }
  }
  
  if (req.query.hasResponse && req.query.hasResponse !== 'all') {
    if (req.query.hasResponse === 'true') {
      queryObj['producerResponse.comment'] = { $exists: true };
    } else {
      queryObj['producerResponse.comment'] = { $exists: false };
    }
  }

  // Validation du paramètre de tri
  let sortObj = { createdAt: -1 };
  if (req.query.sort) {
    switch (req.query.sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'highest-rating':
        sortObj = { rating: -1, createdAt: -1 };
        break;
      case 'lowest-rating':
        sortObj = { rating: 1, createdAt: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }
  }

  const reviews = await Review.find(queryObj)
    .populate('reviewer', 'firstName lastName avatar')
    .populate('product', 'name images')
    .sort(sortObj)
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments(queryObj);

  // Statistiques rapides
  const stats = await Review.aggregate([
    { $match: { producer: req.user.id, status: 'approved' } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        respondedReviews: {
          $sum: {
            $cond: [
              { $ne: ['$producerResponse.comment', null] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    stats: stats[0] || {},
    data: {
      reviews
    }
  });
});

// Obtenir les avis récents pour un producteur
exports.getRecentReviews = catchAsync(async (req, res, next) => {
  const days = parseInt(req.query.days, 10) || 30;
  const limit = parseInt(req.query.limit, 10) || 10;

  const reviews = await Review.getRecentReviews(req.user.id, days, limit);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

