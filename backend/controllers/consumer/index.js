// Export all consumer controllers
const consumerProfileController = require('./consumerProfileController');
const consumerAddressController = require('./consumerAddressController');
const consumerWishlistController = require('./consumerWishlistController');
const consumerSubscriptionController = require('./consumerSubscriptionController');
const consumerOrderController = require('./consumerOrderController');
const consumerReviewController = require('./consumerReviewController');
const consumerFavoriteController = require('./consumerFavoriteController');
const consumerLoyaltyController = require('./consumerLoyaltyController');
const consumerPaymentController = require('./consumerPaymentController');
const consumerPreferencesController = require('./consumerPreferencesController');
const consumerStatsController = require('./consumerStatsController');
const consumerNotificationController = require('./consumerNotificationController');

module.exports = {
  // Profile routes
  getMyProfile: consumerProfileController.getMyProfile,
  updateMyProfile: consumerProfileController.updateMyProfile,
  getDietaryPreferences: consumerProfileController.getDietaryPreferences,
  updateDietaryPreferences: consumerProfileController.updateDietaryPreferences,
  getAllergies: consumerProfileController.getAllergies,
  addAllergy: consumerProfileController.addAllergy,
  updateAllergy: consumerProfileController.updateAllergy,
  removeAllergy: consumerProfileController.removeAllergy,
  
  // Address routes
  getDeliveryAddresses: consumerAddressController.getDeliveryAddresses,
  addDeliveryAddress: consumerAddressController.addDeliveryAddress,
  updateDeliveryAddress: consumerAddressController.updateDeliveryAddress,
  removeDeliveryAddress: consumerAddressController.removeDeliveryAddress,
  setDefaultAddress: consumerAddressController.setDefaultAddress,
  
  // Wishlist routes
  getWishlist: consumerWishlistController.getWishlist,
  addToWishlist: consumerWishlistController.addToWishlist,
  removeFromWishlist: consumerWishlistController.removeFromWishlist,
  toggleWishlistNotifications: consumerWishlistController.toggleWishlistNotifications,
  
  // Subscription routes
  getSubscriptions: consumerSubscriptionController.getSubscriptions,
  createSubscription: consumerSubscriptionController.createSubscription,
  getSubscription: consumerSubscriptionController.getSubscription,
  updateSubscription: consumerSubscriptionController.updateSubscription,
  cancelSubscription: consumerSubscriptionController.cancelSubscription,
  pauseSubscription: consumerSubscriptionController.pauseSubscription,
  resumeSubscription: consumerSubscriptionController.resumeSubscription,
  
  // Order routes
  getCart: consumerOrderController.getCart,
  addToCart: consumerOrderController.addToCart,
  updateCartItem: consumerOrderController.updateCartItem,
  removeFromCart: consumerOrderController.removeFromCart,
  clearCart: consumerOrderController.clearCart,
  getMyOrders: consumerOrderController.getMyOrders,
  createOrder: consumerOrderController.createOrder,
  getMyOrder: consumerOrderController.getMyOrder,
  cancelOrder: consumerOrderController.cancelOrder,
  trackOrder: consumerOrderController.trackOrder,
  
  // Review routes
  getMyReviews: consumerReviewController.getMyReviews,
  createReview: consumerReviewController.createReview,
  getMyReview: consumerReviewController.getMyReview,
  updateMyReview: consumerReviewController.updateMyReview,
  deleteMyReview: consumerReviewController.deleteMyReview,
  
  // Favorite routes
  getFavorites: consumerFavoriteController.getFavorites,
  addFavorite: consumerFavoriteController.addFavorite,
  removeFavorite: consumerFavoriteController.removeFavorite,
  getFavoriteProducers: consumerFavoriteController.getFavoriteProducers,
  
  // Loyalty routes
  getLoyaltyStatus: consumerLoyaltyController.getLoyaltyStatus,
  redeemLoyaltyPoints: consumerLoyaltyController.redeemLoyaltyPoints,
  getLoyaltyHistory: consumerLoyaltyController.getLoyaltyHistory,
  
  // Payment routes
  getPaymentMethods: consumerPaymentController.getPaymentMethods,
  addPaymentMethod: consumerPaymentController.addPaymentMethod,
  updatePaymentMethod: consumerPaymentController.updatePaymentMethod,
  removePaymentMethod: consumerPaymentController.removePaymentMethod,
  setDefaultPaymentMethod: consumerPaymentController.setDefaultPaymentMethod,
  
  // Preferences routes
  getCommunicationPreferences: consumerPreferencesController.getCommunicationPreferences,
  updateCommunicationPreferences: consumerPreferencesController.updateCommunicationPreferences,
  getShoppingPreferences: consumerPreferencesController.getShoppingPreferences,
  updateShoppingPreferences: consumerPreferencesController.updateShoppingPreferences,
  getNotificationPreferences: consumerPreferencesController.getNotificationPreferences,
  updateNotificationPreferences: consumerPreferencesController.updateNotificationPreferences,
  
  // Stats routes
  getPurchaseHistory: consumerStatsController.getPurchaseHistory,
  getRecommendations: consumerStatsController.getRecommendations,
  getMyStats: consumerStatsController.getMyStats,
  getSpendingAnalytics: consumerStatsController.getSpendingAnalytics,
  
  // Notification routes
  getNotifications: consumerNotificationController.getNotifications,
  markNotificationsAsRead: consumerNotificationController.markNotificationsAsRead,
  markNotificationAsRead: consumerNotificationController.markNotificationAsRead,
  deleteNotification: consumerNotificationController.deleteNotification
};

