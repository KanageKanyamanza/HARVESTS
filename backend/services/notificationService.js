let admin;
try {
	admin = require("firebase-admin");
} catch (e) {
	console.warn(
		"⚠️ Firebase Admin SDK non installé - Les notifications mobiles ne fonctionneront pas.",
	);
	admin = {
		apps: [],
		messaging: () => ({
			sendMulticast: async () => ({ successCount: 0, failureCount: 0 }),
		}),
		credential: { cert: () => {} },
		initializeApp: () => {},
	};
}

const webpush = require("web-push");
const cron = require("node-cron");
const { info, error } = require("../config/logger");
const emailService = require("../utils/email");

// Configuration Firebase Admin SDK
if (process.env.FCM_SERVER_KEY && admin) {
	try {
		const serviceAccount = {
			type: "service_account",
			project_id: process.env.FIREBASE_PROJECT_ID,
			private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
			private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
			client_email: process.env.FIREBASE_CLIENT_EMAIL,
			client_id: process.env.FIREBASE_CLIENT_ID,
			auth_uri: "https://accounts.google.com/o/oauth2/auth",
			token_uri: "https://oauth2.googleapis.com/token",
		};

		if (!admin.apps.length) {
			admin.initializeApp({
				credential: admin.credential.cert(serviceAccount),
			});
		}
	} catch (err) {
		console.warn("Erreur configuration Firebase:", err.message);
	}
}

// Configuration Web Push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
	webpush.setVapidDetails(
		process.env.VAPID_SUBJECT || "mailto:admin@harvests.cm",
		process.env.VAPID_PUBLIC_KEY,
		process.env.VAPID_PRIVATE_KEY,
	);
}

class NotificationService {
	// 📱 Envoyer notification push FCM (Firebase)
	static async sendFCMNotification(userTokens, notification, data = {}) {
		if (!admin.apps.length) {
			info("Firebase Admin non configuré, notification ignorée");
			return;
		}

		try {
			const tokens = Array.isArray(userTokens) ? userTokens : [userTokens];

			const message = {
				notification: {
					title: notification.title,
					body: notification.body,
					imageUrl: notification.image || null,
				},
				data: {
					click_action:
						notification.clickAction || "FLUTTER_NOTIFICATION_CLICK",
					...data,
				},
				tokens: tokens.filter((token) => token && token.length > 0),
			};

			if (message.tokens.length === 0) {
				info("Aucun token FCM valide trouvé");
				return;
			}

			const response = await admin.messaging().sendMulticast(message);

			info(
				`Notifications FCM envoyées: ${response.successCount}/${tokens.length}`,
				{
					successCount: response.successCount,
					failureCount: response.failureCount,
				},
			);

			// Nettoyer les tokens invalides
			if (response.failureCount > 0) {
				await this.cleanInvalidTokens(tokens, response.responses);
			}

			return response;
		} catch (err) {
			error("Erreur envoi notification FCM:", err);
			throw err;
		}
	}

