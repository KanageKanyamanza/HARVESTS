const AppError = require("../utils/appError");
const { localize } = require("../utils/translate");

/**
 * Gère les erreurs de conversion MongoDB (ID invalide)
 */
const handleCastErrorDB = (err) =>
	new AppError("errors.cast_error", 400, { path: err.path, value: err.value });

/**
 * Gère les erreurs de champs dupliqués dans MongoDB
 */
const handleDuplicateFieldsDB = (err) => {
	// errmsg est un accesseur de MongoServerError : à lire sur l'erreur d'origine
	// (la copie { ...err } ne le contient pas)
	const source = err.errmsg || err.message || "";
	const quoted = source.match(/(["'])(\\?.)*?\1/);
	const value = quoted ? quoted[0] : Object.values(err.keyValue || {}).join(", ");
	return new AppError("errors.duplicate_field", 400, { value });
};

/**
 * Gère les erreurs de validation Mongoose.
 * Les messages des schémas sont des clés de traduction (Jour 62) : ils sont
 * traduits dans la langue de la requête avant d'être concaténés.
 * Les champs encore déclarés `required: true` sans message personnalisé
 * produisent « Path `x` is required. » : on les traduit avec la clé générique.
 */
const DEFAULT_REQUIRED_RE = /^Path `[^`]+` is required\.$/;

const handleValidationErrorDB = (err, req) => {
	const errors = Object.values(err.errors || {}).map((el) => {
		if (el.kind === "required" && DEFAULT_REQUIRED_RE.test(el.message || "")) {
			return localize("validation.required", req.language);
		}
		return localize(el.message, req.language, el.properties || {});
	});
	return new AppError("errors.validation_failed", 400, { details: errors.join(". ") });
};

/**
 * Gère les erreurs de token JWT invalide
 */
const handleJWTError = () => new AppError("auth.invalid_token_relogin", 401);

/**
 * Gère les erreurs de token JWT expiré
 */
const handleJWTExpiredError = () => new AppError("auth.token_expired_relogin", 401);

// Message traduit dans la langue de la requête si c'est une clé (Jour 58)
const messageFor = (err, req) => localize(err.message, req.language, err.params);

/**
 * Envoie les erreurs en mode développement (avec détails complets)
 * `normalized` porte le statut et le message traduits ; `err` reste l'erreur
 * d'origine pour le débogage (pile, détails Mongoose).
 */
const sendErrorDev = (err, req, res, normalized = err) => {
	if (!req.originalUrl.startsWith("/api")) console.error("ERROR 💥", err);
	return res.status(normalized.statusCode).json({
		status: normalized.status,
		error: err,
		message: messageFor(normalized, req),
		stack: err.stack,
	});
};

/**
 * Envoie les erreurs en mode production (sans détails sensibles)
 */
const sendErrorProd = (err, req, res) => {
	if (err.isOperational) {
		return res.status(err.statusCode).json({
			status: err.status,
			message: messageFor(err, req),
		});
	}
	// console.error('ERROR 💥', err); // Log désactivé en production
	return res.status(req.originalUrl.startsWith("/api") ? 500 : err.statusCode).json({
		status: "error",
		message: localize("errors.generic", req.language),
	});
};

/**
 * Normalise les erreurs MongoDB/JWT, en développement comme en production,
 * pour que les statuts et les messages soient identiques dans les deux modes.
 */
const normalizeError = (err, req) => {
	let error = { ...err };
	error.message = err.message;
	error.name = err.name; // Assurer que le nom est copié
	error.code = err.code; // Assurer que le code est copié

	if (error.name === "CastError") error = handleCastErrorDB(error);
	if (error.code === 11000) error = handleDuplicateFieldsDB(err);
	if (error.name === "ValidationError") error = handleValidationErrorDB(err, req);
	if (error.validationError) error = handleValidationErrorDB(error.validationError, req);
	if (error.name === "JsonWebTokenError") error = handleJWTError();
	if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

	return error;
};

/**
 * Middleware global de gestion des erreurs
 * Centralise la gestion de toutes les erreurs de l'application
 */
module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";

	// Réponse déjà partie (flux, redirection…) : laisser Express clore la connexion
	if (res.headersSent) return next(err);

	const error = normalizeError(err, req);

	if (process.env.NODE_ENV === "development") {
		return sendErrorDev(err, req, res, error);
	}

	// Production, mais aussi test / staging / NODE_ENV absent : sans cette
	// branche par défaut, aucune réponse n'était envoyée et la requête restait pendante.
	return sendErrorProd(error, req, res);
};
