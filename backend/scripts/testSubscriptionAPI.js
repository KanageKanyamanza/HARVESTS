require('dotenv').config({ path: './.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/v1';

// Fonction pour obtenir un token d'authentification
const getAuthToken = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });
    return response.data.token;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.response?.data?.message || error.message);
    return null;
  }
};

// Fonction pour créer une instance axios avec le token
const createAuthenticatedClient = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// Test 1: Obtenir mes souscriptions
const testGetMySubscriptions = async (client) => {
  console.log('\n📝 Test API 1: Obtenir mes souscriptions');
  console.log('='.repeat(50));
  
  try {
    const response = await client.get('/subscriptions/me');
    console.log('✅ Réponse:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return null;
  }
};

// Test 2: Créer une souscription
const testCreateSubscription = async (client) => {
  console.log('\n📝 Test API 2: Créer une souscription');
  console.log('='.repeat(50));
  
  try {
    const subscriptionData = {
      planId: 'standard',
      billingPeriod: 'monthly',
      amount: 3000,
      currency: 'XAF',
      paymentMethod: 'cash'
    };

    const response = await client.post('/subscriptions', subscriptionData);
    console.log('✅ Souscription créée:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return null;
  }
};

// Test 3: Activer un plan gratuit
const testActivateFreePlan = async (client) => {
  console.log('\n📝 Test API 3: Activer un plan gratuit');
  console.log('='.repeat(50));
  
  try {
    const response = await client.post('/subscriptions/activate-free', {
      planId: 'gratuit'
    });
    console.log('✅ Plan gratuit activé:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return null;
  }
};

// Test 4: Obtenir une souscription par ID
const testGetSubscriptionById = async (client, subscriptionId) => {
  console.log('\n📝 Test API 4: Obtenir une souscription par ID');
  console.log('='.repeat(50));
  
  try {
    const response = await client.get(`/subscriptions/${subscriptionId}`);
    console.log('✅ Souscription trouvée:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return null;
  }
};

// Test 5: Annuler une souscription
const testCancelSubscription = async (client, subscriptionId) => {
  console.log('\n📝 Test API 5: Annuler une souscription');
  console.log('='.repeat(50));
  
  try {
    const response = await client.patch(`/subscriptions/${subscriptionId}/cancel`, {
      reason: 'Test d\'annulation via API'
    });
    console.log('✅ Souscription annulée:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return null;
  }
};

// Test 6: Obtenir les statistiques (admin)
const testGetSubscriptionStats = async (adminClient) => {
  console.log('\n📝 Test API 6: Obtenir les statistiques (admin)');
  console.log('='.repeat(50));
  
  try {
    const response = await adminClient.get('/subscriptions/stats/overview');
    console.log('✅ Statistiques:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return null;
  }
};

// Test 7: Obtenir toutes les souscriptions (admin)
const testGetAllSubscriptions = async (adminClient) => {
  console.log('\n📝 Test API 7: Obtenir toutes les souscriptions (admin)');
  console.log('='.repeat(50));
  
  try {
    const response = await adminClient.get('/subscriptions/admin', {
      params: {
        page: 1,
        limit: 10,
        status: 'active'
      }
    });
    console.log('✅ Souscriptions trouvées:', response.data.data?.subscriptions?.length || 0);
    console.log('   Total:', response.data.total || 0);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return null;
  }
};

// Test 8: Mettre à jour le statut d'une souscription (admin)
const testUpdateSubscriptionStatus = async (adminClient, subscriptionId) => {
  console.log('\n📝 Test API 8: Mettre à jour le statut (admin)');
  console.log('='.repeat(50));
  
  try {
    const response = await adminClient.patch(`/subscriptions/admin/${subscriptionId}/status`, {
      status: 'active',
      paymentStatus: 'completed'
    });
    console.log('✅ Statut mis à jour:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return null;
  }
};

// Fonction principale
const runAPITests = async () => {
  console.log('\n🧪 TESTS API DU SYSTÈME DE SOUSCRIPTIONS');
  console.log('='.repeat(50));

  // Informations de connexion (à adapter selon votre configuration)
  const userEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
  const userPassword = process.env.TEST_USER_PASSWORD || 'password123';
  const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.TEST_ADMIN_PASSWORD || 'admin123';

  try {
    // Obtenir les tokens
    console.log('\n🔐 Authentification...');
    const userToken = await getAuthToken(userEmail, userPassword);
    const adminToken = await getAuthToken(adminEmail, adminPassword);

    if (!userToken) {
      console.error('❌ Impossible de se connecter en tant qu\'utilisateur');
      console.log('💡 Vérifiez TEST_USER_EMAIL et TEST_USER_PASSWORD dans .env');
      return;
    }

    if (!adminToken) {
      console.error('⚠️  Impossible de se connecter en tant qu\'admin');
      console.log('💡 Vérifiez TEST_ADMIN_EMAIL et TEST_ADMIN_PASSWORD dans .env');
    }

    // Créer les clients authentifiés
    const userClient = createAuthenticatedClient(userToken);
    const adminClient = adminToken ? createAuthenticatedClient(adminToken) : null;

    // Tests utilisateur
    console.log('\n👤 TESTS UTILISATEUR');
    console.log('='.repeat(50));
    
    await testGetMySubscriptions(userClient);
    const createdSub = await testCreateSubscription(userClient);
    await testActivateFreePlan(userClient);
    
    if (createdSub?.data?.subscription?._id) {
      const subscriptionId = createdSub.data.subscription._id;
      await testGetSubscriptionById(userClient, subscriptionId);
      // Ne pas annuler pour les tests suivants
      // await testCancelSubscription(userClient, subscriptionId);
    }

    // Tests admin
    if (adminClient) {
      console.log('\n👨‍💼 TESTS ADMIN');
      console.log('='.repeat(50));
      
      await testGetSubscriptionStats(adminClient);
      await testGetAllSubscriptions(adminClient);
      
      if (createdSub?.data?.subscription?._id) {
        await testUpdateSubscriptionStatus(adminClient, createdSub.data.subscription._id);
      }
    } else {
      console.log('\n⚠️  Tests admin ignorés (pas de token admin)');
    }

    console.log('\n✅ Tous les tests API terminés!');
  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error);
  }
};

// Exécuter les tests
runAPITests();

