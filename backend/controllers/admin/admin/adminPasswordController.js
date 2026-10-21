const Admin = require('../../../models/Admin');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

// @desc    Changer le mot de passe de l'administrateur connecté
// @route   PUT /api/v1/admin-management/me/password
// @access  Admin
exports.changeMyPassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword) {
    return next(new AppError('admin.current_password_required', 400));
  }

  if (!newPassword) {
    return next(new AppError('admin.new_password_required', 400));
  }

  if (newPassword.length < 6) {
    return next(new AppError('admin.password_too_short', 400));
  }

  // Récupérer l'admin avec le mot de passe
  const admin = await Admin.findById(req.admin._id).select('+password');
  if (!admin) {
    return next(new AppError('admin.not_found', 404));
  }

  // Vérifier le mot de passe actuel
  if (!(await admin.comparePassword(currentPassword))) {
    return next(new AppError('admin.current_password_incorrect', 400));
  }

  // Mettre à jour le mot de passe
  admin.password = newPassword;
  admin.lastPasswordChange = new Date();
  await admin.save();

  res.status(200).json({
    status: 'success',
    message: req.t('admin.password_updated')
  });
});

// @desc    Changer le mot de passe d'un administrateur
// @route   PUT /api/v1/admin/admins/:id/password
// @access  Super Admin, Admin (propre compte)
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const admin = await Admin.findById(req.params.id).select('+password');
  if (!admin) {
    return next(new AppError('admin.not_found', 404));
  }

  // Vérifier les permissions
  if (req.admin.role !== 'super-admin' && req.admin._id.toString() !== req.params.id) {
    return next(new AppError('admin.own_password_only', 403));
  }

  // Vérifier le mot de passe actuel (sauf pour les super-admin)
  if (req.admin.role !== 'super-admin') {
    if (!currentPassword) {
      return next(new AppError('admin.current_password_required', 400));
    }

    if (!(await admin.comparePassword(currentPassword))) {
      return next(new AppError('admin.current_password_incorrect', 400));
    }
  }

  // Mettre à jour le mot de passe
  admin.password = newPassword;
  admin.lastPasswordChange = new Date();
  await admin.save();

  res.status(200).json({
    status: 'success',
    message: req.t('admin.password_updated')
  });
});

