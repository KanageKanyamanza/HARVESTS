#!/usr/bin/env node

/**
 * Script de test simple pour les notifications par email (sans MongoDB)
 * Usage: node scripts/testEmailNotificationSimple.js [email]
 * 
 * Teste directement l'envoi d'emails de notification sans passer par la base de données
 */

require('dotenv').config();
const Email = require('../utils/email');

async function testEmailNotifications() {
  console.log('🧪 Test simple des notifications par email\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Récupérer l'email de test depuis les arguments ou utiliser une valeur par défaut
  const testEmail = process.argv[2] || process.env.TEST_EMAIL || 'test@example.com';
  
  console.log(`📧 Email de test: ${testEmail}\n`);

  // Créer un utilisateur de test
  const testUser = {
    email: testEmail,
    firstName: 'Test',
    lastName: 'User',
    preferredLanguage: 'fr'
  };

  // Tests de notifications
  const tests = [
    {
      name: 'Commande créée (Acheteur)',
      notification: {
        title: 'Commande créée avec succès',
        message: `Votre commande TEST-${Date.now()} a été créée avec succès. Montant total : 50000 XAF`,
        data: {
          orderNumber: `TEST-${Date.now()}`,
          amount: 50000,
          currency: 'XAF'
        },
        actions: [{
          type: 'view',
          label: 'Voir ma commande',
          url: 'https://harvests-khaki.vercel.app/orders/test'
        }]
      }
    },
    {
      name: 'Commande confirmée (Acheteur)',
      notification: {
        title: 'Commande confirmée',
        message: `Votre commande TEST-${Date.now()} a été confirmée par le vendeur`,
        data: {
          orderNumber: `TEST-${Date.now()}`,
          status: 'confirmed'
        },
        actions: [{
          type: 'view',
          label: 'Voir la commande',
          url: 'https://harvests-khaki.vercel.app/orders/test'
        }]
      }
    },
    {
      name: 'Commande en préparation (Acheteur)',
      notification: {
        title: 'Commande en préparation',
        message: `Votre commande TEST-${Date.now()} est en cours de préparation`,
        data: {
          orderNumber: `TEST-${Date.now()}`,
          status: 'preparing'
        }
      }
    },
    {
      name: 'Commande livrée (Acheteur)',
      notification: {
        title: 'Commande livrée',
        message: `Votre commande TEST-${Date.now()} a été livrée`,
        data: {
          orderNumber: `TEST-${Date.now()}`,
          status: 'delivered'
        }
      }
    },
    {
      name: 'Nouvelle commande reçue (Vendeur)',
      notification: {
        title: 'Nouvelle commande reçue',
        message: `Vous avez reçu une nouvelle commande (TEST-${Date.now()}) d'un montant de 50000 XAF`,
        data: {
          orderNumber: `TEST-${Date.now()}`,
          amount: 50000,
          currency: 'XAF'
        },
        actions: [{
          type: 'view',
          label: 'Voir la commande',
          url: 'https://harvests-khaki.vercel.app/orders/test'
        }]
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
      
      const email = new Email(testUser, 'https://harvests-khaki.vercel.app');
      await email.sendNotification(test.notification);
      
      console.log(`   ✅ Email envoyé avec succès`);
      successCount++;
      console.log('');
      
      // Attendre 1 seconde entre chaque email pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
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

  console.log('✅ Test terminé');
  
  process.exit(failCount > 0 ? 1 : 0);
}

// Exécuter le script
if (require.main === module) {
  testEmailNotifications()
    .catch((error) => {
      console.error('❌ Erreur lors du test:', error);
      process.exit(1);
    });
}

module.exports = testEmailNotifications;

