#!/usr/bin/env node

/**
 * Script de test pour vérifier que tous les composants de profil universels fonctionnent
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Test des composants de profil universels...\n');

// Vérifier l'existence des fichiers
const filesToCheck = [
  'frontend/src/components/common/UniversalProfile.jsx',
  'frontend/src/components/common/ProfileConfigs.js',
  'frontend/src/components/common/ProfileTabContent.jsx',
  'frontend/src/pages/dashboard/producer/ProfileProducerUniversal.jsx',
  'frontend/src/pages/dashboard/transformer/ProfileTransformerUniversal.jsx',
  'frontend/src/pages/dashboard/consumer/ProfileConsumerUniversal.jsx',
  'frontend/src/pages/dashboard/restaurateur/ProfileRestaurateurUniversal.jsx'
];

let allFilesExist = true;

filesToCheck.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - FICHIER MANQUANT`);
    allFilesExist = false;
  }
});

console.log('\n📋 Vérification des imports dans App.jsx...');

// Vérifier les imports dans App.jsx
const appJsPath = path.join(process.cwd(), 'frontend/src/App.jsx');
if (fs.existsSync(appJsPath)) {
  const appContent = fs.readFileSync(appJsPath, 'utf8');
  
  const importsToCheck = [
    'ProfileProducerUniversal',
    'ProfileTransformerUniversal', 
    'ProfileConsumerUniversal',
    'ProfileRestaurateurUniversal'
  ];
  
  importsToCheck.forEach(importName => {
    if (appContent.includes(importName)) {
      console.log(`✅ Import ${importName} trouvé dans App.jsx`);
    } else {
      console.log(`❌ Import ${importName} manquant dans App.jsx`);
      allFilesExist = false;
    }
  });
} else {
  console.log('❌ App.jsx non trouvé');
  allFilesExist = false;
}

console.log('\n🔍 Vérification de la syntaxe des composants...');

// Vérifier la syntaxe des composants principaux
const componentsToCheck = [
  'frontend/src/components/common/UniversalProfile.jsx',
  'frontend/src/components/common/ProfileConfigs.js',
  'frontend/src/components/common/ProfileTabContent.jsx'
];

componentsToCheck.forEach(component => {
  const componentPath = path.join(process.cwd(), component);
  if (fs.existsSync(componentPath)) {
    try {
      const content = fs.readFileSync(componentPath, 'utf8');
      
      // Vérifications basiques
      if (content.includes('export default') || content.includes('module.exports')) {
        console.log(`✅ ${component} - Export trouvé`);
      } else {
        console.log(`⚠️  ${component} - Pas d'export trouvé`);
      }
      
      if (content.includes('import React')) {
        console.log(`✅ ${component} - Import React trouvé`);
      } else {
        console.log(`⚠️  ${component} - Import React manquant`);
      }
      
    } catch (error) {
      console.log(`❌ ${component} - Erreur de lecture: ${error.message}`);
      allFilesExist = false;
    }
  }
});

console.log('\n📊 Résumé:');

if (allFilesExist) {
  console.log('🎉 Tous les composants de profil universels sont prêts !');
  console.log('\n📝 Prochaines étapes:');
  console.log('1. Tester les composants dans le navigateur');
  console.log('2. Vérifier que les routes fonctionnent');
  console.log('3. Tester l\'upload d\'images');
  console.log('4. Valider la sauvegarde des données');
  console.log('\n🌐 URLs de test:');
  console.log('- http://localhost:5173/producer/profile');
  console.log('- http://localhost:5173/transformer/profile');
  console.log('- http://localhost:5173/consumer/profile');
  console.log('- http://localhost:5173/restaurateur/profile');
} else {
  console.log('❌ Certains composants sont manquants ou ont des erreurs');
  console.log('Vérifiez les erreurs ci-dessus et corrigez-les');
}

console.log('\n✨ Test terminé !');
