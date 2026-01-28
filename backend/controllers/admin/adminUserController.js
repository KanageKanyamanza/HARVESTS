const axios = require("axios");
const cloudinary = require("cloudinary").v2;
const User = require("../../models/User");
const Product = require("../../models/Product");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { logAudit, AUDIT_ACTIONS } = require("../../utils/auditLogger");
const adminNotifications = require("../../utils/adminNotifications");
const emailQueue = require("../../services/emailQueueService");

// @desc    Obtenir tous les utilisateurs
// @route   GET /api/v1/admin/users
// @access  Admin
exports.getAllUsers = catchAsync(async (req, res, next) => {
	const { page = 1, limit = 10, search, role, status } = req.query;

	// Construire le filtre
	const filter = {};

	if (search) {
		filter.$or = [
			{ firstName: { $regex: search, $options: "i" } },
			{ lastName: { $regex: search, $options: "i" } },
			{ email: { $regex: search, $options: "i" } },
		];
	}

	if (role) {
		filter.userType = role;
	}

	if (status) {
		// Mapper les statuts textuels vers les champs de base de données
		switch (status) {
			case "Actif":
				filter.isActive = true;
				filter.isApproved = true;
				break;
			case "Vérifié":
				filter.isActive = true;
				filter.isApproved = true;
				filter.isEmailVerified = true;
				break;
			case "En attente":
				filter.isActive = true;
				filter.isApproved = false;
				break;
			case "Banni":
				filter.isActive = false;
				break;
		}
	}

	// Pagination
	const skip = (page - 1) * limit;

	// Récupérer les utilisateurs
	const users = await User.find(filter)
		.select("-password -passwordResetToken -passwordResetExpires")
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(parseInt(limit));

	// Mapper les utilisateurs pour ajouter un champ status textuel
	const usersWithStatus = users.map((user) => {
		const userObj = user.toObject();
		if (!userObj.isActive) {
			userObj.status = "Banni";
		} else if (!userObj.isApproved) {
			userObj.status = "En attente";
		} else if (userObj.isEmailVerified) {
			userObj.status = "Vérifié";
		} else {
			userObj.status = "Actif";
		}
		return userObj;
	});

	const total = await User.countDocuments(filter);

	res.status(200).json({
		status: "success",
		data: {
			users: usersWithStatus,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(total / limit),
				totalUsers: total,
				hasNext: page < Math.ceil(total / limit),
				hasPrev: page > 1,
			},
		},
	});
});

// @desc    Obtenir un utilisateur par ID
exports.getUserById = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.params.id).select(
		"-password -passwordResetToken -passwordResetExpires",
	);

	if (!user) {
		return next(new AppError("Utilisateur non trouvé", 404));
	}

	const userObj = user.toObject();
	if (!userObj.isActive) {
		userObj.status = "Banni";
	} else if (!userObj.isApproved) {
		userObj.status = "En attente";
	} else if (userObj.isEmailVerified) {
		userObj.status = "Vérifié";
	} else {
		userObj.status = "Actif";
	}

	res.status(200).json({
		status: "success",
		data: { user: userObj },
	});
});

// @desc    Mettre à jour un utilisateur
exports.updateUser = catchAsync(async (req, res, next) => {
	const {
		firstName,
		lastName,
		email,
		phone,
		address,
		isActive,
		isEmailVerified,
	} = req.body;
	const updateData = { firstName, lastName, email, phone, address, isActive };
	if (isEmailVerified !== undefined)
		updateData.isEmailVerified = isEmailVerified;

	const user = await User.findByIdAndUpdate(req.params.id, updateData, {
		new: true,
		runValidators: true,
	}).select("-password -passwordResetToken -passwordResetExpires");

	if (!user) return next(new AppError("Utilisateur non trouvé", 404));

	res.status(200).json({
		status: "success",
		message: "Utilisateur mis à jour avec succès",
		data: { user },
	});
});

// @desc    Supprimer un utilisateur
exports.deleteUser = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.params.id);
	if (!user) return next(new AppError("Utilisateur non trouvé", 404));

	const deletedUserEmail = user.email;
	const deletedProducts = await Product.deleteMany({
		$or: [
			{ producer: user._id },
			{ transformer: user._id },
			{ restaurateur: user._id },
		],
	});

	adminNotifications
		.notifyUserDeleted(
			{
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				userType: user.userType,
			},
			req.admin,
		)
		.catch((err) => console.error("Erreur notification:", err));

	await User.findByIdAndDelete(req.params.id);

	await logAudit({
		userId: req.admin._id,
		action: AUDIT_ACTIONS.USER_DELETED,
		targetType: "User",
		targetId: req.params.id,
		details: {
			deletedUserEmail,
			deletedProductsCount: deletedProducts.deletedCount,
		},
	});

	res.status(200).json({ status: "success", message: `Utilisateur supprimé` });
});

