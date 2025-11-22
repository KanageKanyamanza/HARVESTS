# 📊 Tableau Complet des Parcours Utilisateurs - HARVESTS

## Vue d'Ensemble des 6 Types d'Utilisateurs

| # | Type | Icône | Description | Dashboard Route |
|---|------|-------|-------------|----------------|
| 1 | **Consommateur** | 🛒 | Achète des produits agricoles frais | `/consumer/dashboard` |
| 2 | **Producteur** | 🌾 | Cultive et vend des produits agricoles | `/producer/dashboard` |
| 3 | **Transformateur** | 🏭 | Transforme les produits agricoles | `/transformer/dashboard` |
| 4 | **Restaurateur** | 🍽️ | Vend des plats ET achète des produits | `/restaurateur/dashboard` |
| 5 | **Exportateur** | 🚢 | Exporte des produits agricoles | `/exporter/dashboard` |
| 6 | **Transporteur** | 🚛 | Transporte des produits agricoles | `/transporter/dashboard` |

---

## 📋 Tableau Détaillé du Parcours Complet par Utilisateur

### 🛒 1. CONSOMMATEUR

| Phase | Étape | Action | Route/Page | Description |
|-------|-------|--------|------------|-------------|
| **1. Création** | 1.1 | Inscription | `/register` | Création du compte (prénom, nom, email, téléphone, mot de passe) |
| | 1.2 | Vérification email | `/email-verification` | Vérification de l'adresse email |
| | 1.3 | Connexion | `/login` | Première connexion au compte |
| **2. Profil** | 2.1 | Complétion profil | `/consumer/profile` | Ajout des informations complémentaires (adresse, bio, avatar) |
| **3. Navigation** | 3.1 | Explorer produits | `/products` | Consultation des produits disponibles |
| | 3.2 | Voir producteurs | `/producers` | Consultation des producteurs |
| | 3.3 | Détails produit | `/products/:id` | Consultation des détails d'un produit |
| | 3.4 | Profil producteur | `/producers/:id` | Consultation du profil d'un producteur |
| **4. Achat** | 4.1 | Ajouter au panier | `/cart` | Ajout de produits au panier |
| | 4.2 | Passer commande | `/consumer/checkout` | Processus de commande et paiement |
| | 4.3 | Confirmation | `/consumer/orders/:orderId/confirmation` | Confirmation de commande |
| **5. Suivi** | 5.1 | Historique commandes | `/consumer/orders` | Consultation de l'historique |
| | 5.2 | Détails commande | `/consumer/orders/:orderId` | Détails d'une commande spécifique |
| **6. Social** | 6.1 | Favoris | `/consumer/favorites` | Gestion des producteurs/produits favoris |
| | 6.2 | Avis | `/consumer/reviews` | Rédaction et gestion des avis |
| **7. Analyse** | 7.1 | Statistiques | `/consumer/statistics` | Consultation des statistiques personnelles |
| **8. Config** | 8.1 | Paramètres | `/consumer/settings` | Configuration du compte |
| | 8.2 | Dashboard | `/consumer/dashboard` | Vue d'ensemble et actions rapides |

---

### 🌾 2. PRODUCTEUR

| Phase | Étape | Action | Route/Page | Description |
|-------|-------|--------|------------|-------------|
| **1. Création** | 1.1 | Inscription | `/register` | Création du compte (prénom, nom, email, téléphone, mot de passe) |
| | 1.2 | Vérification email | `/email-verification` | Vérification de l'adresse email |
| | 1.3 | Connexion | `/login` | Première connexion au compte |
| **2. Profil** | 2.1 | Complétion profil | `/producer/profile` | Ajout nom ferme, adresse, bio, avatar, bannière, logo |
| **3. Produits** | 3.1 | Ajouter produit | `/producer/products/add` | Création d'un nouveau produit |
| | 3.2 | Gérer produits | `/producer/products` | Liste et gestion de tous les produits |
| | 3.3 | Modifier produit | `/producer/products/edit/:id` | Modification d'un produit existant |
| **4. Commandes** | 4.1 | Voir commandes | `/producer/orders` | Consultation des commandes reçues |
| | 4.2 | Détails commande | `/producer/orders/:id` | Détails et gestion d'une commande |
| **5. Analyse** | 5.1 | Statistiques | `/producer/stats` | Analyse des ventes et performances |
| | 5.2 | Avis reçus | `/producer/reviews` | Consultation des avis clients |
| **6. Certifications** | 6.1 | Gérer certifications | `/producer/certifications` | Ajout et gestion des certifications |
| **7. Config** | 7.1 | Paramètres | `/producer/settings` | Configuration du compte |
| | 7.2 | Dashboard | `/producer/dashboard` | Vue d'ensemble et actions rapides |

