# 🌾 Harvests - Profils et Fonctionnalités

Cette documentation détaille chaque profil utilisateur et chaque fonctionnalité de la plateforme **Harvests**, l'Amazon des produits agricoles africains.

---

## 👥 Profils Utilisateurs

Harvests utilise un système de profils basé sur le modèle `User` avec le pattern Discriminator de Mongoose. Il existe 7 profils distincts, chacun ayant des rôles, des données spécifiques et des flux de travail uniques.

### 🌾 1. Producteur (Producer)

**Cible :** Agriculteurs, fermiers et coopératives agricoles.

* **Données Spécifiques :**
  * Nom de la ferme (`farmName`)
  * Taille de l'exploitation (`farmSize`) en hectares/acres/m²
  * Type d'agriculture (`farmingType` : bio, conventionnelle, mixte)
  * Cultures (`crops`) : Liste des produits cultivés avec saisons de plantation et récolte
  * Certifications (`certifications`) : Certificats agricoles
* **Fonctionnalités Clés :**
  * **Boutique Dédiée :** Mise en vente de produits frais (fruits, légumes, céréales, etc.)
  * **Gestion des Stocks :** Suivi des quantités disponibles et alertes de stock bas
  * **Dashboard Vendeur :** Statistiques de ventes, revenus et commandes
  * **Logistique :** Définition des zones de livraison et frais
* **Workflow :**
    1. Inscription et soumission des documents (KYC).
    2. Configuration du profil de la ferme.
    3. Ajout des produits au catalogue.
    4. Réception et traitement des commandes.

### 🏭 2. Transformateur (Transformer)

**Cible :** Unités agro-industrielles, PME de transformation alimentaire.

* **Données Spécifiques :**
  * Nom de l'entreprise (`companyName`)
  * Type de transformation (`transformationType` : meunerie, emballage, conservation, traitement, etc.)
  * Installations (`facilities`) : Liste des unités de production et capacités
  * Certifications (`certifications`) : Normes de qualité et sécurité alimentaire
* **Fonctionnalités Clés :**
  * **Sourcing :** Achat de matières premières directement aux producteurs
  * **Vente :** Mise en marché de produits finis (huiles, confitures, farines)
  * **Traçabilité :** Lien entre la matière première et le produit fini
* **Workflow :**
    1. Achat de matières premières sur la plateforme.
    2. Transformation des produits.
    3. Mise en vente des produits transformés aux consommateurs ou restaurateurs.

### 🛒 3. Consommateur (Consumer)

**Cible :** Particuliers cherchant des produits frais et locaux.

* **Données Spécifiques :**
  * Préférences alimentaires (`dietaryRestrictions`, `allergies`, `favoriteCategories`)
  * Préférences de notification (`email`, `sms`, `push`)
* **Fonctionnalités Clés :**
  * **Recherche & Filtres :** Recherche avancée (Géo-Search) par pays, catégorie, prix et note
  * **Panier Multi-Vendeurs :** Achat groupé auprès de plusieurs vendeurs
  * **Programme de Fidélité :** Accumulation de points
  * **Avis & Notes :** Évaluation des produits et vendeurs
* **Workflow :**
    1. Recherche de produits.
    2. Ajout au panier et paiement.
    3. Suivi de livraison.
    4. Réception et évaluation.

### 🍽️ 4. Restaurateur (Restaurateur)

**Cible :** Restaurants, hôtels, cantines.

* **Données Spécifiques :**
  * Nom du restaurant (`restaurantName`)
  * Type de cuisine (`cuisineType`)
  * Capacité d'accueil (`capacity`)
  * Horaires d'ouverture (`operatingHours`)
  * Plats du menu (`dishes`) avec ingrédients et allergènes
* **Fonctionnalités Clés :**
  * **Achats B2B :** Commandes en gros à tarifs préférentiels
  * **Marketing :** Valorisation des plats utilisant des ingrédients "du champ à l'assiette"
  * **Abonnements :** Commandes récurrentes de produits de base
* **Workflow :**
    1. Sourcing d'ingrédients frais auprès des producteurs.
    2. Gestion du menu du restaurant sur la plateforme.

### 🚛 5. Transporteur (Transporter)

**Cible :** Entreprises de logistique, chauffeurs indépendants.

