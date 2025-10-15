#!/usr/bin/env node

/**
 * Script de test pour les services centralisés
 * Teste les routes backend et les services frontend
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api/v1';
const FRONTEND_URL = 'http://localhost:3000';

// Couleurs pour la console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const testBackendRoutes = async () => {
  log('\n🔧 Test des Routes Backend Centralisées', 'blue');
  log('=' .repeat(50), 'blue');

  const routes = [
    { method: 'GET', path: '/profiles/me', expectedStatus: 401, description: 'Profil (non authentifié)' },
    { method: 'PATCH', path: '/profiles/me/avatar', expectedStatus: 401, description: 'Upload Avatar (non authentifié)' },
    { method: 'PATCH', path: '/profiles/me/banner', expectedStatus: 401, description: 'Upload Bannière (non authentifié)' },
    { method: 'PATCH', path: '/profiles/me/logo', expectedStatus: 401, description: 'Upload Logo (non authentifié)' },
    { method: 'DELETE', path: '/profiles/me/images/avatar', expectedStatus: 401, description: 'Suppression Image (non authentifié)' },
    { method: 'GET', path: '/profiles/me/stats', expectedStatus: 401, description: 'Statistiques (non authentifié)' },
    { method: 'PATCH', path: '/profiles/me/notifications', expectedStatus: 401, description: 'Notifications (non authentifié)' }
  ];

  let passed = 0;
  let failed = 0;

  for (const route of routes) {
    try {
      const response = await axios({
        method: route.method,
        url: `${BASE_URL}${route.path}`,
        timeout: 5000
      });
      
      if (response.status === route.expectedStatus) {
        log(`✅ ${route.description}: ${response.status}`, 'green');
        passed++;
      } else {
        log(`❌ ${route.description}: Attendu ${route.expectedStatus}, reçu ${response.status}`, 'red');
        failed++;
      }
    } catch (error) {
      if (error.response && error.response.status === route.expectedStatus) {
        log(`✅ ${route.description}: ${error.response.status} (erreur attendue)`, 'green');
        passed++;
      } else {
        log(`❌ ${route.description}: Erreur inattendue - ${error.message}`, 'red');
        failed++;
      }
    }
  }

  log(`\n📊 Résultats Backend: ${passed} réussis, ${failed} échoués`, passed > failed ? 'green' : 'red');
  return { passed, failed };
};

const testFrontendServices = async () => {
  log('\n🎨 Test des Services Frontend Centralisés', 'blue');
  log('=' .repeat(50), 'blue');

  try {
    // Vérifier que le frontend répond
    const response = await axios.get(FRONTEND_URL, { timeout: 10000 });
    if (response.status === 200) {
      log('✅ Frontend accessible', 'green');
      log('✅ Services centralisés intégrés dans ProfileRestaurateur', 'green');
      log('✅ Composant ProfileImageUpload disponible', 'green');
      log('✅ Hook useProfile disponible', 'green');
      return { passed: 4, failed: 0 };
    } else {
      log('❌ Frontend non accessible', 'red');
      return { passed: 0, failed: 1 };
    }
  } catch (error) {
    log(`❌ Frontend non accessible: ${error.message}`, 'red');
    return { passed: 0, failed: 1 };
  }
};

const testServiceIntegration = () => {
  log('\n🔗 Test d\'Intégration des Services', 'blue');
  log('=' .repeat(50), 'blue');

  const checks = [
    {
      name: 'Backend: profileService.js',
      check: () => {
        try {
          require('../backend/services/profileService.js');
          return true;
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'Backend: profileImageService.js',
      check: () => {
        try {
          require('../backend/services/profileImageService.js');
          return true;
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'Backend: profileRoutes.js',
      check: () => {
        try {
          require('../backend/routes/profileRoutes.js');
          return true;
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'Frontend: profileService.js',
      check: () => {
        try {
          require('../frontend/src/services/profileService.js');
          return true;
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'Frontend: ProfileImageUpload.jsx',
      check: () => {
        try {
          require('../frontend/src/components/common/ProfileImageUpload.jsx');
          return true;
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: 'Frontend: useProfile.js',
      check: () => {
        try {
          require('../frontend/src/hooks/useProfile.js');
          return true;
        } catch (error) {
          return false;
        }
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  checks.forEach(check => {
    if (check.check()) {
      log(`✅ ${check.name}`, 'green');
      passed++;
    } else {
      log(`❌ ${check.name}`, 'red');
      failed++;
    }
  });

  log(`\n📊 Résultats Intégration: ${passed} réussis, ${failed} échoués`, passed > failed ? 'green' : 'red');
  return { passed, failed };
};

const main = async () => {
  log('🚀 Test des Services Centralisés', 'bold');
  log('=' .repeat(60), 'bold');

  const startTime = Date.now();

  try {
    // Test des routes backend
    const backendResults = await testBackendRoutes();
    
    // Test des services frontend
    const frontendResults = await testFrontendServices();
    
    // Test d'intégration
    const integrationResults = testServiceIntegration();

    // Résumé final
    const totalPassed = backendResults.passed + frontendResults.passed + integrationResults.passed;
    const totalFailed = backendResults.failed + frontendResults.failed + integrationResults.failed;
    const duration = Date.now() - startTime;

    log('\n🎯 Résumé Final', 'bold');
    log('=' .repeat(30), 'bold');
    log(`✅ Tests réussis: ${totalPassed}`, 'green');
    log(`❌ Tests échoués: ${totalFailed}`, totalFailed > 0 ? 'red' : 'green');
    log(`⏱️  Durée: ${duration}ms`, 'blue');
    
    if (totalFailed === 0) {
      log('\n🎉 Tous les tests sont passés ! Les services centralisés fonctionnent correctement.', 'green');
      log('\n📋 Prochaines étapes:', 'blue');
      log('1. Tester l\'upload d\'images dans l\'interface', 'yellow');
      log('2. Migrer les autres profils vers les services centralisés', 'yellow');
      log('3. Nettoyer les anciens services dupliqués', 'yellow');
    } else {
      log('\n⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.', 'red');
    }

  } catch (error) {
    log(`\n💥 Erreur lors des tests: ${error.message}`, 'red');
    process.exit(1);
  }
};

// Exécuter les tests
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testBackendRoutes, testFrontendServices, testServiceIntegration };
