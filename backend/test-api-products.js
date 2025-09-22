const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
require('dotenv').config();

async function testApiProducts() {
  try {
    // Connexion à MongoDB
    const DB = process.env.DATABASE_LOCAL || 'mongodb://localhost:27017/harvests';
    await mongoose.connect(DB);
    console.log('✅ Connexion à MongoDB réussie');

    // Trouver l'utilisateur Ashton Grub
    const user = await User.findOne({ email: 'wonilih@mailinator.com' });
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    console.log(`👤 Utilisateur trouvé: ${user.firstName} ${user.lastName} (${user._id})`);

    // Simuler la requête getMyProducts
    const queryObj = { producer: user._id };
    console.log(`🔍 Requête: ${JSON.stringify(queryObj)}`);

    const products = await Product.find(queryObj)
      .sort('-createdAt');

    const total = await Product.countDocuments(queryObj);

    console.log(`📦 Produits trouvés: ${products.length} sur ${total} total`);
    
    if (products.length > 0) {
      products.forEach((product, index) => {
        const productName = typeof product.name === 'string' ? product.name : product.name.fr;
        console.log(`   ${index + 1}. ${productName} (${product.status}) - ${product.price} FCFA`);
      });
    }

    // Simuler la réponse de l'API
    const apiResponse = {
      status: 'success',
      results: products.length,
      total,
      page: 1,
      totalPages: 1,
      data: { products }
    };

    console.log('\n📡 Réponse API simulée:');
    console.log(JSON.stringify(apiResponse, null, 2));

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
}

testApiProducts();
