const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const { getTranslations } = require('../config/i18n');
const emailjs = require('@emailjs/nodejs');

module.exports = class Email {
  constructor(user, url, language = 'fr') {
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.from = `Harvests <${process.env.EMAIL_FROM}>`;
    this.language = language || user.preferredLanguage || 'fr';
    this.t = getTranslations(this.language).t;
  }

  newTransport() {
    // 🥇 Gmail avec Nodemailer (RECOMMANDÉ - 500 emails/jour)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
        debug: process.env.NODE_ENV === 'development',
        logger: process.env.NODE_ENV === 'development'
      });
    }
    
    // 🔧 FALLBACK: Configuration SMTP générique
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'localhost',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // Pour serveurs SMTP locaux
      },
      debug: process.env.NODE_ENV === 'development'
    });
  }

  // Envoyer l'email avec fallback EmailJS
  async send(template, subject) {
    // 1) Générer le HTML basé sur un template pug
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) Définir les options de l'email
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    // 3) Essayer d'envoyer avec Nodemailer d'abord
    try {
      await this.newTransport().sendMail(mailOptions);
      console.log('✅ Email envoyé avec succès via Nodemailer');
    } catch (error) {
      console.error('❌ Erreur Nodemailer, tentative avec EmailJS:', error.message);
      
      // 4) Fallback avec EmailJS si Nodemailer échoue
      try {
        await this.sendWithEmailJS(subject, html);
        console.log('✅ Email envoyé avec succès via EmailJS (fallback)');
      } catch (emailjsError) {
        console.error('❌ Erreur EmailJS également:', emailjsError.message);
        throw new Error(`Échec envoi email: Nodemailer (${error.message}) et EmailJS (${emailjsError.message})`);
      }
    }
  }

  async sendWelcome() {
    const subject = this.t('email.subjects.welcome');
    await this.send('welcome', subject);
  }


  async sendPasswordReset() {
    const subject = this.t('email.subjects.password_reset');
    await this.send('passwordReset', subject);
  }

  async sendAccountApproval() {
    await this.send('accountApproval', 'Votre compte Harvests a été approuvé!');
  }

  async sendAccountRejection(reason) {
    this.reason = reason;
    await this.send('accountRejection', 'Mise à jour de votre demande de compte Harvests');
  }

  async sendOrderConfirmation(order) {
    this.order = order;
    const subject = this.t('email.subjects.order_confirmation');
    await this.send('orderConfirmation', subject);
  }

  async sendDeliveryNotification(delivery) {
    this.delivery = delivery;
    await this.send('deliveryNotification', 'Votre commande est en route!');
  }

  // Méthode de test de connexion Nodemailer
  async testConnection() {
    try {
      const transporter = await this.newTransport();
      await transporter.verify();
      console.log('✅ Connexion Nodemailer réussie !');
      return true;
    } catch (error) {
      console.error('❌ Erreur connexion Nodemailer:', error.message);
      return false;
    }
  }

  // Méthode EmailJS pour le fallback
  async sendWithEmailJS(subject, html) {
    if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_TEMPLATE_ID || !process.env.EMAILJS_PUBLIC_KEY) {
      throw new Error('Configuration EmailJS manquante. Vérifiez EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID et EMAILJS_PUBLIC_KEY');
    }

    const templateParams = {
      to_email: this.to,
      to_name: this.firstName,
      from_name: 'Harvests',
      subject: subject,
      message: htmlToText.convert(html),
      html_message: html,
      reply_to: process.env.EMAIL_FROM || 'noreply@harvests.sn'
    };

    return await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
      }
    );
  }

  // Envoyer email de test simple avec fallback
  async sendTestEmail() {
    const testHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2E7D32;">🌾 Test Harvests</h1>
        <p>Bonjour ${this.firstName},</p>
        <p>✅ <strong>Nodemailer fonctionne parfaitement !</strong></p>
        <p>✅ Votre configuration email est opérationnelle</p>
        <p>✅ Harvests peut envoyer des emails</p>
        <hr>
        <p><small>Email envoyé le ${new Date().toLocaleString('fr-FR')}</small></p>
        <p>L'équipe Harvests 🌾</p>
      </div>
    `;

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: '🧪 Test Harvests - Nodemailer',
      html: testHtml,
      text: `Test Harvests - Nodemailer fonctionne ! Email envoyé à ${this.firstName}`
    };

    try {
      // Essayer Nodemailer d'abord
      const transporter = this.newTransport();
      const testEmail = await transporter.sendMail(mailOptions);
      console.log('✅ Email de test envoyé avec succès via Nodemailer !');
      return testEmail;
    } catch (error) {
      console.error('❌ Erreur Nodemailer, test avec EmailJS:', error.message);
      
      try {
        // Fallback EmailJS
        const emailjsResult = await this.sendWithEmailJS('🧪 Test Harvests - EmailJS', testHtml);
        console.log('✅ Email de test envoyé avec succès via EmailJS (fallback) !');
        return emailjsResult;
      } catch (emailjsError) {
        console.error('❌ Erreur EmailJS également:', emailjsError.message);
        throw new Error(`Échec test email: Nodemailer (${error.message}) et EmailJS (${emailjsError.message})`);
      }
    }
  }
};

// Fonctions utilitaires pour le test
const envoyerEmailVerification = async (user) => {
  const url = `${process.env.FRONTEND_URL}/verify-email/${user.emailVerificationToken}`;
  await new module.exports(user, url).sendWelcome();
};

const envoyerEmailBienvenue = async (user) => {
  const url = `${process.env.FRONTEND_URL}/dashboard`;
  await new module.exports(user, url).sendWelcome();
};

const envoyerEmailConfirmationCommande = async (order) => {
  const url = `${process.env.FRONTEND_URL}/orders/${order._id}`;
  // Simuler l'envoi
  console.log(`📧 Email confirmation commande envoyé à ${order.client.email}`);
};

const envoyerEmailNouvelleCommande = async (order) => {
  const url = `${process.env.FRONTEND_URL}/producer/orders/${order._id}`;
  // Simuler l'envoi
  console.log(`📧 Email nouvelle commande envoyé au producteur`);
};

const envoyerEmailMiseAJourCommande = async (order) => {
  const url = `${process.env.FRONTEND_URL}/orders/${order._id}`;
  // Simuler l'envoi
  console.log(`📧 Email mise à jour statut "${order.statut}" envoyé`);
};

const envoyerEmailNouvelAvis = async (review) => {
  const url = `${process.env.FRONTEND_URL}/reviews/${review._id}`;
  // Simuler l'envoi
  console.log(`📧 Email notification nouvel avis envoyé au producteur`);
};

module.exports.envoyerEmailVerification = envoyerEmailVerification;
module.exports.envoyerEmailBienvenue = envoyerEmailBienvenue;
module.exports.envoyerEmailConfirmationCommande = envoyerEmailConfirmationCommande;
module.exports.envoyerEmailNouvelleCommande = envoyerEmailNouvelleCommande;
module.exports.envoyerEmailMiseAJourCommande = envoyerEmailMiseAJourCommande;
module.exports.envoyerEmailNouvelAvis = envoyerEmailNouvelAvis;
