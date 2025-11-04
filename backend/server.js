const dotenv = require('dotenv');
const mongoose = require('mongoose');

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

// Connexion à MongoDB
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
      
      if (hasSendGrid) {
        console.log('📧 Configuration email: SendGrid détectée ✅ (Recommandé pour Render)');
      } else if (hasMailgun) {
        console.log('📧 Configuration email: Mailgun détectée ✅');
      } else if (hasGmail) {
        console.log('📧 Configuration email: Gmail détectée ⚠️  (peut avoir des timeouts sur Render)');
        console.log('   💡 Recommandation: Utilisez SendGrid ou Mailgun pour plus de fiabilité');
      } else if (hasSMTP) {
        console.log(`📧 Configuration email: SMTP détectée (${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT || 587})`);
      } else {
        console.warn('⚠️  Configuration email manquante!');
        console.warn('   Les emails ne pourront pas être envoyés.');
        console.warn('');
        console.warn('   💡 Solutions recommandées (par ordre):');
        console.warn('      1. SendGrid (100 emails/jour GRATUIT): SENDGRID_API_KEY');
        console.warn('      2. Mailgun (5000 emails/mois GRATUIT): MAILGUN_DOMAIN + MAILGUN_SMTP_PASSWORD');
        console.warn('      3. Gmail (500 emails/jour): GMAIL_USER + GMAIL_APP_PASSWORD');
        console.warn('      4. SMTP générique: EMAIL_HOST + EMAIL_USERNAME + EMAIL_PASSWORD');
        console.warn('');
        console.warn('   📖 Voir: backend/docs/EMAIL_CONFIGURATION_RENDER.md');
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
