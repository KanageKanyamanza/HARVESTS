const dotenv = require('dotenv');
const mongoose = require('mongoose');

/**
 * Gestion des exceptions non capturées
 * Arrête le serveur en cas d'erreur critique
 */
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Arrêt du serveur...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Chargement des variables d'environnement
dotenv.config();

const app = require('./app');

// Détermination de l'URL de connexion MongoDB selon l'environnement
let DB;
if (process.env.DATABASE) {
  // Production avec mot de passe
  DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
} else if (process.env.DATABASE_URL) {
  // Production directe
  DB = process.env.DATABASE_URL;
} else if (process.env.DATABASE_LOCAL) {
  // Développement local
  DB = process.env.DATABASE_LOCAL;
} else {
  // Fallback par défaut
  DB = 'mongodb://localhost:27017/harvests';
}

// Connexion à la base de données MongoDB
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4 // Utiliser IPv4, ignorer IPv6
  })
  .then(async () => {
    console.log('✅ Connexion à la base de données réussie!');
    
    // Vérifier la configuration email (non-bloquant)
    try {
      const hasSendGrid = !!process.env.SENDGRID_API_KEY;
      const hasMailgun = !!(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) || 
                         !!(process.env.MAILGUN_SMTP_USER && process.env.MAILGUN_SMTP_PASSWORD);
      const hasGmail = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
      const hasSMTP = !!(process.env.EMAIL_HOST && process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD);
      
      const isProduction = process.env.NODE_ENV === 'production';
      
      if (isProduction) {
        if (hasSendGrid) {
          console.log('📧 Configuration email PRODUCTION: SendGrid API ✅ (Recommandé pour Render)');
        } else {
          console.warn('⚠️  Configuration email PRODUCTION manquante!');
          console.warn('   En production, configurez SENDGRID_API_KEY');
          console.warn('   📖 Voir: backend/docs/EMAIL_CONFIGURATION_RENDER.md');
        }
      } else {
        if (hasGmail) {
          console.log('📧 Configuration email DÉVELOPPEMENT: Gmail (Nodemailer) ✅');
        } else if (hasSendGrid) {
          console.log('📧 Configuration email DÉVELOPPEMENT: SendGrid détectée (sera utilisé en production)');
        } else {
          console.warn('⚠️  Configuration email DÉVELOPPEMENT manquante!');
          console.warn('   En développement, configurez GMAIL_USER + GMAIL_APP_PASSWORD');
        }
      }
      
      if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_PUBLIC_KEY) {
        console.log('📧 EmailJS (fallback optionnel) configuré');
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors de la vérification de la configuration email:', error.message);
    }
    
    // Créer automatiquement le premier admin si nécessaire (production et développement)
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

  })
  .catch((err) => {
    console.error('❌ Erreur de connexion à la base de données:', err);
    process.exit(1);
  });

// Configuration du port d'écoute
const port = process.env.PORT || 8000;

// Démarrage du serveur Express
const server = app.listen(port, () => {
  console.log(`🚀 Serveur Harvests démarré sur le port ${port}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV}`);
  console.log(`📅 Démarré le: ${new Date().toLocaleString('fr-FR')}`);
});

/**
 * Gestion des rejets de promesses non gérées
 * Arrête le serveur gracieusement en cas d'erreur asynchrone non gérée
 */
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Arrêt du serveur...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

/**
 * Gestion gracieuse de l'arrêt du serveur
 * Permet de fermer proprement les connexions avant l'arrêt
 */
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM reçu. Arrêt gracieux du serveur...');
  server.close(() => {
    console.log('💥 Processus terminé!');
  });
});