// @desc    Bannir un utilisateur
exports.banUser = catchAsync(async (req, res, next) => {
	const user = await User.findByIdAndUpdate(
		req.params.id,
		{ isActive: false, bannedAt: new Date() },
		{ new: true },
	).select("-password");

	if (!user) return next(new AppError("Utilisateur non trouvé", 404));

	adminNotifications
		.notifyUserBanned(user, req.admin, req.body.reason)
		.catch((err) => console.error("Erreur notification:", err));

	await logAudit({
		adminId: req.admin._id,
		action: AUDIT_ACTIONS.USER_BANNED,
		targetType: "User",
		targetId: user._id,
		details: { bannedUserEmail: user.email, reason: req.body.reason },
	});

	res.status(200).json({ status: "success", data: { user } });
});

// @desc    Débannir un utilisateur
exports.unbanUser = catchAsync(async (req, res, next) => {
	const user = await User.findByIdAndUpdate(
		req.params.id,
		{ isActive: true, $unset: { bannedAt: 1 } },
		{ new: true },
	).select("-password");
	if (!user) return next(new AppError("Utilisateur non trouvé", 404));
	res.status(200).json({ status: "success", data: { user } });
});

// @desc    Vérifier un utilisateur
exports.verifyUser = catchAsync(async (req, res, next) => {
	const user = await User.findByIdAndUpdate(
		req.params.id,
		{ isEmailVerified: true, emailVerified: true, isApproved: true },
		{ new: true },
	).select("-password");
	if (!user) return next(new AppError("Utilisateur non trouvé", 404));
	res.status(200).json({ status: "success", data: { user } });
});

// @desc    Vérifier un document spécifique de l'utilisateur
exports.verifyUserDocument = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { docType, status, docId } = req.body; // docType: 'businessLicense', status: 'approved'/'rejected', docId: (optionnel pour les tableaux)

	let user = await User.findById(id);
	if (!user) return next(new AppError("Utilisateur non trouvé", 404));

	// 1. Gérer le format objet (Restaurateur, Transformer, etc.)
	if (user.documents && user.documents[docType] !== undefined) {
		user.documents[docType].isVerified = status === "approved";
		user.markModified("documents");
	}

	// 2. Gérer le format tableau (certifications, exportLicenses)
	const arrayTypes = ["certifications", "exportLicenses"];
	if (arrayTypes.includes(docType) && docId && user[docType]) {
		const doc = user[docType].id(docId);
		if (doc) {
			doc.isVerified = status === "approved";
			doc.status = status; // Au cas où on utilise status
			user.markModified(docType);
		}
	}

	// 3. Gérer le format tableau verificationStatus (Transporter, etc.)
	if (
		user.verificationStatus &&
		user.verificationStatus.verificationDocuments &&
		docId
	) {
		const doc = user.verificationStatus.verificationDocuments.id(docId);
		if (doc) {
			doc.status = status;
			user.markModified("verificationStatus");
		}
	} else if (
		user.verificationStatus &&
		user.verificationStatus.verificationDocuments &&
		docType &&
		!arrayTypes.includes(docType)
	) {
		// Fallback par type si pas de docId
		const doc = user.verificationStatus.verificationDocuments.find(
			(d) => d.type === docType,
		);
		if (doc) {
			doc.status = status;
			user.markModified("verificationStatus");
		}
	}

	await user.save({ validateBeforeSave: false });

	await logAudit({
		userId: req.admin._id,
		action: AUDIT_ACTIONS.USER_UPDATED,
		targetType: "User",
		targetId: id,
		details: { document: docType, status },
	});

	res.status(200).json({
		status: "success",
		message: "Statut du document mis à jour",
		data: { user },
	});
});

