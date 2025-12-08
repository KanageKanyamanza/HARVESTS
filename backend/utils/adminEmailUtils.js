const Admin = require('../models/Admin');
const Email = require('./email/emailClass');
const nodemailer = require('nodemailer');

/**
 * Récupère tous les emails de notification des admins actifs
 * @returns {Promise<string[]>} - Tableau des emails de notification
 */
exports.getAdminNotificationEmails = async () => {
  try {
    const activeAdmins = await Admin.find({ 
      isActive: true,
      notificationEmail: { $exists: true, $ne: null, $ne: '' }
    }).select('notificationEmail').lean();

    const emails = activeAdmins
      .map(admin => admin.notificationEmail)
      .filter(Boolean)
      .filter((email, index, self) => self.indexOf(email) === index); // Éviter les doublons

    return emails;
  } catch (error) {
    console.error('Erreur lors de la récupération des emails admin:', error);
    return [];
  }
};

/**
 * Récupère tous les emails de notification des admins actifs + l'email de contact par défaut
 * @returns {Promise<string[]>} - Tableau des emails (admins + contact)
 */
exports.getAllAdminEmails = async () => {
  const adminEmails = await exports.getAdminNotificationEmails();
  const contactEmail = process.env.CONTACT_EMAIL || 'contact@harvests.site';
  
  // Éviter les doublons
  const allEmails = [...new Set([...adminEmails, contactEmail])];
  
  return allEmails;
};

/**
 * Récupère les informations complètes des admins actifs avec leur email de notification
 * @returns {Promise<Array>} - Tableau des admins avec leurs informations
 */
exports.getActiveAdminsWithNotificationEmail = async () => {
  try {
    const activeAdmins = await Admin.find({ 
      isActive: true,
      notificationEmail: { $exists: true, $ne: null, $ne: '' }
    }).select('notificationEmail firstName lastName email role').lean();

    return activeAdmins;
  } catch (error) {
    console.error('Erreur lors de la récupération des admins:', error);
    return [];
  }
};

/**
 * Configuration du transport email
 */
const getEmailTransport = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Production: SendGrid
  if (isProduction && process.env.SENDGRID_API_KEY) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    return { type: 'sendgrid', client: sgMail };
  }
  
  // Développement: Gmail
  if (!isProduction && process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return {
      type: 'nodemailer',
      client: nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      }),
    };
  }
  
  // SMTP générique
  if (process.env.EMAIL_HOST && process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD) {
    return {
      type: 'nodemailer',
      client: nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      }),
    };
  }
  
  return null;
};

/**
 * Envoie un email de notification aux admins
 * @param {Object} options - Options pour l'email
 * @param {string} options.title - Titre de la notification
 * @param {string} options.message - Message de la notification
 * @param {Object} options.data - Données supplémentaires à inclure dans l'email
 * @param {Array} options.actions - Actions possibles (liens, etc.)
 * @returns {Promise<void>}
 */
exports.sendNotificationToAdmins = async ({ title, message, data = {}, actions = [] }) => {
  try {
    const recipientEmails = await exports.getAllAdminEmails();
    
    if (recipientEmails.length === 0) {
      console.log('⚠️ Aucun email admin configuré pour recevoir les notifications');
      return;
    }

    const transport = getEmailTransport();
    
    if (!transport) {
      console.error('⚠️ Configuration email non disponible pour envoyer aux admins');
      return;
    }

    const fromEmail = process.env.EMAIL_FROM || 'noreply@harvests.site';
    
    // Créer le contenu HTML de l'email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
          }
          .header {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            padding: 30px;
            text-align: center;
            color: white;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .info-box {
            margin: 15px 0;
            padding: 15px;
            background-color: #f3f4f6;
            border-radius: 4px;
            border-left: 4px solid #16a34a;
          }
          .info-row {
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .label {
            font-weight: bold;
            color: #16a34a;
            display: inline-block;
            min-width: 150px;
          }
          .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          .action-button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #16a34a;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 5px 0 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px; line-height: 1.6;">${message}</p>
            
            ${Object.keys(data).length > 0 ? `
              <div class="info-box">
                <h3 style="margin-top: 0; color: #111827;">Détails :</h3>
                ${Object.entries(data).map(([key, value]) => {
                  if (typeof value === 'object' && value !== null) return '';
                  return `
                    <div class="info-row">
                      <span class="label">${key}:</span>
                      <span>${value || 'N/A'}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : ''}
            
            ${actions.length > 0 ? `
              <div style="margin-top: 20px; text-align: center;">
                ${actions.map(action => `
                  <a href="${action.url || '#'}" class="action-button">${action.label || 'Voir'}</a>
                `).join('')}
              </div>
            ` : ''}
            
            <div class="footer">
              <p>Email envoyé automatiquement par le système Harvests</p>
              <p>Date: ${new Date().toLocaleString('fr-FR')}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
${title}

${message}

${Object.keys(data).length > 0 ? `
Détails:
${Object.entries(data).map(([key, value]) => `${key}: ${value || 'N/A'}`).join('\n')}
` : ''}

---
Email envoyé automatiquement par le système Harvests
Date: ${new Date().toLocaleString('fr-FR')}
    `;

    if (transport.type === 'sendgrid') {
      // Envoi via SendGrid à tous les admins
      const messages = recipientEmails.map(recipientEmail => ({
        to: recipientEmail,
        from: {
          email: fromEmail,
          name: 'Harvests Notifications'
        },
        subject: `[Harvests] ${title}`,
        text: textContent,
        html: htmlContent,
      }));

      await transport.client.send(messages);
    } else {
      // Envoi via Nodemailer à tous les admins
      const emailPromises = recipientEmails.map(recipientEmail =>
        transport.client.sendMail({
          from: `"Harvests Notifications" <${fromEmail}>`,
          to: recipientEmail,
          subject: `[Harvests] ${title}`,
          text: textContent,
          html: htmlContent,
        })
      );

      await Promise.all(emailPromises);
    }

    console.log(`Email de notification envoyé à ${recipientEmails.length} admin(s)`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email aux admins:', error);
    // Ne pas faire échouer la requête si l'email échoue
  }
};

