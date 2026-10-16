const crypto = require('crypto');
const User = require('../../models/User');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Email = require('../../utils/email');
const { logAudit, AUDIT_ACTIONS } = require('../../utils/auditLogger');

// Jour 59 (sécurité) : même émission de jetons que la connexion (access 15 min +
// refresh 7 j en cookie httpOnly). La copie locale émettait l'ancien jeton longue
// durée (JWT_EXPIRES_IN, cookie `jwt`). authController n'importe pas ce fichier :
// pas de dépendance circulaire.
const { createSendToken } = require('./authController');

// Mot de passe oublié
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Récupérer l'utilisateur basé sur l'email
  const user = await User.findOne({ email: req.body.email });

  // Réponse identique que l'email existe ou non (anti-énumération)
  const sendNeutralResponse = () =>
    res.status(200).json({
      status: 'success',
      message: req.t('auth.password_reset_neutral'),
    });

  if (!user) return sendNeutralResponse();

  // 2) Générer le token de reset aléatoire
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    // 3) Envoyer à l'email de l'utilisateur
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.harvests.site';
    const resetURL = `${frontendUrl}/reset-password/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    return sendNeutralResponse();
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('auth.email_send_error', 500)
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
    return next(new AppError('auth.reset_token_invalid', 400));
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
    return next(new AppError('auth.current_password_incorrect', 401));
  }

  // 3) Si oui, mettre à jour le mot de passe
  user.password = req.body.password;
  await user.save();

  // 4) Connecter l'utilisateur, envoyer JWT
  createSendToken(user, 200, req, res);
});

