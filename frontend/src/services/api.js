import axios from 'axios';
import { getCurrentLanguage } from '../utils/i18n';
import { isValidToken } from '../utils/tokenValidation';
import { getConfig } from '../config/production';

// Configuration de base d'Axios
const appConfig = getConfig();
const API_BASE_URL = appConfig.API_BASE_URL;

// Créer une instance Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: appConfig.API_TIMEOUT || 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête
api.interceptors.request.use(
  (config) => {
    // Routes publiques qui ne nécessitent pas d'authentification
    const publicRoutes = [
      '/auth/signup',
      '/auth/login',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/verify-email',
      '/auth/resend-verification'
    ];
    
    // Vérifier si la route est publique
    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));
    
    // Ajouter le token d'authentification seulement pour les routes protégées
    if (!isPublicRoute) {
      const token = localStorage.getItem('harvests_token');
      if (isValidToken(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (token) {
        // Token invalide trouvé, le nettoyer
        console.warn('Token invalide détecté dans intercepteur, nettoyage...');
        localStorage.removeItem('harvests_token');
        localStorage.removeItem('harvests_user');
        localStorage.removeItem('harvests_auth_data');
      }
    }
    
    // Ajouter la langue actuelle
    const language = getCurrentLanguage();
    config.params = {
      ...config.params,
      lang: language
    };
    
    // Ajouter les headers de langue
    config.headers['Accept-Language'] = language === 'fr' ? 'fr-FR,fr;q=0.9' : 'en-US,en;q=0.9';
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gérer les erreurs de rate limiting en silence
    if (error.response?.status === 429) {
      console.warn('Trop de requêtes - Rate limiting activé');
      return Promise.reject(error);
    }
    
    console.error('API Error:', error);
    
    // Gérer les erreurs d'authentification
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || 'Non autorisé';
      
      // Vérifier si c'est une erreur de token spécifique
      if (errorMessage.includes('jwt malformed') || errorMessage.includes('jwt expired')) {
        console.warn('Token JWT invalide ou expiré, déconnexion...');
        localStorage.removeItem('harvests_token');
        localStorage.removeItem('harvests_user');
        localStorage.removeItem('harvests_auth_data');
        
        // Rediriger vers la page de connexion seulement si ce n'est pas une vérification en arrière-plan
        if (!error.config?.skipRedirect) {
          window.location.href = '/login';
        }
      } else {
        console.warn('Token invalide ou expiré:', errorMessage);
      }
    }
    
    // Gérer les erreurs de serveur
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.data?.message || 'Erreur serveur');
    }
    
    return Promise.reject(error);
  }
);

// Fonction utilitaire pour les requêtes API
export const apiRequest = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data, config = {}) => api.post(url, data, config),
  put: (url, data, config = {}) => api.put(url, data, config),
  patch: (url, data, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config)
};

// Export de l'instance API par défaut
export default api;
