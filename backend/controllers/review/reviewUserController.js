const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Review = require('../../models/Review');
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const Notification = require('../../models/Notification');
const adminNotifications = require('../../utils/adminNotifications');

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
    const completedOrder = await Order.findOne({
      buyer: req.user.id,
      status: { $in: ['completed', 'delivered'] },
      'items.product': productId
    }).populate('seller');

    if (!completedOrder) {
      // Vérifier s'il y a des commandes avec ce produit mais pas complétées/livrées
      const pendingOrder = await Order.findOne({
        buyer: req.user.id,
        'items.product': productId,
        status: { $nin: ['completed', 'delivered'] }
      });
      
      if (pendingOrder) {
        return next(new AppError(`Commande trouvée mais pas encore complétée (statut: ${pendingOrder.status})`, 403));
      }
      
      // Vérifier si on permet les avis sans commande (pour les tests)
      const allowReviewsWithoutOrder = process.env.ALLOW_REVIEWS_WITHOUT_ORDER === 'true';
      
      if (!allowReviewsWithoutOrder) {
        return next(new AppError('Vous devez avoir acheté ce produit pour laisser un avis', 403));
      }
      
      // Récupérer le producteur depuis le produit
      const product = await Product.findById(productId).populate('producer');
      if (!product) {
        return next(new AppError('Produit non trouvé', 404));
      }
      
      if (!product.producer) {
        return next(new AppError('Producteur non trouvé pour ce produit', 404));
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
    isVerifiedPurchase: order ? true : false,
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

  // Notifier les admins du nouvel avis
  const product = await Product.findById(productId).populate('producer');
  if (product) {
    adminNotifications.notifyNewReview(review, req.user, product).catch(err => {
      console.error('Erreur notification nouvel avis:', err);
    });
  }

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

  // Notifier les admins de l'avis signalé
  const reviewer = await require('../../models/User').findById(review.reviewer);
  if (reviewer) {
    adminNotifications.notifyReviewReported(review, reviewer, reason, description).catch(err => {
      console.error('Erreur notification avis signalé:', err);
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Avis signalé avec succès'
  });
});

