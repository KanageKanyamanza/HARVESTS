const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const { getTranslations } = require('../config/i18n');
const emailjs = require('@emailjs/nodejs');

// SendGrid SDK (pour production - évite les restrictions SMTP de Render)
let sgMail;
if (process.env.SENDGRID_API_KEY) {
  try {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  } catch (error) {
    console.warn('⚠️ @sendgrid/mail non installé, utilisation de SMTP');
  }
}

module.exports = class Email {
  constructor(user, url, language = 'fr') {
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.from = `Harvests <${process.env.EMAIL_FROM}>`;
    this.language = language || user.preferredLanguage || 'fr';
    this.t = getTranslations(this.language).t;
  }

  // Envoyer avec SendGrid API (production uniquement)
  async sendWithSendGrid(subject, html, text) {
    if (!sgMail) {
      throw new Error('SendGrid SDK non disponible');
    }

    // Extraire l'email "from" (peut être "Harvests <email@example.com>" ou juste "email@example.com")
    const fromEmail = this.from.match(/<(.+)>/)?.[1] || this.from;
    
    const msg = {
      to: this.to,
      from: {
        email: fromEmail,
        name: 'Harvests'
      },
      subject: subject,
      text: text,
      html: html,
      // Amélioration de la délivrabilité (éviter le spam)
      mailSettings: {
        sandboxMode: {
          enable: false // Désactiver le mode sandbox en production
        }
      },
      // Catégories pour le tracking (optionnel)
      categories: ['harvests', 'authentication'],
      // Headers personnalisés pour améliorer la délivrabilité
      customArgs: {
        source: 'harvests-platform',
        environment: process.env.NODE_ENV || 'production'
      }
    };

    try {
      const result = await sgMail.send(msg);
      console.log('✅ Email envoyé avec succès via SendGrid API');
      console.log(`   Status Code: ${result[0].statusCode}`);
      return result;
    } catch (error) {
      console.error('❌ Erreur SendGrid API:');
      console.error(`   Message: ${error.message}`);
      if (error.response) {
        console.error(`   Status Code: ${error.response.statusCode}`);
        console.error(`   Body: ${JSON.stringify(error.response.body)}`);
      }
      throw error;
    }
  }

  // Transport Nodemailer pour développement (Gmail)
  newTransport() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // En PRODUCTION: SendGrid via API (pas SMTP)
    if (isProduction && process.env.SENDGRID_API_KEY) {
      // Ne pas créer de transport SMTP, on utilisera l'API directement
      return null;
    }

    // En DÉVELOPPEMENT: Gmail avec Nodemailer
    if (!isProduction && process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      console.log('📧 Configuration email: Gmail (Nodemailer) - DÉVELOPPEMENT');
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
        connectionTimeout: 60000,
        greetingTimeout: 60000,
        socketTimeout: 60000,
        pool: true,
        maxConnections: 1,
        maxMessages: 3,
        debug: true,
        logger: true
      });
    }

    // FALLBACK: Configuration SMTP générique
    const emailHost = process.env.EMAIL_HOST || 'localhost';
    const emailPort = parseInt(process.env.EMAIL_PORT) || 587;
    const emailUser = process.env.EMAIL_USERNAME;
    
    if (!emailUser || !process.env.EMAIL_PASSWORD) {
      if (isProduction) {
        console.error('❌ Configuration email PRODUCTION incomplète!');
        console.error('   En production, configurez SENDGRID_API_KEY');
      } else {
        console.error('❌ Configuration email DÉVELOPPEMENT incomplète!');
        console.error('   En développement, configurez GMAIL_USER + GMAIL_APP_PASSWORD');
      }
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
        rejectUnauthorized: false
      },
      debug: true,
      logger: true
    });
  }

  // Envoyer l'email avec fallback EmailJS (si configuré)
  async send(template, subject) {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // 1) Générer le HTML basé sur un template pug
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const text = htmlToText.convert(html);

    // 2) PRODUCTION: Utiliser SendGrid API (pas SMTP)
    if (isProduction && process.env.SENDGRID_API_KEY) {
      try {
        console.log(`📧 Tentative d'envoi email à ${this.to} via SendGrid API (PRODUCTION)`);
        const result = await this.sendWithSendGrid(subject, html, text);
        return result;
      } catch (error) {
        console.error('❌ Erreur SendGrid API:', error.message);
        
        // Fallback EmailJS si configuré
        if (this.isEmailJSConfigured()) {
          console.log('🔄 Tentative de fallback avec EmailJS...');
          try {
            await this.sendWithEmailJS(subject, html);
            console.log('✅ Email envoyé avec succès via EmailJS (fallback)');
            return;
          } catch (emailjsError) {
            console.error('❌ Erreur EmailJS également:', emailjsError.message);
            throw new Error(`Échec envoi email: SendGrid (${error.message}) et EmailJS (${emailjsError.message})`);
          }
        } else {
          throw new Error(`Échec envoi email: SendGrid (${error.message}) - EmailJS non configuré`);
        }
      }
    }

    // 3) DÉVELOPPEMENT: Utiliser Gmail avec Nodemailer
    try {
      const transporter = this.newTransport();
      if (!transporter) {
        throw new Error('Aucun transport email configuré');
      }
      
      console.log(`📧 Tentative d'envoi email à ${this.to} via Gmail (DÉVELOPPEMENT)`);
      
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Email envoyé avec succès via Nodemailer');
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   Response: ${result.response}`);
      return result;
    } catch (error) {
      console.error('❌ Erreur Nodemailer détaillée:');
      console.error(`   Message: ${error.message}`);
      console.error(`   Code: ${error.code || 'N/A'}`);
      
      if (error.code === 'EAUTH' || error.message.includes('Invalid login')) {
        console.error('🔐 ERREUR D\'AUTHENTIFICATION:');
        console.error('   - Vérifiez GMAIL_USER et GMAIL_APP_PASSWORD');
        console.error('   - Pour Gmail: Activez l\'authentification 2FA et créez un mot de passe d\'application');
      } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
        console.error('🔌 ERREUR DE CONNEXION/TIMEOUT:');
        console.error('   - Vérifiez votre connexion internet');
        console.error('   - Vérifiez que Gmail est accessible');
      }
      
      // Fallback EmailJS si configuré
      if (this.isEmailJSConfigured()) {
        console.log('🔄 Tentative de fallback avec EmailJS...');
        try {
          await this.sendWithEmailJS(subject, html);
          console.log('✅ Email envoyé avec succès via EmailJS (fallback)');
          return;
        } catch (emailjsError) {
          console.error('❌ Erreur EmailJS également:', emailjsError.message);
          throw new Error(`Échec envoi email: Nodemailer (${error.message}) et EmailJS (${emailjsError.message})`);
        }
      } else {
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

  async sendNotification({ title, message, data, actions }) {
    // Créer un HTML simple pour les notifications
    const actionLinks = actions && actions.length > 0 
      ? actions.map(action => `<a href="${action.url || '#'}" style="display: inline-block; padding: 10px 20px; background-color: #2E7D32; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px;">${action.label || 'Voir'}</a>`).join('')
      : '';
    
    const notificationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px;">
          <h2 style="color: #2E7D32; margin-top: 0;">🌾 ${title}</h2>
          <p style="font-size: 16px; line-height: 1.6;">${message}</p>
          ${data && Object.keys(data).length > 0 ? `
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="margin-top: 0; color: #555;">Détails:</h3>
              <ul style="list-style: none; padding: 0;">
                ${Object.entries(data).map(([key, value]) => `<li style="padding: 5px 0;"><strong>${key}:</strong> ${value}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${actionLinks ? `<div style="text-align: center; margin: 20px 0;">${actionLinks}</div>` : ''}
        </div>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #888; font-size: 12px; text-align: center;">
          Email envoyé le ${new Date().toLocaleString('fr-FR')}<br>
          L'équipe Harvests 🌾
        </p>
      </div>
    `;
    
    const text = `${title}\n\n${message}\n\n${data ? Object.entries(data).map(([key, value]) => `${key}: ${value}`).join('\n') : ''}`;
    const subject = `Harvests - ${title}`;
    
    // Utiliser sendWithSendGrid ou sendMail directement selon l'environnement
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction && process.env.SENDGRID_API_KEY) {
      try {
        return await this.sendWithSendGrid(subject, notificationHtml, text);
      } catch (error) {
        if (this.isEmailJSConfigured()) {
          return await this.sendWithEmailJS(subject, notificationHtml);
        }
        throw error;
      }
    } else {
      const transporter = this.newTransport();
      if (!transporter) {
        throw new Error('Aucun transport email configuré');
      }
      return await transporter.sendMail({
        from: this.from,
        to: this.to,
        subject,
        html: notificationHtml,
        text
      });
    }
  }

  // Méthode de test de connexion
  async testConnection() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction && process.env.SENDGRID_API_KEY) {
      // Test SendGrid API
      try {
        console.log('🔌 Test de connexion SendGrid API...');
        if (!sgMail) {
          throw new Error('SendGrid SDK non disponible');
        }
        // Test simple avec un email de test (ne sera pas envoyé réellement)
        console.log('✅ SendGrid API configurée correctement');
        return true;
      } catch (error) {
        console.error('❌ Erreur SendGrid API:');
        console.error(`   Message: ${error.message}`);
        return false;
      }
    } else {
      // Test Nodemailer
      try {
        const transporter = this.newTransport();
        if (!transporter) {
          console.error('❌ Aucun transport email configuré');
          return false;
        }
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
    const isProduction = process.env.NODE_ENV === 'production';
    const testHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2E7D32;">🌾 Test Harvests</h1>
        <p>Bonjour ${this.firstName},</p>
        <p>✅ <strong>${isProduction ? 'SendGrid API' : 'Nodemailer'} fonctionne parfaitement !</strong></p>
        <p>✅ Votre configuration email est opérationnelle</p>
        <p>✅ Harvests peut envoyer des emails</p>
        <hr>
        <p><small>Email envoyé le ${new Date().toLocaleString('fr-FR')}</small></p>
        <p>L'équipe Harvests 🌾</p>
      </div>
    `;

    const subject = `🧪 Test Harvests - ${isProduction ? 'SendGrid API' : 'Nodemailer'}`;
    const text = `Test Harvests - ${isProduction ? 'SendGrid API' : 'Nodemailer'} fonctionne ! Email envoyé à ${this.firstName}`;

    // En production, utiliser SendGrid API
    if (isProduction && process.env.SENDGRID_API_KEY) {
      try {
        const result = await this.sendWithSendGrid(subject, testHtml, text);
        console.log('✅ Email de test envoyé avec succès via SendGrid API !');
        return result;
      } catch (error) {
        console.error('❌ Erreur SendGrid API:', error.message);
        
        if (this.isEmailJSConfigured()) {
          try {
            const emailjsResult = await this.sendWithEmailJS(subject, testHtml);
            console.log('✅ Email de test envoyé avec succès via EmailJS (fallback) !');
            return emailjsResult;
          } catch (emailjsError) {
            console.error('❌ Erreur EmailJS également:', emailjsError.message);
            throw new Error(`Échec test email: SendGrid (${error.message}) et EmailJS (${emailjsError.message})`);
          }
        } else {
          throw new Error(`Échec test email: SendGrid (${error.message}) - EmailJS non configuré`);
        }
      }
    }

    // En développement, utiliser Nodemailer
    try {
      const transporter = this.newTransport();
      if (!transporter) {
        throw new Error('Aucun transport email configuré');
      }
      
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html: testHtml,
        text
      };

      const testEmail = await transporter.sendMail(mailOptions);
      console.log('✅ Email de test envoyé avec succès via Nodemailer !');
      return testEmail;
    } catch (error) {
      console.error('❌ Erreur Nodemailer:', error.message);
      
      if (this.isEmailJSConfigured()) {
        try {
          const emailjsResult = await this.sendWithEmailJS(subject, testHtml);
          console.log('✅ Email de test envoyé avec succès via EmailJS (fallback) !');
          return emailjsResult;
        } catch (emailjsError) {
          console.error('❌ Erreur EmailJS également:', emailjsError.message);
          throw new Error(`Échec test email: Nodemailer (${error.message}) et EmailJS (${emailjsError.message})`);
        }
      } else {
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
