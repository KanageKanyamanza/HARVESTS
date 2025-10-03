// Script de debug pour l'authentification admin
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';
const ADMIN_EMAIL = 'admin@harvests.com';
const ADMIN_PASSWORD = 'Admin@harvests123!';

async function debugAdminAuth() {
  try {
    console.log('🔐 Test de connexion admin...');
    
    // 1. Connexion admin
    const loginResponse = await axios.post(`${API_BASE_URL}/admin/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    console.log('✅ Connexion admin réussie');
    console.log('Token:', loginResponse.data.token);
    console.log('Admin data:', loginResponse.data.data.admin);
    
    const token = loginResponse.data.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // 2. Test des endpoints admin
    console.log('\n📊 Test des endpoints admin...');
    
    // Dashboard stats
    try {
      const statsResponse = await axios.get(`${API_BASE_URL}/admin/dashboard/stats`, { headers });
      console.log('✅ Dashboard Stats:', statsResponse.data.data.stats);
    } catch (error) {
      console.log('❌ Dashboard Stats Error:', error.response?.data?.message || error.message);
    }
    
    // Users
    try {
      const usersResponse = await axios.get(`${API_BASE_URL}/admin/users`, { headers });
      console.log('✅ Users:', usersResponse.data.data.users.length, 'utilisateurs');
      console.log('Users data:', usersResponse.data.data.users[0]);
    } catch (error) {
      console.log('❌ Users Error:', error.response?.data?.message || error.message);
    }
    
    // Reviews
    try {
      const reviewsResponse = await axios.get(`${API_BASE_URL}/admin/reviews`, { headers });
      console.log('✅ Reviews:', reviewsResponse.data.data.reviews.length, 'reviews');
      console.log('Reviews data:', reviewsResponse.data.data.reviews[0]);
    } catch (error) {
      console.log('❌ Reviews Error:', error.response?.data?.message || error.message);
    }
    
    // Products
    try {
      const productsResponse = await axios.get(`${API_BASE_URL}/admin/products`, { headers });
      console.log('✅ Products:', productsResponse.data.data.products.length, 'produits');
      console.log('Products data:', productsResponse.data.data.products[0]);
    } catch (error) {
      console.log('❌ Products Error:', error.response?.data?.message || error.message);
    }
    
    // Product stats
    try {
      const productStatsResponse = await axios.get(`${API_BASE_URL}/admin/dashboard/product-stats`, { headers });
      console.log('✅ Product Stats:', productStatsResponse.data.data);
    } catch (error) {
      console.log('❌ Product Stats Error:', error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.log('❌ Erreur générale:', error.response?.data?.message || error.message);
  }
}

debugAdminAuth();
