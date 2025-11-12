const Admin = require('../models/Admin');
const User = require('../models/User');
const Product = require('../models/Product');
const Restaurateur = require('../models/Restaurateur');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Message = require('../models/Message');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const crypto = require('crypto');
const { toPlainText } = require('../utils/localization');

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
  // Récupérer les vraies statistiques de la base de données
  const User = require('../models/User');
  const Admin = require('../models/Admin');
  const Producer = require('../models/Producer');
  const Consumer = require('../models/Consumer');
  const Transporter = require('../models/Transporter');
  const Product = require('../models/Product');
  const Order = require('../models/Order');
  
  // Compter les utilisateurs
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  
  // Compter les utilisateurs par type en utilisant les modèles spécifiques
  const totalProducers = await Producer.countDocuments();
  const totalConsumers = await Consumer.countDocuments();
  const totalTransporters = await Transporter.countDocuments();
  const activeAdmins = await Admin.countDocuments({ isActive: true });
  
  // Compter les produits
  const totalProducts = await Product.countDocuments();
  const pendingProducts = await Product.countDocuments({ status: 'pending-review' });
  
  // Compter les commandes
  const totalOrders = await Order.countDocuments();
  const recentOrders = await Order.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 7 derniers jours
  });
  
  // Calculer le revenu total
  const revenueResult = await Order.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
  
  // Compter les approbations en attente
  const pendingApprovals = await User.countDocuments({ 
    isApproved: false, 
    isActive: true 
  });
  
  // Calculer la croissance mensuelle (simplifié)
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const usersLastMonth = await User.countDocuments({
    createdAt: { $gte: lastMonth }
  });
  const monthlyGrowth = totalUsers > 0 ? ((usersLastMonth / totalUsers) * 100).toFixed(1) : 0;
  
  // Autres statistiques
  const pendingReviews = 0; // À implémenter quand le système de reviews sera prêt
  const unreadMessages = 0; // À implémenter quand le système de messages sera prêt

  const stats = {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    pendingApprovals,
    activeUsers,
    recentOrders,
    monthlyGrowth: parseFloat(monthlyGrowth),
    totalProducers,
    totalConsumers,
    totalTransporters,
    pendingProducts,
    pendingReviews,
    unreadMessages,
    activeAdmins
  };

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

// @desc    Obtenir les commandes récentes pour le dashboard
// @route   GET /api/v1/admin/dashboard/recent-orders
// @access  Admin
exports.getRecentOrders = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  const User = require('../models/User');
  const Product = require('../models/Product');
  
  const limit = parseInt(req.query.limit) || 10;
  
  const recentOrders = await Order.find()
    .populate('buyer', 'firstName lastName email userType')
    .populate('seller', 'firstName lastName email userType')
    .populate('items.product', 'name price images')
    .sort('-createdAt')
    .limit(limit);
  
  res.status(200).json({
    status: 'success',
    data: {
      orders: recentOrders
    }
  });
});

// @desc    Obtenir les produits en attente d'approbation
// @route   GET /api/v1/admin/dashboard/pending-products
// @access  Admin
exports.getPendingProducts = catchAsync(async (req, res, next) => {
  const Product = require('../models/Product');
  const Producer = require('../models/Producer');
  
  const limit = parseInt(req.query.limit) || 10;
  
  const pendingProducts = await Product.find({ status: 'pending-review' })
    .populate('producer', 'firstName lastName farmName email')
    .sort('-createdAt')
    .limit(limit);
  
  res.status(200).json({
    status: 'success',
    data: {
      products: pendingProducts
    }
  });
});

// @desc    Obtenir les statistiques de vente par mois
// @route   GET /api/v1/admin/dashboard/sales-chart
// @access  Admin
exports.getSalesChart = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  
  const months = parseInt(req.query.months) || 12;
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  const salesData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ['completed', 'delivered'] }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalSales: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);
  
  // Formater les données pour le graphique
  const chartData = salesData.map(item => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    sales: item.totalSales,
    orders: item.orderCount
  }));
  
  res.status(200).json({
    status: 'success',
    data: {
      chartData
    }
  });
});

