const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: [true, "validation.first_name_required"],
			trim: true,
			maxlength: [50, "validation.first_name_maxlength"],
		},

		lastName: {
			type: String,
			required: [true, "validation.last_name_required"],
			trim: true,
			maxlength: [50, "validation.last_name_maxlength"],
		},

		email: {
			type: String,
			required: [true, "validation.email_required"],
			unique: true,
			lowercase: true,
			validate: {
				validator: function (email) {
					return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
				},
				message: "validation.email_invalid",
			},
		},

		password: {
			type: String,
			required: [true, "validation.password_required"],
			minlength: [8, "validation.password_min"],
			select: false,
			validate: {
				validator: function (password) {
					// Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
					return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
				},
				message:
					"validation.admin_password_complexity",
			},
		},

		role: {
			type: String,
			enum: ["super-admin", "admin", "moderator", "support"],
			default: "moderator",
		},

		userType: {
			type: String,
			default: "admin",
		},
		isActive: {
			type: Boolean,
			default: true,
		},

		isEmailVerified: {
			type: Boolean,
			default: false,
		},

		emailVerificationToken: {
			type: String,
			select: false,
		},

		emailVerificationExpires: {
			type: Date,
			select: false,
		},

		passwordResetToken: {
			type: String,
			select: false,
		},

		passwordResetExpires: {
			type: Date,
			select: false,
		},

		lastLogin: {
			type: Date,
			default: null,
		},

		loginAttempts: {
			type: Number,
			default: 0,
		},

		accountLockedUntil: {
			type: Date,
			default: null,
		},

		permissions: [
			{
				type: String,
				enum: [
					"users:read",
					"users:write",
					"users:delete",
					"products:read",
					"products:write",
					"products:delete",
					"products:approve",
					"orders:read",
					"orders:write",
					"orders:delete",
					"orders:manage",
					"analytics:read",
					"analytics:export",
					"settings:read",
					"settings:write",
					"admins:read",
					"admins:write",
					"admins:delete",
					"reports:read",
					"reports:export",
					"all",
				],
			},
		],

		department: {
			type: String,
			enum: ["technical", "support", "marketing", "finance", "operations"],
			default: "support",
		},

		phone: {
			type: String,
			trim: true,
			validate: {
				validator: function (phone) {
					return !phone || /^[\+]?[0-9\s\-\(\)]{8,}$/.test(phone);
				},
				message: "validation.phone_invalid",
			},
		},

		notificationEmail: {
			type: String,
			trim: true,
			lowercase: true,
			validate: {
				validator: function (email) {
					return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
				},
				message: "validation.notification_email_invalid",
			},
		},

		avatar: {
			type: String,
			default: null,
		},

		timezone: {
			type: String,
			default: "Africa/Douala",
		},

		language: {
			type: String,
			enum: ["fr", "en"],
			default: "fr",
		},

		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Admin",
			default: null,
		},

		lastPasswordChange: {
			type: Date,
			default: Date.now,
		},

		twoFactorEnabled: {
			type: Boolean,
			default: false,
		},

		twoFactorSecret: {
			type: String,
			select: false,
		},

		// Push Notifications (Web & Mobile)
		webPushSubscriptions: [
			{
				endpoint: String,
				keys: {
					p256dh: String,
					auth: String,
				},
				deviceType: String,
				browser: String,
				lastUsed: { type: Date, default: Date.now },
			},
		],

		fcmTokens: [String],

		// Préférences de notification
		preferences: {
			notifications: {
				email: { type: Boolean, default: true },
				push: { type: Boolean, default: true },
				webPush: { type: Boolean, default: true },
				orderUpdates: { type: Boolean, default: true },
				announcements: { type: Boolean, default: true },
				securityAlerts: { type: Boolean, default: true },
			},
		},
	},
	{
		timestamps: true,
	}
);

// Méthode pour comparer les mots de passe
adminSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour mettre à jour la dernière connexion
adminSchema.methods.updateLastLogin = function () {
	this.lastLogin = new Date();
	return this.save({ validateBeforeSave: false });
};

