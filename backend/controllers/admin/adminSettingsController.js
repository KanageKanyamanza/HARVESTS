const catchAsync = require('../../utils/catchAsync');

// @desc    Obtenir les paramètres système
// @route   GET /api/v1/admin/settings
// @access  Admin
exports.getSystemSettings = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement',
    data: { settings: {} }
  });
});

// @desc    Mettre à jour les paramètres système
// @route   PATCH /api/v1/admin/settings
// @access  Admin
exports.updateSystemSettings = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement'
  });
});

