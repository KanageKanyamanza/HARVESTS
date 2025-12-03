const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const consumerPreferencesService = require('../../services/consumer/consumerPreferencesService');

// Préférences de communication
exports.getCommunicationPreferences = catchAsync(async (req, res, next) => {
  try {
    const preferences = await consumerPreferencesService.getCommunicationPreferences(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { preferences }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateCommunicationPreferences = catchAsync(async (req, res, next) => {
  try {
    const preferences = await consumerPreferencesService.updateCommunicationPreferences(req.user.id, req.body);
    res.status(200).json({
      status: 'success',
      data: { preferences }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Gestion des préférences d'achat
exports.getShoppingPreferences = catchAsync(async (req, res, next) => {
  try {
    const shoppingPreferences = await consumerPreferencesService.getShoppingPreferences(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { shoppingPreferences }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateShoppingPreferences = catchAsync(async (req, res, next) => {
  try {
    const shoppingPreferences = await consumerPreferencesService.updateShoppingPreferences(req.user.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Préférences d\'achat mises à jour avec succès',
      data: { shoppingPreferences }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Gestion des préférences de notification
exports.getNotificationPreferences = catchAsync(async (req, res, next) => {
  try {
    const notificationPreferences = await consumerPreferencesService.getNotificationPreferences(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { notificationPreferences }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateNotificationPreferences = catchAsync(async (req, res, next) => {
  try {
    const notificationPreferences = await consumerPreferencesService.updateNotificationPreferences(req.user.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Préférences de notification mises à jour avec succès',
      data: { notificationPreferences }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

