const nodemailer = require('nodemailer');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { getAllAdminEmails } = require('../utils/adminEmailUtils');

// Configuration du transport email
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

// Envoyer un email de contact
exports.sendContactMessage = catchAsync(async (req, res, next) => {
  const { name, email, subject, message, type } = req.body;

  // Validation
  if (!name || !email || !subject || !message) {
    return next(new AppError('Tous les champs sont requis', 400));
  }

  // Validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Adresse email invalide', 400));
  }

  const transport = getEmailTransport();
  
  if (!transport) {
    return next(new AppError('Configuration email non disponible', 500));
  }

  // Récupérer tous les emails des admins actifs qui ont configuré leur email de notification
  const recipientEmails = await getAllAdminEmails();

  const fromEmail = process.env.EMAIL_FROM || 'noreply@harvests.site';

  // Types de demande
  const typeLabels = {
    general: 'Question générale',
    support: 'Support technique',
    partnership: 'Partenariat',
    complaint: 'Réclamation',
    suggestion: 'Suggestion'
  };

  const typeLabel = typeLabels[type] || 'Question générale';

  // Contenu HTML de l'email
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
        .info-row {
          margin-bottom: 15px;
          padding: 10px;
          background-color: #f3f4f6;
          border-radius: 4px;
        }
        .label {
          font-weight: bold;
          color: #16a34a;
        }
        .message-box {
          margin-top: 20px;
          padding: 15px;
          background-color: #f9fafb;
          border-left: 4px solid #16a34a;
          border-radius: 4px;
        }
        .footer {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nouveau message de contact</h1>
        </div>
        <div class="content">
          <div class="info-row">
            <span class="label">Type de demande:</span> ${typeLabel}
          </div>
          <div class="info-row">
            <span class="label">Nom:</span> ${name}
          </div>
          <div class="info-row">
            <span class="label">Email:</span> <a href="mailto:${email}">${email}</a>
          </div>
          <div class="info-row">
            <span class="label">Sujet:</span> ${subject}
          </div>
          <div class="message-box">
            <div class="label">Message:</div>
            <p style="white-space: pre-wrap; margin-top: 10px;">${message}</p>
          </div>
          <div class="footer">
            <p>Ce message a été envoyé depuis le formulaire de contact de Harvests</p>
            <p>Vous pouvez répondre directement à cet email pour contacter ${name}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Contenu texte brut
  const textContent = `
Nouveau message de contact - Harvests

Type de demande: ${typeLabel}
Nom: ${name}
Email: ${email}
Sujet: ${subject}

Message:
${message}

---
Ce message a été envoyé depuis le formulaire de contact de Harvests
Vous pouvez répondre directement à cet email pour contacter ${name}
  `;

  try {
    if (transport.type === 'sendgrid') {
      // Envoi via SendGrid à tous les admins
      const messages = recipientEmails.map(recipientEmail => ({
        to: recipientEmail,
        from: {
          email: fromEmail,
          name: 'Harvests Contact'
        },
        replyTo: email,
        subject: `[Contact Harvests] ${subject}`,
        text: textContent,
        html: htmlContent,
      }));

      // SendGrid peut envoyer plusieurs emails en une seule requête
      await transport.client.send(messages);
    } else {
      // Envoi via Nodemailer à tous les admins
      const emailPromises = recipientEmails.map(recipientEmail =>
        transport.client.sendMail({
          from: `"Harvests Contact" <${fromEmail}>`,
          to: recipientEmail,
          replyTo: email,
          subject: `[Contact Harvests] ${subject}`,
          text: textContent,
          html: htmlContent,
        })
      );

      await Promise.all(emailPromises);
    }

    res.status(200).json({
      status: 'success',
      message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
    });
  } catch (error) {
    console.error('Erreur envoi email contact:', error);
    return next(new AppError('Erreur lors de l\'envoi du message. Veuillez réessayer plus tard.', 500));
  }
});