---

### 🏭 3. TRANSFORMATEUR

| Phase | Étape | Action | Route/Page | Description |
|-------|-------|--------|------------|-------------|
| **1. Création** | 1.1 | Inscription | `/register` | Création du compte (prénom, nom, email, téléphone, mot de passe) |
| | 1.2 | Vérification email | `/email-verification` | Vérification de l'adresse email |
| | 1.3 | Connexion | `/login` | Première connexion au compte |
| **2. Profil** | 2.1 | Complétion profil | `/transformer/profile` | Ajout nom entreprise, adresse, bio, avatar, bannière, logo |
| **3. Produits** | 3.1 | Ajouter produit | `/transformer/products/add` | Création d'un produit transformé |
| | 3.2 | Gérer produits | `/transformer/products` | Liste et gestion des produits transformés |
| | 3.3 | Modifier produit | `/transformer/products/:id/edit` | Modification d'un produit |
| **4. Production** | 4.1 | Gérer production | `/transformer/production` | Suivi des lots et capacité de production |
| **5. Commandes** | 5.1 | Voir commandes | `/transformer/orders` | Consultation des commandes reçues |
| | 5.2 | Détails commande | `/transformer/orders/:id` | Détails et gestion d'une commande |
| **6. Analyse** | 6.1 | Statistiques | `/transformer/stats` | Analyse de la production et ventes |
| | 6.2 | Avis reçus | `/transformer/reviews` | Consultation des avis clients |
| **7. Certifications** | 7.1 | Gérer certifications | `/transformer/certifications` | Ajout et gestion des certifications |
| **8. Config** | 8.1 | Paramètres | `/transformer/settings` | Configuration du compte |
| | 8.2 | Dashboard | `/transformer/dashboard` | Vue d'ensemble et actions rapides |

---

### 🍽️ 4. RESTAURATEUR

| Phase | Étape | Action | Route/Page | Description |
|-------|-------|--------|------------|-------------|
| **1. Création** | 1.1 | Inscription | `/register` | Création du compte (prénom, nom, email, téléphone, mot de passe) |
| | 1.2 | Vérification email | `/email-verification` | Vérification de l'adresse email |
| | 1.3 | Connexion | `/login` | Première connexion au compte |
| **2. Profil** | 2.1 | Complétion profil | `/restaurateur/profile` | Ajout nom restaurant, types cuisine, adresse, bio, images |
| **3. VENTE - Plats** | 3.1 | Ajouter plat | `/restaurateur/dishes/add` | Création d'un nouveau plat |
| | 3.2 | Gérer plats | `/restaurateur/dishes` | Liste et gestion de tous les plats |
| | 3.3 | Détails plat | `/restaurateur/dishes/:dishId` | Détails d'un plat spécifique |
| **4. VENTE - Commandes** | 4.1 | Voir commandes vente | `/restaurateur/orders` | Consultation des commandes de plats reçues |
| | 4.2 | Détails commande vente | `/restaurateur/orders/:id` | Détails d'une commande de vente |
| **5. ACHAT - Produits** | 5.1 | Explorer produits | `/products` | Consultation des produits disponibles |
| | 5.2 | Ajouter au panier | `/restaurateur/cart` | Ajout de produits au panier |
| | 5.3 | Passer commande | `/consumer/checkout` | Processus de commande d'achat |
| | 5.4 | Historique achat | `/order-history` | Consultation des commandes d'achat |
| **6. Fournisseurs** | 6.1 | Gérer fournisseurs | `/restaurateur/suppliers` | Gestion de la liste des fournisseurs |
| **7. Analyse** | 7.1 | Statistiques | `/restaurateur/stats` | Analyse des ventes et achats |
| **8. Config** | 8.1 | Paramètres | `/restaurateur/settings` | Configuration du compte |
| | 8.2 | Dashboard | `/restaurateur/dashboard` | Vue d'ensemble et actions rapides |

