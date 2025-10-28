const mongoose = require('mongoose');
const Review = require('./models/Review');
const User = require('./models/User');
const Order = require('./models/Order');
require('dotenv').config();

const createTestReview = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/harvests');
    console.log('✅ Connecté à MongoDB');

    // ID du producteur et du consommateur
    const producerId = '68fa52424b58e632e00416c8';
    const consumerId = '68fa3b5dfaf66bf7d2b857ca';
    const orderId = '68fa527518a0c913840d72aa';

    // Vérifier si l'avis existe déjà
    const existingReview = await Review.findOne({ 
      producer: producerId, 
      reviewer: consumerId,
      order: orderId
    });
    
    if (existingReview) {
      console.log('ℹ️ Avis de test existe déjà');
      console.log('Note:', existingReview.rating);
      console.log('ID:', existingReview._id);
      return;
    }

    // Récupérer l'ID du produit depuis la commande
    const order = await Order.findById(orderId);
    if (!order) {
      console.log('❌ Commande non trouvée');
      return;
    }
    const productId = order.items[0].product;

    // Créer l'avis de test
    const reviewData = {
      producer: producerId, // Champ requis
      product: productId,   // Champ requis
      reviewer: consumerId, // Champ requis
      order: orderId,
      rating: 4.5,
      reviewText: 'Excellent producteur ! Produits de très bonne qualité, livraison rapide. Je recommande vivement.',
      status: 'approved',
      isVerified: true
    };

    const review = new Review(reviewData);
    await review.save();

    console.log('✅ Avis de test créé avec succès');
    console.log('Note:', review.rating);
    console.log('ID:', review._id);
    console.log('Statut:', review.status);

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'avis:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
};

createTestReview();
