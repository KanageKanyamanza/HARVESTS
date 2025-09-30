# Architecture des Services API

## Vue d'ensemble

Les services API sont organisés en modules séparés pour une meilleure maintenabilité et une séparation claire des responsabilités.

## Structure des Services

```
frontend/src/services/
├── api.js                 # Configuration Axios + Intercepteurs
├── authService.js         # Authentification & Profil utilisateur
├── consumerService.js     # Fonctionnalités consommateurs
├── producerService.js     # Fonctionnalités producteurs
├── userService.js         # Gestion utilisateurs (Admin)
├── productService.js      # Gestion produits
├── orderService.js        # Gestion commandes
├── index.js              # Export centralisé
├── README.md             # Documentation détaillée
└── ARCHITECTURE.md       # Ce fichier
```

## Diagramme d'Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        COMPOSANTS REACT                        │
├─────────────────────────────────────────────────────────────────┤
│  ConsumerDashboard  │  ProducerDashboard  │  Settings  │  ...  │
└─────────────────────┼─────────────────────┼────────────┼───────┘
                      │                     │            │
                      ▼                     ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICES LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  authService    │  consumerService  │  producerService  │  ...  │
│  - login()      │  - getProfile()   │  - getProfile()   │       │
│  - register()   │  - getCart()      │  - getProducts()  │       │
│  - getProfile() │  - getOrders()    │  - getOrders()    │       │
│  - logout()     │  - getWishlist()  │  - getStats()     │       │
└─────────────────┼───────────────────┼───────────────────┼───────┘
                  │                   │                   │
                  ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  api.js (Axios Instance)                                       │
│  ├── Request Interceptor  (Token + Language)                   │
│  ├── Response Interceptor (Error Handling)                     │
│  └── apiRequest Helper    (HTTP Methods)                       │
└─────────────────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API                                 │
├─────────────────────────────────────────────────────────────────┤
│  /auth/*          │  /consumers/*    │  /producers/*    │  ...  │
│  - login          │  - /me/profile   │  - /me/profile   │       │
│  - register       │  - /me/cart      │  - /me/products  │       │
│  - verify-email   │  - /me/orders    │  - /me/orders    │       │
│  - forgot-pwd     │  - /me/wishlist  │  - /me/stats     │       │
└─────────────────────────────────────────────────────────────────┘
```

## Flux de Données

### 1. Authentification
```
Component → authService.login() → api.js → /auth/login → Backend
```

### 2. Données Consommateur
```
Component → consumerService.getCart() → api.js → /consumers/me/cart → Backend
```

### 3. Données Producteur
```
Component → producerService.getProducts() → api.js → /producers/me/products → Backend
```

## Avantages de cette Architecture

### 🎯 **Séparation des Responsabilités**
- Chaque service gère un domaine métier spécifique
- Code organisé et facile à comprendre
- Évite la duplication de code

### 🔧 **Maintenabilité**
- Modifications isolées dans un service
- Tests unitaires facilités
- Debugging simplifié

### 📈 **Évolutivité**
- Ajout facile de nouveaux services
- Extension des fonctionnalités existantes
- Refactoring localisé

### ♻️ **Réutilisabilité**
- Services réutilisables dans différents composants
- Logique métier centralisée
- API cohérente

### 🧪 **Testabilité**
- Chaque service peut être testé indépendamment
- Mocking facilité
- Tests d'intégration simplifiés

## Patterns Utilisés

### 1. **Service Pattern**
Chaque service encapsule la logique d'accès aux données pour un domaine spécifique.

### 2. **Repository Pattern**
Les services agissent comme des repositories pour les données API.

### 3. **Facade Pattern**
L'index.js agit comme une façade pour simplifier les imports.

### 4. **Interceptor Pattern**
Les intercepteurs Axios gèrent les aspects transversaux (auth, langues, erreurs).

## Bonnes Pratiques

### ✅ **Imports**
```javascript
// ✅ Bon - Import depuis l'index
import { authService, consumerService } from '../services';

// ✅ Bon - Import spécifique si nécessaire
import { authService } from '../services/authService';

// ❌ Éviter - Import direct depuis api.js
import { authService } from '../services/api';
```

### ✅ **Gestion d'Erreurs**
```javascript
try {
  const response = await consumerService.getCart();
  // Traitement des données
} catch (error) {
  console.error('Erreur lors du chargement du panier:', error);
  // Gestion d'erreur
}
```

### ✅ **Paramètres**
```javascript
// ✅ Bon - Utilisation des paramètres
const products = await producerService.getProducts({
  status: 'active',
  category: 'fruits',
  limit: 10
});

// ✅ Bon - Paramètres optionnels
const orders = await orderService.getOrders({
  status: 'pending'
});
```

## Migration depuis l'ancienne structure

### Avant
```javascript
import { authService, consumerService } from '../services/api';
```

### Après
```javascript
import { authService, consumerService } from '../services';
```

Tous les imports ont été mis à jour automatiquement lors de la refactorisation.
