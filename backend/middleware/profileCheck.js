const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Middleware pour vérifier si le profil utilisateur est complet
 * Redirige vers la page de complétion de profil si nécessaire
 */
exports.requireCompleteProfile = catchAsync(async (req, res, next) => {
  const user = req.user;
  
  // Vérifier si le profil est marqué comme complet
  if (!user.isProfileComplete) {
    return res.status(200).json({
      status: 'profile_incomplete',
      message: 'Veuillez compléter votre profil pour accéder à cette fonctionnalité',
      data: {
        user: {
          id: user._id,
          userType: user.userType,
          isProfileComplete: user.isProfileComplete,
          missingFields: getMissingFields(user)
        }
      }
    });
  }
  
  next();
});

/**
 * Middleware optionnel - avertit mais n'empêche pas l'accès
 */
exports.checkProfileCompleteness = catchAsync(async (req, res, next) => {
  const user = req.user;
  
  if (!user.isProfileComplete) {
    // Ajouter un header d'avertissement
    res.set('X-Profile-Status', 'incomplete');
    res.set('X-Profile-Missing-Fields', getMissingFields(user).join(','));
  }
  
  next();
});

/**
 * Fonction pour déterminer les champs manquants selon le type d'utilisateur
 */
const getMissingFields = (user) => {
  const missingFields = [];
  
  // Champs communs
  if (!user.address || user.address.street === 'À compléter') {
    missingFields.push('address');
  }
  
  // Champs spécifiques selon le type
  switch (user.userType) {
    case 'producer':
      if (!user.farmInfo || !user.farmInfo.farmName) {
        missingFields.push('farmInfo');
      }
      if (!user.certifications || user.certifications.length === 0) {
        missingFields.push('certifications');
      }
      break;
      
    case 'transformer':
      if (!user.businessInfo || !user.businessInfo.companyName) {
        missingFields.push('businessInfo');
      }
      if (!user.equipment || user.equipment.length === 0) {
        missingFields.push('equipment');
      }
      break;
      
    case 'restaurateur':
      if (!user.restaurantInfo || !user.restaurantInfo.restaurantName) {
        missingFields.push('restaurantInfo');
      }
      if (!user.menuCategories || user.menuCategories.length === 0) {
        missingFields.push('menuCategories');
      }
      break;
      
    case 'exporter':
      if (!user.businessInfo || !user.businessInfo.companyName) {
        missingFields.push('businessInfo');
      }
      if (!user.exportCertifications || user.exportCertifications.length === 0) {
        missingFields.push('exportCertifications');
      }
      break;
      
    case 'transporter':
      if (!user.businessInfo || !user.businessInfo.companyName) {
        missingFields.push('businessInfo');
      }
      if (!user.fleet || user.fleet.length === 0) {
        missingFields.push('fleet');
      }
      break;
      
    case 'consumer':
      // Les consommateurs n'ont pas de champs obligatoires supplémentaires
      break;
      
    default:
      break;
  }
  
  return missingFields;
};

/**
 * Fonction pour marquer un profil comme complet
 */
exports.markProfileComplete = catchAsync(async (req, res, next) => {
  const user = req.user;
  const missingFields = getMissingFields(user);
  
  if (missingFields.length === 0) {
    user.isProfileComplete = true;
    await user.save({ validateBeforeSave: false });
    
    return res.status(200).json({
      status: 'success',
      message: 'Profil marqué comme complet',
      data: {
        user: {
          id: user._id,
          isProfileComplete: user.isProfileComplete
        }
      }
    });
  } else {
    return res.status(400).json({
      status: 'error',
      message: 'Le profil n\'est pas encore complet',
      data: {
        missingFields
      }
    });
  }
});

module.exports = {
  requireCompleteProfile: exports.requireCompleteProfile,
  checkProfileCompleteness: exports.checkProfileCompleteness,
  markProfileComplete: exports.markProfileComplete,
  getMissingFields
};