// @desc    Obtenir les statistiques des utilisateurs par type
// @route   GET /api/v1/admin/dashboard/user-stats
// @access  Admin
exports.getUserStats = catchAsync(async (req, res, next) => {
  const User = require('../models/User');
  const Producer = require('../models/Producer');
  const Consumer = require('../models/Consumer');
  const Transporter = require('../models/Transporter');
  
  const months = parseInt(req.query.months) || 12;
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  // Statistiques des nouveaux utilisateurs par mois
  const newUsersByMonth = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          userType: '$userType'
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);
  
  // Statistiques par type d'utilisateur
  const userTypeStats = await Promise.all([
    Producer.aggregate([
      { $group: { _id: null, total: { $sum: 1 }, active: { $sum: { $cond: ['$isActive', 1, 0] } } } }
    ]),
    Consumer.aggregate([
      { $group: { _id: null, total: { $sum: 1 }, active: { $sum: { $cond: ['$isActive', 1, 0] } } } }
    ]),
    Transporter.aggregate([
      { $group: { _id: null, total: { $sum: 1 }, active: { $sum: { $cond: ['$isActive', 1, 0] } } } }
    ])
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      newUsersByMonth,
      userTypeStats: {
        producers: userTypeStats[0][0] || { total: 0, active: 0 },
        consumers: userTypeStats[1][0] || { total: 0, active: 0 },
        transporters: userTypeStats[2][0] || { total: 0, active: 0 }
      }
    }
  });
});

// @desc    Obtenir les top producteurs
// @route   GET /api/v1/admin/dashboard/top-producers
// @access  Admin
exports.getTopProducers = catchAsync(async (req, res, next) => {
  const Producer = require('../models/Producer');
  const Order = require('../models/Order');
  
  const limit = parseInt(req.query.limit) || 10;
  
  const topProducers = await Order.aggregate([
    {
      $match: { status: { $in: ['completed', 'delivered'] } }
    },
    {
      $group: {
        _id: '$seller',
        totalSales: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'producers',
        localField: '_id',
        foreignField: '_id',
        as: 'producer'
      }
    },
    {
      $unwind: '$producer'
    },
    {
      $project: {
        producerId: '$_id',
        producerName: { $concat: ['$producer.firstName', ' ', '$producer.lastName'] },
        farmName: '$producer.farmName',
        totalSales: 1,
        orderCount: 1
      }
    },
    {
      $sort: { totalSales: -1 }
    },
    {
      $limit: limit
    }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      producers: topProducers
    }
  });
});

