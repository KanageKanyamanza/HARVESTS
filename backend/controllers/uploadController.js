const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/User");
const axios = require("axios");
const { parseCloudinaryUrl } = require("../utils/cloudinaryAsset");

// Configuration Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuration multer pour la mémoire
const storage = multer.memoryStorage();

// Filtre de fichiers
const fileFilter = (req, file, cb) => {
	if (file.mimetype.startsWith("image/")) {
		cb(null, true);
	} else {
		cb(new AppError("Seules les images sont autorisées!", 400), false);
	}
};

// Configuration multer
const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB par image
		files: 10, // Maximum 10 images
	},
});

// Filtre pour les documents (PDF et images)
const documentFilter = (req, file, cb) => {
	if (
		file.mimetype.startsWith("image/") ||
		file.mimetype === "application/pdf"
	) {
		cb(null, true);
	} else {
		cb(
			new AppError(
				"Format de fichier non supporté. Utilisez PDF, JPEG ou PNG.",
				400
			),
			false
		);
	}
};

// Configuration multer pour les documents
const uploadDocument = multer({
	storage,
	fileFilter: documentFilter,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB par document
		files: 1, // Un seul fichier à la fois
	},
});

// Middleware d'upload
exports.uploadProductImages = upload.array("images", 10);

// Middleware d'upload pour un seul fichier (pour Cloudinary direct)
exports.uploadSingleFile = upload.single("file");

// Middleware d'upload pour un document
exports.uploadDocumentMiddleware = uploadDocument.single("file");

// Upload d'images de produits vers Cloudinary
exports.uploadProductImagesToCloudinary = catchAsync(async (req, res, next) => {
	if (!req.files || req.files.length === 0) {
		return next(new AppError("Aucune image fournie", 400));
	}

	try {
		const uploadPromises = req.files.map((file) => {
			return new Promise((resolve, reject) => {
				const uploadStream = cloudinary.uploader.upload_stream(
					{
						folder: "harvests/products",
						resource_type: "image",
						transformation: [
							{ width: 800, height: 600, crop: "fit", quality: "auto" },
							{ format: "auto" },
						],
					},
					(error, result) => {
						if (error) {
							reject(error);
						} else {
							resolve({
								public_id: result.public_id,
								secure_url: result.secure_url,
								original_filename: file.originalname,
								size: file.size,
								format: result.format,
								width: result.width,
								height: result.height,
							});
						}
					}
				);

				uploadStream.end(file.buffer);
			});
		});

		const uploadResults = await Promise.all(uploadPromises);

		res.status(200).json({
			status: "success",
			message: "Images uploadées avec succès",
			data: {
				images: uploadResults,
				count: uploadResults.length,
			},
		});
	} catch (error) {
		console.error("Erreur lors de l'upload Cloudinary:", error);
		return next(new AppError("Erreur lors de l'upload des images", 500));
	}
});

// Supprimer une image de Cloudinary
exports.deleteImage = catchAsync(async (req, res, next) => {
	const { publicId } = req.params;

	if (!publicId) {
		return next(new AppError("Public ID requis", 400));
	}

	try {
		const result = await cloudinary.uploader.destroy(publicId);

		if (result.result === "not found") {
			return next(new AppError("Image non trouvée", 404));
		}

		res.status(200).json({
			status: "success",
			message: "Image supprimée avec succès",
			data: { result },
		});
	} catch (error) {
		console.error("Erreur lors de la suppression:", error);
		return next(new AppError("Erreur lors de la suppression de l'image", 500));
	}
});

// Supprimer une image par URL
exports.deleteImageByUrl = catchAsync(async (req, res, next) => {
	const { imageUrl } = req.body;

	if (!imageUrl) {
		return next(new AppError("URL de l'image requise", 400));
	}

	try {
		// Extraire le public_id de l'URL Cloudinary
		// Analyseur commun (gère les documents « authenticated », les fichiers raw et les
		// URL signées) ; l'ancien extracteur ne reconnaissait que /upload/
		const parsed = parseCloudinaryUrl(imageUrl);
		const publicId = parsed?.publicId || extractPublicIdFromUrl(imageUrl);

		if (!publicId) {
			return next(new AppError("URL d'image invalide", 400));
		}

		const result = await cloudinary.uploader.destroy(
			publicId,
			parsed ? { type: parsed.type, resource_type: parsed.resourceType } : undefined,
		);

		if (result.result === "not found") {
			return next(new AppError("Image non trouvée", 404));
		}

		res.status(200).json({
			status: "success",
			message: "Image supprimée avec succès",
			data: { result },
		});
	} catch (error) {
		console.error("Erreur lors de la suppression:", error);
		return next(new AppError("Erreur lors de la suppression de l'image", 500));
	}
});

