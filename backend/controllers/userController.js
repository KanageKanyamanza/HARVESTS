const multer = require('multer');
const { createDynamicStorage } = require('../config/cloudinary');
const User = require('../models/User');
const Producer = require('../models/Producer');
const Transformer = require('../models/Transformer');
const Consumer = require('../models/Consumer');
const Restaurateur = require('../models/Restaurateur');
const Exporter = require('../models/Exporter');
const Transporter = require('../models/Transporter');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

// Mapping des modèles par type d'utilisateur
const userModels = {
  producer: Producer,
  transformer: Transformer,
  consumer: Consumer,
  restaurateur: Restaurateur,
  exporter: Exporter,
  transporter: Transporter
};

// Configuration Multer pour upload d'images utilisateur
const createUploadMiddleware = (contentType, fieldName = 'avatar') => {
  return (req, res, next) => {
    const userType = req.user?.userType || 'consumer';
    const storage = createDynamicStorage(userType, contentType);
    const upload = multer({
      storage: storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
          cb(null, true);
        } else {
          cb(new AppError('Veuillez télécharger uniquement des images!', 400), false);
        }
      }
    });
    upload.single(fieldName)(req, res, next);
  };
};

// Middleware d'upload d'avatar
exports.uploadUserPhoto = (req, res, next) => {
  const upload = createUploadMiddleware('profile', 'avatar');
  upload(req, res, next);
};

// Middleware d'upload de bannière
exports.uploadShopBanner = (req, res, next) => {
  const upload = createUploadMiddleware('marketing', 'shopBanner');
  upload(req, res, next);
};

// Middleware d'upload de logo
exports.uploadShopLogo = (req, res, next) => {
  const upload = createUploadMiddleware('profile', 'shopLogo');
  upload(req, res, next);
};

// Traitement après upload
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  
  // L'image est déjà traitée par Cloudinary
  // On peut ajouter des transformations supplémentaires ici si nécessaire
  next();
});

// Fonction utilitaire pour filtrer les champs autorisés
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Middleware pour récupérer l'utilisateur actuel
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Mettre à jour les données de l'utilisateur actuel
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Créer une erreur si l'utilisateur tente de changer le mot de passe
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Cette route n\'est pas pour les mises à jour de mot de passe. Veuillez utiliser /update-password.',
        400
      )
    );
  }

  // 2) Filtrer les champs qui ne sont pas autorisés à être mis à jour
  const filteredBody = filterObj(
    req.body,
    'firstName',
    'lastName',
    'companyName',
    'farmName',
    'restaurantName',
    'phone',
    'address',
    'city',
    'region',
    'bio',
    'language',
    'preferredLanguage',
    'country',
    'currency',
    'notifications',
    'avatar',
    'shopBanner',
    'shopLogo'
  );

  // 3) Ajouter l'image si téléchargée (Cloudinary)
  if (req.file) {
    // req.file.path contient l'URL Cloudinary
    const imageUrl = req.file.path;
    
    // Déterminer le type d'image selon le champ name
    if (req.file.fieldname === 'avatar') {
      filteredBody.avatar = imageUrl;
    } else if (req.file.fieldname === 'shopBanner') {
      filteredBody.shopBanner = imageUrl;
    } else if (req.file.fieldname === 'shopLogo') {
      filteredBody.shopLogo = imageUrl;
    }
  }

  // 4) Mettre à jour le document utilisateur
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('Utilisateur non trouvé', 404));
  }

  // Mettre à jour les champs autorisés
  Object.keys(filteredBody).forEach(key => {
    user[key] = filteredBody[key];
  });

  const updatedUser = await user.save();

  // Filtrer les données utilisateur pour ne retourner que les champs nécessaires
  const filteredUser = {
    _id: updatedUser._id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    email: updatedUser.email,
    phone: updatedUser.phone,
    userType: updatedUser.userType,
    address: updatedUser.address,
    city: updatedUser.city,
    region: updatedUser.region,
    country: updatedUser.country,
    bio: updatedUser.bio,
    avatar: updatedUser.avatar,
    shopBanner: updatedUser.shopBanner,
    shopLogo: updatedUser.shopLogo,
    isEmailVerified: updatedUser.isEmailVerified,
    isPhoneVerified: updatedUser.isPhoneVerified,
    isActive: updatedUser.isActive,
    isApproved: updatedUser.isApproved,
    language: updatedUser.language,
    currency: updatedUser.currency,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt
  };

  res.status(200).json({
    status: 'success',
    data: {
      user: filteredUser,
    },
  });
});

