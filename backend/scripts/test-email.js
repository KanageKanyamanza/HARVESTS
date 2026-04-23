const dotenv = require('dotenv');
const path = require('path');

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env') });

const Email = require('../utils/email');

const testEmail = async () => {
  const user = {
    email: 'haurlyroll@gmail.com',
    firstName: 'Test User'
  };
  
  const url = 'https://harvests.site';
  
  console.log('🚀 Démarrage du test d\'envoi d\'email...');
  console.log(`📍 Config: Host=${process.env.EMAIL_HOST}, User=${process.env.EMAIL_USERNAME}, From=${process.env.EMAIL_FROM}`);

  try {
    const email = new Email(user, url);
    
    // On va utiliser une méthode générique de la classe Email si elle existe, 
    // ou tester directement la connexion d'abord.
    const isConnected = await email.testConnection();
    
    if (isConnected) {
      console.log('✅ Connexion SMTP réussie ! Tentative d\'envoi...');
      
      // Envoi d'un email de bienvenue simple pour le test
      await email.sendWelcome();
      console.log('🎉 Email de test envoyé avec succès à haurlyroll@gmail.com !');
    } else {
      console.error('❌ Échec de la connexion SMTP. Vérifiez les identifiants.');
    }
  } catch (error) {
    console.error('❌ Erreur lors du test d\'envoi:');
    console.error(error);
  }
};

testEmail();
