const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const consumerProfileService = require('../../services/consumer/consumerProfileService');
const consumerPreferencesService = require('../../services/consumer/consumerPreferencesService');
const consumerAllergyService = require('../../services/consumer/consumerAllergyService');

// Obtenir mon profil
exports.getMyProfile = catchAsync(async (req, res, next) => {
  try {
    const consumer = await consumerProfileService.getConsumerProfile(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { consumer }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Mettre à jour mon profil
exports.updateMyProfile = catchAsync(async (req, res, next) => {
  try {
    const consumer = await consumerProfileService.updateConsumerProfile(req.user.id, req.body);
    res.status(200).json({
      status: 'success',
      data: { consumer }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Gestion des préférences alimentaires
exports.getDietaryPreferences = catchAsync(async (req, res, next) => {
  try {
    const dietaryPreferences = await consumerPreferencesService.getDietaryPreferences(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { dietaryPreferences }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateDietaryPreferences = catchAsync(async (req, res, next) => {
  try {
    const dietaryPreferences = await consumerPreferencesService.updateDietaryPreferences(req.user.id, req.body.dietaryPreferences);
    res.status(200).json({
      status: 'success',
      data: { dietaryPreferences }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Gestion des allergies
exports.getAllergies = catchAsync(async (req, res, next) => {
  try {
    const allergies = await consumerAllergyService.getAllergies(req.user.id);
    res.status(200).json({
      status: 'success',
      results: allergies.length,
      data: { allergies }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.addAllergy = catchAsync(async (req, res, next) => {
  try {
    const allergy = await consumerAllergyService.addAllergy(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      data: { allergy }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateAllergy = catchAsync(async (req, res, next) => {
  try {
    const allergy = await consumerAllergyService.updateAllergy(req.user.id, req.params.allergyId, req.body);
    res.status(200).json({
      status: 'success',
      data: { allergy }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.removeAllergy = catchAsync(async (req, res, next) => {
  try {
    await consumerAllergyService.removeAllergy(req.user.id, req.params.allergyId);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

