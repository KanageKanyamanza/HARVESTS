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
	withCredentials: true,
	withXSRFToken: true,
	xsrfCookieName: "harvests_csrf_token",
	xsrfHeaderName: "x-csrf-token",
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
			"/auth/refresh",
			"/auth/forgot-password",
			"/auth/reset-password",
			"/auth/verify-email",
			"/auth/resend-verification",
			"/admin/auth/login",
			"/admin/auth/refresh",
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

// Indicateur pour éviter les boucles infinies de refresh
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
	refreshSubscribers.forEach((cb) => cb(token));
	refreshSubscribers = [];
};

const addRefreshSubscriber = (cb) => {
	refreshSubscribers.push(cb);
};

const clearAuthAndRedirect = (redirectPath = "/login") => {
	localStorage.removeItem("harvests_token");
	localStorage.removeItem("harvests_user");
	localStorage.removeItem("harvests_auth_data");
	window.location.replace(redirectPath);
};

// Intercepteur de réponse
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		// Gérer les erreurs de rate limiting en silence
		if (error.response?.status === 429) {
			console.warn("Trop de requêtes - Rate limiting activé");
			return Promise.reject(error);
		}

		// Gérer les erreurs de timeout
		if (error.code === "ECONNABORTED" && error.message.includes("timeout")) {
			const timeoutError = new Error("La requête a pris trop de temps. Veuillez réessayer.");
			timeoutError.isTimeout = true;
			return Promise.reject(timeoutError);
		}

		const isAdminLoginAttempt = error.config?.url?.includes("/admin/auth/login");
		if (!isAdminLoginAttempt) {
			console.error(
				"🚨 API ERROR:",
				`[${error.response?.status || 'NETWORK_ERROR'}]`,
				error.config?.url
			);
			if (error.response?.data) {
				console.error("📄 Détails de l'erreur API :", error.response.data);
			} else {
				console.error("📄 Erreur originale :", error.message || error);
			}
		}

		// Gérer les 401 — tentative de refresh automatique
		if (error.response?.status === 401) {
			const originalRequest = error.config;
			const currentPath = window.location.pathname;

			const isAuthEndpoint =
				originalRequest?.url?.includes("/auth/login") ||
				originalRequest?.url?.includes("/auth/refresh") ||
				originalRequest?.url?.includes("/admin/auth/login") ||
				originalRequest?.url?.includes("/admin/auth/refresh");

			// Ne pas tenter le refresh sur les endpoints d'auth eux-mêmes
			if (isAuthEndpoint || originalRequest?._retry) {
				localStorage.removeItem("harvests_token");
				localStorage.removeItem("harvests_user");
				localStorage.removeItem("harvests_auth_data");
				return Promise.reject(error);
			}

			// Si un refresh est déjà en cours, mettre la requête en file d'attente
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					addRefreshSubscriber((token) => {
						if (token) {
							originalRequest.headers.Authorization = `Bearer ${token}`;
							resolve(api(originalRequest));
						} else {
							reject(error);
						}
					});
				});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			const refreshEndpoint = currentPath.startsWith("/admin")
				? "/admin/auth/refresh"
				: "/auth/refresh";

			try {
				const { data } = await api.post(refreshEndpoint, {}, { withCredentials: true });
				const newToken = data.token;

				localStorage.setItem("harvests_token", newToken);
				api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
				originalRequest.headers.Authorization = `Bearer ${newToken}`;

				onRefreshed(newToken);
				isRefreshing = false;

				return api(originalRequest);
			} catch {
				isRefreshing = false;
				onRefreshed(null);
				clearAuthAndRedirect(currentPath.startsWith("/admin") ? "/admin/login" : "/login");
				return Promise.reject(error);
			}
		}

		if (error.response?.status >= 500) {
			console.error("Server error:", error.response?.data?.message || "Erreur serveur");
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
