# Documentation du Chatbot Harvests

Ce document explique le fonctionnement technique du chatbot de l'application Harvests, couvrant à la fois la partie Frontend (React) et Backend (Node.js/Express).

## 1. Vue d'ensemble

Le chatbot est conçu comme un assistant intelligent hybride qui combine :
1. **Réponses statiques/locales** (FAQ, questions fréquentes) pour une réponse immédiate.
2. **Traitement du langage naturel (NLP) léger** côté client pour la détection d'intention.
3. **Recherche dynamique côté serveur** pour les produits, vendeurs et transporteurs.
4. **Actions contextuelles** (suivi de commande, état du panier) nécessitant une authentification.

---

## 2. Frontend (React)

La logique du chatbot est située principalement dans `frontend/src/components/chat/`.

### Composants Principaux

- **`ChatBot.jsx`** : Composant racine qui orchestre toute la logique.
  - Gère l'état d'ouverture/fermeture.
  - Initialise le hook `useChatBot`.
  - Coordonne l'envoi de messages et l'affichage des réponses.
- **`ChatBotUI.jsx`** : Contient les sous-composants d'interface (Bulle, En-tête, Liste des messages, Résultats de recherche).
- **`ChatInput.jsx`** : Zone de saisie du message.

### Gestion d'État (`useChatBot`)

Le hook personnalisé `useChatBot` (situé dans `src/hooks/useChatBot.js`) centralise l'état :
- Historique des messages.
- État de frappe (`isTyping`).
- Liens rapides (`quickLinks`) et suggestions.
- Contextes temporaires (collecte d'infos invité).

### Flux de Traitement d'un Message

Lorsqu'un utilisateur envoie un message (`handleSendMessage` dans `ChatBot.jsx`) :

1. **Capture et Affichage** : Le message utilisateur est ajouté à la liste.
2. **Analyse Locale** :
   - `understandQuestion(message)` analyse le texte pour détecter le type de question (ex: "livraison", "paiement").
   - `findCustomAnswer` vérifie s'il existe une réponse administrative personnalisée.
   - `findBestAnswer` cherche une correspondance dans la base de connaissance statique (FAQ).
3. **Traitement par Intention** :
   - Si une intention est détectée (ex: `TRACK_ORDER`, `MY_CART`), `handleIntent` est appelé.
   - Cette fonction interroge l'API si nécessaire (ex: récupérer les commandes).
4. **Recherche (Fallback)** :
   - Si aucune FAQ ni intention n'est trouvée, `tryProductSearch` est déclenché.
   - Cette fonction extrait les mots-clés et appelle l'API de recherche.
5. **Réponse** : Le bot affiche la réponse (texte, carte produit, ou liens d'action).
6. **Logging** : L'interaction est envoyée au backend pour les statistiques (`logInteraction`).

### Services (`chatService.js`)

Ce service fait le pont avec l'API backend :
- `searchProducts(query)`
- `searchSellers(query)`
- `getRecentOrders()`
- etc.

---

## 3. Backend (Node.js/Express)

Le backend expose des routes API dédiées pour le chatbot via `backend/routes/chatRoutes.js`.

### Architecture

- **Routes** : `/api/v1/chat/*`
- **Contrôleurs** : Situés dans `backend/controllers/chat/`.

### Logique de Recherche (`chatSearchController.js`)

Le contrôleur de recherche est le "cerveau" dynamique du bot.

#### 1. Recherche de Produits (`/search-products`)
- **Extraction de Localisation** : Utilise `buildSearchWithLocation` pour détecter si l'utilisateur cherche dans une ville spécifique (ex: "Tomates à **Dakar**").
- **Recherche Textuelle** : Cherche dans le nom (FR/EN), description, tags, et catégories.
- **Populate** : Récupère les infos du producteur/transformateur associé.

#### 2. Recherche de Vendeurs (`/search-sellers`)
- Cherche parmi les utilisateurs de type `producer`, `transformer`, `restaurateur`.
- Filtre par nom, ferme, entreprise et localisation.

#### 3. Recherche de Transporteurs (`/search-transporters`)
- Cherche les utilisateurs `transporter` et `exporter`.
- Recherche spécifique dans les `serviceAreas` (zones de couverture) du transporteur.

### Logique d'Administration (`chatAdminController.js`)

- Permet aux admins de voir les **statistiques** (questions les plus fréquentes, temps de réponse).
- Liste les **questions sans réponse** pour que l'admin puisse créer de nouvelles réponses personnalisées (`custom-answers`).

### Suivi et Apprentissage

Toutes les interactions sont enregistrées via `/log-interaction`. Cela permet :
- D'analyser ce que les utilisateurs demandent.
- De détecter les échecs de réponse ("not understood").
- D'améliorer la FAQ statique et les mots-clés.

---

## 4. Flux de Données Simplifié

1. **User** -> "Je cherche des fraises"
2. **Frontend** -> Analyse FAQ (Pas de correspondance).
3. **Frontend** -> Appel API `GET /api/v1/chat/search-products?query=fraises`
4. **Backend** -> Regex sur MongoDB `Product` collection.
5. **Backend** -> Retourne JSON `[Product A, Product B]`
6. **Frontend** -> Affiche les cartes produits dans le chat.

## 5. Fonctionnalités Clés

- **Mode Invité vs Connecté** : Le bot demande le prénom/email aux invités avant de procéder, mais accède directement aux données (commandes, panier) si l'utilisateur est connecté.
- **Micro-apprentissage** : Si le bot ne comprend pas, il propose des suggestions contextuelles basées sur la navigation récente ou le contenu du panier.
- **Bulle Proactive** : Affiche une bulle d'aide sur la page d'accueil après un certain temps ou selon des règles définies.
