#!/usr/bin/env node

/**
 * Test simple des services centralisés
 */

const fs = require('fs');
const path = require('path');

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

const checkFile = (filePath, description) => {
  try {
    if (fs.existsSync(filePath)) {
      log(`✅ ${description}: ${filePath}`, 'green');
      return true;
    } else {
      log(`❌ ${description}: ${filePath} (fichier manquant)`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${description}: Erreur - ${error.message}`, 'red');
    return false;
  }
};

const checkFileContent = (filePath, searchText, description) => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(searchText)) {
        log(`✅ ${description}: Trouvé "${searchText}"`, 'green');
        return true;
      } else {
        log(`❌ ${description}: "${searchText}" non trouvé`, 'red');
        return false;
      }
    } else {
      log(`❌ ${description}: Fichier manquant`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${description}: Erreur - ${error.message}`, 'red');
    return false;
  }
};

const main = () => {
  log('🚀 Test Simple des Services Centralisés', 'bold');
  log('=' .repeat(50), 'bold');

  let passed = 0;
  let total = 0;

  // Test des fichiers backend
  log('\n🔧 Backend Services', 'blue');
  log('-' .repeat(30), 'blue');
  
  const backendFiles = [
    { path: 'backend/services/profileService.js', desc: 'ProfileService Backend' },
    { path: 'backend/services/profileImageService.js', desc: 'ProfileImageService Backend' },
    { path: 'backend/routes/profileRoutes.js', desc: 'ProfileRoutes Backend' }
  ];

  backendFiles.forEach(file => {
    total++;
    if (checkFile(file.path, file.desc)) passed++;
  });

  // Test des fichiers frontend
  log('\n🎨 Frontend Services', 'blue');
  log('-' .repeat(30), 'blue');
  
  const frontendFiles = [
    { path: 'frontend/src/services/profileService.js', desc: 'ProfileService Frontend' },
    { path: 'frontend/src/components/common/ProfileImageUpload.jsx', desc: 'ProfileImageUpload Component' },
    { path: 'frontend/src/hooks/useProfile.js', desc: 'useProfile Hook' }
  ];

  frontendFiles.forEach(file => {
    total++;
    if (checkFile(file.path, file.desc)) passed++;
  });

  // Test de l'intégration dans app.js
  log('\n🔗 Intégration', 'blue');
  log('-' .repeat(30), 'blue');
  
  total++;
  if (checkFileContent('backend/app.js', 'profileRoutes', 'Routes centralisées dans app.js')) passed++;

  total++;
  if (checkFileContent('frontend/src/services/index.js', 'profileService', 'Export dans services/index.js')) passed++;

  // Test de l'intégration dans ProfileRestaurateur
  log('\n📱 Intégration ProfileRestaurateur', 'blue');
  log('-' .repeat(30), 'blue');
  
  total++;
  if (checkFileContent('frontend/src/pages/dashboard/restaurateur/ProfileRestaurateur.jsx', 'useProfile', 'Hook useProfile intégré')) passed++;

  total++;
  if (checkFileContent('frontend/src/pages/dashboard/restaurateur/ProfileRestaurateur.jsx', 'ProfileImageUpload', 'Composant ProfileImageUpload intégré')) passed++;

  // Test de la documentation
  log('\n📚 Documentation', 'blue');
  log('-' .repeat(30), 'blue');
  
  const docFiles = [
    { path: 'docs/CENTRALIZED_SERVICES.md', desc: 'Documentation Architecture' },
    { path: 'docs/MIGRATION_GUIDE.md', desc: 'Guide de Migration' }
  ];

  docFiles.forEach(file => {
    total++;
    if (checkFile(file.path, file.desc)) passed++;
  });

  // Résumé
  log('\n🎯 Résumé', 'bold');
  log('=' .repeat(20), 'bold');
  log(`✅ Tests réussis: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
  log(`❌ Tests échoués: ${total - passed}/${total}`, total - passed > 0 ? 'red' : 'green');
  
  const percentage = Math.round((passed / total) * 100);
  log(`📊 Pourcentage de réussite: ${percentage}%`, percentage >= 80 ? 'green' : percentage >= 60 ? 'yellow' : 'red');

  if (passed === total) {
    log('\n🎉 Tous les tests sont passés !', 'green');
    log('Les services centralisés sont correctement configurés.', 'green');
  } else if (percentage >= 80) {
    log('\n⚠️  La plupart des tests sont passés.', 'yellow');
    log('Vérifiez les tests échoués ci-dessus.', 'yellow');
  } else {
    log('\n❌ Plusieurs tests ont échoué.', 'red');
    log('Vérifiez la configuration des services centralisés.', 'red');
  }

  log('\n📋 Prochaines étapes:', 'blue');
  log('1. Démarrer le serveur backend: cd backend && npm start', 'yellow');
  log('2. Démarrer le frontend: cd frontend && npm run dev', 'yellow');
  log('3. Tester l\'upload d\'images dans ProfileRestaurateur', 'yellow');
  log('4. Migrer les autres profils vers les services centralisés', 'yellow');
};

main();