// @desc    Obtenir les statistiques des produits
// @route   GET /api/v1/admin/dashboard/product-stats
// @access  Admin
exports.getProductStats = catchAsync(async (req, res, next) => {
  const Product = require('../models/Product');
  
  const productStats = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        averagePrice: { $avg: '$price' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  
  const statusStats = await Product.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      byCategory: productStats,
      byStatus: statusStats
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
    // Mapper les statuts textuels vers les champs de base de données
    switch (status) {
      case 'Actif':
        filter.isActive = true;
        filter.isApproved = true;
        filter.isEmailVerified = false;
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

exports.updateUser = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, phone, address, isActive, isEmailVerified, emailVerified } = req.body;
  
  // Préparer les données de mise à jour
  const updateData = { firstName, lastName, email, phone, address, isActive };
  
  // Synchroniser les champs de vérification email
  if (isEmailVerified !== undefined) {
    updateData.isEmailVerified = isEmailVerified;
    updateData.emailVerified = isEmailVerified;
  } else if (emailVerified !== undefined) {
    updateData.emailVerified = emailVerified;
    updateData.isEmailVerified = emailVerified;
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

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search, status, category, featured } = req.query;
  
  // Construire le filtre
  const filter = {};
  
  // Exclure les plats (originType: 'dish') de la liste des produits
  filter.$and = [
    {
      $or: [
        { originType: { $exists: false } },
        { originType: { $ne: 'dish' } }
      ]
    }
  ];
  
  if (search) {
    filter.$and.push({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ]
    });
  }
  
  if (status) {
    filter.status = status;
  }
  
  if (category) {
    filter.category = category;
  }
  
  if (featured) {
    if (featured === 'featured') {
      filter.isFeatured = true;
    } else if (featured === 'not-featured') {
      filter.isFeatured = false;
    }
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

  // Créer une notification pour le producteur
  if (product.producer) {
    const Notification = require('../models/Notification');
    
    const productName = toPlainText(product.name, 'Produit');
    const producerName = `${product.producer.firstName} ${product.producer.lastName}`;
    
    await Notification.create({
      recipient: product.producer._id,
      type: 'product_approved',
      category: 'product',
      title: 'Produit approuvé',
      message: `Votre produit "${productName}" a été approuvé et est maintenant visible sur la plateforme`,
      data: {
        productId: product._id,
        productName: productName,
        producerName: producerName,
        action: 'product_approved'
      },
      actions: [{
        type: 'view',
        label: 'Voir le produit',
        url: `/products/${product._id}`
      }],
      isRead: false,
      priority: 'medium'
    });

    console.log(`✅ Notification envoyée au producteur ${producerName} pour l'approbation du produit "${productName}"`);
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

  // Créer une notification pour le producteur
  if (product.producer) {
    const Notification = require('../models/Notification');
    
    const productName = toPlainText(product.name, 'Produit');
    const producerName = `${product.producer.firstName} ${product.producer.lastName}`;
    
    await Notification.create({
      recipient: product.producer._id,
      type: 'product_rejected',
      category: 'product',
      title: 'Produit rejeté',
      message: `Votre produit "${productName}" a été rejeté. Raison: ${reason || 'Non spécifiée'}`,
      data: {
        productId: product._id,
        productName: productName,
        producerName: producerName,
        rejectionReason: reason,
        action: 'product_rejected'
      },
      actions: [{
        type: 'edit',
        label: 'Modifier le produit',
        url: `/producer/products/${product._id}/edit`
      }],
      isRead: false,
      priority: 'high'
    });

    console.log(`❌ Notification envoyée au producteur ${producerName} pour le rejet du produit "${productName}"`);
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
      { 'buyer.firstName': { $regex: search, $options: 'i' } },
      { 'buyer.lastName': { $regex: search, $options: 'i' } },
      { 'buyer.email': { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;
  
  // Récupérer les commandes avec populate
  const orders = await Order.find(filter)
    .populate('buyer', 'firstName lastName email phone userType')
    .populate('seller', 'firstName lastName email phone farmName companyName userType')
    .populate('items.product', 'name images price')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Transformer les données pour correspondre au format attendu par le frontend
  const transformedOrders = orders.map(order => ({
    _id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.payment?.status || 'pending',
    totalAmount: order.total,
    items: order.items.map(item => {
      // Récupérer les images depuis productSnapshot ou product peuplé
      let images = [];
      if (item.productSnapshot?.images && item.productSnapshot.images.length > 0) {
        images = item.productSnapshot.images;
      } else if (item.product?.images && item.product.images.length > 0) {
        images = item.product.images;
      }
      
      return {
        product: {
          name: item.productSnapshot?.name || item.product?.name || 'Produit supprimé',
          images: images
        },
        productSnapshot: item.productSnapshot, // Garder aussi productSnapshot pour compatibilité
        quantity: item.quantity,
        price: item.unitPrice
      };
    }),
    customer: {
      firstName: order.buyer?.firstName || 'N/A',
      lastName: order.buyer?.lastName || 'N/A',
      email: order.buyer?.email || 'N/A'
    },
    producer: {
      firstName: order.seller?.firstName || 'N/A',
      lastName: order.seller?.lastName || 'N/A',
      farmName: order.seller?.farmName || order.seller?.companyName || 'N/A'
    },
    disputeReason: order.cancellationReason || null,
    createdAt: order.createdAt
  }));

  // Compter le total
  const total = await Order.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      orders: transformedOrders,
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
    .populate('buyer', 'firstName lastName email phone address userType')
    .populate('seller', 'firstName lastName email phone farmName companyName userType')
    .populate({
      path: 'items.product',
      select: 'name images description price',
      // S'assurer que les images sont bien incluses
    })
    .populate('delivery.transporter', 'firstName lastName email phone companyName');

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  // Transformer les données pour correspondre au format attendu par le frontend
  const transformedOrder = {
    _id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.payment?.status || 'pending',
    totalAmount: order.total,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    taxes: order.taxes,
    discount: order.discount,
    items: order.items.map(item => {
      // Récupérer les images depuis productSnapshot ou product peuplé
      let images = [];
      
      // Priorité 1: productSnapshot.images (données sauvegardées au moment de la commande)
      if (item.productSnapshot?.images && Array.isArray(item.productSnapshot.images) && item.productSnapshot.images.length > 0) {
        images = item.productSnapshot.images;
      } 
      // Priorité 2: product.images (produit peuplé depuis la base de données)
      else if (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
        images = item.product.images;
      }
      
      // Récupérer le nom du produit
      const productName = item.productSnapshot?.name || item.product?.name || 'Produit supprimé';
      
      return {
        product: {
          name: productName,
          images: images,
          description: item.productSnapshot?.description || item.product?.description || ''
        },
        productSnapshot: item.productSnapshot, // Garder aussi productSnapshot pour compatibilité
        quantity: item.quantity,
        price: item.unitPrice,
        totalPrice: item.totalPrice
      };
    }),
    customer: {
      firstName: order.buyer?.firstName || 'N/A',
      lastName: order.buyer?.lastName || 'N/A',
      email: order.buyer?.email || 'N/A',
      phone: order.buyer?.phone || 'N/A',
      address: order.buyer?.address || 'N/A'
    },
    producer: {
      firstName: order.seller?.firstName || 'N/A',
      lastName: order.seller?.lastName || 'N/A',
      farmName: order.seller?.farmName || order.seller?.companyName || 'N/A',
      email: order.seller?.email || 'N/A',
      phone: order.seller?.phone || 'N/A'
    },
    transporter: order.delivery?.transporter ? {
      firstName: order.delivery.transporter.firstName || 'N/A',
      lastName: order.delivery.transporter.lastName || 'N/A',
      email: order.delivery.transporter.email || 'N/A',
      phone: order.delivery.transporter.phone || 'N/A',
      companyName: order.delivery.transporter.companyName || 'N/A'
    } : null,
    disputeReason: order.cancellationReason || null,
    createdAt: order.createdAt,
    delivery: order.delivery,
    payment: order.payment,
    statusHistory: order.statusHistory
  };

  res.status(200).json({
    status: 'success',
    data: { order: transformedOrder }
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status, notes } = req.body;
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  // Utiliser la méthode du modèle pour mettre à jour le statut
  await order.updateStatus(status, req.admin._id, null, notes);

  // Récupérer la commande mise à jour avec les populations
  const updatedOrder = await Order.findById(req.params.id)
    .populate('buyer', 'firstName lastName email phone userType')
    .populate('seller', 'firstName lastName email phone farmName companyName userType')
    .populate('items.product', 'name images price');

  // Transformer les données pour correspondre au format attendu par le frontend
  const transformedOrder = {
    _id: updatedOrder._id,
    orderNumber: updatedOrder.orderNumber,
    status: updatedOrder.status,
    paymentStatus: updatedOrder.payment.status,
    totalAmount: updatedOrder.total,
    items: updatedOrder.items.map(item => ({
      product: {
        name: item.productSnapshot?.name || item.product?.name || 'Produit supprimé',
        images: item.productSnapshot?.images || item.product?.images || []
      },
      quantity: item.quantity,
      price: item.unitPrice
    })),
    customer: {
      firstName: updatedOrder.buyer?.firstName || 'N/A',
      lastName: updatedOrder.buyer?.lastName || 'N/A',
      email: updatedOrder.buyer?.email || 'N/A'
    },
    producer: {
      firstName: updatedOrder.seller?.firstName || 'N/A',
      lastName: updatedOrder.seller?.lastName || 'N/A',
      farmName: updatedOrder.seller?.farmName || updatedOrder.seller?.companyName || 'N/A'
    },
    disputeReason: updatedOrder.cancellationReason || null,
    createdAt: updatedOrder.createdAt
  };

  res.status(200).json({
    status: 'success',
    message: 'Statut de la commande mis à jour avec succès',
    data: { order: transformedOrder }
  });
});

// @desc    Mettre à jour le statut de paiement d'une commande
// @route   PATCH /api/v1/admin/orders/:id/payment-status
// @access  Admin
exports.updateOrderPaymentStatus = catchAsync(async (req, res, next) => {
  const { paymentStatus, transactionId, paidAt } = req.body;
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  // Mettre à jour le statut de paiement
  order.payment.status = paymentStatus;
  if (transactionId) order.payment.transactionId = transactionId;
  if (paidAt) order.payment.paidAt = new Date(paidAt);
  else if (paymentStatus === 'completed') order.payment.paidAt = new Date();

  await order.save();

  // Si le paiement est confirmé et la commande est en attente, la confirmer
  if (paymentStatus === 'completed' && order.status === 'pending') {
    await order.updateStatus('confirmed', req.admin._id, 'Paiement confirmé');
  }

  res.status(200).json({
    status: 'success',
    message: 'Statut de paiement mis à jour avec succès',
    data: { 
      orderId: order._id,
      paymentStatus: order.payment.status,
      paidAt: order.payment.paidAt
    }
  });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  // Utiliser la méthode du modèle pour annuler la commande
  await order.updateStatus('cancelled', req.admin._id, reason);

  // Récupérer la commande mise à jour avec les populations
  const updatedOrder = await Order.findById(req.params.id)
    .populate('buyer', 'firstName lastName email phone userType')
    .populate('seller', 'firstName lastName email phone farmName companyName userType')
    .populate('items.product', 'name images price');

  // Transformer les données pour correspondre au format attendu par le frontend
  const transformedOrder = {
    _id: updatedOrder._id,
    orderNumber: updatedOrder.orderNumber,
    status: updatedOrder.status,
    paymentStatus: updatedOrder.payment.status,
    totalAmount: updatedOrder.total,
    items: updatedOrder.items.map(item => ({
      product: {
        name: item.productSnapshot?.name || item.product?.name || 'Produit supprimé',
        images: item.productSnapshot?.images || item.product?.images || []
      },
      quantity: item.quantity,
      price: item.unitPrice
    })),
    customer: {
      firstName: updatedOrder.buyer?.firstName || 'N/A',
      lastName: updatedOrder.buyer?.lastName || 'N/A',
      email: updatedOrder.buyer?.email || 'N/A'
    },
    producer: {
      firstName: updatedOrder.seller?.firstName || 'N/A',
      lastName: updatedOrder.seller?.lastName || 'N/A',
      farmName: updatedOrder.seller?.farmName || updatedOrder.seller?.companyName || 'N/A'
    },
    disputeReason: updatedOrder.cancellationReason || null,
    createdAt: updatedOrder.createdAt
  };

  res.status(200).json({
    status: 'success',
    message: 'Commande annulée avec succès',
    data: { order: transformedOrder }
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
      { 'reviewer.firstName': { $regex: search, $options: 'i' } },
      { 'reviewer.lastName': { $regex: search, $options: 'i' } },
      { 'product.name': { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;
  
  // Récupérer les avis avec populate
  const reviews = await Review.find(filter)
    .populate('reviewer', 'firstName lastName email')
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
    .populate('reviewer', 'firstName lastName email phone')
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
  ).populate('reviewer', 'firstName lastName email')
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
  ).populate('reviewer', 'firstName lastName email')
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
  ).populate('reviewer', 'firstName lastName email')
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
  const { timeRange = '30d' } = req.query;
  
  // Calculer la période
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Récupérer les statistiques générales
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();
  
  // Calculer le revenu total
  const revenueResult = await Order.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
  
  // Statistiques de croissance
  const usersLastPeriod = await User.countDocuments({
    createdAt: { $gte: startDate }
  });
  const productsLastPeriod = await Product.countDocuments({
    createdAt: { $gte: startDate }
  });
  const ordersLastPeriod = await Order.countDocuments({
    createdAt: { $gte: startDate }
  });
  
  const userGrowth = totalUsers > 0 ? ((usersLastPeriod / totalUsers) * 100) : 0;
  const productGrowth = totalProducts > 0 ? ((productsLastPeriod / totalProducts) * 100) : 0;
  const orderGrowth = totalOrders > 0 ? ((ordersLastPeriod / totalOrders) * 100) : 0;
  
  // Données pour les graphiques
  const userRegistrations = await User.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
  
  const revenueTrends = await Order.aggregate([
    {
      $match: { 
        createdAt: { $gte: startDate },
        status: { $in: ['completed', 'delivered'] }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
  
  // Distribution par catégorie
  const categoryDistribution = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        averagePrice: { $avg: '$price' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  
  // Top producteurs
  const topProducers = await Order.aggregate([
    {
      $match: { status: { $in: ['completed', 'delivered'] } }
    },
    {
      $group: {
        _id: '$seller',
        totalSales: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'producer'
      }
    },
    {
      $unwind: '$producer'
    },
    {
      $project: {
        producerName: { $concat: ['$producer.firstName', ' ', '$producer.lastName'] },
        farmName: '$producer.farmName',
        totalSales: 1,
        orderCount: 1
      }
    },
    {
      $sort: { totalSales: -1 }
    },
    {
      $limit: 5
    }
  ]);

  // Top produits
  const topProducts = await Order.aggregate([
    {
      $match: { status: { $in: ['completed', 'delivered'] } }
    },
    {
      $unwind: '$items'
    },
    {
      $group: {
        _id: '$items.product',
        totalSales: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        totalQuantity: { $sum: '$items.quantity' },
        orderCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $unwind: '$product'
    },
    {
      $project: {
        name: '$product.name',
        price: '$product.price',
        totalSales: 1,
        totalQuantity: 1,
        orderCount: 1,
        sales: '$totalQuantity'
      }
    },
    {
      $sort: { totalSales: -1 }
    },
    {
      $limit: 5
    }
  ]);
  
  const normalizedTopProducts = topProducts.map((product) => ({
    ...product,
    name: toPlainText(product.name, 'Produit')
  }));
  
  const analytics = {
    overview: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      userGrowth: parseFloat(userGrowth.toFixed(1)),
      productGrowth: parseFloat(productGrowth.toFixed(1)),
      orderGrowth: parseFloat(orderGrowth.toFixed(1)),
      revenueGrowth: 0 // À calculer si nécessaire
    },
    charts: {
      userRegistrations,
      productCreations: [], // À implémenter si nécessaire
      orderTrends: revenueTrends,
      revenueTrends,
      categoryDistribution,
      topProducers,
      topProducts: normalizedTopProducts
    }
  };
  
  res.status(200).json({
    status: 'success',
    data: { analytics }
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

// ========================================
// GESTION DES PLATS (RESTAURATEURS)
// ========================================

exports.getAllDishes = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search, status } = req.query;

  const parsedLimit = Math.max(parseInt(limit) || 10, 1);
  const skip = (Math.max(parseInt(page) || 1, 1) - 1) * parsedLimit;

  // Construire la requête de base pour Product
  const query = {
    originType: 'dish',
    userType: 'restaurateur'
  };

  if (status) {
    query.status = status;
  }

  if (search) {
    const regex = new RegExp(search, 'i');
    query.$or = [
      { name: regex },
      { description: regex },
      { shortDescription: regex }
    ];
  }

  // Compter le total
  const total = await Product.countDocuments(query);

  // Récupérer les produits avec les images
  const products = await Product.find(query)
    .select('name description price images primaryImage image dishInfo status isActive createdAt restaurateur')
    .populate('restaurateur', 'restaurantName firstName lastName email')
    .sort('-createdAt')
    .skip(skip)
    .limit(parsedLimit);

  // Formater pour compatibilité avec le frontend
  const dishes = products.map(product => {
    // Extraire l'image principale - gérer différents formats
    let imageUrl = null;
    
    // Vérifier d'abord si product.images existe et est un tableau
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      // Si c'est un objet avec une propriété url
      if (typeof firstImage === 'object' && firstImage !== null) {
        imageUrl = firstImage.url || firstImage.src || null;
      } 
      // Si c'est directement une string URL
      else if (typeof firstImage === 'string') {
        imageUrl = firstImage;
      }
    }
    // Fallback sur primaryImage
    else if (product.primaryImage) {
      if (typeof product.primaryImage === 'object' && product.primaryImage.url) {
        imageUrl = product.primaryImage.url;
      } else if (typeof product.primaryImage === 'string') {
        imageUrl = product.primaryImage;
      }
    }
    // Fallback sur image directe
    else if (typeof product.image === 'string') {
      imageUrl = product.image;
    }

    return {
      _id: product._id,
      name: toPlainText(product.name, ''),
      description: toPlainText(product.description, ''),
      price: product.price,
      image: imageUrl,
      images: product.images || [],
      category: product.dishInfo?.category || product.category,
      status: product.status,
      isAvailable: product.isActive,
      preparationTime: product.dishInfo?.preparationTime,
      allergens: product.dishInfo?.allergens || [],
      createdAt: product.createdAt,
      restaurateur: product.restaurateur ? {
        _id: product.restaurateur._id,
        restaurantName: product.restaurateur.restaurantName,
        firstName: product.restaurateur.firstName,
        lastName: product.restaurateur.lastName,
        email: product.restaurateur.email
      } : null
    };
  });

  const totalPages = Math.max(Math.ceil(total / parsedLimit), 1);

  res.status(200).json({
    status: 'success',
    data: {
      dishes,
      pagination: {
        currentPage: Math.max(parseInt(page) || 1, 1),
        totalPages,
        totalDishes: total,
        hasNext: Math.max(parseInt(page) || 1, 1) < totalPages,
        hasPrev: Math.max(parseInt(page) || 1, 1) > 1
      }
    }
  });
});

exports.getDishById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Rechercher directement dans Product
  const product = await Product.findOne({
    _id: id,
    originType: 'dish',
    userType: 'restaurateur'
  }).populate('restaurateur', 'restaurantName firstName lastName email');
  
  if (!product) {
    return next(new AppError('Plat non trouvé', 404));
  }
  
  // Formater pour compatibilité avec le frontend
  const dish = {
    _id: product._id,
    name: toPlainText(product.name, ''),
    description: toPlainText(product.description, ''),
    price: product.price,
    image: product.images?.[0]?.url,
    category: product.dishInfo?.category,
    status: product.status,
    isAvailable: product.isActive,
    preparationTime: product.dishInfo?.preparationTime,
    allergens: product.dishInfo?.allergens || [],
    createdAt: product.createdAt,
    restaurateur: product.restaurateur ? {
      _id: product.restaurateur._id,
      restaurantName: product.restaurateur.restaurantName,
      firstName: product.restaurateur.firstName,
      lastName: product.restaurateur.lastName,
      email: product.restaurateur.email
    } : null
  };
  
  res.status(200).json({
    status: 'success',
    data: { dish }
  });
});

exports.updateDish = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Rechercher directement dans Product
  const product = await Product.findOne({
    _id: id,
    originType: 'dish',
    userType: 'restaurateur'
  });
  
  if (!product) {
    return next(new AppError('Plat non trouvé', 404));
  }
  
  // Filtrer les champs à mettre à jour
  const allowedFields = ['name', 'description', 'shortDescription', 'price', 'images', 'dishInfo', 'isActive'];
  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key) && key !== '_id' && key !== 'restaurateur') {
      if (['name', 'description', 'shortDescription'].includes(key)) {
        product[key] = toPlainText(updates[key], product[key]);
      } else {
      product[key] = updates[key];
      }
    }
  });
  
  await product.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Plat mis à jour avec succès',
    data: { dish: product }
  });
});

exports.deleteDish = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Supprimer directement depuis Product
  const product = await Product.findOneAndDelete({
    _id: id,
    originType: 'dish',
    userType: 'restaurateur'
  });
  
  if (!product) {
    return next(new AppError('Plat non trouvé', 404));
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Plat supprimé avec succès'
  });
});

