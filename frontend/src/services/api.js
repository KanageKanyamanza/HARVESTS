import axios from "axios";
import { getCurrentLanguage } from "../utils/i18n";
import { isValidToken } from "../utils/tokenValidation";
import { getConfig } from "../config/production";

// Configuration de base d'Axios
const appConfig = getConfig();
export const API_BASE_URL = appConfig.API_BASE_URL;

// Créer une instance Axios
const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: appConfig.API_TIMEOUT || 60000, // 1 minute minimum
	headers: {
		"Content-Type": "application/json",
	},
	// Configuration du cache HTTP
	cache: {
		maxAge: 5 * 60 * 1000, // 5 minutes par défaut
	},
});

// Intercepteur de requête
api.interceptors.request.use(
	(config) => {
		// Routes publiques qui ne nécessitent pas d'authentification
		const publicRoutes = [
			"/auth/signup",
			"/auth/login",
			"/auth/forgot-password",
			"/auth/reset-password",
			"/auth/verify-email",
			"/auth/resend-verification",
		];

		// Routes qui peuvent être mises en cache (GET uniquement)
		const cacheableRoutes = [
			"/blogs",
			"/products",
			"/categories",
			"/producers",
			"/transformers",
		];

		// Vérifier si la route est publique
		const isPublicRoute = publicRoutes.some((route) =>
			config.url?.includes(route),
		);
		const isCacheableRoute =
			cacheableRoutes.some((route) => config.url?.includes(route)) &&
			config.method === "get";

		// Ajouter les headers de cache pour les routes cacheables
		if (isCacheableRoute && !config.headers["Cache-Control"]) {
			// Utiliser le cache du navigateur pour les requêtes GET publiques
			config.headers["Cache-Control"] = "public, max-age=300"; // 5 minutes
		}

		// Ajouter le token d'authentification seulement pour les routes protégées
		if (!isPublicRoute) {
			const token = localStorage.getItem("harvests_token");
			if (isValidToken(token)) {
				config.headers.Authorization = `Bearer ${token}`;
			} else if (token) {
				// Token invalide trouvé, le nettoyer
				console.warn("Token invalide détecté dans intercepteur, nettoyage...");
				localStorage.removeItem("harvests_token");
				localStorage.removeItem("harvests_user");
				localStorage.removeItem("harvests_auth_data");
			}
		}

		// Ajouter la langue actuelle
		const language = getCurrentLanguage();
		// Temporairement désactivé pour debug
		// config.params = {
		//   ...config.params,
		//   lang: language
		// };

		// Ajouter les headers de langue
		config.headers["Accept-Language"] =
			language === "fr" ? "fr-FR,fr;q=0.9" : "en-US,en;q=0.9";

		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Intercepteur de réponse
api.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		// Gérer les erreurs de rate limiting en silence
		if (error.response?.status === 429) {
			console.warn("Trop de requêtes - Rate limiting activé");
			return Promise.reject(error);
		}

		// Gérer les erreurs de timeout
		if (error.code === "ECONNABORTED" && error.message.includes("timeout")) {
			console.error("Timeout de requête:", error.message);
			const timeoutError = new Error(
				"La requête a pris trop de temps. Veuillez réessayer.",
			);
			timeoutError.isTimeout = true;
			return Promise.reject(timeoutError);
		}

		// Ne pas afficher l'erreur dans la console pour les tentatives de connexion admin
		// car c'est normal qu'elles échouent pour les utilisateurs non-admin
		const isAdminLoginAttempt =
			error.config?.url?.includes("/admin/auth/login");
		if (!isAdminLoginAttempt) {
			console.error("API Error:", error);
		}

		// Gérer les erreurs d'authentification
		if (error.response?.status === 401) {
			const errorMessage = error.response?.data?.message || "Non autorisé";

			// Ignorer les erreurs 401 sur les routes admin de connexion car c'est normal
			// quand un utilisateur non-admin essaie de se connecter
			const isAdminLoginAttempt =
				error.config?.url?.includes("/admin/auth/login");

			if (!isAdminLoginAttempt) {
				// Vérifier si c'est une erreur de token spécifique
				if (
					errorMessage.includes("jwt malformed") ||
					errorMessage.includes("jwt expired") ||
					errorMessage.includes("n'existe plus") ||
					errorMessage.includes("User not found")
				) {
					console.warn(
						"Token JWT invalide, expiré ou utilisateur inexistant, déconnexion...",
						errorMessage,
					);
					localStorage.removeItem("harvests_token");
					localStorage.removeItem("harvests_user");
					localStorage.removeItem("harvests_auth_data");

					// Rediriger vers la page de connexion seulement si ce n'est pas une vérification en arrière-plan
					if (!error.config?.skipRedirect) {
						window.location.href = "/login";
					}
				} else {
					console.warn("Token invalide ou expiré:", errorMessage);
				}
			}
		}

		// Gérer les erreurs de serveur
		if (error.response?.status >= 500) {
			console.error(
				"Server error:",
				error.response?.data?.message || "Erreur serveur",
			);
		}

		return Promise.reject(error);
	},
);

// Fonction utilitaire pour les requêtes API
export const apiRequest = {
	get: (url, config = {}) => api.get(url, config),
	post: (url, data, config = {}) => api.post(url, data, config),
	put: (url, data, config = {}) => api.put(url, data, config),
	patch: (url, data, config = {}) => api.patch(url, data, config),
	delete: (url, config = {}) => api.delete(url, config),
};

// Export de l'instance API par défaut
export default api;
