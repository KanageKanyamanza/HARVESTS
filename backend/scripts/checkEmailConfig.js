#!/usr/bin/env node

/**
 * Script de diagnostic de la configuration email
 * Usage: node scripts/checkEmailConfig.js
 */

const Email = require('../utils/email');

async function checkEmailConfiguration() {
  console.log('🔍 Vérification de la configuration email...\n');

  // 1. Vérifier les variables d'environnement
  console.log('📋 Variables d\'environnement:');
  console.log(`   GMAIL_USER: ${process.env.GMAIL_USER ? '✅ Configuré' : '❌ Manquant'}`);
  console.log(`   GMAIL_APP_PASSWORD: ${process.env.GMAIL_APP_PASSWORD ? '✅ Configuré' : '❌ Manquant'}`);
  console.log(`   EMAIL_HOST: ${process.env.EMAIL_HOST || 'Non défini'}`);
  console.log(`   EMAIL_PORT: ${process.env.EMAIL_PORT || 'Non défini'}`);
  console.log(`   EMAIL_USERNAME: ${process.env.EMAIL_USERNAME ? '✅ Configuré' : '❌ Manquant'}`);
  console.log(`   EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✅ Configuré' : '❌ Manquant'}`);
  console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM || 'Non défini'}`);
  console.log(`   EMAILJS_SERVICE_ID: ${process.env.EMAILJS_SERVICE_ID ? '✅ Configuré' : '❌ Manquant'}`);
  console.log(`   EMAILJS_TEMPLATE_ID: ${process.env.EMAILJS_TEMPLATE_ID ? '✅ Configuré' : '❌ Manquant'}`);
  console.log(`   EMAILJS_PUBLIC_KEY: ${process.env.EMAILJS_PUBLIC_KEY ? '✅ Configuré' : '❌ Manquant'}\n`);

  // 2. Créer une instance de test
  const testUser = {
    email: 'test@example.com',
    firstName: 'Test',
    preferredLanguage: 'fr'
  };

  const testEmail = new Email(testUser, 'https://harvests-khaki.vercel.app', 'fr');

  // 3. Tester la connexion Nodemailer
  console.log('🔌 Test de connexion Nodemailer...');
  try {
    const connectionTest = await testEmail.testConnection();
    if (connectionTest) {
      console.log('✅ Connexion Nodemailer réussie !\n');
    } else {
      console.log('❌ Échec de la connexion Nodemailer\n');
    }
  } catch (err) {
    console.log(`❌ Erreur de connexion Nodemailer: ${err.message}\n`);
  }

  // 4. Vérifier la configuration EmailJS
  console.log('📧 Configuration EmailJS:');
  if (testEmail.isEmailJSConfigured()) {
    console.log('✅ EmailJS est configuré et disponible comme fallback');
  } else {
    console.log('⚠️ EmailJS non configuré - seul Nodemailer sera utilisé');
  }
  console.log('');

  // 5. Recommandations
  console.log('💡 Recommandations:');
  
  if (!process.env.GMAIL_USER && !process.env.EMAIL_USERNAME) {
    console.log('❌ Aucune configuration email trouvée');
    console.log('   - Configurez GMAIL_USER et GMAIL_APP_PASSWORD pour Gmail');
    console.log('   - Ou configurez EMAIL_HOST, EMAIL_USERNAME, EMAIL_PASSWORD pour SMTP');
  }

  if (!process.env.EMAIL_FROM) {
    console.log('⚠️ EMAIL_FROM non défini - utilisez une adresse valide');
  }

  if (!testEmail.isEmailJSConfigured()) {
    console.log('ℹ️ EmailJS non configuré - pas de fallback en cas d\'échec Nodemailer');
    console.log('   - Configurez EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY si souhaité');
  }

  console.log('\n✅ Diagnostic terminé');
}

// Exécuter le script
if (require.main === module) {
  checkEmailConfiguration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Erreur lors du diagnostic:', err.message);
      process.exit(1);
    });
}

module.exports = checkEmailConfiguration;
