const mongoose = require('mongoose');

async function testMinimalConsumer() {
  try {
    await mongoose.connect('mongodb://localhost:27017/harvests_test');
    console.log('MongoDB connecté');
    
    // Créer un schéma User minimal
    const baseUserSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      userType: { type: String, required: true, enum: ['producer', 'transformer', 'consumer', 'restaurateur', 'exporter', 'transporter'] },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phone: { type: String, required: true }
    }, {
      timestamps: true,
      discriminatorKey: 'userType',
      collection: 'users'
    });
    
    const User = mongoose.model('User', baseUserSchema);
    console.log('User minimal créé');
    
    // Créer un schéma Consumer minimal
    const consumerSchema = new mongoose.Schema({
      dietaryPreferences: {
        type: [String],
        default: []
      }
    });
    
    const Consumer = User.discriminator('consumer', consumerSchema);
    console.log('Consumer minimal créé avec succès');
    
  } catch (error) {
    console.error('Erreur:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
  }
}

testMinimalConsumer();
