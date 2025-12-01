import api from './api';

// Service pour les transformateurs
const transformerService = {
  // Gestion du profil
  getMyProfile: () => api.get('/transformers/me/profile'),
  updateMyProfile: (data) => api.patch('/transformers/me/profile', data),
  updateProfile: (data) => api.patch('/transformers/me/profile', data), // Alias pour compatibilité

  // Informations de l'entreprise
  getCompanyInfo: () => api.get('/transformers/me/company-info'),
  updateCompanyInfo: (data) => api.patch('/transformers/me/company-info', data),

  // Certifications
  getMyCertifications: () => api.get('/transformers/me/certifications'),
  addCertification: (data) => api.post('/transformers/me/certifications', data),
  updateCertification: (certId, data) => api.patch(`/transformers/me/certifications/${certId}`, data),
  removeCertification: (certId) => api.delete(`/transformers/me/certifications/${certId}`),

  // Fournisseurs préférés
  getPreferredSuppliers: () => api.get('/transformers/me/preferred-suppliers'),
  addPreferredSupplier: (data) => api.post('/transformers/me/preferred-suppliers', data),
  updateSupplierPreference: (supplierId, data) => api.patch(`/transformers/me/preferred-suppliers/${supplierId}`, data),
  removePreferredSupplier: (supplierId) => api.delete(`/transformers/me/preferred-suppliers/${supplierId}`),

  // Commandes de transformation
  getMyOrders: () => api.get('/transformers/me/orders'),
  getMyOrder: (orderId) => api.get(`/transformers/me/orders/${orderId}`),
  acceptOrder: (data) => api.post('/transformers/me/orders', data),
  updateOrderStatus: (orderId, data) => api.patch(`/transformers/me/orders/${orderId}`, data),
  cancelOrder: (orderId) => api.delete(`/transformers/me/orders/${orderId}`),
  trackOrder: (orderId) => api.get(`/transformers/me/orders/${orderId}/tracking`),
  updateOrderProgress: (orderId, data) => api.patch(`/transformers/me/orders/${orderId}/progress`, data),




  // Produits de la boutique
  getMyProducts: () => api.get('/transformers/me/products'),
  getProduct: (productId) => api.get(`/transformers/me/products/${productId}`),
  createProduct: (data) => api.post('/transformers/me/products', data),
  updateProduct: (productId, data) => api.patch(`/transformers/me/products/${productId}`, data),
  deleteProduct: (productId) => api.delete(`/transformers/me/products/${productId}`),
  submitProductForReview: (productId) => api.patch(`/transformers/me/products/${productId}/submit`),


  // Produits publics (pour la boutique publique)
  getPublicProducts: (transformerId) => api.get(`/transformers/${transformerId}/products`),

  // Statistiques et analytics
  getBusinessStats: () => api.get('/transformers/me/business-stats'),
  getStats: () => api.get('/transformers/me/business-stats'), // Alias pour compatibilité avec GenericDashboard
  getProductionAnalytics: (params = {}) => api.get('/transformers/me/production-analytics', { params }),
  getEfficiencyMetrics: () => api.get('/transformers/me/efficiency-metrics'),
  getRevenueAnalytics: () => api.get('/transformers/me/revenue-analytics'),


  // Évaluations et avis
  getMyReviews: (params = {}) => api.get('/transformers/me/reviews', { params }),
  markReviewAsRead: (reviewId) => api.patch(`/transformers/me/reviews/${reviewId}/read`),
  markAllReviewsAsRead: () => api.patch('/transformers/me/reviews/read-all'),
  respondToReview: (reviewId, data) => api.patch(`/transformers/me/reviews/${reviewId}/response`, data),

  // Gestion des réclamations
  getComplaints: () => api.get('/transformers/me/complaints'),
  handleComplaint: (data) => api.post('/transformers/me/complaints', data),
  updateComplaint: (complaintId, data) => api.patch(`/transformers/me/complaints/${complaintId}`, data),


  // Documents légaux
  getMyDocuments: () => api.get('/transformers/me/documents'),
  addDocument: (data) => api.post('/transformers/me/documents', data),

  // Notifications
  getNotifications: () => api.get('/transformers/me/notifications'),
  markNotificationsAsRead: (data) => api.patch('/transformers/me/notifications', data),

  // Alertes de production
  getProductionAlerts: () => api.get('/transformers/me/production-alerts'),
  createProductionAlert: (data) => api.post('/transformers/me/production-alerts', data),

  // Rapports de conformité
  getComplianceReports: () => api.get('/transformers/me/compliance-reports'),
  generateComplianceReport: (data) => api.post('/transformers/me/compliance-reports', data),


  // Routes publiques pour recherche
  getAllTransformers: (params) => api.get('/transformers', { params }),
  searchTransformers: (params) => api.get('/transformers/search', { params }),
  getTransformersByRegion: (region) => api.get(`/transformers/by-region/${region}`),
  getTransformersByType: (type) => api.get(`/transformers/by-type/${type}`),
  getTransformer: (id) => api.get(`/transformers/${id}`),
  getPublicTransformer: (id) => api.get(`/transformers/${id}/public`),
  getPublicTransformerProducts: (id) => api.get(`/transformers/${id}/products`),
  getTransformerServices: (id) => api.get(`/transformers/${id}/services`),
  getTransformerReviews: (id) => api.get(`/transformers/${id}/reviews`),
  getReviews: (id) => api.get(`/transformers/${id}/reviews`)
};

export default transformerService;

