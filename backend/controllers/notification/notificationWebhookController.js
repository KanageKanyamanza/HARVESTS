const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const notificationWebhookService = require('../../services/notification/notificationWebhookService');

// Webhook pour les événements de notification (ex: SendGrid, Twilio)
exports.handleNotificationWebhook = catchAsync(async (req, res, next) => {
  try {
    const { provider, event, data } = req.body;
    await notificationWebhookService.handleNotificationWebhook(provider, event, data);

    res.status(200).json({
      status: 'success',
      message: 'Webhook traité avec succès'
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

