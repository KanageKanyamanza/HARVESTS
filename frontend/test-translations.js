// Script de test pour vérifier les traductions
import i18n from './src/utils/i18n.js';

console.log('🧪 Test des traductions avec namespaces...\n');

// Test des namespaces
const namespaces = ['common', 'navigation', 'public', 'admin', 'consumer', 'producer', 'auth'];

namespaces.forEach(ns => {
  console.log(`\n📁 Namespace: ${ns}`);
  
  // Test de quelques clés communes
  const testKeys = [
    'welcome',
    'loading',
    'error',
    'success',
    'title',
    'subtitle'
  ];
  
  testKeys.forEach(key => {
    const translation = i18n.t(`${ns}:${key}`);
    if (translation !== `${ns}:${key}`) {
      console.log(`  ✅ ${key}: ${translation}`);
    } else {
      console.log(`  ❌ ${key}: Non trouvé`);
    }
  });
});

// Test spécifique pour les pages publiques
console.log('\n🌐 Test des pages publiques:');
console.log(`  Products title: ${i18n.t('public:products.title')}`);
console.log(`  Categories title: ${i18n.t('public:categories.title')}`);
console.log(`  Search placeholder: ${i18n.t('public:products.searchPlaceholder')}`);

// Test spécifique pour les pages admin
console.log('\n👑 Test des pages admin:');
console.log(`  Admin dashboard: ${i18n.t('admin:dashboard.title')}`);
console.log(`  User management: ${i18n.t('admin:users.title')}`);

// Test spécifique pour les pages consumer
console.log('\n🛒 Test des pages consumer:');
console.log(`  Consumer dashboard: ${i18n.t('consumer:dashboard.title')}`);
console.log(`  My orders: ${i18n.t('consumer:orders.title')}`);

// Test spécifique pour les pages producer
console.log('\n🌾 Test des pages producer:');
console.log(`  Producer dashboard: ${i18n.t('producer:dashboard.title')}`);
console.log(`  My products: ${i18n.t('producer:products.title')}`);

console.log('\n✅ Test terminé !');
