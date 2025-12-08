const User = require('../../models/User');
const Product = require('../../models/Product');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { logAudit, AUDIT_ACTIONS } = require('../../utils/auditLogger');
const adminNotifications = require('../../utils/adminNotifications');

// @desc    Obtenir tous les utilisateurs
// @route   GET /api/v1/admin/users
// @access  Admin
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search, role, status } = req.query;
  
  // Construire le filtre
  const filter = {};
  
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (role) {
    filter.userType = role;
  }
  
  if (status) {
    // Mapper les statuts textuels vers les champs de base de données
    switch (status) {
      case 'Actif':
        filter.isActive = true;
        filter.isApproved = true;
        // Note: Un utilisateur actif peut avoir son email vérifié ou non
        break;
      case 'Vérifié':
        filter.isActive = true;
        filter.isApproved = true;
        filter.isEmailVerified = true;
        break;
      case 'En attente':
        filter.isActive = true;
        filter.isApproved = false;
        break;
      case 'Banni':
        filter.isActive = false;
        break;
    }
  }

  // Pagination
  const skip = (page - 1) * limit;
  
  // Récupérer les utilisateurs
  const users = await User.find(filter)
    .select('-password -passwordResetToken -passwordResetExpires')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Mapper les utilisateurs pour ajouter un champ status textuel
  const usersWithStatus = users.map(user => {
    const userObj = user.toObject();
    
    // Déterminer le statut basé sur isActive et isApproved
    if (!userObj.isActive) {
      userObj.status = 'Banni';
    } else if (!userObj.isApproved) {
      userObj.status = 'En attente';
    } else if (userObj.isEmailVerified) {
      userObj.status = 'Vérifié';
    } else {
      userObj.status = 'Actif';
    }
    
    return userObj;
  });

  // Compter le total
  const total = await User.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      users: usersWithStatus,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

// @desc    Obtenir un utilisateur par ID
// @route   GET /api/v1/admin/users/:id
// @access  Admin
exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password -passwordResetToken -passwordResetExpires');

  if (!user) {
    return next(new AppError('Utilisateur non trouvé', 404));
  }

  // Ajouter le statut textuel
  const userObj = user.toObject();
  
  // Déterminer le statut basé sur isActive et isApproved
  if (!userObj.isActive) {
    userObj.status = 'Banni';
  } else if (!userObj.isApproved) {
    userObj.status = 'En attente';
  } else if (userObj.isEmailVerified) {
    userObj.status = 'Vérifié';
  } else {
    userObj.status = 'Actif';
  }

  res.status(200).json({
    status: 'success',
    data: { user: userObj }
  });
});

// @desc    Mettre à jour un utilisateur
// @route   PATCH /api/v1/admin/users/:id
// @access  Admin
exports.updateUser = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, phone, address, isActive, isEmailVerified, emailVerified } = req.body;
  
  // Préparer les données de mise à jour
  const updateData = { firstName, lastName, email, phone, address, isActive };
  
  // Mettre à jour le champ de vérification email
  if (isEmailVerified !== undefined) {
    updateData.isEmailVerified = isEmailVerified;
  }
  
  const user = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password -passwordResetToken -passwordResetExpires');

  if (!user) {
    return next(new AppError('Utilisateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Utilisateur mis à jour avec succès',
    data: { user }
  });
});

// @desc    Supprimer un utilisateur
// @route   DELETE /api/v1/admin/users/:id
// @access  Admin
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('Utilisateur non trouvé', 404));
  }

  const deletedUserEmail = user.email;

  // Supprimer tous les produits associés à cet utilisateur (cascade delete)
  // Les produits peuvent être associés via producer, transformer ou restaurateur
  const deletedProducts = await Product.deleteMany({
    $or: [
      { producer: user._id },
      { transformer: user._id },
      { restaurateur: user._id }
    ]
  });

  console.log(`🗑️ Suppression de ${deletedProducts.deletedCount} produit(s) associé(s) à l'utilisateur ${deletedUserEmail}`);

  // Notifier les admins avant la suppression
  adminNotifications.notifyUserDeleted({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    userType: user.userType
  }, req.admin).catch(err => {
    console.error('Erreur notification utilisateur supprimé:', err);
  });

  // Supprimer l'utilisateur
  await User.findByIdAndDelete(req.params.id);

  // Audit log
  await logAudit({
    adminId: req.admin._id,
    action: AUDIT_ACTIONS.USER_DELETED,
    targetType: 'User',
    targetId: req.params.id,
    details: { 
      deletedUserEmail,
      deletedProductsCount: deletedProducts.deletedCount
    }
  });

  res.status(200).json({
    status: 'success',
    message: `Utilisateur et ${deletedProducts.deletedCount} produit(s) supprimé(s) avec succès`
  });
});

// @desc    Bannir un utilisateur
// @route   POST /api/v1/admin/users/:id/ban
// @access  Admin
exports.banUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false, bannedAt: new Date() },
    { new: true }
  ).select('-password');

  if (!user) {
    return next(new AppError('Utilisateur non trouvé', 404));
  }

  // Notifier les admins
  adminNotifications.notifyUserBanned(user, req.admin, req.body.reason).catch(err => {
    console.error('Erreur notification utilisateur banni:', err);
  });

  // Audit log
  await logAudit({
    adminId: req.admin._id,
    action: AUDIT_ACTIONS.USER_BANNED,
    targetType: 'User',
    targetId: user._id,
    details: { bannedUserEmail: user.email, reason: req.body.reason }
  });

  res.status(200).json({
    status: 'success',
    message: 'Utilisateur banni avec succès',
    data: { user }
  });
});

// @desc    Débannir un utilisateur
// @route   POST /api/v1/admin/users/:id/unban
// @access  Admin
exports.unbanUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: true, $unset: { bannedAt: 1 } },
    { new: true }
  ).select('-password');

  if (!user) {
    return next(new AppError('Utilisateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Utilisateur débanni avec succès',
    data: { user }
  });
});

// @desc    Vérifier un utilisateur
// @route   POST /api/v1/admin/users/:id/verify
// @access  Admin
exports.verifyUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { 
      isEmailVerified: true,
      emailVerified: true, // Synchroniser les deux champs
      isApproved: true 
    },
    { new: true }
  ).select('-password');

  if (!user) {
    return next(new AppError('Utilisateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Utilisateur vérifié avec succès',
    data: { user }
  });
});

