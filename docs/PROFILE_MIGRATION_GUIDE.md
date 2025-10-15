# Guide de Migration des Profils

## Vue d'ensemble

Ce guide explique comment migrer les anciens composants de profil vers le nouveau système universel `UniversalProfile`.

## Architecture du Nouveau Système

### 1. Composant Principal
- **`UniversalProfile`** : Composant générique qui s'adapte selon le `userType`
- **`ProfileConfigs.js`** : Configurations spécifiques par type d'utilisateur
- **`ProfileTabContent.jsx`** : Composants de contenu pour chaque onglet

### 2. Avantages
- ✅ **Design uniforme** pour tous les profils
- ✅ **Code réutilisable** et maintenable
- ✅ **Configuration centralisée** des champs
- ✅ **Gestion d'images unifiée**
- ✅ **Interface cohérente**

## Migration par Type d'Utilisateur

### Producteur
```javascript
// Ancien : ProfileProducer.jsx
// Nouveau : ProfileProducerUniversal.jsx

// Remplacer dans App.jsx
import ProfileProducerUniversal from './pages/dashboard/producer/ProfileProducerUniversal';

// Route
<Route path="/producer/profile" element={<ProfileProducerUniversal />} />
```

### Transformateur
```javascript
// Ancien : ProfileSettings.jsx
// Nouveau : ProfileTransformerUniversal.jsx

// Remplacer dans App.jsx
import ProfileTransformerUniversal from './pages/dashboard/transformer/ProfileTransformerUniversal';

// Route
<Route path="/transformer/profile" element={<ProfileTransformerUniversal />} />
```

### Consommateur
```javascript
// Ancien : ProfileConsumer.jsx
// Nouveau : ProfileConsumerUniversal.jsx

// Remplacer dans App.jsx
import ProfileConsumerUniversal from './pages/dashboard/consumer/ProfileConsumerUniversal';

// Route
<Route path="/consumer/profile" element={<ProfileConsumerUniversal />} />
```

### Restaurateur
```javascript
// Ancien : ProfileRestaurateur.jsx
// Nouveau : ProfileRestaurateurUniversal.jsx

// Remplacer dans App.jsx
import ProfileRestaurateurUniversal from './pages/dashboard/restaurateur/ProfileRestaurateurUniversal';

// Route
<Route path="/restaurateur/profile" element={<ProfileRestaurateurUniversal />} />
```

## Configuration des Champs

### Ajouter un Nouveau Champ
1. **Modifier `ProfileConfigs.js`** :
```javascript
// Dans producerProfileConfig.fields.general
{ name: 'newField', label: 'Nouveau Champ', type: 'text', required: true }
```

2. **Ajouter la logique dans `ProfileTabContent.jsx`** si nécessaire

### Types de Champs Supportés
- `text` : Champ texte simple
- `email` : Champ email
- `tel` : Champ téléphone
- `number` : Champ numérique
- `textarea` : Zone de texte
- `select` : Liste déroulante
- `multiselect` : Sélection multiple
- `checkbox` : Case à cocher
- `date` : Champ date

## Gestion des Images

### Images Supportées
- **Avatar** : Photo de profil (utilisée comme logo)
- **Bannière** : Image de bannière (shopBanner)

### Configuration
```javascript
// Dans UniversalProfile.jsx
const handleAvatarChange = async (imageUrl) => {
  // Logique d'upload d'avatar
};

const handleBannerChange = async (imageUrl) => {
  // Logique d'upload de bannière
};
```

## Personnalisation par Type d'Utilisateur

### Configuration Spécifique
```javascript
// Dans ProfileConfigs.js
export const producerProfileConfig = {
  userType: 'producer',
  service: 'producerService',
  tabs: [
    { id: 'general', label: 'Général', content: 'generalContent' },
    { id: 'farm', label: 'Exploitation', content: 'farmContent' }
  ],
  fields: {
    general: [/* champs généraux */],
    farm: [/* champs exploitation */]
  }
};
```

### Informations Rapides
```javascript
// Dans UniversalProfile.jsx
const userConfig = {
  producer: {
    quickInfo: [
      { key: 'location', icon: FiMapPin, label: 'Localisation' },
      { key: 'specialty', icon: FiStar, label: 'Spécialité' }
    ]
  }
};
```

## Étapes de Migration

### 1. Tester les Nouveaux Composants
```bash
# Tester chaque profil
npm run dev
# Aller sur /producer/profile, /transformer/profile, etc.
```

### 2. Remplacer les Anciens Composants
```javascript
// Dans App.jsx
// Remplacer les imports
import ProfileProducerUniversal from './pages/dashboard/producer/ProfileProducerUniversal';
import ProfileTransformerUniversal from './pages/dashboard/transformer/ProfileTransformerUniversal';
import ProfileConsumerUniversal from './pages/dashboard/consumer/ProfileConsumerUniversal';
import ProfileRestaurateurUniversal from './pages/dashboard/restaurateur/ProfileRestaurateurUniversal';

// Remplacer les routes
<Route path="/producer/profile" element={<ProfileProducerUniversal />} />
<Route path="/transformer/profile" element={<ProfileTransformerUniversal />} />
<Route path="/consumer/profile" element={<ProfileConsumerUniversal />} />
<Route path="/restaurateur/profile" element={<ProfileRestaurateurUniversal />} />
```

### 3. Supprimer les Anciens Fichiers
```bash
# Supprimer les anciens composants
rm frontend/src/pages/dashboard/producer/ProfileProducer.jsx
rm frontend/src/pages/dashboard/transformer/settings/ProfileSettings.jsx
rm frontend/src/pages/dashboard/consumer/ProfileConsumer.jsx
# Garder ProfileRestaurateur.jsx comme référence
```

### 4. Mettre à Jour les Liens
```javascript
// Dans DashboardSidebarFixed.jsx
// Vérifier que les liens pointent vers les bonnes routes
<Link to="/producer/profile">Profil</Link>
<Link to="/transformer/profile">Profil</Link>
<Link to="/consumer/profile">Profil</Link>
<Link to="/restaurateur/profile">Profil</Link>
```

## Tests et Validation

### Checklist de Migration
- [ ] **Design uniforme** : Tous les profils ont le même design
- [ ] **Fonctionnalités** : Upload d'images, sauvegarde, édition
- [ ] **Champs spécifiques** : Chaque type a ses champs propres
- [ ] **Navigation** : Les onglets fonctionnent correctement
- [ ] **Responsive** : Interface adaptée mobile/desktop
- [ ] **Performance** : Chargement rapide des données

### Tests par Type
- [ ] **Producteur** : Champs exploitation, spécialité
- [ ] **Transformateur** : Champs entreprise, transformation
- [ ] **Consommateur** : Préférences, notifications
- [ ] **Restaurateur** : Restaurant, horaires, services

## Support et Maintenance

### Ajout d'un Nouveau Type d'Utilisateur
1. Créer la configuration dans `ProfileConfigs.js`
2. Créer le composant dans `ProfileTabContent.jsx`
3. Créer le composant universel
4. Ajouter la route dans `App.jsx`

### Modification d'un Champ Existant
1. Modifier `ProfileConfigs.js`
2. Tester la modification
3. Déployer

## Conclusion

Le nouveau système de profils universels offre :
- **Cohérence** : Design uniforme
- **Maintenabilité** : Code centralisé
- **Flexibilité** : Configuration par type
- **Évolutivité** : Facile d'ajouter de nouveaux types

La migration peut être faite progressivement, type par type, pour minimiser les risques.
