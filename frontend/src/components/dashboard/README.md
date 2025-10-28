# Architecture des Dashboards

## Vue d'ensemble

Cette architecture utilise des composants réutilisables pour créer des dashboards cohérents pour tous les types d'utilisateurs (Producteur, Consommateur, Transformateur, Restaurateur, Transporteur, Exportateur).

## Composants principaux

### GenericDashboard
Le composant principal qui gère la logique commune de tous les dashboards :
- Chargement des données
- Gestion des états (loading, erreurs)
- Gestion des notifications
- Layout commun

### Sections réutilisables

#### ProductsSection
Affiche une liste de produits avec :
- Images des produits
- Informations de base (nom, prix)
- Actions (voir, modifier)
- Gestion des états vides

#### OrdersSection
Affiche une liste de commandes avec :
- Statut des commandes avec icônes
- Informations de base (numéro, montant)
- Actions (voir détails)
- Gestion des états vides

#### QuickActionsSection
Affiche des actions rapides personnalisées selon le type d'utilisateur :
- Actions communes (profil, paramètres)
- Actions spécifiques par type d'utilisateur
- Navigation vers les pages importantes

## Services génériques

### genericService.js
Service générique qui crée des services pour chaque type d'utilisateur :
- Méthodes communes (CRUD produits, commandes, profil)
- Méthodes spécifiques selon le type d'utilisateur
- Configuration centralisée des endpoints

## Utilisation

### Créer un nouveau dashboard

```jsx
import GenericDashboard from '../../../components/dashboard/GenericDashboard';
import ProductsSection from '../../../components/dashboard/sections/ProductsSection';
import OrdersSection from '../../../components/dashboard/sections/OrdersSection';
import QuickActionsSection from '../../../components/dashboard/sections/QuickActionsSection';
import { userTypeService } from '../../../services/genericService';
import { commonService } from '../../../services/commonService';

const MyDashboard = () => {
  const sections = [
    {
      title: 'Mes Produits',
      icon: <FiPackage className="h-5 w-5" />,
      action: { text: 'Voir tous', to: '/dashboard/mytype/products' },
      content: <ProductsSection userType="mytype" />
    },
    // ... autres sections
  ];

  return (
    <GenericDashboard
      userType="mytype"
      service={userTypeService}
      commonService={commonService}
      title="Mon Dashboard"
      description="Description du dashboard"
      icon={<FiIcon className="h-8 w-8 text-blue-600" />}
      sections={sections}
    />
  );
};
```

### Configuration des statistiques

```jsx
const statsConfig = (baseStats) => ({
  ...baseStats,
  // Ajouter des statistiques spécifiques
  customStat: 0
});
```

### Configuration des actions rapides

```jsx
const customActions = [
  {
    icon: <FiIcon className="h-5 w-5" />,
    title: 'Action personnalisée',
    description: 'Description de l\'action',
    href: '/dashboard/mytype/action',
    color: 'bg-blue-500 hover:bg-blue-600'
  }
];
```

## Avantages

1. **Réutilisabilité** : Code commun partagé entre tous les dashboards
2. **Cohérence** : Interface utilisateur uniforme
3. **Maintenabilité** : Modifications centralisées
4. **Extensibilité** : Facile d'ajouter de nouveaux types d'utilisateurs
5. **Performance** : Chargement optimisé des données

## Structure des fichiers

```
components/dashboard/
├── GenericDashboard.jsx          # Dashboard principal
├── sections/
│   ├── ProductsSection.jsx       # Section produits
│   ├── OrdersSection.jsx         # Section commandes
│   └── QuickActionsSection.jsx   # Section actions rapides
└── README.md                     # Cette documentation

services/
└── genericService.js             # Services génériques

pages/dashboard/
├── producer/
│   └── ProducerDashboardNew.jsx  # Dashboard producteur
├── consumer/
│   └── ConsumerDashboardNew.jsx  # Dashboard consommateur
└── ...                          # Autres dashboards
```
