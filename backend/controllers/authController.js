const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const emailQueue = require('../services/emailQueueService');

// Note: Pour l'inscription simplifiée, nous utilisons seulement le modèle User de base
// Les profils spécialisés seront créés lors de la complétion du profil

// Fonction pour signer un JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Fonction pour créer et envoyer un token
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  // Configuration du cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'strict'
  };

  res.cookie('jwt', token, cookieOptions);

  // Supprimer le mot de passe de la sortie
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
      emailVerified: user.isEmailVerified,
      requiresEmailVerification: !user.isEmailVerified
    },
  });
};

// Inscription simplifiée
exports.signup = catchAsync(async (req, res, next) => {
  const { userType } = req.body;

  // Types d'utilisateurs valides
  const validUserTypes = ['producer', 'transformer', 'consumer', 'restaurateur', 'exporter', 'transporter'];
  if (!validUserTypes.includes(userType)) {
    return next(new AppError('Type d\'utilisateur invalide', 400));
  }

  // Vérifier si l'email existe déjà
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    // Retourner une réponse plus informative
    return res.status(400).json({
      status: 'fail',
      message: 'Un utilisateur avec cet email existe déjà',
      code: 'USER_EXISTS',
      suggestion: 'Essayez de vous connecter ou utilisez un autre email'
    });
  }

  // Données minimales pour l'inscription
  const userData = {
    firstName: req.body.firstName,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
    userType,
    preferredLanguage: req.body.preferredLanguage || 'fr',
    country: req.body.country || 'Sénégal'
  };

  // Gérer lastName selon le type d'utilisateur
  if (userType === 'consumer') {
    // Pour les consommateurs : lastName requis
    userData.lastName = req.body.lastName;
    if (!userData.lastName) {
      return next(new AppError('Le nom est requis pour les consommateurs', 400));
    }
  } else {
    // Pour les autres : lastName optionnel, firstName contient le nom complet
    userData.lastName = req.body.lastName || 'À compléter';
  }

  // INSCRIPTION SIMPLIFIÉE : Utiliser seulement le modèle User de base
  // Les profils spécialisés seront créés lors de la complétion du profil
  const newUser = await User.create(userData);

  // Générer token de vérification email
  const verifyToken = newUser.createEmailVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  // Réponse de succès d'inscription
  const successResponse = {
    user: {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      userType: newUser.userType,
      isEmailVerified: newUser.isEmailVerified,
      preferredLanguage: newUser.preferredLanguage,
      isProfileComplete: newUser.isProfileComplete
    }
  };

  // Ajouter l'email à la queue d'envoi en arrière-plan
  const frontendUrl = process.env.FRONTEND_URL || 'https://harvests-khaki.vercel.app';
  const verifyURL = `${frontendUrl}/verify-email/${verifyToken}`;
  
  emailQueue.addToQueue({
    user: newUser,
    verifyURL,
    language: req.language,
    emailType: 'welcome',
    email: newUser.email
  });

  // Réponse immédiate de succès d'inscription
  res.status(201).json({
    status: 'success',
    message: 'Inscription réussie ! Un email de vérification vous sera envoyé sous peu.',
    data: successResponse
  });
});


// Connexion
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Vérifier si email et mot de passe sont fournis
  if (!email || !password) {
    return next(new AppError('Veuillez fournir un email et un mot de passe', 400));
  }

  // 2) Vérifier si l'utilisateur existe et le mot de passe est correct
  const user = await User.findOne({ email }).select('+password +loginAttempts +accountLockedUntil');

  // Vérifier si le compte est verrouillé
  if (user && user.isLocked()) {
    return next(new AppError('Compte temporairement verrouillé en raison de tentatives de connexion répétées', 423));
  }

  if (!user || !(await user.comparePassword(password))) {
    // Incrémenter les tentatives de connexion si l'utilisateur existe
    if (user) {
      await user.incLoginAttempts();
    }
    return next(new AppError('Email ou mot de passe incorrect', 401));
  }

  // 3) Vérifier si l'email est vérifié (avertissement mais pas d'erreur)
  if (!user.isEmailVerified) {
    console.log(`⚠️ Connexion avec email non vérifié: ${user.email}`);
    // On continue la connexion mais on ajoutera un flag pour les restrictions
  }

  // 4) Vérifier si le compte est actif
  if (!user.isActive) {
    return next(new AppError('Votre compte a été désactivé. Contactez le support.', 401));
  }

  // 5) L'approbation sera vérifiée par un middleware spécifique si nécessaire

  // 6) Vérifier si le compte n'est pas suspendu
  if (user.suspendedUntil && user.suspendedUntil > new Date()) {
    return next(new AppError(`Votre compte est suspendu jusqu'au ${user.suspendedUntil}. Raison: ${user.suspensionReason}`, 403));
  }

  // 7) Réinitialiser les tentatives de connexion et mettre à jour lastLogin
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }
  
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // 8) Tout est OK, envoyer le token au client
  createSendToken(user, 200, req, res);
});

