const Admin = require('../../../models/Admin');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

// @desc    Changer le mot de passe d'un administrateur
// @route   PUT /api/v1/admin/admins/:id/password
// @access  Super Admin, Admin (propre compte)
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const admin = await Admin.findById(req.params.id).select('+password');
  if (!admin) {
    return next(new AppError('Administrateur non trouvé', 404));
  }

  // Vérifier les permissions
  if (req.admin.role !== 'super-admin' && req.admin._id.toString() !== req.params.id) {
    return next(new AppError('Vous ne pouvez modifier que votre propre mot de passe', 403));
  }

  // Vérifier le mot de passe actuel (sauf pour les super-admin)
  if (req.admin.role !== 'super-admin') {
    if (!currentPassword) {
      return next(new AppError('Veuillez fournir votre mot de passe actuel', 400));
    }

    if (!(await admin.comparePassword(currentPassword))) {
      return next(new AppError('Mot de passe actuel incorrect', 400));
    }
  }

  // Mettre à jour le mot de passe
  admin.password = newPassword;
  admin.lastPasswordChange = new Date();
  await admin.save();

  res.status(200).json({
    status: 'success',
    message: 'Mot de passe modifié avec succès'
  });
});

