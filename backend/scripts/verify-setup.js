#!/usr/bin/env node

/**
 * Script de vérification de l'installation Harvests Backend
 * Vérifie que tous les composants essentiels sont présents et fonctionnels
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de l\'installation Harvests Backend...\n');

// Couleurs pour l'affichage
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`)
};

let errors = 0;
let warnings = 0;

// Vérification des fichiers essentiels
const essentialFiles = [
  'app.js',
  'server.js',
  'package.json',
  'env.example',
  'README.md'
];

console.log('📁 Vérification des fichiers essentiels:');
essentialFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, '..', file))) {
    log.success(`${file} présent`);
  } else {
    log.error(`${file} manquant`);
    errors++;
  }
});

// Vérification des dossiers
const essentialDirs = [
  'models',
  'controllers',
  'routes',
  'middleware',
  'utils',
  'config',
  'docs'
];

console.log('\n📂 Vérification des dossiers:');
essentialDirs.forEach(dir => {
  if (fs.existsSync(path.join(__dirname, '..', dir))) {
    log.success(`Dossier ${dir}/ présent`);
  } else {
    log.error(`Dossier ${dir}/ manquant`);
    errors++;
  }
});

// Vérification des modèles utilisateurs
const userModels = [
  'User.js',
  'Producer.js',
  'Transformer.js',
  'Consumer.js',
  'Restaurateur.js',
  'Exporter.js',
  'Transporter.js'
];

console.log('\n👥 Vérification des modèles utilisateurs:');
userModels.forEach(model => {
  if (fs.existsSync(path.join(__dirname, '..', 'models', model))) {
    log.success(`Modèle ${model} présent`);
  } else {
    log.error(`Modèle ${model} manquant`);
    errors++;
  }
});

// Vérification des controllers
const controllers = [
  'authController.js',
  'userController.js',
  'producerController.js',
  'transformerController.js',
  'consumerController.js',
  'restaurateurController.js',
  'exporterController.js',
  'transporterController.js'
];

console.log('\n🎮 Vérification des controllers:');
controllers.forEach(controller => {
  if (fs.existsSync(path.join(__dirname, '..', 'controllers', controller))) {
    log.success(`Controller ${controller} présent`);
  } else {
    log.error(`Controller ${controller} manquant`);
    errors++;
  }
});

// Vérification des routes
const routes = [
  'authRoutes.js',
  'userRoutes.js',
  'producerRoutes.js',
  'transformerRoutes.js',
  'consumerRoutes.js',
  'restaurateurRoutes.js',
  'exporterRoutes.js',
  'transporterRoutes.js'
];

console.log('\n🛣️  Vérification des routes:');
routes.forEach(route => {
  if (fs.existsSync(path.join(__dirname, '..', 'routes', route))) {
    log.success(`Route ${route} présente`);
  } else {
    log.error(`Route ${route} manquante`);
    errors++;
  }
});

// Vérification des middlewares
const middlewares = [
  'security.js',
  'errorHandler.js'
];

console.log('\n🛡️  Vérification des middlewares:');
middlewares.forEach(middleware => {
  if (fs.existsSync(path.join(__dirname, '..', 'middleware', middleware))) {
    log.success(`Middleware ${middleware} présent`);
  } else {
    log.error(`Middleware ${middleware} manquant`);
    errors++;
  }
});

// Vérification des utilitaires
const utils = [
  'appError.js',
  'catchAsync.js',
  'email.js'
];

console.log('\n🔧 Vérification des utilitaires:');
utils.forEach(util => {
  if (fs.existsSync(path.join(__dirname, '..', 'utils', util))) {
    log.success(`Utilitaire ${util} présent`);
  } else {
    log.error(`Utilitaire ${util} manquant`);
    errors++;
  }
});

// Vérification du package.json
console.log('\n📦 Vérification du package.json:');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  
  if (packageJson.name === 'harvests-backend') {
    log.success('Nom du projet correct');
  } else {
    log.warning('Nom du projet différent de "harvests-backend"');
    warnings++;
  }

  const requiredDeps = [
    'express',
    'mongoose',
    'bcryptjs',
    'jsonwebtoken',
    'dotenv',
    'cors',
    'helmet',
    'express-rate-limit'
  ];

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      log.success(`Dépendance ${dep} présente`);
    } else {
      log.error(`Dépendance ${dep} manquante`);
      errors++;
    }
  });

} catch (error) {
  log.error('Impossible de lire package.json');
  errors++;
}

// Vérification de la structure des types d'utilisateurs
console.log('\n🏗️  Vérification de l\'architecture:');

try {
  // Vérifier que les modèles utilisent bien les discriminators
  const userModel = fs.readFileSync(path.join(__dirname, '..', 'models', 'User.js'), 'utf8');
  if (userModel.includes('discriminatorKey')) {
    log.success('Architecture discriminator correctement configurée');
  } else {
    log.warning('Architecture discriminator non détectée');
    warnings++;
  }

  // Vérifier la sécurité dans authController et User model
  const authController = fs.readFileSync(path.join(__dirname, '..', 'controllers', 'authController.js'), 'utf8');
  const userModelContent = fs.readFileSync(path.join(__dirname, '..', 'models', 'User.js'), 'utf8');
  
  const hasJWT = authController.includes('jwt');
  const hasBcrypt = userModelContent.includes('bcrypt');
  
  if (hasJWT && hasBcrypt) {
    log.success('Sécurité JWT et bcrypt configurée');
  } else {
    log.error('Configuration de sécurité incomplète');
    errors++;
  }

} catch (error) {
  log.error('Erreur lors de la vérification de l\'architecture');
  errors++;
}

// Résumé final
console.log('\n' + '='.repeat(50));
console.log('📊 RÉSUMÉ DE LA VÉRIFICATION');
console.log('='.repeat(50));

if (errors === 0 && warnings === 0) {
  log.success('🎉 Installation parfaite ! Tous les composants sont présents.');
  console.log('\n🚀 Prochaines étapes:');
  console.log('1. Copier env.example vers .env');
  console.log('2. Configurer les variables d\'environnement');
  console.log('3. Installer les dépendances: npm install');
  console.log('4. Démarrer le serveur: npm run dev');
} else {
  if (errors > 0) {
    log.error(`${errors} erreur(s) critique(s) détectée(s)`);
  }
  if (warnings > 0) {
    log.warning(`${warnings} avertissement(s) détecté(s)`);
  }
  
  console.log('\n🔧 Actions recommandées:');
  if (errors > 0) {
    console.log('- Corriger les erreurs critiques avant de continuer');
  }
  if (warnings > 0) {
    console.log('- Examiner les avertissements pour optimiser l\'installation');
  }
}

console.log('\n📚 Documentation disponible dans:');
console.log('- README.md (guide d\'installation)');
console.log('- docs/ARCHITECTURE.md (architecture détaillée)');

console.log(`\n${colors.blue}Harvests Backend v1.0.0 - L'Amazon des produits agricoles africains${colors.reset}`);

process.exit(errors > 0 ? 1 : 0);
