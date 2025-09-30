#!/usr/bin/env node

/**
 * Script de configuration rapide pour créer le premier super-admin
 * Usage: node scripts/quick-admin-setup.js
 */

const mongoose = require('mongoose');
const Admin = require('../models/Admin');
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

// Fonction pour créer le premier super-admin
const createFirstSuperAdmin = async () => {
  try {
    // Vérifier s'il existe déjà des super-admins
    const existingSuperAdmin = await Admin.findOne({ role: 'super-admin' });
    if (existingSuperAdmin) {
      console.log('⚠️ Un super-administrateur existe déjà dans le système');
      console.log(`📧 Email: ${existingSuperAdmin.email}`);
      console.log(`👤 Nom: ${existingSuperAdmin.getFullName()}`);
      return;
    }

    // Vérifier s'il existe des administrateurs
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      console.log('⚠️ Des administrateurs existent déjà dans le système');
      console.log(`📊 Total: ${adminCount} administrateur(s)`);
      return;
    }

    console.log('🚀 Création du premier super-administrateur...\n');

    // Données par défaut pour le premier super-admin
    const superAdminData = {
      firstName: 'Roll Revhieno ',
      lastName: 'Haurly',
      email: 'admin@harvests.com',
      password: 'Admin@harvests123!',
      role: 'super-admin',
      department: 'technical',
      permissions: ['all'],
      isEmailVerified: true,
      isActive: true
    };

    const superAdmin = await Admin.create(superAdminData);

    console.log('✅ Super-administrateur créé avec succès!');
    console.log('=====================================');
    console.log(`📧 Email: ${superAdmin.email}`);
    console.log(`🔑 Mot de passe: ${superAdminData.password}`);
    console.log(`👤 Nom: ${superAdmin.getFullName()}`);
    console.log(`🔐 Rôle: ${superAdmin.role}`);
    console.log(`🏢 Département: ${superAdmin.department}`);
    console.log('=====================================');
    console.log('\n⚠️ IMPORTANT: Changez le mot de passe après la première connexion!');
    console.log('🌐 Vous pouvez maintenant vous connecter à l\'interface d\'administration');

  } catch (error) {
    console.error('❌ Erreur lors de la création du super-admin:', error.message);
    throw error;
  }
};

// Fonction pour créer des administrateurs de test
const createTestAdmins = async () => {
  try {
    console.log('\n🧪 Création d\'administrateurs de test...\n');

    const testAdmins = [
      {
        firstName: 'Moderateur',
        lastName: 'Test',
        email: 'moderator@harvests.com',
        password: 'Moderator123!',
        role: 'moderator',
        department: 'support',
        permissions: Admin.getDefaultPermissions('moderator'),
        isEmailVerified: true,
        isActive: true
      },
      {
        firstName: 'Support',
        lastName: 'Client',
        email: 'support@harvests.com',
        password: 'Support123!',
        role: 'support',
        department: 'support',
        permissions: Admin.getDefaultPermissions('support'),
        isEmailVerified: true,
        isActive: true
      }
    ];

    for (const adminData of testAdmins) {
      const existingAdmin = await Admin.findOne({ email: adminData.email });
      if (!existingAdmin) {
        const admin = await Admin.create(adminData);
        console.log(`✅ ${admin.role} créé: ${admin.email}`);
      } else {
        console.log(`⚠️ ${adminData.role} existe déjà: ${adminData.email}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors de la création des admins de test:', error.message);
  }
};

// Fonction pour afficher les informations de connexion
const showConnectionInfo = () => {
  console.log('\n🌐 Informations de connexion:');
  console.log('=====================================');
  console.log('URL Backend: http://localhost:8000');
  console.log('URL Frontend: http://localhost:5173');
  console.log('Endpoint Admin: /api/v1/admin');
  console.log('=====================================');
  console.log('\n📋 Comptes créés:');
  console.log('1. Super Admin: admin@harvests.com / Admin123!');
  console.log('2. Modérateur: moderator@harvests.com / Moderator123!');
  console.log('3. Support: support@harvests.com / Support123!');
  console.log('=====================================');
};

// Fonction principale
const main = async () => {
  try {
    console.log('🚀 Configuration rapide du système d\'administration');
    console.log('==================================================\n');

    await connectDB();
    await createFirstSuperAdmin();
    
    // Demander si l'utilisateur veut créer des admins de test
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const createTest = await new Promise((resolve) => {
      rl.question('\nVoulez-vous créer des administrateurs de test? (oui/non): ', resolve);
    });

    if (createTest.toLowerCase() === 'oui' || createTest.toLowerCase() === 'o') {
      await createTestAdmins();
    }

    showConnectionInfo();

    rl.close();
    console.log('\n✅ Configuration terminée!');
    console.log('💡 Utilisez "node scripts/admin-manager.js" pour gérer les administrateurs');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

// Exécuter le script
main();