	// 🌐 Envoyer notification push Web
	static async sendWebPushNotification(subscriptions, notification, data = {}) {
		if (!process.env.VAPID_PUBLIC_KEY) {
			info("Web Push non configuré, notification ignorée");
			return;
		}

		try {
			const subs =
				Array.isArray(subscriptions) ? subscriptions : [subscriptions];
			// ⚠️ Nettoyage drastique pour Web Push (< 4KB)
			// On utilise une approche whitelist plutôt que blacklist pour être sûr
			const safeData = {
				url: notification.clickAction || data.url || "/",
			};

			// Ajouter seulement les champs d'identification essentiels
			const allowedKeys = [
				"orderId",
				"orderNumber",
				"reviewId",
				"productId",
				"paymentId",
				"amount",
				"currency",
				"status",
				"rating",
			];

			// Si data est un objet Mongoose, on le convertit
			const rawData =
				data && typeof data.toObject === "function" ? data.toObject() : data;

			if (rawData) {
				allowedKeys.forEach((key) => {
					if (rawData[key] !== undefined && rawData[key] !== null) {
						safeData[key] = rawData[key];
					}
				});
			}

			const payloadObj = {
				title: notification.title,
				body: notification.body,
				icon: "/logo.png",
				badge: "/logo.png",
				data: safeData,
				actions: notification.actions || [],
				unreadCount: notification.unreadCount, // Ajout du compteur pour le badge PWA
			};

			const payload = JSON.stringify(payloadObj);

			// Logger la taille pour debug
			const payloadSize = Buffer.byteLength(payload, "utf8");
			if (payloadSize > 3000) {
				console.warn(
					`⚠️ Attention: Charge utile Web Push volumineuse (${payloadSize} bytes). Limite ~4000 bytes.`
				);
			}

			let successCount = 0;
			let failureCount = 0;

			for (const sub of subs) {
				try {
					// Assainir l'objet de souscription (enlever les propriétés Mongoose)
					const subscription = {
						endpoint: sub.endpoint,
						keys: {
							p256dh: sub.keys.p256dh,
							auth: sub.keys.auth,
						},
					};

					await webpush.sendNotification(subscription, payload);
					successCount++;
				} catch (err) {
					failureCount++;
					error(
						`[sendWebPushNotification] ❌ Erreur pour ${sub.endpoint.substring(
							0,
							50,
						)}:`,
						err.message,
					);

					// Gérer les souscriptions expirées/invalides
					if (err.statusCode === 410 || err.statusCode === 404) {
						info(
							`[sendWebPushNotification] Souscription expirée (410/404), suppression...`,
						);
						this.removeExpiredSubscription(sub.endpoint).catch((e) =>
							error("Erreur suppression souscription expirée:", e.message),
						);
					}
				}
			}

			info(`Notifications Web Push envoyées: ${successCount}/${subs.length}`);

			return { successCount, failureCount, totalCount: subs.length };
		} catch (err) {
			error("Erreur envoi notification Web Push:", err);
			throw err;
		}
	}

	// 📧 Envoyer notification par email
	static async sendEmailNotification(user, notification, data = {}) {
		try {
			const emailData = {
				to: user.email,
				subject: notification.title,
				template: notification.emailTemplate || "notification",
				context: {
					firstName: user.firstName,
					title: notification.title,
					body: notification.body,
					actionUrl: notification.clickAction,
					actionText: notification.actionText || "Voir détails",
					...data,
				},
			};

			await emailService.sendEmail(emailData);
			info(`Email de notification envoyé à ${user.email}`);
		} catch (err) {
			error("Erreur envoi email notification:", err);
			throw err;
		}
	}

	// 📲 Envoyer notification multi-canal
	static async sendMultiChannelNotification(user, notification, data = {}) {
		const promises = [];

		// Extraire les préférences (supporte User.notificationSettings et Admin.preferences)
		const settings =
			user.notificationSettings || user.preferences?.notifications || {};

		// Déterminer si le push est activé (par défaut true si non spécifié)
		let isPushEnabled = true;
		if (user.userType === "admin") {
			isPushEnabled = settings.push !== false;
		} else if (settings.push) {
			// Mapping des catégories vers les clés de préférences User
			const categoryMapping = {
				"new-order": "orders",
				order: "orders",
				payment: "payments",
				marketing: "promotions",
			};

			// Si on a un template spécifique ou une catégorie explicite dans notification
			const catKey =
				categoryMapping[notification.emailTemplate] ||
				categoryMapping[notification.category] ||
				"updates";

			isPushEnabled = settings.push[catKey] !== false;
		}

		// FCM (Mobile)
		if (isPushEnabled && user.fcmTokens?.length > 0) {
			promises.push(
				this.sendFCMNotification(user.fcmTokens, notification, data),
			);
		}

		// Web Push (Browser)
		// On considère que si le push est activé globalement, on envoie aussi au Web Push
		if (isPushEnabled && user.webPushSubscriptions?.length > 0) {
			promises.push(
				this.sendWebPushNotification(
					user.webPushSubscriptions,
					notification,
					data,
				),
			);
		}

		// Email
		let isEmailEnabled = false;
		if (user.userType === "admin") {
			isEmailEnabled = settings.email !== false;
		} else {
			const category =
				notification.emailTemplate === "new-order" ? "orders" : "updates";
			isEmailEnabled = settings.email?.[category] !== false;
		}

		if (isEmailEnabled) {
			promises.push(this.sendEmailNotification(user, notification, data));
		}

		const results = await Promise.allSettled(promises);
		const successCount = results.filter((r) => r.status === "fulfilled").length;

		info(
			`Notifications multi-canal envoyées: ${successCount}/${promises.length} canaux`,
		);

		return results;
	}

