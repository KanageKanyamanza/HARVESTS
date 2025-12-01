const Producer = require('../../models/Producer');
const Product = require('../../models/Product');
const Review = require('../../models/Review');

/**
 * Service pour la recherche et l'affichage public des producteurs
 */

function buildAllProducersQuery(queryParams) {
  const baseQueryObj = { ...queryParams };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'lang', 'useLocation'];
  excludedFields.forEach((el) => delete baseQueryObj[el]);
  
  baseQueryObj.isActive = true;
  baseQueryObj.isApproved = true;
  baseQueryObj.isEmailVerified = true;
  
  let queryStr = JSON.stringify(baseQueryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  return JSON.parse(queryStr);
}

async function getAllProducers(queryParams, userLocation = null) {
  const Producer = require('../../models/Producer');
  let queryObj = buildAllProducersQuery(queryParams);
  
  if (userLocation && queryParams.locationQuery) {
    if (queryParams.locationQuery.$or && queryParams.locationQuery.$or.length > 0) {
      queryObj.$and = queryObj.$and || [];
      queryObj.$and.push({ $or: queryParams.locationQuery.$or });
    }
  }
  
  const page = queryParams.page * 1 || 1;
  const limit = queryParams.limit * 1 || 20;
  const skip = (page - 1) * limit;

  let query = Producer.find(queryObj);
  if (queryParams.sort) {
    query = query.sort(queryParams.sort.split(',').join(' '));
  } else {
    query = query.sort('-salesStats.averageRating -createdAt');
  }
  query = query.skip(skip).limit(limit);

  const producers = await query;
  const total = await Producer.countDocuments(queryObj);

  return { producers, total, page, totalPages: Math.ceil(total / limit), userLocation };
}

function buildSearchQuery(queryParams) {
  const { q, region, crop, farmingType, minRating } = queryParams;
  let searchQuery = {
    isActive: true,
    isApproved: true,
    isEmailVerified: true,
  };

  if (q) {
    searchQuery.$or = [
      { farmName: { $regex: q, $options: 'i' } },
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
      { 'crops.name': { $regex: q, $options: 'i' } }
    ];
  }

  if (region) searchQuery['address.region'] = region;
  if (crop) searchQuery['crops.name'] = { $regex: crop, $options: 'i' };
  if (farmingType) searchQuery.farmingType = farmingType;
  if (minRating) searchQuery['salesStats.averageRating'] = { $gte: parseFloat(minRating) };

  return searchQuery;
}

async function searchProducers(queryParams) {
  const searchQuery = buildSearchQuery(queryParams);
  const producers = await Producer.find(searchQuery)
    .sort('-salesStats.averageRating -salesStats.totalOrders')
    .limit(50);
  return producers;
}

async function getProducersByRegion(region) {
  const producers = await Producer.find({
    'address.region': region,
    isActive: true,
    isApproved: true,
    isEmailVerified: true,
  }).sort('-salesStats.averageRating');
  return producers;
}

async function getProducersByCrop(crop) {
  const producers = await Producer.find({
    'crops.name': { $regex: crop, $options: 'i' },
    isActive: true,
    isApproved: true,
    isEmailVerified: true,
  }).sort('-salesStats.averageRating');
  return producers;
}

async function getProducer(id) {
  const producer = await Producer.findOne({
    _id: id,
    isActive: true,
    isEmailVerified: true,
  });
  if (!producer) {
    throw new Error('Producteur non trouvé');
  }
  return producer;
}

async function getProducerProducts(producerId) {
  const products = await Product.find({
    producer: producerId,
    status: 'approved',
    isActive: true
  }).sort('-createdAt');
  return products;
}

async function getProducerReviews(producerId) {
  const producer = await Producer.findById(producerId);
  if (!producer) {
    throw new Error('Producteur non trouvé');
  }
  
  const products = await Product.find({ 
    producer: producerId,
    isActive: true,
    status: 'approved'
  }).select('_id');
  
  const productIds = products.map(p => p._id);
  
  const reviews = await Review.find({ 
    product: { $in: productIds },
    isActive: true 
  })
  .populate('reviewer', 'firstName lastName avatar')
  .populate('product', 'name images')
  .sort('-createdAt')
  .limit(20);
  
  const stats = await Review.aggregate([
    { $match: { product: { $in: productIds }, isActive: true } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);
  
  const reviewStats = stats[0] || {
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: []
  };
  
  return {
    reviews,
    stats: {
      totalReviews: reviewStats.totalReviews,
      averageRating: Math.round(reviewStats.averageRating * 10) / 10,
      ratingDistribution: {
        5: reviewStats.ratingDistribution.filter(r => r === 5).length,
        4: reviewStats.ratingDistribution.filter(r => r === 4).length,
        3: reviewStats.ratingDistribution.filter(r => r === 3).length,
        2: reviewStats.ratingDistribution.filter(r => r === 2).length,
        1: reviewStats.ratingDistribution.filter(r => r === 1).length
      }
    }
  };
}

module.exports = {
  buildAllProducersQuery,
  getAllProducers,
  buildSearchQuery,
  searchProducers,
  getProducersByRegion,
  getProducersByCrop,
  getProducer,
  getProducerProducts,
  getProducerReviews
};