// Upload direct vers Cloudinary (pour les blogs, etc.)
exports.uploadToCloudinary = catchAsync(async (req, res, next) => {
	if (!req.file) {
		return next(new AppError("Aucun fichier fourni", 400));
	}

	try {
		const uploadResult = await new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder: req.body.folder || "harvests/general",
					resource_type: "image",
					transformation: req.body.transformations
						? JSON.parse(req.body.transformations)
						: [
								{ width: 1200, height: 800, crop: "fit", quality: "auto" },
								{ format: "auto" },
						  ],
				},
				(error, result) => {
					if (error) {
						reject(error);
					} else {
						resolve(result);
					}
				}
			);

			uploadStream.end(req.file.buffer);
		});

		res.status(200).json({
			status: "success",
			message: "Image uploadée avec succès",
			data: {
				public_id: uploadResult.public_id,
				secure_url: uploadResult.secure_url,
				url: uploadResult.url,
				original_filename: req.file.originalname,
				size: req.file.size,
				format: uploadResult.format,
				width: uploadResult.width,
				height: uploadResult.height,
				folder: uploadResult.folder,
			},
		});
	} catch (error) {
		console.error("Erreur lors de l'upload Cloudinary:", error);
		return next(new AppError("Erreur lors de l'upload de l'image", 500));
	}
});

// Upload de document vers Cloudinary
exports.uploadDocumentToCloudinary = catchAsync(async (req, res, next) => {
	if (!req.file) {
		return next(new AppError("upload.no_file", 400));
	}

	try {
		const uploadResult = await new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder: req.body.folder || "harvests/documents",
					// Jour 59 (sécurité) : pièces d'identité, RCCM, NINEA… ne sont plus
					// publics ; lecture via /upload/documents/access (lien signé temporaire)
					type: "authenticated",
					// Auteur de l'envoi : autorise l'aperçu avant l'enregistrement du formulaire
					context: { uploader: String(req.user?._id || req.admin?._id || "") },
					resource_type: "auto", // Permet de détecter PDF vs Image
					format: req.file.mimetype === "application/pdf" ? "pdf" : undefined,
				},
				(error, result) => {
					if (error) {
						reject(error);
					} else {
						resolve(result);
					}
				}
			);

			uploadStream.end(req.file.buffer);
		});

		res.status(200).json({
			status: "success",
			message: req.t("upload.document_uploaded"),
			data: {
				public_id: uploadResult.public_id,
				secure_url: uploadResult.secure_url,
				url: uploadResult.url,
				original_filename: req.file.originalname,
				size: req.file.size,
				format: uploadResult.format,
				resource_type: uploadResult.resource_type,
			},
		});
	} catch (error) {
		console.error("Erreur lors de l'upload Document Cloudinary:", error);
		return next(new AppError("upload.document_upload_error", 500));
	}
});

// Durée de validité d'un lien de consultation de document
const DOCUMENT_ACCESS_TTL_SECONDS = 5 * 60;

// Champs où un document peut être enregistré sur le profil. La propriété n'est
// reconnue que dans ces champs : une URL collée dans la bio ou l'adresse ne
// donne aucun accès au document d'un autre utilisateur.
const DOCUMENT_KEY_RE = /document|certif|licen|permit|attestation|identity|registration|rccm|ninea|kyc|proof|file/i;

const userHoldsDocument = (node, parsed, inDocumentField = false) => {
	if (typeof node === "string") {
		if (!inDocumentField) return false;
		const candidate = parseCloudinaryUrl(node);
		return Boolean(candidate && candidate.publicId === parsed.publicId && candidate.type === parsed.type);
	}
	if (Array.isArray(node)) return node.some((item) => userHoldsDocument(item, parsed, inDocumentField));
	if (node && typeof node === "object" && !node._bsontype && !(node instanceof Date)) {
		return Object.entries(node).some(([key, value]) =>
			userHoldsDocument(value, parsed, inDocumentField || DOCUMENT_KEY_RE.test(key)),
		);
	}
	return false;
};

/**
 * Contrôle d'accès commun aux documents protégés (Jour 59) : un admin pour
 * tout document ; un utilisateur pour un document enregistré dans un champ
 * document de son compte, ou qu'il vient d'envoyer (auteur noté sur Cloudinary).
 * Renvoie l'URL analysée, ou null pour un ancien document public (type « upload »).
 */
