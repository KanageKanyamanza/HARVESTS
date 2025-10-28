import api from './api';

// Service pour les statistiques du dashboard
export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard/stats');
  return response.data;
};

// Service pour les données détaillées du dashboard
export const getRecentOrders = async (params = {}) => {
  const response = await api.get('/admin/dashboard/recent-orders', { params });
  return response.data;
};

export const getPendingProducts = async (params = {}) => {
  const response = await api.get('/admin/dashboard/pending-products', { params });
  return response.data;
};

export const getSalesChart = async (params = {}) => {
  const response = await api.get('/admin/dashboard/sales-chart', { params });
  return response.data;
};

export const getUserStats = async (params = {}) => {
  const response = await api.get('/admin/dashboard/user-stats', { params });
  return response.data;
};

export const getTopProducers = async (params = {}) => {
  const response = await api.get('/admin/dashboard/top-producers', { params });
  return response.data;
};

export const getProductStats = async (params = {}) => {
  const response = await api.get('/admin/dashboard/product-stats', { params });
  return response.data;
};

// Service pour la gestion des utilisateurs
export const getUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.patch(`/admin/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const banUser = async (id, reason) => {
  const response = await api.post(`/admin/users/${id}/ban`, { reason });
  return response.data;
};

export const unbanUser = async (id) => {
  const response = await api.post(`/admin/users/${id}/unban`);
  return response.data;
};

export const verifyUser = async (id) => {
  const response = await api.post(`/admin/users/${id}/verify`);
  return response.data;
};

// Service pour la gestion des produits
export const getProducts = async (params = {}) => {
  const response = await api.get('/admin/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/admin/products/${id}`);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.patch(`/admin/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/admin/products/${id}`);
  return response.data;
};

export const approveProduct = async (id) => {
  const response = await api.post(`/admin/products/${id}/approve`);
  return response.data;
};

export const rejectProduct = async (id, reason) => {
  const response = await api.post(`/admin/products/${id}/reject`, { reason });
  return response.data;
};

export const featureProduct = async (id) => {
  const response = await api.post(`/admin/products/${id}/feature`);
  return response.data;
};

export const unfeatureProduct = async (id) => {
  const response = await api.post(`/admin/products/${id}/unfeature`);
  return response.data;
};

// Service pour la gestion des plats
export const getDishes = async (params = {}) => {
  const response = await api.get('/admin/dishes', { params });
  return response.data;
};

export const getDishById = async (id) => {
  const response = await api.get(`/admin/dishes/${id}`);
  return response.data;
};

export const updateDish = async (id, data) => {
  const response = await api.patch(`/admin/dishes/${id}`, data);
  return response.data;
};

export const deleteDish = async (id) => {
  const response = await api.delete(`/admin/dishes/${id}`);
  return response.data;
};

export const approveDish = async (id) => {
  const response = await api.post(`/admin/dishes/${id}/approve`);
  return response.data;
};

export const rejectDish = async (id, reason) => {
  const response = await api.post(`/admin/dishes/${id}/reject`, { reason });
  return response.data;
};

// Service pour la gestion des commandes
export const getOrders = async (params = {}) => {
  const response = await api.get('/admin/orders', { params });
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/admin/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.patch(`/admin/orders/${id}/status`, { status });
  return response.data;
};

export const updatePaymentStatus = async (id, data) => {
  const response = await api.patch(`/admin/orders/${id}/payment-status`, data);
  return response.data;
};

export const cancelOrder = async (id, reason) => {
  const response = await api.post(`/admin/orders/${id}/cancel`, { reason });
  return response.data;
};

// Service pour la gestion des avis
export const getReviews = async (params = {}) => {
  const response = await api.get('/admin/reviews', { params });
  return response.data;
};

export const getReviewById = async (id) => {
  const response = await api.get(`/admin/reviews/${id}`);
  return response.data;
};

export const updateReview = async (id, reviewData) => {
  const response = await api.patch(`/admin/reviews/${id}`, reviewData);
  return response.data;
};

