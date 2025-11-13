require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Payment = require('../models/Payment');

// Connexion à MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/harvests';
    console.log(`🔌 Tentative de connexion à MongoDB...`);
    console.log(`   URI: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`); // Masquer les credentials
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    console.error('\n💡 Vérifiez que:');
    console.error('   1. MongoDB est démarré');
    console.error('   2. MONGODB_URI est correctement configuré dans .env');
    console.error('   3. Les credentials sont valides');
    process.exit(1);
  }
};

// Fonction pour tester la création d'une souscription
const testCreateSubscription = async () => {
  console.log('\n📝 Test 1: Création d\'une souscription');
  console.log('='.repeat(50));
  
  try {
    // Trouver un utilisateur de test (producteur)
    const user = await User.findOne({ userType: 'producer' });
    
    if (!user) {
      console.log('⚠️  Aucun utilisateur producteur trouvé. Création d\'un utilisateur de test...');
      // Créer un utilisateur de test si nécessaire
      return;
    }

    console.log(`👤 Utilisateur: ${user.firstName} ${user.lastName} (${user.email})`);

    // Tester la création d'une souscription Standard mensuelle
    const subscription = await Subscription.create({
      user: user._id,
      planId: 'standard',
      planName: 'Standard',
      billingPeriod: 'monthly',
      amount: 3000,
      currency: 'XAF',
      paymentMethod: 'cash',
      status: 'pending',
      paymentStatus: 'pending'
    });

    console.log('✅ Souscription créée avec succès:');
    console.log(`   ID: ${subscription._id}`);
    console.log(`   Plan: ${subscription.planName}`);
    console.log(`   Période: ${subscription.billingPeriod}`);
    console.log(`   Montant: ${subscription.amount} ${subscription.currency}`);
    console.log(`   Statut: ${subscription.status}`);
    console.log(`   Date de fin calculée: ${subscription.endDate}`);

    return subscription;
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error.message);
    return null;
  }
};

// Fonction pour tester l'activation d'un plan gratuit
const testActivateFreePlan = async () => {
  console.log('\n📝 Test 2: Activation d\'un plan gratuit');
  console.log('='.repeat(50));
  
  try {
    const user = await User.findOne({ userType: 'producer' });
    
    if (!user) {
      console.log('⚠️  Aucun utilisateur producteur trouvé');
      return;
    }

    // Vérifier s'il a déjà une souscription active
    const existingActive = await Subscription.findOne({
      user: user._id,
      status: 'active'
    });

    if (existingActive) {
      console.log('⚠️  L\'utilisateur a déjà une souscription active');
      console.log(`   Plan actuel: ${existingActive.planName}`);
      return;
    }

    const subscription = await Subscription.create({
      user: user._id,
      planId: 'gratuit',
      planName: 'Gratuit',
      billingPeriod: 'monthly',
      amount: 0,
      currency: 'XAF',
      paymentMethod: 'cash',
      status: 'active',
      paymentStatus: 'completed',
      autoRenew: false
    });

    console.log('✅ Plan gratuit activé avec succès:');
    console.log(`   ID: ${subscription._id}`);
    console.log(`   Statut: ${subscription.status}`);
    console.log(`   Date de fin: ${subscription.endDate}`);

    return subscription;
  } catch (error) {
    console.error('❌ Erreur lors de l\'activation:', error.message);
    return null;
  }
};

// Fonction pour tester l'obtention des plans disponibles
const testGetAvailablePlans = async () => {
  console.log('\n📝 Test 3: Plans disponibles');
  console.log('='.repeat(50));
  
  try {
    const plans = Subscription.getAvailablePlans();
    
    console.log('✅ Plans disponibles:');
    Object.values(plans).forEach(plan => {
      console.log(`\n   Plan: ${plan.name}`);
      console.log(`   Mensuel: ${plan.monthlyPrice} XAF`);
      console.log(`   Annuel: ${plan.annualPrice} XAF`);
    });

    return plans;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return null;
  }
};

// Fonction pour tester l'obtention des souscriptions d'un utilisateur
const testGetUserSubscriptions = async () => {
  console.log('\n📝 Test 4: Souscriptions d\'un utilisateur');
  console.log('='.repeat(50));
  
  try {
    const user = await User.findOne({ userType: 'producer' });
    
    if (!user) {
      console.log('⚠️  Aucun utilisateur producteur trouvé');
      return;
    }

    const subscriptions = await Subscription.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate('payment', 'paymentId status amount');

    console.log(`✅ Souscriptions trouvées pour ${user.firstName} ${user.lastName}: ${subscriptions.length}`);
    
    subscriptions.forEach((sub, index) => {
      console.log(`\n   Souscription ${index + 1}:`);
      console.log(`   Plan: ${sub.planName} (${sub.planId})`);
      console.log(`   Période: ${sub.billingPeriod}`);
      console.log(`   Montant: ${sub.amount} ${sub.currency}`);
      console.log(`   Statut: ${sub.status}`);
      console.log(`   Paiement: ${sub.paymentStatus}`);
      console.log(`   Date début: ${sub.startDate}`);
      console.log(`   Date fin: ${sub.endDate}`);
      if (sub.nextBillingDate) {
        console.log(`   Prochaine facturation: ${sub.nextBillingDate}`);
      }
    });

    return subscriptions;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return null;
  }
};

