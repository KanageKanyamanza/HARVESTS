# Services API

Ce dossier contient tous les services API organisés par domaine fonctionnel pour une meilleure maintenabilité.

## Structure

```
services/
├── api.js              # Configuration de base d'Axios et intercepteurs
├── authService.js      # Service d'authentification
├── consumerService.js  # Service pour les consommateurs
├── producerService.js  # Service pour les producteurs
├── userService.js      # Service de gestion des utilisateurs (admin)
├── productService.js   # Service de gestion des produits
├── orderService.js     # Service de gestion des commandes
├── index.js           # Export centralisé de tous les services
└── README.md          # Documentation
```

## Utilisation

### Import simple
```javascript
import { authService, consumerService, producerService } from '../services';
```

### Import spécifique
```javascript
import { authService } from '../services/authService';
```

## Services disponibles

### 🔐 authService
- `login(credentials)` - Connexion
- `register(userData)` - Inscription
- `logout()` - Déconnexion
- `getProfile()` - Obtenir le profil
- `updateProfile(userData)` - Mettre à jour le profil
- `resendVerification(email)` - Renvoyer l'email de vérification
- `forgotPassword(email)` - Mot de passe oublié
- `resetPassword(token, password)` - Réinitialiser le mot de passe
- `changePassword(currentPassword, newPassword)` - Changer le mot de passe

### 🛒 consumerService
- **Profil** : `getProfile()`, `updateProfile(data)`
- **Préférences alimentaires** : `getDietaryPreferences()`, `updateDietaryPreferences(data)`
- **Allergies** : `getAllergies()`, `addAllergy(data)`, `updateAllergy(id, data)`, `removeAllergy(id)`
- **Adresses de livraison** : `getDeliveryAddresses()`, `addDeliveryAddress(data)`, etc.
- **Préférences d'achat** : `getShoppingPreferences()`, `updateShoppingPreferences(data)`
- **Notifications** : `getNotificationPreferences()`, `updateNotificationPreferences(data)`
- **Liste de souhaits** : `getWishlist()`, `addToWishlist(productId)`, etc.
- **Abonnements** : `getSubscriptions()`, `createSubscription(data)`, etc.
- **Panier** : `getCart()`, `addToCart(data)`, `updateCartItem(itemId, data)`, etc.
- **Commandes** : `getMyOrders()`, `createOrder(data)`, `cancelOrder(id)`, etc.
- **Avis** : `getMyReviews()`, `createReview(data)`, `updateMyReview(id, data)`, etc.
- **Fidélité** : `getLoyaltyStatus()`, `redeemLoyaltyPoints(data)`, `getLoyaltyHistory()`
- **Méthodes de paiement** : `getPaymentMethods()`, `addPaymentMethod(data)`, etc.
- **Statistiques** : `getMyStats()`, `getSpendingAnalytics()`
- **Notifications** : `getNotifications()`, `markNotificationsAsRead()`, etc.

### 🌾 producerService
- **Profil** : `getProfile()`, `updateProfile(data)`
- **Cultures** : `getCrops()`, `addCrop(data)`, `updateCrop(id, data)`, `removeCrop(id)`
- **Certifications** : `getCertifications()`, `addCertification(data)`, etc.
- **Équipements** : `getEquipment()`, `addEquipment(data)`, etc.
- **Produits** : `getProducts(params)`, `createProduct(data)`, `updateProduct(id, data)`, etc.
- **Commandes** : `getOrders(params)`, `getOrder(id)`, `updateOrderStatus(id, data)`
- **Statistiques** : `getStats()`, `getSalesAnalytics()`, `getRevenueAnalytics()`
- **Transporteurs** : `getPreferredTransporters()`, `addPreferredTransporter(data)`, etc.
- **Documents** : `getDocuments()`, `addDocument(data)`, `uploadDocument(data)`
- **Paramètres de livraison** : `getDeliverySettings()`, `updateDeliverySettings(data)`

### 👥 userService (Admin)
- `getUsers(params)` - Obtenir tous les utilisateurs
- `getUser(id)` - Obtenir un utilisateur par ID
- `createUser(userData)` - Créer un utilisateur
- `updateUser(id, userData)` - Mettre à jour un utilisateur
- `deleteUser(id)` - Supprimer un utilisateur
- `toggleUserStatus(id, isActive)` - Activer/Désactiver un utilisateur
- `approveUser(id)` - Approuver un utilisateur
- `rejectUser(id, reason)` - Rejeter un utilisateur
- `getUserStats()` - Statistiques des utilisateurs
- `searchUsers(query, params)` - Rechercher des utilisateurs
- `exportUsers(format, params)` - Exporter les utilisateurs

### 📦 productService
- `getProducts(params)` - Obtenir tous les produits
- `getProduct(id)` - Obtenir un produit par ID
- `searchProducts(query, params)` - Rechercher des produits
- `getProductsByCategory(category, params)` - Produits par catégorie
- `getProductsByProducer(producerId, params)` - Produits par producteur
- `getRecommendedProducts(userId, params)` - Produits recommandés
- `getPopularProducts(params)` - Produits populaires
- `getRecentProducts(params)` - Produits récents
- `getProductsOnSale(params)` - Produits en promotion
- `getCategories()` - Obtenir les catégories
- `getProductReviews(productId, params)` - Avis d'un produit
- `addProductReview(productId, reviewData)` - Ajouter un avis
- `getProductStats(productId)` - Statistiques d'un produit
- `addToFavorites(productId)` - Ajouter aux favoris
- `removeFromFavorites(productId)` - Retirer des favoris
- `compareProducts(productIds)` - Comparer des produits
- `getSimilarProducts(productId)` - Produits similaires

### 📋 orderService
- `getOrders(params)` - Obtenir toutes les commandes
- `getOrder(id)` - Obtenir une commande par ID
- `createOrder(orderData)` - Créer une commande
- `updateOrder(id, orderData)` - Mettre à jour une commande
- `cancelOrder(id, reason)` - Annuler une commande
- `confirmOrder(id)` - Confirmer une commande
- `shipOrder(id, trackingData)` - Marquer comme expédiée
- `deliverOrder(id, deliveryData)` - Marquer comme livrée
- `trackOrder(id)` - Suivre une commande
- `getUserOrders(userId, params)` - Commandes d'un utilisateur
- `getProducerOrders(producerId, params)` - Commandes d'un producteur
- `getOrdersByStatus(status, params)` - Commandes par statut
- `getOrderStats(params)` - Statistiques des commandes
- `getRevenue(params)` - Revenus
- `exportOrders(format, params)` - Exporter les commandes
- `searchOrders(query, params)` - Rechercher des commandes
- `generateInvoice(orderId)` - Générer une facture
- `getReturns(params)` - Obtenir les retours
- `createReturn(orderId, returnData)` - Créer un retour
- `processReturn(returnId, action, data)` - Traiter un retour

## Configuration

### Intercepteurs
- **Requête** : Ajout automatique du token JWT et de la langue
- **Réponse** : Gestion des erreurs d'authentification et de serveur

### Variables d'environnement
- `VITE_API_URL` : URL de base de l'API (défaut: `http://localhost:8000/api/v1`)

## Avantages de cette structure

1. **Séparation des responsabilités** : Chaque service gère un domaine spécifique
2. **Maintenabilité** : Code organisé et facile à maintenir
3. **Réutilisabilité** : Services réutilisables dans différents composants
4. **Testabilité** : Chaque service peut être testé indépendamment
5. **Évolutivité** : Facile d'ajouter de nouveaux services ou endpoints
6. **Lisibilité** : Code plus lisible et organisé
