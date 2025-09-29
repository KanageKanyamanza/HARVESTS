#!/usr/bin/env node

/**
 * Script de test pour vérifier l'authentification admin
 */

const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

// Configuration de la base de données
const connectDB = async () => {
  try {
    const mongoURI = process.env.DATABASE_LOCAL || process.env.DATABASE_URL || 'mongodb://localhost:27017/harvests';
    await mongoose.connect(mongoURI);
    console.log('✅ Connexion à la base de données réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    process.exit(1);
  }
};

// Fonction pour tester l'authentification
const testAdminAuth = async () => {
  try {
    console.log('🔍 Vérification des administrateurs...\n');

    // Lister tous les administrateurs
    const admins = await Admin.find({}).select('firstName lastName email role isActive isEmailVerified createdAt');
    
    if (admins.length === 0) {
      console.log('❌ Aucun administrateur trouvé dans la base de données');
      console.log('💡 Exécutez: node scripts/quick-admin-setup.js pour créer un super-admin');
      return;
    }

    console.log(`📊 Total administrateurs: ${admins.length}\n`);

    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.getFullName()}`);
      console.log(`   📧 Email: ${admin.email}`);
      console.log(`   🎭 Rôle: ${admin.role}`);
      console.log(`   ✅ Actif: ${admin.isActive ? 'Oui' : 'Non'}`);
      console.log(`   📧 Email vérifié: ${admin.isEmailVerified ? 'Oui' : 'Non'}`);
      console.log(`   📅 Créé le: ${admin.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    // Tester la connexion avec le premier admin
    const firstAdmin = admins[0];
    console.log(`🧪 Test de connexion avec: ${firstAdmin.email}`);
    
    // Simuler la vérification du mot de passe
    const testPassword = 'Admin@harvests123!';
    const isPasswordValid = await firstAdmin.comparePassword(testPassword);
    
    if (isPasswordValid) {
      console.log('✅ Mot de passe correct');
      console.log('🔑 Vous pouvez vous connecter avec ces identifiants:');
      console.log(`   Email: ${firstAdmin.email}`);
      console.log(`   Mot de passe: ${testPassword}`);
    } else {
      console.log('❌ Mot de passe incorrect');
      console.log('💡 Essayez avec le mot de passe par défaut ou réinitialisez le mot de passe');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion de la base de données');
  }
};

// Exécution du script
const run = async () => {
  await connectDB();
  await testAdminAuth();
};

run().catch(console.error);
