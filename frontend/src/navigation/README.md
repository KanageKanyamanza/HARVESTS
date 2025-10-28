# Navigation System

Ce dossier contient la structure de navigation centralisée de l'application Harvests.

## Structure

```text
navigation/
├── routes/                    # Routes organisées par type d'utilisateur
│   ├── admin/                # Routes pour les administrateurs
│   ├── consumer/             # Routes pour les consommateurs
│   ├── producer/             # Routes pour les producteurs
│   ├── transformer/          # Routes pour les transformateurs
│   ├── restaurateur/         # Routes pour les restaurateurs
│   ├── transporter/          # Routes pour les transporteurs
│   ├── exporter/             # Routes pour les exportateurs
│   └── index.js              # Index central des routes
├── NavigationManager.js      # Gestionnaire de navigation
├── AppRoutes.jsx             # Composant principal des routes
└── index.js                  # Index principal
```

## Utilisation

### 1. Routes par type d'utilisateur

Chaque type d'utilisateur a son propre fichier de routes dans `routes/[userType]/[userType]Routes.js`.

Exemple pour les producteurs :

```javascript
export const producerRoutes = [
  {
    path: '/producer/dashboard',
    element: <ProducerDashboard />,
    title: 'Tableau de bord'
  },
  // ... autres routes
];
```

### 2. Navigation Manager

Le `NavigationManager` fournit des fonctions pour générer la navigation selon le type d'utilisateur :

```javascript
import { generateUserNavigation, generateSidebarNavigation } from '../navigation';

// Navigation pour la navbar
const userNavigation = generateUserNavigation(user, icons);

// Navigation pour la sidebar
const sidebarNavigation = generateSidebarNavigation(user, icons);
```

### 3. AppRoutes

Le composant `AppRoutes` gère toutes les routes de l'application de manière centralisée :

```javascript
import AppRoutes from './navigation/AppRoutes';

// Dans App.jsx
<AppRoutes />
```

## Avantages

1. **Organisation** : Routes organisées par type d'utilisateur
2. **Maintenabilité** : Code centralisé et réutilisable
3. **Cohérence** : Navigation uniforme dans toute l'application
4. **Évolutivité** : Facile d'ajouter de nouveaux types d'utilisateurs
5. **Type Safety** : Structure claire et prévisible

## Ajout d'un nouveau type d'utilisateur

1. Créer un dossier dans `routes/[nouveauType]/`
2. Créer le fichier `[nouveauType]Routes.js`
3. Ajouter les routes dans `routes/index.js`
4. Mettre à jour `NavigationManager.js` si nécessaire
5. Ajouter les routes dans `AppRoutes.jsx`

## Migration

Pour migrer l'ancien système vers le nouveau :

1. Remplacer les imports dans les composants
2. Utiliser les nouvelles fonctions de navigation
3. Mettre à jour `App.jsx` pour utiliser `AppRoutes`
4. Tester toutes les routes

## Exemples

### Utilisation dans un composant

```javascript
import { generateUserNavigation } from '../navigation';

const MyComponent = () => {
  const { user } = useAuth();
  const navigation = generateUserNavigation(user);
  
  return (
    <nav>
      {navigation.map(item => (
        <Link key={item.href} to={item.href}>
          {item.name}
        </Link>
      ))}
    </nav>
  );
};
```

### Ajout d'une nouvelle route

```javascript
// Dans routes/producer/producerRoutes.js
export const producerRoutes = [
  // ... routes existantes
  {
    path: '/producer/new-feature',
    element: <NewFeature />,
    title: 'Nouvelle fonctionnalité'
  }
];
```
