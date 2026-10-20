const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const notificationUserService = require("../../services/notification/notificationUserService");
const { logger } = require("../../config/logger");

// Obtenir mes notifications
exports.getMyNotifications = catchAsync(async (req, res, next) => {
	try {
		const result = await notificationUserService.getUserNotifications(
			req.user.id,
			req.query
		);

		res.status(200).json({
			status: "success",
			results: result.notifications.length,
			total: result.total,
			unreadCount: result.unreadCount,
			page: result.page,
			totalPages: result.totalPages,
			data: {
				notifications: result.notifications,
			},
		});
	} catch (error) {
		return next(AppError.from(error, 400));
	}
});

// Obtenir le nombre de notifications non lues
exports.getUnreadCount = catchAsync(async (req, res, next) => {
	try {
		const recipientId = req.admin ? req.admin._id : req.user.id;
		const result = await notificationUserService.getUnreadCount(recipientId);

		res.status(200).json({
			status: "success",
			data: result,
		});
	} catch (error) {
		return next(AppError.from(error, 400));
	}
});

// Obtenir les notifications par catégorie
exports.getNotificationsByCategory = catchAsync(async (req, res, next) => {
	try {
		const { category } = req.params;
		const limit = parseInt(req.query.limit, 10) || 20;
		const notifications =
			await notificationUserService.getNotificationsByCategory(
				req.user.id,
				category,
				limit
			);

		res.status(200).json({
			status: "success",
			results: notifications.length,
			data: {
				notifications,
			},
		});
	} catch (error) {
		return next(AppError.from(error, 400));
	}
});

// Marquer une notification comme lue
exports.markAsRead = catchAsync(async (req, res, next) => {
	try {
		const recipientId = req.admin ? req.admin._id : req.user.id;
		const notification = await notificationUserService.markAsRead(
			req.params.id,
			recipientId
		);

		res.status(200).json({
			status: "success",
			data: {
				notification,
			},
		});
	} catch (error) {
		return next(AppError.from(error, 404));
	}
});

// Marquer toutes les notifications comme lues
exports.markAllAsRead = catchAsync(async (req, res, next) => {
	try {
		const { category } = req.query;
		const recipientId = req.admin ? req.admin._id : req.user.id;
		const result = await notificationUserService.markAllAsRead(
			recipientId,
			category
		);

		res.status(200).json({
			status: "success",
			message: req.t("notification.marked_all_read", {
				count: result.modifiedCount,
			}),
			data: {
				modifiedCount: result.modifiedCount,
			},
		});
	} catch (error) {
		return next(AppError.from(error, 400));
	}
});

// Marquer une notification comme cliquée
exports.markAsClicked = catchAsync(async (req, res, next) => {
	try {
		const { actionType } = req.body;
		const notification = await notificationUserService.markAsClicked(
			req.params.id,
			req.user.id,
			actionType
		);

		res.status(200).json({
			status: "success",
			data: {
				notification,
			},
		});
	} catch (error) {
		return next(AppError.from(error, 404));
	}
});

// Rejeter/masquer une notification
exports.dismissNotification = catchAsync(async (req, res, next) => {
	try {
		await notificationUserService.dismissNotification(
			req.params.id,
			req.user.id
		);

		res.status(200).json({
			status: "success",
			message: req.t("notification.hidden"),
		});
	} catch (error) {
		return next(AppError.from(error, 404));
	}
});

// Supprimer une notification
exports.deleteNotification = catchAsync(async (req, res, next) => {
	try {
		await notificationUserService.deleteNotification(
			req.params.id,
			req.user.id
		);

		res.status(204).json({
			status: "success",
			data: null,
		});
	} catch (error) {
		return next(AppError.from(error, 404));
	}
});

// Obtenir les préférences de notification
exports.getNotificationPreferences = catchAsync(async (req, res, next) => {
	try {
		const preferences =
			await notificationUserService.getNotificationPreferences(req.user.id);

		res.status(200).json({
			status: "success",
			data: {
				preferences,
			},
		});
	} catch (error) {
		return next(AppError.from(error, 400));
	}
});

// Mettre à jour les préférences de notification
exports.updateNotificationPreferences = catchAsync(async (req, res, next) => {
	try {
		const preferences =
			await notificationUserService.updateNotificationPreferences(
				req.user.id,
				req.body
			);

		res.status(200).json({
			status: "success",
			data: {
				preferences,
			},
		});
	} catch (error) {
		return next(AppError.from(error, 400));
	}
});

// S'abonner aux notifications Web Push
exports.subscribeToPush = catchAsync(async (req, res, next) => {
	try {
		const { subscription } = req.body;
		if (!subscription || !subscription.endpoint) {
			return next(new AppError("notification.subscription_required", 400));
		}
		const recipientId = req.admin ? req.admin._id : req.user.id;
		const recipientModel = req.admin ? "Admin" : "User";

		logger.info(
			`🔔 [subscribeToPush] Demande d'abonnement pour ${recipientModel}: ${recipientId}`,
			{
				recipientId,
				recipientModel,
				userAgent: req.headers["user-agent"],
			}
		);

		await notificationUserService.subscribeToPush(
			recipientId,
			subscription,
			recipientModel
		);

		res.status(200).json({
			status: "success",
			message: req.t("notification.push_subscribed"),
		});
	} catch (error) {
		return next(AppError.from(error, 400));
	}
});

// Se désabonner des notifications Web Push
exports.unsubscribeFromPush = catchAsync(async (req, res, next) => {
	try {
		const { endpoint } = req.body;
		if (!endpoint) {
			return next(new AppError("notification.endpoint_required", 400));
		}
		const recipientId = req.admin ? req.admin._id : req.user.id;
		const recipientModel = req.admin ? "Admin" : "User";

		await notificationUserService.unsubscribeFromPush(
			recipientId,
			endpoint,
			recipientModel
		);

		res.status(200).json({
			status: "success",
			message: req.t("notification.push_unsubscribed"),
		});
	} catch (error) {
		return next(AppError.from(error, 400));
	}
});
