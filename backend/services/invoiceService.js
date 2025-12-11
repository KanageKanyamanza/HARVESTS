const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const Order = require('../models/Order');
const User = require('../models/User');
const AppError = require('../utils/appError');

/**
 * Service pour générer des factures PDF
 */

/**
 * Générer une facture PDF pour une commande
 * @param {String} orderId - ID de la commande
 * @param {Object} user - Utilisateur qui demande la facture
 * @returns {Promise<Buffer>} - Buffer du PDF
 */
async function generateInvoicePDF(orderId, user) {
  try {
    // Récupérer la commande avec toutes les informations nécessaires
    const order = await Order.findById(orderId)
      .populate('buyer', 'firstName lastName email phone address')
      .populate('seller', 'farmName companyName firstName lastName email phone address')
      .populate('items.productSnapshot.producer', 'farmName firstName lastName')
      .populate('items.productSnapshot.transformer', 'companyName firstName lastName')
      .populate('items.productSnapshot.restaurateur', 'restaurantName firstName lastName');

    if (!order) {
      throw new AppError('Commande non trouvée', 404);
    }

    // Vérifier que l'utilisateur a le droit de voir cette facture
    const buyerId = order.buyer?._id?.toString() || order.buyer?.toString();
    const sellerId = order.seller?._id?.toString() || order.seller?.toString();
    const userId = user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isAdmin && buyerId !== userId && sellerId !== userId) {
      // Vérifier si l'utilisateur est un vendeur d'un des articles
      const isItemSeller = order.items?.some(item => {
        const itemSellerId = item.seller?.toString();
        return itemSellerId === userId;
      });

      if (!isItemSeller) {
        throw new AppError('Vous n\'avez pas le droit de voir cette facture', 403);
      }
    }

    // Créer le document PDF
    const doc = new PDFDocument({ 
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    // Collecter les données du PDF dans un buffer
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));

    // Essayer de charger le logo
    let logoPath = null;
    const possibleLogoPaths = [
      path.join(__dirname, '../../frontend/src/assets/logo.png'),
      path.join(__dirname, '../../frontend/public/logo.png'),
      path.join(__dirname, '../../frontend/src/assets/logo.jpg'),
      path.join(__dirname, '../../frontend/public/logo.jpg')
    ];
    
    for (const logo of possibleLogoPaths) {
      if (fs.existsSync(logo)) {
        logoPath = logo;
        break;
      }
    }

    // Header avec logo et informations de l'entreprise
    const headerY = 50;
    const headerHeight = 80; // Hauteur totale du header
    
    // Logo (si disponible) - en haut à gauche
    if (logoPath) {
      try {
        doc.image(logoPath, 50, headerY, { width: 50, height: 50, fit: [50, 50] });
      } catch (error) {
        console.warn('Impossible de charger le logo:', error.message);
      }
    }
    
    // Informations de l'entreprise (Harvests) - à droite du logo
    const companyX = logoPath ? 110 : 50;
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .text('HARVESTS', companyX, headerY);
    
    doc.fontSize(9)
       .font('Helvetica')
       .text('Plateforme de vente de produits agricoles', companyX, headerY + 18)
       .text('Dakar, Sénégal', companyX, headerY + 30)
       .text('Email: contact@harvests.site', companyX, headerY + 42)
       .text('Tél: +221 771970713 / +221 774536704', companyX, headerY + 54);

    // Numéro de facture et date (en haut à droite) - aligné avec le header
    const invoiceNumber = order.invoiceNumber || order.orderNumber || `INV-${order._id.toString().substring(0, 8).toUpperCase()}`;
    const invoiceDate = order.createdAt || new Date();
    
    doc.fontSize(9)
       .font('Helvetica')
       .text(`Facture N°: ${invoiceNumber}`, 50, headerY, { align: 'right', width: 500 })
       .text(`Date: ${formatDate(invoiceDate)}`, 50, headerY + 14, { align: 'right', width: 500 })
       .text(`Commande N°: ${order.orderNumber || order._id}`, 50, headerY + 28, { align: 'right', width: 500 });

    // Titre de la facture (centré, après le header)
    const titleY = headerY + headerHeight + 20;
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('FACTURE', 50, titleY, { align: 'center', width: 500 });

    // Informations du client et vendeur (côte à côte) - après le titre
    let yPos = titleY + 35; // Espace après le titre
    
    // Colonne gauche - Client
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('FACTURÉ À:', 50, yPos);
    
    let buyerYPos = yPos + 20;
    doc.fontSize(10)
       .font('Helvetica');
    
    const buyer = order.buyer;
    if (buyer) {
      const buyerName = buyer.firstName && buyer.lastName 
        ? `${buyer.firstName} ${buyer.lastName}`
        : buyer.farmName || buyer.companyName || buyer.restaurantName || 'Client';
      
      doc.text(buyerName, 50, buyerYPos);
      buyerYPos += 15;
      
      if (buyer.email) {
        doc.text(`Email: ${buyer.email}`, 50, buyerYPos);
        buyerYPos += 15;
      }
      
      if (buyer.phone) {
        doc.text(`Téléphone: ${buyer.phone}`, 50, buyerYPos);
        buyerYPos += 15;
      }
      
      const address = buyer.address || order.delivery?.deliveryAddress || order.billingAddress;
      if (address) {
        if (address.street) {
          doc.text(`Adresse: ${address.street}`, 50, buyerYPos);
          buyerYPos += 15;
        }
        if (address.city) {
          const cityLine = address.postalCode 
            ? `${address.postalCode} ${address.city}`
            : address.city;
          doc.text(cityLine, 50, buyerYPos);
          buyerYPos += 15;
        }
        if (address.region) {
          doc.text(address.region, 50, buyerYPos);
          buyerYPos += 15;
        }
        if (address.country) {
          doc.text(address.country, 50, buyerYPos);
        }
      }
    }

    // Colonne droite - Vendeur (si différent)
    let sellerYPos = yPos + 20;
    if (order.seller && order.seller._id.toString() !== buyer?._id?.toString()) {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('VENDEUR:', 400, yPos, { align: 'right' });
      
      doc.fontSize(10)
         .font('Helvetica');
      
      const seller = order.seller;
      const sellerName = seller.farmName || seller.companyName || seller.restaurantName 
        || (seller.firstName && seller.lastName ? `${seller.firstName} ${seller.lastName}` : 'Vendeur');
      
      doc.text(sellerName, 400, sellerYPos, { align: 'right', width: 150 });
      sellerYPos += 15;
      
      if (seller.email) {
        doc.text(`Email: ${seller.email}`, 400, sellerYPos, { align: 'right', width: 150 });
        sellerYPos += 15;
      }
      
      if (seller.phone) {
        doc.text(`Téléphone: ${seller.phone}`, 400, sellerYPos, { align: 'right', width: 150 });
        sellerYPos += 15;
      }
    }
    
    // Utiliser la position la plus basse pour continuer (avec marge de sécurité)
    yPos = Math.max(buyerYPos, sellerYPos) + 20;

    // Tableau des articles - avec espacement suffisant après les infos client/vendeur
    yPos = Math.max(yPos + 25, titleY + 150); // Minimum 150px après le titre
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text('DÉTAIL DE LA COMMANDE', 50, yPos);
    
    yPos += 20;
    
    // En-têtes du tableau - colonnes bien espacées
    const colArticleX = 50;
    const colQtyX = 280;
    const colPriceX = 340;
    const colTotalX = 480;
    const colWidth = 550 - colArticleX;
    
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .text('Article', colArticleX, yPos, { width: colQtyX - colArticleX - 10 })
       .text('Qté', colQtyX, yPos, { width: colPriceX - colQtyX - 10 })
       .text('Prix unit.', colPriceX, yPos, { width: colTotalX - colPriceX - 10 })
       .text('Total', colTotalX, yPos, { align: 'right', width: colWidth - colTotalX + colArticleX });
    
    yPos += 18;
    doc.moveTo(colArticleX, yPos).lineTo(550, yPos).stroke();
    yPos += 12;

    // Articles
    doc.fontSize(9)
       .font('Helvetica');
    
    order.items?.forEach((item, index) => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }

      const productName = item.productSnapshot?.name || item.name || 'Produit';
      const quantity = item.quantity || 1;
      const unitPrice = item.unitPrice || item.price || 0;
      const totalPrice = item.totalPrice || (quantity * unitPrice);
      const unit = item.productSnapshot?.unit || item.unit || 'unité';

      // Nom du produit - colonne Article
      doc.text(productName, colArticleX, yPos, { 
        width: colQtyX - colArticleX - 10, 
        ellipsis: true 
      });
      
      // Quantité et unité - colonne Qté
      doc.text(`${quantity} ${unit}`, colQtyX, yPos, { 
        width: colPriceX - colQtyX - 10 
      });
      
      // Prix unitaire - colonne Prix unit.
      doc.text(formatCurrency(unitPrice, order.currency || 'XAF'), colPriceX, yPos, { 
        width: colTotalX - colPriceX - 10 
      });
      
      // Total - colonne Total
      doc.text(formatCurrency(totalPrice, order.currency || 'XAF'), colTotalX, yPos, { 
        align: 'right', 
        width: colWidth - colTotalX + colArticleX 
      });
      
      yPos += 18;
    });

    // Ligne de séparation après les articles
    yPos += 8;
    doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
    yPos += 15;

    // Totaux - alignés à droite avec espacement correct
    // Utiliser une seule ligne de texte avec espacement entre label et valeur
    const totalsLabelX = 350; // Position pour les labels
    const totalsValueX = 480; // Position pour les valeurs
    const totalsWidth = 200; // Largeur totale de la zone des totaux
    
    doc.fontSize(10)
       .font('Helvetica');
    
    if (order.subtotal !== undefined && order.subtotal !== null) {
      const label = 'Sous-total:';
      const value = formatCurrency(order.subtotal, order.currency || 'XAF');
      doc.text(label, totalsLabelX, yPos, { align: 'right', width: totalsWidth - 130 });
      doc.text(value, totalsValueX, yPos, { align: 'right' });
      yPos += 18;
    }

    if (order.deliveryFee !== undefined && order.deliveryFee !== null) {
      const label = 'Frais de livraison:';
      const value = formatCurrency(order.deliveryFee, order.currency || 'XAF');
      doc.text(label, totalsLabelX, yPos, { align: 'right', width: totalsWidth - 130 });
      doc.text(value, totalsValueX, yPos, { align: 'right' });
      yPos += 18;
    }

    if (order.taxes && order.taxes > 0) {
      const label = 'TVA:';
      const value = formatCurrency(order.taxes, order.currency || 'XAF');
      doc.text(label, totalsLabelX, yPos, { align: 'right', width: totalsWidth - 130 });
      doc.text(value, totalsValueX, yPos, { align: 'right' });
      yPos += 18;
    }

    if (order.discount && order.discount > 0) {
      const label = 'Remise:';
      const value = `-${formatCurrency(order.discount, order.currency || 'XAF')}`;
      doc.font('Helvetica-Bold');
      doc.text(label, totalsLabelX, yPos, { align: 'right', width: totalsWidth - 130 });
      doc.text(value, totalsValueX, yPos, { align: 'right' });
      doc.font('Helvetica');
      yPos += 18;
    }

    // Ligne de séparation avant le total
    yPos += 5;
    doc.moveTo(totalsLabelX, yPos).lineTo(550, yPos).stroke();
    yPos += 12;
    
    // Total final
    const totalLabel = 'TOTAL:';
    const totalValue = formatCurrency(order.total, order.currency || 'XAF');
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text(totalLabel, totalsLabelX, yPos, { align: 'right', width: totalsWidth - 130 });
    doc.text(totalValue, totalsValueX, yPos, { align: 'right' });

    // Informations de paiement
    yPos += 40;
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('MÉTHODE DE PAIEMENT:', 50, yPos);
    
    yPos += 20;
    doc.font('Helvetica');
    const paymentMethod = order.payment?.method || 'Non spécifié';
    const paymentStatus = order.payment?.status || 'pending';
    const paymentMethodLabels = {
      'cash': 'Espèces',
      'cash-on-delivery': 'Paiement à la livraison',
      'paypal': 'PayPal',
      'stripe': 'Carte bancaire',
      'wave': 'Wave',
      'orange-money': 'Orange Money'
    };
    
    doc.text(paymentMethodLabels[paymentMethod] || paymentMethod, 50, yPos);
    yPos += 15;
    doc.text(`Statut: ${getPaymentStatusLabel(paymentStatus)}`, 50, yPos);

    // Notes
    if (order.buyerNotes) {
      yPos += 30;
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text('NOTES:', 50, yPos);
      
      yPos += 20;
      doc.font('Helvetica')
         .text(order.buyerNotes, 50, yPos, { width: 500 });
    }

    // Pied de page (simplifié, sans informations de contact)
    const pageHeight = doc.page.height;
    doc.fontSize(8)
       .font('Helvetica')
       .text('Merci pour votre confiance !', 50, pageHeight - 60, { align: 'center' })
       .text('Cette facture a été générée automatiquement par Harvests', 50, pageHeight - 45, { align: 'center' })
       .text(`Générée le ${formatDate(new Date())}`, 50, pageHeight - 30, { align: 'center' });

    // Finaliser le PDF et retourner une promesse
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
      doc.end();
    });

  } catch (error) {
    throw error;
  }
}

/**
 * Formater une date en français
 */
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 
                  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Formater une devise
 */
function formatCurrency(amount, currency = 'XAF') {
  if (!amount) return '0 FCFA';
  // Formater le nombre avec un point comme séparateur de milliers
  const formattedAmount = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  
  // Remplacer les espaces par des points pour les séparateurs de milliers
  const amountWithDots = formattedAmount.replace(/\s/g, '.');
  
  return `${amountWithDots} FCFA`;
}

/**
 * Obtenir le libellé du statut de paiement
 */
function getPaymentStatusLabel(status) {
  const labels = {
    'pending': 'En attente',
    'paid': 'Payé',
    'failed': 'Échoué',
    'refunded': 'Remboursé',
    'cancelled': 'Annulé'
  };
  return labels[status] || status;
}

module.exports = {
  generateInvoicePDF
};

