const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Script de migration pour synchroniser les champs emailVerified et isEmailVerified
async function syncEmailVerification() {
  try {
    // Connexion à la base de données
    const databaseUrl = process.env.DATABASE || process.env.DATABASE_LOCAL || 'mongodb://localhost:27017/harvests';
    
    if (databaseUrl.includes('<PASSWORD>')) {
      const password = process.env.DATABASE_PASSWORD || 'password';
      const finalUrl = databaseUrl.replace('<PASSWORD>', password);
      await mongoose.connect(finalUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } else {
      await mongoose.connect(databaseUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
    
    console.log('🔗 Connecté à la base de données');
    
    // Trouver tous les utilisateurs
    const users = await User.find({});
    
    console.log(`📊 Trouvé ${users.length} utilisateurs à vérifier`);
    
    let updatedCount = 0;
    
    for (const user of users) {
      const needsUpdate = user.emailVerified !== user.isEmailVerified;
      
      if (needsUpdate) {
        // Utiliser isEmailVerified comme source de vérité
        const correctValue = user.isEmailVerified !== undefined ? user.isEmailVerified : user.emailVerified;
        
        await User.findByIdAndUpdate(user._id, {
          emailVerified: correctValue,
          isEmailVerified: correctValue
        });
        
        updatedCount++;
        console.log(`✅ Utilisateur ${user.email}: synchronisé (${correctValue})`);
      }
    }
    
    console.log(`🎉 Migration terminée: ${updatedCount} utilisateurs mis à jour`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de la base de données');
  }
}

// Exécuter la migration
if (require.main === module) {
  syncEmailVerification();
}

module.exports = syncEmailVerification;
