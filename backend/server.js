const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Gestion des exceptions non capturées
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Arrêt du serveur...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Configuration des variables d'environnement
dotenv.config();

const app = require('./app');

// Configuration de la base de données
const DB = process.env.DATABASE ? 
  process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD) :
  process.env.DATABASE_LOCAL || 'mongodb://localhost:27017/harvests';

// Connexion à MongoDB
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('✅ Connexion à la base de données réussie!');
    
    // Créer automatiquement le premier admin en production si nécessaire
    if (process.env.NODE_ENV === 'production') {
      try {
        const { exec } = require('child_process');
        const path = require('path');
        
        // Exécuter le script de création d'admin en mode automatique
        exec(`node ${path.join(__dirname, 'scripts', 'quick-admin-setup.js')} --auto-create`, (error, stdout, stderr) => {
          if (error) {
            console.log('⚠️ Erreur lors de la vérification/création de l\'admin:', error.message);
          } else {
            console.log(stdout);
          }
        });
      } catch (error) {
        console.log('⚠️ Impossible de vérifier/créer l\'admin automatiquement:', error.message);
      }
    }
  })
  .catch((err) => {
    console.error('❌ Erreur de connexion à la base de données:', err);
    process.exit(1);
  });

// Configuration du port
const port = process.env.PORT || 8000;

// Démarrage du serveur
const server = app.listen(port, () => {
  console.log(`🚀 Serveur Harvests démarré sur le port ${port}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV}`);
  console.log(`📅 Démarré le: ${new Date().toLocaleString('fr-FR')}`);
});

// Gestion des rejets de promesses non gérées
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Arrêt du serveur...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Gestion gracieuse de l'arrêt du serveur
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM reçu. Arrêt gracieux du serveur...');
  server.close(() => {
    console.log('💥 Processus terminé!');
  });
});
