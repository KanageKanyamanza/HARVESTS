import { apiRequest } from './api';

// Service d'authentification
export const authService = {
  // Connexion
  login: (credentials) => apiRequest.post('/auth/login', credentials),
  
  // Inscription
  register: (userData) => apiRequest.post('/auth/signup', userData),
  
  // Déconnexion
  logout: async () => {
    try {
      return await apiRequest.post('/auth/logout');
    } catch (error) {
      // Si l'endpoint n'existe pas (404), on considère que la déconnexion locale est suffisante
      if (error.response?.status === 404) {
        console.log('Endpoint logout non disponible - déconnexion locale uniquement');
        return { data: { message: 'Déconnexion locale réussie' } };
      }
      throw error;
    }
  },
  
  // Vérification d'email
  resendVerification: (email) => apiRequest.post('/auth/resend-verification', { email }),
  
  // Mot de passe oublié
  forgotPassword: (email) => apiRequest.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiRequest.post('/auth/reset-password', { token, password }),
  
  // Changement de mot de passe
  changePassword: (currentPassword, newPassword) => 
    apiRequest.patch('/auth/change-password', { currentPassword, newPassword }),
  
  // Profil utilisateur
  getProfile: () => apiRequest.get('/users/me'),
  updateProfile: (userData) => apiRequest.patch('/users/update-me', userData),
  
  // Vérification de session
  verifyToken: () => apiRequest.get('/auth/verify-token'),
  
  // Rafraîchissement de token
  refreshToken: () => apiRequest.post('/auth/refresh-token')
};
