require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('🔧 Configuration Cloudinary:');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || '❌ NON DÉFINI');
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✅ DÉFINI' : '❌ NON DÉFINI');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ DÉFINI' : '❌ NON DÉFINI');

// Test de connexion
async function testConnection() {
  try {
    console.log('\n🧪 Test de connexion à Cloudinary...');
    
    // Test simple : obtenir les informations du compte
    const result = await cloudinary.api.ping();
    console.log('✅ Connexion réussie:', result);
    
    // Test d'upload d'une image factice
    console.log('\n📤 Test d\'upload...');
    const uploadResult = await cloudinary.uploader.upload(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      {
        folder: 'harvests/test',
        public_id: 'test-connection'
      }
    );
    
    console.log('✅ Upload test réussi:');
    console.log('URL:', uploadResult.secure_url);
    console.log('Public ID:', uploadResult.public_id);
    
    // Supprimer l'image de test
    await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log('✅ Image de test supprimée');
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    
    if (error.message.includes('Invalid cloud name')) {
      console.log('💡 Vérifiez CLOUDINARY_CLOUD_NAME dans votre fichier .env');
    } else if (error.message.includes('Invalid API credentials')) {
      console.log('💡 Vérifiez CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans votre fichier .env');
    }
  }
}

testConnection();
