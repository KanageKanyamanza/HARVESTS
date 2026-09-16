const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Producer = require('./models/Producer');
const Restaurateur = require('./models/Restaurateur');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.DATABASE_URL || process.env.DATABASE?.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

(async () => {
  try {
    if (!mongoUri) {
      console.error('❌ DATABASE_URL (ou DATABASE + DATABASE_PASSWORD) non défini dans .env');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB Atlas');
    
    // Chercher et supprimer la bannière du producteur "À compléter"
    const producer = await Producer.findOne({ 
      firstName: "À compléter",
      shopBanner: 'https://via.placeholder.com/1200x400?text=Ferme'
    });
    
    if (producer) {
      producer.shopBanner = null;
      await producer.save();
      console.log('✅ Bannière supprimée du producteur');
    } else {
      console.log('ℹ️ Producteur non trouvé ou bannière déjà supprimée');
    }
    
    // Chercher et supprimer la bannière du restaurateur
    const restaurateur = await Restaurateur.findOne({ 
      restaurantName: 'Les Merveilles d\'ici et d\'ailleurs',
      restaurantBanner: { $regex: 'placeholder' }
    });
    
    if (restaurateur) {
      restaurateur.restaurantBanner = null;
      await restaurateur.save();
      console.log('✅ Bannière supprimée du restaurateur');
    } else {
      console.log('ℹ️ Restaurateur non trouvé ou bannière déjà supprimée');
    }
    
    console.log('✅ Annulation terminée! Les données de production sont restaurées.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
})();
