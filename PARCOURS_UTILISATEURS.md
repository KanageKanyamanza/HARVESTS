# Parcours Complet des Utilisateurs - Plateforme HARVESTS

Ce document présente le parcours complet de chaque type d'utilisateur sur la plateforme, de la création de compte à toutes les interactions possibles.

---

## 📋 Tableau Récapitulatif des Parcours Utilisateurs

| Type d'Utilisateur | Description | Dashboard | Permissions Principales |
|-------------------|-------------|-----------|------------------------|
| 🛒 **Consommateur** | Achète des produits agricoles frais | `/consumer/dashboard` | Voir produits, Créer commandes, Voir commandes, Créer avis |
| 🌾 **Producteur** | Cultive et vend des produits agricoles | `/producer/dashboard` | Gérer produits, Voir commandes, Gérer inventaire |
| 🏭 **Transformateur** | Transforme les produits agricoles | `/transformer/dashboard` | Gérer transformation, Voir commandes, Gérer inventaire |
| 🍽️ **Restaurateur** | Propriétaire de restaurant (vend plats ET achète produits) | `/restaurateur/dashboard` | Gérer menu, Voir commandes, Gérer inventaire, Créer commandes, Voir produits, Créer avis |
| 🚢 **Exportateur** | Exporte des produits agricoles | `/exporter/dashboard` | Gérer exports, Voir commandes, Gérer logistique |
| 🚛 **Transporteur** | Transporte des produits agricoles | `/transporter/dashboard` | Gérer transport, Voir commandes, Gérer livraisons |

---

## 1. 🛒 CONSOMMATEUR (Consumer)

### Phase 1 : Création de Compte
1. **Inscription** (`/register`)
   - Sélection du type d'utilisateur : Consommateur
   - Renseigner : Prénom, Nom, Email, Téléphone, Mot de passe, Pays
   - Validation du formulaire
   - Envoi d'email de vérification

2. **Vérification Email** (`/email-verification` ou `/verify-email/:token`)
   - Réception de l'email de vérification
   - Clic sur le lien de vérification
   - Confirmation de l'adresse email

3. **Première Connexion** (`/login`)
   - Connexion avec email et mot de passe
   - Redirection vers le dashboard consommateur

### Phase 2 : Configuration du Profil
4. **Complétion du Profil** (`/consumer/profile`)
   - Modification des informations personnelles (prénom, nom, téléphone)
   - Ajout de l'adresse complète (rue, ville, région, pays)
   - Ajout d'une biographie
   - Upload d'une photo de profil (avatar)
   - Vérification du statut de vérification (email, téléphone)

### Phase 3 : Exploration et Navigation
5. **Navigation Publique** (sans authentification requise)
   - Consultation de la page d'accueil (`/`)
   - Parcours des produits disponibles (`/products`)
   - Consultation des détails d'un produit (`/products/:id`)
   - Parcours des catégories (`/categories`)
   - Consultation des producteurs (`/producers`)
   - Consultation du profil d'un producteur (`/producers/:id`)
   - Consultation des transformateurs (`/transformers`)
   - Consultation du profil d'un transformateur (`/transformers/:id`)
   - Consultation des restaurateurs (`/restaurateurs/:id`)
   - Consultation du blog (`/blog`)

### Phase 4 : Interactions d'Achat
6. **Ajout au Panier** (`/cart`)
   - Ajout de produits au panier depuis la page produits
   - Consultation du panier
   - Modification des quantités
   - Suppression d'articles du panier

7. **Passage de Commande** (`/consumer/checkout`)
   - Sélection de l'adresse de livraison
   - Choix de la méthode de paiement
   - Révision de la commande
   - Confirmation et paiement
   - Confirmation de commande (`/consumer/orders/:orderId/confirmation`)

8. **Suivi des Commandes**
   - Consultation de l'historique des commandes (`/consumer/orders`)
   - Consultation des détails d'une commande (`/consumer/orders/:orderId`)
   - Suivi du statut de livraison

### Phase 5 : Interactions Sociales
9. **Gestion des Favoris** (`/consumer/favorites`)
   - Ajout de producteurs en favoris
   - Ajout de produits en favoris
   - Consultation de la liste des favoris
   - Suppression de favoris

