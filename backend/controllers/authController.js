const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/User');
const Producer = require('../models/Producer');
const Transformer = require('../models/Transformer');
const Consumer = require('../models/Consumer');
const Restaurateur = require('../models/Restaurateur');
const Exporter = require('../models/Exporter');
const Transporter = require('../models/Transporter');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

// Mapping des modèles par type d'utilisateur
const userModels = {
  producer: Producer,
  transformer: Transformer,
  consumer: Consumer,
  restaurateur: Restaurateur,
  exporter: Exporter,
  transporter: Transporter
};

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
    },
  });
};

// Inscription
exports.signup = catchAsync(async (req, res, next) => {
  const { userType } = req.body;

  // Vérifier si le type d'utilisateur est valide
  if (!userModels[userType]) {
    return next(new AppError('Type d\'utilisateur invalide', 400));
  }

  // Vérifier si l'email existe déjà
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return next(new AppError('Un utilisateur avec cet email existe déjà', 400));
  }

  // Créer le nouvel utilisateur avec le bon modèle
  const UserModel = userModels[userType];
  const newUser = await UserModel.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
    userType,
    address: req.body.address,
    language: req.body.language || 'fr',
    currency: req.body.currency || 'XAF',
    // Champs spécifiques selon le type
    ...req.body.specificData
  });

  // Générer token de vérification email
  const verifyToken = newUser.createEmailVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  try {
    // Envoyer email de vérification
    const verifyURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/auth/verify-email/${verifyToken}`;

    await new Email(newUser, verifyURL).sendWelcome();

    res.status(201).json({
      status: 'success',
      message: 'Utilisateur créé avec succès! Un email de vérification a été envoyé.',
      data: {
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          userType: newUser.userType,
          isEmailVerified: newUser.isEmailVerified
        }
      }
    });
  } catch (err) {
    newUser.emailVerificationToken = undefined;
    newUser.emailVerificationExpires = undefined;
    await newUser.save({ validateBeforeSave: false });

    return next(
      new AppError('Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.', 500)
    );
  }
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

  // 3) Vérifier si l'email est vérifié
  if (!user.isEmailVerified) {
    return next(new AppError('Veuillez vérifier votre email avant de vous connecter', 401));
  }

  // 4) Vérifier si le compte est actif
  if (!user.isActive) {
    return next(new AppError('Votre compte a été désactivé. Contactez le support.', 401));
  }

  // 5) Vérifier si le compte est approuvé (pour certains types)
  if (['producer', 'transformer', 'exporter', 'transporter'].includes(user.userType) && !user.isApproved) {
    return next(new AppError('Votre compte est en attente d\'approbation', 401));
  }

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

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Email vérifié avec succès! Vous pouvez maintenant vous connecter.',
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
    const verifyURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/auth/verify-email/${verifyToken}`;

    await new Email(user, verifyURL).sendEmailVerification();

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
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/auth/reset-password/${resetToken}`;

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
    return next(new AppError('Veuillez vérifier votre email pour accéder à cette fonctionnalité', 403));
  }
  next();
};

// Middleware pour vérifier si l'utilisateur est approuvé
exports.requireApproval = (req, res, next) => {
  if (['producer', 'transformer', 'exporter', 'transporter'].includes(req.user.userType) && !req.user.isApproved) {
    return next(new AppError('Votre compte doit être approuvé pour accéder à cette fonctionnalité', 403));
  }
  next();
};
