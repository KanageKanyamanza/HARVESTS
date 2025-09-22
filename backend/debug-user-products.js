const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
require('dotenv').config();

async function debugUserProducts() {
  try {
    // Connexion à MongoDB
    const DB = process.env.DATABASE_LOCAL || 'mongodb://localhost:27017/harvests';
    await mongoose.connect(DB);
    console.log('✅ Connexion à MongoDB réussie');

    // Lister tous les utilisateurs de type producer
    console.log('\n👥 Utilisateurs de type producer:');
    const producers = await User.find({ userType: 'producer' }).select('_id firstName lastName email userType');
    console.log(producers);

    // Pour chaque producer, lister ses produits
    for (const producer of producers) {
      console.log(`\n📦 Produits du producteur ${producer.firstName} ${producer.lastName} (${producer._id}):`);
      
      const products = await Product.find({ producer: producer._id })
        .select('_id name price status category createdAt')
        .sort('-createdAt');
      
      if (products.length === 0) {
        console.log('   Aucun produit trouvé');
      } else {
        products.forEach(product => {
          const productName = typeof product.name === 'string' ? product.name : product.name.fr;
          console.log(`   - ${productName} (${product.status}) - ${product.price} FCFA - ${product.createdAt}`);
        });
      }
    }

    // Lister tous les produits récents (derniers 24h)
    console.log('\n🕒 Produits créés dans les dernières 24h:');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentProducts = await Product.find({ 
      createdAt: { $gte: yesterday } 
    })
    .populate('producer', 'firstName lastName email')
    .select('_id name price status category producer createdAt')
    .sort('-createdAt');
    
    if (recentProducts.length === 0) {
      console.log('   Aucun produit créé récemment');
    } else {
      recentProducts.forEach(product => {
        const productName = typeof product.name === 'string' ? product.name : product.name.fr;
        console.log(`   - ${productName} par ${product.producer.firstName} ${product.producer.lastName} (${product.status}) - ${product.createdAt}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors du débogage:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
}

debugUserProducts();
