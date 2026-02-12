const multer = require("multer");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");

// Configuration Multer pour les pièces jointes
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
	const allowedTypes = [
		"image/jpeg",
		"image/png",
		"image/webp",
		"image/gif",
		"application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"audio/mpeg",
		"audio/wav",
		"video/mp4",
		"video/webm",
	];

	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new AppError("Type de fichier non autorisé", 400), false);
	}
};

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
	limits: {
		fileSize: 25 * 1024 * 1024, // 25MB
		files: 5,
	},
});

exports.uploadAttachments = upload.array("attachments", 5);

const { cloudinary } = require("../../config/cloudinary");
const { Readable } = require("stream");

// ...

// Middleware pour traiter les pièces jointes
exports.processAttachments = catchAsync(async (req, res, next) => {
	if (!req.files || req.files.length === 0) return next();

	req.body.attachments = [];

	const uploadPromises = req.files.map((file) => {
		return new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder: "harvests/messages",
					resource_type: "auto", // auto detect image/video/raw
				},
				(error, result) => {
					if (error) return reject(error);

					let type = "document";
					if (result.resource_type === "image") type = "image";
					else if (result.resource_type === "video") type = "video";

					resolve({
						type,
						filename: file.originalname,
						originalName: file.originalname,
						url: result.secure_url,
						publicId: result.public_id,
						size: result.bytes,
						mimeType:
							result.format ?
								`${result.resource_type}/${result.format}`
							:	file.mimetype,
					});
				},
			);

			const bufferStream = new Readable();
			bufferStream.push(file.buffer);
			bufferStream.push(null);
			bufferStream.pipe(uploadStream);
		});
	});

	try {
		const uploadedAttachments = await Promise.all(uploadPromises);
		req.body.attachments = uploadedAttachments;
		next();
	} catch (error) {
		return next(new AppError("Erreur lors de l'upload des fichiers", 500));
	}
});
