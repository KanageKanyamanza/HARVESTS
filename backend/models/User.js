const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Schéma de base pour tous les utilisateurs
const baseUserSchema = new mongoose.Schema(
	{
		// Informations de base
		email: {
			type: String,
			required: [true, "Email requis"],
			unique: true,
			lowercase: true,
			trim: true,
			match: [
				/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
				"Format email invalide",
			],
		},
		password: {
			type: String,
			required: [true, "Mot de passe requis"],
			minlength: [8, "Le mot de passe doit contenir au moins 8 caractères"],
			validate: {
				validator: function (v) {
					// Au moins une majuscule, une minuscule et un chiffre
					return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v);
				},
				message:
					"Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre",
			},
			select: false,
		},
		userType: {
			type: String,
			required: [true, "Type d'utilisateur requis"],
			enum: {
				values: [
					"producer",
					"transformer",
					"consumer",
					"restaurateur",
					"exporter",
					"transporter",
					"admin",
				],
				message: "Type d'utilisateur invalide",
			},
		},
		firstName: {
			type: String,
			required: [true, "Prénom requis"],
			trim: true,
			maxlength: [50, "Le prénom ne peut pas dépasser 50 caractères"],
		},
		lastName: {
			type: String,
			required: [true, "Nom requis"],
			trim: true,
			maxlength: [50, "Le nom ne peut pas dépasser 50 caractères"],
		},
		// Noms d'entreprise spécifiques par type d'utilisateur
		companyName: {
			type: String,
			trim: true,
			maxlength: [
				100,
				"Le nom de l'entreprise ne peut pas dépasser 100 caractères",
			],
		},
		farmName: {
			type: String,
			trim: true,
			maxlength: [
				100,
				"Le nom de la ferme ne peut pas dépasser 100 caractères",
			],
		},
		restaurantName: {
			type: String,
			trim: true,
			maxlength: [
				100,
				"Le nom du restaurant ne peut pas dépasser 100 caractères",
			],
		},
		phone: {
			type: String,
			required: [true, "Numéro de téléphone requis"],
			trim: true,
			match: [/^[\+]?[0-9\s\-\(\)]{8,20}$/, "Format de téléphone invalide"],
		},
		country: {
			type: String,
			required: [true, "Pays requis"],
			trim: true,
			maxlength: [100, "Le nom du pays ne peut pas dépasser 100 caractères"],
			default: "Sénégal",
		},
		address: {
			type: String,
			trim: true,
			maxlength: [200, "L'adresse ne peut pas dépasser 200 caractères"],
		},
		city: {
			type: String,
			trim: true,
			maxlength: [
				100,
				"Le nom de la ville ne peut pas dépasser 100 caractères",
			],
		},
		region: {
			type: String,
			trim: true,
			maxlength: [
				100,
				"Le nom de la région ne peut pas dépasser 100 caractères",
			],
		},
		bio: {
			type: String,
			trim: true,
			maxlength: [500, "La biographie ne peut pas dépasser 500 caractères"],
		},
		postalCode: {
			type: String,
			trim: true,
			maxlength: [20, "Le code postal ne peut pas dépasser 20 caractères"],
		},
		coordinates: {
			latitude: {
				type: Number,
				min: -90,
				max: 90,
			},
			longitude: {
				type: Number,
				min: -180,
				max: 180,
			},
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		isApproved: {
			type: Boolean,
			default: false,
		},
		emailVerificationToken: String,
		emailVerificationExpires: Date,

		// Champs de vérification
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
		isPhoneVerified: {
			type: Boolean,
			default: false,
		},
		isIdentityVerified: {
			type: Boolean,
			default: false,
		},
		isBusinessVerified: {
			type: Boolean,
			default: false,
		},

		// Dates de vérification
		emailVerifiedAt: Date,
		phoneVerifiedAt: Date,
		identityVerifiedAt: Date,
		businessVerifiedAt: Date,
		passwordResetToken: String,
		passwordResetExpires: Date,
		loginAttempts: {
			type: Number,
			default: 0,
		},
		accountLockedUntil: Date,
		passwordChangedAt: Date,
		lastLogin: Date,
		preferredLanguage: {
			type: String,
			enum: ["fr", "en", "pt", "ar"],
			default: "fr",
		},
		timezone: {
			type: String,
			default: "Africa/Dakar",
		},

		// Système de notation centralisé
		ratings: {
			average: {
				type: Number,
				default: 0,
				min: 0,
				max: 5,
			},
			count: {
				type: Number,
				default: 0,
			},
		},

		// Statistiques de vente centralisées
		salesStats: {
			totalSales: {
				type: Number,
				default: 0,
			},
			totalOrders: {
				type: Number,
				default: 0,
			},
			totalRevenue: {
				type: Number,
				default: 0,
			},
			averageOrderValue: {
				type: Number,
				default: 0,
			},
		},

		// Images de profil et boutique
		avatar: {
			type: String,
			default: null,
		},
		shopBanner: {
			type: String,
			default: null,
		},
		shopLogo: {
			type: String,
			default: null,
		},

		// Informations financières
		bankAccount: {
			accountName: {
				type: String,
				trim: true,
			},
			accountNumber: {
				type: String,
				trim: true,
			},
			bankName: {
				type: String,
				trim: true,
			},
			bankCode: {
				type: String,
				trim: true,
			},
			swiftCode: {
				type: String,
				trim: true,
			},
			isVerified: {
				type: Boolean,
				default: false,
			},
		},
		paymentMethods: [String],

		// Paramètres de notification
		notificationSettings: {
			email: {
				orders: { type: Boolean, default: true },
				payments: { type: Boolean, default: true },
				promotions: { type: Boolean, default: true },
				updates: { type: Boolean, default: true },
			},
			push: {
				orders: { type: Boolean, default: true },
				payments: { type: Boolean, default: true },
				promotions: { type: Boolean, default: false },
				updates: { type: Boolean, default: true },
			},
			sms: {
				orders: { type: Boolean, default: false },
				payments: { type: Boolean, default: true },
				promotions: { type: Boolean, default: false },
				updates: { type: Boolean, default: false },
			},
			frequency: {
				type: String,
				enum: ["immediate", "daily", "weekly"],
				default: "immediate",
			},
		},

		// Abonnements Web Push
		webPushSubscriptions: [
			{
				endpoint: String,
				keys: {
					p256dh: String,
					auth: String,
				},
				userAgent: String,
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],

		// Tokens FCM (Firebase Cloud Messaging)
		fcmTokens: [String],
	},

	{
		timestamps: true,
		discriminatorKey: "userType",
		collection: "users",
	}
);

// Index pour performance
baseUserSchema.index({ email: 1 });
baseUserSchema.index({ userType: 1 });
baseUserSchema.index({ country: 1, region: 1 });
baseUserSchema.index({ isActive: 1, isApproved: 1 });

// Middleware pre-save pour hasher le mot de passe
baseUserSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	this.password = await bcrypt.hash(this.password, 12);

	// Mettre à jour passwordChangedAt si ce n'est pas un nouveau document
	if (!this.isNew) {
		this.passwordChangedAt = Date.now() - 1000; // Soustraire 1 seconde pour s'assurer que le token est valide
	}

	next();
});