10. **Avis et Commentaires** (`/consumer/reviews`)
    - Rédaction d'avis sur les produits achetés
    - Rédaction d'avis sur les producteurs
    - Consultation de ses avis publiés
    - Modification/suppression d'avis

### Phase 6 : Statistiques et Analyse
11. **Statistiques Personnelles** (`/consumer/statistics`)
    - Consultation du montant total dépensé
    - Nombre de commandes passées
    - Nombre d'avis rédigés
    - Note moyenne donnée
    - Vues de profil

### Phase 7 : Paramètres et Configuration
12. **Paramètres du Compte** (`/consumer/settings`)
    - Modification du mot de passe
    - Gestion des préférences (langue, devise)
    - Gestion des notifications
    - Gestion de la confidentialité

13. **Dashboard Consommateur** (`/consumer/dashboard`)
    - Vue d'ensemble des statistiques
    - Commandes récentes
    - Favoris récents
    - Avis récents
    - Actions rapides

---

## 2. 🌾 PRODUCTEUR (Producer)

### Phase 1 : Création de Compte
1. **Inscription** (`/register`)
   - Sélection du type d'utilisateur : Producteur
   - Renseigner : Prénom, Nom, Email, Téléphone, Mot de passe, Pays
   - Validation du formulaire
   - Envoi d'email de vérification

2. **Vérification Email** (`/email-verification` ou `/verify-email/:token`)
   - Réception de l'email de vérification
   - Clic sur le lien de vérification
   - Confirmation de l'adresse email

3. **Première Connexion** (`/login`)
   - Connexion avec email et mot de passe
   - Redirection vers le dashboard producteur

### Phase 2 : Configuration du Profil
4. **Complétion du Profil** (`/producer/profile`)
   - Modification des informations personnelles (prénom, nom, téléphone)
   - Ajout du nom de la ferme (`farmName`)
   - Ajout de l'adresse complète (rue, ville, région, pays)
   - Ajout d'une biographie
   - Upload d'une photo de profil (avatar)
   - Upload d'une bannière de boutique (`shopBanner`)
   - Upload d'un logo de boutique (`shopLogo`)
   - Vérification du statut de vérification (email, téléphone)

### Phase 3 : Gestion des Produits
5. **Ajout de Produits** (`/producer/products/add`)
   - Création d'un nouveau produit
   - Ajout des informations : nom, description, catégorie, prix, quantité
   - Upload d'images du produit
   - Définition de la disponibilité
   - Sauvegarde du produit

6. **Gestion des Produits** (`/producer/products`)
   - Consultation de la liste de tous les produits
   - Modification d'un produit (`/producer/products/edit/:id`)
   - Mise à jour des stocks
   - Modification des prix
   - Activation/désactivation de produits
   - Suppression de produits

### Phase 4 : Gestion des Commandes
7. **Consultation des Commandes** (`/producer/orders`)
   - Vue de toutes les commandes reçues
   - Filtrage par statut (en attente, confirmée, en préparation, expédiée, livrée, annulée)
   - Consultation des détails d'une commande (`/producer/orders/:id`)
   - Confirmation de commande
   - Mise à jour du statut de livraison
   - Gestion des retours/remboursements

### Phase 5 : Statistiques et Analyse
8. **Statistiques de Vente** (`/producer/stats`)
   - Consultation des ventes totales
   - Analyse des produits les plus vendus
   - Revenus générés
   - Nombre de commandes
   - Évolution des ventes
   - Analytics avancées

9. **Avis Reçus** (`/producer/reviews`)
   - Consultation des avis laissés par les clients
   - Note moyenne reçue
   - Réponse aux avis
   - Gestion de la réputation

### Phase 6 : Abonnement et Certifications
10. **Gestion de l'Abonnement** (via dashboard)
    - Consultation du plan d'abonnement actuel
    - Mise à niveau de l'abonnement
    - Gestion des paiements d'abonnement

11. **Certifications** (`/producer/certifications`)
    - Ajout de certifications
    - Gestion des documents de certification
    - Vérification du statut des certifications

### Phase 7 : Paramètres et Configuration
12. **Paramètres du Compte** (`/producer/settings`)
    - Modification du mot de passe
    - Gestion des préférences
    - Gestion des notifications
    - Configuration de la boutique

