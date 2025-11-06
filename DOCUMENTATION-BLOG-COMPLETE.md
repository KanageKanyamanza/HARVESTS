# 📚 Documentation Complète du Système de Blog - vitalCHECK

## Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture Générale](#architecture-générale)
3. [Backend - Modèles de Données](#backend---modèles-de-données)
4. [Backend - Routes API](#backend---routes-api)
5. [Backend - Services et Utilitaires](#backend---services-et-utilitaires)
6. [Frontend - Structure](#frontend---structure)
7. [Frontend - Composants](#frontend---composants)
8. [Frontend - Services](#frontend---services)
9. [Système de Tracking](#système-de-tracking)
10. [Système de Visiteurs](#système-de-visiteurs)
11. [Internationalisation (i18n)](#internationalisation-i18n)
12. [SEO et Métadonnées](#seo-et-métadonnées)
13. [Guide d'Intégration](#guide-dintégration)
14. [Dépendances et Technologies](#dépendances-et-technologies)

---

## Vue d'Ensemble

Le système de blog de vitalCHECK est une solution complète et bilingue (FR/EN) qui permet de :
- Publier des articles de blog avec contenu multilingue
- Gérer différents types de contenu (articles, études de cas, tutoriels, actualités, témoignages)
- Tracker les visites et comportements des visiteurs
- Collecter des informations sur les visiteurs via un formulaire
- Analyser les statistiques détaillées
- Optimiser le SEO avec des métadonnées localisées

---

## Architecture Générale

### Stack Technologique

**Backend :**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT pour l'authentification admin
- Cloudinary pour le stockage d'images

**Frontend :**
- React.js
- React Router pour la navigation
- i18next pour l'internationalisation
- Tailwind CSS pour le styling
- Lucide React pour les icônes
- React Hot Toast pour les notifications

### Structure des Dossiers

```
server/
├── models/
│   ├── Blog.js              # Modèle principal du blog
│   ├── BlogVisit.js         # Modèle pour tracker les visites
│   └── BlogVisitor.js        # Modèle pour les visiteurs avec formulaire
├── routes/
│   ├── blogs.js             # Routes principales du blog
│   └── blogVisitors.js      # Routes pour les visiteurs
└── utils/
    ├── deviceAnalyzer.js    # Analyse des appareils
    └── visitorUtils.js      # Utilitaires pour visiteurs

client/
├── src/
│   ├── pages/
│   │   ├── BlogPage.jsx           # Page liste des blogs
│   │   └── BlogDetailPage.jsx     # Page détail d'un blog
│   ├── components/
│   │   ├── blog/
│   │   │   ├── BlogVisitorModal.jsx    # Modal formulaire visiteur
│   │   │   └── BlogImageGallery.jsx    # Galerie d'images
│   │   └── admin/
│   │       └── BlogModal.jsx           # Modal admin pour créer/éditer
│   ├── hooks/
│   │   └── useBlogVisitorModal.js     # Hook pour gérer la modal
│   ├── services/
│   │   ├── api.js                     # Services API
│   │   └── trackingService.js         # Service de tracking
│   └── utils/
│       ├── tagUtils.js                # Utilitaires pour les tags
│       └── autoTranslateTags.js       # Auto-traduction des tags
```

---

## Backend - Modèles de Données

### 1. Modèle Blog (`server/models/Blog.js`)

#### Structure du Schéma

```javascript
{
  // Contenu bilingue (FR/EN)
  title: {
    fr: String,
    en: String
  },
  slug: {
    fr: String (unique),
    en: String (unique)
  },
  excerpt: {
    fr: String (max 500),
    en: String (max 500)
  },
  content: {
    fr: String,
    en: String
  },
  
  // Classification
  type: {
    type: String,
    enum: ['article', 'etude-cas', 'tutoriel', 'actualite', 'temoignage'],
    default: 'article'
  },
  category: {
    type: String,
    enum: ['strategie', 'technologie', 'finance', 'ressources-humaines', 
           'marketing', 'operations', 'gouvernance']
  },
  tags: [String],
  
  // Images
  featuredImage: {
    url: String,
    alt: String,
    caption: String
  },
  images: [{
    cloudinaryId: String,
    url: String,
    alt: String,
    caption: String,
    position: String (enum: ['top', 'middle', 'bottom', 'inline', 
                            'content-start', 'content-end']),
    order: Number,
    width: Number,
    height: Number,
    format: String,
    size: Number
  }],
  
  // Statut et publication
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  
  // Auteur
  author: {
    type: ObjectId,
    ref: 'Admin',
    required: true
  },
  
  // SEO bilingue
  metaTitle: {
    fr: String (max 60),
    en: String (max 60)
  },
  metaDescription: {
    fr: String (max 160),
    en: String (max 160)
  },
  
  // Statistiques
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  
  // Configurations spéciales par type
  caseStudy: {
    company: String,
    sector: String,
    companySize: String,
    challenge: String,
    solution: String,
    results: String,
    metrics: [{
      label: String,
      value: String,
      description: String
    }]
  },
  tutorial: {
    difficulty: String (enum: ['debutant', 'intermediaire', 'avance']),
    duration: String,
    prerequisites: [String]
  },
  testimonial: {
    clientName: String,
    clientCompany: String,
    clientPosition: String,
    clientPhoto: String,
    rating: Number (min: 1, max: 5)
  }
}
```

#### Méthodes du Modèle

```javascript
// Méthodes d'instance
blog.getTitle(language = 'fr')
blog.getSlug(language = 'fr')
blog.getExcerpt(language = 'fr')
blog.getContent(language = 'fr')
blog.getMetaTitle(language = 'fr')
blog.getMetaDescription(language = 'fr')
blog.getLocalizedContent(language = 'fr') // Retourne tout le contenu localisé
blog.incrementViews()
blog.incrementLikes()
blog.getVisitStats() // Statistiques détaillées des visites
```

#### Index MongoDB

- Index texte pour recherche FR/EN
- Index sur `status` et `publishedAt`
- Index sur `type` et `category`
- Index sur `tags`
- Index unique sur `slug.fr` et `slug.en`

#### Middleware Pre-Save

- Génération automatique des slugs bilingues
- Définition automatique de `publishedAt` lors de la publication
- Validation : au moins une langue (FR ou EN) doit être remplie

---

### 2. Modèle BlogVisit (`server/models/BlogVisit.js`)

#### Structure du Schéma

```javascript
{
  blog: { type: ObjectId, ref: 'Blog', required: true },
  user: { type: ObjectId, ref: 'User', default: null },
  sessionId: String (required, indexed),
  
  // Géolocalisation
  ipAddress: String (required),
  country: String,
  region: String,
  city: String,
  
  // Appareil
  userAgent: String (required),
  device: {
    type: String (enum: ['desktop', 'mobile', 'tablet']),
    brand: String,
    model: String,
    os: String,
    osVersion: String,
    browser: String,
    browserVersion: String
  },
  
  // Référent et UTM
  referrer: String,
  referrerDomain: String,
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  
  // Métriques comportementales
  timeOnPage: Number (secondes, default: 0),
  scrollDepth: Number (0-100, default: 0),
  isBounce: Boolean (default: true),
  
  // Page
  pageTitle: String (required),
  pageUrl: String (required),
  
  // Statut
  status: {
    type: String,
    enum: ['active', 'completed', 'bounced'],
    default: 'active'
  },
  
  // Timestamps
  visitedAt: Date (default: now),
  leftAt: Date
}
```

#### Méthodes du Modèle

```javascript
visit.calculateDuration() // Calcule la durée de la visite
visit.markAsCompleted()   // Marque comme terminée
visit.markAsBounced()     // Marque comme rebond
```

---

### 3. Modèle BlogVisitor (`server/models/BlogVisitor.js`)

#### Structure du Schéma

```javascript
{
  // Informations personnelles
  firstName: String (required, max 50),
  lastName: String (required, max 50),
  email: String (required, unique, validated),
  country: String (required, max 100),
  
  // Localisation
  ipAddress: String (required, indexed),
  city: String,
  region: String,
  
  // Appareil
  userAgent: String (required),
  device: {
    type: String (enum: ['desktop', 'mobile', 'tablet']),
    browser: String,
    os: String
  },
  
  // Historique des visites
  blogsVisited: [{
    blog: ObjectId (ref: 'Blog'),
    blogTitle: String,
    blogSlug: String,
    visitedAt: Date,
    scrollDepth: Number,
    timeOnPage: Number,
    isFormSubmitted: Boolean
  }],
  
  // Statistiques globales
  totalBlogsVisited: Number (default: 1),
  totalTimeSpent: Number (default: 0),
  averageScrollDepth: Number (default: 0),
  
  // Statut
  isReturningVisitor: Boolean (default: false),
  lastVisitAt: Date (default: now),
  sessionId: String (required, indexed),
  
  // Métadonnées
  source: String (enum: ['blog_form', 'manual_entry']),
  status: String (enum: ['active', 'inactive'])
}
```

#### Méthodes du Modèle

```javascript
// Méthodes d'instance
visitor.addBlogVisit(blogId, blogTitle, blogSlug, scrollDepth, timeOnPage)
visitor.markAsReturningVisitor()
visitor.getStats()

// Méthodes statiques
BlogVisitor.findByIP(ipAddress)
BlogVisitor.getGlobalStats()
```

---

## Backend - Routes API

### Routes Publiques (`server/routes/blogs.js`)

#### 1. GET `/blogs` - Liste des blogs publiés

**Paramètres de requête :**
- `page` (default: 1)
- `limit` (default: 10)
- `type` (filter par type)
- `category` (filter par catégorie)
- `tag` (filter par tag)
- `search` (recherche textuelle)
- `sort` (default: 'publishedAt', options: 'publishedAt', 'views', 'likes', 'title')
- `lang` (fr/en, détection automatique)

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Titre localisé",
      "slug": "slug-localise",
      "excerpt": "Extrait localisé",
      "type": "article",
      "category": "strategie",
      "tags": ["tag1", "tag2"],
      "featuredImage": {...},
      "author": {...},
      "views": 100,
      "likes": 25,
      "publishedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "language": "fr",
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50
  }
}
```

#### 2. GET `/blogs/:slug` - Détail d'un blog

**Paramètres :**
- `slug` : Slug du blog (localisé selon la langue)
- `lang` : Langue (fr/en, détection automatique)

**Réponse :**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Titre complet",
    "slug": "slug-localise",
    "excerpt": "Extrait",
    "content": "Contenu HTML complet",
    "metaTitle": "Titre SEO",
    "metaDescription": "Description SEO",
    "type": "article",
    "category": "strategie",
    "tags": [...],
    "images": [...],
    "author": {...},
    "views": 100,
    "likes": 25,
    "publishedAt": "2024-01-01T00:00:00.000Z"
  },
  "language": "fr",
  "visitId": "..." // ID pour le tracking
}
```

**Fonctionnalités :**
- Création automatique d'un enregistrement `BlogVisit`
- Géolocalisation par IP
- Analyse de l'appareil
- Extraction des paramètres UTM
- Génération d'un `sessionId` si absent

#### 3. POST `/blogs/:id/like` - Liker un blog

**Réponse :**
```json
{
  "success": true,
  "data": {
    "likes": 26
  }
}
```

#### 4. POST `/blogs/track` - Mettre à jour le tracking

**Body :**
```json
{
  "visitId": "...",
  "timeOnPage": 120,
  "scrollDepth": 75,
  "action": "update" // ou "leave" ou "bounce"
}
```

---

### Routes Admin (`server/routes/blogs.js`)

Toutes les routes admin nécessitent l'authentification via JWT.

#### 1. GET `/blogs/admin/blogs` - Liste tous les blogs (admin)

**Paramètres :**
- `page`, `limit`
- `status` (draft/published/archived)
- `type`, `category`

#### 2. GET `/blogs/admin/blogs/:id` - Détail d'un blog (admin)

#### 3. POST `/blogs/admin/blogs` - Créer un blog

**Body :**
```json
{
  "title": {
    "fr": "Titre français",
    "en": "English title"
  },
  "excerpt": {
    "fr": "Résumé français",
    "en": "English excerpt"
  },
  "content": {
    "fr": "Contenu français (HTML)",
    "en": "English content (HTML)"
  },
  "type": "article",
  "category": "strategie",
  "tags": ["tag1", "tag2"],
  "status": "draft",
  "metaTitle": {
    "fr": "Titre SEO FR",
    "en": "SEO Title EN"
  },
  "metaDescription": {
    "fr": "Description SEO FR",
    "en": "SEO Description EN"
  }
}
```

**Validation :**
- Au moins un titre (FR ou EN) requis
- Au moins un contenu (FR ou EN) requis
- Type et catégorie valides
- Génération automatique des slugs si non fournis

#### 4. PUT `/blogs/admin/blogs/:id` - Mettre à jour un blog

Même structure que POST, tous les champs sont optionnels.

#### 5. DELETE `/blogs/admin/blogs/:id` - Supprimer un blog

#### 6. GET `/blogs/admin/stats` - Statistiques globales

**Réponse :**
```json
{
  "success": true,
  "data": {
    "total": 50,
    "published": 40,
    "draft": 10,
    "byType": [...],
    "byCategory": [...],
    "totalViews": 10000,
    "totalLikes": 500,
    "tracking": {
      "totalVisits": 5000,
      "uniqueVisitors": 2000,
      "deviceBreakdown": [...],
      "topCountries": [...],
      "topReferrers": [...]
    }
  }
}
```

#### 7. GET `/blogs/admin/blogs/:id/visits` - Visites d'un blog

#### 8. GET `/blogs/admin/visits` - Toutes les visites

**Paramètres :**
- `page`, `limit`
- `blogId`, `country`, `deviceType`
- `dateFrom`, `dateTo`

#### 9. POST `/blogs/translate` - Traduction automatique

**Body :**
```json
{
  "text": "Texte à traduire",
  "fromLang": "fr",
  "toLang": "en"
}
```

**Services utilisés :**
- MyMemory (priorité)
- LibreTranslate (fallback)

---

### Routes Visiteurs (`server/routes/blogVisitors.js`)

#### 1. GET `/blog-visitors/check` - Vérifier si un visiteur existe

**Réponse :**
```json
{
  "exists": true,
  "visitor": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "country": "France",
    "isReturningVisitor": true,
    "totalBlogsVisited": 5,
    "lastVisitAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 2. POST `/blog-visitors/submit` - Soumettre le formulaire visiteur

**Body :**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "country": "France",
  "blogId": "...",
  "blogTitle": "Titre du blog",
  "blogSlug": "slug-du-blog",
  "scrollDepth": 75,
  "timeOnPage": 120
}
```

**Fonctionnalités :**
- Création ou mise à jour du visiteur
- Incrémentation des vues du blog
- Ajout de la visite à l'historique
- Calcul des statistiques

---

## Backend - Services et Utilitaires

### 1. Device Analyzer (`server/utils/deviceAnalyzer.js`)

**Fonctions :**
```javascript
analyzeDevice(userAgent) // Analyse l'appareil depuis User-Agent
extractReferrerDomain(referrer) // Extrait le domaine du référent
extractUTMParameters(url) // Extrait les paramètres UTM
generateSessionId() // Génère un ID de session unique
isBounce(visit) // Détermine si c'est un rebond
```

### 2. Visitor Utils (`server/utils/visitorUtils.js`)

**Fonctions :**
```javascript
getClientIP(req) // Récupère l'IP réelle (gère les proxies)
getDeviceInfo(userAgent) // Informations sur l'appareil
getLocationInfo(ipAddress) // Géolocalisation (via ipapi.co)
```

### 3. Géolocalisation

Le système utilise deux services de géolocalisation :
- **ipapi.co** (priorité) - 1000 requêtes/jour gratuites
- **ip-api.com** (fallback) - Service gratuit

**Fonction :** `getLocationFromIP(ipAddress)` dans `blogs.js`

---

## Frontend - Structure

### Pages Principales

#### 1. BlogPage (`client/src/pages/BlogPage.jsx`)

**Fonctionnalités :**
- Affichage de la liste des blogs avec pagination
- Filtres par type, catégorie, recherche
- Détection automatique de la langue
- Rechargement lors du changement de langue
- Affichage des métadonnées (auteur, date, vues, likes)
- Navigation vers le détail d'un blog

**État :**
```javascript
{
  blogs: [],
  loading: boolean,
  searchTerm: string,
  selectedType: string,
  selectedCategory: string,
  currentPage: number,
  totalPages: number,
  language: string
}
```

**Fonctions principales :**
- `loadBlogs()` - Charge les blogs depuis l'API
- `handleLike(blogId)` - Like un blog
- `handleBlogClick(blog)` - Navigation vers le détail
- `getLocalizedContent(content, fallback)` - Récupère le contenu localisé
- `translateTag(tag)` - Traduit un tag

#### 2. BlogDetailPage (`client/src/pages/BlogDetailPage.jsx`)

**Fonctionnalités :**
- Affichage du contenu complet d'un blog
- Galerie d'images positionnées
- Articles similaires
- Actions (like, partage)
- Modal de visiteur (via hook)
- Tracking automatique des visites
- Mode prévisualisation admin

**État :**
```javascript
{
  blog: object,
  loading: boolean,
  relatedBlogs: [],
  liked: boolean,
  language: string
}
```

**Fonctions principales :**
- `loadBlog()` - Charge le blog et initialise le tracking
- `handleLike()` - Like le blog
- `handleShare()` - Partage l'article

---

### Composants

#### 1. BlogVisitorModal (`client/src/components/blog/BlogVisitorModal.jsx`)

**Props :**
```javascript
{
  isOpen: boolean,
  onClose: function,
  blogId: string,
  blogTitle: string,
  blogSlug: string,
  isReturningVisitor: boolean,
  visitorData: object,
  onFormSubmit: function
}
```

**Fonctionnalités :**
- Formulaire pour nouveaux visiteurs (prénom, nom, email, pays)
- Affichage de bienvenue pour visiteurs de retour
- Validation des champs
- Soumission avec données de tracking
- Impossible de fermer sans remplir (nouveaux visiteurs)

#### 2. BlogImageGallery (`client/src/components/blog/BlogImageGallery.jsx`)

**Props :**
```javascript
{
  images: array // Tableau d'objets image
}
```

**Fonctionnalités :**
- Affichage en galerie avec lightbox
- Support des images Cloudinary

---

### Hooks

#### useBlogVisitorModal (`client/src/hooks/useBlogVisitorModal.js`)

**Retour :**
```javascript
{
  isModalOpen: boolean,
  isReturningVisitor: boolean,
  visitorData: object,
  scrollPercentage: number,
  hasShownModal: boolean,
  openModal: function,
  closeModal: function,
  handleFormSubmit: function
}
```

**Fonctionnalités :**
- Détection du scroll (ouverture à 10%)
- Vérification des visiteurs existants
- Soumission automatique pour visiteurs de retour
- Timer de 30 secondes si pas encore ouvert
- Intégration avec le tracking service

---

## Frontend - Services

### 1. API Service (`client/src/services/api.js`)

#### Services Publics (blogApiService)

```javascript
// Récupérer tous les blogs
blogApiService.getBlogs(params)

// Récupérer un blog par slug
blogApiService.getBlogBySlug(slug)

// Liker un blog
blogApiService.likeBlog(id)

// Tracker une visite
blogApiService.trackVisit(visitId, data)

// Rechercher des blogs
blogApiService.searchBlogs(query)

// Vérifier un visiteur par IP
blogApiService.checkVisitorByIP()

// Soumettre le formulaire visiteur
blogApiService.submitVisitorForm(data)
```

#### Services Admin (adminBlogApiService)

```javascript
// CRUD blogs
adminBlogApiService.getBlogs(params)
adminBlogApiService.getBlog(id)
adminBlogApiService.createBlog(data)
adminBlogApiService.updateBlog(id, data)
adminBlogApiService.deleteBlog(id)

// Statistiques
adminBlogApiService.getStats()
adminBlogApiService.getBlogVisits(blogId)
adminBlogApiService.getAllVisits(params)
adminBlogApiService.getVisitors(params)
adminBlogApiService.getVisitorStats()
adminBlogApiService.exportVisitors(format)
```

### 2. Tracking Service (`client/src/services/trackingService.js`)

**Classe :** `TrackingService`

**Méthodes :**
```javascript
// Initialiser le tracking
trackingService.initTracking(visitId)

// Arrêter le tracking
trackingService.stopTracking()

// Marquer comme rebond
trackingService.markAsBounce()

// Obtenir les métriques
trackingService.getMetrics() // { timeOnPage, scrollDepth, isTracking }
```

**Fonctionnalités :**
- Tracking du temps passé sur la page
- Tracking du scroll (profondeur maximale)
- Mise à jour périodique (toutes les 60 secondes)
- Envoi final lors de la fermeture de la page
- Debouncing pour éviter trop de requêtes

**Événements écoutés :**
- `scroll` - Pour le scroll depth
- `beforeunload` - Fermeture de la page
- `pagehide` - Changement de page
- `popstate` - Navigation SPA

---

## Système de Tracking

### Flux de Tracking

1. **Visite initiale** (`GET /blogs/:slug`)
   - Création d'un `BlogVisit` avec :
     - IP, géolocalisation
     - User-Agent, analyse de l'appareil
     - Référent, paramètres UTM
     - Session ID
   - Retour de `visitId` au frontend

2. **Initialisation frontend**
   - `trackingService.initTracking(visitId)`
   - Démarrage du tracking du temps et du scroll

3. **Mises à jour périodiques**
   - Toutes les 60 secondes : `POST /blogs/track`
   - Lors de changements significatifs de scroll : `POST /blogs/track`

4. **Fermeture de la page**
   - `POST /blogs/track` avec `action: 'leave'`
   - Mise à jour finale des métriques

5. **Soumission du formulaire visiteur**
   - Création/mise à jour du `BlogVisitor`
   - Ajout de la visite à l'historique
   - Incrémentation des vues du blog

### Métriques Collectées

- **Temps sur la page** : En secondes
- **Profondeur de scroll** : Pourcentage (0-100)
- **Rebond** : Visite < 30 secondes ou scroll < 10%
- **Géolocalisation** : Pays, région, ville
- **Appareil** : Type, OS, navigateur
- **Référent** : Domaine source
- **UTM** : Source, medium, campaign

---

## Système de Visiteurs

### Flux de Collecte

1. **Vérification initiale**
   - `GET /blog-visitors/check` au chargement
   - Vérifie si un visiteur existe par IP

2. **Affichage de la modal**
   - À 10% de scroll OU après 30 secondes
   - Seulement pour nouveaux visiteurs
   - Visiteurs de retour : soumission automatique

3. **Soumission du formulaire**
   - `POST /blog-visitors/submit`
   - Création ou mise à jour du visiteur
   - Ajout de la visite à l'historique
   - Incrémentation des vues

### Données Collectées

- **Informations personnelles** : Prénom, nom, email, pays
- **Historique des visites** : Blogs consultés, dates, métriques
- **Statistiques globales** : Total de blogs visités, temps total, scroll moyen
- **Statut** : Nouveau visiteur ou visiteur de retour

---

## Internationalisation (i18n)

### Configuration

Le système utilise **i18next** avec détection automatique de la langue.

**Détection de la langue :**
1. Paramètre URL `?lang=fr` ou `?lang=en`
2. Header `Accept-Language`
3. Langue stockée dans `localStorage` (`i18nextLng`)
4. Fallback : Français

### Structure des Traductions

```json
{
  "blog": {
    "title": "Blog",
    "subtitle": "Découvrez nos articles...",
    "types": {
      "all": "Tous",
      "article": "Article",
      "etude-cas": "Étude de cas",
      "tutoriel": "Tutoriel",
      "actualite": "Actualité",
      "temoignage": "Témoignage"
    },
    "categories": {
      "strategie": "Stratégie",
      "technologie": "Technologie",
      ...
    },
    "tags": {
      "tag1": "Traduction du tag",
      ...
    },
    "modal": {
      "title": "Bienvenue !",
      "description": "Remplissez ce formulaire...",
      ...
    }
  }
}
```

### Utilisation dans les Composants

```javascript
import { useTranslation } from 'react-i18next'

const { t, i18n } = useTranslation()

// Traduction simple
t('blog.title')

// Traduction avec paramètres
t('blog.modal.welcomeBackMessage', { firstName: 'John' })

// Détection de la langue
const currentLang = i18n.language // 'fr' ou 'en'

// Changement de langue
i18n.changeLanguage('en')
```

### Auto-traduction des Tags

Le système inclut une fonction d'auto-traduction des tags via `autoTranslateTag()` qui utilise des dictionnaires de traduction.

---

## SEO et Métadonnées

### Composant SEOHead

**Utilisation :**
```javascript
<SEOHead
  title="Titre de la page"
  description="Description SEO"
  keywords="mots, clés, séparés, par, virgules"
  url="/blog/mon-article"
  image="/og-image.png"
  type="article"
  structuredData={structuredData}
/>
```

### Structured Data (Schema.org)

#### Article de Blog
```javascript
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Titre",
  "description": "Description",
  "author": {
    "@type": "Person",
    "name": "Nom de l'auteur"
  },
  "datePublished": "2024-01-01",
  "image": "URL de l'image"
}
```

#### Page Blog
```javascript
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "Blog vitalCHECK",
  "description": "Description du blog"
}
```

### Métadonnées Bilingues

- **metaTitle** : Max 60 caractères par langue
- **metaDescription** : Max 160 caractères par langue
- **Slugs uniques** : Un slug par langue pour le même article
- **URLs localisées** : `/blog/mon-article` vs `/blog/my-article`

---

## Guide d'Intégration

### Étape 1 : Installation des Dépendances

```bash
# Backend
npm install express mongoose jsonwebtoken express-validator axios node-fetch

# Frontend
npm install react react-router-dom react-i18next i18next lucide-react react-hot-toast
```

### Étape 2 : Configuration Backend

#### 2.1. Créer les modèles

Copier les fichiers :
- `server/models/Blog.js`
- `server/models/BlogVisit.js`
- `server/models/BlogVisitor.js`

#### 2.2. Créer les routes

Copier et configurer :
- `server/routes/blogs.js`
- `server/routes/blogVisitors.js`

**Intégration dans `server.js` :**
```javascript
const blogRoutes = require('./routes/blogs')
const blogVisitorRoutes = require('./routes/blogVisitors')

app.use('/api/blogs', blogRoutes)
app.use('/api/blog-visitors', blogVisitorRoutes)
```

#### 2.3. Créer les utilitaires

Copier :
- `server/utils/deviceAnalyzer.js`
- `server/utils/visitorUtils.js`

#### 2.4. Variables d'environnement

```env
JWT_SECRET=votre_secret_jwt
MONGODB_URI=mongodb://localhost:27017/votre_db
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

### Étape 3 : Configuration Frontend

#### 3.1. Créer les services

Copier :
- `client/src/services/api.js` (adapter `API_BASE_URL`)
- `client/src/services/trackingService.js`

#### 3.2. Créer les composants

Copier :
- `client/src/components/blog/BlogVisitorModal.jsx`
- `client/src/components/blog/BlogImageGallery.jsx`

#### 3.3. Créer les hooks

Copier :
- `client/src/hooks/useBlogVisitorModal.js`

#### 3.4. Créer les pages

Copier :
- `client/src/pages/BlogPage.jsx`
- `client/src/pages/BlogDetailPage.jsx`

#### 3.5. Configurer les routes

Dans `App.jsx` :
```javascript
import BlogPage from './pages/BlogPage'
import BlogDetailPage from './pages/BlogDetailPage'

<Route path="/blog" element={<BlogPage />} />
<Route path="/blog/:slug" element={<BlogDetailPage />} />
```

#### 3.6. Configurer i18next

```javascript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: require('./locales/fr.json') },
      en: { translation: require('./locales/en.json') }
    },
    lng: 'fr',
    fallbackLng: 'fr'
  })
```

### Étape 4 : Traductions

Créer les fichiers de traduction :
- `client/src/locales/fr.json`
- `client/src/locales/en.json`

**Structure minimale :**
```json
{
  "blog": {
    "title": "Blog",
    "subtitle": "...",
    "types": {...},
    "categories": {...},
    "tags": {...},
    "modal": {...}
  }
}
```

### Étape 5 : Styles

Le système utilise **Tailwind CSS**. Assurez-vous que Tailwind est configuré.

**Classes principales utilisées :**
- `bg-primary-600`, `text-primary-600` (couleurs primaires)
- `rounded-lg`, `shadow-sm` (design)
- `grid`, `flex` (layout)

### Étape 6 : Tests

1. **Créer un blog via l'API admin**
2. **Vérifier l'affichage sur `/blog`**
3. **Tester la navigation vers un article**
4. **Vérifier le tracking** (console du navigateur)
5. **Tester le formulaire visiteur**
6. **Vérifier les statistiques admin**

---

## Dépendances et Technologies

### Backend

| Package | Version | Usage |
|---------|--------|-------|
| express | ^4.x | Framework web |
| mongoose | ^6.x | ODM MongoDB |
| jsonwebtoken | ^9.x | Authentification |
| express-validator | ^7.x | Validation |
| axios | ^1.x | Requêtes HTTP |
| node-fetch | ^2.x | Requêtes HTTP (fallback) |

### Frontend

| Package | Version | Usage |
|---------|--------|-------|
| react | ^18.x | Framework UI |
| react-router-dom | ^6.x | Routing |
| react-i18next | ^13.x | Internationalisation |
| i18next | ^23.x | Core i18n |
| lucide-react | ^0.x | Icônes |
| react-hot-toast | ^2.x | Notifications |
| tailwindcss | ^3.x | Styling |

### Services Externes

- **Cloudinary** : Stockage et optimisation d'images
- **ipapi.co** : Géolocalisation (1000 req/jour gratuites)
- **ip-api.com** : Géolocalisation (fallback)
- **MyMemory** : Traduction (gratuit)
- **LibreTranslate** : Traduction (fallback, gratuit)

---

## Points d'Attention

### ⚠️ Limitations

1. **Géolocalisation** : Limite de 1000 requêtes/jour avec ipapi.co
2. **Traduction** : Services gratuits avec limitations
3. **Tracking** : Les données sont collectées en temps réel mais peuvent avoir un léger délai

### 🔒 Sécurité

- Authentification JWT pour les routes admin
- Validation des données côté serveur
- Protection contre les injections (Mongoose)
- Gestion des IPs privées (localhost)

### 📊 Performance

- Index MongoDB pour les recherches
- Pagination pour les listes
- Debouncing pour le tracking
- Lazy loading des images (Cloudinary)

### 🌐 Internationalisation

- Au moins une langue (FR ou EN) requise
- Fallback automatique si traduction manquante
- Slugs uniques par langue

---

## Support et Maintenance

### Logs

Le système génère des logs détaillés :
- `📝 [BLOGS ROUTER]` : Routes blog
- `🔍 [TRACKING]` : Tracking des visites
- `🌐 [BLOG PAGE]` : Pages frontend
- `📊 [BLOG VISITORS]` : Visiteurs

### Scripts Utiles

- `npm run migrate-blog` : Migration des anciens blogs
- `npm run create-blog` : Créer un blog de test
- `npm run reset-blog-views` : Réinitialiser les vues

---

**🎉 Documentation complète du système de blog vitalCHECK**

*Dernière mise à jour : 2024*

