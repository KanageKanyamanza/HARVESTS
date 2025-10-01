const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const compression = require('compression');

// Configuration CORS sécurisée
const corsOptions = {
  origin: function (origin, callback) {
    // Liste des domaines autorisés
    const allowedOrigins = [
      'http://localhost:3000', // React dev
      'http://localhost:5173', // Vite dev
      'https://harvests-khaki.vercel.app' // Frontend Vercel
    ];

    // Permettre les requêtes sans origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true, // Permettre les cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['X-Total-Count']
};

// Limiteur de taux global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limite chaque IP à 1000 requêtes par windowMs
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Fonction personnalisée pour identifier les utilisateurs
  keyGenerator: (req) => {
    return req.user ? `user_${req.user.id}` : req.ip;
  }
});

// Limiteur strict pour les routes d'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limite à 10 tentatives de connexion par IP
  message: {
    error: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Ne pas compter les requêtes réussies
});

// Limiteur pour la création de compte
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5, // limite à 5 créations de compte par IP par heure
  message: {
    error: 'Trop de comptes créés depuis cette IP, veuillez réessayer dans 1 heure.',
    retryAfter: '1 heure'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Limiteur pour les emails (reset password, verification)
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5, // limite à 5 emails par IP par heure
  message: {
    error: 'Trop d\'emails envoyés depuis cette IP, veuillez réessayer dans 1 heure.',
    retryAfter: '1 heure'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Limiteur pour les uploads de fichiers
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limite à 50 uploads par utilisateur
  message: {
    error: 'Trop d\'uploads, veuillez réessayer plus tard.',
    retryAfter: '15 minutes'
  },
  keyGenerator: (req) => {
    return req.user ? `upload_${req.user.id}` : `upload_${req.ip}`;
  }
});

// Configuration Helmet pour la sécurité des headers
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false, // Désactivé pour les uploads
  hsts: {
    maxAge: 31536000, // 1 an
    includeSubDomains: true,
    preload: true
  }
});

// Middleware de validation des types de fichiers
const fileTypeValidation = (allowedTypes) => {
  return (req, res, next) => {
    if (!req.files && !req.file) {
      return next();
    }

    const files = req.files || [req.file];
    
    for (const file of files) {
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          status: 'error',
          message: `Type de fichier non autorisé: ${file.mimetype}. Types autorisés: ${allowedTypes.join(', ')}`
        });
      }
    }
    
    next();
  };
};

// Middleware de validation de la taille des fichiers
const fileSizeValidation = (maxSize) => {
  return (req, res, next) => {
    if (!req.files && !req.file) {
      return next();
    }

    const files = req.files || [req.file];
    
    for (const file of files) {
      if (file.size > maxSize) {
        return res.status(400).json({
          status: 'error',
          message: `Fichier trop volumineux. Taille maximum autorisée: ${maxSize / 1024 / 1024}MB`
        });
      }
    }
    
    next();
  };
};

// Middleware de logging des requêtes suspectes
const suspiciousActivityLogger = (req, res, next) => {
  const suspiciousPatterns = [
    /\$where/i,
    /\$ne/i,
    /<script>/i,
    /javascript:/i,
    /on\w+=/i,
    /eval\(/i,
    /union.*select/i,
    /drop.*table/i
  ];

  const requestString = JSON.stringify(req.body) + JSON.stringify(req.query) + req.url;
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestString)) {
      console.warn(`🚨 Activité suspecte détectée:`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method,
        body: req.body,
        query: req.query,
        timestamp: new Date().toISOString()
      });
      break;
    }
  }
  
  next();
};

// Middleware de validation des paramètres d'ID MongoDB
const validateObjectId = (req, res, next) => {
  const mongoose = require('mongoose');
  
  // Vérifier tous les paramètres qui finissent par 'Id' ou 'id'
  for (const [key, value] of Object.entries(req.params)) {
    if ((key.endsWith('Id') || key.endsWith('id')) && !mongoose.Types.ObjectId.isValid(value)) {
      return res.status(400).json({
        status: 'error',
        message: `ID invalide: ${key}`
      });
    }
  }
  
  next();
};

// Configuration de compression
const compressionConfig = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024 // Compresser seulement si > 1KB
});

module.exports = {
  // Middlewares de sécurité de base
  helmet: helmetConfig,
  cors: cors(corsOptions),
  mongoSanitize: mongoSanitize(),
  xss: xss(),
  hpp: hpp({
    whitelist: [
      'category',
      'region',
      'userType',
      'sort',
      'fields',
      'page',
      'limit'
    ]
  }),
  compression: compressionConfig,

  // Limiteurs de taux
  globalLimiter,
  authLimiter,
  signupLimiter,
  emailLimiter,
  uploadLimiter,

  // Validations
  fileTypeValidation,
  fileSizeValidation,
  validateObjectId,

  // Logging
  suspiciousActivityLogger,

  // Types de fichiers autorisés par catégorie
  fileTypes: {
    images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    all: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },

  // Tailles de fichiers
  fileSizes: {
    avatar: 2 * 1024 * 1024, // 2MB
    document: 10 * 1024 * 1024, // 10MB
    productImage: 5 * 1024 * 1024 // 5MB
  }
};
