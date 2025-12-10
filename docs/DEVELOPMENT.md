# 💻 Guide de Développement - Harvests Platform

Guide complet pour les développeurs travaillant sur Harvests.

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 16+
- MongoDB (local ou Atlas)
- Git
- IDE (VS Code recommandé)

### Setup Initial

```bash
# Cloner le repository
git clone https://github.com/ZooM982/HARVESTS.git
cd HARVESTS

# Installation
npm run setup

# Configuration
# Copier .env.example vers .env et configurer

# Démarrer en développement
npm run dev
```

---

## 📁 Structure du Code

### Backend

```
backend/
├── controllers/        # Logique métier
│   ├── auth/          # Authentification
│   ├── product/       # Produits
│   └── ...
├── models/            # Modèles Mongoose
├── routes/            # Routes API
├── services/          # Services métier
├── middleware/        # Middlewares
├── utils/            # Utilitaires
└── config/           # Configuration
```

### Frontend

```
frontend/src/
├── components/        # Composants réutilisables
├── pages/            # Pages de l'application
├── services/         # Services API
├── hooks/            # Hooks personnalisés
├── context/          # Context API
└── utils/           # Utilitaires
```

---

## 🔧 Conventions de Code

### Naming Conventions

#### Backend

- **Fichiers**: `camelCase.js` (ex: `userController.js`)
- **Variables**: `camelCase` (ex: `userName`)
- **Constantes**: `UPPER_SNAKE_CASE` (ex: `MAX_FILE_SIZE`)
- **Classes**: `PascalCase` (ex: `UserService`)
- **Routes**: `kebab-case` (ex: `/api/v1/user-profile`)

#### Frontend

- **Composants**: `PascalCase.jsx` (ex: `UserProfile.jsx`)
- **Hooks**: `camelCase` avec préfixe `use` (ex: `useAuth`)
- **Services**: `camelCase.js` (ex: `userService.js`)
- **CSS Classes**: `kebab-case` (ex: `user-profile`)

### Structure de Fichiers

#### Controller

```javascript
// controllers/productController.js
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createProduct = catchAsync(async (req, res, next) => {
  // Validation
  // Logique métier
  // Réponse
});

exports.getProduct = catchAsync(async (req, res, next) => {
  // ...
});
```

#### Route

```javascript
// routes/productRoutes.js
const express = require('express');
const productController = require('../controllers/productController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(productController.getAllProducts)
  .post(protect, productController.createProduct);

router
  .route('/:id')
  .get(productController.getProduct)
  .patch(protect, productController.updateProduct)
  .delete(protect, productController.deleteProduct);

module.exports = router;
```

#### Service

```javascript
// services/productService.js
const Product = require('../models/Product');

exports.createProduct = async (data, userId) => {
  const product = await Product.create({
    ...data,
    producer: userId
  });
  return product;
};

exports.getProductById = async (productId) => {
  return await Product.findById(productId).populate('producer');
};
```

---

## 🧪 Tests

### Structure Tests

```
tests/
├── unit/              # Tests unitaires
├── integration/       # Tests d'intégration
└── e2e/              # Tests end-to-end
```

### Écrire des Tests

```javascript
// tests/unit/product.test.js
const Product = require('../../models/Product');

describe('Product Model', () => {
  it('should create a product', async () => {
    const product = await Product.create({
      name: 'Test Product',
      category: 'cereals',
      price: 1000
    });
    expect(product.name).toBe('Test Product');
  });
});
```

### Exécuter Tests

```bash
# Tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Coverage
npm run test:coverage
```

---

## 📝 Documentation

### Swagger Annotations

Documenter chaque endpoint:

```javascript
/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Créer un nouveau produit
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Produit créé
 */
router.post('/', protect, productController.createProduct);
```

### Commentaires

```javascript
// Bon commentaire
/**
 * Calcule le prix total d'une commande
 * @param {Array} items - Liste des items
 * @param {Number} shippingCost - Coût de livraison
 * @returns {Number} Prix total
 */
function calculateTotal(items, shippingCost) {
  // ...
}
```

---

## 🔄 Git Workflow

### Branches

- `main`: Production
- `develop`: Développement
- `feature/*`: Nouvelles fonctionnalités
- `fix/*`: Corrections de bugs
- `hotfix/*`: Corrections urgentes

### Commit Messages

Format: `type(scope): message`

