const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../../models/User');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Email = require('../../utils/email');
const { logAudit, AUDIT_ACTIONS } = require('../../utils/auditLogger');

// Fonction pour créer et envoyer un token (dupliquée pour éviter dépendance circulaire)
const createSendToken = (user, statusCode, req, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'strict'
  };

  res.cookie('jwt', token, cookieOptions);
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
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.harvests.site';
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

  // Audit log reset password
  logAudit({
    action: AUDIT_ACTIONS.PASSWORD_RESET,
    userId: user._id,
    userEmail: user.email,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

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

