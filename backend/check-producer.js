const mongoose = require('mongoose');
const Producer = require('./models/Producer');
require('dotenv').config();

const checkProducer = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/harvests');
    console.log('✅ Connecté à MongoDB');

    const producer = await Producer.findOne({ email: 'producer@test.com' });
    
    if (producer) {
      console.log('✅ Producteur trouvé');
      console.log('Email:', producer.email);
      console.log('UserType:', producer.userType);
      console.log('isActive:', producer.isActive);
      console.log('emailVerified:', producer.emailVerified);
      console.log('isEmailVerified:', producer.isEmailVerified);
      console.log('Password hash exists:', !!producer.password);
    } else {
      console.log('❌ Producteur non trouvé');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
};

checkProducer();