// Déconnexion
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

// Endpoint pour vérifier le statut de la queue d'emails (debug)
exports.getEmailQueueStatus = (req, res) => {
  const status = emailQueue.getQueueStatus();
  res.status(200).json({
    status: 'success',
    data: {
      emailQueue: status,
      message: 'Statut de la queue d\'emails'
    }
  });
};

// Redemander l'envoi d'email de vérification
exports.retryEmailVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return next(new AppError('Email requis', 400));
  }

  // Trouver l'utilisateur
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Utilisateur non trouvé', 404));
  }

  // Vérifier si l'email est déjà vérifié
  if (user.isEmailVerified) {
    return res.status(200).json({
      status: 'success',
      message: 'Email déjà vérifié'
    });
  }

  // Générer un nouveau token de vérification
  const verifyToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Ajouter à la queue d'envoi
  const frontendUrl = process.env.FRONTEND_URL || 'https://harvests-khaki.vercel.app';
  const verifyURL = `${frontendUrl}/verify-email/${verifyToken}`;
  
  emailQueue.addToQueue({
    user,
    verifyURL,
    language: req.language,
    emailType: 'welcome',
    email: user.email
  });

  res.status(200).json({
    status: 'success',
    message: 'Email de vérification renvoyé en arrière-plan'
  });
});

// Tester la configuration email
exports.testEmailConfiguration = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return next(new AppError('Email requis pour le test', 400));
  }

  // Créer un utilisateur temporaire pour le test
  const testUser = {
    email,
    firstName: 'Test',
    preferredLanguage: req.language || 'fr'
  };

  const testEmail = new Email(testUser, 'https://harvests-khaki.vercel.app', req.language);
  
  try {
    // Tester la connexion Nodemailer
    const connectionTest = await testEmail.testConnection();
    
    if (connectionTest) {
      // Envoyer un email de test
      await testEmail.sendTestEmail();
      
      res.status(200).json({
        status: 'success',
        message: 'Configuration email testée avec succès',
        data: {
          nodemailer: 'OK',
          emailjs: testEmail.isEmailJSConfigured() ? 'Configuré' : 'Non configuré',
          testEmailSent: true
        }
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Échec de la connexion Nodemailer',
        data: {
          nodemailer: 'FAILED',
          emailjs: testEmail.isEmailJSConfigured() ? 'Configuré' : 'Non configuré'
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors du test email',
      error: error.message,
      data: {
        nodemailer: 'ERROR',
        emailjs: testEmail.isEmailJSConfigured() ? 'Configuré' : 'Non configuré'
      }
    });
  }
});

// Vérification email
exports.verifyEmail = catchAsync(async (req, res, next) => {
  // 1) Récupérer l'utilisateur basé sur le token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  // 2) Si le token n'a pas expiré et qu'il y a un utilisateur, définir l'email comme vérifié
  if (!user) {
    return next(new AppError('Token invalide ou expiré', 400));
  }

  // Vérifier si l'email est déjà vérifié
  if (user.isEmailVerified) {
    return res.status(200).json({
      status: 'success',
      message: 'Email déjà vérifié !'
    });
  }

  user.isEmailVerified = true;
  user.emailVerified = true; // Synchroniser les deux champs
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // Retourner une réponse JSON de succès
  res.status(200).json({
    status: 'success',
    message: 'Email vérifié avec succès !'
  });
});

