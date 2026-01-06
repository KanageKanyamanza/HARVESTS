const Admin = require("../../../models/Admin");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/appError");
const { logAudit, AUDIT_ACTIONS } = require("../../../utils/auditLogger");

// @desc    Créer un nouvel administrateur
// @route   POST /api/v1/admin/admins
// @access  Super Admin, Admin
exports.createAdmin = catchAsync(async (req, res, next) => {
	const {
		firstName,
		lastName,
		email,
		password,
		role = "moderator",
		department = "support",
		phone,
		avatar,
		permissions,
	} = req.body;

	// Vérifier si l'admin existe déjà
	const existingAdmin = await Admin.findOne({ email });
	if (existingAdmin) {
		return next(
			new AppError("Un administrateur avec cet email existe déjà", 400)
		);
	}

	// Obtenir les permissions par défaut si non fournies
	const defaultPermissions = Admin.getDefaultPermissions(role);
	const adminPermissions = permissions || defaultPermissions;

	// Créer l'admin avec email vérifié automatiquement
	// (les admins créés depuis le dashboard sont considérés comme vérifiés)
	const admin = await Admin.create({
		firstName,
		lastName,
		email,
		password,
		role,
		department,
		phone,
		avatar,
		permissions: adminPermissions,
		createdBy: req.admin._id,
		isEmailVerified: true, // Auto-vérifier l'email pour les admins créés depuis le dashboard
	});

	// Log audit
	await logAudit({
		adminId: req.admin._id,
		action: AUDIT_ACTIONS.ADMIN_CREATED,
		targetType: "admin",
		targetId: admin._id,
		details: { email: admin.email, role: admin.role },
	});

	res.status(201).json({
		status: "success",
		message: "Administrateur créé avec succès",
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
				avatar: admin.avatar,
				createdAt: admin.createdAt,
			},
		},
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
		search,
	} = req.query;

	// Construire le filtre
	const filter = {};

	if (role) filter.role = role;
	if (department) filter.department = department;
	if (isActive !== undefined) filter.isActive = isActive === "true";

	if (search) {
		filter.$or = [
			{ firstName: { $regex: search, $options: "i" } },
			{ lastName: { $regex: search, $options: "i" } },
			{ email: { $regex: search, $options: "i" } },
		];
	}

	// Pagination
	const skip = (page - 1) * limit;

	const admins = await Admin.find(filter)
		.select(
			"-password -emailVerificationToken -passwordResetToken -passwordResetExpires -twoFactorSecret"
		)
		.populate("createdBy", "firstName lastName email")
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(parseInt(limit));

	const total = await Admin.countDocuments(filter);

	res.status(200).json({
		status: "success",
		results: admins.length,
		total,
		data: {
			admins,
		},
	});
});

// @desc    Obtenir un administrateur par ID
// @route   GET /api/v1/admin/admins/:id
// @access  Super Admin, Admin
exports.getAdmin = catchAsync(async (req, res, next) => {
	const admin = await Admin.findById(req.params.id)
		.select(
			"-password -emailVerificationToken -passwordResetToken -passwordResetExpires -twoFactorSecret"
		)
		.populate("createdBy", "firstName lastName email");

	if (!admin) {
		return next(new AppError("Administrateur non trouvé", 404));
	}

	res.status(200).json({
		status: "success",
		data: {
			admin,
		},
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
		avatar,
		permissions,
		isActive,
	} = req.body;

	const admin = await Admin.findById(req.params.id);
	if (!admin) {
		return next(new AppError("Administrateur non trouvé", 404));
	}

	// Vérifier les permissions
	if (
		req.admin.role !== "super-admin" &&
		req.admin._id.toString() !== req.params.id
	) {
		return next(
			new AppError("Vous ne pouvez modifier que votre propre profil", 403)
		);
	}

	// Vérifier si l'email est déjà utilisé par un autre admin
	if (email && email !== admin.email) {
		const existingAdmin = await Admin.findOne({
			email,
			_id: { $ne: req.params.id },
		});
		if (existingAdmin) {
			return next(
				new AppError(
					"Cet email est déjà utilisé par un autre administrateur",
					400
				)
			);
		}
	}

	// Mettre à jour les champs
	const updateData = {};
	if (firstName) updateData.firstName = firstName;
	if (lastName) updateData.lastName = lastName;
	if (email) updateData.email = email;
	if (phone) updateData.phone = phone;
	if (avatar !== undefined) updateData.avatar = avatar;
	if (department) updateData.department = department;
	if (isActive !== undefined) updateData.isActive = isActive;

	// Seuls les super-admin peuvent changer le rôle et les permissions
	if (req.admin.role === "super-admin") {
		if (role) updateData.role = role;
		if (permissions) updateData.permissions = permissions;
	}

	const updatedAdmin = await Admin.findByIdAndUpdate(
		req.params.id,
		updateData,
		{ new: true, runValidators: true }
	).select(
		"-password -emailVerificationToken -passwordResetToken -passwordResetExpires -twoFactorSecret"
	);

	// Log audit
	await logAudit({
		adminId: req.admin._id,
		action: AUDIT_ACTIONS.ADMIN_UPDATED,
		targetType: "admin",
		targetId: updatedAdmin._id,
		details: updateData,
	});

	res.status(200).json({
		status: "success",
		message: "Administrateur mis à jour avec succès",
		data: {
			admin: updatedAdmin,
		},
	});
});

// @desc    Supprimer un administrateur
// @route   DELETE /api/v1/admin/admins/:id
// @access  Super Admin
exports.deleteAdmin = catchAsync(async (req, res, next) => {
	const admin = await Admin.findById(req.params.id);
	if (!admin) {
		return next(new AppError("Administrateur non trouvé", 404));
	}

	// Empêcher la suppression de son propre compte
	if (req.admin._id.toString() === req.params.id) {
		return next(
			new AppError("Vous ne pouvez pas supprimer votre propre compte", 400)
		);
	}

	// Empêcher la suppression du dernier super-admin
	if (admin.role === "super-admin") {
		const superAdminCount = await Admin.countDocuments({ role: "super-admin" });
		if (superAdminCount <= 1) {
			return next(
				new AppError(
					"Impossible de supprimer le dernier super-administrateur",
					400
				)
			);
		}
	}

	await Admin.findByIdAndDelete(req.params.id);

	// Log audit
	await logAudit({
		adminId: req.admin._id,
		action: AUDIT_ACTIONS.ADMIN_DELETED,
		targetType: "admin",
		targetId: admin._id,
		details: { email: admin.email },
	});

	res.status(204).json({
		status: "success",
		message: "Administrateur supprimé avec succès",
	});
});
