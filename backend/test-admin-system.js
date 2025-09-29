#!/usr/bin/env node

/**
 * Script de test du système d'administration
 */

const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const testAdminSystem = async () => {
  try {
    console.log('🧪 Test du système d\'administration...\n');

    // Connexion à la base de données
    const mongoURI = process.env.DATABASE_LOCAL || process.env.DATABASE_URL || 'mongodb://localhost:27017/harvests';
    await mongoose.connect(mongoURI);
    console.log('✅ Connexion à MongoDB réussie');

    // Vérifier si des admins existent
    const adminCount = await Admin.countDocuments();
    console.log(`📊 Nombre d'administrateurs: ${adminCount}`);

    if (adminCount === 0) {
      console.log('🚀 Création du premier super-administrateur...');
      
      const superAdmin = await Admin.create({
        firstName: 'Roll Revhieno',
        lastName: 'Haurly',
        email: 'admin@harvests.com',
        password: 'Admin@harvests123!',
        role: 'super-admin',
        department: 'technical',
        permissions: ['all'],
        isEmailVerified: true,
        isActive: true
      });

      console.log('✅ Super-administrateur créé avec succès!');
      console.log(`📧 Email: ${superAdmin.email}`);
      console.log(`👤 Nom: ${superAdmin.getFullName()}`);
      console.log(`🔐 Rôle: ${superAdmin.role}`);
    } else {
      const admins = await Admin.find().select('-password');
      console.log('📋 Administrateurs existants:');
      admins.forEach(admin => {
        console.log(`  - ${admin.getFullName()} (${admin.email}) - ${admin.role}`);
      });
    }

    console.log('\n✅ Test terminé avec succès!');
    console.log('🌐 Vous pouvez maintenant vous connecter avec:');
    console.log('   Email: admin@harvests.com');
    console.log('   Mot de passe: Admin@harvests123!');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

testAdminSystem();
