const Admin = require('../../../models/Admin');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');
const multer = require('multer');
const { createDynamicStorage } = require('../../../config/cloudinary');

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
  const { firstName, lastName, phone, timezone, language, notificationEmail } = req.body;

  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (phone) updateData.phone = phone;
  if (timezone) updateData.timezone = timezone;
  if (language) updateData.language = language;
  if (notificationEmail !== undefined) updateData.notificationEmail = notificationEmail || null;

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

// @desc    Upload avatar admin
// @route   PATCH /api/v1/admin-management/me/avatar
// @access  Admin
exports.uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Aucun fichier fourni', 400));
  }

  // Mettre à jour l'avatar de l'admin
  const admin = await Admin.findByIdAndUpdate(
    req.admin._id,
    { avatar: req.file.path },
    { new: true, runValidators: true }
  ).select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires -twoFactorSecret');

  if (!admin) {
    return next(new AppError('Admin non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Avatar mis à jour avec succès',
    data: {
      admin
    }
  });
});

// Middleware d'upload d'avatar pour admin
exports.uploadAdminPhoto = (req, res, next) => {
  const storage = createDynamicStorage('admin', 'profile');
  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image')) {
        cb(null, true);
      } else {
        cb(new AppError('Veuillez télécharger uniquement des images!', 400), false);
      }
    }
  });
  upload.single('avatar')(req, res, next);
};

