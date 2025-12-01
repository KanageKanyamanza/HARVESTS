const crypto = require('crypto');
const User = require('../../models/User');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Email = require('../../utils/email');
const emailQueue = require('../../services/emailQueueService');

// Vérification email
exports.verifyEmail = catchAsync(async (req, res, next) => {
  // Log pour déboguer
  console.log('🔍 Vérification email - Token reçu:', req.params.token);
  console.log('🔍 Vérification email - Longueur du token:', req.params.token?.length);
  console.log('🔍 Vérification email - URL complète:', req.originalUrl);
  
  // Récupérer le token depuis les paramètres de route
  const token = req.params.token;
  
  // Vérifier si le token est présent
  if (!token || token.trim() === '') {
    console.error('❌ Token manquant ou vide');
    const frontendUrl = process.env.FRONTEND_URL || 'https://harvests-khaki.vercel.app';
    return res.redirect(`${frontendUrl}/verify-email?error=missing_token`);
  }
  
  // Vérifier la longueur du token (devrait être 64 caractères hex)
  if (token.length !== 64) {
    console.error(`❌ Token de longueur invalide: ${token.length} (attendu: 64)`);
    const frontendUrl = process.env.FRONTEND_URL || 'https://harvests-khaki.vercel.app';
    return res.redirect(`${frontendUrl}/verify-email?error=invalid_token_length`);
  }
  
  // 1) Récupérer l'utilisateur basé sur le token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  // Frontend URL pour redirection
  const frontendUrl = process.env.FRONTEND_URL || 'https://harvests-khaki.vercel.app';

  // 2) Si le token n'a pas expiré et qu'il y a un utilisateur, définir l'email comme vérifié
  if (!user) {
    // Rediriger vers la page de vérification avec un message d'erreur
    return res.redirect(`${frontendUrl}/verify-email?error=invalid_token&token=${token}`);
  }

  // Vérifier si l'email est déjà vérifié
  if (user.isEmailVerified) {
    // Rediriger vers la page de vérification avec un statut "déjà vérifié"
    return res.redirect(`${frontendUrl}/verify-email?status=already-verified&token=${token}`);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  
  // Pour les types d'utilisateurs qui nécessitent une approbation (producer, transformer, exporter, transporter),
  // l'approbation automatique se fait lors de la vérification de l'email (même logique que la validation admin)
  const userTypesRequiringApproval = ['producer', 'transformer', 'exporter', 'transporter'];
  if (userTypesRequiringApproval.includes(user.userType)) {
    user.isApproved = true;
  }
  
  await user.save({ validateBeforeSave: false });

  // Rediriger vers la page de vérification du frontend avec un paramètre de succès
  // L'utilisateur pourra ensuite se connecter depuis cette page
  res.redirect(`${frontendUrl}/verify-email?verified=true&token=${token}`);
});
// Renvoyer email de vérification
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
    // Le lien pointe vers le backend qui redirigera vers la page de vérification du frontend
    const backendUrl = process.env.BACKEND_URL || process.env.API_URL || 'https://harvests.onrender.com';
    const verifyURL = `${backendUrl}/api/v1/auth/verify-email/${verifyToken}`;
    
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
  // Le lien pointe vers le backend qui redirigera vers la page de vérification du frontend
  const backendUrl = process.env.BACKEND_URL || process.env.API_URL || 'https://harvests.onrender.com';
  const verifyURL = `${backendUrl}/api/v1/auth/verify-email/${verifyToken}`;
  
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

  const testEmail = new Email(testUser, 'https://www.harvests.site', req.language);
  
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

