const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../../models/User');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

/**
 * Middleware de protection des routes
 * Vérifie l'authentification de l'utilisateur via JWT
 */
exports.protect = catchAsync(async (req, res, next) => {
  // Récupérer le token depuis les headers ou les cookies
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('Vous n\'êtes pas connecté! Veuillez vous connecter pour accéder.', 401)
    );
  }

  // Vérifier et décoder le token JWT
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Vérifier si l'utilisateur existe toujours
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('L\'utilisateur propriétaire de ce token n\'existe plus.', 401)
    );
  }

  // Vérifier si le mot de passe a été changé après l'émission du token
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('L\'utilisateur a récemment changé de mot de passe! Veuillez vous reconnecter.', 401)
    );
  }

  // Vérifier si le compte est actif
  if (!currentUser.isActive) {
    return next(new AppError('Votre compte a été désactivé', 401));
  }

  // Vérifier si le compte n'est pas suspendu
  if (currentUser.suspendedUntil && currentUser.suspendedUntil > new Date()) {
    return next(new AppError('Votre compte est temporairement suspendu', 403));
  }

  // Ajouter l'utilisateur à la requête
  req.user = currentUser;
  res.locals.user = currentUser;
  req.user.emailVerified = currentUser.isEmailVerified;
  req.user.requiresEmailVerification = !currentUser.isEmailVerified;
  
  next();
});

/**
 * Middleware de restriction par type d'utilisateur
 * Limite l'accès aux routes selon le type d'utilisateur
 */
exports.restrictTo = (...userTypes) => {
  return (req, res, next) => {
    if (!userTypes.includes(req.user.userType)) {
      return next(
        new AppError('Vous n\'avez pas la permission d\'effectuer cette action', 403)
      );
    }
    next();
  };
};

/**
 * Middleware pour vérifier la vérification d'email
 * Exige que l'utilisateur ait vérifié son email pour accéder à certaines fonctionnalités
 */
exports.requireVerification = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      status: 'error',
      message: 'Cette fonctionnalité nécessite une vérification d\'email',
      code: 'EMAIL_VERIFICATION_REQUIRED',
      data: {
        emailVerified: false,
        requiresEmailVerification: true,
        suggestion: 'Vérifiez votre email pour débloquer cette fonctionnalité',
        allowedActions: [
          'Voir le profil',
          'Modifier les informations de base',
          'Consulter les commandes existantes',
          'Voir les notifications'
        ],
        restrictedActions: [
          'Créer des commandes',
          'Effectuer des paiements',
          'Publier des produits',
          'Gérer la boutique'
        ]
      }
    });
  }
  next();
};

// Middleware flexible pour les actions qui nécessitent une vérification d'email
exports.requireVerificationFlexible = (options = {}) => {
  const {
    allowReadOnly = true,
    allowedMethods = ['GET', 'HEAD', 'OPTIONS'],
    customMessage = 'Cette action nécessite une vérification d\'email'
  } = options;

  return (req, res, next) => {
    if (!req.user.isEmailVerified) {
      // Si on permet la lecture seule et que c'est une méthode de lecture
      if (allowReadOnly && allowedMethods.includes(req.method)) {
        return next();
      }

      return res.status(403).json({
        status: 'error',
        message: customMessage,
        code: 'EMAIL_VERIFICATION_REQUIRED',
        data: {
          emailVerified: false,
          requiresEmailVerification: true,
          suggestion: 'Vérifiez votre email pour débloquer cette fonctionnalité'
        }
      });
    }
    next();
  };
};

// Middleware pour vérifier si l'utilisateur est approuvé (pour les opérations sensibles)
exports.requireApproval = (req, res, next) => {
  if (['producer', 'transformer', 'exporter', 'transporter'].includes(req.user.userType) && !req.user.isApproved) {
    return next(new AppError('Votre compte doit être approuvé pour accéder à cette fonctionnalité', 403));
  }
  next();
};

// Middleware pour vérifier si l'utilisateur est approuvé (pour l'accès au dashboard)
exports.checkApprovalStatus = (req, res, next) => {
  // Ajouter le statut d'approbation aux données de l'utilisateur
  req.user.approvalStatus = {
    isApproved: req.user.isApproved,
    needsApproval: ['producer', 'transformer', 'exporter', 'transporter'].includes(req.user.userType),
    canAccessDashboard: true, // Toujours autoriser l'accès au dashboard
    canPerformOperations: req.user.isApproved || !['producer', 'transformer', 'exporter', 'transporter'].includes(req.user.userType)
  };
  next();
};

