const Admin = require("../../../models/Admin");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/appError");
const { logAudit, AUDIT_ACTIONS } = require("../../../utils/auditLogger");

// @desc    Activer/Désactiver un administrateur
// @route   PUT /api/v1/admin/admins/:id/toggle-status
// @access  Super Admin, Admin
exports.toggleAdminStatus = catchAsync(async (req, res, next) => {
	const admin = await Admin.findById(req.params.id);
	if (!admin) {
		return next(new AppError("Administrateur non trouvé", 404));
	}

	// Empêcher la désactivation de son propre compte
	if (req.admin._id.toString() === req.params.id) {
		return next(
			new AppError("Vous ne pouvez pas désactiver votre propre compte", 400)
		);
	}

	admin.isActive = !admin.isActive;
	await Admin.findByIdAndUpdate(
		req.params.id,
		{ isActive: admin.isActive },
		{ runValidators: false }
	);

	// Log audit
	await logAudit({
		adminId: req.admin._id,
		action: admin.isActive
			? AUDIT_ACTIONS.ADMIN_ACTIVATED
			: AUDIT_ACTIONS.ADMIN_DEACTIVATED,
		targetType: "admin",
		targetId: admin._id,
		details: { email: admin.email, isActive: admin.isActive },
	});

	res.status(200).json({
		status: "success",
		message: `Administrateur ${
			admin.isActive ? "activé" : "désactivé"
		} avec succès`,
		data: {
			admin: {
				id: admin._id,
				firstName: admin.firstName,
				lastName: admin.lastName,
				email: admin.email,
				isActive: admin.isActive,
			},
		},
	});
});
