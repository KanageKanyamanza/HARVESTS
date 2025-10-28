const mongoose = require('mongoose');
const User = require('./models/User');

// Test avec un schéma Consumer simplifié
const testConsumerSchema = new mongoose.Schema({
  // Préférences alimentaires
  dietaryPreferences: {
    type: [String],
    enum: ['organic', 'vegetarian', 'vegan', 'gluten-free', 'halal', 'kosher', 'local', 'seasonal'],
    default: []
  },
  
  // Allergies alimentaires
  allergies: [{
    allergen: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      required: true
    }
  }],
  
  // Préférences d'achat
  shoppingPreferences: {
    preferredDeliveryTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'weekend', 'flexible'],
      default: 'flexible'
    },
    maxDeliveryDistance: {
      type: Number,
      default: 25,
      min: 1,
      max: 100
    },
    budgetRange: {
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 100000
      },
      currency: {
        type: String,
        default: 'XAF'
      }
    }
  }
});

console.log('Schéma test créé');

try {
  const TestConsumer = User.discriminator('testconsumer', testConsumerSchema);
  console.log('TestConsumer créé avec succès');
} catch (error) {
  console.error('Erreur lors de la création du discriminateur:', error.message);
  console.error('Stack:', error.stack);
}
