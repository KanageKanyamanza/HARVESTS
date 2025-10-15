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
  const upload = createUploadMiddleware('marketing', 'banner');
  upload(req, res, next);
};

// Middleware d'upload de logo
exports.uploadShopLogo = (req, res, next) => {
  const upload = createUploadMiddleware('profile', 'logo');
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
    'phone',
    'address',
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
    } else if (req.file.fieldname === 'banner') {
      filteredBody.shopBanner = imageUrl;
    } else if (req.file.fieldname === 'logo') {
      filteredBody.shopLogo = imageUrl;
    }
  }

  // 4) Mettre à jour le document utilisateur
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
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

  res.status(200).json({
    status: 'success',
    data: {
      user,
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