* **Données Spécifiques :**
  * Nom de l'entreprise (`companyName`)
  * Flotte de véhicules (`vehicles`) avec type et capacité
  * Zones de service (`serviceAreas`)
  * Options de livraison (`deliveryOptions`) avec tarifs et délais
* **Fonctionnalités Clés :**
  * **Bourse de Fret :** Réception de demandes de transport
  * **Suivi Logistique :** Gestion des étapes de livraison
* **Workflow :**
    1. Récupération des colis chez les producteurs.
    2. Livraison aux acheteurs.

### 🚢 6. Exportateur (Exporter)

**Cible :** Entreprises d'import-export.

* **Données Spécifiques :**
  * Nom de l'entreprise (`companyName`)
  * Licences d'exportation (`exportLicenses`)
  * Marchés cibles (`targetMarkets`)
* **Fonctionnalités Clés :**
  * **Sourcing Export :** Recherche de produits aux normes internationales
  * **Gestion Documentaire :** Centralisation des certificats phytosanitaires et douaniers

### 🛡️ 7. Administrateur (Admin)

**Cible :** Équipe de gestion Harvests.

* **Données Spécifiques :** Accès complet à toutes les collections.
* **Fonctionnalités Clés :**
  * **Modération :** Validation des comptes (KYC), des produits et des avis
  * **Gestion du Contenu :** Blog, FAQ, Chatbot
  * **Analytics :** Rapports de ventes, croissance et tendances
  * **Support :** Gestion des tickets et des questions non résolues
  * **Configuration :** Gestion des devises, langues et frais

---

## 🚀 Fonctionnalités Globales

### 🛒 1. Système E-commerce

* **Catalogue de Produits :** Gestion complète des produits avec variantes (poids, prix, stock), catégories et tags.
* **Moteur de Recherche Hybride :** Recherche textuelle avec détection géographique. Filtre les produits en fonction de l'adresse réelle des vendeurs.
* **Gestion des Commandes :** Cycle de vie complet de la commande (en attente, confirmée, en cours de préparation, en transit, livrée, annulée).
* **Gestion des Stocks :** Suivi des quantités, alertes de stock bas et gestion des réservations.
* **Système d'Avis :** Évaluations avec étoiles, commentaires et images. Système d'achat vérifié.

### 💳 2. Système de Paiement Dual

* **Paiements Internationaux :** Intégration **Stripe** et **PayPal** pour les cartes bancaires et comptes internationaux.
* **Paiements Locaux :** Intégration **Wave Money** (et Orange Money prévu) pour les paiements mobiles populaires en Afrique de l'Ouest (Sénégal).
* **Gestion des Devises :** Détection automatique de la devise en fonction du pays de l'utilisateur (XOF, USD, etc.).

### 💬 3. Messagerie & Chatbot

* **Messagerie Directe :** Système de messagerie en temps réel entre acheteurs et vendeurs (avec Socket.io).
* **Support Chatbot :** Assistant virtuel basé sur le NLP pour répondre aux questions fréquentes et aider à la recherche de produits.
* **Gestion des Questions Non Résolues :** Les questions auxquelles le bot ne sait pas répondre sont enregistrées pour que l'admin puisse enrichir la base de connaissances.

### 🔔 4. Système de Notifications Omnicanal

* **Notifications In-App :** Alertes dans l'interface utilisateur.
* **Notifications Email :** Envoi d'emails automatiques avec des templates soignés (Pug).
* **Web Push Notifications :** Notifications sur le navigateur même quand le site est fermé.

### 📝 5. Blog & Contenu

* **Gestion d'Articles :** Système complet de blog pour le marketing de contenu et l'éducation des utilisateurs.
* **Suivi des Visites :** Analyse du trafic sur le blog avec détection des visiteurs uniques.

### 🎁 6. Programme de Fidélité

* **Points de Fidélité :** Accumulation de points lors des achats et conversion en réductions.

### 🌍 7. Internationalisation (i18n)

* **Multilingue :** Support complet du Français, Anglais, Portugais et Arabe.
* **Détection Automatique :** Adaptation de la langue et de la devise selon la localisation.

---

## 🛠️ Stack Technique Associée

* **Backend :** Node.js, Express, MongoDB (Mongoose)
* **Frontend :** React 19, Vite, Tailwind CSS 3.4
* **Services :** Cloudinary (Images), Nodemailer (Emails), Stripe & Wave (Paiements)

*Pour plus de détails techniques sur les modèles, consultez [MODELS.md](./MODELS.md).*
