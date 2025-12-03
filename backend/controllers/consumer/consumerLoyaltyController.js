const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const consumerLoyaltyService = require('../../services/consumer/consumerLoyaltyService');

// Programme de fidélité
exports.getLoyaltyStatus = catchAsync(async (req, res, next) => {
  try {
    const loyalty = await consumerLoyaltyService.getLoyaltyStatus(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { loyalty }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.redeemLoyaltyPoints = catchAsync(async (req, res, next) => {
  try {
    const result = await consumerLoyaltyService.redeemLoyaltyPoints(req.user.id, req.body.points, req.body.description);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.getLoyaltyHistory = catchAsync(async (req, res, next) => {
  try {
    const history = await consumerLoyaltyService.getLoyaltyHistory(req.user.id, req.query.limit);
    res.status(200).json({
      status: 'success',
      results: history.length,
      data: { history }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

