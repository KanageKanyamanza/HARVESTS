const Admin = require('../../models/Admin');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { logAudit, AUDIT_ACTIONS } = require('../../utils/auditLogger');

// @desc    Créer un nouvel administrateur
// @route   POST /api/v1/admin/admins
// @access  Super Admin, Admin
exports.createAdmin = catchAsync(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    role = 'moderator',
    department = 'support',
    phone,
    permissions
  } = req.body;

  // Vérifier si l'admin existe déjà
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return next(new AppError('Un administrateur avec cet email existe déjà', 400));
  }

  // Obtenir les permissions par défaut si non fournies
  const defaultPermissions = Admin.getDefaultPermissions(role);
  const adminPermissions = permissions || defaultPermissions;

  // Créer l'admin
  const admin = await Admin.create({
    firstName,
    lastName,
    email,
    password,
    role,
    department,
    phone,
    permissions: adminPermissions,
    createdBy: req.admin._id
  });

  // Log audit
  await logAudit({
    adminId: req.admin._id,
    action: AUDIT_ACTIONS.ADMIN_CREATED,
    targetType: 'admin',
    targetId: admin._id,
    details: { email: admin.email, role: admin.role }
  });

  res.status(201).json({
    status: 'success',
    message: 'Administrateur créé avec succès',
    data: {
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        department: admin.department,
        permissions: admin.permissions,
        isActive: admin.isActive,
        createdAt: admin.createdAt
      }
    }
  });
});

// @desc    Obtenir tous les administrateurs
// @route   GET /api/v1/admin/admins
// @access  Super Admin, Admin
exports.getAllAdmins = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    role,
    department,
    isActive,
    search
  } = req.query;

  // Construire le filtre
  const filter = {};
  
  if (role) filter.role = role;
  if (department) filter.department = department;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;
  
  const admins = await Admin.find(filter)
    .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires -twoFactorSecret')
    .populate('createdBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Admin.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: admins.length,
    total,
    data: {
      admins
    }
  });
});

// @desc    Obtenir un administrateur par ID
// @route   GET /api/v1/admin/admins/:id
// @access  Super Admin, Admin
exports.getAdmin = catchAsync(async (req, res, next) => {
  const admin = await Admin.findById(req.params.id)
    .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires -twoFactorSecret')
    .populate('createdBy', 'firstName lastName email');

  if (!admin) {
    return next(new AppError('Administrateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      admin
    }
  });
});

// @desc    Mettre à jour un administrateur
// @route   PUT /api/v1/admin/admins/:id
// @access  Super Admin, Admin
exports.updateAdmin = catchAsync(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    role,
    department,
    phone,
    permissions,
    isActive
  } = req.body;

  const admin = await Admin.findById(req.params.id);
  if (!admin) {
    return next(new AppError('Administrateur non trouvé', 404));
  }

  // Vérifier les permissions
  if (req.admin.role !== 'super-admin' && req.admin._id.toString() !== req.params.id) {
    return next(new AppError('Vous ne pouvez modifier que votre propre profil', 403));
  }

  // Vérifier si l'email est déjà utilisé par un autre admin
  if (email && email !== admin.email) {
    const existingAdmin = await Admin.findOne({ email, _id: { $ne: req.params.id } });
    if (existingAdmin) {
      return next(new AppError('Cet email est déjà utilisé par un autre administrateur', 400));
    }
  }

  // Mettre à jour les champs
  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;
  if (department) updateData.department = department;
  if (isActive !== undefined) updateData.isActive = isActive;

  // Seuls les super-admin peuvent changer le rôle et les permissions
  if (req.admin.role === 'super-admin') {
    if (role) updateData.role = role;
    if (permissions) updateData.permissions = permissions;
  }

  const updatedAdmin = await Admin.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires -twoFactorSecret');

  // Log audit
  await logAudit({
    adminId: req.admin._id,
    action: AUDIT_ACTIONS.ADMIN_UPDATED,
    targetType: 'admin',
    targetId: updatedAdmin._id,
    details: updateData
  });

  res.status(200).json({
    status: 'success',
    message: 'Administrateur mis à jour avec succès',
    data: {
      admin: updatedAdmin
    }
  });
});

// @desc    Supprimer un administrateur
// @route   DELETE /api/v1/admin/admins/:id
// @access  Super Admin
exports.deleteAdmin = catchAsync(async (req, res, next) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) {
    return next(new AppError('Administrateur non trouvé', 404));
  }

  // Empêcher la suppression de son propre compte
  if (req.admin._id.toString() === req.params.id) {
    return next(new AppError('Vous ne pouvez pas supprimer votre propre compte', 400));
  }

  // Empêcher la suppression du dernier super-admin
  if (admin.role === 'super-admin') {
    const superAdminCount = await Admin.countDocuments({ role: 'super-admin' });
    if (superAdminCount <= 1) {
      return next(new AppError('Impossible de supprimer le dernier super-administrateur', 400));
    }
  }

  await Admin.findByIdAndDelete(req.params.id);

  // Log audit
  await logAudit({
    adminId: req.admin._id,
    action: AUDIT_ACTIONS.ADMIN_DELETED,
    targetType: 'admin',
    targetId: admin._id,
    details: { email: admin.email }
  });

  res.status(204).json({
    status: 'success',
    message: 'Administrateur supprimé avec succès'
  });
});

