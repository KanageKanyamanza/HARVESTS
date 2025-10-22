const mongoose = require('mongoose');

async function testConsumer() {
  try {
    await mongoose.connect('mongodb://localhost:27017/harvests_test');
    console.log('MongoDB connecté');
    
    const User = require('./models/User');
    console.log('User chargé');
    
    // Forcer la compilation du schéma
    User.schema;
    console.log('User schema compilé');
    
    const Consumer = require('./models/Consumer');
    console.log('Consumer chargé avec succès');
    
  } catch (error) {
    console.error('Erreur:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
  }
}

testConsumer();
