const mongoose = require('mongoose');

async function testConsumerWithMinimalUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/harvests_test');
    console.log('MongoDB connecté');
    
    const User = require('./models/User-minimal');
    console.log('User minimal chargé');
    
    const Consumer = require('./models/Consumer');
    console.log('Consumer chargé avec succès');
    
  } catch (error) {
    console.error('Erreur:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
  }
}

testConsumerWithMinimalUser();
