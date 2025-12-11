# Documentation SEO et Indexation

Ce document explique les fichiers et configurations nécessaires pour l'indexation de HARVESTS par les moteurs de recherche.

## 📁 Fichiers créés

### 1. `frontend/public/robots.txt`
Fichier statique qui guide les robots des moteurs de recherche sur les pages à indexer ou à ignorer.

**Localisation** : Accessible à `https://www.harvests.site/robots.txt`

**Contenu** :
- Autorise l'indexation des pages publiques (produits, producteurs, etc.)
- Interdit l'indexation des pages privées (dashboard, commandes, etc.)
- Référence le sitemap

### 2. `frontend/public/sitemap.xml`
Fichier statique qui liste les pages importantes du site pour les moteurs de recherche.

**Localisation** : Accessible à `https://www.harvests.site/sitemap.xml`

**Contenu** :
- Liste des pages statiques principales
- Priorités et fréquences de mise à jour pour chaque page

### 3. `backend/controllers/seoController.js`
Contrôleur pour générer dynamiquement le sitemap et robots.txt depuis la base de données.

**Fonctionnalités** :
- `generateSitemap()` : Génère un sitemap XML avec les produits, producteurs, etc. depuis la DB
- `generateRobots()` : Génère un robots.txt dynamique

### 4. `backend/routes/seoRoutes.js`
Routes pour accéder aux fichiers SEO dynamiques.

**Endpoints** :
- `GET /sitemap.xml` : Génère le sitemap dynamique
- `GET /robots.txt` : Génère le robots.txt dynamique

## 🔧 Configuration

### Variables d'environnement

Assurez-vous que `FRONTEND_URL` est configuré dans votre `.env` :

```env
FRONTEND_URL=https://www.harvests.site
```

### Routes dans app.js

Les routes SEO sont automatiquement ajoutées dans `backend/app.js` :

```javascript
const seoRoutes = require('./routes/seoRoutes');
app.use('/', seoRoutes);
```

## 📊 Utilisation

### Sitemap statique vs dynamique

**Sitemap statique** (`frontend/public/sitemap.xml`) :
- Contient les pages statiques principales
- Mis à jour manuellement si nécessaire
- Accessible directement depuis le frontend

**Sitemap dynamique** (`GET /sitemap.xml`) :
- Généré depuis la base de données
- Inclut tous les produits, producteurs, etc. actifs
- Mis à jour automatiquement
- Priorité sur le sitemap statique si configuré

### Recommandation

Pour la production, utilisez le **sitemap dynamique** car il inclut toutes les pages générées depuis la base de données.

Pour utiliser le sitemap dynamique, modifiez `frontend/public/robots.txt` :

```
Sitemap: https://www.harvests.site/sitemap.xml
```

Et configurez votre serveur web (Nginx, Apache) pour rediriger `/sitemap.xml` vers l'API backend si nécessaire.

## 🔍 Vérification

### Tester robots.txt

```bash
curl https://www.harvests.site/robots.txt
```

### Tester sitemap.xml

```bash
curl https://www.harvests.site/sitemap.xml
```

### Soumettre à Google Search Console

1. Connectez-vous à [Google Search Console](https://search.google.com/search-console)
2. Ajoutez votre propriété (site web)
3. Allez dans "Sitemaps"
4. Ajoutez : `https://www.harvests.site/sitemap.xml`

### Soumettre à Bing Webmaster Tools

1. Connectez-vous à [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Ajoutez votre site
3. Allez dans "Sitemaps"
4. Ajoutez : `https://www.harvests.site/sitemap.xml`

## 📝 Maintenance

### Mise à jour du sitemap

Le sitemap dynamique se met à jour automatiquement. Pour forcer une mise à jour :

1. Les produits, producteurs, etc. sont automatiquement inclus s'ils sont actifs
2. Les dates de dernière modification (`lastmod`) sont basées sur `updatedAt`

### Mise à jour de robots.txt

Le robots.txt statique peut être modifié manuellement dans `frontend/public/robots.txt`.

Le robots.txt dynamique peut être modifié dans `backend/controllers/seoController.js`.

## 🚀 Bonnes pratiques SEO

1. **Mise à jour régulière** : Le sitemap se met à jour automatiquement avec les nouvelles données
2. **Priorités** : Les pages importantes ont une priorité élevée (0.8-1.0)
3. **Fréquences** : Les pages dynamiques (produits) ont `changefreq: weekly`
4. **Dates** : Utilisez `lastmod` pour indiquer la dernière modification

## ⚠️ Notes importantes

- Les pages privées (dashboard, commandes, etc.) sont exclues du sitemap
- Seuls les produits/acteurs actifs sont inclus dans le sitemap dynamique
- Le sitemap est limité à 1000 produits, 500 de chaque type d'acteur pour éviter les fichiers trop volumineux

