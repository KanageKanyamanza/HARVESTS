const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../../models/User");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

/**
 * Middleware de protection des routes
 * Vérifie l'authentification de l'utilisateur via JWT
 */
exports.protect = catchAsync(async (req, res, next) => {
	// Récupérer le token depuis les headers ou les cookies
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}

	if (!token) {
		return next(
			new AppError("auth.not_logged_in", 401)
		);
	}

	// Vérifier et décoder le token JWT
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

	// Jour 60 (sécurité) : un refresh token (7 j) ne doit jamais tenir lieu de
	// jeton d'accès — JWT_REFRESH_SECRET retombe sur JWT_SECRET s'il n'est pas
	// défini, ce qui rendait un refresh token valide sur les routes protégées.
	if (decoded.type === 'refresh') {
		return next(
			new AppError("auth.invalid_token_relogin", 401)
		);
	}

	// Vérifier si l'utilisateur existe toujours
	const currentUser = await User.findById(decoded.id);
	if (!currentUser) {
		return next(
			new AppError("auth.user_no_longer_exists", 401)
		);
	}

	// Vérifier si le mot de passe a été changé après l'émission du token
	if (currentUser.changedPasswordAfter(decoded.iat)) {
		return next(
			new AppError("auth.password_changed_relogin", 401)
		);
	}

	// Vérifier si le compte est actif
	if (!currentUser.isActive) {
		return next(new AppError("auth.account_disabled", 401));
	}

	// Vérifier si le compte n'est pas suspendu
	if (currentUser.suspendedUntil && currentUser.suspendedUntil > new Date()) {
		return next(new AppError("auth.account_suspended_temp", 403));
	}

	// Ajouter l'utilisateur à la requête
	req.user = currentUser;
	res.locals.user = currentUser;
	req.user.emailVerified = currentUser.isEmailVerified;
	req.user.requiresEmailVerification = !currentUser.isEmailVerified;

	next();
});

/**
 * Middleware pour vérifier si l'utilisateur est connecté (optionnel)
 * Ne renvoie pas d'erreur si non connecté, mais peuple req.user si possible
 */
exports.isLoggedIn = async (req, res, next) => {
	if (
		req.cookies.jwt ||
		(req.headers.authorization &&
			req.headers.authorization.startsWith("Bearer"))
	) {
		try {
			// 1) Récupérer le token
			let token;
			if (req.cookies.jwt) {
				token = req.cookies.jwt;
			} else {
				token = req.headers.authorization.split(" ")[1];
			}

			// 2) Vérifier le token
			const decoded = await promisify(jwt.verify)(
				token,
				process.env.JWT_SECRET,
				{ algorithms: ['HS256'] }
			);

			// Un refresh token ne doit jamais être accepté comme jeton d'accès,
			// même en mode « connexion optionnelle » (JWT_REFRESH_SECRET peut
			// retomber sur JWT_SECRET).
			if (decoded.type === "refresh") {
				return next();
			}

			// 3) Vérifier si l'utilisateur existe
			const currentUser = await User.findById(decoded.id);
			if (!currentUser) {
				return next();
			}

			// 4) Vérifier si le mot de passe a changé
			if (currentUser.changedPasswordAfter(decoded.iat)) {
				return next();
			}

			// IL Y A UN UTILISATEUR CONNECTÉ
			res.locals.user = currentUser;
			req.user = currentUser;
			return next();
		} catch (err) {
			return next();
		}
	}
	next();
};

/**
 * Middleware de restriction par type d'utilisateur
 * Limite l'accès aux routes selon le type d'utilisateur
 */
exports.restrictTo = (...userTypes) => {
	return (req, res, next) => {
		if (!userTypes.includes(req.user.userType)) {
			return next(
				new AppError("auth.forbidden_action", 403)
			);
		}
		next();
	};
};

/**
 * Middleware pour vérifier la vérification d'email
 * Exige que l'utilisateur ait vérifié son email pour accéder à certaines fonctionnalités
 */
exports.requireVerification = (req, res, next) => {
	if (!req.user.isEmailVerified) {
		return res.status(403).json({
			status: "error",
			message: req.t("auth.verification_required"),
			code: "EMAIL_VERIFICATION_REQUIRED",
			data: {
				emailVerified: false,
				requiresEmailVerification: true,
				suggestion: req.t("auth.verification_suggestion"),
				allowedActions: req.t("auth.verification_allowed_actions"),
				restrictedActions: req.t("auth.verification_restricted_actions"),
			},
		});
	}
	next();
};

// Middleware flexible pour les actions qui nécessitent une vérification d'email
exports.requireVerificationFlexible = (options = {}) => {
	const {
		allowReadOnly = true,
		allowedMethods = ["GET", "HEAD", "OPTIONS"],
		customMessage = "auth.verification_required_action",
	} = options;

	return (req, res, next) => {
		if (!req.user.isEmailVerified) {
			// Si on permet la lecture seule et que c'est une méthode de lecture
			if (allowReadOnly && allowedMethods.includes(req.method)) {
				return next();
			}

			return res.status(403).json({
				status: "error",
				message: req.t(customMessage),
				code: "EMAIL_VERIFICATION_REQUIRED",
				data: {
					emailVerified: false,
					requiresEmailVerification: true,
					suggestion: req.t("auth.verification_suggestion"),
				},
			});
		}
		next();
	};
};

// Middleware pour vérifier si l'utilisateur est approuvé (pour les opérations sensibles)
exports.requireApproval = (req, res, next) => {
	if (
		["producer", "transformer", "exporter", "transporter"].includes(
			req.user.userType
		) &&
		!req.user.isApproved
	) {
		return next(
			new AppError("auth.approval_required", 403)
		);
	}
	next();
};

// Middleware pour vérifier si l'utilisateur est approuvé (pour l'accès au dashboard)
exports.checkApprovalStatus = (req, res, next) => {
	// Ajouter le statut d'approbation aux données de l'utilisateur
	req.user.approvalStatus = {
		isApproved: req.user.isApproved,
		needsApproval: [
			"producer",
			"transformer",
			"exporter",
			"transporter",
		].includes(req.user.userType),
		canAccessDashboard: true, // Toujours autoriser l'accès au dashboard
		canPerformOperations:
			req.user.isApproved ||
			!["producer", "transformer", "exporter", "transporter"].includes(
				req.user.userType
			),
	};
	next();
};
