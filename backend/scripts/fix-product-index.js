const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function fixProductIndex() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/harvests';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('products');

    // Supprimer l'ancien index
    try {
      await collection.dropIndex('originType_1_sourceDish_1');
      console.log('✅ Ancien index supprimé');
    } catch (error) {
      if (error.codeName === 'IndexNotFound') {
        console.log('ℹ️  L\'index n\'existait pas déjà');
      } else {
        throw error;
      }
    }

    // Créer le nouvel index sans contrainte unique (non-unique car plusieurs produits peuvent avoir originType: catalog et sourceDish: null)
    await collection.createIndex(
      { originType: 1, sourceDish: 1 },
      {
        name: 'originType_1_sourceDish_1'
      }
    );
    console.log('✅ Nouvel index créé avec succès (sans contrainte unique)');

    await mongoose.connection.close();
    console.log('✅ Connexion fermée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

fixProductIndex();

