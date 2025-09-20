const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

// Créer le dossier logs s'il n'existe pas
const fs = require('fs');
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Format personnalisé pour les logs
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Format pour la console (développement)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Configuration des transports
const transports = [];

// Transport pour la console (développement)
if (process.env.NODE_ENV === 'development') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug'
    })
  );
}

// Transport pour fichiers rotatifs (tous environnements)
transports.push(
  // Logs généraux avec rotation quotidienne
  new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'harvests-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: logFormat,
    level: process.env.LOG_LEVEL || 'info'
  }),
  
  // Logs d'erreurs séparés
  new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'errors-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    format: logFormat,
    level: 'error'
  }),
  
  // Logs d'audit/sécurité
  new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'security-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    format: logFormat,
    level: 'warn'
  })
);

// Créer le logger principal
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'harvests-api',
    version: process.env.API_VERSION || '1.0.0'
  },
  transports: transports,
  exitOnError: false
});

// Logger spécialisé pour l'audit de sécurité
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.label({ label: 'SECURITY' })
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'security-audit-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '90d'
    })
  ]
});

// Logger pour les performances
const performanceLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.label({ label: 'PERFORMANCE' })
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'performance-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d'
    })
  ]
});

// Logger pour les paiements (audit financier)
const paymentLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.label({ label: 'PAYMENT' })
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'payments-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '365d' // Garder 1 an pour audit financier
    })
  ]
});

// Fonctions utilitaires pour logging structuré
const loggers = {
  // Logger principal
  info: (message, meta = {}) => logger.info(message, meta),
  error: (message, error = null, meta = {}) => {
    if (error instanceof Error) {
      logger.error(message, { 
        error: error.message, 
        stack: error.stack,
        ...meta 
      });
    } else {
      logger.error(message, { error, ...meta });
    }
  },
  warn: (message, meta = {}) => logger.warn(message, meta),
  debug: (message, meta = {}) => logger.debug(message, meta),
  
  // Logger de sécurité
  security: {
    login: (userId, ip, userAgent, success = true) => {
      securityLogger.info('User login attempt', {
        userId,
        ip,
        userAgent,
        success,
        timestamp: new Date().toISOString()
      });
    },
    
    logout: (userId, ip) => {
      securityLogger.info('User logout', {
        userId,
        ip,
        timestamp: new Date().toISOString()
      });
    },
    
    failedLogin: (email, ip, userAgent, reason) => {
      securityLogger.warn('Failed login attempt', {
        email,
        ip,
        userAgent,
        reason,
        timestamp: new Date().toISOString()
      });
    },
    
    suspiciousActivity: (userId, activity, ip, details = {}) => {
      securityLogger.warn('Suspicious activity detected', {
        userId,
        activity,
        ip,
        details,
        timestamp: new Date().toISOString()
      });
    },
    
    dataAccess: (userId, resource, action, ip) => {
      securityLogger.info('Data access', {
        userId,
        resource,
        action,
        ip,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  // Logger de performance
  performance: {
    apiRequest: (method, url, duration, statusCode, userId = null) => {
      performanceLogger.info('API Request', {
        method,
        url,
        duration,
        statusCode,
        userId,
        timestamp: new Date().toISOString()
      });
    },
    
    slowQuery: (query, duration, collection) => {
      performanceLogger.warn('Slow database query', {
        query,
        duration,
        collection,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  // Logger de paiements
  payment: {
    initiated: (orderId, amount, method, userId) => {
      paymentLogger.info('Payment initiated', {
        orderId,
        amount,
        method,
        userId,
        timestamp: new Date().toISOString()
      });
    },
    
    completed: (orderId, transactionId, amount, method) => {
      paymentLogger.info('Payment completed', {
        orderId,
        transactionId,
        amount,
        method,
        timestamp: new Date().toISOString()
      });
    },
    
    failed: (orderId, reason, amount, method) => {
      paymentLogger.error('Payment failed', {
        orderId,
        reason,
        amount,
        method,
        timestamp: new Date().toISOString()
      });
    },
    
    refund: (orderId, refundId, amount, reason) => {
      paymentLogger.info('Payment refunded', {
        orderId,
        refundId,
        amount,
        reason,
        timestamp: new Date().toISOString()
      });
    }
  }
};

module.exports = {
  logger,
  securityLogger,
  performanceLogger,
  paymentLogger,
  ...loggers
};
