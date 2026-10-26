const { translate } = require("../translate");
const addEmailTransportMethods = require("./emailTransport");
const addEmailCoreMethods = require("./emailCore");
const addEmailTemplateMethods = require("./emailTemplates");
const addEmailNotificationMethod = require("./emailNotification");
const addEmailNewsletterMethod = require("./emailNewsletter");
const addEmailMailingMethod = require("./emailMailing");

// Classe Email principale
class Email {
	// Langue : celle demandée explicitement, sinon la préférence du compte
	// (le français reste la langue de repli, seule autre langue : l'anglais).
	constructor(user, url, language) {
		this.to = user.email;
		this.firstName = user.firstName;
		// Lien de base des gabarits : lien explicite (vérification, réinitialisation)
		// ou accueil du site pour les e-mails déclenchés sans lien (rejet, abonnement).
		this.url =
			url || process.env.FRONTEND_URL || "https://www.harvests.site";
		this.from = `Harvests <${process.env.EMAIL_FROM}>`;
		const requested = String(language || user.preferredLanguage || "fr")
			.slice(0, 2)
			.toLowerCase();
		this.language = requested === "en" ? "en" : "fr";
		this.t = (key, params) => translate(key, this.language, params) ?? key;
	}
}

// Ajouter toutes les méthodes à la classe
addEmailTransportMethods(Email);
addEmailCoreMethods(Email);
addEmailTemplateMethods(Email);
addEmailNotificationMethod(Email);
addEmailNewsletterMethod(Email);
addEmailMailingMethod(Email);

module.exports = Email;
