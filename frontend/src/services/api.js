import axios from 'axios';
import { getCurrentLanguage } from '../utils/i18n';
import { isValidToken } from '../utils/tokenValidation';

// Configuration de base d'Axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Créer une instance Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Intercepteur de requête
api.interceptors.request.use(
  (config) => {
    // Ajouter le token d'authentification s'il existe et est valide
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
    // Loguer les réponses en mode développement
    if (import.meta.env.DEV) {
      console.log('API Response:', response.data);
    }
    
    return response;
  },
  (error) => {
    // Gestion des erreurs globales
    if (error.response) {
      const { status, data } = error.response;
      
      // Gestion des erreurs d'authentification et JWT malformé
      if (status === 401 || data?.message === 'jwt malformed' || data?.message === 'jwt expired') {
        console.warn('Token invalide ou expiré:', data?.message || 'Erreur 401');
        
        // Ne pas nettoyer automatiquement ni rediriger si c'est un appel de vérification en arrière-plan
        const isBackgroundCheck = error.config?.url?.includes('/users/me');
        
        if (!isBackgroundCheck) {
          // Token expiré ou invalide pour une vraie requête utilisateur
          localStorage.removeItem('harvests_token');
          localStorage.removeItem('harvests_user');
          localStorage.removeItem('harvests_auth_data');
          
          // Rediriger vers la page de connexion seulement si on n'y est pas déjà
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
            window.location.href = '/login';
          }
        }
      }
      
      // Gestion des erreurs de permission
      if (status === 403) {
        console.error('Access forbidden:', data.message);
      }
      
      // Gestion des erreurs serveur
      if (status >= 500) {
        console.error('Server error:', data.message);
      }
      
      // Loguer les erreurs en mode développement
      if (import.meta.env.DEV) {
        console.error('API Error:', error.response);
      }
    } else if (error.request) {
      // Erreur réseau
      console.error('Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Fonctions utilitaires pour les requêtes
export const apiRequest = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
};

// Services d'authentification
export const authService = {
  // Inscription
  register: (userData) => apiRequest.post('/auth/signup', userData),
  
  // Connexion
  login: (credentials) => apiRequest.post('/auth/login', credentials),
  
  // Déconnexion
  logout: () => apiRequest.post('/auth/logout'),
  
  // Vérification email
  verifyEmail: (token) => apiRequest.get(`/auth/verify-email/${token}`),
  
  // Renvoyer l'email de vérification
  resendVerification: (email) => apiRequest.post('/auth/resend-verification', { email }),
  
  // Mot de passe oublié
  forgotPassword: (email) => apiRequest.post('/auth/forgot-password', { email }),
  
  // Réinitialisation mot de passe
  resetPassword: (token, password) => 
    apiRequest.patch(`/auth/reset-password/${token}`, { password }),
  
  // Mise à jour mot de passe
  updatePassword: (passwords) => apiRequest.patch('/auth/update-password', passwords),
  
  // Obtenir le profil utilisateur actuel
  getProfile: () => apiRequest.get('/users/me'),
  
  // Mettre à jour le profil
  updateProfile: (userData) => apiRequest.patch('/users/update-me', userData),
};

// Services consommateur
export const consumerService = {
  // Profil consommateur
  getProfile: () => apiRequest.get('/consumers/me/profile'),
  updateProfile: (profileData) => apiRequest.patch('/consumers/me/profile', profileData),
  
  // Préférences alimentaires
  updateDietaryPreferences: (preferences) => apiRequest.patch('/consumers/me/dietary-preferences', { dietaryPreferences: preferences }),
  
  // Préférences d'achat et notifications (via updateProfile)
  updateShoppingPreferences: (preferences) => apiRequest.patch('/consumers/me/profile', { shoppingPreferences: preferences }),
  
  // Préférences de communication/notifications
  updateNotificationPreferences: (preferences) => apiRequest.patch('/consumers/me/communication-preferences', preferences),
};

// Services utilisateurs
export const userService = {
  // Obtenir tous les utilisateurs (admin)
  getUsers: (params = {}) => apiRequest.get('/users', { params }),
  
  // Obtenir un utilisateur par ID
  getUser: (id) => apiRequest.get(`/users/${id}`),
  
  // Mettre à jour un utilisateur
  updateUser: (id, userData) => apiRequest.patch(`/users/${id}`, userData),
  
  // Supprimer un utilisateur
  deleteUser: (id) => apiRequest.delete(`/users/${id}`),
  
  // Approuver un utilisateur
  approveUser: (id) => apiRequest.patch(`/users/${id}/approve`),
  
  // Suspendre un utilisateur
  suspendUser: (id) => apiRequest.patch(`/users/${id}/suspend`),
};

// Services produits
export const productService = {
  // Obtenir tous les produits
  getProducts: (params = {}) => apiRequest.get('/products', { params }),
  
  // Obtenir un produit par ID
  getProduct: (id) => apiRequest.get(`/products/${id}`),
  
  // Créer un nouveau produit
  createProduct: (productData) => apiRequest.post('/products', productData),
  
  // Mettre à jour un produit
  updateProduct: (id, productData) => apiRequest.patch(`/products/${id}`, productData),
  
  // Supprimer un produit
  deleteProduct: (id) => apiRequest.delete(`/products/${id}`),
  
  // Rechercher des produits
  searchProducts: (query, params = {}) => 
    apiRequest.get('/products/search', { params: { q: query, ...params } }),
  
  // Obtenir les produits par catégorie
  getProductsByCategory: (category, params = {}) =>
    apiRequest.get(`/products/category/${category}`, { params }),
  
  // Obtenir les produits d'un producteur
  getProductsByProducer: (producerId, params = {}) =>
    apiRequest.get(`/products/producer/${producerId}`, { params }),
  
  // Obtenir les produits populaires
  getFeaturedProducts: (params = {}) =>
    apiRequest.get('/products/featured', { params }),
};

// Services commandes
export const orderService = {
  // Obtenir toutes les commandes
  getOrders: (params = {}) => apiRequest.get('/orders', { params }),
  
  // Obtenir une commande par ID
  getOrder: (id) => apiRequest.get(`/orders/${id}`),
  
  // Créer une nouvelle commande
  createOrder: (orderData) => apiRequest.post('/orders', orderData),
  
  // Mettre à jour une commande
  updateOrder: (id, orderData) => apiRequest.patch(`/orders/${id}`, orderData),
  
  // Annuler une commande
  cancelOrder: (id) => apiRequest.patch(`/orders/${id}/cancel`),
  
  // Obtenir l'historique des commandes utilisateur
  getMyOrders: (params = {}) => apiRequest.get('/orders/my-orders', { params }),
  
  // Suivre une commande
  trackOrder: (id) => apiRequest.get(`/orders/${id}/track`),
};

// Services paiements
export const paymentService = {
  // Créer un paiement
  createPayment: (paymentData) => apiRequest.post('/payments', paymentData),
  
  // Obtenir les détails d'un paiement
  getPayment: (id) => apiRequest.get(`/payments/${id}`),
  
  // Obtenir l'historique des paiements
  getPaymentHistory: (params = {}) => apiRequest.get('/payments/history', { params }),
  
  // Traitement paiement Stripe
  processStripePayment: (paymentData) => 
    apiRequest.post('/payments/stripe/process', paymentData),
  
  // Traitement paiement Wave Money
  processWavePayment: (paymentData) => 
    apiRequest.post('/payments/wave/process', paymentData),
};

// Services notifications
export const notificationService = {
  // Obtenir les notifications
  getNotifications: (params = {}) => apiRequest.get('/notifications', { params }),
  
  // Marquer comme lu
  markAsRead: (id) => apiRequest.patch(`/notifications/${id}/read`),
  
  // Marquer toutes comme lues
  markAllAsRead: () => apiRequest.patch('/notifications/mark-all-read'),
  
  // Supprimer une notification
  deleteNotification: (id) => apiRequest.delete(`/notifications/${id}`),
  
  // Obtenir le nombre de notifications non lues
  getUnreadCount: () => apiRequest.get('/notifications/unread-count'),
};

// Services messages
export const messageService = {
  // Obtenir les conversations
  getConversations: (params = {}) => apiRequest.get('/messages/conversations', { params }),
  
  // Obtenir les messages d'une conversation
  getMessages: (conversationId, params = {}) => 
    apiRequest.get(`/messages/conversations/${conversationId}`, { params }),
  
  // Envoyer un message
  sendMessage: (messageData) => apiRequest.post('/messages', messageData),
  
  // Marquer les messages comme lus
  markMessagesAsRead: (conversationId) => 
    apiRequest.patch(`/messages/conversations/${conversationId}/read`),
};

// Services reviews
export const reviewService = {
  // Obtenir les avis d'un produit
  getProductReviews: (productId, params = {}) =>
    apiRequest.get(`/reviews/product/${productId}`, { params }),
  
  // Créer un avis
  createReview: (reviewData) => apiRequest.post('/reviews', reviewData),
  
  // Mettre à jour un avis
  updateReview: (id, reviewData) => apiRequest.patch(`/reviews/${id}`, reviewData),
  
  // Supprimer un avis
  deleteReview: (id) => apiRequest.delete(`/reviews/${id}`),
  
  // Obtenir mes avis
  getMyReviews: (params = {}) => apiRequest.get('/reviews/my-reviews', { params }),
};

// Service de santé de l'API
export const healthService = {
  // Vérifier l'état de l'API
  checkHealth: () => apiRequest.get('/health'),
};

export default api;
