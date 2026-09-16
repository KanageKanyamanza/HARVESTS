const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Chargement des variables d'environnement
dotenv.config({ path: path.join(__dirname, '.env') });

const Producer = require('./models/Producer');
const Restaurateur = require('./models/Restaurateur');
const Transformer = require('./models/Transformer');
const User = require('./models/User');

const localUri = process.env.DATABASE_LOCAL || 'mongodb://localhost:27017/harvests';
const atlasUri = process.env.DATABASE_URL || process.env.DATABASE?.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

async function cleanupBanners(uri, label) {
  console.log(`Connexion à ${label}...`);
  try {
    const conn = await mongoose.createConnection(uri, { useNewUrlParser: true, useUnifiedTopology: true }).asPromise();
    console.log(`✅ Connecté à ${label}`);
    
    const ProducerModel = conn.model('Producer', Producer.schema || Producer);
    const RestaurateurModel = conn.model('Restaurateur', Restaurateur.schema || Restaurateur);
    const TransformerModel = conn.model('Transformer', Transformer.schema || Transformer);
    const UserModel = conn.model('User', User.schema || User);

    // Nettoyer les producteurs
    const pResult = await ProducerModel.updateMany(
      { shopBanner: { $regex: 'unsplash' } },
      { $set: { shopBanner: null } }
    );
    console.log(`Producteurs : ${pResult.modifiedCount} modifiés.`);

    // Nettoyer les restaurateurs
    const rResult = await RestaurateurModel.updateMany(
      { restaurantBanner: { $regex: 'unsplash' } },
      { $set: { restaurantBanner: null } }
    );
    console.log(`Restaurateurs : ${rResult.modifiedCount} modifiés.`);

    // Nettoyer les transformateurs
    const tResult = await TransformerModel.updateMany(
      { shopBanner: { $regex: 'unsplash' } },
      { $set: { shopBanner: null } }
    );
    console.log(`Transformateurs : ${tResult.modifiedCount} modifiés.`);

    // Nettoyer aussi les shopBanner dans User de base
    const uResult = await UserModel.updateMany(
      { shopBanner: { $regex: 'unsplash' } },
      { $set: { shopBanner: null } }
    );
    console.log(`Utilisateurs : ${uResult.modifiedCount} modifiés.`);
    
    await conn.close();
    console.log(`Déconnecté de ${label}\n`);
  } catch (error) {
    console.error(`❌ Erreur pour ${label} :`, error.message, '\n');
  }
}

(async () => {
  // Nettoyer la base locale
  await cleanupBanners(localUri, 'MongoDB Local');
  // Nettoyer la base Atlas
  if (atlasUri) {
    await cleanupBanners(atlasUri, 'MongoDB Atlas (Production)');
  } else {
    console.log('ℹ️ DATABASE_URL (ou DATABASE + DATABASE_PASSWORD) non défini, base Atlas ignorée.');
  }
  console.log('Nettoyage des bannières terminé !');
  process.exit(0);
})();
