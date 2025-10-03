// Test spécifique pour la route analytics
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';
const ADMIN_EMAIL = 'admin@harvests.com';
const ADMIN_PASSWORD = 'Admin@harvests123!';

async function testAnalytics() {
  try {
    console.log('🔐 Connexion admin...');
    
    // Connexion admin
    const loginResponse = await axios.post(`${API_BASE_URL}/admin/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const token = loginResponse.data.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('✅ Connexion réussie');
    
    // Test de la route analytics
    console.log('\n📊 Test de la route analytics...');
    const analyticsResponse = await axios.get(`${API_BASE_URL}/admin/analytics?timeRange=30d`, { headers });
    
    console.log('✅ Analytics récupérées:');
    console.log('Structure:', Object.keys(analyticsResponse.data.data.analytics));
    console.log('Overview:', analyticsResponse.data.data.analytics.overview);
    console.log('Charts keys:', Object.keys(analyticsResponse.data.data.analytics.charts));
    console.log('Category Distribution:', analyticsResponse.data.data.analytics.charts.categoryDistribution);
    
  } catch (error) {
    console.log('❌ Erreur:', error.response?.data?.message || error.message);
  }
}

testAnalytics();