	// 👥 Envoyer notification à plusieurs utilisateurs
	static async sendBulkNotification(users, notification, data = {}) {
		const batchSize = 100; // Traiter par lots de 100
		const batches = [];

		for (let i = 0; i < users.length; i += batchSize) {
			batches.push(users.slice(i, i + batchSize));
		}

		let totalSent = 0;

		for (const batch of batches) {
			const promises = batch.map((user) =>
				this.sendMultiChannelNotification(user, notification, data).catch(
					(err) => {
						error(`Erreur notification utilisateur ${user._id}:`, err);
						return null;
					},
				),
			);

			const results = await Promise.allSettled(promises);
			const batchSuccess = results.filter(
				(r) => r.status === "fulfilled" && r.value,
			).length;
			totalSent += batchSuccess;

			// Pause entre les lots pour éviter la surcharge
			if (batches.length > 1) {
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}
		}

		info(
			`Notifications bulk envoyées: ${totalSent}/${users.length} utilisateurs`,
		);

		return { sent: totalSent, total: users.length };
	}

	// 🎯 Notifications spécialisées pour Harvests
	static async notifyNewOrder(order) {
		const toSellerIds = new Set();

		const addSeller = (value) => {
			if (!value) return;
			if (typeof value === "string") {
				toSellerIds.add(value);
				return;
			}
			if (value?._id) {
				toSellerIds.add(value._id.toString());
				return;
			}
			if (typeof value.toString === "function") {
				toSellerIds.add(value.toString());
			}
		};

		addSeller(order.seller);
		(order.segments || []).forEach((segment) => addSeller(segment?.seller));
		if (toSellerIds.size === 0 && Array.isArray(order.items)) {
			order.items.forEach((item) => addSeller(item?.seller));
		}

		const buyer = await this.getUser(order.buyer);

		// Notifier les vendeurs
		for (const sellerId of toSellerIds) {
			const sellerUser = await this.getUser(sellerId);
			if (!sellerUser) continue;

			await this.sendMultiChannelNotification(
				sellerUser,
				{
					title: "🛒 Nouvelle commande !",
					body: `Vous avez reçu une commande de ${order.total} XAF`,
					clickAction: `/producer/orders/${order._id}`,
					actionText: "Voir la commande",
					emailTemplate: "new-order",
				},
				{
					orderId: order._id.toString(),
					orderNumber: order.orderNumber,
					amount: order.total,
				},
			);
		}

		// Confirmer au client
		if (buyer) {
			await this.sendMultiChannelNotification(
				buyer,
				{
					title: "✅ Commande confirmée",
					body: `Votre commande ${order.orderNumber} a été enregistrée`,
					clickAction: `/orders/${order._id}`,
					actionText: "Suivre ma commande",
					emailTemplate: "order-confirmation",
				},
				{
					orderId: order._id.toString(),
					orderNumber: order.orderNumber,
				},
			);
		}
	}

