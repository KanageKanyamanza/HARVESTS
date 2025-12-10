# 🏗️ Architecture Détaillée - Harvests Platform

Documentation complète de l'architecture de la plateforme Harvests.

## 📋 Vue d'Ensemble

Harvests est une plateforme e-commerce full-stack avec:
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Architecture**: RESTful API avec microservices pattern
- **Sécurité**: JWT, rate limiting, validation complète

---

## 🗂️ Structure du Projet

```
HARVESTS/
├── backend/                    # API Backend
│   ├── app.js                 # Configuration Express principale
│   ├── server.js              # Point d'entrée serveur
│   ├── config/                # Configuration
│   │   ├── database.js        # MongoDB
│   │   ├── swagger.js         # Documentation API
│   │   ├── cloudinary.js      # Upload images
│   │   ├── i18n.js            # Internationalisation
│   │   └── logger.js          # Logging Winston
│   ├── controllers/           # Logique métier (26+ controllers)
│   │   ├── auth/              # Authentification
│   │   ├── admin/              # Administration
│   │   ├── producer/          # Producteurs
│   │   ├── product/           # Produits
│   │   ├── order/             # Commandes
│   │   ├── payment/           # Paiements
│   │   └── ...
│   ├── models/                # Modèles Mongoose (14+ modèles)
│   │   ├── User.js            # Utilisateur de base
│   │   ├── Producer.js        # Producteur
│   │   ├── Product.js         # Produit
│   │   ├── Order.js           # Commande
│   │   └── ...
│   ├── routes/                # Routes API (26 routes)
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── ...
│   ├── services/              # Services métier (73+ services)
│   │   ├── emailService.js    # Envoi emails
│   │   ├── paymentService.js  # Paiements
│   │   ├── profileService.js  # Profils centralisés
│   │   └── ...
│   ├── middleware/            # Middlewares
│   │   ├── security.js        # Sécurité (helmet, CORS, etc.)
│   │   ├── errorHandler.js    # Gestion erreurs
│   │   ├── i18nResponse.js    # Réponses bilingues
│   │   └── ...
│   ├── utils/                 # Utilitaires (23+ fichiers)
│   │   ├── appError.js
│   │   ├── catchAsync.js
│   │   └── ...
│   └── views/                 # Templates email (Pug)
│
├── frontend/                   # Interface React
│   ├── src/
│   │   ├── components/        # Composants réutilisables (262+)
│   │   │   ├── common/        # Composants communs
│   │   │   ├── chat/         # Chatbot
│   │   │   └── ...
│   │   ├── pages/            # Pages de l'application
│   │   │   ├── dashboard/    # Dashboards par type
│   │   │   ├── auth/         # Authentification
│   │   │   └── ...
│   │   ├── services/         # Services API frontend
│   │   ├── hooks/            # Hooks personnalisés
│   │   ├── context/          # Context API (Auth, etc.)
│   │   └── utils/            # Utilitaires
│   └── public/
│
└── docs/                      # Documentation complète
```

---

## 🔄 Flux de Données

### Requête API

```
Client (Frontend/Mobile)
    ↓
HTTP Request
    ↓
Express Middleware Stack
    ├── Security (Helmet, CORS)
    ├── Rate Limiting
    ├── Body Parser
    ├── i18n Detection
    └── Validation
    ↓
Route Handler
    ↓
Controller
    ├── Validation
    ├── Service Layer
    └── Model Layer
    ↓
MongoDB
    ↓
Response
    ├── i18n Translation
    ├── Error Handling
    └── Formatting
    ↓
Client
```

### Authentification

```
1. POST /api/v1/auth/login
   ↓
2. Controller vérifie credentials
   ↓
3. Génère JWT token
   ↓
4. Envoie token (cookie + header)
   ↓
5. Client stocke token
   ↓
6. Requêtes suivantes avec Authorization header
   ↓
7. Middleware vérifie token
   ↓
8. Accès autorisé
```

