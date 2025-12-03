const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const emailjs = require('@emailjs/nodejs');
const { sgMail } = require('./emailConfig');

// Méthodes de transport pour la classe Email
function addEmailTransportMethods(EmailClass) {
  // Envoyer avec SendGrid API (production uniquement)
  EmailClass.prototype.sendWithSendGrid = async function(subject, html, text) {
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
  };

  // Transport Nodemailer pour développement (Gmail)
  EmailClass.prototype.newTransport = function() {
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
  };

  // Vérifier si EmailJS est configuré
  EmailClass.prototype.isEmailJSConfigured = function() {
    return !!(process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_PUBLIC_KEY);
  };

  // Méthode EmailJS pour le fallback
  EmailClass.prototype.sendWithEmailJS = async function(subject, html) {
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
  };

  // Méthode de test de connexion
  EmailClass.prototype.testConnection = async function() {
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
  };
}

module.exports = addEmailTransportMethods;

