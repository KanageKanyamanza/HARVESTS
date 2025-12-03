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

module.exports = { sgMail };

