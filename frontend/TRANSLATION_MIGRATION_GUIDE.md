# Guide de Migration des Traductions

## 🎯 Nouvelle Structure des Namespaces

Les traductions ont été restructurées avec des namespaces clairs selon le type de page :

### 📁 Namespaces Disponibles

- **`common`** : Éléments communs (boutons, messages, etc.)
- **`navigation`** : Navigation principale
- **`public`** : Pages publiques (accueil, produits, catégories, etc.)
- **`admin`** : Pages d'administration
- **`consumer`** : Pages consommateur
- **`producer`** : Pages producteur
- **`auth`** : Pages d'authentification

## 🔄 Migration des Pages

### Avant (ancien système)
```jsx
const { t } = useTranslation();

// Utilisation directe
<h1>{t('products.title')}</h1>
<p>{t('products.subtitle')}</p>
```

### Après (nouveau système)
```jsx
const { t } = useTranslation();

// Utilisation avec namespace
<h1>{t('public:products.title')}</h1>
<p>{t('public:products.subtitle')}</p>
```

## 📋 Exemples de Migration par Type de Page

### 🌐 Pages Publiques
```jsx
// ✅ Correct
t('public:products.title')
t('public:products.searchPlaceholder')
t('public:categories.title')
t('public:producers.title')
t('public:productDetail.addToCart')

// ❌ Ancien (ne fonctionne plus)
t('products.title')
t('categories.title')
```

### 👑 Pages Admin
```jsx
// ✅ Correct
t('admin:dashboard.title')
t('admin:users.title')
t('admin:products.title')
t('admin:orders.title')
t('admin:analytics.title')

// ❌ Ancien (ne fonctionne plus)
t('adminDashboard.title')
t('adminUsers.title')
```

### 🛒 Pages Consumer
```jsx
// ✅ Correct
t('consumer:dashboard.title')
t('consumer:profile.title')
t('consumer:orders.title')
t('consumer:favorites.title')
t('consumer:cart.title')

// ❌ Ancien (ne fonctionne plus)
t('consumerDashboard.title')
t('consumerProfile.title')
```

### 🌾 Pages Producer
```jsx
// ✅ Correct
t('producer:dashboard.title')
t('producer:products.title')
t('producer:orders.title')
t('producer:profile.title')
t('producer:analytics.title')

// ❌ Ancien (ne fonctionne plus)
t('producerDashboard.title')
t('producerProducts.title')
```

### 🔐 Pages Auth
```jsx
// ✅ Correct
t('auth:signIn')
t('auth:signUp')
t('auth:forgotPassword')
t('auth:email')
t('auth:password')

// ❌ Ancien (ne fonctionne plus)
t('signIn')
t('signUp')
```

### 🧭 Navigation
```jsx
// ✅ Correct
t('navigation:home')
t('navigation:products')
t('navigation:categories')
t('navigation:producers')
t('navigation:login')

// ❌ Ancien (ne fonctionne plus)
t('nav.home')
t('nav.products')
```

### 🔧 Éléments Communs
```jsx
// ✅ Correct
t('common:loading')
t('common:error')
t('common:success')
t('common:save')
t('common:cancel')

// ❌ Ancien (ne fonctionne plus)
t('loading')
t('error')
t('success')
```

## 🛠️ Script de Migration Automatique

Pour migrer automatiquement vos fichiers, utilisez ce script :

```bash
# Migrer les pages publiques
find src/pages -name "*.jsx" -exec sed -i 's/t('\''products\./t('\''public:products\./g' {} \;
find src/pages -name "*.jsx" -exec sed -i 's/t('\''categories\./t('\''public:categories\./g' {} \;
find src/pages -name "*.jsx" -exec sed -i 's/t('\''producers\./t('\''public:producers\./g' {} \;

# Migrer les pages admin
find src/pages/admin -name "*.jsx" -exec sed -i 's/t('\''admin/t('\''admin:/g' {} \;

# Migrer les pages consumer
find src/pages/dashboard/consumer -name "*.jsx" -exec sed -i 's/t('\''consumer/t('\''consumer:/g' {} \;

# Migrer les pages producer
find src/pages/dashboard/producer -name "*.jsx" -exec sed -i 's/t('\''producer/t('\''producer:/g' {} \;
```

## 📝 Checklist de Migration

- [ ] Mettre à jour les pages publiques (`public:`)
- [ ] Mettre à jour les pages admin (`admin:`)
- [ ] Mettre à jour les pages consumer (`consumer:`)
- [ ] Mettre à jour les pages producer (`producer:`)
- [ ] Mettre à jour les pages auth (`auth:`)
- [ ] Mettre à jour la navigation (`navigation:`)
- [ ] Mettre à jour les éléments communs (`common:`)
- [ ] Tester toutes les traductions
- [ ] Vérifier qu'il n'y a pas de clés manquantes

## 🧪 Test des Traductions

```bash
# Lancer le test des traductions
node test-translations.js
```

## 🎨 Avantages de la Nouvelle Structure

1. **Clarté** : Chaque namespace correspond à un type de page
2. **Organisation** : Plus facile de trouver et maintenir les traductions
3. **Évolutivité** : Facile d'ajouter de nouveaux types de pages
4. **Performance** : Chargement optimisé des traductions
5. **Maintenance** : Moins de conflits entre les traductions

## 🚨 Points d'Attention

- **Namespace obligatoire** : Toutes les traductions doivent maintenant utiliser un namespace
- **Syntaxe** : Utiliser `namespace:key` au lieu de `key`
- **Cohérence** : Respecter la structure des namespaces
- **Tests** : Tester après chaque migration

## 📚 Ressources

- [Documentation i18next](https://www.i18next.com/)
- [React i18next](https://react.i18next.com/)
- [Namespaces i18next](https://www.i18next.com/overview/namespaces)
