const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Middleware pour vérifier si l'utilisateur a vérifié son email
 * Permet l'accès au dashboard mais restreint certaines actions
 */
exports.checkEmailVerification = (options = {}) => {
  return catchAsync(async (req, res, next) => {
    // Si l'utilisateur n'est pas connecté, passer au middleware d'auth
    if (!req.user) {
      return next();
    }

    const { 
      allowAccess = true,  // Permettre l'accès même sans vérification
      restrictActions = true,  // Restreindre les actions
      allowedActions = [],  // Actions autorisées sans vérification
      message = 'Veuillez vérifier votre email pour effectuer cette action'
    } = options;

    // Si l'email est vérifié, tout est autorisé
    if (req.user.isEmailVerified) {
      // emailVerified est un alias pour isEmailVerified pour compatibilité
      req.user.emailVerified = true;
      return next();
    }

    // Email non vérifié
    // emailVerified est un alias pour isEmailVerified pour compatibilité
    req.user.emailVerified = false;
    req.user.requiresEmailVerification = true;

    // Si on permet l'accès mais qu'on restreint les actions
    if (allowAccess && restrictActions) {
      // Vérifier si l'action actuelle est autorisée
      const currentAction = req.route?.path || req.path;
      const isActionAllowed = allowedActions.some(action => 
        currentAction.includes(action) || req.method === action
      );

      if (!isActionAllowed) {
        return res.status(403).json({
          status: 'error',
          message,
          code: 'EMAIL_VERIFICATION_REQUIRED',
          data: {
            emailVerified: false,
            requiresEmailVerification: true,
            allowedActions: allowedActions,
            suggestion: 'Vérifiez votre email pour débloquer toutes les fonctionnalités'
          }
        });
      }
    }

    // Si on ne permet pas l'accès du tout
    if (!allowAccess) {
      return res.status(403).json({
        status: 'error',
        message: 'Accès refusé - Email non vérifié',
        code: 'EMAIL_VERIFICATION_REQUIRED',
        data: {
          emailVerified: false,
          requiresEmailVerification: true
        }
      });
    }

    next();
  });
};

/**
 * Middleware pour les actions qui nécessitent une vérification d'email
 */
exports.requireEmailVerification = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Vous devez être connecté', 401));
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      status: 'error',
      message: 'Cette action nécessite une vérification d\'email',
      code: 'EMAIL_VERIFICATION_REQUIRED',
      data: {
        emailVerified: false,
        requiresEmailVerification: true,
        suggestion: 'Vérifiez votre email pour effectuer cette action'
      }
    });
  }

  next();
});

/**
 * Middleware pour les actions de lecture (autorisées sans vérification)
 */
exports.allowReadOnly = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Vous devez être connecté', 401));
  }

  // Autoriser les actions de lecture même sans vérification d'email
  const readOnlyMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (!readOnlyMethods.includes(req.method)) {
    return exports.requireEmailVerification(req, res, next);
  }

  next();
});
