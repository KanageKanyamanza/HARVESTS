const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const consumerPaymentService = require('../../services/consumer/consumerPaymentService');

// Méthodes de paiement
exports.getPaymentMethods = catchAsync(async (req, res, next) => {
  try {
    const paymentMethods = await consumerPaymentService.getPaymentMethods(req.user.id);
    res.status(200).json({
      status: 'success',
      results: paymentMethods.length,
      data: { paymentMethods }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.addPaymentMethod = catchAsync(async (req, res, next) => {
  try {
    const paymentMethod = await consumerPaymentService.addPaymentMethod(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      data: { paymentMethod }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updatePaymentMethod = catchAsync(async (req, res, next) => {
  try {
    const paymentMethod = await consumerPaymentService.updatePaymentMethod(req.user.id, req.params.methodId, req.body);
    res.status(200).json({
      status: 'success',
      data: { paymentMethod }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.removePaymentMethod = catchAsync(async (req, res, next) => {
  try {
    await consumerPaymentService.removePaymentMethod(req.user.id, req.params.methodId);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.setDefaultPaymentMethod = catchAsync(async (req, res, next) => {
  try {
    const paymentMethod = await consumerPaymentService.setDefaultPaymentMethod(req.user.id, req.params.methodId);
    res.status(200).json({
      status: 'success',
      data: { paymentMethod }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

