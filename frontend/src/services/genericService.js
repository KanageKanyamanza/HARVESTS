import api from './api';
import axios from 'axios';

// Service générique pour les différents types d'utilisateurs
const createGenericService = (userType) => ({
  // Statistiques
  getStats: () => api.get(`/${userType}s/me/stats`),
  getSalesAnalytics: () => api.get(`/${userType}s/me/sales-analytics`),
  getRevenueAnalytics: () => api.get(`/${userType}s/me/revenue-analytics`),
  
  // Produits
  getProducts: (params = {}) => api.get(`/${userType}s/me/products`, { params }),
  getProduct: (id) => api.get(`/${userType}s/me/products/${id}`),
  createProduct: (data) => api.post(`/${userType}s/me/products`, data),
  updateProduct: (id, data) => api.patch(`/${userType}s/me/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/${userType}s/me/products/${id}`),
  submitProductForReview: (id) => api.patch(`/${userType}s/me/products/${id}/submit`),
  
  // Commandes
  getOrders: (params = {}) => api.get(`/${userType}s/me/orders`, { params }),
  getMyOrders: (params = {}) => api.get(`/${userType}s/me/orders`, { params }), // Alias pour getOrders
  getOrder: (id) => api.get(`/${userType}s/me/orders/${id}`),
  getMyOrder: (id) => api.get(`/${userType}s/me/orders/${id}`), // Alias pour getOrder
  createOrder: (data) => api.post(`/${userType}s/me/orders`, data),
  updateOrder: (id, data) => api.patch(`/${userType}s/me/orders/${id}`, data),
  updateOrderStatus: (id, data) => api.patch(`/${userType}s/me/orders/${id}`, data),
  
  // Profil
  getProfile: () => api.get(`/${userType}s/me`),
  updateProfile: (data) => api.patch(`/${userType}s/me`, data),
  
  // Paramètres
  getSettings: () => api.get(`/${userType}s/me/settings`),
  updateSettings: (data) => api.patch(`/${userType}s/me/settings`, data),
  
  // Certifications (pour producteurs et transformateurs)
  getCertifications: () => api.get(`/${userType}s/me/certifications`),
  addCertification: (data) => api.post(`/${userType}s/me/certifications`, data),
  updateCertification: (id, data) => api.patch(`/${userType}s/me/certifications/${id}`, data),
  deleteCertification: (id) => api.delete(`/${userType}s/me/certifications/${id}`),
  
  // Analytics
  getAnalytics: (params = {}) => api.get(`/${userType}s/me/analytics`, { params }),
  
  // Livraisons (pour transporteurs)
  getDeliveries: (params = {}) => api.get(`/${userType}s/me/deliveries`, { params }),
  getDelivery: (id) => api.get(`/${userType}s/me/deliveries/${id}`),
  updateDelivery: (id, data) => api.patch(`/${userType}s/me/deliveries/${id}`, data),
  
  // Fournisseurs (pour restaurateurs)
  getSuppliers: (params = {}) => api.get(`/${userType}s/me/suppliers`, { params }),
  getSupplier: (id) => api.get(`/${userType}s/me/suppliers/${id}`),
  addSupplier: (data) => api.post(`/${userType}s/me/suppliers`, data),
  updateSupplier: (id, data) => api.patch(`/${userType}s/me/suppliers/${id}`, data),
  deleteSupplier: (id) => api.delete(`/${userType}s/me/suppliers/${id}`),
  
  // Plats (pour restaurateurs)
  getDishes: (params = {}) => api.get(`/${userType}s/me/dishes`, { params }),
  getDish: (id) => api.get(`/${userType}s/me/dishes/${id}`),
  createDish: (data) => api.post(`/${userType}s/me/dishes`, data),
  updateDish: (id, data) => api.patch(`/${userType}s/me/dishes/${id}`, data),
  deleteDish: (id) => api.delete(`/${userType}s/me/dishes/${id}`),
  
  // Panier (pour consommateurs)
  getCart: (params = {}) => api.get(`/${userType}s/me/cart`, { params }),
  addToCart: (data) => api.post(`/${userType}s/me/cart`, data),
  updateCartItem: (id, data) => api.patch(`/${userType}s/me/cart/${id}`, data),
  removeFromCart: (id) => api.delete(`/${userType}s/me/cart/${id}`),
  clearCart: () => api.delete(`/${userType}s/me/cart`),
  
  // Favoris (pour consommateurs)
  getFavorites: (params = {}) => api.get(`/${userType}s/me/favorites`, { params }),
  addFavorite: (productId) => api.post(`/${userType}s/me/favorites`, { productId }),
  removeFavorite: (id) => api.delete(`/${userType}s/me/favorites/${id}`),
  
  // Avis (pour consommateurs)
  getMyReviews: (params = {}) => api.get(`/${userType}s/me/reviews`, { params }),
  createReview: (data) => api.post(`/${userType}s/me/reviews`, data),
  updateReview: (id, data) => api.patch(`/${userType}s/me/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/${userType}s/me/reviews/${id}`),
  
  // Analytics de dépenses (pour consommateurs)
  getSpendingAnalytics: () => api.get(`/${userType}s/me/spending-analytics`),
  
  // Zones de livraison (pour transporteurs)
  getDeliveryZones: () => api.get(`/${userType}s/me/delivery-zones`),
  updateDeliveryZones: (data) => api.patch(`/${userType}s/me/delivery-zones`, data),
  
  // Notifications
  getNotifications: () => api.get(`/${userType}s/me/notifications`),
  markNotificationsAsRead: (data) => api.patch(`/${userType}s/me/notifications`, data),

  // Routes publiques (sans paramètre lang automatique)
  getAllPublic: (params = {}) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    return axios.get(`${API_BASE_URL}/${userType}s`, { params });
  },
  getPublic: (id) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    return axios.get(`${API_BASE_URL}/${userType}s/${id}`);
  },
  getPublicProducts: (id, params = {}) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    return axios.get(`${API_BASE_URL}/${userType}s/${id}/products`, { params });
  },
  getPublicReviews: (id, params = {}) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    return axios.get(`${API_BASE_URL}/${userType}s/${id}/reviews`, { params });
  }
});

// Services spécifiques pour chaque type d'utilisateur
export const producerService = createGenericService('producer');
export const consumerService = createGenericService('consumer');
export const transformerService = createGenericService('transformer');
export const restaurateurService = createGenericService('restaurateur');
export const transporterService = createGenericService('transporter');
export const exporterService = createGenericService('exporter');

// Service pour créer un service personnalisé
export const createService = (userType) => createGenericService(userType);

export default {
  producerService,
  consumerService,
  transformerService,
  restaurateurService,
  transporterService,
  exporterService,
  createService
};
