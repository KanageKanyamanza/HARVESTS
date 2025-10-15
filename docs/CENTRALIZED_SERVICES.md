# 🏗️ Services Centralisés - Architecture

## 📋 Vue d'ensemble

Cette architecture centralise tous les services communs entre les différents types de profils (Producer, Transformer, Consumer, Restaurateur, Exporter, Transporter) pour améliorer la maintenabilité et éviter la duplication de code.

## 🎯 Objectifs

- **Centralisation** : Un seul endroit pour gérer les fonctionnalités communes
- **Maintenabilité** : Modifications faciles et cohérentes
- **Réutilisabilité** : Services utilisables par tous les profils
- **Cohérence** : Même comportement partout

## 📁 Structure des Services

### Backend

```
backend/
├── services/
│   ├── profileService.js          # Service principal des profils
│   └── profileImageService.js     # Service des images de profil
├── routes/
│   └── profileRoutes.js           # Routes centralisées
└── models/
    └── User.js                    # Modèle de base avec champs communs
```

### Frontend

```
frontend/src/
├── services/
│   └── profileService.js          # Service frontend centralisé
├── components/common/
│   └── ProfileImageUpload.jsx     # Composant d'upload centralisé
└── hooks/
    └── useProfile.js              # Hook personnalisé
```

## 🔧 Services Centralisés

### 1. ProfileService (Backend)

**Fichier** : `backend/services/profileService.js`

**Fonctionnalités** :
- `getProfile()` - Obtenir le profil complet
- `updateProfile()` - Mettre à jour le profil
- `deleteProfileImage()` - Supprimer une image
- `getCommonStats()` - Statistiques communes
- `updateNotificationPreferences()` - Préférences de notification

**Avantages** :
- ✅ Gère tous les types d'utilisateurs
- ✅ Validation centralisée
- ✅ Mise à jour cohérente

### 2. ProfileImageService (Backend)

**Fichier** : `backend/services/profileImageService.js`

**Fonctionnalités** :
- `uploadAvatar()` - Upload photo de profil
- `uploadShopBanner()` - Upload bannière
- `uploadShopLogo()` - Upload logo
- `processImageUpload()` - Traitement post-upload
- `deleteImage()` - Suppression d'images

**Avantages** :
- ✅ Upload Cloudinary centralisé
- ✅ Validation des types/tailles
- ✅ Optimisation automatique

### 3. ProfileService (Frontend)

**Fichier** : `frontend/src/services/profileService.js`

**Fonctionnalités** :
- `getProfile()` - Récupération du profil
- `updateProfile()` - Mise à jour
- `uploadAvatar/Banner/Logo()` - Uploads spécialisés
- `deleteImage()` - Suppression
- `validateFileType/Size()` - Validations

**Avantages** :
- ✅ API unifiée
- ✅ Gestion d'erreurs centralisée
- ✅ Configuration par type d'image

### 4. ProfileImageUpload (Composant)

**Fichier** : `frontend/src/components/common/ProfileImageUpload.jsx`

**Fonctionnalités** :
- Upload drag & drop
- Prévisualisation
- Validation en temps réel
- Support multi-types (avatar, banner, logo)

**Avantages** :
- ✅ Interface cohérente
- ✅ Réutilisable partout
- ✅ Configuration flexible

### 5. useProfile (Hook)

**Fichier** : `frontend/src/hooks/useProfile.js`

**Fonctionnalités** :
- État du profil
- Fonctions d'upload
- Gestion des erreurs
- Synchronisation avec AuthContext

**Avantages** :
- ✅ Logique centralisée
- ✅ État partagé
- ✅ Facile à utiliser

## 🛣️ Routes Centralisées

### Backend Routes

```javascript
// /api/v1/profiles/*
GET    /profiles/me                    # Obtenir le profil
PATCH  /profiles/me                    # Mettre à jour le profil
PATCH  /profiles/me/avatar             # Upload avatar
PATCH  /profiles/me/banner             # Upload bannière
PATCH  /profiles/me/logo               # Upload logo
DELETE /profiles/me/images/:type       # Supprimer image
GET    /profiles/me/stats              # Statistiques
PATCH  /profiles/me/notifications      # Préférences
```

## 📊 Éléments Communs Identifiés

### Images de Profil
- `avatar` - Photo de profil
- `shopBanner` - Bannière de boutique
- `shopLogo` - Logo de boutique

### Informations de Base
- `firstName`, `lastName`, `email`, `phone`
- `address` - Adresse complète
- `country`, `language`, `currency`

### Statuts et Vérifications
- `isEmailVerified`, `isActive`, `isApproved`
- `isProfileComplete`

### Notifications
- `notifications` - Préférences (email, sms, push)
- `preferredLanguage`

### Statistiques
- `businessStats` - Commandes, dépenses, etc.
- `supplierRating` - Note fournisseur

## 🚀 Utilisation

### Dans un composant de profil

```jsx
import { useProfile } from '../hooks/useProfile';
import ProfileImageUpload from '../components/common/ProfileImageUpload';

const MyProfile = () => {
  const { profile, loading, updateProfile, uploadImage } = useProfile();

  const handleImageUpload = async (file, type) => {
    await uploadImage(file, type);
  };

  return (
    <div>
      <ProfileImageUpload
        currentImage={profile?.avatar}
        onImageChange={(image) => handleImageUpload(image, 'avatar')}
        imageType="avatar"
        size="large"
      />
    </div>
  );
};
```

### Service direct

```javascript
import { profileService } from '../services/profileService';

// Upload d'image
const formData = profileService.createFormData(file, 'avatar');
await profileService.uploadAvatar(formData);

// Mise à jour du profil
await profileService.updateProfile({ firstName: 'John' });
```

## 🔄 Migration

### Étapes de migration

1. **Backend** : Créer les services centralisés
2. **Routes** : Ajouter les routes centralisées
3. **Frontend** : Créer les services et composants
4. **Migration** : Remplacer progressivement les anciens services
5. **Nettoyage** : Supprimer les anciens codes dupliqués

### Avantages de la migration

- ✅ **Maintenabilité** : Un seul endroit à modifier
- ✅ **Cohérence** : Même comportement partout
- ✅ **Performance** : Code optimisé et réutilisé
- ✅ **Tests** : Tests centralisés et simplifiés
- ✅ **Documentation** : Documentation unifiée

## 📝 Prochaines Étapes

1. **Tester** les services centralisés
2. **Migrer** les profils existants
3. **Documenter** les APIs
4. **Optimiser** les performances
5. **Ajouter** de nouvelles fonctionnalités communes

---

Cette architecture centralisée garantit une meilleure maintenabilité et une expérience utilisateur cohérente à travers tous les types de profils.