13. **Dashboard Producteur** (`/producer/dashboard`)
    - Vue d'ensemble des statistiques
    - Produits récents
    - Commandes récentes
    - Actions rapides
    - Statut de l'abonnement

---

## 3. 🏭 TRANSFORMATEUR (Transformer)

### Phase 1 : Création de Compte
1. **Inscription** (`/register`)
   - Sélection du type d'utilisateur : Transformateur
   - Renseigner : Prénom, Nom, Email, Téléphone, Mot de passe, Pays
   - Validation du formulaire
   - Envoi d'email de vérification

2. **Vérification Email** (`/email-verification` ou `/verify-email/:token`)
   - Réception de l'email de vérification
   - Clic sur le lien de vérification
   - Confirmation de l'adresse email

3. **Première Connexion** (`/login`)
   - Connexion avec email et mot de passe
   - Redirection vers le dashboard transformateur

### Phase 2 : Configuration du Profil
4. **Complétion du Profil** (`/transformer/profile`)
   - Modification des informations personnelles (prénom, nom, téléphone)
   - Ajout du nom de l'entreprise (`companyName`)
   - Ajout de l'adresse complète (rue, ville, région, pays)
   - Ajout d'une biographie
   - Upload d'une photo de profil (avatar)
   - Upload d'une bannière de boutique (`shopBanner`)
   - Upload d'un logo de boutique (`shopLogo`)
   - Vérification du statut de vérification (email, téléphone)

### Phase 3 : Gestion des Produits Transformés
5. **Ajout de Produits** (`/transformer/products/add`)
   - Création d'un nouveau produit transformé
   - Ajout des informations : nom, description, catégorie, prix, quantité
   - Upload d'images du produit
   - Définition de la disponibilité
   - Informations sur le processus de transformation
   - Sauvegarde du produit

6. **Gestion des Produits** (`/transformer/products`)
   - Consultation de la liste de tous les produits transformés
   - Modification d'un produit (`/transformer/products/:id/edit`)
   - Mise à jour des stocks
   - Modification des prix
   - Activation/désactivation de produits
   - Suppression de produits

### Phase 4 : Gestion de la Production
7. **Gestion de la Production** (`/transformer/production`)
   - Suivi des lots de transformation
   - Gestion de la capacité de production
   - Planification de la production
   - Contrôle qualité

### Phase 5 : Gestion des Commandes
8. **Consultation des Commandes** (`/transformer/orders`)
   - Vue de toutes les commandes reçues
   - Filtrage par statut
   - Consultation des détails d'une commande (`/transformer/orders/:id`)
   - Confirmation de commande
   - Mise à jour du statut de livraison

### Phase 6 : Statistiques et Analyse
9. **Statistiques** (`/transformer/stats`)
   - Consultation des ventes totales
   - Analyse des produits les plus transformés
   - Revenus générés
   - Nombre de commandes
   - Évolution de la production

10. **Avis Reçus** (`/transformer/reviews`)
    - Consultation des avis laissés par les clients
    - Note moyenne reçue
    - Réponse aux avis

### Phase 7 : Certifications
11. **Certifications** (`/transformer/certifications`)
    - Ajout de certifications de transformation
    - Gestion des documents de certification
    - Vérification du statut des certifications

### Phase 8 : Paramètres et Configuration
12. **Paramètres du Compte** (`/transformer/settings`)
    - Modification du mot de passe
    - Gestion des préférences
    - Gestion des notifications

13. **Dashboard Transformateur** (`/transformer/dashboard`)
    - Vue d'ensemble des statistiques
    - Produits transformés récents
    - Commandes récentes
    - Actions rapides
    - Statut de l'abonnement

---

## 4. 🍽️ RESTAURATEUR (Restaurateur)

### Phase 1 : Création de Compte
1. **Inscription** (`/register`)
   - Sélection du type d'utilisateur : Restaurateur
   - Renseigner : Prénom, Nom, Email, Téléphone, Mot de passe, Pays
   - Validation du formulaire
   - Envoi d'email de vérification

2. **Vérification Email** (`/email-verification` ou `/verify-email/:token`)
   - Réception de l'email de vérification
   - Clic sur le lien de vérification
   - Confirmation de l'adresse email

