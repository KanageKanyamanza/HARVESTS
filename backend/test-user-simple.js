const mongoose = require('mongoose');

async function testUserSimple() {
  try {
    await mongoose.connect('mongodb://localhost:27017/harvests_test');
    console.log('MongoDB connecté');
    
    // Créer un schéma User simple sans les nouveaux champs
    const baseUserSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      userType: { type: String, required: true, enum: ['producer', 'transformer', 'consumer', 'restaurateur', 'exporter', 'transporter'] },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phone: { type: String, required: true },
      country: { type: String, default: 'Sénégal' },
      address: {
        street: String,
        city: String,
        region: String,
        country: { type: String, default: 'Sénégal' },
        postalCode: String,
        coordinates: { latitude: Number, longitude: Number }
      },
      isActive: { type: Boolean, default: true },
      isApproved: { type: Boolean, default: false },
      emailVerified: { type: Boolean, default: false },
      emailVerificationToken: String,
      emailVerificationExpires: Date,
      passwordResetToken: String,
      passwordResetExpires: Date,
      loginAttempts: { type: Number, default: 0 },
      accountLockedUntil: Date,
      passwordChangedAt: Date,
      lastLogin: Date,
      preferredLanguage: { type: String, default: 'fr' },
      timezone: { type: String, default: 'Africa/Dakar' }
    }, {
      timestamps: true,
      discriminatorKey: 'userType',
      collection: 'users'
    });
    
    const User = mongoose.model('User', baseUserSchema);
    console.log('User simple créé');
    
    // Créer un schéma Consumer simple
    const consumerSchema = new mongoose.Schema({
      dietaryPreferences: {
        type: [String],
        default: []
      }
    });
    
    const Consumer = User.discriminator('consumer', consumerSchema);
    console.log('Consumer simple créé avec succès');
    
  } catch (error) {
    console.error('Erreur:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
  }
}

testUserSimple();
