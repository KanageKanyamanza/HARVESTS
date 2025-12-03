const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const userSettingsService = require('../../services/user/userSettingsService');

// Obtenir les informations financières
exports.getFinancialInfo = catchAsync(async (req, res, next) => {
  try {
    const financialInfo = await userSettingsService.getFinancialInfo(req.user.id);

    res.status(200).json({
      status: 'success',
      data: financialInfo
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Mettre à jour les informations financières
exports.updateFinancialInfo = catchAsync(async (req, res, next) => {
  try {
    const updatedUser = await userSettingsService.updateFinancialInfo(req.user.id, req.body);

    res.status(200).json({
      status: 'success',
      message: 'Informations financières mises à jour avec succès',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Obtenir les paramètres de notification
exports.getNotificationSettings = catchAsync(async (req, res, next) => {
  try {
    const notificationSettings = await userSettingsService.getNotificationSettings(req.user.id);

    res.status(200).json({
      status: 'success',
      data: notificationSettings
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Mettre à jour les paramètres de notification
exports.updateNotificationSettings = catchAsync(async (req, res, next) => {
  try {
    const updatedUser = await userSettingsService.updateNotificationSettings(req.user.id, req.body);

    res.status(200).json({
      status: 'success',
      message: 'Paramètres de notification mis à jour avec succès',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Obtenir le statut de vérification
exports.getVerificationStatus = catchAsync(async (req, res, next) => {
  try {
    const verificationStatus = await userSettingsService.getVerificationStatus(req.user.id);

    res.status(200).json({
      status: 'success',
      data: verificationStatus
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Obtenir les adresses de livraison
exports.getDeliveryAddresses = catchAsync(async (req, res, next) => {
  try {
    const deliveryAddresses = await userSettingsService.getDeliveryAddresses(req.user.id);

    res.status(200).json({
      status: 'success',
      data: deliveryAddresses
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Ajouter une adresse de livraison
exports.addDeliveryAddress = catchAsync(async (req, res, next) => {
  try {
    const updatedUser = await userSettingsService.addDeliveryAddress(req.user.id, req.body);

    res.status(201).json({
      status: 'success',
      message: 'Adresse de livraison ajoutée avec succès',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Mettre à jour une adresse de livraison
exports.updateDeliveryAddress = catchAsync(async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const updatedUser = await userSettingsService.updateDeliveryAddress(req.user.id, addressId, req.body);

    res.status(200).json({
      status: 'success',
      message: 'Adresse de livraison mise à jour avec succès',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    return next(new AppError(error.message, error.message.includes('non trouvée') ? 404 : 500));
  }
});

// Supprimer une adresse de livraison
exports.deleteDeliveryAddress = catchAsync(async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const updatedUser = await userSettingsService.deleteDeliveryAddress(req.user.id, addressId);

    res.status(200).json({
      status: 'success',
      message: 'Adresse de livraison supprimée avec succès',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    return next(new AppError(error.message, error.message.includes('non trouvée') ? 404 : 500));
  }
});