export const deleteReview = async (id) => {
  const response = await api.delete(`/admin/reviews/${id}`);
  return response.data;
};

export const approveReview = async (id) => {
  const response = await api.post(`/admin/reviews/${id}/approve`);
  return response.data;
};

export const rejectReview = async (id, reason) => {
  const response = await api.post(`/admin/reviews/${id}/reject`, { reason });
  return response.data;
};

// Service pour la gestion des messages
export const getMessages = async (params = {}) => {
  const response = await api.get('/admin/messages', { params });
  return response.data;
};

export const getMessageById = async (id) => {
  const response = await api.get(`/admin/messages/${id}`);
  return response.data;
};

export const replyToMessage = async (id, reply) => {
  const response = await api.post(`/admin/messages/${id}/reply`, { reply });
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await api.post(`/admin/messages/${id}/read`);
  return response.data;
};

export const deleteMessage = async (id) => {
  const response = await api.delete(`/admin/messages/${id}`);
  return response.data;
};

// Service pour les analytics
export const getAnalytics = async (params = {}) => {
  const response = await api.get('/admin/analytics', { params });
  return response.data;
};

export const getReports = async (type, params = {}) => {
  const response = await api.get(`/admin/reports/${type}`, { params });
  return response.data;
};

export const exportData = async (type, params = {}) => {
  const response = await api.get(`/admin/export/${type}`, { 
    params,
    responseType: 'blob'
  });
  return response.data;
};

// Service pour les paramètres système
export const getSystemSettings = async () => {
  const response = await api.get('/admin/settings');
  return response.data;
};

export const updateSystemSettings = async (settings) => {
  const response = await api.patch('/admin/settings', settings);
  return response.data;
};

// Service pour la gestion des administrateurs
export const getAdmins = async (params = {}) => {
  const response = await api.get('/admin-management/admins', { params });
  return response.data;
};

export const getAdminById = async (id) => {
  const response = await api.get(`/admin-management/admins/${id}`);
  return response.data;
};

export const createAdmin = async (adminData) => {
  const response = await api.post('/admin-management/admins', adminData);
  return response.data;
};

export const updateAdmin = async (id, adminData) => {
  const response = await api.put(`/admin-management/admins/${id}`, adminData);
  return response.data;
};

export const deleteAdmin = async (id) => {
  const response = await api.delete(`/admin-management/admins/${id}`);
  return response.data;
};

export const changeAdminPassword = async (id, passwordData) => {
  const response = await api.put(`/admin-management/admins/${id}/password`, passwordData);
  return response.data;
};

export const toggleAdminStatus = async (id) => {
  const response = await api.put(`/admin-management/admins/${id}/toggle-status`);
  return response.data;
};

export const getAdminStats = async () => {
  const response = await api.get('/admin-management/admins/stats');
  return response.data;
};

// Service pour le profil admin
export const getAdminProfile = async () => {
  const response = await api.get('/admin-management/me');
  return response.data;
};

export const updateAdminProfile = async (profileData) => {
  const response = await api.put('/admin-management/me', profileData);
  return response.data;
};

// Export nommé pour adminService
export const adminService = {
  // Dashboard
  getDashboardStats,
  getRecentOrders,
  getPendingProducts,
  getSalesChart,
  getUserStats,
  getTopProducers,
  getProductStats,
  
  // Users
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  banUser,
  unbanUser,
  verifyUser,
  
  // Products
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  approveProduct,
  rejectProduct,
  featureProduct,
  unfeatureProduct,
  
  // Orders
  getOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  
  // Reviews
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  approveReview,
  rejectReview,
  
  // Messages
  getMessages,
  getMessageById,
  replyToMessage,
  markAsRead,
  deleteMessage,
  
  // Analytics
  getAnalytics,
  getReports,
  exportData,
  
  // Settings
  getSystemSettings,
  updateSystemSettings,
  
  // Admin Management
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  changeAdminPassword,
  toggleAdminStatus,
  getAdminStats,
  getAdminProfile,
  updateAdminProfile
};

// Export par défaut aussi
export default adminService;
