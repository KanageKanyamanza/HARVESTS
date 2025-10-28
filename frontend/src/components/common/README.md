# Composants Communs

Ce dossier contient les composants réutilisables centralisés pour éviter la duplication de code dans l'application.

## Structure

### Services

- **`commonService.js`** - Service centralisé pour les informations communes à tous les utilisateurs
  - Informations financières (compte bancaire, méthodes de paiement)
  - Statistiques communes (ratings, ventes, revenus)
  - Préférences de notification
  - Informations de vérification
  - Adresses de livraison (pour consommateurs)

### Composants UI

- **`CommonStats.jsx`** - Composant pour afficher les statistiques communes
  - Adapté selon le type d'utilisateur (producer, consumer, transformer, etc.)
  - Affiche les statistiques pertinentes pour chaque profil
  - Gestion du loading et des états vides

- **`FinancialInfo.jsx`** - Composant pour gérer les informations financières
  - Édition des informations bancaires
  - Gestion des méthodes de paiement
  - Vérification du statut des comptes
  - Interface d'édition en ligne

- **`NotificationSettings.jsx`** - Composant pour les préférences de notification
  - Configuration des notifications par email, SMS, push
  - Préférences marketing et alertes de prix
  - Interface utilisateur intuitive avec toggles

## Utilisation

### Dans les dashboards

```jsx
import CommonStats from '../../../components/common/CommonStats';
import FinancialInfo from '../../../components/common/FinancialInfo';
import NotificationSettings from '../../../components/common/NotificationSettings';

// Dans le composant
<CommonStats 
  stats={commonStats}
  userType="producer"
  loading={loading}
/>

<FinancialInfo 
  bankAccount={bankAccount}
  paymentMethods={paymentMethods}
  onUpdate={handleUpdate}
/>
```

### Service commun

```jsx
import { commonService } from '../../services';

// Charger les statistiques communes
const response = await commonService.getCommonStats();

// Mettre à jour les préférences de notification
await commonService.updateNotificationPreferences(notifications);
```

## Avantages

1. **Réduction de la duplication** - Un seul composant pour les statistiques communes
2. **Cohérence** - Même interface utilisateur partout
3. **Maintenance simplifiée** - Modifications centralisées
4. **Performance** - Chargement optimisé des données communes
5. **Évolutivité** - Facile d'ajouter de nouvelles fonctionnalités communes

## Types d'utilisateurs supportés

- **Consumer** - Commandes, dépenses, panier
- **Producer** - Produits vendus, revenus, notes
- **Transformer** - Produits transformés, revenus, ponctualité
- **Restaurateur** - Commandes, dépenses, fournisseurs
- **Exporter** - Exports, valeur, marchés
- **Transporter** - Livraisons, ponctualité, efficacité
