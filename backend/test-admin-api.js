#!/usr/bin/env node

/**
 * Script de test pour vérifier les API admin
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Fonction pour tester une route
const testRoute = async (method, url, data = null, headers = {}) => {
  try {
    console.log(`\n🧪 Test: ${method.toUpperCase()} ${url}`);
    
    const config = {
      method,
      url: `${API_BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`✅ Succès: ${response.status} - ${response.data.message || 'OK'}`);
    
    if (response.data.data) {
      const dataType = Object.keys(response.data.data)[0];
      const count = Array.isArray(response.data.data[dataType]) 
        ? response.data.data[dataType].length 
        : 1;
      console.log(`📊 Données: ${count} ${dataType}`);
    }
    
    return response.data;
  } catch (error) {
    console.log(`❌ Erreur: ${error.response?.status || 'Network'} - ${error.response?.data?.message || error.message}`);
    return null;
  }
};

// Fonction principale de test
const runTests = async () => {
  console.log('🚀 Test des API Admin');
  console.log('====================');
  
  // Test 1: Dashboard stats
  await testRoute('GET', '/admin/dashboard/stats');
  
  // Test 2: Utilisateurs
  await testRoute('GET', '/admin/users?page=1&limit=5');
  
  // Test 3: Produits
  await testRoute('GET', '/admin/products?page=1&limit=5');
  
  // Test 4: Commandes
  await testRoute('GET', '/admin/orders?page=1&limit=5');
  
  // Test 5: Avis
  await testRoute('GET', '/admin/reviews?page=1&limit=5');
  
  // Test 6: Messages
  await testRoute('GET', '/admin/messages?page=1&limit=5');
  
  console.log('\n🏁 Tests terminés');
};

// Exécution
runTests().catch(console.error);
