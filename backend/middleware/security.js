const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssLib = require("xss");
const hpp = require("hpp");
const cors = require("cors");
const compression = require("compression");

/**
 * Configuration CORS pour autoriser les requêtes depuis les domaines spécifiés
 */
const corsOptions = {
	origin: function (origin, callback) {
		// Liste des domaines autorisés
		const allowedOrigins = [
			"http://localhost:3000", // React dev
			"http://localhost:5173", // Vite dev
			"http://localhost:5174", // Vite dev
			"http://localhost:5175", // Vite dev
			"http://localhost:5176", // Vite dev
			"http://localhost:5177", // Vite dev
			"https://harvests-six.vercel.app", // Frontend Vercel
			"https://www.harvests.site", // Production
			"https://harvests.site", // Production (sans www)
		];

		// Permettre les requêtes sans origin (mobile apps, Postman, etc.)
		if (!origin) return callback(null, true);

		if (allowedOrigins.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error("Non autorisé par CORS"));
		}
	},
	credentials: true, // Permettre les cookies
	methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
	allowedHeaders: [
		"Origin",
		"X-Requested-With",
		"Content-Type",
		"Accept",
		"Authorization",
		"Cache-Control",
		"Pragma",
	],
	exposedHeaders: ["X-Total-Count"],
};

/**
 * Limiteur de taux global pour toutes les routes API
 * Limite à 1000 requêtes par IP toutes les 15 minutes
 */
const globalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 1000, // limite chaque IP à 1000 requêtes par windowMs
	message: {
		error: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard.",
		retryAfter: "15 minutes",
	},
	standardHeaders: true,
	legacyHeaders: false,
	// Fonction personnalisée pour identifier les utilisateurs
	keyGenerator: (req) => {
		return req.user ? `user_${req.user.id}` : req.ip;
	},
});

/**
 * Limiteur strict pour les routes d'authentification
 * Limite à 10 tentatives de connexion par IP toutes les 15 minutes
 */
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // limite à 10 tentatives de connexion par IP
	message: {
		error:
			"Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.",
		retryAfter: "15 minutes",
	},
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: true, // Ne pas compter les requêtes réussies
});

/**
 * Limiteur pour la création de compte
 * Limite à 5 créations de compte par IP par heure
 */
const signupLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 heure
	max: 5, // limite à 5 créations de compte par IP par heure
	message: {
		error:
			"Trop de comptes créés depuis cette IP, veuillez réessayer dans 1 heure.",
		retryAfter: "1 heure",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

/**
 * Limiteur pour l'envoi d'emails (réinitialisation mot de passe, vérification)
 * Limite à 10 emails par IP toutes les 15 minutes
 */
const emailLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // limite à 10 emails par IP par 15 minutes
	message: {
		error:
			"Trop d'emails envoyés depuis cette IP, veuillez réessayer dans 15 minutes.",
		retryAfter: "15 minutes",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

/**
 * Limiteur pour les uploads de fichiers
 * Limite à 50 uploads par utilisateur toutes les 15 minutes
 */
const uploadLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 50, // limite à 50 uploads par utilisateur
	message: {
		error: "Trop d'uploads, veuillez réessayer plus tard.",
		retryAfter: "15 minutes",
	},
	keyGenerator: (req) => {
		return req.user ? `upload_${req.user.id}` : `upload_${req.ip}`;
	},
});

/**
 * Configuration Helmet pour sécuriser les headers HTTP
 * Protège contre les attaques XSS, clickjacking, etc.
 */
const helmetConfig = helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			styleSrc: [
				"'self'",
				"'unsafe-inline'",
				"https://fonts.googleapis.com",
				"https://cdn.jsdelivr.net",
			],
			fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
			imgSrc: [
				"'self'",
				"data:",
				"blob:",
				"http:",
				"https:",
				"https://res.cloudinary.com",
				"*.cloudinary.com",
			],
			scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
			connectSrc: [
				"'self'",
				"http:",
				"https:",
				"https://api.cloudinary.com",
				"*.cloudinary.com",
			],
			frameSrc: ["'self'"],
			objectSrc: ["'none'"],
			baseUri: ["'self'"],
			formAction: ["'self'"],
			upgradeInsecureRequests: null, // Désactivé car pose problème en dev/prod mixte
		},
	},
	crossOriginEmbedderPolicy: false,
	crossOriginResourcePolicy: { policy: "cross-origin" },
	hsts: {
		maxAge: 31536000,
		includeSubDomains: true,
		preload: true,
	},
	referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});

/**
 * Middleware de validation des types de fichiers
 * Vérifie que les fichiers uploadés sont d'un type autorisé
 */
const fileTypeValidation = (allowedTypes) => {
	return (req, res, next) => {
		if (!req.files && !req.file) {
			return next();
		}

		const files = req.files || [req.file];

		for (const file of files) {
			if (!allowedTypes.includes(file.mimetype)) {
				return res.status(400).json({
					status: "error",
					message: `Type de fichier non autorisé: ${
						file.mimetype
					}. Types autorisés: ${allowedTypes.join(", ")}`,
				});
			}
		}

		next();
	};
};

/**
 * Middleware de validation de la taille des fichiers
 * Vérifie que les fichiers ne dépassent pas la taille maximale autorisée
 */
const fileSizeValidation = (maxSize) => {
	return (req, res, next) => {
		if (!req.files && !req.file) {
			return next();
		}

		const files = req.files || [req.file];

		for (const file of files) {
			if (file.size > maxSize) {
				return res.status(400).json({
					status: "error",
					message: `Fichier trop volumineux. Taille maximum autorisée: ${
						maxSize / 1024 / 1024
					}MB`,
				});
			}
		}

		next();
	};
};

