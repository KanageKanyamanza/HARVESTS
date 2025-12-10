# 📊 Fichiers Frontend > 500 Lignes

Liste des fichiers frontend qui dépassent 500 lignes et qui pourraient bénéficier d'une refactorisation.

## 📋 Liste des Fichiers

| Lignes | Fichier | Type | Priorité |
|--------|---------|------|----------|
| **730** | `src/pages/dashboard/restaurateur/AddOrder.jsx` | Page | 🔴 Haute |
| **673** | `src/data/faqData.js` | Data | 🟡 Moyenne |
| **655** | `src/pages/dashboard/common/NotificationsPage.jsx` | Page | 🔴 Haute |
| **632** | `src/pages/admin/AdminSubscriptions.jsx` | Page Admin | 🟡 Moyenne |
| **594** | `src/pages/admin/AdminSettings.jsx` | Page Admin | 🟡 Moyenne |
| **589** | `src/pages/auth/Register.jsx` | Page Auth | 🔴 Haute |
| **581** | `src/contexts/CartContext.jsx` | Context | 🟡 Moyenne |
| **577** | `src/pages/Products.jsx` | Page | 🟡 Moyenne |
| **549** | `src/pages/dashboard/producer/EditProduct.jsx` | Page | 🟡 Moyenne |
| **540** | `src/pages/dashboard/exporter/AddVehicle.jsx` | Page | 🟡 Moyenne |
| **539** | `src/pages/dashboard/transformer/products/EditProduct.jsx` | Page | 🟡 Moyenne |
| **515** | `src/pages/dashboard/transporter/AddVehicle.jsx` | Page | 🟡 Moyenne |
| **501** | `src/components/common/UniversalProfile.jsx` | Composant | 🟢 Basse |

**Total : 13 fichiers*

---

## 🔴 Priorité Haute (> 600 lignes)

### 1. AddOrder.jsx (730 lignes)

**Fichier** : `src/pages/dashboard/restaurateur/AddOrder.jsx`

**Problèmes potentiels** :

- Composant très volumineux
- Logique complexe probablement mélangée
- Difficile à maintenir

**Recommandations** :

- Extraire la logique métier dans des hooks personnalisés
- Diviser en sous-composants (OrderForm, OrderItems, OrderSummary)
- Créer des composants réutilisables pour les formulaires

### 2. NotificationsPage.jsx (655 lignes)

**Fichier** : `src/pages/dashboard/common/NotificationsPage.jsx`

**Recommandations** :

- Extraire la logique de filtrage dans un hook `useNotifications`
- Créer des composants séparés : NotificationList, NotificationItem, NotificationFilters
- Utiliser des composants plus petits et réutilisables

### 3. Register.jsx (589 lignes)

**Fichier** : `src/pages/auth/Register.jsx`

**Recommandations** :

- Diviser par type d'utilisateur (RegisterProducer, RegisterConsumer, etc.)
- Extraire les formulaires dans des composants séparés
- Utiliser un système de formulaires multi-étapes

---

## 🟡 Priorité Moyenne (500-600 lignes)

### 4. AdminSubscriptions.jsx (632 lignes)

**Recommandations** :

- Extraire la logique dans des hooks
- Créer des composants pour les différentes sections

### 5. AdminSettings.jsx (594 lignes)

**Recommandations** :

- Diviser en sections (GeneralSettings, EmailSettings, etc.)
- Utiliser des composants de formulaire réutilisables

### 6. CartContext.jsx (581 lignes)

**Recommandations** :

- Séparer la logique métier dans un service
- Créer des hooks spécifiques (useCart, useCartActions)

### 7. Products.jsx (577 lignes)

**Recommandations** :

- Extraire ProductList, ProductFilters, ProductSearch
- Utiliser des composants plus petits

### 8. EditProduct.jsx (549 lignes - Producer)

**Recommandations** :

- Créer des composants réutilisables pour les formulaires de produit
- Extraire la logique d'upload d'images

### 9. AddVehicle.jsx (540 lignes - Exporter)

**Recommandations** :

- Créer un composant VehicleForm réutilisable
- Extraire la validation dans un hook

### 10. EditProduct.jsx (539 lignes - Transformer)

**Recommandations** :

- Même approche que pour Producer
- Créer des composants partagés

### 11. AddVehicle.jsx (515 lignes - Transporter)

**Recommandations** :

- Unifier avec AddVehicle Exporter si possible
- Créer un composant VehicleForm générique

---

## 🟢 Priorité Basse (≈ 500 lignes)

### 12. UniversalProfile.jsx (501 lignes)

**Note** : Ce composant est déjà bien structuré et réutilisable. C'est acceptable pour un composant universel.

---

## 📊 Statistiques

- **Fichiers > 700 lignes** : 1 fichier
- **Fichiers 600-700 lignes** : 2 fichiers
- **Fichiers 500-600 lignes** : 10 fichiers
- **Total fichiers analysés** : 13 fichiers

---

## 🎯 Plan de Refactorisation Recommandé

### Phase 1 : Fichiers Critiques (> 600 lignes)

1. ✅ `AddOrder.jsx` - Diviser en sous-composants
2. ✅ `NotificationsPage.jsx` - Extraire hooks et composants
3. ✅ `Register.jsx` - Créer formulaires par type d'utilisateur

### Phase 2 : Fichiers Importants (500-600 lignes)

4. Extraire la logique métier dans des hooks
5. Créer des composants réutilisables
6. Utiliser des patterns de composition

### Phase 3 : Optimisation

7. Unifier les composants similaires (AddVehicle)
8. Créer une bibliothèque de composants partagés
9. Optimiser les performances

---

## 💡 Bonnes Pratiques

### Pour les Grands Composants

1. **Extraire la Logique**

   ```jsx
   // Avant : Tout dans le composant
   const MyComponent = () => {
     // 500+ lignes de code
   };
   
   // Après : Logique dans un hook
   const useMyComponentLogic = () => {
     // Logique métier
   };
   
   const MyComponent = () => {
     const { data, actions } = useMyComponentLogic();
     return <UI data={data} actions={actions} />;
   };
   ```

2. **Diviser en Sous-composants**

   ```jsx
   // Avant : Un gros composant
   const MyPage = () => {
     // Tout le code
   };
   
   // Après : Composants séparés
   const MyPage = () => (
     <>
       <PageHeader />
       <PageContent />
       <PageFooter />
     </>
   );
   ```

3. **Utiliser des Composants Réutilisables**
   - Créer une bibliothèque de composants communs
   - Réutiliser au maximum
   - Éviter la duplication

---

*Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}*
