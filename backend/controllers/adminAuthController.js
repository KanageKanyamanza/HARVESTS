const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id, type: 'access' }, process.env.JWT_SECRET, {
    expiresIn: '15m',
    algorithm: 'HS256',
  });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id, type: 'refresh' }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: '7d',
    algorithm: 'HS256',
  });
};

const setRefreshCookie = (res, req, refreshToken) => {
  res.cookie('adminRefreshToken', refreshToken, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'strict',
    path: '/api/v1/admin/auth/refresh',
  });
};

const createSendToken = (admin, statusCode, req, res) => {
  const token = signToken(admin._id);
  const refreshToken = signRefreshToken(admin._id);

  setRefreshCookie(res, req, refreshToken);
  res.clearCookie('jwt');

  admin.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        lastLogin: admin.lastLogin
      }
    },
  });
};

// Connexion admin
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Vérifier si email et mot de passe sont fournis
  if (!email || !password) {
    return next(new AppError('Veuillez fournir un email et un mot de passe', 400));
  }

  // 2) Vérifier si l'admin existe et le mot de passe est correct
  const admin = await Admin.findOne({ email }).select('+password +loginAttempts +accountLockedUntil');

  // Vérifier si le compte est verrouillé
  if (admin && admin.isLocked()) {
    return next(new AppError('Compte temporairement verrouillé en raison de tentatives de connexion répétées', 423));
  }

  if (!admin || !(await admin.comparePassword(password))) {
    // Incrémenter les tentatives de connexion si l'admin existe
    if (admin) {
      await admin.incLoginAttempts();
    }
    return next(new AppError('Email ou mot de passe incorrect', 401));
  }

  // 3) Vérifier si le compte est actif
  if (!admin.isActive) {
    return next(new AppError('Votre compte administrateur a été désactivé', 401));
  }

  // 4) Vérifier si l'email est vérifié
  if (!admin.isEmailVerified) {
    return next(new AppError('Veuillez vérifier votre email avant de vous connecter', 401));
  }

  // 5) Réinitialiser les tentatives de connexion et mettre à jour lastLogin
  if (admin.loginAttempts > 0) {
    await admin.resetLoginAttempts();
  }
  
  await admin.updateLastLogin();

  // 6) Envoyer le token
  createSendToken(admin, 200, req, res);
});

// Déconnexion admin
exports.logout = catchAsync(async (req, res, next) => {
  res.clearCookie('adminRefreshToken', { path: '/api/v1/admin/auth/refresh' });
  res.clearCookie('jwt');
  res.status(200).json({ status: 'success', message: 'Déconnexion réussie' });
});

// Renouvellement du token admin via refresh token
exports.refreshToken = catchAsync(async (req, res, next) => {
  const token = req.cookies.adminRefreshToken;
  if (!token) {
    return next(new AppError('Session expirée. Veuillez vous reconnecter.', 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    return next(new AppError('Session expirée. Veuillez vous reconnecter.', 401));
  }

  if (decoded.type !== 'refresh') {
    return next(new AppError('Token invalide.', 401));
  }

  const admin = await Admin.findById(decoded.id);
  if (!admin || !admin.isActive) {
    return next(new AppError('Administrateur introuvable ou inactif.', 401));
  }

  const newAccessToken = signToken(admin._id);
  const newRefreshToken = signRefreshToken(admin._id);

  setRefreshCookie(res, req, newRefreshToken);

  res.status(200).json({
    status: 'success',
    token: newAccessToken,
  });
});

// Middleware pour protéger les routes admin
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Récupérer le token
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Vous n\'êtes pas connecté. Veuillez vous connecter pour accéder à cette page.', 401));
  }

  // 2) Vérifier le token
  const decoded = await jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

  // 3) Vérifier si l'admin existe toujours
  const currentAdmin = await Admin.findById(decoded.id);
  if (!currentAdmin) {
    return next(new AppError('L\'utilisateur associé à ce token n\'existe plus.', 401));
  }

  // 4) Vérifier si le compte est toujours actif
  if (!currentAdmin.isActive) {
    return next(new AppError('Votre compte administrateur a été désactivé.', 401));
  }

  // 5) Vérifier si le mot de passe a changé après l'émission du token
  if (currentAdmin.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Mot de passe modifié récemment. Veuillez vous reconnecter.', 401));
  }

  // 6) Donner accès à la route protégée
  req.admin = currentAdmin;
  next();
});

// Middleware pour vérifier les permissions
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return next(new AppError('Vous n\'avez pas la permission d\'effectuer cette action.', 403));
    }
    next();
  };
};
