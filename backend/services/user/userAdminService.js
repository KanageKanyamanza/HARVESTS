const User = require('../../models/User');
const Product = require('../../models/Product');
const Email = require('../../utils/email');

/**
 * Service pour l'administration des utilisateurs
 */

/**
 * Obtenir tous les utilisateurs avec filtres
 */
async function getAllUsers(queryParams = {}) {
  const queryObj = { ...queryParams };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);

  // Filtrage avancé
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let query = User.find(JSON.parse(queryStr));

  // Tri
  if (queryParams.sort) {
    const sortBy = queryParams.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Limitation des champs
  if (queryParams.fields) {
    const fields = queryParams.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  // Pagination
  const page = queryParams.page * 1 || 1;
  const limit = queryParams.limit * 1 || 100;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  const users = await query;
  const total = await User.countDocuments(JSON.parse(queryStr));

  return {
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Obtenir un utilisateur par ID
 */
async function getUserById(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('Aucun utilisateur trouvé avec cet ID');
  }

  // Filtrer les données utilisateur
  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    userType: user.userType,
    address: user.address,
    city: user.city,
    region: user.region,
    country: user.country,
    bio: user.bio,
    avatar: user.avatar,
    shopBanner: user.shopBanner,
    shopLogo: user.shopLogo,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    isActive: user.isActive,
    isApproved: user.isApproved,
    language: user.language,
    currency: user.currency,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

/**
 * Mettre à jour un utilisateur
 */
async function updateUser(userId, updateData) {
  if (updateData.password) {
    throw new Error('Cette route n\'est pas pour les mises à jour de mot de passe');
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new Error('Aucun utilisateur trouvé avec cet ID');
  }

  return user;
}

/**
 * Supprimer un utilisateur
 */
async function deleteUser(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('Aucun utilisateur trouvé avec cet ID');
  }

  // Supprimer tous les produits associés
  const deletedProducts = await Product.deleteMany({
    $or: [
      { producer: user._id },
      { transformer: user._id },
      { restaurateur: user._id }
    ]
  });

  // Supprimer l'utilisateur
  await User.findByIdAndDelete(userId);

  return {
    deletedProducts: deletedProducts.deletedCount
  };
}

/**
 * Approuver un compte utilisateur
 */
async function approveUser(userId) {
  const user = await User.findByIdAndUpdate(
    userId,
    { isApproved: true },
    { new: true }
  );

  if (!user) {
    throw new Error('Aucun utilisateur trouvé avec cet ID');
  }

  // Envoyer email de confirmation d'approbation
  try {
    await new Email(user).sendAccountApproval();
  } catch (err) {
    console.log('Erreur lors de l\'envoi de l\'email d\'approbation:', err);
  }

  return user;
}

/**
 * Rejeter un compte utilisateur
 */
async function rejectUser(userId, reason) {
  if (!reason) {
    throw new Error('Veuillez fournir une raison pour le rejet');
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { 
      isApproved: false,
      isActive: false,
      suspensionReason: reason
    },
    { new: true }
  );

  if (!user) {
    throw new Error('Aucun utilisateur trouvé avec cet ID');
  }

  // Envoyer email de notification de rejet
  try {
    await new Email(user).sendAccountRejection(reason);
  } catch (err) {
    console.log('Erreur lors de l\'envoi de l\'email de rejet:', err);
  }

  return user;
}

/**
 * Suspendre un compte utilisateur
 */
async function suspendUser(userId, reason, duration = null) {
  if (!reason) {
    throw new Error('Veuillez fournir une raison pour la suspension');
  }

  const suspendedUntil = duration ? 
    new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : 
    new Date('2099-12-31'); // Suspension indéfinie

  const user = await User.findByIdAndUpdate(
    userId,
    { 
      suspendedUntil,
      isActive: false,
      suspensionReason: reason
    },
    { new: true }
  );

  if (!user) {
    throw new Error('Aucun utilisateur trouvé avec cet ID');
  }

  return user;
}

/**
 * Réactiver un compte utilisateur
 */
async function reactivateUser(userId) {
  const user = await User.findByIdAndUpdate(
    userId,
    { 
      isActive: true,
      suspendedUntil: undefined,
      suspensionReason: undefined
    },
    { new: true }
  );

  if (!user) {
    throw new Error('Aucun utilisateur trouvé avec cet ID');
  }

  return user;
}

/**
 * Obtenir les statistiques communes
 */
async function getCommonStats(user) {
  const userModels = {
    producer: require('../../models/Producer'),
    transformer: require('../../models/Transformer'),
    restaurateur: require('../../models/Restaurateur')
  };

  const commonStats = {
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
    accountAge: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    lastLogin: user.lastLoginAt || user.createdAt,
    profileCompletion: calculateProfileCompletion(user),
    verificationStatus: {
      emailVerified: user.isEmailVerified,
      phoneVerified: user.isPhoneVerified,
      identityVerified: user.isIdentityVerified,
      businessVerified: user.isBusinessVerified
    }
  };

  // Ajouter des statistiques spécifiques selon le type d'utilisateur
  if (user.userType === 'producer' || user.userType === 'transformer' || user.userType === 'restaurateur') {
    const UserModel = userModels[user.userType];
    if (UserModel) {
      const profile = await UserModel.findOne({ user: user._id });
      if (profile) {
        commonStats.totalProducts = profile.products?.length || 0;
        commonStats.totalOrders = profile.orders?.length || 0;
        commonStats.totalRevenue = profile.totalRevenue || 0;
        commonStats.averageRating = profile.averageRating || 0;
        commonStats.totalReviews = profile.totalReviews || 0;
      }
    }
  }

  return commonStats;
}

// Fonction utilitaire pour calculer le pourcentage de complétion du profil
function calculateProfileCompletion(user) {
  let completion = 0;
  const fields = [
    'firstName', 'lastName', 'email', 'phone', 'address', 'city', 'region'
  ];
  
  fields.forEach(field => {
    if (user[field] && user[field] !== 'À compléter') {
      completion += 100 / fields.length;
    }
  });
  
  return Math.round(completion);
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  approveUser,
  rejectUser,
  suspendUser,
  reactivateUser,
  getCommonStats
};

