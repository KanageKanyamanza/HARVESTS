const Admin = require('../models/Admin');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Message = require('../models/Message');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const crypto = require('crypto');

// Fonction pour créer un token JWT
const createSendToken = (admin, statusCode, req, res) => {
  const token = require('jsonwebtoken').sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  // Options des cookies
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'strict'
  };

  res.cookie('jwt', token, cookieOptions);

  // Supprimer le mot de passe de la sortie
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
        department: admin.department,
        permissions: admin.permissions,
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt
      }
    }
  });
};

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

// ========================================
// MÉTHODES POUR LE DASHBOARD ET STATISTIQUES
// ========================================

// @desc    Obtenir les statistiques du dashboard
// @route   GET /api/v1/admin/dashboard/stats
// @access  Admin
exports.getDashboardStats = catchAsync(async (req, res, next) => {
  // Statistiques simulées pour l'instant
  const stats = {
    totalUsers: 1247,
    totalProducts: 89,
    totalOrders: 342,
    totalRevenue: 45678,
    pendingApprovals: 12,
    activeUsers: 892,
    recentOrders: 23,
    monthlyGrowth: 15.3
  };

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

// ========================================
// GESTION DES UTILISATEURS
// ========================================

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
    filter.isActive = status === 'active';
  }

  // Pagination
  const skip = (page - 1) * limit;
  
  // Récupérer les utilisateurs
  const users = await User.find(filter)
    .select('-password -passwordResetToken -passwordResetExpires')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Compter le total
  const total = await User.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      users,
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

exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password -passwordResetToken -passwordResetExpires');

  if (!user) {
    return next(new AppError('Utilisateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, phone, address, isActive } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { firstName, lastName, email, phone, address, isActive },
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

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  
  if (!user) {
    return next(new AppError('Utilisateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Utilisateur supprimé avec succès'
  });
});

exports.banUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false, bannedAt: new Date() },
    { new: true }
  ).select('-password');

  if (!user) {
    return next(new AppError('Utilisateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Utilisateur banni avec succès',
    data: { user }
  });
});

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

exports.verifyUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isEmailVerified: true },
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

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search, status, category } = req.query;
  
  // Construire le filtre
  const filter = {};
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (status) {
    filter.status = status;
  }
  
  if (category) {
    filter.category = category;
  }

  // Pagination
  const skip = (page - 1) * limit;
  
  // Récupérer les produits avec populate du producteur
  const products = await Product.find(filter)
    .populate('producer', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Compter le total
  const total = await Product.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

exports.getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('producer', 'firstName lastName email phone address');

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { product }
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const { name, description, price, category, stock, status } = req.body;
  
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { name, description, price, category, stock, status },
    { new: true, runValidators: true }
  ).populate('producer', 'firstName lastName email');

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Produit mis à jour avec succès',
    data: { product }
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  
  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Produit supprimé avec succès'
  });
});

exports.approveProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { status: 'approved', approvedAt: new Date() },
    { new: true }
  ).populate('producer', 'firstName lastName email');

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Produit approuvé avec succès',
    data: { product }
  });
});

exports.rejectProduct = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { 
      status: 'rejected', 
      rejectedAt: new Date(),
      rejectionReason: reason 
    },
    { new: true }
  ).populate('producer', 'firstName lastName email');

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Produit rejeté avec succès',
    data: { product }
  });
});

exports.featureProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isFeatured: true, featuredAt: new Date() },
    { new: true }
  ).populate('producer', 'firstName lastName email');

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Produit mis en vedette avec succès',
    data: { product }
  });
});

exports.unfeatureProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isFeatured: false, $unset: { featuredAt: 1 } },
    { new: true }
  ).populate('producer', 'firstName lastName email');

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Produit retiré de la vedette avec succès',
    data: { product }
  });
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status, search } = req.query;
  
  // Construire le filtre
  const filter = {};
  
  if (status) {
    filter.status = status;
  }
  
  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'customer.firstName': { $regex: search, $options: 'i' } },
      { 'customer.lastName': { $regex: search, $options: 'i' } },
      { 'customer.email': { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;
  
  // Récupérer les commandes avec populate
  const orders = await Order.find(filter)
    .populate('customer', 'firstName lastName email phone')
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Compter le total
  const total = await Order.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

exports.getOrderById = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'firstName lastName email phone address')
    .populate('items.product', 'name images description')
    .populate('transporter', 'firstName lastName email phone');

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { order }
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status, notes } = req.body;
  
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { 
      status, 
      statusHistory: { 
        $push: { 
          status, 
          timestamp: new Date(), 
          notes: notes || '' 
        } 
      }
    },
    { new: true }
  ).populate('customer', 'firstName lastName email');

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Statut de la commande mis à jour avec succès',
    data: { order }
  });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { 
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: reason,
      statusHistory: { 
        $push: { 
          status: 'cancelled', 
          timestamp: new Date(), 
          notes: reason || 'Commande annulée' 
        } 
      }
    },
    { new: true }
  ).populate('customer', 'firstName lastName email');

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Commande annulée avec succès',
    data: { order }
  });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status, search } = req.query;
  
  // Construire le filtre
  const filter = {};
  
  if (status) {
    filter.status = status;
  }
  
  if (search) {
    filter.$or = [
      { comment: { $regex: search, $options: 'i' } },
      { 'customer.firstName': { $regex: search, $options: 'i' } },
      { 'customer.lastName': { $regex: search, $options: 'i' } },
      { 'product.name': { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;
  
  // Récupérer les avis avec populate
  const reviews = await Review.find(filter)
    .populate('customer', 'firstName lastName email')
    .populate('product', 'name images')
    .populate('producer', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Compter le total
  const total = await Review.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

exports.getReviewById = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate('customer', 'firstName lastName email phone')
    .populate('product', 'name images description')
    .populate('producer', 'firstName lastName email phone');

  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { review }
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const { status, adminNotes } = req.body;
  
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { status, adminNotes },
    { new: true }
  ).populate('customer', 'firstName lastName email')
   .populate('product', 'name images');

  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Avis mis à jour avec succès',
    data: { review }
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  
  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Avis supprimé avec succès'
  });
});

