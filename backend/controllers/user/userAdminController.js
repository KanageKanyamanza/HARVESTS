const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const userAdminService = require('../../services/user/userAdminService');

// Obtenir tous les utilisateurs (admin seulement)
exports.getAllUsers = catchAsync(async (req, res, next) => {
  try {
    const result = await userAdminService.getAllUsers(req.query);

    res.status(200).json({
      status: 'success',
      results: result.users.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: {
        users: result.users,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// Obtenir un utilisateur par ID (admin seulement)
exports.getUser = catchAsync(async (req, res, next) => {
  try {
    const user = await userAdminService.getUserById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
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
  try {
    const user = await userAdminService.updateUser(req.params.id, req.body);

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, error.message.includes('non trouvé') ? 404 : 400));
  }
});

// Supprimer un utilisateur (admin seulement)
exports.deleteUser = catchAsync(async (req, res, next) => {
  try {
    const result = await userAdminService.deleteUser(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
      message: `Utilisateur et ${result.deletedProducts} produit(s) supprimé(s) avec succès`
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Approuver un compte utilisateur (admin seulement)
exports.approveUser = catchAsync(async (req, res, next) => {
  try {
    const user = await userAdminService.approveUser(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Compte approuvé avec succès',
      data: {
        user,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Rejeter un compte utilisateur (admin seulement)
exports.rejectUser = catchAsync(async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await userAdminService.rejectUser(req.params.id, reason);

    res.status(200).json({
      status: 'success',
      message: 'Compte rejeté avec succès',
      data: {
        user,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, error.message.includes('fournir') ? 400 : 404));
  }
});

// Suspendre un compte utilisateur (admin seulement)
exports.suspendUser = catchAsync(async (req, res, next) => {
  try {
    const { reason, duration } = req.body;
    const user = await userAdminService.suspendUser(req.params.id, reason, duration);

    res.status(200).json({
      status: 'success',
      message: 'Compte suspendu avec succès',
      data: {
        user,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, error.message.includes('fournir') ? 400 : 404));
  }
});

// Réactiver un compte utilisateur (admin seulement)
exports.reactivateUser = catchAsync(async (req, res, next) => {
  try {
    const user = await userAdminService.reactivateUser(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Compte réactivé avec succès',
      data: {
        user,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Obtenir les statistiques communes
exports.getCommonStats = catchAsync(async (req, res, next) => {
  try {
    const commonStats = await userAdminService.getCommonStats(req.user);

    res.status(200).json({
      status: 'success',
      data: commonStats
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

