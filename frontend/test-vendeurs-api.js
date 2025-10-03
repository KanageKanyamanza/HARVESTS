// Script de test pour vérifier les APIs des vendeurs
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

async function testAPIs() {
  console.log('🔍 Test des APIs Vendeurs...\n');

  try {
    // Test API Producteurs
    console.log('1. Test API Producteurs...');
    const producersResponse = await axios.get(`${API_BASE_URL}/producers?limit=5`);
    console.log('✅ Producteurs:', producersResponse.data);
    console.log('   - Status:', producersResponse.data.status);
    console.log('   - Nombre:', producersResponse.data.data?.producers?.length || 0);
    
    if (producersResponse.data.data?.producers?.length > 0) {
      const producer = producersResponse.data.data.producers[0];
      console.log('   - Premier producteur:', {
        id: producer._id,
        name: producer.farmName || `${producer.firstName} ${producer.lastName}`,
        hasShopInfo: !!producer.shopInfo,
        shopBanner: producer.shopInfo?.shopBanner,
        shopLogo: producer.shopInfo?.shopLogo
      });
    }
  } catch (error) {
    console.error('❌ Erreur API Producteurs:', error.response?.data || error.message);
  }

  console.log('\n');

  try {
    // Test API Transformateurs
    console.log('2. Test API Transformateurs...');
    const transformersResponse = await axios.get(`${API_BASE_URL}/transformers?limit=5`);
    console.log('✅ Transformateurs:', transformersResponse.data);
    console.log('   - Status:', transformersResponse.data.status);
    console.log('   - Nombre:', transformersResponse.data.data?.transformers?.length || 0);
    
    if (transformersResponse.data.data?.transformers?.length > 0) {
      const transformer = transformersResponse.data.data.transformers[0];
      console.log('   - Premier transformateur:', {
        id: transformer._id,
        name: transformer.companyName || `${transformer.firstName} ${transformer.lastName}`,
        hasShopInfo: !!transformer.shopInfo,
        shopBanner: transformer.shopInfo?.shopBanner,
        shopLogo: transformer.shopInfo?.shopLogo,
        isActive: transformer.isActive,
        isApproved: transformer.isApproved,
        isEmailVerified: transformer.isEmailVerified
      });
    }
  } catch (error) {
    console.error('❌ Erreur API Transformateurs:', error.response?.data || error.message);
  }

  console.log('\n');

  try {
    // Test API Transformateurs sans filtres stricts
    console.log('3. Test API Transformateurs (tous)...');
    const allTransformersResponse = await axios.get(`${API_BASE_URL}/transformers?limit=50`);
    console.log('✅ Tous Transformateurs:', allTransformersResponse.data);
    console.log('   - Status:', allTransformersResponse.data.status);
    console.log('   - Nombre total:', allTransformersResponse.data.data?.transformers?.length || 0);
  } catch (error) {
    console.error('❌ Erreur API Transformateurs (tous):', error.response?.data || error.message);
  }

  console.log('\n🎯 Test terminé!');
}

// Exécuter le test
testAPIs().catch(console.error);