exports.approveReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { status: 'approved', approvedAt: new Date() },
    { new: true }
  ).populate('customer', 'firstName lastName email')
   .populate('product', 'name images');

  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Avis approuvé avec succès',
    data: { review }
  });
});

exports.rejectReview = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { 
      status: 'rejected', 
      rejectedAt: new Date(),
      rejectionReason: reason 
    },
    { new: true }
  ).populate('customer', 'firstName lastName email')
   .populate('product', 'name images');

  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Avis rejeté avec succès',
    data: { review }
  });
});

exports.getAllMessages = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status, search } = req.query;
  
  // Construire le filtre
  const filter = {};
  
  if (status) {
    filter.isRead = status === 'read';
  }
  
  if (search) {
    filter.$or = [
      { content: { $regex: search, $options: 'i' } },
      { 'sender.firstName': { $regex: search, $options: 'i' } },
      { 'sender.lastName': { $regex: search, $options: 'i' } },
      { 'sender.email': { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;
  
  // Récupérer les messages avec populate
  const messages = await Message.find(filter)
    .populate('sender', 'firstName lastName email avatar')
    .populate('recipient', 'firstName lastName email avatar')
    .populate('conversation', 'title type')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Compter le total
  const total = await Message.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

exports.getMessageById = catchAsync(async (req, res, next) => {
  const message = await Message.findById(req.params.id)
    .populate('sender', 'firstName lastName email phone avatar')
    .populate('recipient', 'firstName lastName email phone avatar')
    .populate('conversation', 'title type participants')
    .populate('attachments.product', 'name images');

  if (!message) {
    return next(new AppError('Message non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { message }
  });
});

exports.replyToMessage = catchAsync(async (req, res, next) => {
  const { content, messageType = 'text' } = req.body;
  const originalMessage = await Message.findById(req.params.id);
  
  if (!originalMessage) {
    return next(new AppError('Message original non trouvé', 404));
  }

  // Créer la réponse
  const reply = await Message.create({
    content,
    messageType,
    sender: req.admin._id,
    recipient: originalMessage.sender,
    conversation: originalMessage.conversation,
    isReply: true,
    originalMessage: originalMessage._id
  });

  // Marquer le message original comme lu
  await Message.findByIdAndUpdate(req.params.id, { isRead: true });

  const populatedReply = await Message.findById(reply._id)
    .populate('sender', 'firstName lastName email avatar')
    .populate('recipient', 'firstName lastName email avatar');

  res.status(201).json({
    status: 'success',
    message: 'Réponse envoyée avec succès',
    data: { message: populatedReply }
  });
});

exports.markAsRead = catchAsync(async (req, res, next) => {
  const message = await Message.findByIdAndUpdate(
    req.params.id,
    { isRead: true, readAt: new Date() },
    { new: true }
  ).populate('sender', 'firstName lastName email');

  if (!message) {
    return next(new AppError('Message non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Message marqué comme lu',
    data: { message }
  });
});

exports.deleteMessage = catchAsync(async (req, res, next) => {
  const message = await Message.findByIdAndDelete(req.params.id);
  
  if (!message) {
    return next(new AppError('Message non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Message supprimé avec succès'
  });
});

exports.getAllPayments = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement',
    data: { payments: [] }
  });
});

exports.getPaymentById = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement',
    data: { payment: null }
  });
});

exports.updatePaymentStatus = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement'
  });
});

exports.refundPayment = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement'
  });
});

exports.getAllDeliveries = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement',
    data: { deliveries: [] }
  });
});

exports.getDeliveryById = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement',
    data: { delivery: null }
  });
});

exports.updateDeliveryStatus = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement'
  });
});

exports.assignTransporter = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement'
  });
});

exports.getAnalytics = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement',
    data: { analytics: {} }
  });
});

exports.getReports = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement',
    data: { reports: [] }
  });
});

exports.exportData = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement'
  });
});

exports.getSystemSettings = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement',
    data: { settings: {} }
  });
});

exports.updateSystemSettings = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement'
  });
});