	// 📦 Notifier changement de statut commande
	static async notifyOrderStatusChange(order, newStatus) {
		const buyer = await this.getUser(order.buyer);

		if (!buyer) return;

		const statusMessages = {
			confirmed: "✅ Commande confirmée par le producteur",
			preparing: "📦 Votre commande est en préparation",
			"ready-for-pickup": "🚚 Commande prête pour la collecte",
			"in-transit": "🛣️ Votre commande est en route",
			delivered: "🎉 Commande livrée avec succès !",
			cancelled: "❌ Commande annulée",
		};

		await this.sendMultiChannelNotification(
			buyer,
			{
				title: "Mise à jour de votre commande",
				body: statusMessages[newStatus] || "Statut de commande mis à jour",
				clickAction: `/orders/${order._id}`,
				actionText: "Voir détails",
				emailTemplate: "order-status-update",
			},
			{
				orderId: order._id.toString(),
				orderNumber: order.orderNumber,
				status: newStatus,
			},
		);
	}

	// ⭐ Notifier nouvel avis
	static async notifyNewReview(review) {
		const producer = await this.getUser(review.producer);

		if (!producer) return;

		await this.sendMultiChannelNotification(
			producer,
			{
				title: `⭐ Nouvel avis ${review.rating}/5`,
				body: `"${review.title}" - Un client a laissé un avis`,
				clickAction: `/producer/reviews/${review._id}`,
				actionText: "Voir l'avis",
				emailTemplate: "new-review",
			},
			{
				reviewId: review._id.toString(),
				rating: review.rating,
				title: review.title,
			},
		);
	}

	// 💰 Notifier paiement reçu
	static async notifyPaymentReceived(order, payment) {
		const sellerIds = new Set();
		const addSeller = (value) => {
			if (!value) return;
			if (typeof value === "string") {
				sellerIds.add(value);
				return;
			}
			if (value?._id) {
				sellerIds.add(value._id.toString());
				return;
			}
			if (typeof value.toString === "function") {
				sellerIds.add(value.toString());
			}
		};

		addSeller(order.seller);
		(order.segments || []).forEach((segment) => addSeller(segment?.seller));
		if (sellerIds.size === 0 && Array.isArray(order.items)) {
			order.items.forEach((item) => addSeller(item?.seller));
		}

		for (const sellerId of sellerIds) {
			const sellerUser = await this.getUser(sellerId);
			if (!sellerUser) continue;

			await this.sendMultiChannelNotification(
				sellerUser,
				{
					title: "💰 Paiement reçu !",
					body: `Paiement de ${payment.amount} XAF pour la commande ${order.orderNumber}`,
					clickAction: `/producer/payments/${payment._id}`,
					actionText: "Voir paiement",
					emailTemplate: "payment-received",
				},
				{
					orderId: order._id.toString(),
					paymentId: payment._id?.toString(),
					amount: payment.amount,
				},
			);
		}
	}

	// 🕒 Notifications programmées
	static setupScheduledNotifications() {
		// Rappel quotidien pour les commandes en attente (9h00)
		cron.schedule("0 9 * * *", async () => {
			await this.sendPendingOrderReminders();
		});

		// Rappel hebdomadaire pour les producteurs inactifs (lundi 10h00)
		cron.schedule("0 10 * * 1", async () => {
			await this.sendInactiveProducerReminders();
		});

		// Notification promotionnelle mensuelle (1er du mois 14h00)
		cron.schedule("0 14 1 * *", async () => {
			await this.sendMonthlyPromotions();
		});

		// Vérification quotidienne des abonnements (8h00)
		cron.schedule("0 8 * * *", async () => {
			await this.sendSubscriptionReminders();
		});

		info("Notifications programmées configurées");
	}

	// 📋 Rappels commandes en attente
	static async sendPendingOrderReminders() {
		try {
			const Order = require("../models/Order");
			const pendingOrders = await Order.find({
				status: "pending",
				createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Plus de 24h
			}).populate("seller buyer");

			for (const order of pendingOrders) {
				const sellerIds = new Set();
				const addSeller = (value) => {
					if (!value) return;
					if (typeof value === "string") {
						sellerIds.add(value);
						return;
					}
					if (value?._id) {
						sellerIds.add(value._id.toString());
						return;
					}
					if (typeof value.toString === "function") {
						sellerIds.add(value.toString());
					}
				};

				addSeller(order.seller);
				(order.segments || []).forEach((segment) => addSeller(segment?.seller));
				if (sellerIds.size === 0 && Array.isArray(order.items)) {
					order.items.forEach((item) => addSeller(item?.seller));
				}

				for (const sellerId of sellerIds) {
					const sellerUser = await this.getUser(sellerId);
					if (!sellerUser) continue;

					await this.sendMultiChannelNotification(sellerUser, {
						title: "⏰ Commande en attente",
						body: `N'oubliez pas de traiter la commande ${order.orderNumber}`,
						clickAction: `/producer/orders/${order._id}`,
						actionText: "Traiter maintenant",
					});
				}
			}

			info(`Rappels envoyés pour ${pendingOrders.length} commandes en attente`);
		} catch (err) {
			error("Erreur rappels commandes en attente:", err);
		}
	}

