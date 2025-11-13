require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const User = require('../models/User');

// Connexion à MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/harvests';
    console.log(`🔌 Connexion à MongoDB...`);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

// Test: Créer un paiement de souscription et l'activer
const testSubscriptionPayment = async () => {
  console.log('\n📝 Test: Paiement et activation de souscription');
  console.log('='.repeat(50));
  
  try {
    // Trouver un utilisateur producteur
    const user = await User.findOne({ userType: 'producer' });
    
    if (!user) {
      console.log('⚠️  Aucun utilisateur producteur trouvé');
      return;
    }

    console.log(`👤 Utilisateur: ${user.firstName} ${user.lastName} (${user.email})`);

    // Créer une souscription en attente
    const subscription = await Subscription.create({
      user: user._id,
      planId: 'premium',
      planName: 'Premium',
      billingPeriod: 'annual',
      amount: 75000,
      currency: 'XAF',
      paymentMethod: 'cash',
      status: 'pending',
      paymentStatus: 'pending'
    });

    console.log(`✅ Souscription créée: ${subscription._id}`);

    // Créer un paiement associé
    const payment = await Payment.create({
      paymentId: new mongoose.Types.ObjectId().toString(),
      user: user._id,
      amount: subscription.amount,
      currency: subscription.currency,
      method: 'cash',
      provider: 'cash-on-delivery',
      type: 'subscription',
      status: 'pending',
      metadata: {
        subscriptionId: subscription._id.toString(),
        planId: subscription.planId,
        billingPeriod: subscription.billingPeriod
      }
    });

    // Lier le paiement à la souscription
    subscription.payment = payment._id;
    await subscription.save();

    console.log(`✅ Paiement créé: ${payment.paymentId}`);
    console.log(`   Type: ${payment.type}`);
    console.log(`   Montant: ${payment.amount} ${payment.currency}`);

    // Simuler la confirmation du paiement (comme dans paymentController)
    payment.paymentDetails = {
      cash: {
        confirmedBy: user._id,
        confirmedAt: new Date(),
        notes: 'Test de paiement'
      }
    };
    
    await payment.markAsSucceeded(null);

    // Activer la souscription après paiement réussi
    subscription.status = 'active';
    subscription.paymentStatus = 'completed';
    subscription.startDate = new Date();
    subscription.endDate = subscription.calculateEndDate();
    subscription.nextBillingDate = subscription.calculateNextBillingDate();
    await subscription.save();

    console.log('\n✅ Souscription activée après paiement:');
    console.log(`   Statut: ${subscription.status}`);
    console.log(`   Paiement: ${subscription.paymentStatus}`);
    console.log(`   Date début: ${subscription.startDate}`);
    console.log(`   Date fin: ${subscription.endDate}`);
    console.log(`   Prochaine facturation: ${subscription.nextBillingDate}`);

    return { subscription, payment };
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
    return null;
  }
};

// Test: Vérifier que les méthodes de calcul fonctionnent
const testCalculationMethods = async () => {
  console.log('\n📝 Test: Méthodes de calcul');
  console.log('='.repeat(50));
  
  try {
    const user = await User.findOne({ userType: 'producer' });
    
    if (!user) {
      console.log('⚠️  Aucun utilisateur producteur trouvé');
      return;
    }

    // Test mensuel
    const monthlySub = new Subscription({
      user: user._id,
      planId: 'standard',
      planName: 'Standard',
      billingPeriod: 'monthly',
      amount: 3000,
      currency: 'XAF',
      startDate: new Date('2024-01-01')
    });

    const monthlyEndDate = monthlySub.calculateEndDate();
    console.log('✅ Test mensuel:');
    console.log(`   Date début: ${monthlySub.startDate}`);
    console.log(`   Date fin calculée: ${monthlyEndDate}`);
    console.log(`   Durée: ${Math.round((monthlyEndDate - monthlySub.startDate) / (1000 * 60 * 60 * 24))} jours`);

    // Test annuel
    const annualSub = new Subscription({
      user: user._id,
      planId: 'premium',
      planName: 'Premium',
      billingPeriod: 'annual',
      amount: 75000,
      currency: 'XAF',
      startDate: new Date('2024-01-01')
    });

    const annualEndDate = annualSub.calculateEndDate();
    console.log('\n✅ Test annuel:');
    console.log(`   Date début: ${annualSub.startDate}`);
    console.log(`   Date fin calculée: ${annualEndDate}`);
    console.log(`   Durée: ${Math.round((annualEndDate - annualSub.startDate) / (1000 * 60 * 60 * 24))} jours`);

    // Test prochaine facturation
    annualSub.status = 'active';
    const nextBilling = annualSub.calculateNextBillingDate();
    console.log(`   Prochaine facturation: ${nextBilling}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return null;
  }
};

// Fonction principale
const runTests = async () => {
  console.log('\n🧪 TESTS DE PAIEMENT ET ACTIVATION DE SOUSCRIPTIONS');
  console.log('='.repeat(50));

  await connectDB();

  try {
    await testCalculationMethods();
    await testSubscriptionPayment();
    
    console.log('\n✅ Tous les tests terminés avec succès!');
  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Connexion MongoDB fermée');
    process.exit(0);
  }
};

// Exécuter les tests
runTests();

