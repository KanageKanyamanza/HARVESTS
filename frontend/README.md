# 🌾 Harvests Frontend

Interface utilisateur moderne pour la plateforme e-commerce agricole Harvests, construite avec React + Vite + Tailwind CSS.

## 🚀 Technologies

- **React 19** - Framework UI moderne
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS 3.4.0** - Framework CSS utility-first
- **React Router Dom** - Routing côté client
- **TanStack Query** - Gestion d'état serveur
- **React i18next** - Internationalisation FR/EN
- **Lucide React** - Icônes modernes
- **React Hook Form** - Gestion des formulaires
- **Axios** - Client HTTP

## 🛠️ Installation

```bash
# Installer les dépendances
npm install

# Copier les variables d'environnement
cp env.example .env

# Démarrer en mode développement
npm run dev

# Build pour production
npm run build

# Preview du build
npm run preview
```

## 🌍 Fonctionnalités

### ✅ Implémentées
- 🎨 **Design System** complet avec Tailwind CSS
- 🌐 **Internationalisation** FR/EN avec détection automatique
- 🧭 **Routing** complet avec routes protégées
- 🔐 **Authentification** avec Context API
- 📱 **Responsive** design mobile-first
- 🎭 **Lazy Loading** des composants
- 🔄 **État global** avec Context API
- 📡 **API Services** configurés avec Axios
- 🎯 **TypeScript ready** (configuration prête)

### 🚧 En développement
- 📝 Formulaires d'authentification complets
- 🛒 Système de panier
- 💳 Intégration paiements
- 📊 Dashboards utilisateurs
- 💬 Système de messagerie
- 🔔 Notifications temps réel

## 📁 Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── common/         # Composants génériques
│   ├── layout/         # Layout (Header, Footer)
│   ├── auth/           # Composants d'authentification
│   ├── products/       # Composants produits
│   └── orders/         # Composants commandes
├── pages/              # Pages de l'application
│   ├── auth/           # Pages d'authentification
│   ├── dashboard/      # Dashboards utilisateurs
│   └── errors/         # Pages d'erreur
├── hooks/              # Hooks personnalisés
├── services/           # Services API
├── store/              # Gestion d'état (Context)
├── utils/              # Utilitaires
├── locales/            # Fichiers de traduction
└── assets/             # Assets statiques
```

## 🎨 Design System

### Couleurs
- **Primary**: Vert agriculture (#4a9f4a)
- **Secondary**: Orange terre cuite (#f6781c)  
- **Accent**: Jaune doré (#f59e0b)
- **Success/Warning/Error**: Couleurs sémantiques

### Composants CSS
```css
/* Boutons */
.btn-primary
.btn-secondary
.btn-outline
.btn-ghost

/* Cards */
.card
.card-hover
.card-body

/* Forms */
.form-input
.form-label
.form-error

/* Badges */
.badge-primary
.badge-success
```

## 🌐 Internationalisation

### Langues supportées
- 🇫🇷 **Français** (défaut)
- 🇬🇧 **Anglais**

### Usage
```jsx
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation();
  return <h1>{t('navigation.home')}</h1>;
};
```

### Changement de langue
```jsx
import { changeLanguage } from './utils/i18n';

// Changer vers l'anglais
changeLanguage('en');
```

## 🔐 Authentification

### Context API
```jsx
import { useAuth } from './store/AuthContext';

const Component = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginForm />;
  }
  
  return <Dashboard user={user} />;
};
```

### Routes protégées
```jsx
<ProtectedRoute requiredAuth={true} requiredVerification={true}>
  <Dashboard />
</ProtectedRoute>
```

## 📡 Services API

### Configuration
```jsx
// services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Auto-ajout du token JWT
// Auto-ajout de la langue
// Gestion des erreurs globales
```

### Usage
```jsx
import { productService } from './services/api';

// Obtenir les produits
const products = await productService.getProducts();

// Créer un produit
const newProduct = await productService.createProduct(data);
```

## 🎯 Routes

### Publiques
- `/` - Accueil
- `/products` - Liste des produits
- `/products/:id` - Détail produit
- `/categories` - Catégories
- `/producers` - Producteurs

### Authentification
- `/login` - Connexion
- `/register` - Inscription
- `/forgot-password` - Mot de passe oublié
- `/reset-password/:token` - Réinitialisation
- `/verify-email/:token` - Vérification email

### Protégées
- `/dashboard` - Dashboard général
- `/profile` - Profil utilisateur
- `/orders` - Commandes
- `/messages` - Messages
- `/settings` - Paramètres

### Spécialisées
- `/producer/*` - Dashboard producteur
- `/consumer/*` - Dashboard consommateur

## 🚀 Déploiement

### Variables d'environnement
```bash
# Développement
VITE_API_URL=http://localhost:8000/api/v1

# Production
VITE_API_URL=https://api.harvests.africa/v1
VITE_APP_NAME=Harvests
VITE_DEBUG=false

# Services
VITE_CLOUDINARY_CLOUD_NAME=harvests
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

### Build
```bash
npm run build
# Génère le dossier dist/
```

### Hébergement recommandé
- **Vercel** (recommandé)
- **Netlify**
- **AWS S3 + CloudFront**
- **Firebase Hosting**

## 📊 Performance

### Optimisations implémentées
- ⚡ **Vite** pour des builds ultra-rapides
- 🔄 **Lazy loading** des routes
- 📦 **Code splitting** automatique
- 🗜️ **Tree shaking** des imports
- 🎨 **CSS optimisé** avec Tailwind
- 📱 **Images responsives** prêtes

### Métriques cibles
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3s
- **Cumulative Layout Shift**: < 0.1

## 🧪 Tests (À implémenter)

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📝 Contributing

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

MIT License - voir [LICENSE](LICENSE) pour plus de détails.

---

**🌍 Harvests Frontend - L'interface de l'Amazon agricole africain !**
