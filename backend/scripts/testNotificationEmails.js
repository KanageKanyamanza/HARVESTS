#!/usr/bin/env node

/**
 * Script de test pour les notifications par email
 * Usage: node scripts/testNotificationEmails.js [email]
 * 
 * Teste l'envoi d'emails de notification pour différents scénarios de commandes
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');

async function testNotificationEmails() {
  console.log('🧪 Test des notifications par email\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Connexion à MongoDB
  let DB;
  if (process.env.DATABASE) {
    DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
  } else if (process.env.DATABASE_URL) {
    DB = process.env.DATABASE_URL;
  } else if (process.env.DATABASE_LOCAL) {
    DB = process.env.DATABASE_LOCAL;
  } else {
    DB = 'mongodb://localhost:27017/harvests';
  }

  try {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connexion à MongoDB réussie\n');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }

  // Récupérer l'email de test depuis les arguments ou utiliser une valeur par défaut
  const testEmail = process.argv[2] || process.env.TEST_EMAIL || 'test@example.com';
  
  console.log(`📧 Email de test: ${testEmail}\n`);

  // Trouver ou créer un utilisateur de test
  let testUser = await User.findOne({ email: testEmail });
  if (!testUser) {
    console.log(`⚠️  Utilisateur ${testEmail} non trouvé. Création d'un utilisateur de test...`);
    testUser = await User.create({
      email: testEmail,
      firstName: 'Test',
      lastName: 'User',
      password: 'Test123456!',
      userType: 'consumer',
      emailVerified: true,
      emailVerificationToken: 'test-token'
    });
    console.log(`✅ Utilisateur de test créé: ${testUser._id}\n`);
  } else {
    console.log(`✅ Utilisateur trouvé: ${testUser.firstName} ${testUser.lastName}\n`);
  }

  // Tests de notifications
  const tests = [
    {
      name: 'Commande créée (Acheteur)',
      notification: {
        recipient: testUser._id,
        type: 'order_created_buyer',
        category: 'order',
        title: 'Commande créée avec succès',
        message: `Votre commande TEST-${Date.now()} a été créée avec succès. Montant total : 50000 XAF`,
        data: {
          orderId: new mongoose.Types.ObjectId(),
          orderNumber: `TEST-${Date.now()}`,
          amount: 50000,
          currency: 'XAF'
        },
        actions: [{
          type: 'view',
          label: 'Voir ma commande',
          url: '/orders/test'
        }],
        channels: {
          inApp: { enabled: true },
          email: { enabled: true },
          push: { enabled: false }
        }
      }
    },
    {
      name: 'Commande confirmée (Acheteur)',
      notification: {
        recipient: testUser._id,
        type: 'order_confirmed',
        category: 'order',
        title: 'Commande confirmée',
        message: `Votre commande TEST-${Date.now()} a été confirmée par le vendeur`,
        data: {
          orderId: new mongoose.Types.ObjectId(),
          orderNumber: `TEST-${Date.now()}`,
          status: 'confirmed'
        },
        actions: [{
          type: 'view',
          label: 'Voir la commande',
          url: '/orders/test'
        }],
        channels: {
          inApp: { enabled: true },
          email: { enabled: true },
          push: { enabled: false }
        }
      }
    },
    {
      name: 'Commande en préparation (Acheteur)',
      notification: {
        recipient: testUser._id,
        type: 'order_preparing',
        category: 'order',
        title: 'Commande en préparation',
        message: `Votre commande TEST-${Date.now()} est en cours de préparation`,
        data: {
          orderId: new mongoose.Types.ObjectId(),
          orderNumber: `TEST-${Date.now()}`,
          status: 'preparing'
        },
        channels: {
          inApp: { enabled: true },
          email: { enabled: true },
          push: { enabled: false }
        }
      }
    },
    {
      name: 'Commande livrée (Acheteur)',
      notification: {
        recipient: testUser._id,
        type: 'order_delivered',
        category: 'order',
        title: 'Commande livrée',
        message: `Votre commande TEST-${Date.now()} a été livrée`,
        data: {
          orderId: new mongoose.Types.ObjectId(),
          orderNumber: `TEST-${Date.now()}`,
          status: 'delivered'
        },
        channels: {
          inApp: { enabled: true },
          email: { enabled: true },
          push: { enabled: false }
        }
      }
    },
    {
      name: 'Nouvelle commande reçue (Vendeur)',
      notification: {
        recipient: testUser._id,
        type: 'order_created',
        category: 'order',
        title: 'Nouvelle commande reçue',
        message: `Vous avez reçu une nouvelle commande (TEST-${Date.now()}) d'un montant de 50000 XAF`,
        data: {
          orderId: new mongoose.Types.ObjectId(),
          orderNumber: `TEST-${Date.now()}`,
          amount: 50000,
          currency: 'XAF'
        },
        actions: [{
          type: 'view',
          label: 'Voir la commande',
          url: '/orders/test'
        }],
        channels: {
          inApp: { enabled: true },
          email: { enabled: true },
          push: { enabled: false }
        }
      }
    }
  ];

  console.log('📬 Envoi des emails de test...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let successCount = 0;
  let failCount = 0;

  for (const test of tests) {
    try {
      console.log(`📧 Test: ${test.name}`);
      console.log(`   Destinataire: ${testEmail}`);
      
      const notification = await Notification.createNotification(test.notification);
      
      // Attendre un peu pour que l'email soit envoyé
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Vérifier le statut de l'email
      const updatedNotification = await Notification.findById(notification._id);
      if (updatedNotification.channels.email.sent) {
        console.log(`   ✅ Email envoyé avec succès`);
        console.log(`   📅 Envoyé à: ${updatedNotification.channels.email.sentAt}`);
        successCount++;
      } else if (updatedNotification.channels.email.failureReason) {
        console.log(`   ❌ Échec: ${updatedNotification.channels.email.failureReason}`);
        failCount++;
      } else {
        console.log(`   ⏳ En attente d'envoi...`);
        successCount++;
      }
      
      console.log('');
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
      failCount++;
      console.log('');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 Résultats:');
  console.log(`   ✅ Succès: ${successCount}`);
  console.log(`   ❌ Échecs: ${failCount}`);
  console.log(`   📧 Total: ${tests.length}`);
  console.log('');

  // Fermer la connexion
  await mongoose.connection.close();
  console.log('✅ Test terminé');
  
  process.exit(failCount > 0 ? 1 : 0);
}

// Exécuter le script
if (require.main === module) {
  testNotificationEmails()
    .catch((error) => {
      console.error('❌ Erreur lors du test:', error);
      process.exit(1);
    });
}

module.exports = testNotificationEmails;

