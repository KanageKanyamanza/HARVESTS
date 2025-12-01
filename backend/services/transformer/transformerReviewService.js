const Review = require('../../models/Review');

/**
 * Service pour la gestion des avis du transformateur
 */

async function getMyReviews(transformerId, queryParams = {}) {
  const limit = queryParams.limit || 20;
  const page = queryParams.page || 1;
  const skip = (page - 1) * limit;
  
  const reviews = await Review.find({ transformer: transformerId })
    .populate('consumer', 'firstName lastName avatar')
    .populate('product', 'name images')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);
  
  const total = await Review.countDocuments({ transformer: transformerId });
  
  return {
    reviews,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

async function markReviewAsRead(reviewId, transformerId) {
  const review = await Review.findOneAndUpdate(
    { _id: reviewId, transformer: transformerId },
    { read: true, readAt: new Date() },
    { new: true }
  );
  
  if (!review) {
    throw new Error('Avis non trouvé');
  }
  
  return review;
}

async function markAllReviewsAsRead(transformerId) {
  await Review.updateMany(
    { transformer: transformerId, read: false },
    { read: true, readAt: new Date() }
  );
}

module.exports = {
  getMyReviews,
  markReviewAsRead,
  markAllReviewsAsRead
};

