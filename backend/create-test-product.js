const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const createTestProduct = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/harvests');
    console.log('✅ Connecté à MongoDB');

    // ID du producteur de test
    const producerId = '68fa52424b58e632e00416c8';

    // Vérifier si le produit existe déjà
    const existingProduct = await Product.findOne({ name: { fr: 'Tomates Bio Test' } });
    if (existingProduct) {
      console.log('ℹ️ Produit de test existe déjà');
      console.log('Nom:', existingProduct.name.fr);
      console.log('ID:', existingProduct._id);
      return;
    }

    // Créer le produit de test
    const productData = {
      name: {
        fr: 'Tomates Bio Test',
        en: 'Organic Tomatoes Test'
      },
      description: {
        fr: 'Tomates biologiques cultivées sans pesticides',
        en: 'Organic tomatoes grown without pesticides'
      },
      shortDescription: {
        fr: 'Tomates bio fraîches',
        en: 'Fresh organic tomatoes'
      },
      producer: producerId,
      userType: 'producer',
      category: 'fruits',
      subcategory: 'tomates',
      price: 2500,
      compareAtPrice: 3000,
      images: [
        {
          url: 'https://res.cloudinary.com/dlbwu1dld/image/upload/v1761227271/harvests/products/tomates-test.jpg',
          alt: 'Tomates Bio Test',
          isPrimary: true,
          order: 0
        }
      ],
      inventory: {
        quantity: 100,
        allowBackorder: false,
        lowStockThreshold: 10,
        trackQuantity: true
      },
      minimumOrderQuantity: 1,
      maximumOrderQuantity: 50,
      status: 'approved',
      isActive: true,
      isFeatured: true,
      tags: ['bio', 'local', 'frais'],
      stats: {
        views: 0,
        sales: 0,
        favorites: 0
      }
    };

    const product = new Product(productData);
    await product.save();

    console.log('✅ Produit de test créé avec succès');
    console.log('Nom:', product.name.fr);
    console.log('ID:', product._id);
    console.log('Prix:', product.price, 'FCFA');

  } catch (error) {
    console.error('❌ Erreur lors de la création du produit:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
};

createTestProduct();