---

### 🚢 5. EXPORTATEUR

| Phase | Étape | Action | Route/Page | Description |
|-------|-------|--------|------------|-------------|
| **1. Création** | 1.1 | Inscription | `/register` | Création du compte (prénom, nom, email, téléphone, mot de passe) |
| | 1.2 | Vérification email | `/email-verification` | Vérification de l'adresse email |
| | 1.3 | Connexion | `/login` | Première connexion au compte |
| **2. Profil** | 2.1 | Complétion profil | `/exporter/profile` | Ajout nom entreprise, adresse, bio, avatar |
| **3. Flotte** | 3.1 | Gérer flotte | `/exporter/fleet` | Consultation de la flotte d'export |
| | 3.2 | Ajouter véhicule | `/exporter/fleet/add` | Ajout d'un véhicule à la flotte |
| | 3.3 | Modifier véhicule | `/exporter/fleet/edit/:vehicleId` | Modification d'un véhicule |
| **4. Commandes** | 4.1 | Voir commandes | `/exporter/orders` | Consultation des commandes d'export |
| | 4.2 | Détails commande | `/exporter/orders/:id` | Détails et gestion d'une commande |
| **5. Logistique** | 5.1 | Gérer logistique | Dashboard | Planification expéditions, documents |
| **6. Analyse** | 6.1 | Statistiques | `/exporter/statistics` | Analyse des exports |
| | 6.2 | Analytics | `/exporter/analytics` | Analytics avancées |
| **7. Config** | 7.1 | Paramètres | `/exporter/settings` | Configuration du compte |
| | 7.2 | Dashboard | `/exporter/dashboard` | Vue d'ensemble et actions rapides |

---

### 🚛 6. TRANSPORTEUR

| Phase | Étape | Action | Route/Page | Description |
|-------|-------|--------|------------|-------------|
| **1. Création** | 1.1 | Inscription | `/register` | Création du compte (prénom, nom, email, téléphone, mot de passe) |
| | 1.2 | Vérification email | `/email-verification` | Vérification de l'adresse email |
| | 1.3 | Connexion | `/login` | Première connexion au compte |
| **2. Profil** | 2.1 | Complétion profil | `/transporter/profile` | Ajout nom entreprise, adresse, bio, avatar, **zones de service** |
| **3. Flotte** | 3.1 | Gérer flotte | `/transporter/fleet` | Consultation de la flotte de véhicules |
| | 3.2 | Ajouter véhicule | `/transporter/fleet/add` | Ajout d'un véhicule |
| | 3.3 | Modifier véhicule | `/transporter/fleet/edit/:vehicleId` | Modification d'un véhicule |
| **4. Zones** | 4.1 | Configurer zones | `/transporter/zones` | Configuration des zones de livraison (régions, villes, rayons) |
| **5. Livraisons** | 5.1 | Voir livraisons | `/transporter/orders` | Consultation des livraisons locales |
| | 5.2 | Détails livraison | `/transporter/orders/:id` | Détails et gestion d'une livraison |
| | 5.3 | Suivi livraisons | `/transporter/deliveries` | Suivi en temps réel des livraisons |
| **6. Analyse** | 6.1 | Statistiques | `/transporter/statistics` | Analyse des performances de livraison |
| **7. Config** | 7.1 | Paramètres | `/transporter/settings` | Configuration du compte |
| | 7.2 | Dashboard | `/transporter/dashboard` | Vue d'ensemble et actions rapides |

---

## 🔄 Interactions Transversales (Communes à Tous)

