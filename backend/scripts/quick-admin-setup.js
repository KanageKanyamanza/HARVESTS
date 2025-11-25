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

    // Configuration selon l'environnement
    const isProduction = process.env.NODE_ENV === 'production';
    
    let superAdminData;
    
    if (isProduction) {
      // Configuration pour la production
      superAdminData = {
        firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
        lastName: process.env.ADMIN_LAST_NAME || 'Harvests',
        email: process.env.ADMIN_EMAIL || 'admin@harvests.sn',
        password: process.env.ADMIN_PASSWORD || 'Admin@Harvests2025!',
        role: 'super-admin',
        department: 'technical',
        permissions: ['all'],
        isEmailVerified: true,
        isActive: true
      };
      console.log('🌐 Mode PRODUCTION détecté - Configuration via variables d\'environnement');
    } else {
      // Configuration pour le développement
      superAdminData = {
        firstName: 'Roll Revhieno ',
        lastName: 'Haurly',
        email: 'contact@harvests.site',
        password: 'Admin@harvests123!',
        role: 'super-admin',
        department: 'technical',
        permissions: ['all'],
        isEmailVerified: true,
        isActive: true
      };
      console.log('🛠️ Mode DÉVELOPPEMENT détecté - Configuration par défaut');
    }

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
        email: 'contact@harvests.site',
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
  console.log('3. Support: contact@harvests.site / Support123!');
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

// Fonction pour créer automatiquement un admin si nécessaire
const createAdminIfNeeded = async () => {
  try {
    await connectDB();
    
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const env = process.env.NODE_ENV || 'development';
      console.log(`🚀 ${env.toUpperCase()}: Création automatique du premier admin...`);
      await createFirstSuperAdmin();
      console.log(`✅ Premier admin créé automatiquement en ${env}`);
    } else {
      console.log(`ℹ️ ${adminCount} administrateur(s) existent déjà dans le système`);
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Erreur lors de la création automatique de l\'admin:', error.message);
  }
};

// Exécuter le script
if (process.argv.includes('--auto-create')) {
  // Mode automatique (pour le démarrage de l'application)
  createAdminIfNeeded();
} else {
  // Mode manuel (interactif)
  main();
}
