const express = require('express');
const consumerController = require('../controllers/consumerController');
const authMiddleware = require('../controllers/auth/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Consumers
 *   description: 🛒 Gestion des consommateurs
 */

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware.protect);
// Permettre aux consommateurs ET aux restaurateurs (qui peuvent aussi être consommateurs)
router.use(authMiddleware.restrictTo('consumer', 'restaurateur'));

// Routes qui nécessitent une vérification d'email (seulement pour les méthodes POST/PATCH/DELETE)
const requireVerificationRoutes = [
  '/me/orders',
  '/me/cart',
  '/me/checkout',
  '/me/payments',
  '/me/favorites',
  '/me/reviews',
  '/me/notifications'
];

// Appliquer la vérification d'email seulement aux routes spécifiées et seulement pour les méthodes non-GET
router.use((req, res, next) => {
  const requiresVerification = requireVerificationRoutes.some(route => 
    req.path.startsWith(route)
  );
  
  // Autoriser les requêtes GET même sans vérification d'email
  if (requiresVerification && req.method !== 'GET') {
    return authMiddleware.requireVerification(req, res, next);
  }
  
  next();
});

/**
 * @swagger
 * /api/v1/consumers/me/profile:
 *   get:
 *     summary: Obtenir mon profil consommateur
 *     tags: [Consumers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil consommateur
 *   patch:
 *     summary: Mettre à jour mon profil consommateur
 *     tags: [Consumers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profil mis à jour
 */
router.get('/me/profile', consumerController.getMyProfile);
router.patch('/me/profile', consumerController.updateMyProfile);

// Gestion des préférences alimentaires
router.route('/me/dietary-preferences')
  .get(consumerController.getDietaryPreferences)
  .patch(consumerController.updateDietaryPreferences);

// Gestion des préférences d'achat
router.route('/me/shopping-preferences')
  .get(consumerController.getShoppingPreferences)
  .patch(consumerController.updateShoppingPreferences);

// Gestion des préférences de notification
router.route('/me/notification-preferences')
  .get(consumerController.getNotificationPreferences)
  .patch(consumerController.updateNotificationPreferences);

// Gestion des allergies
router.route('/me/allergies')
  .get(consumerController.getAllergies)
  .post(consumerController.addAllergy);

router.route('/me/allergies/:allergyId')
  .patch(consumerController.updateAllergy)
  .delete(consumerController.removeAllergy);

// Gestion des adresses de livraison
router.route('/me/delivery-addresses')
  .get(consumerController.getDeliveryAddresses)
  .post(consumerController.addDeliveryAddress);

router.route('/me/delivery-addresses/:addressId')
  .patch(consumerController.updateDeliveryAddress)
  .delete(consumerController.removeDeliveryAddress)
  .post(consumerController.setDefaultAddress);

// Gestion de la liste de souhaits (wishlist)
router.route('/me/wishlist')
  .get(consumerController.getWishlist)
  .post(consumerController.addToWishlist);

router.route('/me/wishlist/:productId')
  .delete(consumerController.removeFromWishlist);

router.patch('/me/wishlist/:productId/notifications', consumerController.toggleWishlistNotifications);

// Gestion des abonnements (livraisons récurrentes)
router.route('/me/subscriptions')
  .get(consumerController.getSubscriptions)
  .post(consumerController.createSubscription);

router.route('/me/subscriptions/:subscriptionId')
  .get(consumerController.getSubscription)
  .patch(consumerController.updateSubscription)
  .delete(consumerController.cancelSubscription);

router.patch('/me/subscriptions/:subscriptionId/pause', consumerController.pauseSubscription);
router.patch('/me/subscriptions/:subscriptionId/resume', consumerController.resumeSubscription);

/**
 * @swagger
 * /api/v1/consumers/me/cart:
 *   get:
 *     summary: Obtenir mon panier
 *     tags: [Consumers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contenu du panier
 *   post:
 *     summary: Ajouter un produit au panier
 *     tags: [Consumers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product
 *               - quantity
 *             properties:
 *               product:
 *                 type: string
 *                 format: objectId
 *               variant:
 *                 type: string
 *                 format: objectId
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Produit ajouté au panier
 *   delete:
 *     summary: Vider le panier
 *     tags: [Consumers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Panier vidé
 */
router.route('/me/cart')
  .get(consumerController.getCart)
  .post(consumerController.addToCart)
  .delete(consumerController.clearCart);

router.route('/me/cart/:itemId')
  .patch(consumerController.updateCartItem)
  .delete(consumerController.removeFromCart);

/**
 * @swagger
 * /api/v1/consumers/me/orders:
 *   get:
 *     summary: Obtenir mes commandes (Consommateur)
 *     tags: [Consumers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de mes commandes
 *   post:
 *     summary: Créer une commande depuis le panier
 *     tags: [Consumers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deliveryAddress:
 *                 type: object
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Commande créée
 */
router.route('/me/orders')
  .get(consumerController.getMyOrders)
  .post(consumerController.createOrder);

router.route('/me/orders/:orderId')
  .get(consumerController.getMyOrder)
  .patch(consumerController.cancelOrder);

// Suivi des commandes
router.get('/me/orders/:orderId/tracking', consumerController.trackOrder);

// Gestion des avis et évaluations
router.route('/me/reviews')
  .get(consumerController.getMyReviews)
  .post(consumerController.createReview);

router.route('/me/reviews/:reviewId')
  .get(consumerController.getMyReview)
  .patch(consumerController.updateMyReview)
  .delete(consumerController.deleteMyReview);

// Gestion des favoris
router.route('/me/favorites')
  .get(consumerController.getFavorites)
  .post(consumerController.addFavorite);

router.delete('/me/favorites/:productId', consumerController.removeFavorite);

// Programme de fidélité
router.get('/me/loyalty', consumerController.getLoyaltyStatus);
router.post('/me/loyalty/redeem', consumerController.redeemLoyaltyPoints);
router.get('/me/loyalty/history', consumerController.getLoyaltyHistory);

// Méthodes de paiement
router.route('/me/payment-methods')
  .get(consumerController.getPaymentMethods)
  .post(consumerController.addPaymentMethod);

router.route('/me/payment-methods/:methodId')
  .patch(consumerController.updatePaymentMethod)
  .delete(consumerController.removePaymentMethod);

router.patch('/me/payment-methods/:methodId/default', consumerController.setDefaultPaymentMethod);

// Préférences de communication
router.route('/me/communication-preferences')
  .get(consumerController.getCommunicationPreferences)
  .patch(consumerController.updateCommunicationPreferences);

// Historique d'achat et recommandations
router.get('/me/purchase-history', consumerController.getPurchaseHistory);
router.get('/me/recommendations', consumerController.getRecommendations);
router.get('/me/favorite-producers', consumerController.getFavoriteProducers);

// Statistiques personnelles
router.get('/me/stats', consumerController.getMyStats);
router.get('/me/spending-analytics', consumerController.getSpendingAnalytics);

// Notifications
router.route('/me/notifications')
  .get(consumerController.getNotifications)
  .patch(consumerController.markNotificationsAsRead);

router.route('/me/notifications/:notificationId')
  .patch(consumerController.markNotificationAsRead)
  .delete(consumerController.deleteNotification);

module.exports = router;