	// 😴 Rappels producteurs inactifs
	static async sendInactiveProducerReminders() {
		try {
			const User = require("../models/User");
			const inactiveProducers = await User.find({
				userType: "producer",
				lastActivity: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Plus de 7 jours
				isActive: true,
			});

			for (const producer of inactiveProducers) {
				await this.sendMultiChannelNotification(producer, {
					title: "🌾 Revenez sur Harvests !",
					body: "Vos clients vous attendent. Ajoutez de nouveaux produits !",
					clickAction: "/producer/dashboard",
					actionText: "Voir mon tableau de bord",
				});
			}

			info(
				`Rappels envoyés à ${inactiveProducers.length} producteurs inactifs`,
			);
		} catch (err) {
			error("Erreur rappels producteurs inactifs:", err);
		}
	}

	// 🎁 Promotions mensuelles
	static async sendMonthlyPromotions() {
		try {
			const User = require("../models/User");
			const consumers = await User.find({
				userType: "consumer",
				"preferences.notifications.promotional": true,
			});

			await this.sendBulkNotification(consumers, {
				title: "🎁 Offres spéciales du mois !",
				body: "Découvrez nos produits bio en promotion",
				clickAction: "/promotions",
				actionText: "Voir les offres",
				emailTemplate: "monthly-promotions",
			});

			info(
				`Promotions mensuelles envoyées à ${consumers.length} consommateurs`,
			);
		} catch (err) {
			error("Erreur promotions mensuelles:", err);
		}
	}
	// 📅 Rappels expiration abonnements
	static async sendSubscriptionReminders() {
		try {
			const Subscription = require("../models/Subscription");
			const Admin = require("../models/Admin");
			const now = new Date();

			// 1. Gérer les abonnements EXPIRÉS (au-delà de la date de fin et encore actifs)
			const expiredSubscriptions = await Subscription.find({
				status: "active",
				endDate: { $lt: now },
			}).populate("user");

			for (const sub of expiredSubscriptions) {
				// Mettre à jour le statut
				sub.status = "expired";
				await sub.save();

				if (sub.user) {
					// Notifier l'utilisateur
					await this.sendMultiChannelNotification(
						sub.user,
						{
							title: "⚠️ Votre abonnement a expiré",
							body: `Votre plan ${sub.planName} est arrivé à échéance. Renouvelez-le pour conserver vos avantages.`,
							clickAction: "/pricing",
							actionText: "Renouveler maintenant",
							emailTemplate: "subscriptionExpired",
						},
						{
							subscriptionId: sub._id.toString(),
							planName: sub.planName,
							endDate: sub.endDate.toLocaleDateString("fr-FR"),
						},
					);

					// Notifier les admins
					const admins = await Admin.find({ role: "admin" }); // Simplification, ajuster selon rôles
					for (const admin of admins) {
						await this.sendMultiChannelNotification(
							admin,
							{
								title: "🔴 Abonnement expiré",
								body: `L'abonnement de ${sub.user.firstName} ${sub.user.lastName} (${sub.planName}) a expiré.`,
								clickAction: `/admin/subscriptions`,
								actionText: "Gérer les abonnements",
							},
							{
								userId: sub.user._id.toString(),
								subscriptionId: sub._id.toString(),
							},
						);
					}
				}
			}

			if (expiredSubscriptions.length > 0) {
				info(
					`${expiredSubscriptions.length} abonnements marqués comme expirés`,
				);
			}

			// 2. Rappels préventifs (7 jours, 3 jours, 1 jour avant)
			const reminderDays = [7, 3, 1];

			for (const days of reminderDays) {
				const targetDateStart = new Date();
				targetDateStart.setDate(targetDateStart.getDate() + days);
				targetDateStart.setHours(0, 0, 0, 0);

				const targetDateEnd = new Date(targetDateStart);
				targetDateEnd.setHours(23, 59, 59, 999);

				const expiringSubscriptions = await Subscription.find({
					status: "active",
					endDate: { $gte: targetDateStart, $lte: targetDateEnd },
				}).populate("user");

				for (const sub of expiringSubscriptions) {
					if (!sub.user) continue;

					// Personnaliser le message selon l'urgence
					let title = `⏳ Expiration dans ${days} jours`;
					let body = `Votre abonnement ${sub.planName} expire bientôt. Pensez à renouveler !`;

					if (days === 1) {
						title = "⚠️ Dernier jour !";
						body = `Votre abonnement ${sub.planName} expire DEMAIN. Ne perdez pas vos avantages.`;
					}

					await this.sendMultiChannelNotification(
						sub.user,
						{
							title: title,
							body: body,
							clickAction: "/pricing",
							actionText: "Prolonger mon abonnement",
							emailTemplate: "subscriptionExpiring",
						},
						{
							daysLeft: days,
							planName: sub.planName,
							endDate: sub.endDate.toLocaleDateString("fr-FR"),
						},
					);
				}
				if (expiringSubscriptions.length > 0) {
					info(
						`${expiringSubscriptions.length} rappels d'expiration (J-${days}) envoyés`,
					);
				}
			}
		} catch (err) {
			error("Erreur gestion rappels abonnements:", err);
		}
	}

