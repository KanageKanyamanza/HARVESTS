const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');
require('dotenv').config();

const createTestOrder = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/harvests');
    console.log('✅ Connecté à MongoDB');

    // ID du producteur et du produit de test
    const producerId = '68fa52424b58e632e00416c8';
    const productId = '68fa5250aba813400f49988d';
    const consumerId = '68fa3b5dfaf66bf7d2b857ca'; // ID du consommateur de test

    // Vérifier si la commande existe déjà
    const existingOrder = await Order.findOne({ orderNumber: 'HSN0003TEST' });
    if (existingOrder) {
      console.log('ℹ️ Commande de test existe déjà');
      console.log('Numéro:', existingOrder.orderNumber);
      console.log('ID:', existingOrder._id);
      return;
    }

    // Récupérer le produit pour avoir les détails
    const product = await Product.findById(productId);
    if (!product) {
      console.log('❌ Produit non trouvé');
      return;
    }

    // Créer la commande de test
    const quantity = 2;
    const unitPrice = product.price;
    const totalPrice = unitPrice * quantity;
    
    const orderData = {
      orderNumber: 'HSN0003TEST',
      buyer: consumerId,
      seller: producerId,
      items: [
        {
          product: productId,
          name: product.name?.fr || product.name?.en || product.name,
          price: product.price,
          unitPrice: unitPrice,
          totalPrice: totalPrice,
          quantity: quantity,
          category: product.category,
          image: product.images?.[0]?.url
        }
      ],
      subtotal: totalPrice,
      total: totalPrice,
      currency: 'XAF',
      status: 'completed', // Commande terminée pour avoir des revenus
      paymentStatus: 'paid',
      shippingAddress: {
        street: 'Avenue Test',
        city: 'Dakar',
        region: 'Dakar',
        postalCode: '10000',
        country: 'SN'
      },
      notes: 'Commande de test pour les statistiques'
    };

    const order = new Order(orderData);
    await order.save();

    console.log('✅ Commande de test créée avec succès');
    console.log('Numéro:', order.orderNumber);
    console.log('ID:', order._id);
    console.log('Total:', order.total, 'XAF');
    console.log('Statut:', order.status);

  } catch (error) {
    console.error('❌ Erreur lors de la création de la commande:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
};

createTestOrder();
