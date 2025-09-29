#!/usr/bin/env node

/**
 * Test de connexion admin
 */

const axios = require('axios');

const testAdminLogin = async () => {
  try {
    console.log('🧪 Test de connexion admin...\n');

    const response = await axios.post('http://localhost:8000/api/v1/admin/auth/login', {
      email: 'admin@harvests.com',
      password: 'Admin@harvests123!'
    });

    console.log('✅ Connexion admin réussie!');
    console.log('📊 Données reçues:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Erreur de connexion admin:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
};

testAdminLogin();
