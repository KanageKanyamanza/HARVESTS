const Review = require('../../models/Review');
const Product = require('../../models/Product');

/**
 * Service pour la gestion des avis du consommateur
 */

async function getConsumerReviews(consumerId, limit = 20) {
  try {
    const reviews = await Review.find({ reviewer: consumerId })
      .populate({
        path: 'product',
        select: 'name images price unit',
        populate: {
          path: 'producer transformer',
          select: 'farmName companyName firstName lastName'
        }
      })
      .populate('producer', 'farmName firstName lastName')
      .populate('transformer', 'companyName firstName lastName')
      .populate('order', 'orderNumber')
      .sort('-createdAt')
      .limit(limit);
    
    return reviews || [];
  } catch (error) {
    console.error('Erreur dans getConsumerReviews:', error.message);
    // Retourner un tableau vide en cas d'erreur
    return [];
  }
}

async function createReview(consumerId, reviewData) {
  // Vérifier que le produit existe
  const product = await Product.findById(reviewData.product);
  if (!product) {
    throw new Error('product.not_found');
  }
  
  // Vérifier que le consommateur a acheté ce produit
  const Order = require('../../models/Order');
  const hasPurchased = await Order.findOne({
    buyer: consumerId,
    'items.product': reviewData.product,
    status: { $in: ['completed', 'delivered'] }
  });
  
  if (!hasPurchased) {
    throw new Error('review.purchase_required');
  }
  
  // Vérifier qu'il n'y a pas déjà un avis pour ce produit
  const existingReview = await Review.findOne({
    reviewer: consumerId,
    product: reviewData.product
  });
  
  if (existingReview) {
    throw new Error('review.already_reviewed');
  }
  
  const review = await Review.create({
    ...reviewData,
    reviewer: consumerId,
    status: 'pending'
  });
  
  await review.populate('product', 'name images');
  
  return review;
}

async function getConsumerReviewById(consumerId, reviewId) {
  const review = await Review.findOne({
    _id: reviewId,
    reviewer: consumerId
  })
    .populate('product', 'name images')
    .populate('producer', 'farmName')
    .populate('transformer', 'companyName');
  
  if (!review) {
    throw new Error('review.not_found');
  }
  
  return review;
}

async function updateConsumerReview(consumerId, reviewId, updateData) {
  const review = await Review.findOneAndUpdate(
    { _id: reviewId, reviewer: consumerId },
    { ...updateData, status: 'pending' }, // Remettre en attente si modifié
    { new: true, runValidators: true }
  );
  
  if (!review) {
    throw new Error('review.not_found');
  }
  
  return review;
}

async function deleteConsumerReview(consumerId, reviewId) {
  const review = await Review.findOneAndDelete({
    _id: reviewId,
    reviewer: consumerId
  });
  
  if (!review) {
    throw new Error('review.not_found');
  }
  
  return review;
}

module.exports = {
  getConsumerReviews,
  createReview,
  getConsumerReviewById,
  updateConsumerReview,
  deleteConsumerReview
};

