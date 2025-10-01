#!/usr/bin/env node

/**
 * Script de test pour identifier les problèmes de démarrage du serveur
 */

console.log('🔍 Test de démarrage du serveur...');

try {
  console.log('1. Test des imports...');
  
  // Test des imports principaux
  const mongoose = require('mongoose');
  console.log('✅ mongoose importé');
  
  const dotenv = require('dotenv');
  console.log('✅ dotenv importé');
  
  // Configuration des variables d'environnement
  dotenv.config();
  console.log('✅ Variables d\'environnement chargées');
  
  console.log('2. Test de l\'application...');
  const app = require('./app');
  console.log('✅ Application chargée');
  
  console.log('3. Test de la base de données...');
  const DB = process.env.DATABASE ? 
    process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD) :
    process.env.DATABASE_LOCAL || 'mongodb://localhost:27017/harvests';
  
  console.log('URL de la base de données:', DB);
  
  console.log('4. Test de connexion à MongoDB...');
  mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('✅ Connexion à la base de données réussie!');
    
    console.log('5. Test du serveur...');
    const port = process.env.PORT || 8000;
    const server = app.listen(port, () => {
      console.log(`✅ Serveur démarré sur le port ${port}`);
      console.log('🎉 Tous les tests sont passés !');
      
      // Arrêter le serveur après le test
      setTimeout(() => {
        server.close();
        mongoose.disconnect();
        process.exit(0);
      }, 1000);
    });
    
  }).catch((err) => {
    console.error('❌ Erreur de connexion à la base de données:', err);
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ Erreur lors du test:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
}