3. **Première Connexion** (`/login`)
   - Connexion avec email et mot de passe
   - Redirection vers le dashboard restaurateur

### Phase 2 : Configuration du Profil
4. **Complétion du Profil** (`/restaurateur/profile`)
   - Modification des informations personnelles (prénom, nom, téléphone)
   - Ajout du nom du restaurant (`restaurantName`)
   - Sélection des types de cuisine (`cuisineTypes`) : Africaine, Française, Italienne, Asiatique, Américaine, Méditerranéenne, Fusion, Végétarienne, Végane
   - Ajout de l'adresse complète (rue, ville, région, pays)
   - Ajout d'une biographie
   - Upload d'une photo de profil (avatar)
   - Upload d'une bannière de boutique (`shopBanner`)
   - Upload d'un logo de boutique (`shopLogo`)
   - Vérification du statut de vérification (email, téléphone)

### Phase 3 : Gestion du Menu (Vente)
5. **Ajout de Plats** (`/restaurateur/dishes/add`)
   - Création d'un nouveau plat
   - Ajout des informations : nom, description, catégorie, prix, quantité disponible
   - Upload d'images du plat
   - Définition de la disponibilité
   - Informations nutritionnelles (optionnel)
   - Sauvegarde du plat

6. **Gestion des Plats** (`/restaurateur/dishes`)
   - Consultation de la liste de tous les plats
   - Consultation des détails d'un plat (`/restaurateur/dishes/:dishId`)
   - Modification d'un plat
   - Mise à jour des stocks
   - Modification des prix
   - Activation/désactivation de plats
   - Suppression de plats

### Phase 4 : Gestion des Commandes (Vente)
7. **Consultation des Commandes de Vente** (`/restaurateur/orders`)
   - Vue de toutes les commandes reçues pour les plats
   - Filtrage par statut
   - Consultation des détails d'une commande (`/restaurateur/orders/:id`)
   - Confirmation de commande
   - Mise à jour du statut de livraison

### Phase 5 : Achat de Produits (Comme Consommateur)
8. **Navigation et Achat** (routes communes avec consommateur)
   - Consultation des produits disponibles (`/products`)
   - Consultation des producteurs (`/producers`)
   - Ajout de produits au panier (`/restaurateur/cart`)
   - Passage de commande (`/consumer/checkout`)
   - Suivi des commandes d'achat (`/order-history`)
   - Gestion des favoris (`/favorites`)
   - Rédaction d'avis (`/reviews`)

### Phase 6 : Gestion des Fournisseurs
9. **Gestion des Fournisseurs** (`/restaurateur/suppliers`)
   - Consultation de la liste des fournisseurs
   - Ajout de fournisseurs en favoris
   - Suivi des commandes auprès des fournisseurs

### Phase 7 : Statistiques et Analyse
10. **Statistiques** (`/restaurateur/stats`)
    - Consultation des ventes de plats
    - Consultation des achats de produits
    - Revenus générés
    - Nombre de commandes (vente et achat)
    - Évolution des ventes

### Phase 8 : Paramètres et Configuration
11. **Paramètres du Compte** (`/restaurateur/settings`)
    - Modification du mot de passe
    - Gestion des préférences
    - Gestion des notifications

12. **Dashboard Restaurateur** (`/restaurateur/dashboard`)
    - Vue d'ensemble des statistiques
    - Plats récents
    - Commandes récentes (vente)
    - Actions rapides
    - Statut de l'abonnement

---

## 5. 🚢 EXPORTATEUR (Exporter)

### Phase 1 : Création de Compte
1. **Inscription** (`/register`)
   - Sélection du type d'utilisateur : Exportateur
   - Renseigner : Prénom, Nom, Email, Téléphone, Mot de passe, Pays
   - Validation du formulaire
   - Envoi d'email de vérification

2. **Vérification Email** (`/email-verification` ou `/verify-email/:token`)
   - Réception de l'email de vérification
   - Clic sur le lien de vérification
   - Confirmation de l'adresse email

3. **Première Connexion** (`/login`)
   - Connexion avec email et mot de passe
   - Redirection vers le dashboard exportateur