---

## 🗄️ Architecture Base de Données

### MongoDB Collections

#### Users Collection (Discriminator Pattern)

```
users/
├── Base User Schema
│   ├── email, password, userType
│   ├── firstName, lastName, phone
│   ├── address, country, region
│   └── avatar, shopBanner, shopLogo
│
├── Producer Documents
│   ├── farmName, farmSize
│   ├── farmingType, crops
│   └── certifications
│
├── Transformer Documents
│   ├── companyName
│   ├── transformationType
│   └── facilities
│
├── Consumer Documents
│   ├── preferences
│   └── allergies
│
├── Restaurateur Documents
│   ├── restaurantName
│   ├── cuisineType
│   └── dishes[]
│
├── Exporter Documents
│   └── exportLicenses
│
└── Transporter Documents
    └── vehicleInfo
```

#### Autres Collections

- **products**: Catalogue produits
- **orders**: Commandes
- **reviews**: Avis et évaluations
- **payments**: Transactions
- **messages**: Conversations
- **notifications**: Notifications
- **blogs**: Articles de blog
- **subscriptions**: Abonnements

### Relations

```
User (Producer)
    ↓ has many
Product
    ↓ has many
Order
    ↓ has one
Payment
    ↓ has many
Review
```

---

## 🔧 Services et Couches

### Service Layer

Les services encapsulent la logique métier:

#### Email Service
```javascript
emailService.sendVerificationEmail(user)
emailService.sendPasswordReset(user, token)
emailService.sendOrderConfirmation(order)
```

#### Payment Service
```javascript
paymentService.processWavePayment(order, phone)
paymentService.processStripePayment(order, card)
paymentService.processPayPalPayment(order)
```

#### Profile Service (Centralisé)
```javascript
profileService.getProfile(userId)
profileService.updateProfile(userId, data)
profileService.uploadImage(userId, type, file)
```

### Controller Layer

Les controllers gèrent les requêtes HTTP:

```javascript
// Exemple: ProductController
exports.createProduct = async (req, res, next) => {
  // 1. Validation
  // 2. Appel service
  // 3. Réponse
}
```

### Model Layer

Les modèles définissent la structure des données:

```javascript
// User Model avec discriminators
const User = mongoose.model('User', baseUserSchema);
const Producer = User.discriminator('producer', producerSchema);
```

---

## 🔐 Sécurité

### Middleware Stack

1. **Helmet**: Headers de sécurité HTTP
2. **CORS**: Gestion origines autorisées
3. **Rate Limiting**: Protection DDoS
4. **Mongo Sanitize**: Protection NoSQL injection
5. **XSS**: Protection attaques XSS
6. **HPP**: Prévention pollution paramètres
7. **Compression**: Compression réponses
8. **JWT Auth**: Authentification token

### Rate Limiting

```javascript
// Global: 100 req/15min par IP
app.use('/api', globalLimiter);

// Auth: 5 tentatives/15min
app.use('/api/v1/auth', authLimiter);
```

### Validation

- **Joi**: Validation schémas
- **Express Validator**: Validation requêtes
- **Mongoose**: Validation modèles

---

## 🌐 Internationalisation (i18n)

### Backend

```javascript
// Détection automatique langue
app.use(detectLanguage);

// Réponses bilingues
app.use(i18nResponse);

// Utilisation
res.status(200).json({
  message: req.t('product.created')
});
```

### Frontend

```javascript
// React i18next
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
<h1>{t('welcome.title')}</h1>
```

### Langues Supportées

- Français (fr) - Par défaut
- Anglais (en)
- Portugais (pt)
- Arabe (ar)

---

## 📡 API Routes Structure

### Routes Principales

