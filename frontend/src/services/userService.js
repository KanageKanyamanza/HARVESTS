import { apiRequest } from './api';

// Service pour la gestion des utilisateurs (admin)
export const userService = {
  // Obtenir tous les utilisateurs (admin)
  getUsers: (params = {}) => apiRequest.get('/users', { params }),
  
  // Obtenir un utilisateur par ID
  getUser: (id) => apiRequest.get(`/users/${id}`),
  
  // Créer un utilisateur (admin)
  createUser: (userData) => apiRequest.post('/users', userData),
  
  // Mettre à jour un utilisateur (admin)
  updateUser: (id, userData) => apiRequest.patch(`/users/${id}`, userData),
  
  // Supprimer un utilisateur (admin)
  deleteUser: (id) => apiRequest.delete(`/users/${id}`),
  
  // Activer/Désactiver un utilisateur
  toggleUserStatus: (id, isActive) => apiRequest.patch(`/users/${id}/toggle-status`, { isActive }),
  
  // Approuver un utilisateur
  approveUser: (id) => apiRequest.patch(`/users/${id}/approve`),
  
  // Rejeter un utilisateur
  rejectUser: (id, reason) => apiRequest.patch(`/users/${id}/reject`, { reason }),
  
  // Obtenir les statistiques des utilisateurs
  getUserStats: () => apiRequest.get('/users/stats'),
  
  // Rechercher des utilisateurs
  searchUsers: (query, params = {}) => apiRequest.get('/users/search', { 
    params: { ...params, q: query } 
  }),
  
  // Obtenir les utilisateurs par type
  getUsersByType: (userType, params = {}) => apiRequest.get(`/users/type/${userType}`, { params }),
  
  // Obtenir les utilisateurs en attente d'approbation
  getPendingUsers: (params = {}) => apiRequest.get('/users/pending', { params }),
  
  // Exporter les utilisateurs
  exportUsers: (format = 'csv', params = {}) => apiRequest.get('/users/export', { 
    params: { ...params, format },
    responseType: 'blob'
  })
};
