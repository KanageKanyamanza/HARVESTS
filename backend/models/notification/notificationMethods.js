const mongoose = require("mongoose");

// Méthodes du schéma
function addNotificationMethods(notificationSchema) {
	notificationSchema.methods.markAsRead = function () {
		if (!this.readAt) {
			this.readAt = new Date();
			this.status = "read";

			// Marquer le canal in-app comme lu
			if (this.channels.inApp.enabled) {
				this.channels.inApp.readAt = this.readAt;
			}
		}

		return this.save();
	};

	notificationSchema.methods.markAsClicked = function (actionType = null) {
		this.clickedAt = new Date();
		if (this.status !== "read") {
			this.status = "clicked";
		}

		// Ajouter l'interaction
		this.interactions.push({
			type: "click",
			timestamp: this.clickedAt,
			data: { actionType },
		});

		return this.save();
	};

	notificationSchema.methods.dismiss = function () {
		this.dismissedAt = new Date();
		this.interactions.push({
			type: "dismiss",
			timestamp: this.dismissedAt,
		});

		return this.save();
	};

	notificationSchema.methods.sendViaEmail = async function () {
		if (!this.channels.email.enabled || this.channels.email.sent) {
			return false;
		}

		try {
			const Email = require("../../utils/email");
			const User = mongoose.model("User");
			const Admin = mongoose.model("Admin");

			// Récupérer la notification fraîche depuis la base de données pour s'assurer d'avoir toutes les données
			// Utiliser .lean() pour obtenir un objet JavaScript simple directement
			const freshNotification = await this.constructor
				.findById(this._id)
				.lean();

			if (!freshNotification) {
				throw new Error("Notification non trouvée dans la base de données");
			}

			// Chercher d'abord dans User, puis dans Admin
			let recipient = await User.findById(freshNotification.recipient);
			if (!recipient) {
				recipient = await Admin.findById(freshNotification.recipient);
			}

			if (!recipient) {
				throw new Error("Destinataire non trouvé (ni User ni Admin)");
			}

			// S'assurer que data est un objet JavaScript simple avec toutes les propriétés
			// Utiliser JSON.parse/stringify pour forcer la sérialisation complète des objets complexes
			let dataToSend = null;
			if (freshNotification.data) {
				try {
					// Forcer la sérialisation complète en passant par JSON
					dataToSend = JSON.parse(JSON.stringify(freshNotification.data));
				} catch (e) {
					console.warn(
						"⚠️ [Notification] Erreur lors de la sérialisation de data:",
						e.message
					);
					// Fallback: utiliser directement l'objet
					dataToSend = freshNotification.data;
				}
			}

			// S'assurer que actions est un tableau JavaScript simple
			const actionsToSend = freshNotification.actions
				? Array.isArray(freshNotification.actions)
					? freshNotification.actions.map((action) =>
							typeof action === "object" && action !== null
								? JSON.parse(JSON.stringify(action))
								: action
					  )
					: freshNotification.actions
				: null;

			// Debug: vérifier les données avant envoi
			console.log("📧 [Notification.sendViaEmail] Données préparées:", {
				hasData: !!dataToSend,
				hasProducts: !!(dataToSend && dataToSend.products),
				productsCount:
					dataToSend && dataToSend.products ? dataToSend.products.length : 0,
				hasBuyer: !!(dataToSend && dataToSend.buyer),
				dataKeys: dataToSend ? Object.keys(dataToSend) : [],
			});

			await new Email(recipient).sendNotification({
				title: freshNotification.title,
				message: freshNotification.message,
				data: dataToSend,
				actions: actionsToSend,
			});

			this.channels.email.sent = true;
			this.channels.email.sentAt = new Date();

			if (this.status === "pending") {
				this.status = "sent";
			}

			await this.save();
			return true;
		} catch (error) {
			this.channels.email.failureReason = error.message;
			await this.save();
			console.error("Erreur envoi email notification:", error.message);
			return false;
		}
	};

	notificationSchema.methods.sendViaSMS = async function () {
		if (!this.channels.sms.enabled || this.channels.sms.sent) {
			return false;
		}

		try {
			// Intégration avec service SMS (à implémenter)
			// Exemple: Twilio, Africa's Talking, etc.

			this.channels.sms.sent = true;
			this.channels.sms.sentAt = new Date();

			if (this.status === "pending") {
				this.status = "sent";
			}

			await this.save();
			return true;
		} catch (error) {
			this.channels.sms.failureReason = error.message;
			await this.save();
			return false;
		}
	};

	notificationSchema.methods.sendViaPush = async function () {
		if (!this.channels.push.enabled || this.channels.push.sent) {
			return false;
		}

		try {
			const NotificationService = require("../../services/notificationService");

			// Récupérer les modèles de manière sécurisée
			let User, Admin;
			try {
				User = mongoose.model("User");
			} catch (e) {
				User = require("../User");
			}

			try {
				Admin = mongoose.model("Admin");
			} catch (e) {
				// Ne pas bloquer si Admin n'est pas trouvé, sauf si on en a besoin
				try {
					Admin = require("../Admin");
				} catch (err) {
					if (this.recipientModel === "Admin") throw err;
				}
			}

			// Identifier le modèle selon recipientModel
			const Model = this.recipientModel === "Admin" ? Admin : User;

			// Récupérer l'utilisateur/admin avec ses souscriptions
			// IMPORTANT: Sélectionner explicitement webPushSubscriptions car Mongoose peut ne pas le charger automatiquement
			const recipient = await Model.findById(this.recipient)
				.select("email webPushSubscriptions notificationSettings preferences")
				.lean();

			console.log(
				`[sendViaPush] Target: ${this.recipient} (${this.recipientModel})`
			);
			console.log(
				`[sendViaPush] Recipient loaded:`,
				recipient
					? {
							email: recipient.email,
							hasWebPushSubs: !!recipient.webPushSubscriptions,
							subsCount: recipient.webPushSubscriptions?.length || 0,
							subsIsArray: Array.isArray(recipient.webPushSubscriptions),
					  }
					: "NULL"
			);

			if (
				!recipient ||
				!recipient.webPushSubscriptions ||
				recipient.webPushSubscriptions.length === 0
			) {
				console.log(
					`[sendViaPush] ❌ Abandon: Pas de souscriptions pour ${
						recipient?.email || this.recipient
					}`
				);
				return false;
			}

			// Vérifier les préférences (supporte User et Admin)
			const settings =
				recipient.notificationSettings ||
				recipient.preferences?.notifications ||
				{};

			let isPushEnabled = true;

			if (this.recipientModel === "Admin") {
				isPushEnabled = settings.push !== false;
			} else if (settings.push) {
				// Mapping des catégories vers les clés de préférences User
				const categoryMapping = {
					order: "orders",
					product: "orders",
					payment: "payments",
					marketing: "promotions",
				};

				const prefKey = categoryMapping[this.category] || "updates";
				// Si la clé existe dans les paramètres push de l'utilisateur, on l'utilise
				// On check explicitement si c'est false. Si c'est true ou undefined, on laisse true.
				if (typeof settings.push === "object" && settings.push !== null) {
					if (typeof settings.push[prefKey] !== "undefined") {
						isPushEnabled = settings.push[prefKey] !== false;
					} else {
						// Fallback sur 'updates'
						isPushEnabled = settings.push.updates !== false;
					}
				} else if (typeof settings.push === "boolean") {
					isPushEnabled = settings.push;
				}
				console.log(
					`[sendViaPush] User: ${recipient.email}, Category: ${this.category}, PrefKey: ${prefKey}, Resolved: ${isPushEnabled}`
				);
			} else {
				console.log(
					`[sendViaPush] User: ${
						recipient.email
					}, No push settings found (settings.push is ${typeof settings.push}), defaulting to TRUE`
				);
				isPushEnabled = true;
			}

			if (!isPushEnabled) {
				console.log(
					`[sendViaPush] Abandon: Push désactivé par l'utilisateur ${recipient.email}`
				);
				return false;
			}

			// Récupérer le nombre de notifications non lues pour le badge
			const unreadCount = await this.constructor.getUnreadCount(this.recipient);

			// Préparer les données pour le service
			const notificationPayload = {
				title: this.title,
				body: this.message,
				icon: "/logo.png",
				// Chercher une action "view" pour l'URL de redirection
				clickAction: this.actions?.find((a) => a.type === "view")?.url || "/",
				actions: this.actions,
				image: this.data?.image || null,
				unreadCount: unreadCount,
			};

			// Utiliser le service existant
			const result = await NotificationService.sendWebPushNotification(
				recipient.webPushSubscriptions,
				notificationPayload,
				this.data
			);

			if (result && result.successCount > 0) {
				this.channels.push.sent = true;
				this.channels.push.sentAt = new Date();

				if (this.status === "pending") {
					this.status = "sent";
				}

				await this.save();
				return true;
			}

			return false;
		} catch (error) {
			this.channels.push.failureReason = error.message;
			await this.save();
			console.error("Erreur envoi push:", error.message);
			return false;
		}
	};

	notificationSchema.methods.sendToAllChannels = async function () {
		const results = {
			inApp: true, // Toujours disponible
			email: false,
			sms: false,
			push: false,
		};

		// Envoyer par email si activé (sans bloquer si échec)
		if (this.channels.email.enabled) {
			try {
				results.email = await this.sendViaEmail();
			} catch (error) {
				console.error("Erreur envoi email:", error.message);
				this.channels.email.failureReason = error.message;
			}
		}

		// Envoyer par SMS si activé (sans bloquer si échec)
		if (this.channels.sms.enabled) {
			try {
				results.sms = await this.sendViaSMS();
			} catch (error) {
				console.error("Erreur envoi SMS:", error.message);
				this.channels.sms.failureReason = error.message;
			}
		}

		// Envoyer par push si activé (sans bloquer si échec)
		if (this.channels.push.enabled) {
			try {
				results.push = await this.sendViaPush();
			} catch (error) {
				console.error("Erreur envoi push:", error.message);
				this.channels.push.failureReason = error.message;
			}
		}

		// Marquer comme envoyé in-app (toujours disponible)
		this.channels.inApp.sent = true;
		this.channels.inApp.sentAt = new Date();

		// Marquer comme envoyé si au moins inApp fonctionne
		if (this.status === "pending") {
			this.status = "sent";
		}

		await this.save();

		return results;
	};
}

module.exports = addNotificationMethods;
