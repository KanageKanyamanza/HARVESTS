import { apiRequest } from './api';

// Service pour les consommateurs
export const consumerService = {
  // Profile
  getProfile: () => apiRequest.get('/consumers/me/profile'),
  updateProfile: (data) => apiRequest.patch('/consumers/me/profile', data),
  
  // Dietary Preferences
  getDietaryPreferences: () => apiRequest.get('/consumers/me/dietary-preferences'),
  updateDietaryPreferences: (data) => apiRequest.patch('/consumers/me/dietary-preferences', data),
  
  // Allergies
  getAllergies: () => apiRequest.get('/consumers/me/allergies'),
  addAllergy: (data) => apiRequest.post('/consumers/me/allergies', data),
  updateAllergy: (id, data) => apiRequest.patch(`/consumers/me/allergies/${id}`, data),
  removeAllergy: (id) => apiRequest.delete(`/consumers/me/allergies/${id}`),
  
  // Delivery Addresses
  getDeliveryAddresses: () => apiRequest.get('/consumers/me/delivery-addresses'),
  addDeliveryAddress: (data) => apiRequest.post('/consumers/me/delivery-addresses', data),
  updateDeliveryAddress: (id, data) => apiRequest.patch(`/consumers/me/delivery-addresses/${id}`, data),
  removeDeliveryAddress: (id) => apiRequest.delete(`/consumers/me/delivery-addresses/${id}`),
  setDefaultAddress: (id) => apiRequest.patch(`/consumers/me/delivery-addresses/${id}/set-default`),
  
  // Shopping Preferences
  getShoppingPreferences: () => apiRequest.get('/consumers/me/shopping-preferences'),
  updateShoppingPreferences: (data) => apiRequest.patch('/consumers/me/shopping-preferences', data),
  
  // Notification Preferences
  getNotificationPreferences: () => apiRequest.get('/consumers/me/notification-preferences'),
  updateNotificationPreferences: (data) => apiRequest.patch('/consumers/me/notification-preferences', data),
  
  // Wishlist
  getWishlist: () => apiRequest.get('/consumers/me/wishlist'),
  addToWishlist: (productId) => apiRequest.post('/consumers/me/wishlist', { productId }),
  removeFromWishlist: (productId) => apiRequest.delete(`/consumers/me/wishlist/${productId}`),
  toggleWishlistNotifications: (productId, enabled) => 
    apiRequest.patch(`/consumers/me/wishlist/${productId}/notifications`, { enabled }),
  
  // Subscriptions
  getSubscriptions: () => apiRequest.get('/consumers/me/subscriptions'),
  createSubscription: (data) => apiRequest.post('/consumers/me/subscriptions', data),
  getSubscription: (id) => apiRequest.get(`/consumers/me/subscriptions/${id}`),
  updateSubscription: (id, data) => apiRequest.patch(`/consumers/me/subscriptions/${id}`, data),
  cancelSubscription: (id) => apiRequest.patch(`/consumers/me/subscriptions/${id}/cancel`),
  pauseSubscription: (id) => apiRequest.patch(`/consumers/me/subscriptions/${id}/pause`),
  resumeSubscription: (id) => apiRequest.patch(`/consumers/me/subscriptions/${id}/resume`),
  
  // Cart
  getCart: () => apiRequest.get('/consumers/me/cart'),
  addToCart: (data) => apiRequest.post('/consumers/me/cart', data),
  updateCartItem: (itemId, data) => apiRequest.patch(`/consumers/me/cart/${itemId}`, data),
  removeFromCart: (itemId) => apiRequest.delete(`/consumers/me/cart/${itemId}`),
  clearCart: () => apiRequest.delete('/consumers/me/cart'),
  
  // Orders
  getMyOrders: () => apiRequest.get('/consumers/me/orders'),
  createOrder: (data) => apiRequest.post('/consumers/me/orders', data),
  getMyOrder: (id) => apiRequest.get(`/consumers/me/orders/${id}`),
  cancelOrder: (id) => apiRequest.patch(`/consumers/me/orders/${id}/cancel`),
  trackOrder: (id) => apiRequest.get(`/consumers/me/orders/${id}/track`),
  
  // Reviews
  getMyReviews: () => apiRequest.get('/consumers/me/reviews'),
  createReview: (data) => apiRequest.post('/consumers/me/reviews', data),
  getMyReview: (id) => apiRequest.get(`/consumers/me/reviews/${id}`),
  updateMyReview: (id, data) => apiRequest.patch(`/consumers/me/reviews/${id}`, data),
  deleteMyReview: (id) => apiRequest.delete(`/consumers/me/reviews/${id}`),
  
  // Loyalty Program
  getLoyaltyStatus: () => apiRequest.get('/consumers/me/loyalty'),
  redeemLoyaltyPoints: (data) => apiRequest.post('/consumers/me/loyalty/redeem', data),
  getLoyaltyHistory: () => apiRequest.get('/consumers/me/loyalty/history'),
  
  // Payment Methods
  getPaymentMethods: () => apiRequest.get('/consumers/me/payment-methods'),
  addPaymentMethod: (data) => apiRequest.post('/consumers/me/payment-methods', data),
  updatePaymentMethod: (id, data) => apiRequest.patch(`/consumers/me/payment-methods/${id}`, data),
  removePaymentMethod: (id) => apiRequest.delete(`/consumers/me/payment-methods/${id}`),
  setDefaultPaymentMethod: (id) => apiRequest.patch(`/consumers/me/payment-methods/${id}/set-default`),
  
  // Purchase History & Recommendations
  getPurchaseHistory: () => apiRequest.get('/consumers/me/purchase-history'),
  getRecommendations: () => apiRequest.get('/consumers/me/recommendations'),
  getFavoriteProducers: () => apiRequest.get('/consumers/me/favorite-producers'),
  
  // Stats
  getMyStats: () => apiRequest.get('/consumers/me/stats'),
  getSpendingAnalytics: () => apiRequest.get('/consumers/me/spending-analytics'),
  
  // Notifications
  getNotifications: () => apiRequest.get('/consumers/me/notifications'),
  markNotificationsAsRead: () => apiRequest.patch('/consumers/me/notifications/read-all'),
  markNotificationAsRead: (id) => apiRequest.patch(`/consumers/me/notifications/${id}/read`),
  deleteNotification: (id) => apiRequest.delete(`/consumers/me/notifications/${id}`)
};
