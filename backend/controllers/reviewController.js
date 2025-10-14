const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// ROUTES PUBLIQUES

// Obtenir les avis d'un produit
exports.getProductReviews = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Filtres
  const queryObj = { 
    product: req.params.productId, 
    status: 'approved' 
  };

  if (req.query.rating && req.query.rating !== 'all') {
    const rating = parseInt(req.query.rating, 10);
    if (!isNaN(rating)) {
      queryObj.rating = rating;
    }
  }

  if (req.query.verified === 'true') {
    queryObj.isVerifiedPurchase = true;
  }

  // Tri
  let sortObj = {};
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
    case 'most-helpful':
      sortObj = { helpfulVotes: -1, createdAt: -1 };
      break;
    default:
      sortObj = { helpfulVotes: -1, createdAt: -1 };
  }

  const reviews = await Review.find(queryObj)
    .populate('reviewer', 'firstName lastName avatar')
    .populate('producerResponse.respondedBy', 'firstName lastName')
    .sort(sortObj)
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments(queryObj);

  // Statistiques des avis pour ce produit
  const stats = await Review.getProductRatingStats(req.params.productId);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    stats: stats[0] || null,
    data: {
      reviews
    }
  });
});

// Obtenir les avis en vedette d'un produit
exports.getFeaturedReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.getFeaturedReviews(req.params.productId);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

// Obtenir les avis d'un producteur
exports.getProducerReviews = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({
    producer: req.params.producerId,
    status: 'approved'
  })
  .populate('reviewer', 'firstName lastName avatar')
  .populate('product', 'name images')
  .sort('-createdAt')
  .skip(skip)
  .limit(limit);

  const total = await Review.countDocuments({
    producer: req.params.producerId,
    status: 'approved'
  });

  // Statistiques du producteur
  const stats = await Review.getProducerRatingStats(req.params.producerId);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    stats: stats[0] || null,
    data: {
      reviews
    }
  });
});

// ROUTES PROTÉGÉES

// Créer un avis (acheteurs seulement)
exports.createReview = catchAsync(async (req, res, next) => {
  const { orderId, productId, rating, title, comment, detailedRating, media, producer } = req.body;

  let order = null;
  let producerId = producer;

  // Si un orderId est fourni, vérifier que l'utilisateur a bien acheté ce produit
  if (orderId) {
    order = await Order.findOne({
      _id: orderId,
      buyer: req.user.id,
      status: { $in: ['completed', 'delivered'] },
      'items.product': productId
    }).populate('seller');

    if (!order) {
      return next(new AppError('Commande non trouvée ou non valide', 404));
    }

    producerId = order.seller._id;

    // Vérifier qu'un avis n'existe pas déjà pour cette commande
    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      return next(new AppError('Vous avez déjà laissé un avis pour cette commande', 400));
    }
  } else {
    // Si pas d'orderId, vérifier que l'utilisateur a acheté ce produit dans une commande complétée ou livrée
    console.log('🔍 Recherche de commande pour:', {
      buyer: req.user.id,
      productId,
      status: { $in: ['completed', 'delivered'] }
    });
    
    const completedOrder = await Order.findOne({
      buyer: req.user.id,
      status: { $in: ['completed', 'delivered'] },
      'items.product': productId
    }).populate('seller');

    console.log('📦 Commande trouvée:', completedOrder ? 'Oui' : 'Non');

    if (!completedOrder) {
      // Vérifier s'il y a des commandes avec ce produit mais pas complétées/livrées
      const pendingOrder = await Order.findOne({
        buyer: req.user.id,
        'items.product': productId,
        status: { $nin: ['completed', 'delivered'] }
      });
      
      if (pendingOrder) {
        console.log('⚠️ Commande trouvée mais pas complétée/livrée:', pendingOrder.status);
        return next(new AppError(`Commande trouvée mais pas encore complétée (statut: ${pendingOrder.status})`, 403));
      }
      
      console.log('❌ Aucune commande trouvée pour ce produit');
      
      // Vérifier si on permet les avis sans commande (pour les tests)
      const allowReviewsWithoutOrder = process.env.ALLOW_REVIEWS_WITHOUT_ORDER === 'true';
      
      if (!allowReviewsWithoutOrder) {
        return next(new AppError('Vous devez avoir acheté ce produit pour laisser un avis', 403));
      }
      
      console.log('🔓 Mode test: Permettre l\'avis sans commande');
      
      // Récupérer le producteur depuis le produit
      const product = await Product.findById(productId).populate('producer');
      if (!product) {
        return next(new AppError('Produit non trouvé', 404));
      }
      
      producerId = product.producer._id;
      order = null; // Pas de commande associée
    } else {
      producerId = completedOrder.seller._id;
      order = completedOrder;
    }
  }

  // Créer l'avis
  const review = await Review.create({
    reviewer: req.user.id,
    product: productId,
    order: orderId || (order ? order._id : null),
    producer: producerId,
    rating,
    title: title || `Avis ${rating} étoiles`,
    comment: comment || '',
    detailedRating,
    media: media || [],
    isVerifiedPurchase: order ? true : false, // Vérifié seulement si commande associée
    purchaseDate: order ? order.createdAt : null
  });

  // Marquer la commande comme évaluée si elle existe
  if (order) {
    order.isReviewed = true;
    order.review = review._id;
    await order.save();
  }

  // Notifier le producteur
  await Notification.createNotification({
    recipient: producerId,
    type: 'review_received',
    category: 'product',
    title: 'Nouvel avis reçu',
    message: `Vous avez reçu un avis ${rating} étoiles pour "${title}"`,
    data: {
      reviewId: review._id,
      productId,
      rating
    },
    actions: [{
      type: 'view',
      label: 'Voir l\'avis',
      url: `/reviews/${review._id}`
    }],
    channels: {
      inApp: { enabled: true },
      email: { enabled: true }
    }
  });

  res.status(201).json({
    status: 'success',
    data: {
      review
    }
  });
});