// Fonction pour tester les statistiques admin
const testGetSubscriptionStats = async () => {
  console.log('\n📝 Test 5: Statistiques des souscriptions');
  console.log('='.repeat(50));
  
  try {
    const stats = {
      total: await Subscription.countDocuments(),
      active: await Subscription.countDocuments({ status: 'active' }),
      pending: await Subscription.countDocuments({ status: 'pending' }),
      cancelled: await Subscription.countDocuments({ status: 'cancelled' }),
      expired: await Subscription.countDocuments({ status: 'expired' }),
      byPlan: {
        gratuit: await Subscription.countDocuments({ planId: 'gratuit' }),
        standard: await Subscription.countDocuments({ planId: 'standard' }),
        premium: await Subscription.countDocuments({ planId: 'premium' })
      },
      byPeriod: {
        monthly: await Subscription.countDocuments({ billingPeriod: 'monthly' }),
        annual: await Subscription.countDocuments({ billingPeriod: 'annual' })
      },
      revenue: {
        total: await Subscription.aggregate([
          { $match: { paymentStatus: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).then(result => result[0]?.total || 0),
        monthly: await Subscription.aggregate([
          {
            $match: {
              paymentStatus: 'completed',
              createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
            }
          },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).then(result => result[0]?.total || 0)
      }
    };

    console.log('✅ Statistiques:');
    console.log(`   Total: ${stats.total}`);
    console.log(`   Actives: ${stats.active}`);
    console.log(`   En attente: ${stats.pending}`);
    console.log(`   Annulées: ${stats.cancelled}`);
    console.log(`   Expirées: ${stats.expired}`);
    console.log(`\n   Par plan:`);
    console.log(`   - Gratuit: ${stats.byPlan.gratuit}`);
    console.log(`   - Standard: ${stats.byPlan.standard}`);
    console.log(`   - Premium: ${stats.byPlan.premium}`);
    console.log(`\n   Par période:`);
    console.log(`   - Mensuel: ${stats.byPeriod.monthly}`);
    console.log(`   - Annuel: ${stats.byPeriod.annual}`);
    console.log(`\n   Revenus:`);
    console.log(`   - Total: ${stats.revenue.total} XAF`);
    console.log(`   - Ce mois: ${stats.revenue.monthly} XAF`);

    return stats;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return null;
  }
};

// Fonction pour tester la mise à jour du statut
const testUpdateSubscriptionStatus = async () => {
  console.log('\n📝 Test 6: Mise à jour du statut d\'une souscription');
  console.log('='.repeat(50));
  
  try {
    // Trouver une souscription en attente
    const subscription = await Subscription.findOne({ status: 'pending' });
    
    if (!subscription) {
      console.log('⚠️  Aucune souscription en attente trouvée');
      return;
    }

    console.log(`📋 Souscription trouvée: ${subscription.planName} (${subscription.status})`);

    // Activer la souscription
    subscription.status = 'active';
    subscription.paymentStatus = 'completed';
    subscription.startDate = new Date();
    subscription.endDate = subscription.calculateEndDate();
    subscription.nextBillingDate = subscription.calculateNextBillingDate();
    
    await subscription.save();

    console.log('✅ Souscription activée avec succès:');
    console.log(`   Nouveau statut: ${subscription.status}`);
    console.log(`   Statut paiement: ${subscription.paymentStatus}`);
    console.log(`   Date de fin: ${subscription.endDate}`);
    console.log(`   Prochaine facturation: ${subscription.nextBillingDate}`);

    return subscription;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return null;
  }
};

// Fonction pour tester l'annulation d'une souscription
const testCancelSubscription = async () => {
  console.log('\n📝 Test 7: Annulation d\'une souscription');
  console.log('='.repeat(50));
  
  try {
    // Trouver une souscription active
    const subscription = await Subscription.findOne({ status: 'active' });
    
    if (!subscription) {
      console.log('⚠️  Aucune souscription active trouvée');
      return;
    }

    console.log(`📋 Souscription trouvée: ${subscription.planName} (${subscription.status})`);

    // Annuler la souscription
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    subscription.cancellationReason = 'Test d\'annulation';
    subscription.autoRenew = false;
    
    await subscription.save();

    console.log('✅ Souscription annulée avec succès:');
    console.log(`   Nouveau statut: ${subscription.status}`);
    console.log(`   Date d\'annulation: ${subscription.cancelledAt}`);
    console.log(`   Raison: ${subscription.cancellationReason}`);

    return subscription;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return null;
  }
};

// Fonction principale
const runTests = async () => {
  console.log('\n🧪 TESTS DU SYSTÈME DE SOUSCRIPTIONS');
  console.log('='.repeat(50));

  await connectDB();

  try {
    // Exécuter tous les tests
    await testGetAvailablePlans();
    await testCreateSubscription();
    await testActivateFreePlan();
    await testGetUserSubscriptions();
    await testGetSubscriptionStats();
    await testUpdateSubscriptionStatus();
    await testCancelSubscription();
    
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