// @desc    Proxy Cloudinary pour les téléchargements sécurisés (Méthode Simplifiée)
exports.proxyDownloadDocument = catchAsync(async (req, res, next) => {
	const { url, filename } = req.query;
	if (!url) return next(new AppError("URL requise", 400));
	if (!url.includes("cloudinary.com"))
		return next(new AppError("URL non autorisée", 400));

	try {
		// Nettoyage rigoureux des clés (pour éviter les espaces/retours à la ligne invisibles)
		cloudinary.config({
			cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
			api_key: (process.env.CLOUDINARY_API_KEY || "").trim(),
			api_secret: (process.env.CLOUDINARY_API_SECRET || "").trim(),
		});

		const { publicId } = extractPublicIdAndVersion(url);
		if (!publicId) throw new Error("Public ID non trouvé");

		console.log(`[Proxy] Signature simplifiée pour: ${publicId}`);

		// Étape 1: Métadonnées
		let resource;
		try {
			resource = await cloudinary.api.resource(publicId, {
				resource_type: "image",
			});
		} catch (e) {
			resource = await cloudinary.api.resource(publicId, {
				resource_type: "raw",
			});
		}

		// Étape 2: Signature sans 'version' (souvent la cause du 401 si mal placé)
		const signedUrl = cloudinary.url(publicId, {
			resource_type: resource.resource_type,
			type: resource.type,
			format: resource.format,
			sign_url: true,
			secure: true,
		});

		console.log(`[Proxy] Target: ${signedUrl}`);

		const response = await axios({
			method: "GET",
			url: signedUrl,
			responseType: "stream",
			timeout: 30000,
		});

		res.setHeader(
			"Content-Type",
			response.headers["content-type"] || "application/pdf",
		);
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${encodeURIComponent(filename || "document.pdf")}"`,
		);

		response.data.pipe(res);
	} catch (error) {
		console.error("Erreur proxy (Simple Sign):", error.message);
		if (error.response?.status === 401) {
			console.error("Signature rejetée. Essayez sans extension.");
		}
		return next(new AppError("Erreur de téléchargement sécurisé.", 500));
	}
});

function extractPublicIdAndVersion(url) {
	if (!url || !url.includes("cloudinary.com"))
		return { publicId: null, version: null };
	const parts = url.split("/");
	const uploadIndex = parts.findIndex((part) => part === "upload");
	if (uploadIndex === -1 || uploadIndex + 1 >= parts.length)
		return { publicId: null, version: null };

	let pathSegments = parts.slice(uploadIndex + 1);
	let version = null;
	const vIndex = pathSegments.findIndex((s) => s.match(/^v\d+$/));
	if (vIndex !== -1) {
		version = pathSegments[vIndex].substring(1);
		pathSegments = pathSegments.slice(vIndex + 1);
	} else {
		while (
			pathSegments.length > 0 &&
			(pathSegments[0].includes(",") || pathSegments[0].match(/^[a-z]_.+/))
		) {
			pathSegments.shift();
		}
	}
	return { publicId: pathSegments.join("/").split(".")[0], version };
}

// @desc    Relancer les utilisateurs avec un profil incomplet
exports.remindIncompleteProfiles = catchAsync(async (req, res, next) => {
	// Critères d'un profil incomplet (champs optionnels mais importants manquants)
	const incompleteCriteria = [
		{ address: null },
		{ address: "" },
		{ city: null },
		{ city: "" },
		{ avatar: null },
		{ bio: null },
		{ bio: "" },
	];

	// Trouver les utilisateurs actifs mais incomplets
	const users = await User.find({
		isActive: true,
		$or: incompleteCriteria,
	}).select("firstName email preferredLanguage");

	let count = 0;
	const frontendUrl = process.env.FRONTEND_URL || "https://www.harvests.site";

	for (const user of users) {
		// Vérification basique pour éviter le spam (optionnel: ajouter un champ lastReminderSentAt)
		try {
			emailQueue.addToQueue({
				email: user.email,
				user: {
					firstName: user.firstName,
					email: user.email,
					preferredLanguage: user.preferredLanguage,
				},
				emailType: "incompleteProfile",
				url: `${frontendUrl}/dashboard/profile`,
			});
			count++;
		} catch (error) {
			console.error(
				`Erreur lors de l'ajout à la queue pour ${user.email}:`,
				error,
			);
		}
	}

	await logAudit({
		userId: req.admin._id,
		action: AUDIT_ACTIONS.BATCH_UPDATE, // Ou créer une nouvelle action EMAIL_BATCH
		targetType: "User",
		details: {
			action: "remind_incomplete_profiles",
			count,
		},
	});

	res.status(200).json({
		status: "success",
		message: `${count} rappels de profil envoyés avec succès`,
		data: { count },
	});
});