// Méthode pour comparer les mots de passe
baseUserSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour générer token de vérification email
baseUserSchema.methods.createEmailVerificationToken = function () {
	const verifyToken = crypto.randomBytes(32).toString("hex");

	this.emailVerificationToken = crypto
		.createHash("sha256")
		.update(verifyToken)
		.digest("hex");

	this.emailVerificationExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 jours (pour les tests)

	return verifyToken;
};

// Méthode pour générer token de reset mot de passe
baseUserSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString("hex");

	this.passwordResetToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

	return resetToken;
};

// Méthode pour vérifier si le compte est verrouillé
baseUserSchema.methods.isLocked = function () {
	return !!(this.accountLockedUntil && this.accountLockedUntil > Date.now());
};

// Méthode pour incrémenter les tentatives de connexion
baseUserSchema.methods.incLoginAttempts = function () {
	// Si nous avons une date de verrouillage précédente et qu'elle est expirée, recommencer
	if (this.accountLockedUntil && this.accountLockedUntil < Date.now()) {
		return this.updateOne({
			$unset: {
				loginAttempts: 1,
				accountLockedUntil: 1,
			},
		});
	}

	const updates = { $inc: { loginAttempts: 1 } };

	// Si nous atteignons la limite maximale et qu'il n'y a pas de verrouillage précédent, verrouiller le compte
	if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
		// 30 minutes en production, 2 minutes en développement
		const lockoutDuration =
			process.env.NODE_ENV === "production"
				? 2 * 60 * 1000 // 2 minutes (modifié sur demande)
				: 2 * 60 * 1000; // 2 minutes

		updates.$set = {
			accountLockedUntil: Date.now() + lockoutDuration,
		};
	}

	return this.updateOne(updates);
};

// Méthode pour réinitialiser les tentatives de connexion
baseUserSchema.methods.resetLoginAttempts = function () {
	return this.updateOne({
		$unset: {
			loginAttempts: 1,
			accountLockedUntil: 1,
		},
	});
};

// Méthode pour vérifier si le mot de passe a été changé après l'émission du token
baseUserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(
			this.passwordChangedAt.getTime() / 1000,
			10
		);
		return JWTTimestamp < changedTimestamp;
	}
	return false;
};

// Note: Le champ emailVerified a été supprimé, on utilise uniquement isEmailVerified
// pour être cohérent avec les autres champs de vérification (isPhoneVerified, etc.)

// Transformation JSON pour masquer les champs sensibles
baseUserSchema.methods.toJSON = function () {
	const userObject = this.toObject();

	// Champs de sécurité / système interne existants
	delete userObject.password;
	delete userObject.emailVerificationToken;
	delete userObject.emailVerificationExpires;
	delete userObject.passwordResetToken;
	delete userObject.passwordResetExpires;
	delete userObject.loginAttempts;
	delete userObject.accountLockedUntil;

	// Optimisation : Suppression des données techniques backend uniquement
	delete userObject.webPushSubscriptions;
	delete userObject.fcmTokens;

	// Optimisation : Suppression des données redondantes (récupérées via endpoints dédiés)
	delete userObject.bankAccount;
	delete userObject.paymentMethods;
	delete userObject.notificationSettings;

	// Optimisation : Suppression des données inutilisées par le frontend
	delete userObject.salesStats;
	delete userObject.coordinates;
	delete userObject.identityVerifiedAt;
	delete userObject.businessVerifiedAt;

	return userObject;
};

const User = mongoose.model("User", baseUserSchema);

module.exports = User;
