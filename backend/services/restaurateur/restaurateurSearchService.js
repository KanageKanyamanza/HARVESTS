const Restaurateur = require('../../models/Restaurateur');

/**
 * Service pour la recherche de restaurateurs (routes publiques)
 */

// Construire une requête pour getAllRestaurateurs
function buildAllRestaurateursQuery(queryParams) {
  const queryObj = { ...queryParams };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  return JSON.parse(queryStr);
}

function buildSearchQuery(queryParams) {
  const { q, region, restaurantType, cuisineType } = queryParams;
  let searchQuery = { isActive: true, isApproved: true, isEmailVerified: true };

  if (q) {
    searchQuery.$or = [
      { restaurantName: { $regex: q, $options: 'i' } },
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } }
    ];
  }

  if (region) searchQuery['address.region'] = region;
  if (restaurantType) searchQuery.restaurantType = restaurantType;
  if (cuisineType) searchQuery.cuisineTypes = cuisineType;

  return searchQuery;
}

async function getAllRestaurateurs(queryParams) {
  const queryObj = buildAllRestaurateursQuery(queryParams);
  const page = queryParams.page * 1 || 1;
  const limit = queryParams.limit * 1 || 20;
  const skip = (page - 1) * limit;

  let query = Restaurateur.find(queryObj);
  if (queryParams.sort) {
    query = query.sort(queryParams.sort.split(',').join(' '));
  } else {
    query = query.sort('-businessStats.supplierRating -createdAt');
  }
  query = query.skip(skip).limit(limit);

  const restaurateurs = await query;
  const total = await Restaurateur.countDocuments(queryObj);

  return { restaurateurs, total, page, totalPages: Math.ceil(total / limit) };
}

async function searchRestaurateurs(queryParams) {
  const searchQuery = buildSearchQuery(queryParams);
  const restaurateurs = await Restaurateur.find(searchQuery)
    .sort('-businessStats.supplierRating')
    .limit(50);
  return restaurateurs;
}

async function getRestaurateursByRegion(region) {
  const restaurateurs = await Restaurateur.find({
    'address.region': region,
    isActive: true, isApproved: true, isEmailVerified: true,
  }).sort('-businessStats.supplierRating');
  return restaurateurs;
}

async function getRestaurateur(id) {
  const restaurateur = await Restaurateur.findOne({
    _id: id,
    isActive: true, isEmailVerified: true,
  });
  if (!restaurateur) {
    throw new Error('Restaurateur non trouvé');
  }
  return restaurateur;
}

module.exports = {
  buildAllRestaurateursQuery,
  buildSearchQuery,
  getAllRestaurateurs,
  searchRestaurateurs,
  getRestaurateursByRegion,
  getRestaurateur
};