exports.approveDish = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Approuver directement dans Product
  const product = await Product.findOneAndUpdate(
    {
      _id: id,
      originType: 'dish',
      userType: 'restaurateur'
    },
    {
      status: 'approved',
      isActive: true,
      approvedAt: new Date(),
      $unset: { rejectionReason: 1 }
    },
    { new: true }
  ).populate('restaurateur', 'restaurantName firstName lastName email');
  
  if (!product) {
    return next(new AppError('Plat non trouvé', 404));
  }
  
  // Notification (optionnel)
  // ...
  
  res.status(200).json({
    status: 'success',
    message: 'Plat approuvé avec succès',
    data: { dish: product }
  });
});

exports.rejectDish = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  
  if (!reason) {
    return next(new AppError('Raison du rejet requise', 400));
  }
  
  // Rejeter directement dans Product
  const product = await Product.findOneAndUpdate(
    {
      _id: req.params.id,
      originType: 'dish',
      userType: 'restaurateur'
    },
    {
      status: 'rejected',
      isActive: false,
      rejectionReason: reason,
      $unset: { approvedAt: 1 }
    },
    { new: true }
  ).populate('restaurateur', 'restaurantName firstName lastName email');
  
  if (!product) {
    return next(new AppError('Plat non trouvé', 404));
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Plat rejeté avec succès',
    data: { dish: product }
  });
});
