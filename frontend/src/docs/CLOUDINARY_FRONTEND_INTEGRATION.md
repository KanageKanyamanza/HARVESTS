# Intégration Cloudinary - Frontend

## Résumé des modifications

Le frontend a été mis à jour pour utiliser **Cloudinary** de manière optimale avec les nouvelles fonctionnalités du backend.

## Fichiers modifiés

### 1. `frontend/src/services/uploadService.js`

**Nouvelles fonctionnalités ajoutées :**

- `deleteImage(publicId)` - Suppression par public ID Cloudinary
- `deleteImageByUrl(imageUrl)` - Suppression par URL Cloudinary
- `getOptimizedImageUrl(publicId, options)` - URL optimisée via API
- `uploadToCloudinary(formData)` - Upload direct vers Cloudinary
- `extractPublicId(cloudinaryUrl)` - Extraction du public ID d'une URL
- `getOptimizedUrlLocal(cloudinaryUrl, options)` - Génération d'URL optimisée côté client

**Améliorations :**

- `getImageUrl()` mis à jour pour gérer les URLs Cloudinary
- Support des anciennes images locales (migration)
- Détection automatique des URLs Cloudinary

### 2. `frontend/src/components/common/CloudinaryImage.jsx` (NOUVEAU)

**Composant d'image optimisé :**

```jsx
<CloudinaryImage
  src={imageUrl}
  alt="Description"
  width={800}
  height={600}
  quality="auto"
  format="auto"
  crop="fit"
  className="custom-class"
/>
```

**Fonctionnalités :**
- Optimisation automatique des images Cloudinary
- Fallback pour les images cassées
- Support des transformations Cloudinary
- Compatible avec les anciennes images locales

### 3. Composants mis à jour

**Pages mises à jour :**
- `frontend/src/pages/dashboard/producer/MyProducts.jsx`
- `frontend/src/pages/dashboard/producer/ProducerDashboard.jsx`
- `frontend/src/pages/dashboard/consumer/Favorites.jsx`

**Changements :**
- Remplacement des balises `<img>` par `<CloudinaryImage>`
- Support des nouvelles structures d'images (`product.images[0]?.url`)
- Optimisation automatique selon le contexte

## Utilisation

### Upload d'images

```javascript
import { uploadService } from '../services';

// Upload d'avatar
const formData = new FormData();
formData.append('avatar', file);
const response = await uploadService.uploadAvatar(formData);

// Upload direct vers Cloudinary
const response = await uploadService.uploadToCloudinary(formData);
```

### Affichage d'images optimisées

```jsx
import CloudinaryImage from '../components/common/CloudinaryImage';

// Image simple
<CloudinaryImage
  src={product.image}
  alt={product.name}
  width={400}
  height={300}
/>

// Image avec transformations avancées
<CloudinaryImage
  src={user.avatar}
  alt="Avatar"
  width={200}
  height={200}
  quality="80"
  format="webp"
  crop="fill"
  gravity="face"
/>
```

### Suppression d'images

```javascript
// Par public ID
await uploadService.deleteImage(publicId);

// Par URL
await uploadService.deleteImageByUrl(imageUrl);
```

### URLs optimisées

```javascript
// Génération côté client (recommandé)
const optimizedUrl = uploadService.getOptimizedUrlLocal(imageUrl, {
  width: 300,
  height: 200,
  quality: '80',
  format: 'webp'
});

// Via API (pour cas complexes)
const response = await uploadService.getOptimizedImageUrl(publicId, options);
```

## Migration des images existantes

### Structure des données

**Avant (stockage local) :**
```javascript
{
  images: ["/img/products/product-123-1.jpg"]
}
```

**Après (Cloudinary) :**
```javascript
{
  images: [
    {
      url: "https://res.cloudinary.com/.../product-123-1.jpg",
      alt: "Image 1",
      isPrimary: true,
      publicId: "harvests/products/product-123-1"
    }
  ]
}
```

### Compatibilité

Le système gère automatiquement les deux formats :
- URLs Cloudinary complètes
- Chemins locaux (pour migration)
- Structures d'objets avec `url` et `publicId`

## Optimisations automatiques

### 1. **Format automatique**
- WebP pour les navigateurs supportés
- JPEG/PNG pour la compatibilité

### 2. **Qualité adaptative**
- `auto:best` pour la qualité optimale
- Compression intelligente selon le contenu

### 3. **Responsive**
- URLs différentes selon la taille d'écran
- Chargement paresseux (lazy loading)

### 4. **Performance**
- CDN global Cloudinary
- Cache intelligent
- Préchargement des images critiques

## Configuration

### Variables d'environnement

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Options Cloudinary par défaut

```javascript
const defaultOptions = {
  quality: 'auto:best',
  format: 'auto',
  crop: 'fit'
};
```

## Bonnes pratiques

### 1. **Utilisation du composant CloudinaryImage**
```jsx
// ✅ Recommandé
<CloudinaryImage src={imageUrl} width={400} height={300} />

// ❌ Éviter
<img src={imageUrl} />
```

### 2. **Gestion des erreurs**
```jsx
<CloudinaryImage
  src={imageUrl}
  fallback="/images/placeholder.jpg"
  onError={(e) => console.log('Image failed to load')}
/>
```

### 3. **Optimisation selon le contexte**
```jsx
// Thumbnail
<CloudinaryImage width={100} height={100} quality="60" crop="fill" />

// Image principale
<CloudinaryImage width={800} height={600} quality="auto" crop="fit" />

// Avatar
<CloudinaryImage width={200} height={200} crop="fill" gravity="face" />
```

## Tests

### Vérifications à effectuer

1. **Upload d'images** : Tous les types (avatar, banner, produit)
2. **Affichage** : Images Cloudinary et locales
3. **Optimisation** : URLs générées correctement
4. **Suppression** : Par public ID et URL
5. **Fallback** : Images cassées ou manquantes
6. **Performance** : Temps de chargement

### Tests automatisés recommandés

```javascript
// Test d'upload
test('should upload image to Cloudinary', async () => {
  const formData = new FormData();
  formData.append('avatar', mockFile);
  const response = await uploadService.uploadAvatar(formData);
  expect(response.data.user.avatar).toMatch(/cloudinary\.com/);
});

// Test d'optimisation
test('should generate optimized URL', () => {
  const url = uploadService.getOptimizedUrlLocal(cloudinaryUrl, {
    width: 300,
    height: 200
  });
  expect(url).toContain('w_300,h_200');
});
```

## Support et dépannage

### Problèmes courants

1. **Image ne s'affiche pas**
   - Vérifier l'URL Cloudinary
   - Vérifier les clés API
   - Vérifier le fallback

2. **Upload échoue**
   - Vérifier la taille du fichier
   - Vérifier le type de fichier
   - Vérifier la connexion

3. **Performance lente**
   - Vérifier les options d'optimisation
   - Vérifier le CDN Cloudinary
   - Vérifier le cache

### Logs utiles

```javascript
// Activer les logs détaillés
console.log('Image URL:', uploadService.getImageUrl(imagePath));
console.log('Optimized URL:', uploadService.getOptimizedUrlLocal(imageUrl, options));
```
