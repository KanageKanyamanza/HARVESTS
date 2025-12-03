import { apiRequest } from './api';

// Service d'authentification admin
export const adminAuthService = {
  // Connexion admin
  login: (credentials) => apiRequest.post('/admin/auth/login', credentials),
  
  // Déconnexion admin
  logout: () => apiRequest.post('/admin/auth/logout'),
  
  // Profil admin
  getProfile: () => apiRequest.get('/admin-management/me'),
  
  // Vérification de session admin
  verifyToken: () => apiRequest.get('/admin-management/me')
};