Types:
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage
- `refactor`: Refactoring
- `test`: Tests
- `chore`: Maintenance

Exemples:
```
feat(product): add search functionality
fix(auth): resolve JWT expiration issue
docs(api): update Swagger documentation
```

### Pull Requests

1. Créer une branche depuis `develop`
2. Développer la fonctionnalité
3. Écrire des tests
4. Mettre à jour la documentation
5. Créer une PR avec description détaillée
6. Attendre la review
7. Merge après approbation

---

## 🐛 Debugging

### Backend

#### Logs

```javascript
// Utiliser Winston
const logger = require('../config/logger');

logger.info('User created', { userId });
logger.error('Error occurred', { error });
```

#### Debugger

```bash
# VS Code: Launch configuration
# Ajouter breakpoints
# F5 pour démarrer debug
```

### Frontend

#### React DevTools

- Installer extension Chrome
- Inspecter composants
- Voir state et props

#### Console

```javascript
// Utiliser console.log avec préfixe
console.log('[ProductPage] Loading products');
console.error('[ProductPage] Error:', error);
```

---

## 🔍 Code Review

### Checklist

- [ ] Code fonctionne
- [ ] Tests passent
- [ ] Pas de console.log en production
- [ ] Documentation à jour
- [ ] Pas de code dupliqué
- [ ] Naming conventions respectées
- [ ] Gestion d'erreurs appropriée
- [ ] Sécurité vérifiée

### Bonnes Pratiques

- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple, Stupid
- **YAGNI**: You Aren't Gonna Need It
- **SOLID**: Principes de design

---

## 📦 Gestion des Dépendances

### Ajouter une Dépendance

```bash
# Backend
cd backend
npm install package-name

# Frontend
cd frontend
npm install package-name
```

### Mettre à Jour

```bash
# Vérifier les mises à jour
npm outdated

# Mettre à jour
npm update

# Mise à jour majeure
npm install package-name@latest
```

### Sécurité

```bash
# Vérifier vulnérabilités
npm audit

# Corriger automatiquement
npm audit fix
```

---

## 🎨 Styling

### Tailwind CSS

```jsx
// Utiliser classes Tailwind
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h1 className="text-2xl font-bold text-gray-800">Title</h1>
</div>
```

### Composants Réutilisables

```jsx
// Créer composants réutilisables
// components/common/Button.jsx
export const Button = ({ children, variant = 'primary', ...props }) => {
  return (
    <button
      className={`px-4 py-2 rounded ${
        variant === 'primary' ? 'bg-green-500' : 'bg-gray-500'
      }`}
      {...props}
    >
      {children}
    </button>
  );
};
```

---

## 🔐 Sécurité

### Validation

```javascript
// Toujours valider les inputs
const { body, validationResult } = require('express-validator');

router.post('/',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 8 })
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // ...
  }
);
```

### Sanitization

```javascript
// Nettoyer les inputs
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());
```

### Secrets

```javascript
// JAMAIS commiter les secrets
// Utiliser variables d'environnement
const secret = process.env.JWT_SECRET;
```

---

## 📊 Performance

### Optimisations Backend

- **Index MongoDB**: Créer index sur champs recherchés
- **Pagination**: Toujours paginer les listes
- **Cache**: Utiliser Redis pour cache
- **Compression**: Gzip activé

### Optimisations Frontend

- **Lazy Loading**: Charger composants à la demande
- **Code Splitting**: Diviser le bundle
- **Image Optimization**: Utiliser Cloudinary
- **Memoization**: Utiliser useMemo, useCallback

---

## 🚀 Déploiement

### Pré-déploiement

1. Tous les tests passent
2. Build fonctionne
3. Variables d'environnement configurées
4. Documentation à jour

### Déploiement

```bash
# Build frontend
cd frontend
npm run build

# Déployer backend
cd backend
npm start
```

---

## 📚 Ressources

### Documentation

- [Documentation API](./API_DOCUMENTATION.md)
- [Guide Swagger](./SWAGGER_GUIDE.md)
- [Architecture](./ARCHITECTURE.md)

### Outils

- **Postman**: Tester l'API
- **MongoDB Compass**: Visualiser la base de données
- **VS Code Extensions**: ESLint, Prettier, etc.

---

*Pour plus d'aide, consultez [Documentation API](./API_DOCUMENTATION.md) ou [Architecture](./ARCHITECTURE.md)*

