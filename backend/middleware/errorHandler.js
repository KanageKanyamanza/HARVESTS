const AppError = require("../utils/appError");

/**
 * Gère les erreurs de conversion MongoDB (ID invalide)
 */
const handleCastErrorDB = (err) => {
	const message = `Ressource invalide: ${err.path} = ${err.value}`;
	return new AppError(message, 400);
};

/**
 * Gère les erreurs de champs dupliqués dans MongoDB
 */
const handleDuplicateFieldsDB = (err) => {
	const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
	const message = `Valeur dupliquée: ${value}. Veuillez utiliser une autre valeur!`;
	return new AppError(message, 400);
};

/**
 * Gère les erreurs de validation Mongoose
 */
const handleValidationErrorDB = (err) => {
	const errors = Object.values(err.errors).map((el) => el.message);
	const message = `Données invalides: ${errors.join(". ")}`;
	return new AppError(message, 400);
};

/**
 * Gère les erreurs de token JWT invalide
 */
const handleJWTError = () =>
	new AppError("Token invalide. Veuillez vous reconnecter!", 401);

/**
 * Gère les erreurs de token JWT expiré
 */
const handleJWTExpiredError = () =>
	new AppError("Votre token a expiré! Veuillez vous reconnecter.", 401);

/**
 * Envoie les erreurs en mode développement (avec détails complets)
 */
const sendErrorDev = (err, req, res) => {
	if (req.originalUrl.startsWith("/api")) {
		return res.status(err.statusCode).json({
			status: err.status,
			error: err,
			message: err.message,
			stack: err.stack,
		});
	}

	console.error("ERROR 💥", err);
	return res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
		error: err,
		stack: err.stack,
	});
};

/**
 * Envoie les erreurs en mode production (sans détails sensibles)
 */
const sendErrorProd = (err, req, res) => {
	if (req.originalUrl.startsWith("/api")) {
		if (err.isOperational) {
			return res.status(err.statusCode).json({
				status: err.status,
				message: err.message,
			});
		}
		// console.error('ERROR 💥', err); // Log désactivé en production
		return res.status(500).json({
			status: "error",
			message: "Une erreur est survenue!",
		});
	}

	if (err.isOperational) {
		return res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});
	}
	// console.error('ERROR 💥', err); // Log désactivé en production
	return res.status(err.statusCode).json({
		status: "error",
		message: "Une erreur est survenue!",
	});
};

/**
 * Middleware global de gestion des erreurs
 * Centralise la gestion de toutes les erreurs de l'application
 */
module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";

	if (process.env.NODE_ENV === "development") {
		sendErrorDev(err, req, res);
	} else if (process.env.NODE_ENV === "production") {
		let error = { ...err };
		error.message = err.message;

		// Traitement des erreurs spécifiques MongoDB et JWT
		if (error.name === "CastError") error = handleCastErrorDB(error);
		if (error.code === 11000) error = handleDuplicateFieldsDB(error);
		if (error.name === "ValidationError")
			error = handleValidationErrorDB(error);
		if (error.name === "JsonWebTokenError") error = handleJWTError();
		if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

		sendErrorProd(error, req, res);
	}
};
