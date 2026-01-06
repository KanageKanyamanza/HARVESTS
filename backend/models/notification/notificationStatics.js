// Méthodes statiques
function addNotificationStatics(notificationSchema) {
	notificationSchema.statics.createNotification = async function (data) {
		// S'assurer que data est un objet JavaScript simple (sérialiser les objets complexes)
		if (data && data.data) {
			// Convertir data.data en objet JavaScript simple si nécessaire
			if (typeof data.data === "object" && data.data !== null) {
				try {
					// Forcer la sérialisation complète en passant par JSON
					data.data = JSON.parse(JSON.stringify(data.data));
				} catch (e) {
					console.warn(
						"⚠️ [Notification] Erreur lors de la sérialisation de data:",
						e.message
					);
				}
			}
		}

		const notification = new this(data);

		// Forcer la sérialisation du champ data avant sauvegarde
		// Mongoose peut avoir des problèmes avec Mixed, donc on s'assure que c'est bien sérialisé
		if (notification.data && typeof notification.data === "object") {
			try {
				// Marquer le champ comme modifié pour forcer la sauvegarde
				notification.markModified("data");
				// S'assurer que data est bien un objet JavaScript simple
				notification.data = JSON.parse(JSON.stringify(notification.data));
			} catch (e) {
				console.warn(
					"⚠️ [Notification] Erreur lors de la préparation de data pour sauvegarde:",
					e.message
				);
			}
		}

		await notification.save();

		// Vérifier après sauvegarde que les données sont toujours présentes
		const savedNotification = await this.findById(notification._id).lean();

		// Envoyer immédiatement si pas planifié (seulement pour inApp, email désactivé)
		if (!notification.scheduledFor || notification.scheduledFor <= new Date()) {
			try {
				await notification.sendToAllChannels();
			} catch (error) {
				console.error(
					"⚠️ [Notification.createNotification] Erreur lors de l'envoi aux canaux:",
					error.message
				);
				// Ne pas bloquer si l'envoi échoue, la notification est déjà sauvegardée
			}
		}

		return notification;
	};

	notificationSchema.statics.getUnreadCount = function (userId) {
		return this.countDocuments({
			recipient: userId,
			readAt: { $exists: false },
			status: { $in: ["pending", "sent", "delivered", "failed"] }, // Inclure 'failed'
		});
	};

	notificationSchema.statics.getByCategory = function (
		userId,
		category,
		limit = 20
	) {
		return this.find({
			recipient: userId,
			category: category,
		})
			.sort({ createdAt: -1 })
			.limit(limit)
			.populate("sender", "firstName lastName avatar");
	};

	notificationSchema.statics.markAllAsRead = function (
		userId,
		category = null
	) {
		const query = {
			recipient: userId,
			readAt: { $exists: false },
		};

		if (category) {
			query.category = category;
		}

		return this.updateMany(query, {
			readAt: new Date(),
			status: "read",
		});
	};

	notificationSchema.statics.cleanupExpired = function () {
		return this.deleteMany({
			expiresAt: { $lt: new Date() },
			status: { $nin: ["read", "clicked"] },
		});
	};

	notificationSchema.statics.getScheduledNotifications = function () {
		return this.find({
			status: "pending",
			scheduledFor: { $lte: new Date() },
			$or: [
				{ expiresAt: { $exists: false } },
				{ expiresAt: { $gt: new Date() } },
			],
		});
	};
}

module.exports = addNotificationStatics;