// Obtenir mes avis
exports.getMyReviews = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ reviewer: req.user.id })
    .populate('product', 'name images')
    .populate('producer', 'farmName firstName lastName')
    .populate('order', 'orderNumber status delivery.deliveredAt')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments({ reviewer: req.user.id });

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

// Mettre à jour mon avis
exports.updateMyReview = catchAsync(async (req, res, next) => {
  const allowedFields = ['rating', 'title', 'comment', 'detailedRating'];
  const filteredBody = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  const review = await Review.findOneAndUpdate(
    { _id: req.params.id, reviewer: req.user.id },
    filteredBody,
    { new: true, runValidators: true }
  );

  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

// Supprimer mon avis
exports.deleteMyReview = catchAsync(async (req, res, next) => {
  const review = await Review.findOneAndDelete({
    _id: req.params.id,
    reviewer: req.user.id
  });

  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }

  // Marquer la commande comme non évaluée
  await Order.findByIdAndUpdate(review.order, {
    isReviewed: false,
    review: undefined
  });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Voter pour l'utilité d'un avis
exports.voteReview = catchAsync(async (req, res, next) => {
  const { voteType } = req.body; // 'helpful' ou 'unhelpful'

  if (!['helpful', 'unhelpful'].includes(voteType)) {
    return next(new AppError('Type de vote invalide', 400));
  }

  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }

  // Ne pas permettre de voter pour son propre avis
  if (review.reviewer.toString() === req.user.id) {
    return next(new AppError('Vous ne pouvez pas voter pour votre propre avis', 400));
  }

  await review.vote(req.user.id, voteType);

  res.status(200).json({
    status: 'success',
    data: {
      helpfulVotes: review.helpfulVotes,
      unhelpfulVotes: review.unhelpfulVotes
    }
  });
});

// Supprimer un vote
exports.removeVote = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }

  await review.removeVote(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      helpfulVotes: review.helpfulVotes,
      unhelpfulVotes: review.unhelpfulVotes
    }
  });
});

// Signaler un avis
exports.reportReview = catchAsync(async (req, res, next) => {
  const { reason, description } = req.body;

  if (!reason) {
    return next(new AppError('Raison du signalement requise', 400));
  }

  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }

  await review.report(req.user.id, reason, description);

  res.status(200).json({
    status: 'success',
    message: 'Avis signalé avec succès'
  });
});

// ROUTES PRODUCTEUR

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

// ROUTES ADMIN

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
  const { status, reason } = req.body;

  if (!['approved', 'rejected', 'hidden'].includes(status)) {
    return next(new AppError('Statut de modération invalide', 400));
  }

  const review = await Review.findById(req.params.id)
    .populate('reviewer', 'firstName lastName email')
    .populate('producer', 'firstName lastName email');

  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }

  await review.moderate(status, reason, req.user.id);

  // Notifier l'auteur de l'avis si rejeté
  if (status === 'rejected') {
    await Notification.createNotification({
      recipient: review.reviewer._id,
      type: 'review_rejected',
      category: 'product',
      title: 'Avis modéré',
      message: `Votre avis a été modéré. Raison: ${reason}`,
      data: {
        reviewId: review._id,
        reason
      },
      channels: {
        inApp: { enabled: true },
        email: { enabled: true }
      }
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

// Obtenir les avis signalés
exports.getReportedReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({
    'reports.0': { $exists: true },
    status: { $ne: 'hidden' }
  })
  .populate('reviewer', 'firstName lastName email')
  .populate('producer', 'farmName firstName lastName')
  .populate('product', 'name')
  .populate('reports.reportedBy', 'firstName lastName')
  .sort('-reports.reportedAt');

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

// Statistiques des avis (admin)
exports.getReviewStats = catchAsync(async (req, res, next) => {
  const { period = '30d' } = req.query;
  const periodDays = parseInt(period.replace('d', ''));
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
        rejectedReviews: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        },
        reportedReviews: {
          $sum: { $cond: [{ $gt: [{ $size: '$reports' }, 0] }, 1, 0] }
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

// FONCTIONS UTILITAIRES

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

// Rechercher dans les avis
exports.searchReviews = catchAsync(async (req, res, next) => {
  const { q, productId, producerId } = req.query;

  const searchQuery = {
    status: 'approved',
    $text: { $search: q }
  };

  if (productId) searchQuery.product = productId;
  if (producerId) searchQuery.producer = producerId;

  const reviews = await Review.find(searchQuery)
    .populate('reviewer', 'firstName lastName avatar')
    .populate('product', 'name images')
    .sort({ score: { $meta: 'textScore' } })
    .limit(20);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

// Obtenir un avis spécifique
exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate('reviewer', 'firstName lastName avatar')
    .populate('producer', 'farmName firstName lastName')
    .populate('product', 'name images price')
    .populate('producerResponse.respondedBy', 'firstName lastName');

  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

// Obtenir les statistiques de notation d'un produit
exports.getProductRatingStats = catchAsync(async (req, res, next) => {
  const stats = await Review.getProductRatingStats(req.params.productId);
  
  res.status(200).json({
    status: 'success',
    data: stats[0] || null
  });
});

// Obtenir les statistiques de notation d'un producteur
exports.getProducerRatingStats = catchAsync(async (req, res, next) => {
  const stats = await Review.getProducerRatingStats(req.params.producerId);
  
  res.status(200).json({
    status: 'success',
    data: stats[0] || null
  });
});

module.exports = exports;