// Renvoyer email de vérification
exports.resendVerificationEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Aucun utilisateur trouvé avec cet email', 404));
  }

  if (user.isEmailVerified) {
    return next(new AppError('Cet email est déjà vérifié', 400));
  }

  const verifyToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  try {
    // URL du frontend pour la vérification directe
    const frontendUrl = process.env.FRONTEND_URL || 'https://harvests-khaki.vercel.app';
    const verifyURL = `${frontendUrl}/verify-email/${verifyToken}`;

    await new Email(user, verifyURL, req.language).sendWelcome();


    res.status(200).json({
      status: 'success',
      message: 'Email de vérification renvoyé avec succès!',
    });
  } catch (err) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.', 500)
    );
  }
});

// Mot de passe oublié
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Récupérer l'utilisateur basé sur l'email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('Aucun utilisateur trouvé avec cet email', 404));
  }

  // 2) Générer le token de reset aléatoire
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    // 3) Envoyer à l'email de l'utilisateur
    const frontendUrl = process.env.FRONTEND_URL || 'https://harvests-khaki.vercel.app';
    const resetURL = `${frontendUrl}/reset-password/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token de réinitialisation envoyé par email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.', 500)
    );
  }
});

// Réinitialiser mot de passe
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Récupérer l'utilisateur basé sur le token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) Si le token n'a pas expiré et qu'il y a un utilisateur, définir le nouveau mot de passe
  if (!user) {
    return next(new AppError('Token invalide ou expiré', 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Mettre à jour la propriété changedPasswordAt pour l'utilisateur (fait dans le middleware pre-save)

  // 4) Connecter l'utilisateur, envoyer JWT
  createSendToken(user, 200, req, res);
});

// Changer mot de passe (utilisateur connecté)
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Récupérer l'utilisateur de la base de données
  const user = await User.findById(req.user.id).select('+password');

  // 2) Vérifier si le mot de passe actuel est correct
  if (!(await user.comparePassword(req.body.passwordCurrent))) {
    return next(new AppError('Votre mot de passe actuel est incorrect', 401));
  }

  // 3) Si oui, mettre à jour le mot de passe
  user.password = req.body.password;
  await user.save();

  // 4) Connecter l'utilisateur, envoyer JWT
  createSendToken(user, 200, req, res);
});

// Middleware de protection des routes
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Récupérer le token et vérifier s'il est là
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

  // 2) Vérifier le token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Vérifier si l'utilisateur existe toujours
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('L\'utilisateur propriétaire de ce token n\'existe plus.', 401)
    );
  }

  // 4) Vérifier si l'utilisateur a changé de mot de passe après l'émission du token
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('L\'utilisateur a récemment changé de mot de passe! Veuillez vous reconnecter.', 401)
    );
  }

  // 5) Vérifier si le compte est actif
  if (!currentUser.isActive) {
    return next(new AppError('Votre compte a été désactivé', 401));
  }

  // 6) Vérifier si le compte n'est pas suspendu
  if (currentUser.suspendedUntil && currentUser.suspendedUntil > new Date()) {
    return next(new AppError('Votre compte est temporairement suspendu', 403));
  }

  // ACCÈS ACCORDÉ À LA ROUTE PROTÉGÉE
  req.user = currentUser;
  res.locals.user = currentUser;
  
  // Ajouter les informations de vérification d'email
  req.user.emailVerified = currentUser.isEmailVerified;
  req.user.requiresEmailVerification = !currentUser.isEmailVerified;
  
  next();
});

// Middleware de restriction par rôle
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

// Middleware pour vérifier si l'utilisateur est vérifié
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

// Renvoyer l'email de vérification
exports.resendVerificationEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Email requis', 400));
  }

  // Trouver l'utilisateur
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Aucun utilisateur trouvé avec cet email', 404));
  }

  // Vérifier si l'email est déjà vérifié
  if (user.isEmailVerified) {
    return next(new AppError('Cet email est déjà vérifié', 400));
  }

  // Générer un nouveau token de vérification
  const verifyToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  try {
    // Envoyer l'email de vérification avec Gmail (URL frontend directe)
    const frontendUrl = process.env.FRONTEND_URL || 'https://harvests-khaki.vercel.app';
    const verifyURL = `${frontendUrl}/verify-email/${verifyToken}`;
    
    await new Email(user, verifyURL, req.language).sendWelcome();

    res.status(200).json({
      status: 'success',
      message: req.t ? req.t('auth.verification_email_sent') : 'Email de vérification renvoyé avec succès'
    });
  } catch (emailError) {
    // Supprimer le token si l'envoi échoue
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.error('Erreur envoi email de vérification:', emailError);
    return next(new AppError('Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.', 500));
  }
});
