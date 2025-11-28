const catchAsync = require('../../utils/catchAsync');
const adminTransporterController = require('./adminTransporterController');

// @desc    Obtenir toutes les livraisons
// @route   GET /api/v1/admin/deliveries
// @access  Admin
exports.getAllDeliveries = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement',
    data: { deliveries: [] }
  });
});

// @desc    Obtenir une livraison par ID
// @route   GET /api/v1/admin/deliveries/:id
// @access  Admin
exports.getDeliveryById = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement',
    data: { delivery: null }
  });
});

// @desc    Mettre à jour le statut d'une livraison
// @route   PATCH /api/v1/admin/deliveries/:id/status
// @access  Admin
exports.updateDeliveryStatus = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement'
  });
});

// @desc    Assigner un transporteur à une livraison
// @route   POST /api/v1/admin/deliveries/:id/assign
// @access  Admin
// Note: Une livraison est en fait une commande, donc on délègue à la fonction d'assignation de commande
exports.assignTransporter = catchAsync(async (req, res, next) => {
  // La livraison est identifiée par l'ID de la commande
  // On utilise la même logique que pour assigner un transporteur à une commande
  req.params.id = req.params.id; // L'ID de la livraison est l'ID de la commande
  return adminTransporterController.assignTransporterToOrder(req, res, next);
});