/**
 * Middleware de logging des requêtes suspectes
 * Détecte et enregistre les tentatives d'injection ou d'attaque
 */
const suspiciousActivityLogger = (req, res, next) => {
	const suspiciousPatterns = [
		/\$where/i,
		/\$ne/i,
		/<script>/i,
		/javascript:/i,
		/on\w+=/i,
		/eval\(/i,
		/union.*select/i,
		/drop.*table/i,
	];

	const requestString =
		JSON.stringify(req.body) + JSON.stringify(req.query) + req.url;

	for (const pattern of suspiciousPatterns) {
		if (pattern.test(requestString)) {
			// En production, ne pas logger les données sensibles (body/query)
			const logData = {
				ip: req.ip,
				userAgent: req.get("User-Agent"),
				url: req.url,
				method: req.method,
				timestamp: new Date().toISOString(),
			};

			// Ajouter les détails seulement en développement
			if (process.env.NODE_ENV === "development") {
				logData.body = req.body;
				logData.query = req.query;
				console.warn(`🚨 Activité suspecte détectée:`, logData);
			}

			break;
		}
	}

	next();
};

/**
 * Middleware de validation des paramètres d'ID MongoDB
 * Vérifie que les IDs dans les paramètres de route sont valides
 */
const validateObjectId = (req, res, next) => {
	const mongoose = require("mongoose");

	// Exclure les routes qui utilisent des tokens (pas des ObjectIds)
	const tokenRoutes = ["/verify-email", "/reset-password", "/forgot-password"];

	const isTokenRoute = tokenRoutes.some((route) => req.path.includes(route));
	if (isTokenRoute) {
		return next();
	}

	// Vérifier tous les paramètres qui finissent par 'Id' ou 'id'
	for (const [key, value] of Object.entries(req.params)) {
		if (
			(key.endsWith("Id") || key.endsWith("id")) &&
			!mongoose.Types.ObjectId.isValid(value)
		) {
			return res.status(400).json({
				status: "error",
				message: `ID invalide: ${key}`,
			});
		}
	}

	next();
};

/**
 * Configuration de compression des réponses HTTP
 * Réduit la taille des réponses pour améliorer les performances
 */
const compressionConfig = compression({
	filter: (req, res) => {
		if (req.headers["x-no-compression"]) {
			return false;
		}
		return compression.filter(req, res);
	},
	threshold: 1024, // Compresser seulement si > 1KB
});

/**
 * Middleware XSS personnalisé
 * Nettoie les données d'entrée pour prévenir les attaques XSS
 */
const xssMiddleware = (req, res, next) => {
	// Exclure les routes qui utilisent des tokens (pas besoin de nettoyer les tokens hexadécimaux)
	const tokenRoutes = ["/verify-email", "/reset-password", "/forgot-password"];

	const isTokenRoute = tokenRoutes.some((route) => req.path.includes(route));

	// Fonction récursive pour nettoyer les objets
	const cleanObject = (
		obj,
		visited = new WeakSet(),
		skipTokenParams = false,
	) => {
		if (obj === null || obj === undefined) {
			return obj;
		}

		// Éviter les références circulaires
		if (typeof obj === "object" && visited.has(obj)) {
			return obj;
		}

		if (typeof obj === "object") {
			visited.add(obj);

			// Traiter les tableaux
			if (Array.isArray(obj)) {
				return obj.map((item) => cleanObject(item, visited, skipTokenParams));
			}

			// Traiter les objets
			const cleaned = {};
			for (const key in obj) {
				if (obj.hasOwnProperty(key)) {
					// Ne pas nettoyer les paramètres 'token' dans les routes de tokens
					if (skipTokenParams && key === "token") {
						cleaned[key] = obj[key];
					} else {
						cleaned[key] = cleanObject(obj[key], visited, skipTokenParams);
					}
				}
			}
			return cleaned;
		}

		// Nettoyer les chaînes de caractères
		if (typeof obj === "string") {
			return xssLib(obj);
		}

		return obj;
	};

	// Nettoyer les données de req.body
	if (req.body && typeof req.body === "object") {
		req.body = cleanObject(req.body, new WeakSet(), isTokenRoute);
	}

	next();
};

module.exports = {
	// Middlewares de sécurité de base
	helmet: helmetConfig,
	cors: cors(corsOptions),
	mongoSanitize: mongoSanitize(),
	xss: xssMiddleware,
	hpp: hpp({
		whitelist: [
			"category",
			"region",
			"userType",
			"sort",
			"fields",
			"page",
			"limit",
		],
	}),
	compression: compressionConfig,

	// Limiteurs de taux
	globalLimiter,
	authLimiter,
	signupLimiter,
	emailLimiter,
	uploadLimiter,

	// Validations
	fileTypeValidation,
	fileSizeValidation,
	validateObjectId,

	// Logging
	suspiciousActivityLogger,

	// Types de fichiers autorisés par catégorie
	fileTypes: {
		images: ["image/jpeg", "image/png", "image/webp", "image/gif"],
		documents: [
			"application/pdf",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		],
		all: [
			"image/jpeg",
			"image/png",
			"image/webp",
			"image/gif",
			"application/pdf",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		],
	},

	// Tailles de fichiers
	fileSizes: {
		avatar: 5 * 1024 * 1024, // 5MB
		document: 10 * 1024 * 1024, // 10MB
		productImage: 5 * 1024 * 1024, // 5MB
	},
};
