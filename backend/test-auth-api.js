const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testAuthApi() {
  try {
    // Connexion à MongoDB
    const DB = process.env.DATABASE_LOCAL || 'mongodb://localhost:27017/harvests';
    await mongoose.connect(DB);
    console.log('✅ Connexion à MongoDB réussie');

    // Trouver l'utilisateur
    const user = await User.findOne({ email: 'wonilih@mailinator.com' });
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    console.log(`👤 Utilisateur trouvé: ${user.firstName} ${user.lastName}`);

    // Générer un token JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-at-least-32-characters-long',
      { expiresIn: process.env.JWT_EXPIRES_IN || '90d' }
    );

    console.log(`🔑 Token généré: ${token.substring(0, 50)}...`);

    // Test de l'API avec curl
    const curlCommand = `curl -s "http://localhost:8000/api/v1/producers/me/products" \\
      -H "Authorization: Bearer ${token}" \\
      -H "Content-Type: application/json"`;

    console.log('\n🌐 Commande curl à exécuter:');
    console.log(curlCommand);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
}

testAuthApi();
