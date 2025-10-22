import api from './api';

// Service générique pour les différents types d'utilisateurs
const createGenericService = (userType) => ({
  // Statistiques
  getStats: () => api.get(`/${userType}s/me/stats`),
  
  // Produits
  getProducts: (params = {}) => api.get(`/${userType}s/me/products`, { params }),
  getProduct: (id) => api.get(`/${userType}s/me/products/${id}`),
  createProduct: (data) => api.post(`/${userType}s/me/products`, data),
  updateProduct: (id, data) => api.patch(`/${userType}s/me/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/${userType}s/me/products/${id}`),
  
  // Commandes
  getOrders: (params = {}) => api.get(`/${userType}s/me/orders`, { params }),
  getOrder: (id) => api.get(`/${userType}s/me/orders/${id}`),
  updateOrder: (id, data) => api.patch(`/${userType}s/me/orders/${id}`, data),
  
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
  
  // Favoris (pour consommateurs)
  getFavorites: (params = {}) => api.get(`/${userType}s/me/favorites`, { params }),
  addFavorite: (data) => api.post(`/${userType}s/me/favorites`, data),
  removeFavorite: (id) => api.delete(`/${userType}s/me/favorites/${id}`),
  
  // Zones de livraison (pour transporteurs)
  getDeliveryZones: () => api.get(`/${userType}s/me/delivery-zones`),
  updateDeliveryZones: (data) => api.patch(`/${userType}s/me/delivery-zones`, data),
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
