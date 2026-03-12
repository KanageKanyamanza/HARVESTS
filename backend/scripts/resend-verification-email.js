#!/usr/bin/env node

/**
 * Script pour renvoyer l'email de vérification à un utilisateur
 * Usage: node scripts/resend-verification-email.js <email>
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Email = require('../utils/email');
require('dotenv').config();

// Configuration de la base de données
const connectDB = async () => {
  try {
    let mongoURI;
    
    if (process.env.DATABASE) {
      mongoURI = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
    } else if (process.env.DATABASE_URL) {
      mongoURI = process.env.DATABASE_URL;
    } else if (process.env.DATABASE_LOCAL) {
      mongoURI = process.env.DATABASE_LOCAL;
    } else {
      mongoURI = 'mongodb://localhost:27017/harvests';
    }
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log('✅ Connexion à la base de données réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    process.exit(1);
  }
};

// Fonction pour renvoyer l'email de vérification
const resendVerificationEmail = async (email) => {
  try {
    if (!email) {
      console.error('❌ Veuillez fournir un email');
      console.log('Usage: node scripts/resend-verification-email.js <email>');
      return;
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.error(`❌ Aucun utilisateur trouvé avec l'email: ${email}`);
      return;
    }

    // Vérifier si l'email est déjà vérifié
    if (user.isEmailVerified) {
      console.log(`✅ L'email ${email} est déjà vérifié`);
      return;
    }

    console.log(`📧 Renvoi de l'email de vérification pour: ${email}`);

    // Générer un nouveau token de vérification
    const verifyToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Construire l'URL de vérification
    const backendUrl = process.env.BACKEND_URL || process.env.API_URL || 'https://harvests-bp63.onrender.com';
    const verifyURL = `${backendUrl}/api/v1/auth/verify-email/${verifyToken}`;

    // Envoyer l'email
    try {
      await new Email(user, verifyURL, user.preferredLanguage || 'fr').sendWelcome();
      console.log('✅ Email de vérification envoyé avec succès!');
      console.log(`📬 Vérifiez votre boîte mail: ${email}`);
      console.log(`\n🔗 URL de vérification:`);
      console.log(verifyURL);
      console.log('\n⚠️ IMPORTANT: Le token expire dans 7 jours');
    } catch (emailError) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', emailError.message);
      console.log('\n🔗 URL de vérification (à copier manuellement):');
      console.log(verifyURL);
      console.log('\n💡 Vous pouvez aussi utiliser l\'endpoint /api/v1/auth/resend-verification');
    }

  } catch (error) {
    console.error('❌ Erreur lors du renvoi de l\'email:', error.message);
    throw error;
  }
};

// Fonction principale
const main = async () => {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.error('❌ Veuillez fournir un email');
      console.log('Usage: node scripts/resend-verification-email.js <email>');
      process.exit(1);
    }

    console.log('🚀 Renvoi de l\'email de vérification');
    console.log('==================================================\n');

    await connectDB();
    await resendVerificationEmail(email);

    console.log('\n✅ Script terminé!');

  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du script:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

// Exécuter le script
main();