### Phase 2 : Configuration du Profil
4. **Complétion du Profil** (`/exporter/profile`)
   - Modification des informations personnelles (prénom, nom, téléphone)
   - Ajout du nom de l'entreprise (`companyName`)
   - Ajout de l'adresse complète (rue, ville, région, pays)
   - Ajout d'une biographie
   - Upload d'une photo de profil (avatar)
   - Vérification du statut de vérification (email, téléphone)

### Phase 3 : Gestion de la Flotte
5. **Gestion de la Flotte** (`/exporter/fleet`)
   - Consultation de la liste des véhicules de la flotte
   - Ajout d'un véhicule (`/exporter/fleet/add`)
   - Modification d'un véhicule (`/exporter/fleet/edit/:vehicleId`)
   - Gestion des caractéristiques des véhicules
   - Suivi de l'état des véhicules

### Phase 4 : Gestion des Commandes d'Export
6. **Consultation des Commandes** (`/exporter/orders`)
   - Vue de toutes les commandes d'export
   - Filtrage par statut
   - Consultation des détails d'une commande (`/exporter/orders/:id`)
   - Gestion de la logistique d'export
   - Suivi des expéditions

### Phase 5 : Gestion de la Logistique
7. **Gestion Logistique** (via dashboard)
   - Planification des expéditions
   - Gestion des documents d'export
   - Suivi des destinations
   - Gestion des délais

### Phase 6 : Statistiques et Analyse
8. **Statistiques** (`/exporter/statistics`)
   - Consultation des exports totaux
   - Analyse des destinations
   - Revenus générés
   - Nombre de commandes
   - Évolution des exports
   - Analytics avancées (`/exporter/analytics`)

### Phase 7 : Paramètres et Configuration
9. **Paramètres du Compte** (`/exporter/settings`)
   - Modification du mot de passe
   - Gestion des préférences
   - Gestion des notifications

10. **Dashboard Exportateur** (`/exporter/dashboard`)
    - Vue d'ensemble des statistiques
    - Commandes d'export récentes
    - État de la flotte
    - Actions rapides

---

## 6. 🚛 TRANSPORTEUR (Transporter)

### Phase 1 : Création de Compte
1. **Inscription** (`/register`)
   - Sélection du type d'utilisateur : Transporteur
   - Renseigner : Prénom, Nom, Email, Téléphone, Mot de passe, Pays
   - Validation du formulaire
   - Envoi d'email de vérification

2. **Vérification Email** (`/email-verification` ou `/verify-email/:token`)
   - Réception de l'email de vérification
   - Clic sur le lien de vérification
   - Confirmation de l'adresse email

3. **Première Connexion** (`/login`)
   - Connexion avec email et mot de passe
   - Redirection vers le dashboard transporteur

### Phase 2 : Configuration du Profil
4. **Complétion du Profil** (`/transporter/profile`)
   - Modification des informations personnelles (prénom, nom, téléphone)
   - Ajout du nom de l'entreprise (`companyName`)
   - Ajout de l'adresse complète (rue, ville, région, pays)
   - Ajout d'une biographie
   - **Configuration des zones de service** (`serviceAreas`) :
     - Ajout de régions
     - Ajout de villes par région
     - Définition du rayon de livraison (en km)
   - Upload d'une photo de profil (avatar)
   - Vérification du statut de vérification (email, téléphone)

### Phase 3 : Gestion de la Flotte
5. **Gestion de la Flotte** (`/transporter/fleet`)
   - Consultation de la liste des véhicules
   - Ajout d'un véhicule (`/transporter/fleet/add`)
   - Modification d'un véhicule (`/transporter/fleet/edit/:vehicleId`)
   - Gestion des caractéristiques des véhicules
   - Suivi de l'état des véhicules
   - Suivi GPS des véhicules

### Phase 4 : Gestion des Livraisons
6. **Consultation des Livraisons** (`/transporter/orders`)
   - Vue de toutes les livraisons locales
   - Filtrage par statut
   - Consultation des détails d'une livraison (`/transporter/orders/:id`)
   - Acceptation de livraisons
   - Mise à jour du statut de livraison
   - Optimisation des routes (`/transporter/zones`)

### Phase 5 : Gestion des Zones de Service
7. **Configuration des Zones** (`/transporter/zones`)
   - Gestion des zones de livraison
   - Configuration des régions couvertes
   - Configuration des villes par région
   - Définition des rayons de livraison

