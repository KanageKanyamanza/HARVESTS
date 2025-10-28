const mongoose = require('mongoose');
const Restaurateur = require('../models/Restaurateur');

// Connexion à MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/harvests');
    console.log('✅ Connexion à MongoDB réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error);
    process.exit(1);
  }
};

// Approuver tous les plats existants
const approveExistingDishes = async () => {
  try {
    console.log('🔍 Recherche des plats à approuver...');
    
    // Trouver tous les restaurateurs avec des plats
    const restaurateurs = await Restaurateur.find({ 'dishes.0': { $exists: true } });
    
    let totalDishesUpdated = 0;
    
    for (const restaurateur of restaurateurs) {
      let dishesUpdated = 0;
      
      // Mettre à jour tous les plats pour qu'ils soient approuvés
      restaurateur.dishes.forEach(dish => {
        if (dish.status !== 'approved') {
          dish.status = 'approved';
          dish.approvedAt = new Date();
          dish.rejectionReason = undefined;
          dishesUpdated++;
        }
      });
      
      if (dishesUpdated > 0) {
        await restaurateur.save();
        console.log(`✅ ${dishesUpdated} plat(s) approuvé(s) pour ${restaurateur.restaurantName || restaurateur.firstName}`);
        totalDishesUpdated += dishesUpdated;
      }
    }
    
    console.log(`🎉 Total: ${totalDishesUpdated} plat(s) approuvé(s)`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'approbation des plats:', error);
  }
};

// Exécution du script
const runScript = async () => {
  await connectDB();
  await approveExistingDishes();
  await mongoose.connection.close();
  console.log('✅ Script terminé');
  process.exit(0);
};

runScript();
