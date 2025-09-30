# Migration vers Cloudinary - Documentation

## Résumé des modifications

Le contrôleur d'upload a été modifié pour utiliser **Cloudinary** au lieu du stockage local des fichiers. Cette migration améliore les performances, la scalabilité et la gestion des images.

## Fichiers modifiés

### 1. `backend/controllers/uploadController.js`

**Avant :**
- Stockage local avec `multer.diskStorage()`
- Redimensionnement avec `sharp`
- Gestion manuelle des dossiers avec `fs`

**Après :**
- Stockage Cloudinary avec `multer-storage-cloudinary`
- Redimensionnement automatique par Cloudinary
- URLs optimisées automatiquement

#### Nouvelles fonctions :
- `processAvatar()` - Traite les avatars uploadés
- `processShopBanner()` - Traite les bannières de boutique
- `processShopLogo()` - Traite les logos de boutique
- `processProductImages()` - Traite les images de produits
- `deleteImage()` - Supprime les images de Cloudinary
- `deleteImageByUrl()` - Supprime par URL (utile pour migration)
- `getOptimizedImageUrl()` - Génère des URLs optimisées
- `uploadToCloudinary()` - Upload direct vers Cloudinary

### 2. `backend/routes/uploadRoutes.js`

**Nouvelles routes ajoutées :**
- `POST /api/upload/cloudinary` - Upload direct vers Cloudinary
- `DELETE /api/upload/image/:publicId` - Suppression par public ID
- `DELETE /api/upload/image-by-url` - Suppression par URL
- `GET /api/upload/optimize/:publicId` - URL optimisée

## Configuration Cloudinary

### Variables d'environnement requises
```env
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

### Organisation des dossiers
Les images sont organisées dans Cloudinary selon cette structure :
```
harvests/
├── profiles/
│   ├── producers/
│   ├── consumers/
│   ├── transformers/
│   ├── restaurateurs/
│   ├── exporters/
│   └── transporters/
├── products/
│   ├── cereals/
│   ├── vegetables/
│   ├── fruits/
│   ├── legumes/
│   ├── tubers/
│   ├── spices/
│   └── processed/
├── documents/
│   ├── certifications/
│   ├── licenses/
│   └── contracts/
└── marketing/
    ├── banners/
    ├── promotions/
    └── stories/
```

## Avantages de la migration

### 1. **Performance**
- Redimensionnement automatique et optimisé
- URLs optimisées selon le contexte
- CDN global pour une diffusion rapide

### 2. **Scalabilité**
- Stockage illimité
- Pas de gestion manuelle des serveurs
- Auto-scaling selon la demande

### 3. **Fonctionnalités avancées**
- Transformations d'images en temps réel
- Optimisation automatique du format (WebP, AVIF)
- Redimensionnement intelligent avec IA

### 4. **Sécurité**
- URLs signées pour l'accès privé
- Watermarking automatique
- Protection contre le hotlinking

## Utilisation des nouvelles fonctionnalités

### Upload d'avatar
```javascript
// Frontend
const formData = new FormData();
formData.append('avatar', file);

fetch('/api/upload/avatar', {
  method: 'PATCH',
  body: formData,
  headers: { Authorization: `Bearer ${token}` }
});
```

### Upload d'images de produits
```javascript
const formData = new FormData();
files.forEach(file => formData.append('images', file));

fetch('/api/upload/product-images', {
  method: 'POST',
  body: formData,
  headers: { Authorization: `Bearer ${token}` }
});
```

### Suppression d'image
```javascript
// Par public ID
fetch(`/api/upload/image/${publicId}`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token}` }
});

// Par URL
fetch('/api/upload/image-by-url', {
  method: 'DELETE',
  body: JSON.stringify({ imageUrl }),
  headers: { 
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}` 
  }
});
```

### URL optimisée
```javascript
// Générer une URL optimisée
const response = await fetch(`/api/upload/optimize/${publicId}?width=300&height=200&quality=80`);
const { optimizedUrl } = await response.json();
```

## Migration des images existantes

Pour migrer les images stockées localement vers Cloudinary :

1. **Script de migration** (à créer) :
```javascript
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

async function migrateLocalImages() {
  const localImagesDir = path.join(__dirname, '../public/img');
  
  // Parcourir les images locales
  const images = fs.readdirSync(localImagesDir, { recursive: true });
  
  for (const image of images) {
    if (image.endsWith('.jpg') || image.endsWith('.png')) {
      const imagePath = path.join(localImagesDir, image);
      
      // Upload vers Cloudinary
      const result = await cloudinary.uploader.upload(imagePath, {
        folder: 'harvests/migrated',
        public_id: image.replace(/\.[^/.]+$/, "")
      });
      
      console.log(`Migré: ${image} -> ${result.secure_url}`);
    }
  }
}
```

2. **Mise à jour des URLs** dans la base de données
3. **Suppression** des fichiers locaux après vérification

## Gestion des erreurs

### Erreurs communes
- **Fichier trop volumineux** : Limite de 5MB
- **Format non supporté** : Seules les images sont acceptées
- **Quota dépassé** : Vérifier le plan Cloudinary
- **Clés API invalides** : Vérifier les variables d'environnement

### Monitoring
- Utiliser les logs Cloudinary pour surveiller l'utilisation
- Surveiller les coûts selon le plan choisi
- Monitorer les performances des uploads

## Tests recommandés

1. **Tests d'upload** : Vérifier tous les types d'images
2. **Tests de suppression** : S'assurer que les images sont bien supprimées
3. **Tests de performance** : Comparer les temps de chargement
4. **Tests de quota** : Vérifier les limites du plan Cloudinary

## Support

Pour toute question ou problème :
- Documentation Cloudinary : https://cloudinary.com/documentation
- Support technique de l'équipe Harvests
- Logs d'erreurs dans `/backend/logs/`
