const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createTestUser() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/harvests');
    console.log('✅ Connecté à MongoDB');

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('👤 Utilisateur de test existe déjà');
      console.log('Email:', existingUser.email);
      console.log('Type:', existingUser.userType);
      return;
    }

    // Créer un utilisateur de test
    const testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      userType: 'consumer',
      phone: '+221701234567',
      address: 'Dakar, Sénégal',
      city: 'Dakar',
      region: 'Dakar',
      country: 'SN',
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
      isApproved: true
    });

    await testUser.save();
    console.log('✅ Utilisateur de test créé avec succès');
    console.log('Email:', testUser.email);
    console.log('Mot de passe: password123');
    console.log('Type:', testUser.userType);

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

createTestUser();