// Désactiver le compte de l'utilisateur actuel
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { isActive: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Gestion des adresses utilisateur
exports.getMyAddresses = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  let addresses = [user.address]; // Adresse principale
  
  // Ajouter les adresses de livraison pour les consommateurs
  if (user.userType === 'consumer' && user.deliveryAddresses) {
    addresses = [...addresses, ...user.deliveryAddresses];
  }

  res.status(200).json({
    status: 'success',
    results: addresses.length,
    data: {
      addresses,
    },
  });
});

exports.addAddress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (user.userType !== 'consumer') {
    return next(new AppError('Seuls les consommateurs peuvent ajouter plusieurs adresses', 403));
  }

  const consumer = await Consumer.findById(req.user.id);
  
  // Vérifier s'il faut définir comme adresse par défaut
  const isFirstAddress = !consumer.deliveryAddresses || consumer.deliveryAddresses.length === 0;
  
  const newAddress = {
    ...req.body,
    isDefault: req.body.isDefault || isFirstAddress
  };

  // Si c'est la nouvelle adresse par défaut, désactiver les autres
  if (newAddress.isDefault) {
    consumer.deliveryAddresses?.forEach(addr => addr.isDefault = false);
  }

  consumer.deliveryAddresses.push(newAddress);
  await consumer.save();

  res.status(201).json({
    status: 'success',
    data: {
      address: newAddress,
    },
  });
});

exports.updateAddress = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  
  if (!consumer) {
    return next(new AppError('Utilisateur non trouvé', 404));
  }

  const address = consumer.deliveryAddresses.id(req.params.addressId);
  
  if (!address) {
    return next(new AppError('Adresse non trouvée', 404));
  }

  // Mettre à jour les champs
  Object.keys(req.body).forEach(key => {
    address[key] = req.body[key];
  });

  // Si c'est la nouvelle adresse par défaut, désactiver les autres
  if (req.body.isDefault) {
    consumer.deliveryAddresses.forEach(addr => {
      if (addr.id !== req.params.addressId) addr.isDefault = false;
    });
  }

  await consumer.save();

  res.status(200).json({
    status: 'success',
    data: {
      address,
    },
  });
});

exports.deleteAddress = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  
  if (!consumer) {
    return next(new AppError('Utilisateur non trouvé', 404));
  }

  const address = consumer.deliveryAddresses.id(req.params.addressId);
  
  if (!address) {
    return next(new AppError('Adresse non trouvée', 404));
  }

  // Ne pas permettre la suppression si c'est la seule adresse
  if (consumer.deliveryAddresses.length === 1) {
    return next(new AppError('Vous devez avoir au moins une adresse', 400));
  }

  // Si c'était l'adresse par défaut, définir une autre comme par défaut
  if (address.isDefault && consumer.deliveryAddresses.length > 1) {
    const otherAddress = consumer.deliveryAddresses.find(addr => addr.id !== req.params.addressId);
    if (otherAddress) otherAddress.isDefault = true;
  }

  consumer.deliveryAddresses.pull(req.params.addressId);
  await consumer.save();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// ROUTES ADMIN SEULEMENT

// Obtenir tous les utilisateurs (admin seulement)
exports.getAllUsers = catchAsync(async (req, res, next) => {
  // Construire la requête
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);

  // Filtrage avancé
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let query = User.find(JSON.parse(queryStr));

  // Tri
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Limitation des champs
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  // Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  // Exécuter la requête
  const users = await query;
  const total = await User.countDocuments(JSON.parse(queryStr));

  res.status(200).json({
    status: 'success',
    results: users.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      users,
    },
  });
});

// Obtenir un utilisateur par ID (admin seulement)
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('Aucun utilisateur trouvé avec cet ID', 404));
  }

  // Filtrer les données utilisateur pour ne retourner que les champs nécessaires
  const filteredUser = {
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

  res.status(200).json({
    status: 'success',
    data: {
      user: filteredUser,
    },
  });
});

// Créer un utilisateur (admin seulement) - Ne pas utiliser en production
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Cette route n\'est pas définie! Veuillez utiliser /signup à la place',
  });
};

