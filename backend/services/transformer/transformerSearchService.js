const Transformer = require('../../models/Transformer');
const Product = require('../../models/Product');
const Review = require('../../models/Review');

/**
 * Service pour la recherche et l'affichage public des transformateurs
 */

function buildSearchQuery(queryParams) {
  const { q, region, type, minRating } = queryParams;
  let searchQuery = {
    isActive: true,
    isApproved: true,
    isEmailVerified: true,
  };

  if (q) {
    searchQuery.$or = [
      { companyName: { $regex: q, $options: 'i' } },
      { businessName: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ];
  }

  if (region) searchQuery['address.region'] = region;
  if (type) searchQuery.transformationType = type;
  if (minRating) searchQuery['businessStats.supplierRating'] = { $gte: parseFloat(minRating) };

  return searchQuery;
}

function buildAllTransformersQuery(queryParams) {
  const baseQueryObj = { ...queryParams };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete baseQueryObj[el]);
  
  baseQueryObj.isActive = true;
  baseQueryObj.isApproved = true;
  baseQueryObj.isEmailVerified = true;
  
  let queryStr = JSON.stringify(baseQueryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  return JSON.parse(queryStr);
}

async function getAllTransformers(queryParams) {
  const queryObj = buildAllTransformersQuery(queryParams);
  const page = queryParams.page * 1 || 1;
  const limit = queryParams.limit * 1 || 20;
  const skip = (page - 1) * limit;

  let query = Transformer.find(queryObj);
  if (queryParams.sort) {
    query = query.sort(queryParams.sort.split(',').join(' '));
  } else {
    query = query.sort('-businessStats.supplierRating -createdAt');
  }
  query = query.skip(skip).limit(limit);

  const transformers = await query;
  const total = await Transformer.countDocuments(queryObj);

  return { transformers, total, page, totalPages: Math.ceil(total / limit) };
}

async function searchTransformers(queryParams) {
  const searchQuery = buildSearchQuery(queryParams);
  const transformers = await Transformer.find(searchQuery)
    .sort('-businessStats.supplierRating -createdAt')
    .limit(50);
  return transformers;
}

async function getTransformersByRegion(region) {
  const transformers = await Transformer.find({
    'address.region': region,
    isActive: true,
    isApproved: true,
    isEmailVerified: true,
  }).sort('-businessStats.supplierRating');
  return transformers;
}

async function getTransformersByType(type) {
  const transformers = await Transformer.find({
    transformationType: type,
    isActive: true,
    isApproved: true,
    isEmailVerified: true,
  }).sort('-businessStats.supplierRating');
  return transformers;
}

async function getTransformer(id) {
  const transformer = await Transformer.findOne({
    _id: id,
    isActive: true,
    isEmailVerified: true,
  });
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  return transformer;
}

async function getPublicTransformer(id) {
  const transformer = await Transformer.findOne({
    _id: id,
    isActive: true,
    isApproved: true,
    isEmailVerified: true,
  });
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  return transformer;
}

async function getTransformerServices(transformerId) {
  const transformer = await Transformer.findById(transformerId).select('services');
  if (!transformer) {
    throw new Error('Transformateur non trouvé');
  }
  return transformer.services || {};
}

async function getTransformerReviews(transformerId) {
  const reviews = await Review.find({
    transformer: transformerId,
    status: 'approved'
  })
    .populate('consumer', 'firstName lastName')
    .sort('-createdAt')
    .limit(20);
  return reviews;
}

module.exports = {
  buildSearchQuery,
  buildAllTransformersQuery,
  getAllTransformers,
  searchTransformers,
  getTransformersByRegion,
  getTransformersByType,
  getTransformer,
  getPublicTransformer,
  getTransformerServices,
  getTransformerReviews
};

