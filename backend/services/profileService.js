const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Modèles disponibles
const User = require('../models/User');
const Producer = require('../models/Producer');
const Transformer = require('../models/Transformer');
const Consumer = require('../models/Consumer');
const Restaurateur = require('../models/Restaurateur');
const Exporter = require('../models/Exporter');
const Transporter = require('../models/Transporter');

// Mapping des modèles par type d'utilisateur
const MODELS = {
  producer: Producer,
  transformer: Transformer,
  consumer: Consumer,
  restaurateur: Restaurateur,
  exporter: Exporter,
  transporter: Transporter
};

// Champs communs autorisés pour la mise à jour
const COMMON_ALLOWED_FIELDS = [
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
];

// Fonction utilitaire pour filtrer les champs autorisés
const filterAllowedFields = (body, allowedFields = COMMON_ALLOWED_FIELDS) => {
  const filteredBody = {};
  Object.keys(body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = body[key];
    }
  });
  return filteredBody;
};

// Service pour obtenir le profil complet d'un utilisateur
exports.getProfile = catchAsync(async (req, res, next) => {
  const userType = req.user.userType;
  const Model = MODELS[userType];
  
  if (!Model) {
    return next(new AppError('Type d\'utilisateur invalide', 400));
  }
  
  const profile = await Model.findById(req.user.id);
  
  if (!profile) {
    return next(new AppError('Profil non trouvé', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: { profile }
  });
});

// Service pour mettre à jour le profil
exports.updateProfile = catchAsync(async (req, res, next) => {
  const userType = req.user.userType;
  const Model = MODELS[userType];
  
  if (!Model) {
    return next(new AppError('Type d\'utilisateur invalide', 400));
  }
  
  // Filtrer les champs autorisés
  const filteredBody = filterAllowedFields(req.body);
  
  // Ajouter l'image si uploadée
  if (req.file) {
    const imageUrl = req.file.path;
    const fieldName = req.file.fieldname;
    
    // Mapper les noms de champs (compatible avec l'ancien système)
    switch (fieldName) {
      case 'avatar':
        filteredBody.avatar = imageUrl;
        break;
      case 'shopBanner':
        filteredBody.shopBanner = imageUrl;
        break;
      case 'shopLogo':
        filteredBody.shopLogo = imageUrl;
        break;
      case 'banner': // Fallback pour les nouveaux champs
        filteredBody.shopBanner = imageUrl;
        break;
      case 'logo': // Fallback pour les nouveaux champs
        filteredBody.shopLogo = imageUrl;
        break;
    }
  }
  
  // Mettre à jour le profil
  const updatedProfile = await Model.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    status: 'success',
    data: { 
      profile: updatedProfile,
      message: 'Profil mis à jour avec succès'
    }
  });
});

// Service pour supprimer une image de profil
exports.deleteProfileImage = catchAsync(async (req, res, next) => {
  const { imageType } = req.params;
  const userType = req.user.userType;
  const Model = MODELS[userType];
  
  if (!Model) {
    return next(new AppError('Type d\'utilisateur invalide', 400));
  }
  
  const updateData = {};
  switch (imageType) {
    case 'avatar':
      updateData.avatar = null;
      break;
    case 'banner':
      updateData.shopBanner = null;
      break;
    case 'logo':
      updateData.shopLogo = null;
      break;
    default:
      return next(new AppError('Type d\'image invalide', 400));
  }
  
  const updatedProfile = await Model.findByIdAndUpdate(
    req.user.id,
    updateData,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    status: 'success',
    data: { 
      profile: updatedProfile,
      message: 'Image supprimée avec succès'
    }
  });
});

// Service pour obtenir les statistiques communes
exports.getCommonStats = catchAsync(async (req, res, next) => {
  const userType = req.user.userType;
  const Model = MODELS[userType];
  
  if (!Model) {
    return next(new AppError('Type d\'utilisateur invalide', 400));
  }
  
  const profile = await Model.findById(req.user.id).select('businessStats supplierRating');
  
  if (!profile) {
    return next(new AppError('Profil non trouvé', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: { 
      stats: profile.businessStats || {},
      supplierRating: profile.supplierRating || 0
    }
  });
});

// Service pour mettre à jour les préférences de notification
exports.updateNotificationPreferences = catchAsync(async (req, res, next) => {
  const userType = req.user.userType;
  const Model = MODELS[userType];
  
  if (!Model) {
    return next(new AppError('Type d\'utilisateur invalide', 400));
  }
  
  const { notifications } = req.body;
  
  if (!notifications || typeof notifications !== 'object') {
    return next(new AppError('Préférences de notification invalides', 400));
  }
  
  const updatedProfile = await Model.findByIdAndUpdate(
    req.user.id,
    { notifications },
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    status: 'success',
    data: { 
      profile: updatedProfile,
      message: 'Préférences de notification mises à jour'
    }
  });
});

module.exports = {
  getProfile: exports.getProfile,
  updateProfile: exports.updateProfile,
  deleteProfileImage: exports.deleteProfileImage,
  getCommonStats: exports.getCommonStats,
  updateNotificationPreferences: exports.updateNotificationPreferences,
  filterAllowedFields,
  COMMON_ALLOWED_FIELDS
};
