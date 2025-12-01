#!/usr/bin/env node

/**
 * Script pour créer un compte utilisateur de test
 * Usage: node scripts/create-test-user.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Email = require('../utils/email');
require('dotenv').config();

// Configuration de la base de données
const connectDB = async () => {
  try {
    // Priorité aux variables d'environnement de production
    let mongoURI;
    
    if (process.env.DATABASE) {
      // Production avec mot de passe
      mongoURI = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
    } else if (process.env.DATABASE_URL) {
      // Production directe
      mongoURI = process.env.DATABASE_URL;
    } else if (process.env.DATABASE_LOCAL) {
      // Développement local
      mongoURI = process.env.DATABASE_LOCAL;
    } else {
      // Fallback par défaut
      mongoURI = 'mongodb://localhost:27017/harvests';
    }
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Utiliser IPv4, ignorer IPv6
    });
    console.log('✅ Connexion à la base de données réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    process.exit(1);
  }
};

// Fonction pour créer un utilisateur de test
const createTestUser = async () => {
  try {
    const email = 'haurlyroll@gmail.com';
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('⚠️ Un utilisateur avec cet email existe déjà');
      console.log(`📧 Email: ${existingUser.email}`);
      console.log(`👤 Nom: ${existingUser.firstName} ${existingUser.lastName}`);
      console.log(`🔐 Type: ${existingUser.userType}`);
      console.log(`✅ Email vérifié: ${existingUser.isEmailVerified}`);
      
      // Afficher le token de vérification s'il existe
      if (existingUser.emailVerificationToken) {
        console.log(`\n🔑 Token de vérification existant (hashé): ${existingUser.emailVerificationToken.substring(0, 20)}...`);
        console.log('💡 Pour obtenir un nouveau token, utilisez la fonction resend-verification');
      }
      
      return;
    }

    console.log('🚀 Création d\'un nouvel utilisateur de test...\n');

    // Données de l'utilisateur
    const userData = {
      firstName: 'Haurly',
      lastName: 'Roll',
      email: email,
      password: 'Test123456!',
      phone: '+221771234567',
      userType: 'consumer',
      preferredLanguage: 'fr',
      country: 'Sénégal',
      address: 'Test Address',
      city: 'Dakar',
      region: 'Dakar'
    };

    // Créer l'utilisateur
    const user = await User.create(userData);
    
    // Générer le token de vérification
    const verifyToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    console.log('✅ Utilisateur créé avec succès!');
    console.log('=====================================');
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Mot de passe: ${userData.password}`);
    console.log(`👤 Nom: ${user.firstName} ${user.lastName}`);
    console.log(`🔐 Type: ${user.userType}`);
    console.log(`📱 Téléphone: ${user.phone}`);
    console.log(`✅ Email vérifié: ${user.isEmailVerified}`);
    console.log('=====================================');
    
    // Construire l'URL de vérification
    const backendUrl = process.env.BACKEND_URL || process.env.API_URL || 'https://harvests.onrender.com';
    const verifyURL = `${backendUrl}/api/v1/auth/verify-email/${verifyToken}`;
    
    console.log('\n📧 Envoi de l\'email de vérification...');
    try {
      // Envoyer l'email de bienvenue avec le lien de vérification
      await new Email(user, verifyURL, user.preferredLanguage || 'fr').sendWelcome();
      console.log('✅ Email de vérification envoyé avec succès!');
      console.log(`📬 Vérifiez votre boîte mail: ${user.email}`);
    } catch (emailError) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', emailError.message);
      console.log('\n🔗 URL de vérification d\'email (à copier manuellement):');
      console.log(verifyURL);
      console.log('\n💡 Vous pouvez aussi utiliser l\'endpoint /api/v1/auth/resend-verification pour renvoyer l\'email');
    }
    
    console.log('\n⚠️ IMPORTANT: Le token expire dans 7 jours');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error.message);
    if (error.errors) {
      console.error('Détails des erreurs:', error.errors);
    }
    throw error;
  }
};

// Fonction principale
const main = async () => {
  try {
    console.log('🚀 Création d\'un utilisateur de test');
    console.log('==================================================\n');

    await connectDB();
    await createTestUser();

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

