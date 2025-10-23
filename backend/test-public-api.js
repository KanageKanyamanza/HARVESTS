const mongoose = require('mongoose');
const Review = require('./models/Review');
const Producer = require('./models/Producer');
require('dotenv').config();

const testPublicAPI = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/harvests');
    console.log('✅ Connecté à MongoDB');

    const producerId = '68fa52424b58e632e00416c8';

    // 1. Vérifier que le producteur existe
    const producer = await Producer.findById(producerId);
    if (!producer) {
      console.log('❌ Producteur non trouvé');
      return;
    }
    console.log('✅ Producteur trouvé:', producer.email);

    // 2. Vérifier les avis
    const reviews = await Review.find({ 
      producer: producerId,
      status: 'approved'
    });
    console.log('✅ Avis trouvés:', reviews.length);
    reviews.forEach(review => {
      console.log('  - Note:', review.rating, 'Statut:', review.status);
    });

    // 3. Calculer les statistiques comme dans l'API
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    console.log('📊 Statistiques calculées:');
    console.log('  - Nombre d\'avis:', totalReviews);
    console.log('  - Note moyenne:', averageRating.toFixed(1));

    // 4. Simuler la réponse de l'API
    const producerWithStats = {
      ...producer.toObject(),
      ratings: {
        average: averageRating,
        count: totalReviews
      },
      stats: {
        totalReviews,
        averageRating,
        ...producer.stats
      }
    };

    console.log('🎯 Données finales pour l\'API:');
    console.log('  - ratings.average:', producerWithStats.ratings.average);
    console.log('  - ratings.count:', producerWithStats.ratings.count);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
};

testPublicAPI();
