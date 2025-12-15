# Système SEO avec Helmet

## Vue d'ensemble

Le système SEO utilise `react-helmet-async` pour gérer automatiquement les meta tags sur toutes les pages publiques.

## Architecture

### Composants

1. **SEOHead** (`components/seo/SEOHead.jsx`)
   - Composant réutilisable qui génère tous les meta tags
   - Support Open Graph, Twitter Cards, Articles
   - Gestion automatique de la langue

2. **useSEO** (`hooks/useSEO.js`)
   - Hook qui génère automatiquement les meta tags selon la route
   - Configuration par défaut pour chaque route publique
   - Possibilité de surcharger avec des props personnalisées

3. **Layout** (`components/layout/Layout.jsx`)
   - Intègre automatiquement SEOHead pour toutes les pages publiques
   - Accepte une prop `seo` pour personnaliser les meta tags

## Utilisation

### Utilisation automatique (par défaut)

Toutes les pages publiques qui utilisent le `<Layout>` ont automatiquement les meta tags configurés selon leur route :

```jsx
// Dans AppRoutes.jsx
<Route path="/about" element={<Layout><About /></Layout>} />
```

Les meta tags sont automatiquement générés selon la route `/about`.

### Personnalisation par page

Pour personnaliser les meta tags d'une page spécifique, passez la prop `seo` au Layout :

```jsx
// Dans votre composant de page
const About = () => {
  return (
    <Layout seo={{
      title: 'À propos de nous',
      description: 'Découvrez notre histoire...',
      keywords: 'histoire, mission, équipe',
      image: '/custom-image.jpg'
    }}>
      {/* Contenu */}
    </Layout>
  );
};
```

### Exemple : BlogDetailPage

Pour les pages avec du contenu dynamique (comme les articles de blog) :

```jsx
const BlogDetailPage = () => {
  const { blog } = useBlog();
  
  const seoConfig = useMemo(() => ({
    title: blog.title,
    description: blog.excerpt,
    image: blog.featuredImage?.url,
    type: 'article',
    articleAuthor: blog.author?.name,
    articlePublishedTime: blog.publishedAt,
    articleTags: blog.tags
  }), [blog]);
  
  return (
    <Layout seo={seoConfig}>
      {/* Contenu */}
    </Layout>
  );
};
```

## Configuration des routes

Les meta tags par défaut sont configurés dans `hooks/useSEO.js` :

```javascript
const routeConfigs = {
  '/': {
    title: 'Harvests | Marketplace agroalimentaire',
    description: '...',
    keywords: '...'
  },
  '/blog': {
    title: 'Blog | Harvests',
    description: '...',
    keywords: '...'
  },
  // ... autres routes
};
```

## Props disponibles pour SEOHead

| Prop | Type | Description |
|------|------|-------------|
| `title` | string | Titre de la page |
| `description` | string | Description meta |
| `keywords` | string | Mots-clés (séparés par virgules) |
| `image` | string | URL de l'image (Open Graph/Twitter) |
| `type` | string | Type Open Graph ('website' ou 'article') |
| `canonical` | string | URL canonique |
| `noindex` | boolean | Désactiver l'indexation |
| `ogTitle` | string | Titre Open Graph (surcharge) |
| `ogDescription` | string | Description Open Graph |
| `ogImage` | string | Image Open Graph |
| `twitterTitle` | string | Titre Twitter Card |
| `twitterDescription` | string | Description Twitter Card |
| `twitterImage` | string | Image Twitter Card |
| `articleAuthor` | string | Auteur (si type='article') |
| `articlePublishedTime` | string | Date de publication ISO |
| `articleModifiedTime` | string | Date de modification ISO |
| `articleSection` | string | Section de l'article |
| `articleTags` | string[] | Tags de l'article |

## Routes configurées

Les routes suivantes ont des meta tags pré-configurés :

- `/` - Page d'accueil
- `/products` - Liste des produits
- `/blog` - Liste des articles
- `/about` - À propos
- `/contact` - Contact
- `/help` - FAQ
- `/terms` - Conditions d'utilisation
- `/privacy` - Politique de confidentialité
- `/pricing` - Tarifs
- `/loyalty` - Programme de fidélité
- `/producers` - Producteurs
- `/transformers` - Transformateurs
- `/logistics` - Logistique
- `/categories` - Catégories

## Traduction

Les meta tags sont automatiquement traduits selon la langue de l'utilisateur via `react-i18next` :

```javascript
title: t('seo.home.title', 'Harvests | Marketplace')
```

## Bonnes pratiques

1. **Toujours utiliser le Layout** pour les pages publiques
2. **Personnaliser les meta tags** pour les pages avec contenu dynamique
3. **Utiliser des images optimisées** (1200x630px pour Open Graph)
4. **Limiter la description** à 160 caractères
5. **Utiliser des URLs canoniques** pour éviter le contenu dupliqué
6. **Ajouter des tags article** pour les articles de blog

## Exemple complet

```jsx
import Layout from '../components/layout/Layout';

const ProductDetailPage = ({ product }) => {
  const seoConfig = {
    title: product.name,
    description: product.description?.substring(0, 160),
    image: product.image?.url,
    type: 'website',
    keywords: product.tags?.join(', '),
    canonical: `${baseUrl}/products/${product.slug}`
  };
  
  return (
    <Layout seo={seoConfig}>
      <div>
        <h1>{product.name}</h1>
        {/* Contenu */}
      </div>
    </Layout>
  );
};
```