// Mettre à jour un utilisateur (admin seulement)
exports.updateUser = catchAsync(async (req, res, next) => {
  // Ne pas permettre la mise à jour du mot de passe via cette route
  if (req.body.password) {
    return next(new AppError('Cette route n\'est pas pour les mises à jour de mot de passe', 400));
  }

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('Aucun utilisateur trouvé avec cet ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// Supprimer un utilisateur (admin seulement)
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('Aucun utilisateur trouvé avec cet ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Approuver un compte utilisateur (admin seulement)
exports.approveUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  );

  if (!user) {
    return next(new AppError('Aucun utilisateur trouvé avec cet ID', 404));
  }

  // Envoyer email de confirmation d'approbation
  try {
    await new Email(user).sendAccountApproval();
  } catch (err) {
    console.log('Erreur lors de l\'envoi de l\'email d\'approbation:', err);
  }

  res.status(200).json({
    status: 'success',
    message: 'Compte approuvé avec succès',
    data: {
      user,
    },
  });
});

// Rejeter un compte utilisateur (admin seulement)
exports.rejectUser = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  
  if (!reason) {
    return next(new AppError('Veuillez fournir une raison pour le rejet', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { 
      isApproved: false,
      isActive: false,
      suspensionReason: reason
    },
    { new: true }
  );

  if (!user) {
    return next(new AppError('Aucun utilisateur trouvé avec cet ID', 404));
  }

  // Envoyer email de notification de rejet
  try {
    await new Email(user).sendAccountRejection(reason);
  } catch (err) {
    console.log('Erreur lors de l\'envoi de l\'email de rejet:', err);
  }

  res.status(200).json({
    status: 'success',
    message: 'Compte rejeté avec succès',
    data: {
      user,
    },
  });
});

// Suspendre un compte utilisateur (admin seulement)
exports.suspendUser = catchAsync(async (req, res, next) => {
  const { reason, duration } = req.body; // duration en jours
  
  if (!reason) {
    return next(new AppError('Veuillez fournir une raison pour la suspension', 400));
  }

  const suspendedUntil = duration ? 
    new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : 
    new Date('2099-12-31'); // Suspension indéfinie

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { 
      suspendedUntil,
      suspensionReason: reason
    },
    { new: true }
  );

  if (!user) {
    return next(new AppError('Aucun utilisateur trouvé avec cet ID', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Compte suspendu avec succès',
    data: {
      user,
    },
  });
});

// Réactiver un compte utilisateur (admin seulement)
exports.reactivateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { 
      isActive: true,
      suspendedUntil: undefined,
      suspensionReason: undefined
    },
    { new: true }
  );

  if (!user) {
    return next(new AppError('Aucun utilisateur trouvé avec cet ID', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Compte réactivé avec succès',
    data: {
      user,
    },
  });
});

// ========================================
// MÉTHODES COMMUNES POUR TOUS LES UTILISATEURS
// ========================================

// Obtenir les statistiques communes
exports.getCommonStats = catchAsync(async (req, res, next) => {
  const user = req.user;
  
  // Statistiques de base communes à tous les utilisateurs
  const commonStats = {
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
    accountAge: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)), // en jours
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
    // Pour les vendeurs, ajouter des statistiques de vente
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

  res.status(200).json({
    status: 'success',
    data: commonStats
  });
});

// Obtenir les informations financières
exports.getFinancialInfo = catchAsync(async (req, res, next) => {
  const user = req.user;
  
  const financialInfo = {
    bankAccount: user.bankAccount || null,
    paymentMethods: user.paymentMethods || [],
    totalEarnings: user.totalEarnings || 0,
    pendingPayments: user.pendingPayments || 0,
    totalWithdrawals: user.totalWithdrawals || 0,
    currency: user.currency || 'XAF',
    taxInfo: user.taxInfo || null
  };

  res.status(200).json({
    status: 'success',
    data: financialInfo
  });
});

// Obtenir les paramètres de notification
exports.getNotificationSettings = catchAsync(async (req, res, next) => {
  const user = req.user;
  
  const notificationSettings = {
    email: user.notificationSettings?.email || {
      orders: true,
      payments: true,
      promotions: true,
      updates: true
    },
    push: user.notificationSettings?.push || {
      orders: true,
      payments: true,
      promotions: false,
      updates: true
    },
    sms: user.notificationSettings?.sms || {
      orders: false,
      payments: true,
      promotions: false,
      updates: false
    },
    frequency: user.notificationSettings?.frequency || 'immediate'
  };

  res.status(200).json({
    status: 'success',
    data: notificationSettings
  });
});

// Obtenir le statut de vérification
exports.getVerificationStatus = catchAsync(async (req, res, next) => {
  const user = req.user;
  
  const verificationStatus = {
    email: {
      verified: user.isEmailVerified,
      verifiedAt: user.emailVerifiedAt,
      pending: !user.isEmailVerified
    },
    phone: {
      verified: user.isPhoneVerified,
      verifiedAt: user.phoneVerifiedAt,
      pending: !user.isPhoneVerified
    },
    identity: {
      verified: user.isIdentityVerified,
      verifiedAt: user.identityVerifiedAt,
      pending: !user.isIdentityVerified,
      documents: user.identityDocuments || []
    },
    business: {
      verified: user.isBusinessVerified,
      verifiedAt: user.businessVerifiedAt,
      pending: !user.isBusinessVerified,
      documents: user.businessDocuments || []
    },
    overall: {
      verified: user.isEmailVerified && user.isPhoneVerified,
      level: calculateVerificationLevel(user)
    }
  };

  res.status(200).json({
    status: 'success',
    data: verificationStatus
  });
});

