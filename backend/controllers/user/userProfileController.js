const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const User = require('../../models/User');
const userProfileService = require('../../services/user/userProfileService');

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

  try {
    const filteredUser = await userProfileService.updateProfile(
      req.user.id,
      req.user.userType,
      req.body,
      req.file
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: filteredUser,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Suppression du compte de l'utilisateur actuel (libre-service), avec
// confirmation par mot de passe ou par saisie de l'email du compte
exports.deleteMe = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;

  if (!password && !email) {
    return next(
      new AppError(
        'Veuillez confirmer la suppression avec votre mot de passe ou votre email',
        400
      )
    );
  }

  const user = await User.findById(req.user.id).select('+password');

  if (password) {
    if (!(await user.comparePassword(password))) {
      return next(new AppError('Mot de passe incorrect', 401));
    }
  } else if (email.trim().toLowerCase() !== user.email.toLowerCase()) {
    return next(new AppError("L'email ne correspond pas à votre compte", 401));
  }

  try {
    await userProfileService.anonymizeAndDeleteAccount(req.user.id);

    res.status(200).json({
      status: 'success',
      message: 'Votre compte a été supprimé',
      data: null,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Gestion des adresses utilisateur
exports.getMyAddresses = catchAsync(async (req, res, next) => {
  try {
    const addresses = await userProfileService.getUserAddresses(req.user.id);

    res.status(200).json({
      status: 'success',
      results: addresses.length,
      data: {
        addresses,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.addAddress = catchAsync(async (req, res, next) => {
  try {
    const address = await userProfileService.addAddress(req.user.id, req.body);

    res.status(201).json({
      status: 'success',
      data: {
        address,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, error.message.includes('Seuls les consommateurs') ? 403 : 500));
  }
});

exports.updateAddress = catchAsync(async (req, res, next) => {
  try {
    const address = await userProfileService.updateAddress(req.user.id, req.params.addressId, req.body);

    res.status(200).json({
      status: 'success',
      data: {
        address,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, error.message.includes('non trouvé') ? 404 : 500));
  }
});

exports.deleteAddress = catchAsync(async (req, res, next) => {
  try {
    await userProfileService.deleteAddress(req.user.id, req.params.addressId);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    return next(new AppError(error.message, error.message.includes('non trouvé') ? 404 : 500));
  }
});

