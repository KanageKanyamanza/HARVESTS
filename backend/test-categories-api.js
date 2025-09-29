const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api/v1';

async function testCategoriesAPI() {
  try {
    console.log('🧪 Test de l\'API des catégories...\n');

    // Test 1: Obtenir les catégories
    console.log('1. Test GET /products/categories');
    try {
      const response = await axios.get(`${BASE_URL}/products/categories`);
      console.log('✅ Succès:', response.data);
    } catch (error) {
      console.log('❌ Erreur:', error.response?.data || error.message);
    }

    // Test 2: Obtenir les produits
    console.log('\n2. Test GET /products');
    try {
      const response = await axios.get(`${BASE_URL}/products?limit=5`);
      console.log('✅ Succès:', {
        status: response.data.status,
        results: response.data.results,
        total: response.data.total
      });
    } catch (error) {
      console.log('❌ Erreur:', error.response?.data || error.message);
    }

    // Test 3: Obtenir les produits par catégorie (si des catégories existent)
    console.log('\n3. Test GET /products/category/vegetables');
    try {
      const response = await axios.get(`${BASE_URL}/products/category/vegetables?limit=3`);
      console.log('✅ Succès:', {
        status: response.data.status,
        results: response.data.results,
        total: response.data.total
      });
    } catch (error) {
      console.log('❌ Erreur:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testCategoriesAPI();