// Méthode pour vérifier si le compte est verrouillé
adminSchema.methods.isLocked = function () {
	return !!(this.accountLockedUntil && this.accountLockedUntil > Date.now());
};

// Méthode pour incrémenter les tentatives de connexion
adminSchema.methods.incLoginAttempts = function () {
	// Si on a un verrou et qu'il est expiré, réinitialiser
	if (this.accountLockedUntil && this.accountLockedUntil < Date.now()) {
		return this.updateOne({
			$unset: { accountLockedUntil: 1 },
			$set: { loginAttempts: 1 },
		});
	}

	const updates = { $inc: { loginAttempts: 1 } };

	// Verrouiller le compte après 5 tentatives
	if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
		// 30 minutes en production, 2 minutes en développement
		const lockoutDuration =
			process.env.NODE_ENV === "production"
				? 30 * 60 * 1000 // 30 minutes
				: 2 * 60 * 1000; // 2 minutes

		updates.$set = { accountLockedUntil: Date.now() + lockoutDuration };
	}

	return this.updateOne(updates);
};

// Méthode pour réinitialiser les tentatives de connexion
adminSchema.methods.resetLoginAttempts = function () {
	return this.updateOne({
		$unset: { loginAttempts: 1, accountLockedUntil: 1 },
	});
};

// Méthode pour vérifier les permissions
adminSchema.methods.hasPermission = function (permission) {
	if (this.permissions.includes("all")) return true;
	return this.permissions.includes(permission);
};

// Méthode pour vérifier le rôle
adminSchema.methods.hasRole = function (role) {
	const roleHierarchy = {
		"super-admin": 4,
		admin: 3,
		moderator: 2,
		support: 1,
	};

	const userLevel = roleHierarchy[this.role] || 0;
	const requiredLevel = roleHierarchy[role] || 0;

	return userLevel >= requiredLevel;
};

// Méthode pour générer un token de réinitialisation de mot de passe
adminSchema.methods.createPasswordResetToken = function () {
	const resetToken = require("crypto").randomBytes(32).toString("hex");

	this.passwordResetToken = require("crypto")
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

	return resetToken;
};

// Méthode pour générer un token de vérification d'email
adminSchema.methods.createEmailVerificationToken = function () {
	const verificationToken = require("crypto").randomBytes(32).toString("hex");

	this.emailVerificationToken = require("crypto")
		.createHash("sha256")
		.update(verificationToken)
		.digest("hex");

	this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

	return verificationToken;
};

// Méthode pour obtenir le nom complet
adminSchema.methods.getFullName = function () {
	return `${this.firstName} ${this.lastName}`;
};

// Méthode pour obtenir les permissions par défaut selon le rôle
adminSchema.statics.getDefaultPermissions = function (role) {
	const defaultPermissions = {
		"super-admin": ["all"],
		admin: [
			"users:read",
			"users:write",
			"users:delete",
			"products:read",
			"products:write",
			"products:delete",
			"products:approve",
			"orders:read",
			"orders:write",
			"orders:delete",
			"orders:manage",
			"analytics:read",
			"analytics:export",
			"settings:read",
			"settings:write",
			"reports:read",
			"reports:export",
		],
		moderator: [
			"users:read",
			"users:write",
			"products:read",
			"products:write",
			"products:approve",
			"orders:read",
			"orders:write",
			"orders:manage",
			"analytics:read",
			"reports:read",
		],
		support: [
			"users:read",
			"products:read",
			"orders:read",
			"orders:write",
			"analytics:read",
		],
	};

	return defaultPermissions[role] || [];
};

// Middleware pour hasher le mot de passe avant sauvegarde
adminSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	this.password = await bcrypt.hash(this.password, 12);
	this.lastPasswordChange = Date.now();
	next();
});

// Vérifie si le mot de passe a changé après l'émission du token
adminSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
	if (this.lastPasswordChange) {
		const changedAt = parseInt(this.lastPasswordChange.getTime() / 1000, 10);
		return jwtTimestamp < changedAt;
	}
	return false;
};

module.exports = mongoose.model("Admin", adminSchema);
