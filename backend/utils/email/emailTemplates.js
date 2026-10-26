// Méthodes d'envoi de templates spécifiques
const FALLBACK_BASE_URL = "https://www.harvests.site";

// Date lisible dans la langue de l'e-mail. Accepte une Date, une chaîne ISO
// ou une date déjà mise en forme (renvoyée telle quelle).
const formatDate = (value, language) => {
	if (!value) return "";
	const locale = language === "en" ? "en-GB" : "fr-FR";
	if (value instanceof Date) {
		return value.toLocaleDateString(locale, {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	}
	const text = String(value);
	if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
		const parsed = new Date(text);
		if (!Number.isNaN(parsed.getTime())) {
			return parsed.toLocaleDateString(locale, {
				day: "numeric",
				month: "long",
				year: "numeric",
			});
		}
	}
	return text;
};

// Lien absolu à partir de l'URL de base et d'un chemin interne.
const absoluteUrl = (base, path) => {
	if (!path) return "";
	if (/^https?:\/\//i.test(path)) return path;
	const root = String(base || process.env.FRONTEND_URL || FALLBACK_BASE_URL).replace(
		/\/+$/,
		"",
	);
	return `${root}${path.startsWith("/") ? "" : "/"}${path}`;
};

function addEmailTemplateMethods(EmailClass) {
	EmailClass.prototype.sendWelcome = async function () {
		const subject = this.t("email.subjects.welcome");
		await this.send("welcome", subject);
	};

	EmailClass.prototype.sendPasswordReset = async function () {
		const subject = this.t("email.subjects.password_reset");
		await this.send("passwordReset", subject);
	};

	EmailClass.prototype.sendAccountApproval = async function () {
		await this.send(
			"accountApproval",
			this.t("email.subjects.account_approval"),
		);
	};

	EmailClass.prototype.sendAccountRejection = async function (reason) {
		this.reason = reason;
		await this.send(
			"accountRejection",
			this.t("email.subjects.account_rejection"),
			{ reason },
		);
	};

	EmailClass.prototype.sendOrderConfirmation = async function (order) {
		this.order = order;
		const subject = this.t("email.subjects.order_confirmation");
		await this.send("orderConfirmation", subject, { order });
	};

	EmailClass.prototype.sendDeliveryNotification = async function (delivery) {
		this.delivery = delivery;
		await this.send(
			"deliveryNotification",
			this.t("email.subjects.delivery_notification"),
			{ delivery },
		);
	};

	EmailClass.prototype.sendIncompleteProfileReminder = async function (
		missingFields = [],
	) {
		// Libellés localisés ; un champ inconnu reste affiché tel quel.
		const formattedMissingFields = missingFields.map((field) => {
			const key = `email.incomplete_profile.fields.${field}`;
			const label = this.t(key);
			return label === key ? field : label;
		});

		await this.send(
			"incompleteProfile",
			this.t("email.subjects.incomplete_profile"),
			{ missingFields: formattedMissingFields },
		);
	};

	EmailClass.prototype.sendSubscriptionExpired = async function (data = {}) {
		this.subscription = data;
		await this.send(
			"subscriptionExpired",
			this.t("email.subjects.subscription_expired"),
			{
				planName: data.planName || "",
				endDate: formatDate(data.endDate, this.language),
				actionUrl: absoluteUrl(this.url, "/pricing"),
			},
		);
	};

	EmailClass.prototype.sendSubscriptionExpiring = async function (data = {}) {
		this.subscription = data;
		await this.send(
			"subscriptionExpiring",
			this.t("email.subjects.subscription_expiring"),
			{
				planName: data.planName || "",
				daysLeft: data.daysLeft,
				endDate: formatDate(data.endDate, this.language),
				actionUrl: absoluteUrl(this.url, "/pricing"),
			},
		);
	};

	// E-mail de notification générique (titre + texte + bouton d'action).
	// Nom distinct de `sendNotification` (emailNotification.js), qui conserve
	// l'e-mail de commande détaillé utilisé par le modèle Notification.
	EmailClass.prototype.sendGenericNotification = async function (
		notification = {},
	) {
		await this.send(
			"notification",
			notification.title || this.t("email.notification.page_title"),
			{
				title: notification.title || "",
				body: notification.body || "",
				actionUrl: absoluteUrl(this.url, notification.clickAction),
				actionText: notification.actionText || this.t("email.notification.cta"),
			},
		);
	};
}

module.exports = addEmailTemplateMethods;