// Obtenir les adresses de livraison
exports.getDeliveryAddresses = catchAsync(async (req, res, next) => {
  const user = req.user;
  
  const deliveryAddresses = user.deliveryAddresses || [];
  
  res.status(200).json({
    status: 'success',
    data: deliveryAddresses
  });
});

// Mettre à jour les informations financières
exports.updateFinancialInfo = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { bankAccount, paymentMethods, currency, taxInfo } = req.body;
  
  const updateData = {};
  if (bankAccount) updateData.bankAccount = bankAccount;
  if (paymentMethods) updateData.paymentMethods = paymentMethods;
  if (currency) updateData.currency = currency;
  if (taxInfo) updateData.taxInfo = taxInfo;
  
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    updateData,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    status: 'success',
    message: 'Informations financières mises à jour avec succès',
    data: {
      user: updatedUser
    }
  });
});

// Mettre à jour les paramètres de notification
exports.updateNotificationSettings = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { email, push, sms, frequency } = req.body;
  
  const notificationSettings = {
    email: email || user.notificationSettings?.email,
    push: push || user.notificationSettings?.push,
    sms: sms || user.notificationSettings?.sms,
    frequency: frequency || user.notificationSettings?.frequency
  };
  
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { notificationSettings },
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    status: 'success',
    message: 'Paramètres de notification mis à jour avec succès',
    data: {
      user: updatedUser
    }
  });
});

// Ajouter une adresse de livraison
exports.addDeliveryAddress = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { name, address, city, region, country, postalCode, phone, isDefault } = req.body;
  
  const newAddress = {
    name,
    address,
    city,
    region,
    country,
    postalCode,
    phone,
    isDefault: isDefault || false
  };
  
  // Si c'est l'adresse par défaut, désactiver les autres
  if (isDefault) {
    await User.updateMany(
      { _id: user._id, 'deliveryAddresses.isDefault': true },
      { $set: { 'deliveryAddresses.$.isDefault': false } }
    );
  }
  
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { $push: { deliveryAddresses: newAddress } },
    { new: true, runValidators: true }
  );
  
  res.status(201).json({
    status: 'success',
    message: 'Adresse de livraison ajoutée avec succès',
    data: {
      user: updatedUser
    }
  });
});

// Mettre à jour une adresse de livraison
exports.updateDeliveryAddress = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { addressId } = req.params;
  const updateData = req.body;
  
  // Si c'est l'adresse par défaut, désactiver les autres
  if (updateData.isDefault) {
    await User.updateMany(
      { _id: user._id, 'deliveryAddresses.isDefault': true },
      { $set: { 'deliveryAddresses.$.isDefault': false } }
    );
  }
  
  const updatedUser = await User.findOneAndUpdate(
    { _id: user._id, 'deliveryAddresses._id': addressId },
    { $set: { 'deliveryAddresses.$': { ...updateData, _id: addressId } } },
    { new: true, runValidators: true }
  );
  
  if (!updatedUser) {
    return next(new AppError('Adresse de livraison non trouvée', 404));
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Adresse de livraison mise à jour avec succès',
    data: {
      user: updatedUser
    }
  });
});

// Supprimer une adresse de livraison
exports.deleteDeliveryAddress = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { addressId } = req.params;
  
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { $pull: { deliveryAddresses: { _id: addressId } } },
    { new: true, runValidators: true }
  );
  
  if (!updatedUser) {
    return next(new AppError('Adresse de livraison non trouvée', 404));
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Adresse de livraison supprimée avec succès',
    data: {
      user: updatedUser
    }
  });
});

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

// Calculer le pourcentage de complétion du profil
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

// Calculer le niveau de vérification
function calculateVerificationLevel(user) {
  let level = 0;
  if (user.isEmailVerified) level += 1;
  if (user.isPhoneVerified) level += 1;
  if (user.isIdentityVerified) level += 1;
  if (user.isBusinessVerified) level += 1;
  
  const levels = ['Non vérifié', 'Basique', 'Standard', 'Avancé', 'Complet'];
  return levels[level] || 'Non vérifié';
}