```
/api/v1/
├── health                    # Health check
├── auth/                     # Authentification
│   ├── signup
│   ├── login
│   ├── logout
│   └── verify-email
├── users/                     # Utilisateurs génériques
├── profiles/                  # Profils centralisés
├── producers/                 # Producteurs
├── transformers/              # Transformateurs
├── consumers/                 # Consommateurs
├── restaurateurs/             # Restaurateurs
├── exporters/                  # Exportateurs
├── transporters/              # Transporteurs
├── products/                  # Produits
├── orders/                    # Commandes
├── payments/                  # Paiements
├── reviews/                   # Avis
├── messages/                  # Messagerie
├── notifications/             # Notifications
├── blogs/                     # Blog
├── chat/                      # Chatbot
└── upload/                    # Upload images
```

---

## 🎨 Frontend Architecture

### Component Structure

```
components/
├── common/                    # Composants réutilisables
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Modal.jsx
│   └── ProfileImageUpload.jsx
├── layout/                     # Layouts
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   └── Footer.jsx
└── features/                   # Features spécifiques
    ├── product/
    ├── order/
    └── chat/
```

### State Management

- **Context API**: Auth, Theme, i18n
- **React Hooks**: useState, useEffect, custom hooks
- **Services**: API calls centralisés

### Routing

```javascript
// React Router avec lazy loading
const ProductPage = React.lazy(() => import('./pages/ProductPage'));

<Route path="/products/:id" element={<ProductPage />} />
```

---

## 🔄 Services Centralisés

### Profile Service

Service unifié pour tous les types de profils:

```javascript
// Backend
profileService.getProfile(userId)
profileService.updateProfile(userId, data)
profileService.uploadImage(userId, type, file)

// Frontend
const { profile, updateProfile, uploadImage } = useProfile();
```

### Image Upload Service

Upload centralisé via Cloudinary:

```javascript
// Support: avatar, banner, logo, product images
uploadService.uploadImage(file, type, folder)
uploadService.deleteImage(publicId)
```

---

## 📊 Performance

### Optimisations Backend

- **Index MongoDB**: Index sur champs fréquemment recherchés
- **Pagination**: Toutes les listes paginées
- **Compression**: Gzip activé
- **Caching**: Redis (optionnel)
- **Connection Pooling**: MongoDB pool size optimisé

### Optimisations Frontend

- **Code Splitting**: Lazy loading routes
- **Image Optimization**: Cloudinary transformations
- **Bundle Size**: Tree shaking, minification
- **CDN**: Assets statiques via Cloudinary

---

## 🧪 Tests

### Structure Tests

```
tests/
├── unit/                      # Tests unitaires
├── integration/               # Tests intégration
├── e2e/                       # Tests end-to-end
└── fixtures/                  # Données de test
```

### Outils

- **Jest**: Framework de tests
- **Supertest**: Tests API
- **React Testing Library**: Tests composants

---

## 🚀 Déploiement

### Environnements

- **Development**: Local avec MongoDB local
- **Staging**: Serveur de test
- **Production**: Serveur live avec MongoDB Atlas

### CI/CD

```yaml
# Exemple GitHub Actions
- Build backend
- Run tests
- Deploy to staging
- Run e2e tests
- Deploy to production
```

---

## 📈 Monitoring

### Logs

- **Winston**: Logging structuré
- **Rotations**: Logs quotidiens
- **Niveaux**: error, warn, info, debug

### Métriques

- **Response Time**: < 200ms
- **Error Rate**: < 0.1%
- **Uptime**: > 99.9%

---

## 🔮 Évolutions Futures

### Court Terme

- [ ] Tests automatisés complets
- [ ] Cache Redis
- [ ] WebSockets pour notifications temps réel
- [ ] GraphQL API (optionnel)

### Long Terme

- [ ] Microservices architecture
- [ ] Kubernetes deployment
- [ ] Service mesh
- [ ] Machine Learning pour recommandations

---

*Pour plus de détails, consultez [Documentation API](./API_DOCUMENTATION.md) et [Guide de Développement](./DEVELOPMENT.md)*

