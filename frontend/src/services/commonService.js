import api from './api';

// Service centralisé pour les informations communes à tous les utilisateurs
const commonService = {
  // Informations de profil communes
  getCommonProfile: () => api.get('/users/me/common-profile'),
  updateCommonProfile: (data) => api.patch('/users/me/common-profile', data),

  // Informations financières communes
  getFinancialInfo: () => api.get('/users/me/financial-info'),
  getBankAccount: () => api.get('/users/me/bank-account'),
  updateBankAccount: (data) => api.patch('/users/me/bank-account', data),
  verifyBankAccount: (data) => api.post('/users/me/bank-account/verify', data),

  // Méthodes de paiement
  getPaymentMethods: () => api.get('/users/me/payment-methods'),
  updatePaymentMethods: (data) => api.patch('/users/me/payment-methods', data),

  // Statistiques communes
  getCommonStats: () => api.get('/users/me/common-stats'),
  getRatings: () => api.get('/users/me/ratings'),
  getSalesStats: () => api.get('/users/me/sales-stats'),

  // Préférences de notification
  getNotificationSettings: () => api.get('/users/me/notification-settings'),
  getNotificationPreferences: () => api.get('/users/me/notifications'),
  updateNotificationPreferences: (data) => api.patch('/users/me/notifications', data),

  // Informations de vérification
  getVerificationStatus: () => api.get('/users/me/verification-status'),
  uploadVerificationDocument: (formData) => api.post('/users/me/verification-documents', formData),
  updateVerificationDocument: (docId, data) => api.patch(`/users/me/verification-documents/${docId}`, data),
  deleteVerificationDocument: (docId) => api.delete(`/users/me/verification-documents/${docId}`),

  // Adresses de livraison (pour consommateurs)
  getDeliveryAddresses: () => api.get('/users/me/delivery-addresses'),
  addDeliveryAddress: (data) => api.post('/users/me/delivery-addresses', data),
  updateDeliveryAddress: (addressId, data) => api.patch(`/users/me/delivery-addresses/${addressId}`, data),
  deleteDeliveryAddress: (addressId) => api.delete(`/users/me/delivery-addresses/${addressId}`),
  setDefaultDeliveryAddress: (addressId) => api.patch(`/users/me/delivery-addresses/${addressId}/set-default`),

  // Avatar et informations de base
  updateAvatar: (formData) => api.post('/users/me/avatar', formData),
  updateBasicInfo: (data) => api.patch('/users/me/basic-info', data),

  // Statistiques de performance (pour vendeurs)
  getPerformanceStats: () => api.get('/users/me/performance-stats'),
  getMonthlyStats: (year, month) => api.get(`/users/me/monthly-stats/${year}/${month}`),

  // Avis et évaluations
  getMyReviews: (page = 1, limit = 10) => api.get(`/users/me/reviews?page=${page}&limit=${limit}`),
  getReviewStats: () => api.get('/users/me/review-stats'),

  // Informations de boutique (pour vendeurs)
  getShopInfo: () => api.get('/users/me/shop-info'),
  updateShopInfo: (data) => api.patch('/users/me/shop-info', data),
  updateShopBanner: (formData) => api.post('/users/me/shop-banner', formData),
  updateShopDescription: (data) => api.patch('/users/me/shop-description', data),

  // Paramètres de compte
  getAccountSettings: () => api.get('/users/me/account-settings'),
  updateAccountSettings: (data) => api.patch('/users/me/account-settings', data),
  changePassword: (data) => api.patch('/users/me/change-password', data),
  deactivateAccount: (data) => api.patch('/users/me/deactivate', data)
};

export default commonService;