const resolveProtectedDocument = async (req, url) => {
	const parsed = parseCloudinaryUrl(url);
	if (!parsed) throw new AppError("upload.invalid_document_url", 400);
	if (parsed.type === "upload") return { parsed, isPublic: true };
	if (req.admin) return { parsed, isPublic: false };

	const owner = await User.findById(req.user._id).lean();
	if (owner && userHoldsDocument(owner, parsed)) return { parsed, isPublic: false };

	try {
		const resource = await cloudinary.api.resource(parsed.publicId, {
			type: parsed.type,
			resource_type: parsed.resourceType,
			context: true,
		});
		if (resource?.context?.custom?.uploader === String(req.user._id)) return { parsed, isPublic: false };
	} catch {
		// asset introuvable : refus ci-dessous
	}
	throw new AppError("upload.document_forbidden", 403);
};

const signedDownloadUrl = (parsed) =>
	cloudinary.utils.private_download_url(parsed.publicId, parsed.format, {
		resource_type: parsed.resourceType,
		type: parsed.type,
		expires_at: Math.floor(Date.now() / 1000) + DOCUMENT_ACCESS_TTL_SECONDS,
	});

const CONTENT_TYPES = { pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

/** Lien de téléchargement temporaire d'un document protégé. */
exports.getDocumentAccessUrl = catchAsync(async (req, res) => {
	const { parsed, isPublic } = await resolveProtectedDocument(req, req.query.url);
	res.status(200).json({
		status: "success",
		data: isPublic ?
				{ url: req.query.url, expiresIn: null }
			:	{ url: signedDownloadUrl(parsed), expiresIn: DOCUMENT_ACCESS_TTL_SECONDS },
	});
});

/**
 * Contenu d'un document protégé, affichable dans la page (aperçu PDF / image).
 * Le lien signé de Cloudinary force le téléchargement : le serveur le lit et
 * renvoie le fichier en « inline », jamais mis en cache par le navigateur.
 */
exports.streamDocument = catchAsync(async (req, res, next) => {
	const { parsed, isPublic } = await resolveProtectedDocument(req, req.query.url);
	const sourceUrl = isPublic ? req.query.url : signedDownloadUrl(parsed);
	try {
		const upstream = await axios.get(sourceUrl, { responseType: "stream", timeout: 30000 });
		res.setHeader("Content-Type", CONTENT_TYPES[parsed.format] || upstream.headers["content-type"] || "application/octet-stream");
		res.setHeader("Content-Disposition", "inline");
		res.setHeader("Cache-Control", "private, no-store");
		upstream.data.pipe(res);
	} catch (error) {
		console.error("Erreur lecture document Cloudinary:", error.message);
		return next(new AppError("upload.document_upload_error", 502));
	}
});

// Obtenir une URL optimisée
exports.getOptimizedImageUrl = catchAsync(async (req, res, next) => {
	const { publicId } = req.params;
	const {
		width,
		height,
		quality = "auto",
		format = "auto",
		crop = "fit",
	} = req.query;

	if (!publicId) {
		return next(new AppError("Public ID requis", 400));
	}

	try {
		const options = {
			width: width ? parseInt(width) : undefined,
			height: height ? parseInt(height) : undefined,
			quality,
			format,
			crop,
		};

		// Supprimer les options undefined
		Object.keys(options).forEach((key) => {
			if (options[key] === undefined) {
				delete options[key];
			}
		});

		const optimizedUrl = cloudinary.url(publicId, options);

		res.status(200).json({
			status: "success",
			data: {
				original_url: cloudinary.url(publicId),
				optimized_url: optimizedUrl,
				options,
			},
		});
	} catch (error) {
		console.error("Erreur lors de la génération de l'URL:", error);
		return next(new AppError("Erreur lors de la génération de l'URL", 500));
	}
});

// Fonction utilitaire pour extraire le public_id d'une URL Cloudinary
function extractPublicIdFromUrl(url) {
	if (!url || !url.includes("cloudinary.com")) return null;

	const parts = url.split("/");
	const uploadIndex = parts.findIndex((part) => part === "upload");

	if (uploadIndex === -1 || uploadIndex + 1 >= parts.length) return null;

	// Extraire le public_id (partie après 'upload' et avant l'extension)
	const publicIdWithVersion = parts.slice(uploadIndex + 1).join("/");
	return publicIdWithVersion.split(".")[0];
}
