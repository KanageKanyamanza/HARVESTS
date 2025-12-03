const pug = require('pug');
const htmlToText = require('html-to-text');
const addEmailTransportMethods = require('./emailTransport');

// Méthode principale d'envoi d'email
function addEmailCoreMethods(EmailClass) {
  // Envoyer l'email avec fallback EmailJS (si configuré)
  EmailClass.prototype.send = async function(template, subject) {
    const isProduction = process.env.NODE_ENV === 'production';
    const isTest = process.env.NODE_ENV === 'test';
    
    // En mode test, ignorer l'envoi d'emails
    if (isTest) {
      console.log(`⏭️  Mode TEST: Email ignoré pour ${this.to} (${subject})`);
      return {
        messageId: 'test-mode-skipped',
        response: 'Email ignoré en mode test',
        testMode: true
      };
    }
    
    // 1) Générer le HTML basé sur un template pug
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.harvests.site';
    const logoUrl = `${frontendUrl}/logo.png`;
    const html = pug.renderFile(`${__dirname}/../../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
      logoUrl,
    });

    const text = htmlToText.convert(html);

    // 2) PRODUCTION ou DÉVELOPPEMENT avec SendGrid: Utiliser SendGrid API (pas SMTP)
    // Utiliser SendGrid si la clé API est définie (production ou développement)
    if (process.env.SENDGRID_API_KEY) {
      try {
        const envLabel = isProduction ? 'PRODUCTION' : 'TEST';
        console.log(`📧 Tentative d'envoi email à ${this.to} via SendGrid API (${envLabel})`);
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
  };

  // Envoyer email de test simple avec fallback
  EmailClass.prototype.sendTestEmail = async function() {
    const isProduction = process.env.NODE_ENV === 'production';
    const testHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">🌾 Test Harvests</h1>
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
  };
}

module.exports = addEmailCoreMethods;

