const { getTranslations } = require('../../config/i18n');
const addEmailTransportMethods = require('./emailTransport');
const addEmailCoreMethods = require('./emailCore');
const addEmailTemplateMethods = require('./emailTemplates');
const addEmailNotificationMethod = require('./emailNotification');

// Classe Email principale
class Email {
  constructor(user, url, language = 'fr') {
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.from = `Harvests <${process.env.EMAIL_FROM}>`;
    this.language = language || user.preferredLanguage || 'fr';
    this.t = getTranslations(this.language).t;
  }
}

// Ajouter toutes les méthodes à la classe
addEmailTransportMethods(Email);
addEmailCoreMethods(Email);
addEmailTemplateMethods(Email);
addEmailNotificationMethod(Email);

module.exports = Email;