| Catégorie | Action | Route/Page | Accessible à |
|-----------|--------|------------|--------------|
| **Pages Publiques** | Accueil | `/` | Tous (connectés et non-connectés) |
| | Produits | `/products` | Tous |
| | Catégories | `/categories` | Tous |
| | Producteurs | `/producers` | Tous |
| | Transformateurs | `/transformers` | Tous |
| | Blog | `/blog` | Tous |
| | Contact | `/contact` | Tous |
| **Authentification** | Connexion | `/login` | Tous |
| | Inscription | `/register` | Tous |
| | Mot de passe oublié | `/forgot-password` | Tous |
| | Réinitialisation | `/reset-password/:token` | Tous |
| **Profil** | Modifier profil | `/{userType}/profile` | Tous (selon type) |
| **Paramètres** | Paramètres | `/{userType}/settings` | Tous (selon type) |
| **Paiements** | PayPal succès | `/payments/paypal/success` | Tous |
| | PayPal annulation | `/payments/paypal/cancel` | Tous |
| | Abonnement | `/payment/subscription/:planId` | Vendeurs |

---

## 📈 Matrice des Fonctionnalités par Type d'Utilisateur

| Fonctionnalité | 🛒 Consumer | 🌾 Producer | 🏭 Transformer | 🍽️ Restaurateur | 🚢 Exporter | 🚛 Transporter |
|----------------|:-----------:|:----------:|:-------------:|:---------------:|:----------:|:-------------:|
| **Création compte** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Vérification email** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Gestion profil** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Upload images** | ✅ (avatar) | ✅ (avatar, bannière, logo) | ✅ (avatar, bannière, logo) | ✅ (avatar, bannière, logo) | ✅ (avatar) | ✅ (avatar) |
| **Achat produits** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Vente produits** | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Vente plats** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Gestion inventaire** | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Commandes (vente)** | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Commandes (achat)** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Livraisons** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Gestion flotte** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Zones de service** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Favoris** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Avis (donner)** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Avis (recevoir)** | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Statistiques** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Certifications** | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Abonnement** | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Paramètres** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🎯 Points Clés du Parcours

### Parcours Standard (Tous les Utilisateurs)
1. **Inscription** → 2. **Vérification Email** → 3. **Connexion** → 4. **Complétion Profil** → 5. **Utilisation de la Plateforme**

### Parcours Spécifiques

#### 🛒 Consommateur
**Focus** : Achat et découverte
- Parcours : Navigation → Panier → Commande → Suivi → Avis → Favoris

#### 🌾 Producteur
**Focus** : Vente et gestion
- Parcours : Produits → Commandes → Statistiques → Certifications

#### 🏭 Transformateur
**Focus** : Transformation et vente
- Parcours : Produits → Production → Commandes → Statistiques → Certifications

#### 🍽️ Restaurateur
**Focus** : Vente de plats ET achat de produits (double rôle)
- Parcours Vente : Plats → Commandes vente → Statistiques
- Parcours Achat : Produits → Panier → Commandes achat → Favoris

#### 🚢 Exportateur
**Focus** : Export et logistique
- Parcours : Flotte → Commandes export → Logistique → Statistiques

#### 🚛 Transporteur
**Focus** : Livraison et transport
- Parcours : Flotte → Zones → Livraisons → Suivi → Statistiques

---

## 📝 Notes Importantes

1. **Restaurateur** est le seul type d'utilisateur avec un **double rôle** : vendeur (plats) et acheteur (produits)
2. **Transporteur** est le seul à gérer les **zones de service** avec configuration détaillée (régions, villes, rayons)
3. **Producteur et Transformateur** peuvent gérer des **certifications**
4. **Tous les vendeurs** (Producteur, Transformateur, Restaurateur) peuvent avoir un **abonnement**
5. **Tous les utilisateurs** ont accès aux **pages publiques** même sans être connectés
6. Les **statistiques** sont disponibles pour tous les types d'utilisateurs mais avec des métriques différentes

---

*Document créé le : $(date)*
*Version : 1.0*

