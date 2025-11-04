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
    // 🥇 SendGrid (MEILLEUR pour Render - 100 emails/jour GRATUIT, très fiable)
    if (process.env.SENDGRID_API_KEY) {
      console.log('📧 Configuration email: SendGrid (Recommandé pour Render)');
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
        connectionTimeout: 30000, // 30 secondes
        greetingTimeout: 30000,
        socketTimeout: 30000,
        debug: true,
        logger: true
      });
    }
    
    // 🥈 Mailgun (EXCELLENT - 5000 emails/mois GRATUIT)
    if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
      console.log('📧 Configuration email: Mailgun');
      return nodemailer.createTransport({
        host: `smtp.mailgun.org`,
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAILGUN_SMTP_USER || `postmaster@${process.env.MAILGUN_DOMAIN}`,
          pass: process.env.MAILGUN_SMTP_PASSWORD || process.env.MAILGUN_API_KEY,
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
        debug: true,
        logger: true
      });
    }
    
    // 🥉 Gmail avec Nodemailer (500 emails/jour - peut avoir des timeouts sur Render)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      console.log('📧 Configuration email: Gmail (Nodemailer)');
      console.log('⚠️  Note: Gmail peut avoir des problèmes de timeout sur Render');
      console.log('💡 Recommandation: Utilisez SendGrid ou Mailgun pour plus de fiabilité');
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
        // Timeouts augmentés pour éviter les erreurs de connexion
        connectionTimeout: 60000, // 60 secondes (au lieu de 2 par défaut)
        greetingTimeout: 60000,
        socketTimeout: 60000,
        pool: true, // Réutiliser les connexions
        maxConnections: 1,
        maxMessages: 3,
        debug: true,
        logger: true
      });
    }
    
    // 🔧 FALLBACK: Configuration SMTP générique
    const emailHost = process.env.EMAIL_HOST || 'localhost';
    const emailPort = parseInt(process.env.EMAIL_PORT) || 587;
    const emailUser = process.env.EMAIL_USERNAME;
    
    if (!emailUser || !process.env.EMAIL_PASSWORD) {
      console.error('❌ Configuration email SMTP incomplète:');
      console.error(`   EMAIL_HOST: ${emailHost}`);
      console.error(`   EMAIL_PORT: ${emailPort}`);
      console.error(`   EMAIL_USERNAME: ${emailUser ? '✅ Configuré' : '❌ Manquant'}`);
      console.error(`   EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✅ Configuré' : '❌ Manquant'}`);
      console.error('');
      console.error('💡 Solutions recommandées:');
      console.error('   1. SendGrid (GRATUIT - 100 emails/jour): https://sendgrid.com');
      console.error('   2. Mailgun (GRATUIT - 5000 emails/mois): https://mailgun.com');
      console.error('   3. EmailJS (GRATUIT - 200 emails/mois): https://emailjs.com');
    } else {
      console.log(`📧 Configuration email: SMTP (${emailHost}:${emailPort})`);
    }
    
    return nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: emailUser,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      tls: {
        rejectUnauthorized: false // Pour serveurs SMTP locaux
      },
      debug: true,
      logger: true
    });
  }

  // Envoyer l'email avec fallback EmailJS (si configuré)
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
      const transporter = this.newTransport();
      console.log(`📧 Tentative d'envoi email à ${this.to} via ${process.env.GMAIL_USER ? 'Gmail' : 'SMTP'}`);
      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Email envoyé avec succès via Nodemailer');
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   Response: ${result.response}`);
      return result;
    } catch (error) {
      console.error('❌ Erreur Nodemailer détaillée:');
      console.error(`   Message: ${error.message}`);
      console.error(`   Code: ${error.code || 'N/A'}`);
      console.error(`   Command: ${error.command || 'N/A'}`);
      console.error(`   Response: ${error.response || 'N/A'}`);
      console.error(`   Stack: ${error.stack}`);
      
      // Vérifier la configuration
      if (error.code === 'EAUTH' || error.message.includes('Invalid login')) {
        console.error('🔐 ERREUR D\'AUTHENTIFICATION:');
        console.error('   - Vérifiez GMAIL_USER et GMAIL_APP_PASSWORD (pour Gmail)');
        console.error('   - Ou EMAIL_USERNAME et EMAIL_PASSWORD (pour SMTP)');
        console.error('   - Pour Gmail: Activez l\'authentification 2FA et créez un mot de passe d\'application');
      } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT' || error.message.includes('connect') || error.message.includes('timeout')) {
        console.error('🔌 ERREUR DE CONNEXION/TIMEOUT:');
        console.error('   - Vérifiez EMAIL_HOST et EMAIL_PORT');
        console.error('   - Vérifiez que le serveur SMTP est accessible depuis Render');
        console.error('   - Gmail peut être bloqué par les restrictions réseau de Render');
        console.error('   💡 SOLUTIONS RECOMMANDÉES:');
        console.error('      1. Utilisez SendGrid (GRATUIT - 100 emails/jour): https://sendgrid.com');
        console.error('      2. Utilisez Mailgun (GRATUIT - 5000 emails/mois): https://mailgun.com');
        console.error('      3. Configurez EmailJS comme fallback (GRATUIT - 200 emails/mois)');
      }
      
      // 4) Fallback avec EmailJS seulement si configuré
      if (this.isEmailJSConfigured()) {
        console.log('🔄 Tentative de fallback avec EmailJS...');
        try {
          await this.sendWithEmailJS(subject, html);
          console.log('✅ Email envoyé avec succès via EmailJS (fallback)');
        } catch (emailjsError) {
          console.error('❌ Erreur EmailJS également:', emailjsError.message);
          throw new Error(`Échec envoi email: Nodemailer (${error.message}) et EmailJS (${emailjsError.message})`);
        }
      } else {
        console.warn('⚠️ EmailJS non configuré, échec définitif de l\'envoi d\'email');
        throw new Error(`Échec envoi email: Nodemailer (${error.message}) - EmailJS non configuré`);
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
      const transporter = this.newTransport();
      console.log('🔌 Test de connexion email...');
      await transporter.verify();
      console.log('✅ Connexion email réussie !');
      return true;
    } catch (error) {
      console.error('❌ Erreur connexion email:');
      console.error(`   Message: ${error.message}`);
      console.error(`   Code: ${error.code || 'N/A'}`);
      if (error.code === 'EAUTH') {
        console.error('   🔐 Problème d\'authentification - Vérifiez vos identifiants');
      } else if (error.code === 'ECONNECTION') {
        console.error('   🔌 Problème de connexion - Vérifiez EMAIL_HOST et EMAIL_PORT');
      }
      return false;
    }
  }

  // Vérifier si EmailJS est configuré
  isEmailJSConfigured() {
    return !!(process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_PUBLIC_KEY);
  }

  // Méthode EmailJS pour le fallback
  async sendWithEmailJS(subject, html) {
    if (!this.isEmailJSConfigured()) {
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
      console.error('❌ Erreur Nodemailer:', error.message);
      
      if (this.isEmailJSConfigured()) {
        try {
          // Fallback EmailJS seulement si configuré
          const emailjsResult = await this.sendWithEmailJS('🧪 Test Harvests - EmailJS', testHtml);
          console.log('✅ Email de test envoyé avec succès via EmailJS (fallback) !');
          return emailjsResult;
        } catch (emailjsError) {
          console.error('❌ Erreur EmailJS également:', emailjsError.message);
          throw new Error(`Échec test email: Nodemailer (${error.message}) et EmailJS (${emailjsError.message})`);
        }
      } else {
        console.warn('⚠️ EmailJS non configuré, échec définitif du test d\'email');
        throw new Error(`Échec test email: Nodemailer (${error.message}) - EmailJS non configuré`);
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
