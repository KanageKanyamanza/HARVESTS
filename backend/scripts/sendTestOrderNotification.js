#!/usr/bin/env node

/**
 * Script pour envoyer un email de test de notification de commande
 * Usage: node scripts/sendTestOrderNotification.js [email]
 */

require('dotenv').config();
const Email = require('../utils/email');
const mongoose = require('mongoose');

async function sendTestOrderNotification() {
  console.log('🧪 Envoi d\'un email de test de notification de commande\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Récupérer l'email depuis les arguments
  const testEmail = process.argv[2] || 'haurlyroll@gmail.com';
  
  console.log(`📧 Email de destination: ${testEmail}\n`);

  // Créer un utilisateur de test
  const testUser = {
    email: testEmail,
    firstName: 'Test',
    lastName: 'User',
    preferredLanguage: 'fr'
  };

  // Créer un ID de commande fictif pour le test
  const orderId = new mongoose.Types.ObjectId();
  const orderNumber = `HSN${Date.now().toString().slice(-10)}`;
  const amount = 6500;
  const currency = 'XAF';

  // Construire l'URL complète avec FRONTEND_URL
  const frontendUrl = process.env.FRONTEND_URL || 'https://harvests-khaki.vercel.app';
  const orderUrl = `${frontendUrl.replace(/\/$/, '')}/orders/${orderId}`;

  console.log(`🔗 URL de la commande: ${orderUrl}\n`);

  // Notification de nouvelle commande (comme celle reçue par le vendeur)
  const notification = {
    title: 'Nouvelle commande reçue',
    message: `Vous avez reçu une nouvelle commande (${orderNumber}) d'un montant de ${amount} ${currency} de Test User`,
    data: {
      orderId: orderId.toString(),
      orderNumber: orderNumber,
      amount: amount,
      currency: currency,
      buyer: {
        firstName: 'Test',
        lastName: 'User',
        fullName: 'Test User',
        email: testEmail,
        phone: '+221 77 123 45 67'
      },
      products: [
        {
          name: 'Tomates fraîches',
          description: 'Tomates biologiques cultivées localement, parfaites pour vos salades et plats',
          images: ['https://images.unsplash.com/photo-1546094097-0c0b0a0b0b0b?w=400'],
          quantity: 5,
          unitPrice: 1000,
          totalPrice: 5000
        },
        {
          name: 'Oignons',
          description: 'Oignons rouges et blancs, idéaux pour la cuisine',
          images: ['https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=400'],
          quantity: 3,
          unitPrice: 500,
          totalPrice: 1500
        }
      ]
    },
    actions: [{
      type: 'view',
      label: 'Voir la commande',
      url: orderUrl
    }]
  };

  try {
    console.log('📧 Envoi de l\'email...\n');
    
    const email = new Email(testUser, frontendUrl);
    await email.sendNotification(notification);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Email envoyé avec succès !');
    console.log(`📧 Destinataire: ${testEmail}`);
    console.log(`🔗 Lien dans l'email: ${orderUrl}`);
    console.log('');
    
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.error('❌ Erreur lors de l\'envoi de l\'email:');
    console.error(`   Message: ${error.message}`);
    if (error.stack) {
      console.error(`   Stack: ${error.stack}`);
    }
    console.error('');
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  sendTestOrderNotification()
    .then(() => {
      console.log('✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = sendTestOrderNotification;

