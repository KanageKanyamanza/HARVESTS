// Méthodes d'envoi de templates spécifiques
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
		await this.send("accountApproval", "Votre compte Harvests a été approuvé!");
	};

	EmailClass.prototype.sendAccountRejection = async function (reason) {
		this.reason = reason;
		await this.send(
			"accountRejection",
			"Mise à jour de votre demande de compte Harvests",
		);
	};

	EmailClass.prototype.sendOrderConfirmation = async function (order) {
		this.order = order;
		const subject = this.t("email.subjects.order_confirmation");
		await this.send("orderConfirmation", subject);
	};

	EmailClass.prototype.sendDeliveryNotification = async function (delivery) {
		this.delivery = delivery;
		await this.send("deliveryNotification", "Votre commande est en route!");
	};

	EmailClass.prototype.sendIncompleteProfileReminder = async function (
		missingFields = [],
	) {
		const subject = "Action requise : Complétez votre profil Harvests";

		const fieldLabels = {
			address: "Adresse complète",
			farmInfo: "Informations de la ferme",
			certifications: "Certifications",
			businessInfo: "Informations sur l'entreprise",
			equipment: "Équipements",
			restaurantInfo: "Informations sur le restaurant",
			menuCategories: "Catégories de menu",
			exportCertifications: "Licences d'exportation",
			fleet: "Flotte de véhicules",
			bio: "Biographie",
			city: "Ville",
			avatar: "Photo de profil",
		};

		const formattedMissingFields = missingFields.map(
			(field) => fieldLabels[field] || field,
		);

		await this.send("incompleteProfile", subject, {
			missingFields: formattedMissingFields,
		});
	};
}

module.exports = addEmailTemplateMethods;
