const catchAsync = require('../../utils/catchAsync');

// @desc    Obtenir tous les paiements
// @route   GET /api/v1/admin/payments
// @access  Admin
exports.getAllPayments = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement',
    data: { payments: [] }
  });
});

// @desc    Obtenir un paiement par ID
// @route   GET /api/v1/admin/payments/:id
// @access  Admin
exports.getPaymentById = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement',
    data: { payment: null }
  });
});

// @desc    Mettre à jour le statut d'un paiement
// @route   PATCH /api/v1/admin/payments/:id/status
// @access  Admin
exports.updatePaymentStatus = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement'
  });
});

// @desc    Rembourser un paiement
// @route   POST /api/v1/admin/payments/:id/refund
// @access  Admin
exports.refundPayment = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement'
  });
});

