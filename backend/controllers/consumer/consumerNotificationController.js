const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const consumerNotificationService = require('../../services/consumer/consumerNotificationService');

// Notifications
exports.getNotifications = catchAsync(async (req, res, next) => {
  try {
    const notifications = await consumerNotificationService.getNotifications(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { notifications }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.markNotificationsAsRead = catchAsync(async (req, res, next) => {
  try {
    await consumerNotificationService.markNotificationsAsRead(req.user.id);
    res.status(200).json({
      status: 'success',
      message: 'Notifications marquées comme lues'
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.markNotificationAsRead = catchAsync(async (req, res, next) => {
  try {
    const notification = await consumerNotificationService.markNotificationAsRead(req.user.id, req.params.notificationId);
    res.status(200).json({
      status: 'success',
      data: { notification }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.deleteNotification = catchAsync(async (req, res, next) => {
  try {
    await consumerNotificationService.deleteNotification(req.user.id, req.params.notificationId);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

