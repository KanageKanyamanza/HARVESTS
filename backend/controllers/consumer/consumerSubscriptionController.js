const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const consumerSubscriptionService = require('../../services/consumer/consumerSubscriptionService');

// Gestion des abonnements (livraisons récurrentes)
exports.getSubscriptions = catchAsync(async (req, res, next) => {
  try {
    const subscriptions = await consumerSubscriptionService.getSubscriptions(req.user.id);
    res.status(200).json({
      status: 'success',
      results: subscriptions.length,
      data: { subscriptions }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.createSubscription = catchAsync(async (req, res, next) => {
  try {
    const subscription = await consumerSubscriptionService.createSubscription(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      data: { subscription }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.getSubscription = catchAsync(async (req, res, next) => {
  try {
    const subscription = await consumerSubscriptionService.getSubscription(req.user.id, req.params.subscriptionId);
    res.status(200).json({
      status: 'success',
      data: { subscription }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateSubscription = catchAsync(async (req, res, next) => {
  try {
    const subscription = await consumerSubscriptionService.updateSubscription(req.user.id, req.params.subscriptionId, req.body);
    res.status(200).json({
      status: 'success',
      data: { subscription }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.cancelSubscription = catchAsync(async (req, res, next) => {
  try {
    await consumerSubscriptionService.cancelSubscription(req.user.id, req.params.subscriptionId);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.pauseSubscription = catchAsync(async (req, res, next) => {
  try {
    await consumerSubscriptionService.pauseSubscription(req.user.id, req.params.subscriptionId);
    res.status(200).json({
      status: 'success',
      message: 'Abonnement mis en pause'
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.resumeSubscription = catchAsync(async (req, res, next) => {
  try {
    await consumerSubscriptionService.resumeSubscription(req.user.id, req.params.subscriptionId);
    res.status(200).json({
      status: 'success',
      message: 'Abonnement repris'
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

