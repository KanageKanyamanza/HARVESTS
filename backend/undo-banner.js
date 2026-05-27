const mongoose = require('mongoose');
const Producer = require('./models/Producer');
const Restaurateur = require('./models/Restaurateur');

// Utiliser la vraie URI MongoDB Atlas
const mongoUri = 'mongodb+srv://harvests_db:B3OHy5tFnCSbRh1c@cluster0.mr1qd38.mongodb.net/?appName=Cluster0';

(async () => {
  try {
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