// @desc    Changer le mot de passe d'un administrateur
// @route   PUT /api/v1/admin/admins/:id/password
// @access  Super Admin, Admin (propre compte)
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const admin = await Admin.findById(req.params.id).select('+password');
  if (!admin) {
    return next(new AppError('Administrateur non trouvé', 404));
  }

  // Vérifier les permissions
  if (req.admin.role !== 'super-admin' && req.admin._id.toString() !== req.params.id) {
    return next(new AppError('Vous ne pouvez modifier que votre propre mot de passe', 403));
  }

  // Vérifier le mot de passe actuel (sauf pour les super-admin)
  if (req.admin.role !== 'super-admin') {
    if (!currentPassword) {
      return next(new AppError('Veuillez fournir votre mot de passe actuel', 400));
    }

    if (!(await admin.comparePassword(currentPassword))) {
      return next(new AppError('Mot de passe actuel incorrect', 400));
    }
  }

  // Mettre à jour le mot de passe
  admin.password = newPassword;
  admin.lastPasswordChange = new Date();
  await admin.save();

  res.status(200).json({
    status: 'success',
    message: 'Mot de passe modifié avec succès'
  });
});

// @desc    Activer/Désactiver un administrateur
// @route   PUT /api/v1/admin/admins/:id/toggle-status
// @access  Super Admin, Admin
exports.toggleAdminStatus = catchAsync(async (req, res, next) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) {
    return next(new AppError('Administrateur non trouvé', 404));
  }

  // Empêcher la désactivation de son propre compte
  if (req.admin._id.toString() === req.params.id) {
    return next(new AppError('Vous ne pouvez pas désactiver votre propre compte', 400));
  }

  admin.isActive = !admin.isActive;
  await admin.save();

  // Log audit
  await logAudit({
    adminId: req.admin._id,
    action: admin.isActive ? AUDIT_ACTIONS.ADMIN_ACTIVATED : AUDIT_ACTIONS.ADMIN_DEACTIVATED,
    targetType: 'admin',
    targetId: admin._id,
    details: { email: admin.email, isActive: admin.isActive }
  });

  res.status(200).json({
    status: 'success',
    message: `Administrateur ${admin.isActive ? 'activé' : 'désactivé'} avec succès`,
    data: {
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        isActive: admin.isActive
      }
    }
  });
});

// @desc    Obtenir les statistiques des administrateurs
// @route   GET /api/v1/admin/admins/stats
// @access  Super Admin, Admin
exports.getAdminStats = catchAsync(async (req, res, next) => {
  const stats = await Admin.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        inactive: {
          $sum: { $cond: ['$isActive', 0, 1] }
        },
        byRole: {
          $push: {
            role: '$role',
            isActive: '$isActive'
          }
        }
      }
    },
    {
      $project: {
        total: 1,
        active: 1,
        inactive: 1,
        superAdmins: {
          $size: {
            $filter: {
              input: '$byRole',
              cond: { $eq: ['$$this.role', 'super-admin'] }
            }
          }
        },
        admins: {
          $size: {
            $filter: {
              input: '$byRole',
              cond: { $eq: ['$$this.role', 'admin'] }
            }
          }
        },
        moderators: {
          $size: {
            $filter: {
              input: '$byRole',
              cond: { $eq: ['$$this.role', 'moderator'] }
            }
          }
        },
        support: {
          $size: {
            $filter: {
              input: '$byRole',
              cond: { $eq: ['$$this.role', 'support'] }
            }
          }
        }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || {
        total: 0,
        active: 0,
        inactive: 0,
        superAdmins: 0,
        admins: 0,
        moderators: 0,
        support: 0
      }
    }
  });
});

// @desc    Obtenir le profil de l'administrateur connecté
// @route   GET /api/v1/admin/me
// @access  Admin
exports.getMe = catchAsync(async (req, res, next) => {
  const admin = await Admin.findById(req.admin._id)
    .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires -twoFactorSecret')
    .populate('createdBy', 'firstName lastName email');

  res.status(200).json({
    status: 'success',
    data: {
      admin
    }
  });
});

// @desc    Mettre à jour le profil de l'administrateur connecté
// @route   PUT /api/v1/admin/me
// @access  Admin
exports.updateMe = catchAsync(async (req, res, next) => {
  const { firstName, lastName, phone, timezone, language } = req.body;

  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (phone) updateData.phone = phone;
  if (timezone) updateData.timezone = timezone;
  if (language) updateData.language = language;

  const admin = await Admin.findByIdAndUpdate(
    req.admin._id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires -twoFactorSecret');

  res.status(200).json({
    status: 'success',
    message: 'Profil mis à jour avec succès',
    data: {
      admin
    }
  });
});

