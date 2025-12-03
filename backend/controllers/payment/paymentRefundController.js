const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const paymentRefundService = require('../../services/payment/paymentRefundService');

// Demander un remboursement
exports.requestRefund = catchAsync(async (req, res, next) => {
  try {
    await paymentRefundService.requestRefund(req.params.id, req.user.id, req.body);

    res.status(200).json({
      status: 'success',
      message: 'Demande de remboursement créée avec succès'
    });
  } catch (error) {
    return next(new AppError(error.message, error.message.includes('non trouvé') ? 404 : 400));
  }
});

// Traiter un remboursement (admin)
exports.processRefund = catchAsync(async (req, res, next) => {
  try {
    const { refundId, status, note } = req.body;
    const result = await paymentRefundService.processRefund(refundId, req.user.id, { status, note });

    res.status(200).json({
      status: 'success',
      message: `Remboursement ${status === 'succeeded' ? 'approuvé' : 'rejeté'}`,
      data: {
        refund: result.refund
      }
    });
  } catch (error) {
    return next(new AppError(error.message, error.message.includes('non trouv') ? 404 : 400));
  }
});