	// 🧹 Nettoyer tokens FCM invalides
	static async cleanInvalidTokens(tokens, responses) {
		const User = require("../models/User");
		const invalidTokens = [];

		responses.forEach((response, index) => {
			if (!response.success) {
				if (
					response.error?.code === "messaging/invalid-registration-token" ||
					response.error?.code === "messaging/registration-token-not-registered"
				) {
					invalidTokens.push(tokens[index]);
				}
			}
		});

		if (invalidTokens.length > 0) {
			await User.updateMany(
				{ fcmTokens: { $in: invalidTokens } },
				{ $pullAll: { fcmTokens: invalidTokens } },
			);

			info(`${invalidTokens.length} tokens FCM invalides supprimés`);
		}
	}

	// 🗑️ Supprimer subscription Web Push expirée (User & Admin)
	static async removeExpiredSubscription(subscription) {
		const User = require("../models/User");
		const Admin = require("../models/Admin");

		// Supprimer des utilisateurs
		await User.updateMany(
			{ "webPushSubscriptions.endpoint": subscription.endpoint },
			{ $pull: { webPushSubscriptions: { endpoint: subscription.endpoint } } },
		);

		// Supprimer des admins
		await Admin.updateMany(
			{ "webPushSubscriptions.endpoint": subscription.endpoint },
			{ $pull: { webPushSubscriptions: { endpoint: subscription.endpoint } } },
		);

		info("Subscription Web Push expirée supprimée (User/Admin)");
	}

	// 👤 Obtenir utilisateur avec gestion d'erreur (supporte User et Admin)
	static async getUser(userId) {
		try {
			const User = require("../models/User");
			const Admin = require("../models/Admin");

			// Essayer d'abord dans User
			let person = await User.findById(userId).select(
				"+preferences +notificationSettings +fcmTokens +webPushSubscriptions",
			);

			// Si non trouvé, essayer dans Admin
			if (!person) {
				person = await Admin.findById(userId).select(
					"+preferences +fcmTokens +webPushSubscriptions",
				);
			}

			return person;
		} catch (err) {
			error(`Erreur récupération destinataire ${userId}:`, err);
			return null;
		}
	}
}

module.exports = NotificationService;
