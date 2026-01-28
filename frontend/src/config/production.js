// Configuration de production
export const PRODUCTION_CONFIG = {
	// URLs de production
	API_BASE_URL: "https://harvests-bp63.onrender.com/api/v1",
	FRONTEND_URL: "https://harvests-six.vercel.app",

	// Configuration de l'application
	APP_NAME: "Harvests",
	APP_VERSION: "1.0.0",
	APP_DESCRIPTION: "L'Amazon des produits agricoles africains",

	// Configuration de développement
	DEBUG: false,
	LOG_LEVEL: "error",

	// Configuration des fonctionnalités
	ENABLE_NOTIFICATIONS: true,
	ENABLE_CHAT: true,
	ENABLE_ANALYTICS: true,

	// Configuration régionale
	DEFAULT_COUNTRY: "CM",
	DEFAULT_CURRENCY: "XAF",
	DEFAULT_LANGUAGE: "fr",

	// Configuration de sécurité
	ENABLE_HTTPS: true,
	ENABLE_CSP: true,

	// Timeouts
	API_TIMEOUT: 120000, // 2 minutes pour la production (augmenté pour éviter les timeouts)
	UPLOAD_TIMEOUT: 300000, // 5 minutes pour les uploads
};

// Fonction pour obtenir la configuration selon l'environnement
export const getConfig = () => {
	const isProduction = import.meta.env.PROD;

	if (isProduction) {
		return {
			...PRODUCTION_CONFIG,
			// Override avec les variables d'environnement si disponibles
			API_BASE_URL:
				import.meta.env.VITE_API_URL || PRODUCTION_CONFIG.API_BASE_URL,
		};
	}

	// Configuration de développement
	return {
		API_BASE_URL: "http://localhost:5000/api/v1", // Forcé pour le debug
		FRONTEND_URL: "http://localhost:5173",
		DEBUG: true,
		LOG_LEVEL: "debug",
		API_TIMEOUT: 120000, // 2 minutes pour le développement aussi
		UPLOAD_TIMEOUT: 300000, // 5 minutes pour les uploads
	};
};