### Phase 6 : Suivi et Traçabilité
8. **Suivi des Livraisons** (`/transporter/deliveries`)
   - Suivi en temps réel des livraisons
   - Mise à jour de la position GPS
   - Notification aux clients
   - Gestion des retards

### Phase 7 : Statistiques et Analyse
9. **Statistiques** (`/transporter/statistics`)
   - Consultation des livraisons totales
   - Analyse des zones les plus actives
   - Revenus générés
   - Nombre de livraisons
   - Temps moyen de livraison
   - Évolution des performances

### Phase 8 : Paramètres et Configuration
10. **Paramètres du Compte** (`/transporter/settings`)
    - Modification du mot de passe
    - Gestion des préférences
    - Gestion des notifications

11. **Dashboard Transporteur** (`/transporter/dashboard`)
    - Vue d'ensemble des statistiques
    - Livraisons en cours
    - État de la flotte
    - Actions rapides
    - Statut de l'abonnement

---

## 🔄 Interactions Transversales (Tous les Utilisateurs)

### Interactions Communes
1. **Pages Publiques Accessibles à Tous**
   - Page d'accueil (`/`)
   - Liste des produits (`/products`)
   - Détails d'un produit (`/products/:id`)
   - Catégories (`/categories`)
   - Liste des producteurs (`/producers`)
   - Profil public d'un producteur (`/producers/:id`)
   - Liste des transformateurs (`/transformers`)
   - Profil public d'un transformateur (`/transformers/:id`)
   - Profil public d'un restaurateur (`/restaurateurs/:id`)
   - Profil public d'un transporteur (`/transporters/:id`)
   - Profil public d'un exportateur (`/exporters/:id`)
   - Blog (`/blog`)
   - Contact (`/contact`)
   - Tarification (`/pricing`)
   - Programme de fidélité (`/loyalty`)

2. **Gestion du Profil** (Tous les utilisateurs)
   - Modification des informations personnelles
   - Upload d'images (avatar, bannière, logo)
   - Vérification du statut de vérification
   - Consultation des statistiques de profil

3. **Paramètres** (Tous les utilisateurs)
   - Modification du mot de passe
   - Gestion des préférences (langue, devise)
   - Gestion des notifications
   - Gestion de la confidentialité

4. **Authentification**
   - Connexion (`/login`)
   - Inscription (`/register`)
   - Mot de passe oublié (`/forgot-password`)
   - Réinitialisation du mot de passe (`/reset-password/:token`)
   - Vérification d'email (`/email-verification`)

5. **Paiements**
   - Paiement PayPal (succès : `/payments/paypal/success`, annulation : `/payments/paypal/cancel`)
   - Paiement d'abonnement (`/payment/subscription/:planId`)

---

## 📊 Résumé des Fonctionnalités par Type d'Utilisateur

| Fonctionnalité | Consommateur | Producteur | Transformateur | Restaurateur | Exportateur | Transporteur |
|----------------|--------------|------------|----------------|--------------|-------------|--------------|
| **Création de compte** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Gestion du profil** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Achat de produits** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Vente de produits** | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Vente de plats** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Gestion d'inventaire** | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Gestion de commandes (vente)** | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Gestion de commandes (achat)** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Gestion de livraisons** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Gestion de flotte** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Gestion de zones de service** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Avis et commentaires** | ✅ | ✅ (reçus) | ✅ (reçus) | ✅ | ❌ | ❌ |
| **Favoris** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Statistiques** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Certifications** | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Abonnement** | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |

---

## 🎯 Points Clés du Parcours Utilisateur

1. **Tous les utilisateurs** commencent par la création de compte et la vérification d'email
2. **Tous les utilisateurs** doivent compléter leur profil après l'inscription
3. **Les vendeurs** (Producteur, Transformateur, Restaurateur) gèrent leurs produits/plats et leurs commandes de vente
4. **Les acheteurs** (Consommateur, Restaurateur) peuvent acheter des produits et gérer leurs commandes d'achat
5. **Les transporteurs** gèrent les livraisons et leurs zones de service
6. **Les exportateurs** gèrent les exports et leur flotte
7. **Tous les utilisateurs** ont accès à leurs statistiques et paramètres

---

*Document généré le : $(date)*
*Version : 1.0*

