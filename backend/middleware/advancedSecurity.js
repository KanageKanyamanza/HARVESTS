const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');
const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const { security } = require('../config/logger');
const AppError = require('../utils/appError');

// 🔒 Rate limiting avancé par type d'endpoint
const createRateLimit = (windowMs, max, message, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (req, res) => {
      security.suspiciousActivity(
        req.user?.id || 'anonymous',
        'rate_limit_exceeded',
        req.ip,
        { endpoint: req.path, method: req.method }
      );
      
      res.status(429).json({
        error: message,
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// Rate limits spécialisés
const rateLimits = {
  // Authentification stricte
  auth: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5, // 5 tentatives max
    'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
    true
  ),
  
  // API générale
  api: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requêtes max
    'Trop de requêtes. Réessayez dans 15 minutes.'
  ),
  
  // Upload de fichiers
  upload: createRateLimit(
    60 * 60 * 1000, // 1 heure
    20, // 20 uploads max par heure
    'Trop d\'uploads. Réessayez dans 1 heure.'
  ),
  
  // Paiements critiques
  payment: createRateLimit(
    60 * 60 * 1000, // 1 heure
    10, // 10 paiements max par heure
    'Trop de tentatives de paiement. Contactez le support.'
  ),
  
  // Emails
  email: createRateLimit(
    60 * 60 * 1000, // 1 heure
    5, // 5 emails max par heure
    'Trop d\'emails envoyés. Réessayez plus tard.'
  )
};

// 🐌 Ralentissement progressif
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Ralentir après 50 requêtes
  delayMs: 500, // Ajouter 500ms de délai
  maxDelayMs: 20000, // Maximum 20 secondes de délai
  skipFailedRequests: false,
  skipSuccessfulRequests: false
});

// 🛡️ Configuration Helmet sécurisée
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"]
    }
  },
  crossOriginEmbedderPolicy: false, // Pour compatibilité Stripe
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// 🔐 Chiffrement des données sensibles
class DataEncryption {
  static encrypt(text) {
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('Clé de chiffrement manquante');
    }
    
    return CryptoJS.AES.encrypt(text, process.env.ENCRYPTION_KEY).toString();
  }
  
  static decrypt(encryptedText) {
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('Clé de chiffrement manquante');
    }
    
    const bytes = CryptoJS.AES.decrypt(encryptedText, process.env.ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  
  // Hachage sécurisé pour données sensibles
  static hash(data, salt = null) {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(data, actualSalt, 10000, 64, 'sha512').toString('hex');
    return { hash, salt: actualSalt };
  }
  
  // Vérifier un hash
  static verifyHash(data, hash, salt) {
    const newHash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
    return newHash === hash;
  }
}

// 🕵️ Détection d'activités suspectes
const suspiciousActivityDetector = (req, res, next) => {
  const suspiciousPatterns = [
    // Tentatives d'injection SQL
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/i,
    // Tentatives XSS
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    // Tentatives de traversée de répertoire
    /\.\.[\/\\]/,
    // Commandes système
    /(\b(exec|eval|system|shell_exec)\b)/i
  ];
  
  const checkSuspicious = (value) => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkSuspicious);
    }
    return false;
  };
  
  // Vérifier query, body et params
  const isSuspicious = [req.query, req.body, req.params]
    .some(checkSuspicious);
  
  if (isSuspicious) {
    security.suspiciousActivity(
      req.user?.id || 'anonymous',
      'malicious_input_detected',
      req.ip,
      {
        method: req.method,
        path: req.path,
        userAgent: req.get('User-Agent'),
        query: req.query,
        body: req.body,
        params: req.params
      }
    );
    
    return next(new AppError('Requête suspecte détectée', 400));
  }
  
  next();
};

// 📍 Détection de géolocalisation suspecte
const geoLocationCheck = async (req, res, next) => {
  // Si l'utilisateur est connecté, vérifier la cohérence géographique
  if (req.user && req.user.lastLoginLocation) {
    const currentIP = req.ip;
    
    // Ici vous pourriez intégrer un service de géolocalisation IP
    // Pour l'instant, on log juste les changements d'IP
    if (req.user.lastLoginIP && req.user.lastLoginIP !== currentIP) {
      security.suspiciousActivity(
        req.user.id,
        'ip_address_change',
        currentIP,
        {
          previousIP: req.user.lastLoginIP,
          userAgent: req.get('User-Agent')
        }
      );
    }
  }
  
  next();
};

// 🔒 Validation de session avancée
const sessionValidator = async (req, res, next) => {
  if (req.user) {
    const User = require('../models/User');
    
    try {
      const user = await User.findById(req.user.id).select('+lastLoginDate +isActive');
      
      if (!user) {
        return next(new AppError('Session invalide', 401));
      }
      
      if (!user.isActive) {
        return next(new AppError('Compte désactivé', 401));
      }
      
      // Vérifier si la session n'est pas trop ancienne
      const sessionAge = Date.now() - new Date(user.lastLoginDate).getTime();
      const maxSessionAge = 24 * 60 * 60 * 1000; // 24 heures
      
      if (sessionAge > maxSessionAge) {
        return next(new AppError('Session expirée', 401));
      }
      
      // Mettre à jour l'activité utilisateur
      user.lastActivity = new Date();
      await user.save({ validateBeforeSave: false });
      
    } catch (error) {
      return next(new AppError('Erreur validation session', 500));
    }
  }
  
  next();
};

// 🚨 Middleware d'audit de sécurité
const securityAudit = (req, res, next) => {
  const startTime = Date.now();
  
  // Capturer la réponse
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Logger les accès aux données sensibles
    if (req.path.includes('/api/')) {
      security.dataAccess(
        req.user?.id || 'anonymous',
        req.path,
        req.method,
        req.ip
      );
    }
    
    // Logger les réponses d'erreur
    if (res.statusCode >= 400) {
      security.suspiciousActivity(
        req.user?.id || 'anonymous',
        'error_response',
        req.ip,
        {
          statusCode: res.statusCode,
          method: req.method,
          path: req.path,
          duration
        }
      );
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// 🔐 Générateur de tokens sécurisés
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// 🛡️ Validation CSRF
const csrfProtection = (req, res, next) => {
  // Ignorer pour les requêtes GET et les webhooks
  if (req.method === 'GET' || req.path.includes('/webhook')) {
    return next();
  }
  
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;
  
  if (!token || !sessionToken || token !== sessionToken) {
    return next(new AppError('Token CSRF invalide', 403));
  }
  
  next();
};

module.exports = {
  rateLimits,
  speedLimiter,
  helmetConfig,
  DataEncryption,
  suspiciousActivityDetector,
  geoLocationCheck,
  sessionValidator,
  securityAudit,
  generateSecureToken,
  csrfProtection
};
