const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Email = require('../../utils/email');
const emailQueue = require('../../services/emailQueueService');
const { logAudit, AUDIT_ACTIONS } = require('../../utils/auditLogger');
const adminNotifications = require('../../utils/adminNotifications');

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
  // Le lien pointe vers le backend qui redirigera vers la page de vérification du frontend
  const backendUrl = process.env.BACKEND_URL || process.env.API_URL || 'https://harvests.onrender.com';
  const verifyURL = `${backendUrl}/api/v1/auth/verify-email/${verifyToken}`;
  
  emailQueue.addToQueue({
    user: newUser,
    verifyURL,
    language: req.language,
    emailType: 'welcome',
    email: newUser.email
  });

  // Envoyer une notification aux admins (en arrière-plan, ne pas bloquer la réponse)
  adminNotifications.notifyNewUserAccount(newUser).catch(err => {
    console.error('Erreur lors de l\'envoi de la notification admin:', err);
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
    // Audit log échec connexion
    logAudit({
      action: AUDIT_ACTIONS.LOGIN_FAILED,
      userEmail: email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'failure',
      details: { reason: 'Invalid credentials' }
    });
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

  // Audit log connexion réussie
  logAudit({
    action: AUDIT_ACTIONS.LOGIN_SUCCESS,
    userId: user._id,
    userEmail: user.email,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    details: { userType: user.userType }
  });

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

// Exporter createSendToken pour utilisation dans d'autres contrôleurs
exports.createSendToken = createSendToken;

