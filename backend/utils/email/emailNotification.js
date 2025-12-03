const htmlToText = require('html-to-text');

// Méthode sendNotification avec toute sa logique HTML
function addEmailNotificationMethod(EmailClass) {
  EmailClass.prototype.sendNotification = async function({ title, message, data, actions }) {
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
      const frontendUrl = process.env.FRONTEND_URL || 'https://www.harvests.site';
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
          const imageUrl = firstImage && (firstImage.startsWith('http') ? firstImage : `${process.env.FRONTEND_URL || 'https://www.harvests.site'}${firstImage.startsWith('/') ? firstImage : '/' + firstImage}`);
          const productBadge = renderStatusBadge(product.status || firstStatus);

          return `
            <div style="border-top: ${index === 0 ? 'none' : '1px solid #f0f0f0'}; padding: ${index === 0 ? '0 0 5px 0' : '5px 0'};">
              <div style="display: flex; gap: 10px; margin-bottom: 12px; align-items: flex-start;">
                ${firstImage ? `
                  <div style="flex-shrink: 0; margin: 5px; margin-left: 10px;">
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
          <h3 style="margin: 0 0 12px 0; color: #374151; border-bottom: 2px solid #16a34a; padding-bottom: 8px;">Produits commandés</h3>
          ${sellerSections}
        </div>
      `;
    }

    // Construire l'affichage des informations du client
    let buyerInfoHtml = '';
    if (data && data.buyer) {
      buyerInfoHtml = `
        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="margin-top: 0; color: #555; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">Informations client:</h3>
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
        <div style="background-color: white; padding: 5px; border-radius: 5px; margin: 5px 0;">
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
          return `<a href="${absoluteUrl}" style="display: inline-block; padding: 10px 10px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 5px; margin: 5px 5px;">${action.label || 'Voir'}</a>`;
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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 5px 5px;">
          <div style="background-color: #f5f5f5; padding: 5px; border-radius: 5px;">
            <h2 style="color: #16a34a; margin-top: 0;">🌾 ${title}</h2>
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
  };
}

module.exports = addEmailNotificationMethod;

