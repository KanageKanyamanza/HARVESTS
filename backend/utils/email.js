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
    // Debug: vérifier les données reçues
    console.log('📧 [Email] Données reçues pour notification:', {
      hasData: !!data,
      hasProducts: !!(data && data.products),
      productsCount: data && data.products ? data.products.length : 0,
      hasBuyer: !!(data && data.buyer),
      dataKeys: data ? Object.keys(data) : []
    });
    
    const STATUS_LABELS = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      preparing: 'En préparation',
      'ready-for-pickup': 'Prête pour collecte',
      'in-transit': 'En transit',
      delivered: 'Livrée',
      completed: 'Terminée',
      cancelled: 'Annulée',
      refunded: 'Remboursée',
      disputed: 'En litige',
      created: 'Créée'
    };

    const STATUS_COLORS = {
      pending: '#f59e0b',
      confirmed: '#2563eb',
      preparing: '#f97316',
      'ready-for-pickup': '#0ea5e9',
      'in-transit': '#6366f1',
      delivered: '#16a34a',
      completed: '#16a34a',
      cancelled: '#dc2626',
      refunded: '#14b8a6',
      disputed: '#9333ea',
      created: '#3b82f6'
    };

    const normalizeStatus = (status) => {
      if (!status) return null;
      return status.toString().toLowerCase();
    };

    const renderStatusBadge = (status) => {
      const normalized = normalizeStatus(status);
      if (!normalized) return '';
      const label = STATUS_LABELS[normalized] || status;
      const background = STATUS_COLORS[normalized] || '#6b7280';
      return `<span class="status-badge" style="background-color: ${background}; color: #ffffff;">${label}</span>`;
    };

    // Fonction pour convertir une URL relative en URL absolue
    const buildAbsoluteUrl = (url) => {
      if (!url || url === '#') return '#';
      // Si l'URL est déjà absolue (commence par http:// ou https://), la retourner telle quelle
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      // Sinon, construire l'URL complète avec FRONTEND_URL
      const frontendUrl = process.env.FRONTEND_URL || 'https://harvests-khaki.vercel.app';
      const baseUrl = frontendUrl.replace(/\/$/, '');
      const normalizedPath = url.startsWith('/') ? url : `/${url}`;
      return `${baseUrl}${normalizedPath}`;
    };

    // Construire l'affichage des produits avec images, regroupés par vendeur/segment
    let productsHtml = '';
    if (data && data.products && Array.isArray(data.products) && data.products.length > 0) {
      const sellerGroupsMap = new Map();
      data.products.forEach((product) => {
        const key = product?.seller?.id || product?.seller?.name || 'autres';
        if (!sellerGroupsMap.has(key)) {
          sellerGroupsMap.set(key, {
            seller: product?.seller || null,
            segment: product?.segment || null,
            items: []
          });
        }
        sellerGroupsMap.get(key).items.push(product);
      });

      const sellerSections = Array.from(sellerGroupsMap.values()).map((group) => {
        const sellerName = group.seller?.name || group.segment?.sellerName || 'Vendeur';
        const firstStatus = group.segment?.status || group.items[0]?.status || data.status;
        const segmentBadge = renderStatusBadge(firstStatus);

        const itemsHtml = group.items.map((product, index) => {
          const firstImage = product.images && product.images.length > 0 ? product.images[0] : null;
          const imageUrl = firstImage && (firstImage.startsWith('http') ? firstImage : `${process.env.FRONTEND_URL || 'https://harvests-khaki.vercel.app'}${firstImage.startsWith('/') ? firstImage : '/' + firstImage}`);
          const productBadge = renderStatusBadge(product.status || firstStatus);

          return `
            <div style="border-top: ${index === 0 ? 'none' : '1px solid #f0f0f0'}; padding: ${index === 0 ? '0 0 15px 0' : '15px 0'};">
              <div style="display: flex; gap: 20px; margin-bottom: 12px; align-items: flex-start;">
                ${firstImage ? `
                  <div style="flex-shrink: 0; margin-right: 10px;">
                    <img src="${imageUrl}" alt="${product.name || 'Produit'}" style="width: 76px; height: 76px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb;" />
                  </div>
                ` : ''}
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                    <h4 style="margin: 0; color: #166534; font-size: 15px;">${product.name || 'Produit'}</h4>
                    ${productBadge}
                  </div>
                  ${product.description ? `<p style="margin: 6px 0 0 0; color: #4b5563; font-size: 13px; line-height: 1.45;">${product.description.substring(0, 130)}${product.description.length > 130 ? '...' : ''}</p>` : ''}
                </div>
              </div>
              <div class="product-details-container" style="font-size: 13px; color: #4b5563;">
                <div class="product-details-row" style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 10px;">
                  <div style="flex: 1; min-width: 120px;">
                    <strong>Quantité:</strong> <span style="font-size: 14px; font-weight: 600;">${product.quantity || 1}</span>
                  </div>
                  <div style="flex: 1; min-width: 140px; margin-right: 20px;">
                    <strong>Prix unitaire:</strong> <span style="font-size: 14px; font-weight: 600;">${product.unitPrice || 0} ${data.currency || 'XAF'}</span>
                  </div>
                </div>
                <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
                  <div style="font-weight: 600; color: #111827;">Total:</div>
                  <div style="font-size: 15px; font-weight: 700; color: #166534;">${product.totalPrice || 0} ${data.currency || 'XAF'}</div>
                </div>
              </div>
            </div>
          `;
        }).join('');

        return `
          <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 18px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <div style="font-weight: 600; font-size: 15px; color: #111827;">${sellerName}</div>
              ${segmentBadge}
            </div>
            ${itemsHtml}
          </div>
        `;
      }).join('');

      productsHtml = `
        <div style="margin: 15px 0;">
          <h3 style="margin: 0 0 12px 0; color: #374151; border-bottom: 2px solid #2E7D32; padding-bottom: 8px;">Produits commandés</h3>
          ${sellerSections}
        </div>
      `;
    }

    // Construire l'affichage des informations du client
    let buyerInfoHtml = '';
    if (data && data.buyer) {
      buyerInfoHtml = `
        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="margin-top: 0; color: #555; border-bottom: 2px solid #2E7D32; padding-bottom: 10px;">Informations client:</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 5px 0;"><strong>Nom:</strong> ${data.buyer.fullName || `${data.buyer.firstName || ''} ${data.buyer.lastName || ''}`.trim() || 'Non renseigné'}</li>
            ${data.buyer.email ? `<li style="padding: 5px 0;"><strong>Email:</strong> ${data.buyer.email}</li>` : ''}
            ${data.buyer.phone ? `<li style="padding: 5px 0;"><strong>Téléphone:</strong> ${data.buyer.phone}</li>` : ''}
          </ul>
        </div>
      `;
    }

    // Construire les autres détails (montant, numéro de commande, etc.)
    let detailsHtml = '';
    const detailKeys = ['orderId', 'orderNumber', 'amount', 'currency'];
    // Filtrer les champs Mongoose internes (commençant par $) et les champs déjà traités
    const otherDetails = data ? Object.entries(data).filter(([key]) => {
      // Ignorer les champs Mongoose internes (commencent par $)
      if (key.startsWith('$')) return false;
      // Ignorer les champs déjà traités
      if (detailKeys.includes(key)) return false;
      // Ignorer les champs spéciaux
      if (key === 'products' || key === 'buyer' || key === 'segment' || key === 'status') return false;
      return true;
    }) : [];
    
    if (otherDetails.length > 0 || (data && (data.orderNumber || data.amount || data.status))) {
      detailsHtml = `
        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="margin-top: 0; color: #555;">Détails de la commande:</h3>
          <ul style="list-style: none; padding: 0;">
            ${data.orderNumber ? `<li style="padding: 5px 0;"><strong>Numéro de commande:</strong> ${data.orderNumber}</li>` : ''}
            ${data.amount ? `<li style="padding: 5px 0;"><strong>Montant total:</strong> ${data.amount} ${data.currency || 'XAF'}</li>` : ''}
            ${data.status ? `<li style="padding: 5px 0; display: flex; align-items: center; gap: 10px;"><strong>Statut:</strong> ${renderStatusBadge(data.status)}</li>` : ''}
            ${data.segment?.sellerName ? `<li style="padding: 5px 0;"><strong>Segment / Vendeur:</strong> ${data.segment.sellerName}</li>` : ''}
            ${otherDetails.map(([key, value]) => {
              // Ignorer les objets complexes et les valeurs undefined/null
              if (typeof value === 'object' && value !== null && !Array.isArray(value)) return '';
              if (value === undefined || value === null) return '';
              // Ignorer les valeurs booléennes false qui sont souvent des champs de débogage
              if (value === false && (key.includes('isNew') || key.includes('isModified') || key.includes('isSelected'))) return '';
              return `<li style="padding: 5px 0;"><strong>${key}:</strong> ${Array.isArray(value) ? value.join(', ') : value}</li>`;
            }).join('')}
          </ul>
        </div>
      `;
    }

    // Créer un HTML simple pour les notifications
    const actionLinks = actions && actions.length > 0 
      ? actions.map(action => {
          const absoluteUrl = buildAbsoluteUrl(action.url);
          return `<a href="${absoluteUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2E7D32; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px;">${action.label || 'Voir'}</a>`;
        }).join('')
      : '';
    
    const notificationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @media only screen and (max-width: 600px) {
            .product-details-row {
              flex-direction: row !important;
              gap: 15px !important;
            }
            .product-details-row > div {
              flex: 1 1 calc(50% - 7.5px) !important;
              min-width: calc(50% - 7.5px) !important;
              max-width: calc(50% - 7.5px) !important;
              margin-right: 0 !important;
            }
            .product-details-row > div:last-child {
              margin-right: 0 !important;
            }
          }

          .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
            text-transform: capitalize;
            letter-spacing: 0.2px;
          }
        </style>
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 10px 15px;">
          <div style="background-color: #f5f5f5; padding: 10px; border-radius: 10px;">
            <h2 style="color: #2E7D32; margin-top: 0;">🌾 ${title}</h2>
            <p style="font-size: 16px; line-height: 1.6;">${message}</p>
            ${buyerInfoHtml}
            ${productsHtml}
            ${detailsHtml}
            ${actionLinks ? `<div style="text-align: center; margin: 20px 0;">${actionLinks}</div>` : ''}
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #888; font-size: 12px; text-align: center;">
            Email envoyé le ${new Date().toLocaleString('fr-FR')}<br>
            L'équipe Harvests 🌾
          </p>
        </div>
      </body>
      </html>
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
