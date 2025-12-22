const Notification = require("../../models/Notification");
const User = require("../../models/User");

/**
 * Service pour la gestion des notifications utilisateur
 */

/**
 * Obtenir les notifications d'un utilisateur
 */
async function getUserNotifications(userId, queryParams = {}) {
	const page = parseInt(queryParams.page, 10) || 1;
	const limit = parseInt(queryParams.limit, 10) || 20;
	const skip = (page - 1) * limit;

	const queryObj = { recipient: userId };

	// Filtres
	if (queryParams.category) queryObj.category = queryParams.category;
	if (queryParams.type) queryObj.type = queryParams.type;
	if (queryParams.priority) queryObj.priority = queryParams.priority;

	// Filtrer par statut de lecture
	if (queryParams.unread === "true") {
		queryObj.readAt = { $exists: false };
	} else if (queryParams.read === "true") {
		queryObj.readAt = { $exists: true };
	}

	const notifications = await Notification.find(queryObj)
		.populate({
			path: "recipient",
			select: "firstName lastName email userType role",
			options: { strictPopulate: false },
		})
		.populate({
			path: "sender",
			select: "firstName lastName avatar userType",
			options: { strictPopulate: false },
		})
		.sort("-createdAt")
		.skip(skip)
		.limit(limit);

	const total = await Notification.countDocuments(queryObj);
	const unreadCount = await Notification.getUnreadCount(userId);

	return {
		notifications,
		total,
		unreadCount,
		page,
		totalPages: Math.ceil(total / limit),
	};
}

/**
 * Obtenir le nombre de notifications non lues
 */
async function getUnreadCount(recipientId) {
	const unreadCount = await Notification.getUnreadCount(recipientId);

	// Compter par catégorie
	const unreadByCategory = await Notification.aggregate([
		{
			$match: {
				recipient: recipientId,
				readAt: { $exists: false },
				status: { $in: ["pending", "sent", "delivered"] },
			},
		},
		{
			$group: {
				_id: "$category",
				count: { $sum: 1 },
			},
		},
	]);

	return {
		total: unreadCount,
		byCategory: unreadByCategory,
	};
}

/**
 * Obtenir les notifications par catégorie
 */
async function getNotificationsByCategory(userId, category, limit = 20) {
	const notifications = await Notification.getByCategory(
		userId,
		category,
		limit
	);
	return notifications;
}

/**
 * Marquer une notification comme lue
 */
async function markAsRead(notificationId, recipientId) {
	const notification = await Notification.findOne({
		_id: notificationId,
		recipient: recipientId,
	});

	if (!notification) {
		throw new Error("Notification non trouvée");
	}

	await notification.markAsRead();
	return notification;
}

/**
 * Marquer toutes les notifications comme lues
 */
async function markAllAsRead(recipientId, category = null) {
	const result = await Notification.markAllAsRead(recipientId, category);
	return result;
}

/**
 * Marquer une notification comme cliquée
 */
async function markAsClicked(notificationId, userId, actionType) {
	const notification = await Notification.findOne({
		_id: notificationId,
		recipient: userId,
	});

	if (!notification) {
		throw new Error("Notification non trouvée");
	}

	await notification.markAsClicked(actionType);
	return notification;
}

/**
 * Rejeter/masquer une notification
 */
async function dismissNotification(notificationId, userId) {
	const notification = await Notification.findOne({
		_id: notificationId,
		recipient: userId,
	});

	if (!notification) {
		throw new Error("Notification non trouvée");
	}

	await notification.dismiss();
	return notification;
}

/**
 * Supprimer une notification
 */
async function deleteNotification(notificationId, userId) {
	const notification = await Notification.findOneAndDelete({
		_id: notificationId,
		recipient: userId,
	});

	if (!notification) {
		throw new Error("Notification non trouvée");
	}

	return notification;
}

/**
 * Obtenir les préférences de notification
 */
async function getNotificationPreferences(userId) {
	const user = await User.findById(userId).select("notifications");
	return user.notifications;
}

/**
 * Mettre à jour les préférences de notification
 */
async function updateNotificationPreferences(userId, preferences) {
	const allowedFields = ["email", "sms", "push"];
	const filteredPrefs = {};

	Object.keys(preferences).forEach((key) => {
		if (allowedFields.includes(key)) {
			filteredPrefs[`notifications.${key}`] = preferences[key];
		}
	});

	const user = await User.findByIdAndUpdate(userId, filteredPrefs, {
		new: true,
		runValidators: true,
	}).select("notifications");

	return user.notifications;
}

/**
 * S'abonner aux notifications Web Push
 */
async function subscribeToPush(userId, subscription, recipientModel = "User") {
	const Model = require(`../../models/${recipientModel}`);
	const recipient = await Model.findById(userId);

	if (!recipient) {
		throw new Error(`${recipientModel} non trouvé`);
	}

	// Vérifier si l'abonnement existe déjà
	const subscriptionExists = recipient.webPushSubscriptions?.some(
		(sub) => sub.endpoint === subscription.endpoint
	);

	if (!subscriptionExists) {
		if (!recipient.webPushSubscriptions) recipient.webPushSubscriptions = [];
		recipient.webPushSubscriptions.push(subscription);
		await recipient.save({ validateBeforeSave: false });
	}

	return recipient.webPushSubscriptions;
}

/**
 * Se désabonner des notifications Web Push
 */
async function unsubscribeFromPush(userId, endpoint, recipientModel = "User") {
	const Model = require(`../../models/${recipientModel}`);
	const recipient = await Model.findById(userId);

	if (!recipient) {
		throw new Error(`${recipientModel} non trouvé`);
	}

	if (recipient.webPushSubscriptions) {
		recipient.webPushSubscriptions = recipient.webPushSubscriptions.filter(
			(sub) => sub.endpoint !== endpoint
		);
		await recipient.save({ validateBeforeSave: false });
	}

	return recipient.webPushSubscriptions;
}

module.exports = {
	getUserNotifications,
	getUnreadCount,
	getNotificationsByCategory,
	markAsRead,
	markAllAsRead,
	markAsClicked,
	dismissNotification,
	deleteNotification,
	getNotificationPreferences,
	updateNotificationPreferences,
	subscribeToPush,
	unsubscribeFromPush,
};
