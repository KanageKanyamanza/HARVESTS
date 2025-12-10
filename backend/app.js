const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

// Importation des middlewares de sécurité
const {
  helmet,
  cors,
  mongoSanitize,
  xss,
  hpp,
  compression,
  globalLimiter,
  suspiciousActivityLogger,
  validateObjectId
} = require('./middleware/security');

// Importation des routes
const authRoutes = require('./routes/authRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminManagementRoutes = require('./routes/adminManagementRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const producerRoutes = require('./routes/producerRoutes');
const publicProducerRoutes = require('./routes/publicProducerRoutes');
const transformerRoutes = require('./routes/transformerRoutes');
const consumerRoutes = require('./routes/consumerRoutes');
const restaurateurRoutes = require('./routes/restaurateurRoutes');
const exporterRoutes = require('./routes/exporterRoutes');
const transporterRoutes = require('./routes/transporterRoutes');

// Importation des gestionnaires d'erreur
const AppError = require('./utils/appError');
const globalErrorHandler = require('./middleware/errorHandler');

// Importation de Swagger
const { setupSwagger } = require('./config/swagger');

// Importation i18n
const { detectLanguage } = require('./config/i18n');
const i18nResponse = require('./middleware/i18nResponse');

const app = express();

// Configuration du proxy de confiance pour les headers X-Forwarded-*
app.set('trust proxy', 1);

// Configuration du moteur de template Pug pour les emails
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// ============================================
// MIDDLEWARES GLOBAUX
// ============================================

// Sécurité - Headers HTTP
app.use(helmet);

// CORS - Cross Origin Resource Sharing
app.use(cors);

// Logging des requêtes en développement
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limiteur de taux global
app.use('/api', globalLimiter);

// Parser le body des requêtes
app.use(express.json({ limit: '10mb' })); // Limite la taille du body pour les uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Middleware de timeout pour les requêtes longues (comme l'envoi d'emails)
app.use((req, res, next) => {
  // Timeout de 3 minutes pour les routes d'authentification
  if (req.path.startsWith('/api/v1/auth/')) {
    req.setTimeout(180000); // 3 minutes
    res.setTimeout(180000);
  }
  next();
});

// Servir les fichiers statiques du backend
app.use(express.static(path.join(__dirname, 'public')));

// Nettoyage des données contre les attaques NoSQL injection
app.use(mongoSanitize);

// Nettoyage des données contre les attaques XSS
app.use(xss);

// Prévention de la pollution des paramètres HTTP
app.use(hpp);

// Compression des réponses
app.use(compression);

// Logging des activités suspectes
app.use(suspiciousActivityLogger);

// Validation des IDs MongoDB dans les paramètres
app.use(validateObjectId);

// Détection de la langue
app.use(detectLanguage);

// Middleware pour réponses bilingues
app.use(i18nResponse);

// DOCUMENTATION API SWAGGER
setupSwagger(app);

// ROUTES DE L'API

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Vérifier l'état de l'API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API opérationnelle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: API Harvests fonctionnelle
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 */
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API Harvests fonctionnelle',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.API_VERSION || '1.0.0'
  });
});

// Routes d'authentification
app.use('/api/v1/auth', authRoutes);

// Routes d'authentification admin
app.use('/api/v1/admin/auth', adminAuthRoutes);

// Routes admin
app.use('/api/v1/admin', adminRoutes);

// Routes de gestion des administrateurs
app.use('/api/v1/admin-management', adminManagementRoutes);

// Routes utilisateurs génériques
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/profiles', profileRoutes);

// Routes spécialisées par type d'utilisateur
app.use('/api/v1/producers', producerRoutes);
app.use('/api/v1/public/producers', publicProducerRoutes);
app.use('/api/v1/transformers', transformerRoutes);
app.use('/api/v1/consumers', consumerRoutes);
app.use('/api/v1/restaurateurs', restaurateurRoutes);
app.use('/api/v1/exporters', exporterRoutes);
app.use('/api/v1/transporters', transporterRoutes);

// Routes pour les ressources communes
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const blogRoutes = require('./routes/blogRoutes');
const blogVisitorRoutes = require('./routes/blogVisitorRoutes');
const chatRoutes = require('./routes/chatRoutes');
const contactRoutes = require('./routes/contactRoutes');

app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/blog-visitors', blogVisitorRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/contact', contactRoutes);


// Routes à implémenter plus tard
// app.use('/api/v1/deliveries', deliveryRoutes);
// app.use('/api/v1/analytics', analyticsRoutes);
// app.use('/api/v1/admin', adminRoutes);

// Route racine
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Bienvenue sur l\'API HARVESTS',
    description: 'Plateforme de commerce agricole',
    version: process.env.API_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/v1/health',
      documentation: '/api/docs',
      auth: '/api/v1/auth',
      api: '/api/v1'
    }
  });
});

// Route de fallback pour les chemins non API
// IMPORTANT: Cette route doit être la dernière pour ne pas intercepter les routes API
app.get('*', (req, res) => {
  // Ne pas intercepter les routes API - elles sont gérées par les routeurs spécifiques
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      status: 'error',
      message: `Route API non trouvée: ${req.originalUrl}`,
      path: req.path,
      method: req.method
    });
  }

  return res.status(404).json({
    status: 'error',
    message: `Ressource non trouvée: ${req.originalUrl}`
  });
});

// Gestionnaire d'erreur global
app.use(globalErrorHandler);

module.exports = app;
