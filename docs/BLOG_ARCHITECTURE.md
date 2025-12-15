# Architecture du Système de Blog - Documentation Complète

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture Backend](#architecture-backend)
3. [Architecture Frontend](#architecture-frontend)
4. [Parcours complet de création](#parcours-complet-de-création)
5. [Modules et dépendances](#modules-et-dépendances)
6. [Modèles de données](#modèles-de-données)
7. [API et routes](#api-et-routes)
8. [Fonctionnalités avancées](#fonctionnalités-avancées)

---

## Vue d'ensemble

Le système de blog de Harvests est une application complète permettant la création, la gestion et l'affichage d'articles de blog bilingues (FR/EN) avec des fonctionnalités avancées de tracking, SEO, et gestion de contenu.

### Caractéristiques principales

- ✅ **Bilingue** : Support complet FR/EN avec traduction automatique
- ✅ **Multi-types** : Articles, études de cas, tutoriels, actualités, témoignages
- ✅ **SEO optimisé** : Métadonnées, slugs, sitemap
- ✅ **Tracking avancé** : Visites, scroll depth, time on page
- ✅ **Gestion d'images** : Upload Cloudinary avec positions multiples
- ✅ **Statistiques** : Vues, likes, analytics détaillés

---

## Architecture Backend

### Structure des fichiers

```
backend/
├── models/
│   ├── Blog.js              # Modèle principal du blog
│   ├── BlogVisit.js         # Modèle des visites (tracking)
│   └── BlogVisitor.js       # Modèle des visiteurs (formulaires)
├── controllers/
│   ├── blog/
│   │   ├── blogAdminController.js    # CRUD admin
│   │   └── blogController.js         # Routes publiques
│   └── blogVisitorController.js      # Gestion visiteurs
├── routes/
│   ├── blogRoutes.js        # Routes blog
│   └── blogVisitorRoutes.js # Routes visiteurs
└── utils/
    └── adminEmailUtils.js   # Notifications admin
```

---

## Architecture Frontend

### Structure des fichiers

```
frontend/src/
├── pages/
│   ├── admin/
│   │   ├── AdminBlogCreate.jsx    # Page création
│   │   ├── AdminBlogEdit.jsx      # Page édition
│   │   └── AdminBlogList.jsx       # Liste des blogs
│   ├── BlogPage.jsx               # Liste publique
│   └── BlogDetailPage.jsx          # Détail public
├── components/
│   ├── admin/
│   │   ├── BlogForm.jsx           # Composants formulaire
│   │   ├── ImageUploader.jsx      # Upload images
│   │   └── AutoTranslation.jsx    # Traduction auto
│   └── blog/
│       ├── BlogContent.jsx        # Affichage contenu
│       └── BlogVisitorModal.jsx   # Modal visiteur
├── hooks/
│   ├── useBlogForm.js             # Hook formulaire
│   └── useBlogVisitorModal.js     # Hook modal visiteur
├── services/
│   ├── adminService.js            # Service admin
│   └── blogService.js             # Service blog public
└── pages/blogDetail/
    ├── blogUtils.js               # Utilitaires (Markdown)
    ├── BlogHeader.jsx             # En-tête article
    ├── BlogContent.jsx            # Contenu article
    └── BlogSidebar.jsx            # Sidebar
```

---

## Parcours complet de création

### 1. Accès au formulaire (Admin)

**Route Frontend** : `/admin/blog/create`

**Composant** : `AdminBlogCreate.jsx`

```jsx
// Le composant utilise le hook useBlogForm
const form = useBlogForm();
```

### 2. Initialisation du formulaire

**Fichier** : `frontend/src/hooks/useBlogForm.js`

**État initial** :
```javascript
const initialFormData = {
  title: { fr: '', en: '' },
  slug: { fr: '', en: '' },
  excerpt: { fr: '', en: '' },
  content: { fr: '', en: '' },
  type: 'article',
  category: 'strategie',
  tags: [],
  status: 'draft',
  featuredImage: { url: '', alt: '', caption: '' },
  images: [],
  // ... configurations spéciales par type
};
```

**Fonctionnalités** :
- ✅ Auto-sauvegarde dans localStorage (brouillon)
- ✅ Génération automatique des slugs
- ✅ Support bilingue avec sélection de langue
- ✅ Traduction automatique optionnelle

### 3. Saisie des données

#### 3.1 Informations de base

- **Titre** (FR/EN) : Génère automatiquement le slug
- **Extrait** (FR/EN) : Résumé de l'article (max 500 caractères)
- **Type** : article, etude-cas, tutoriel, actualite, temoignage
- **Catégorie** : strategie, technologie, finance, etc.
- **Statut** : draft, published, archived

#### 3.2 Contenu

- **Contenu** (FR/EN) : Support Markdown
  - Titres : `#`, `##`, `###`
  - Gras : `**texte**`
  - Italique : `*texte*`
  - Liens : `[texte](url)`
  - Listes : `- item` ou `1. item`

#### 3.3 Images

**Image featured** :
- Upload via Cloudinary
- Dossier : `harvests/blogs`
- Métadonnées : alt, caption

**Images multiples** :
- Positions : top, middle, bottom, inline, content-start, content-end
- Ordre personnalisable
- Max 10 images

#### 3.4 Champs spécifiques par type

**Étude de cas** :
```javascript
caseStudy: {
  company: String,
  sector: String,
  companySize: String,
  challenge: String,
  solution: String,
  results: String,
  metrics: [{ label, value, description }]
}
```

**Tutoriel** :
```javascript
tutorial: {
  difficulty: 'debutant' | 'intermediaire' | 'avance',
  duration: String,
  prerequisites: [String]
}
```

**Témoignage** :
```javascript
testimonial: {
  clientName: String,
  clientCompany: String,
  clientPosition: String,
  clientPhoto: String,
  rating: Number (1-5)
}
```

#### 3.5 SEO

- **Meta Title** : Titre SEO (max 60 caractères)
- **Meta Description** : Description SEO (max 160 caractères)
- Génération automatique si vide

#### 3.6 Tags

- Ajout/suppression dynamique
- Tags personnalisés

### 4. Soumission du formulaire

**Fichier** : `frontend/src/hooks/useBlogForm.js`

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validation
  if (!formData.title[selectedLanguage]?.trim()) {
    showError('Le titre est obligatoire');
    return;
  }
  if (!formData.content[selectedLanguage]?.trim()) {
    showError('Le contenu est obligatoire');
    return;
  }

  // Appel API
  if (isEdit) {
    await adminService.updateBlog(id, formData);
  } else {
    await adminService.createBlog(formData);
  }
};
```

### 5. Appel API Frontend

**Fichier** : `frontend/src/services/adminService.js`

```javascript
export const createBlog = async (blogData) => {
  const response = await adminBlogApiService.createBlog(blogData);
  return response.data;
};
```

**Fichier** : `frontend/src/services/blogService.js`

```javascript
export const adminBlogApiService = {
  createBlog: (data) => api.post('/blogs/admin/blogs', data),
  updateBlog: (id, data) => api.put(`/blogs/admin/blogs/${id}`, data),
  // ...
};
```

### 6. Route Backend

**Fichier** : `backend/routes/blogRoutes.js`

```javascript
router.post('/admin/blogs', 
  adminAuthController.protect,  // Authentification requise
  blogController.createBlog
);
```

### 7. Contrôleur Backend

**Fichier** : `backend/controllers/blog/blogAdminController.js`

```javascript
exports.createBlog = catchAsync(async (req, res, next) => {
  // Validation
  if (!req.body.title?.fr && !req.body.title?.en) {
    return next(new AppError('Au moins un titre (FR ou EN) est requis', 400));
  }
  if (!req.body.content?.fr && !req.body.content?.en) {
    return next(new AppError('Au moins un contenu (FR ou EN) est requis', 400));
  }
  
  // Ajouter l'auteur (admin connecté)
  req.body.author = req.admin._id;
  
  // Définir publishedAt si status est published
  if (req.body.status === 'published' && !req.body.publishedAt) {
    req.body.publishedAt = new Date();
  }
  
  // Création
  const blog = await Blog.create(req.body);
  
  res.status(201).json({
    success: true,
    data: blog
  });
});
```

### 8. Modèle et sauvegarde

**Fichier** : `backend/models/Blog.js`

**Middleware pre-save** :
```javascript
blogSchema.pre('save', function(next) {
  // Génération automatique des slugs
  if (this.title?.fr && !this.slug?.fr) {
    this.slug.fr = slugify(this.title.fr, { 
      lower: true, 
      strict: true,
      locale: 'fr'
    });
  }
  
  if (this.title?.en && !this.slug?.en) {
    this.slug.en = slugify(this.title.en, { 
      lower: true, 
      strict: true,
      locale: 'en'
    });
  }
  
  // Définir publishedAt si status passe à published
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});
```

**Validation** :
```javascript
blogSchema.pre('validate', function(next) {
  if (!this.title?.fr && !this.title?.en) {
    next(new Error('Au moins un titre (FR ou EN) est requis'));
  } else {
    next();
  }
});
```

### 9. Réponse et redirection

Après création réussie :
1. ✅ Notification de succès
2. ✅ Suppression du brouillon localStorage
3. ✅ Redirection vers `/admin/blog`

---

## Modules et dépendances

### Backend

#### Dépendances principales

```json
{
  "mongoose": "^x.x.x",        // ODM MongoDB
  "slugify": "^x.x.x",        // Génération slugs
  "express": "^x.x.x",        // Framework web
  "axios": "^x.x.x"           // Requêtes HTTP (traduction)
}
```

#### Utilitaires

- `catchAsync` : Gestion d'erreurs async
- `AppError` : Erreurs personnalisées
- `adminAuthController.protect` : Middleware authentification

### Frontend

#### Dépendances principales

```json
{
  "react": "^19.1.1",
  "react-router-dom": "^7.9.1",
  "axios": "^1.12.2",
  "react-i18next": "^15.7.3",
  "lucide-react": "^0.544.0",
  "@tailwindcss/typography": "^0.5.18"
}
```

#### Services

- `adminService` : Appels API admin
- `blogService` : Appels API blog public
- `uploadService` : Upload Cloudinary
- `trackingService` : Tracking visites

---

## Modèles de données

### Blog Schema

```javascript
{
  // Contenu bilingue
  title: { fr: String, en: String },
  slug: { fr: String, en: String },
  excerpt: { fr: String, en: String },
  content: { fr: String, en: String },
  
  // Classification
  type: 'article' | 'etude-cas' | 'tutoriel' | 'actualite' | 'temoignage',
  category: 'strategie' | 'technologie' | 'finance' | ...,
  tags: [String],
  
  // Images
  featuredImage: { url, alt, caption },
  images: [{
    cloudinaryId, url, alt, caption,
    position: 'top' | 'middle' | 'bottom' | 'inline' | 'content-start' | 'content-end',
    order: Number
  }],
  
  // Statut
  status: 'draft' | 'published' | 'archived',
  publishedAt: Date,
  
  // Auteur
  author: ObjectId (ref: Admin),
  
  // SEO
  metaTitle: { fr: String, en: String },
  metaDescription: { fr: String, en: String },
  
  // Statistiques
  views: Number (default: 0),
  likes: Number (default: 0),
  
  // Configurations spéciales
  caseStudy: { company, sector, challenge, solution, results, metrics },
  tutorial: { difficulty, duration, prerequisites },
  testimonial: { clientName, clientCompany, rating, ... },
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### BlogVisit Schema

```javascript
{
  blog: ObjectId (ref: Blog),
  user: ObjectId (ref: User, optional),
  sessionId: String,
  
  // Géolocalisation
  ipAddress: String,
  country: String,
  region: String,
  city: String,
  
  // Appareil
  userAgent: String,
  device: {
    type: 'desktop' | 'mobile' | 'tablet',
    os: String,
    browser: String
  },
  
  // Métriques
  timeOnPage: Number,
  scrollDepth: Number (0-100),
  isBounce: Boolean,
  
  // Référent
  referrer: String,
  referrerDomain: String,
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  
  // Statut
  status: 'active' | 'completed' | 'bounced',
  visitedAt: Date,
  leftAt: Date
}
```

---

## API et routes

### Routes publiques

```
GET    /api/v1/blogs                    # Liste articles publiés
GET    /api/v1/blogs/:slug              # Détail par slug
POST   /api/v1/blogs/:id/like           # Liker un article
POST   /api/v1/blogs/track              # Tracker une visite
```

### Routes admin (authentifiées)

```
GET    /api/v1/blogs/admin/blogs        # Liste tous les blogs
GET    /api/v1/blogs/admin/blogs/:id    # Détail blog (admin)
POST   /api/v1/blogs/admin/blogs        # Créer un blog
PUT    /api/v1/blogs/admin/blogs/:id    # Mettre à jour
DELETE /api/v1/blogs/admin/blogs/:id    # Supprimer
GET    /api/v1/blogs/admin/stats        # Statistiques
GET    /api/v1/blogs/admin/blogs/:id/visits  # Visites d'un blog
GET    /api/v1/blogs/admin/visits       # Toutes les visites
POST   /api/v1/blogs/translate         # Traduction automatique
```

### Routes visiteurs

```
GET    /api/v1/blog-visitors/check      # Vérifier visiteur
POST   /api/v1/blog-visitors/submit    # Soumettre formulaire
GET    /api/v1/blog-visitors/admin     # Liste visiteurs (admin)
GET    /api/v1/blog-visitors/admin/stats # Stats visiteurs
```

---

## Fonctionnalités avancées

### 1. Conversion Markdown → HTML

**Fichier** : `frontend/src/pages/blogDetail/blogUtils.js`

**Fonction** : `markdownToHtml(markdown)`

**Support** :
- Titres : `#`, `##`, `###`
- Gras : `**texte**`
- Italique : `*texte*`
- Liens : `[texte](url)`
- Listes : `- item`, `1. item`
- Paragraphes : Double saut de ligne

**Utilisation** :
```jsx
<div dangerouslySetInnerHTML={{ 
  __html: markdownToHtml(getLocalizedContent(blog.content)) 
}} />
```

### 2. Auto-sauvegarde (Brouillon)

**Fichier** : `frontend/src/hooks/useBlogForm.js`

- Sauvegarde automatique dans `localStorage` toutes les 2 secondes
- Clé : `blog-edit-draft-{id}`
- Restauration automatique au chargement
- Suppression après sauvegarde réussie

### 3. Traduction automatique

**Service** : MyMemory API + LibreTranslate (fallback)

**Endpoint** : `POST /api/v1/blogs/translate`

**Utilisation** :
```javascript
const translated = await translateText(text, 'fr', 'en');
```

### 4. Upload d'images Cloudinary

**Service** : `uploadService.uploadToCloudinary()`

**Processus** :
1. Sélection fichier
2. Création FormData
3. Upload vers Cloudinary (dossier `harvests/blogs`)
4. Récupération URL sécurisée
5. Mise à jour du formulaire

### 5. Tracking des visites

**Composant** : `BlogDetailPage.jsx`

**Métriques collectées** :
- Time on page
- Scroll depth
- Device type
- Géolocalisation
- Référent
- UTM parameters

**Service** : `trackingService`

### 6. Statistiques

**Métriques disponibles** :
- Total blogs (publiés, brouillons)
- Vues totales
- Likes totales
- Visites uniques
- Répartition par appareil
- Top pays
- Top référents

### 7. SEO

**Fonctionnalités** :
- Slugs automatiques (slugify)
- Meta titles/descriptions
- Sitemap automatique
- Indexation textuelle MongoDB
- URLs propres (`/blog/:slug`)

### 8. Gestion des visiteurs

**Modèle** : `BlogVisitor`

**Fonctionnalités** :
- Formulaire de capture (modal)
- Détection visiteur retournant
- Association visites/blogs
- Statistiques par visiteur

---

## Flux de données complet

### Création d'un blog

```
1. Admin ouvre /admin/blog/create
   ↓
2. useBlogForm() initialise le formulaire
   ↓
3. Admin saisit les données
   ↓
4. Auto-sauvegarde localStorage (brouillon)
   ↓
5. Admin clique "Publier"
   ↓
6. Validation frontend
   ↓
7. adminService.createBlog(formData)
   ↓
8. POST /api/v1/blogs/admin/blogs
   ↓
9. Middleware auth (protect)
   ↓
10. blogAdminController.createBlog()
    ↓
11. Validation backend
    ↓
12. Blog.create(req.body)
    ↓
13. Middleware pre-save (génération slugs)
    ↓
14. Sauvegarde MongoDB
    ↓
15. Réponse JSON
    ↓
16. Notification succès
    ↓
17. Redirection /admin/blog
```

### Affichage d'un blog

```
1. Visiteur accède /blog/:slug
   ↓
2. BlogDetailPage charge
   ↓
3. blogApiService.getBlogBySlug(slug)
   ↓
4. GET /api/v1/blogs/:slug
   ↓
5. blogController.getBlogBySlug()
   ↓
6. Blog.findOne({ 'slug.fr': slug }) ou { 'slug.en': slug }
   ↓
7. Réponse avec données blog
   ↓
8. BlogContent affiche le contenu
   ↓
9. markdownToHtml() convertit le Markdown
   ↓
10. dangerouslySetInnerHTML rend le HTML
    ↓
11. Tracking initialisé (si pas admin)
    ↓
12. Modal visiteur (si nouveau visiteur)
```

---

## Index MongoDB

### Blog

```javascript
// Recherche textuelle
{ 'title.fr': 'text', 'title.en': 'text', 'content.fr': 'text', ... }

// Filtres
{ status: 1, publishedAt: -1 }
{ type: 1, category: 1 }
{ tags: 1 }
{ 'slug.fr': 1 }
{ 'slug.en': 1 }
```

### BlogVisit

```javascript
{ blog: 1, visitedAt: -1 }
{ sessionId: 1 }
{ ipAddress: 1 }
{ country: 1 }
{ 'device.type': 1 }
```

---

## Sécurité

### Authentification

- **Admin routes** : `adminAuthController.protect`
- **Token JWT** : Vérification à chaque requête
- **Auteur** : Automatiquement défini depuis `req.admin._id`

### Validation

- **Frontend** : Validation des champs requis
- **Backend** : Validation Mongoose + validation manuelle
- **Sanitization** : Échappement HTML dans Markdown

### Upload

- **Cloudinary** : Validation type/size côté serveur
- **Dossier sécurisé** : `harvests/blogs`
- **URLs sécurisées** : HTTPS uniquement

---

## Performance

### Optimisations

- **Pagination** : Limite par défaut 20 items
- **Index MongoDB** : Index sur champs fréquemment recherchés
- **Populate sélectif** : Seulement les champs nécessaires
- **Lazy loading** : Images chargées à la demande
- **Cache localStorage** : Brouillons sauvegardés localement

### Requêtes optimisées

```javascript
// Exemple : Liste blogs avec pagination
Blog.find(queryObj)
  .populate('author', 'firstName lastName email')  // Seulement 3 champs
  .sort('-createdAt')
  .skip(skip)
  .limit(limit);
```

---

## Tests et débogage

### Points de contrôle

1. **Création** : Vérifier slugs générés
2. **Validation** : Tester champs requis
3. **Markdown** : Vérifier conversion HTML
4. **Images** : Tester upload Cloudinary
5. **Tracking** : Vérifier enregistrement visites
6. **SEO** : Vérifier meta tags

### Logs utiles

```javascript
// Backend
console.log('Blog créé:', blog._id);
console.error('Erreur création:', error);

// Frontend
console.log('FormData:', formData);
console.error('Erreur soumission:', error);
```

---

## Conclusion

Le système de blog de Harvests est une solution complète et robuste pour la gestion de contenu bilingue avec :

- ✅ Architecture modulaire et maintenable
- ✅ Support bilingue complet
- ✅ SEO optimisé
- ✅ Tracking avancé
- ✅ Interface admin intuitive
- ✅ Performance optimisée

Pour toute question ou amélioration, référez-vous aux fichiers source mentionnés dans cette documentation.

