// Configuration globale pour les tests Jest

// Configuration de l'environnement de test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRE = '7d';

// Utiliser une variable d'environnement pour la connexion MongoDB (comme dans database.js)
// Pour les tests unitaires, on utilise des mocks donc pas besoin de vraie connexion
// Mais on définit la variable au cas où des tests d'intégration en auraient besoin
// Priorité à DATABASE_LOCAL comme dans l'environnement de développement
if (!process.env.DATABASE_LOCAL && !process.env.DATABASE) {
  process.env.DATABASE_LOCAL = process.env.MONGODB_URI_TEST || process.env.MONGODB_URI || 'mongodb://localhost:27017/harvests-test';
}
if (!process.env.DATABASE_PASSWORD) {
  process.env.DATABASE_PASSWORD = '';
}

// Configuration Email pour les tests (éviter les erreurs de connexion)
// Utilise les vraies variables d'environnement si disponibles, sinon utilise des valeurs par défaut
// SendGrid est utilisé par défaut pour les tests

// Email From (obligatoire)
if (!process.env.EMAIL_FROM) {
  process.env.EMAIL_FROM = 'noreply@harvests.sn';
}

// SendGrid - utilise les vraies valeurs si disponibles, sinon utilise une valeur de test
// En mode test, SendGrid sera utilisé en priorité si SENDGRID_API_KEY est défini
if (!process.env.SENDGRID_API_KEY) {
  // Pour les tests, on définit une clé de test par défaut
  // Si vous avez une vraie clé SendGrid, elle sera utilisée automatiquement
  // Note: En production, vous devez définir une vraie clé SendGrid dans votre .env
  process.env.SENDGRID_API_KEY = 'SG.test-key-for-tests';
}

// Gmail - utilise les vraies valeurs si disponibles (fallback si SendGrid n'est pas configuré)
if (!process.env.GMAIL_USER) {
  // Ne pas définir de valeur par défaut pour Gmail si SendGrid est utilisé
}
if (!process.env.GMAIL_APP_PASSWORD) {
  // Ne pas définir de valeur par défaut pour Gmail si SendGrid est utilisé
}
// EmailJS - utilise les vraies valeurs si disponibles (optionnel)
if (!process.env.EMAILJS_SERVICE_ID) {
  // Ne pas définir de valeur par défaut, EmailJS est optionnel
}
if (!process.env.EMAILJS_TEMPLATE_ID) {
  // Ne pas définir de valeur par défaut, EmailJS est optionnel
}
if (!process.env.EMAILJS_PUBLIC_KEY) {
  // Ne pas définir de valeur par défaut, EmailJS est optionnel
}
// SMTP générique - utilise les vraies valeurs si disponibles
// Pour les tests, on définit des valeurs par défaut pour que le code passe la vérification
// Le mock de nodemailer interceptera l'appel à createTransport
if (!process.env.EMAIL_HOST) {
  process.env.EMAIL_HOST = 'localhost';
}
if (!process.env.EMAIL_PORT) {
  process.env.EMAIL_PORT = '587';
}
if (!process.env.EMAIL_USERNAME) {
  process.env.EMAIL_USERNAME = 'test@harvests.test';
}
if (!process.env.EMAIL_PASSWORD) {
  process.env.EMAIL_PASSWORD = 'test-password-for-mock';
}
if (!process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL = 'http://localhost:5173';
}
if (!process.env.CONTACT_EMAIL) {
  process.env.CONTACT_EMAIL = 'contact@harvests.site';
}

// Configuration PayPal pour les tests (éviter les erreurs de connexion)
// Utilise les vraies variables d'environnement si disponibles, sinon utilise des valeurs par défaut
// Les services PayPal seront mockés dans les tests unitaires pour éviter les connexions réelles
// Note: Ces valeurs sont uniquement pour éviter les erreurs de validation, le SDK est mocké
if (!process.env.PAYPAL_CLIENT_ID) {
  process.env.PAYPAL_CLIENT_ID = 'test-paypal-client-id-for-tests';
}
if (!process.env.PAYPAL_CLIENT_SECRET) {
  process.env.PAYPAL_CLIENT_SECRET = 'test-paypal-client-secret-for-tests';
}
if (!process.env.PAYPAL_ENV) {
  process.env.PAYPAL_ENV = 'sandbox'; // Sandbox par défaut pour les tests
}
if (!process.env.PAYPAL_DEFAULT_CURRENCY) {
  process.env.PAYPAL_DEFAULT_CURRENCY = 'EUR';
}
if (!process.env.PAYPAL_SUPPORTED_CURRENCIES) {
  process.env.PAYPAL_SUPPORTED_CURRENCIES = 'EUR,USD';
}
if (!process.env.PAYPAL_RETURN_URL) {
  process.env.PAYPAL_RETURN_URL = 'http://localhost:5173/payments/paypal/success';
}
if (!process.env.PAYPAL_CANCEL_URL) {
  process.env.PAYPAL_CANCEL_URL = 'http://localhost:5173/payments/paypal/cancel';
}
if (!process.env.PAYPAL_WEBHOOK_ID) {
  // Ne pas définir de valeur par défaut, laisser undefined pour que le code gère
}
if (!process.env.PAYPAL_FEE_PERCENT) {
  process.env.PAYPAL_FEE_PERCENT = '3.4';
}
if (!process.env.PAYPAL_FIXED_FEE) {
  process.env.PAYPAL_FIXED_FEE = '0.30';
}
if (!process.env.PAYPAL_EXCHANGE_RATES) {
  process.env.PAYPAL_EXCHANGE_RATES = '{"XAF->EUR":0.0016}';
}
if (!process.env.PAYPAL_DEFAULT_EXCHANGE_RATE) {
  process.env.PAYPAL_DEFAULT_EXCHANGE_RATE = '0.0016';
}

// Mock de mongoose pour éviter les connexions réelles à la base de données
// Les tests utilisent jest.mock() pour mocker les modèles individuellement
// Pas besoin de connexion MongoDB réelle pour les tests unitaires

// Si vous voulez vraiment tester avec une vraie base de données (tests d'intégration),
// décommentez ceci et définissez DATABASE dans votre .env :
// const mongoose = require('mongoose');
// beforeAll(async () => {
//   if (mongoose.connection.readyState === 0) {
//     const DB = process.env.DATABASE.replace(
//       '<PASSWORD>',
//       process.env.DATABASE_PASSWORD || ''
//     );
//     await mongoose.connect(DB, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//   }
// });
// afterAll(async () => {
//   await mongoose.connection.close();
// });

// NOTE: Les mocks ont été retirés pour utiliser directement les variables d'environnement
// Les variables d'environnement ci-dessus sont configurées pour éviter les erreurs de connexion
// Les services externes (email, PayPal) utiliseront ces configurations

// Timeout global pour les tests
jest.setTimeout(30000);

