const Consumer = require('../models/Consumer');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const orderController = require('./orderController');

// Services organisés par type
const consumerProfileService = require('../services/consumer/consumerProfileService');
const consumerPreferencesService = require('../services/consumer/consumerPreferencesService');
const consumerAllergyService = require('../services/consumer/consumerAllergyService');
const consumerAddressService = require('../services/consumer/consumerAddressService');
const consumerWishlistService = require('../services/consumer/consumerWishlistService');
const consumerSubscriptionService = require('../services/consumer/consumerSubscriptionService');
const consumerLoyaltyService = require('../services/consumer/consumerLoyaltyService');
const consumerPaymentService = require('../services/consumer/consumerPaymentService');
const consumerOrderService = require('../services/consumer/consumerOrderService');
const consumerFavoriteService = require('../services/consumer/consumerFavoriteService');
const consumerStatsService = require('../services/consumer/consumerStatsService');
const consumerReviewService = require('../services/consumer/consumerReviewService');
const consumerNotificationService = require('../services/consumer/consumerNotificationService');

// ROUTES PROTÉGÉES CONSOMMATEUR

// Obtenir mon profil
exports.getMyProfile = catchAsync(async (req, res, next) => {
  try {
    const consumer = await consumerProfileService.getConsumerProfile(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { consumer }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Mettre à jour mon profil
exports.updateMyProfile = catchAsync(async (req, res, next) => {
  try {
    const consumer = await consumerProfileService.updateConsumerProfile(req.user.id, req.body);
    res.status(200).json({
      status: 'success',
      data: { consumer }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Gestion des préférences alimentaires
exports.getDietaryPreferences = catchAsync(async (req, res, next) => {
  try {
    const dietaryPreferences = await consumerPreferencesService.getDietaryPreferences(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { dietaryPreferences }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateDietaryPreferences = catchAsync(async (req, res, next) => {
  try {
    const dietaryPreferences = await consumerPreferencesService.updateDietaryPreferences(req.user.id, req.body.dietaryPreferences);
    res.status(200).json({
      status: 'success',
      data: { dietaryPreferences }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Gestion des allergies
exports.getAllergies = catchAsync(async (req, res, next) => {
  try {
    const allergies = await consumerAllergyService.getAllergies(req.user.id);
    res.status(200).json({
      status: 'success',
      results: allergies.length,
      data: { allergies }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.addAllergy = catchAsync(async (req, res, next) => {
  try {
    const allergy = await consumerAllergyService.addAllergy(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      data: { allergy }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateAllergy = catchAsync(async (req, res, next) => {
  try {
    const allergy = await consumerAllergyService.updateAllergy(req.user.id, req.params.allergyId, req.body);
    res.status(200).json({
      status: 'success',
      data: { allergy }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.removeAllergy = catchAsync(async (req, res, next) => {
  try {
    await consumerAllergyService.removeAllergy(req.user.id, req.params.allergyId);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Gestion des adresses de livraison
exports.getDeliveryAddresses = catchAsync(async (req, res, next) => {
  try {
    const addresses = await consumerAddressService.getDeliveryAddresses(req.user.id);
    res.status(200).json({
      status: 'success',
      results: addresses.length,
      data: { addresses }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.addDeliveryAddress = catchAsync(async (req, res, next) => {
  try {
    const address = await consumerAddressService.addDeliveryAddress(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      data: { address }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.updateDeliveryAddress = catchAsync(async (req, res, next) => {
  try {
    const address = await consumerAddressService.updateDeliveryAddress(req.user.id, req.params.addressId, req.body);
    res.status(200).json({
      status: 'success',
      data: { address }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.removeDeliveryAddress = catchAsync(async (req, res, next) => {
  try {
    await consumerAddressService.removeDeliveryAddress(req.user.id, req.params.addressId);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, error.message.includes('au moins') ? 400 : 404));
  }
});

exports.setDefaultAddress = catchAsync(async (req, res, next) => {
  try {
    const address = await consumerAddressService.setDefaultAddress(req.user.id, req.params.addressId);
    res.status(200).json({
      status: 'success',
      data: { address }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Gestion de la wishlist
exports.getWishlist = catchAsync(async (req, res, next) => {
  try {
    const wishlist = await consumerWishlistService.getWishlist(req.user.id);
    res.status(200).json({
      status: 'success',
      results: wishlist.length,
      data: { wishlist }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.addToWishlist = catchAsync(async (req, res, next) => {
  try {
    await consumerWishlistService.addToWishlist(req.user.id, req.body.productId);
    res.status(201).json({
      status: 'success',
      message: 'Produit ajouté à la liste de souhaits'
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.removeFromWishlist = catchAsync(async (req, res, next) => {
  try {
    await consumerWishlistService.removeFromWishlist(req.user.id, req.params.productId);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.toggleWishlistNotifications = catchAsync(async (req, res, next) => {
  try {
    const preferences = await consumerWishlistService.toggleWishlistNotifications(req.user.id, req.body.enabled);
    res.status(200).json({
      status: 'success',
      data: { preferences }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Gestion des abonnements (livraisons récurrentes)
exports.getSubscriptions = catchAsync(async (req, res, next) => {
  try {
    const subscriptions = await consumerSubscriptionService.getSubscriptions(req.user.id);
    res.status(200).json({
      status: 'success',
      results: subscriptions.length,
      data: { subscriptions }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.createSubscription = catchAsync(async (req, res, next) => {
  try {
    const subscription = await consumerSubscriptionService.createSubscription(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      data: { subscription }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.getSubscription = catchAsync(async (req, res, next) => {
  try {
    const subscription = await consumerSubscriptionService.getSubscription(req.user.id, req.params.subscriptionId);
    res.status(200).json({
      status: 'success',
      data: { subscription }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateSubscription = catchAsync(async (req, res, next) => {
  try {
    const subscription = await consumerSubscriptionService.updateSubscription(req.user.id, req.params.subscriptionId, req.body);
    res.status(200).json({
      status: 'success',
      data: { subscription }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.cancelSubscription = catchAsync(async (req, res, next) => {
  try {
    await consumerSubscriptionService.cancelSubscription(req.user.id, req.params.subscriptionId);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.pauseSubscription = catchAsync(async (req, res, next) => {
  try {
    await consumerSubscriptionService.pauseSubscription(req.user.id, req.params.subscriptionId);
    res.status(200).json({
      status: 'success',
      message: 'Abonnement mis en pause'
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.resumeSubscription = catchAsync(async (req, res, next) => {
  try {
    await consumerSubscriptionService.resumeSubscription(req.user.id, req.params.subscriptionId);
    res.status(200).json({
      status: 'success',
      message: 'Abonnement repris'
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Fonctions temporaires pour les fonctionnalités nécessitant d'autres modèles
const tempResponse = (message, statusCode = 200, data = {}) => catchAsync(async (req, res, next) => {
  res.status(statusCode).json({
    status: 'success',
    message: `Fonctionnalité en cours de développement - ${message}`,
    data
  });
});

exports.getCart = tempResponse('Modèle Cart requis', 200, { cart: [] });
exports.addToCart = tempResponse('Modèle Cart requis', 201);
exports.updateCartItem = tempResponse('Modèle Cart requis');
exports.removeFromCart = tempResponse('Modèle Cart requis', 204, null);
exports.clearCart = tempResponse('Modèle Cart requis', 204, null);

// Commandes
const Order = require('../models/Order');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

exports.getMyOrders = catchAsync(async (req, res, next) => {
  try {
    const orders = await consumerOrderService.getConsumerOrders(req.user.id, req.query);
    res.status(200).json({
      status: 'success',
      data: { orders }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.createOrder = (req, res, next) => orderController.createOrder(req, res, next);

exports.getMyOrder = catchAsync(async (req, res, next) => {
  try {
    const order = await consumerOrderService.getConsumerOrderById(req.user.id, req.params.orderId);
    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  try {
    const orderServiceMain = require('../services/orderService');
    const order = await orderServiceMain.cancelOrder(req.params.orderId, req.user.id, req.body.reason);
    res.status(200).json({
      status: 'success',
      message: 'Commande annulée avec succès',
      data: { order }
    });
  } catch (error) {
    return next(new AppError(error.message, error.message.includes('ne peut pas') ? 400 : 404));
  }
});

exports.trackOrder = catchAsync(async (req, res, next) => {
  try {
    const result = await consumerOrderService.trackConsumerOrder(req.user.id, req.params.orderId);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Fonctions utilitaires déplacées dans les services

// Avis et évaluations
exports.getMyReviews = catchAsync(async (req, res, next) => {
  try {
    const reviews = await consumerReviewService.getConsumerReviews(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { reviews }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.createReview = catchAsync(async (req, res, next) => {
  try {
    const review = await consumerReviewService.createReview(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      data: { review }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.getMyReview = catchAsync(async (req, res, next) => {
  try {
    const review = await consumerReviewService.getConsumerReviewById(req.user.id, req.params.reviewId);
    res.status(200).json({
      status: 'success',
      data: { review }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateMyReview = catchAsync(async (req, res, next) => {
  try {
    const review = await consumerReviewService.updateConsumerReview(req.user.id, req.params.reviewId, req.body);
    res.status(200).json({
      status: 'success',
      data: { review }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.deleteMyReview = catchAsync(async (req, res, next) => {
  try {
    await consumerReviewService.deleteConsumerReview(req.user.id, req.params.reviewId);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Gestion des favoris
exports.getFavorites = catchAsync(async (req, res, next) => {
  try {
    const favorites = await consumerFavoriteService.getFavoriteProducers(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { favorites }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.addFavorite = catchAsync(async (req, res, next) => {
  try {
    await consumerFavoriteService.addFavorite(req.user.id, req.body.producerId || req.body.transformerId, req.body.userType || 'producer');
    res.status(201).json({
      status: 'success',
      message: 'Ajouté aux favoris'
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.removeFavorite = catchAsync(async (req, res, next) => {
  try {
    await consumerFavoriteService.removeFavorite(req.user.id, req.params.producerId || req.params.transformerId, req.query.userType || 'producer');
    res.status(200).json({
      status: 'success',
      message: 'Retiré des favoris'
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Programme de fidélité
exports.getLoyaltyStatus = catchAsync(async (req, res, next) => {
  try {
    const loyalty = await consumerLoyaltyService.getLoyaltyStatus(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { loyalty }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.redeemLoyaltyPoints = catchAsync(async (req, res, next) => {
  try {
    const result = await consumerLoyaltyService.redeemLoyaltyPoints(req.user.id, req.body.points, req.body.description);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.getLoyaltyHistory = catchAsync(async (req, res, next) => {
  try {
    const history = await consumerLoyaltyService.getLoyaltyHistory(req.user.id, req.query.limit);
    res.status(200).json({
      status: 'success',
      results: history.length,
      data: { history }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Méthodes de paiement
exports.getPaymentMethods = catchAsync(async (req, res, next) => {
  try {
    const paymentMethods = await consumerPaymentService.getPaymentMethods(req.user.id);
    res.status(200).json({
      status: 'success',
      results: paymentMethods.length,
      data: { paymentMethods }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.addPaymentMethod = catchAsync(async (req, res, next) => {
  try {
    const paymentMethod = await consumerPaymentService.addPaymentMethod(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      data: { paymentMethod }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updatePaymentMethod = catchAsync(async (req, res, next) => {
  try {
    const paymentMethod = await consumerPaymentService.updatePaymentMethod(req.user.id, req.params.methodId, req.body);
    res.status(200).json({
      status: 'success',
      data: { paymentMethod }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.removePaymentMethod = catchAsync(async (req, res, next) => {
  try {
    await consumerPaymentService.removePaymentMethod(req.user.id, req.params.methodId);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.setDefaultPaymentMethod = catchAsync(async (req, res, next) => {
  try {
    const paymentMethod = await consumerPaymentService.setDefaultPaymentMethod(req.user.id, req.params.methodId);
    res.status(200).json({
      status: 'success',
      data: { paymentMethod }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Préférences de communication
exports.getCommunicationPreferences = catchAsync(async (req, res, next) => {
  try {
    const preferences = await consumerPreferencesService.getCommunicationPreferences(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { preferences }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateCommunicationPreferences = catchAsync(async (req, res, next) => {
  try {
    const preferences = await consumerPreferencesService.updateCommunicationPreferences(req.user.id, req.body);
    res.status(200).json({
      status: 'success',
      data: { preferences }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Statistiques et analytics
exports.getPurchaseHistory = catchAsync(async (req, res, next) => {
  try {
    const history = await consumerStatsService.getPurchaseHistory(req.user.id, req.query.limit);
    res.status(200).json({
      status: 'success',
      data: { purchaseHistory: history }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getRecommendations = catchAsync(async (req, res, next) => {
  try {
    const recommendations = await consumerStatsService.getRecommendations(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { recommendations }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getFavoriteProducers = catchAsync(async (req, res, next) => {
  try {
    const favorites = await consumerFavoriteService.getFavoriteProducers(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { favoriteProducers: favorites }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getMyStats = catchAsync(async (req, res, next) => {
  try {
    const stats = await consumerStatsService.getConsumerStats(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getSpendingAnalytics = catchAsync(async (req, res, next) => {
  try {
    const analytics = await consumerStatsService.getSpendingAnalytics(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { analytics }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Notifications (fonctionnalités temporaires)
const tempNotifResponse = (statusCode = 200, data = {}) => catchAsync(async (req, res, next) => {
  res.status(statusCode).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement - Modèle Notification requis',
    data
  });
});

exports.getNotifications = catchAsync(async (req, res, next) => {
  try {
    const notifications = await consumerNotificationService.getNotifications(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { notifications }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.markNotificationsAsRead = catchAsync(async (req, res, next) => {
  try {
    await consumerNotificationService.markNotificationsAsRead(req.user.id);
    res.status(200).json({
      status: 'success',
      message: 'Notifications marquées comme lues'
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.markNotificationAsRead = catchAsync(async (req, res, next) => {
  try {
    const notification = await consumerNotificationService.markNotificationAsRead(req.user.id, req.params.notificationId);
    res.status(200).json({
      status: 'success',
      data: { notification }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.deleteNotification = catchAsync(async (req, res, next) => {
  try {
    await consumerNotificationService.deleteNotification(req.user.id, req.params.notificationId);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Fonction utilitaire déplacée dans consumerSubscriptionService.calculateNextDelivery

// Gestion des préférences d'achat
exports.getShoppingPreferences = catchAsync(async (req, res, next) => {
  try {
    const shoppingPreferences = await consumerPreferencesService.getShoppingPreferences(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { shoppingPreferences }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateShoppingPreferences = catchAsync(async (req, res, next) => {
  try {
    const shoppingPreferences = await consumerPreferencesService.updateShoppingPreferences(req.user.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Préférences d\'achat mises à jour avec succès',
      data: { shoppingPreferences }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Gestion des préférences de notification
exports.getNotificationPreferences = catchAsync(async (req, res, next) => {
  try {
    const notificationPreferences = await consumerPreferencesService.getNotificationPreferences(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { notificationPreferences }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateNotificationPreferences = catchAsync(async (req, res, next) => {
  try {
    const notificationPreferences = await consumerPreferencesService.updateNotificationPreferences(req.user.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Préférences de notification mises à jour avec succès',
      data: { notificationPreferences }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});
