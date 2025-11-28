# Documentation Complète du Chatbot Harvests

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Fonctionnalités principales](#fonctionnalités-principales)
3. [Intents et actions](#intents-et-actions)
4. [FAQ et réponses prédéfinies](#faq-et-réponses-prédéfinies)
5. [Recherche intelligente](#recherche-intelligente)
6. [Gestion des utilisateurs](#gestion-des-utilisateurs)
7. [Interface utilisateur](#interface-utilisateur)
8. [Logging et analytics](#logging-et-analytics)
9. [Architecture technique](#architecture-technique)
10. [Configuration et personnalisation](#configuration-et-personnalisation)

---

## 🎯 Vue d'ensemble

Le chatbot Harvests est un assistant virtuel intelligent intégré à la plateforme e-commerce. Il permet aux utilisateurs d'obtenir des réponses instantanées à leurs questions, de rechercher des produits, de suivre leurs commandes et d'interagir avec la plateforme de manière conversationnelle.

### Caractéristiques principales

- **Interface conversationnelle** : Chat en temps réel avec interface moderne
- **FAQ automatisée** : Réponses prédéfinies sur livraison, paiement, commandes, compte
- **Recherche intelligente** : Recherche de produits, vendeurs et transporteurs
- **Suivi de commandes** : Accès rapide au statut des commandes
- **Gestion du panier** : Consultation et gestion du panier d'achat
- **Personnalisation** : Adaptation selon l'état de connexion de l'utilisateur
- **Logging complet** : Enregistrement de toutes les interactions pour amélioration continue

---

## 🚀 Fonctionnalités principales

### 1. FAQ Automatisée

Le chatbot répond automatiquement aux questions fréquentes organisées en 5 catégories :

- **🚚 Livraison** : Délais, frais, suivi, zones, livreurs
- **💳 Paiement** : Modes de paiement, sécurité, remboursements
- **📦 Commandes** : Annulation, modification, montant minimum
- **👤 Mon compte** : Création, types de comptes, mot de passe
- **🥬 Produits** : Qualité, disponibilité, nouveautés

### 2. Recherche Intelligente

Le chatbot peut rechercher :

- **Produits** : Par nom, description, catégorie
- **Vendeurs** : Producteurs, transformateurs, restaurateurs
- **Transporteurs** : Livreurs disponibles

La recherche utilise des variantes de mots (singulier/pluriel) et détecte automatiquement le type de recherche souhaité.

### 3. Suivi de Commandes

Pour les utilisateurs connectés :
- Consultation du statut de la dernière commande
- Liste des commandes récentes
- Accès direct à la page "Mes commandes"

### 4. Gestion du Panier

- Affichage du contenu du panier
- Total des articles
- Option de vider le panier (avec confirmation)
- Lien direct vers la page panier

### 5. Actions Rapides

Le chatbot propose des actions rapides pour les utilisateurs connectés :
- Voir mes commandes
- Consulter mon panier
- Voir mes favoris
- Voir mes notifications
- Découvrir les nouveautés
- Voir les promotions

### 6. Personnalisation

- **Utilisateurs connectés** : Salutation personnalisée avec prénom
- **Visiteurs** : Collecte optionnelle du prénom et email
- **Historique** : Conservation de la conversation dans la session
- **Catégories contextuelles** : Affichage des catégories selon le contexte

---

## 🎭 Intents et actions

Les "intents" sont des intentions détectées dans les messages de l'utilisateur. Chaque intent déclenche une action spécifique.

### Liste des intents

| Intent | Mots-clés | Action |
|--------|-----------|--------|
| `BOT_CAPABILITIES` | "comment peux tu m'aider", "que peux tu faire", "tes capacités" | Affiche un récapitulatif des capacités du bot |
| `GREETING` | "bonjour", "salut", "hello", "coucou" | Salutation personnalisée |
| `TRACK_ORDER` | "où est ma commande", "suivi commande", "statut commande" | Affiche le statut de la dernière commande |
| `MY_ORDERS` | "mes commandes", "historique commandes" | Liste les commandes récentes |
| `MY_CART` | "mon panier", "panier", "dans mon panier" | Affiche le contenu du panier |
| `CLEAR_CART` | "vider panier", "supprimer panier" | Propose de vider le panier |
| `MY_FAVORITES` | "mes favoris", "favoris", "produits favoris" | Affiche les produits favoris |
| `NOTIFICATIONS` | "notifications", "mes notifications", "alertes" | Affiche le nombre de notifications |
| `PROMOTIONS` | "promotion", "promo", "réduction", "soldes" | Affiche les produits en promotion |
| `NEW_PRODUCTS` | "nouveauté", "nouveau", "quoi de neuf" | Affiche les nouveaux produits |
| `SUGGESTIONS` | "suggestion", "recommandation", "conseiller" | Propose des produits personnalisés |
| `SEARCH_PRODUCT` | "cherche", "recherche", "trouver", "acheter" | Lance une recherche de produits |
| `CONTACT_SUPPORT` | "parler humain", "agent", "support", "contacter" | Affiche les coordonnées du support |

### Exemples d'utilisation

```
Utilisateur : "Où est ma commande ?"
Bot : Affiche le statut de la dernière commande avec numéro, statut et total

Utilisateur : "Comment peux tu m'aider ?"
Bot : Affiche un récapitulatif des capacités (commandes, recherche, panier, FAQ)

Utilisateur : "Je cherche des tomates"
Bot : Lance une recherche de produits et affiche les résultats
```

---

## 📚 FAQ et réponses prédéfinies

### Catégorie : Livraison

#### Délais de livraison
- **Question** : "Quels sont les délais de livraison ?"
- **Réponse** : Détails des délais selon les zones (Dakar : 24-48h, Régions : 2-5 jours)
- **Mots-clés** : délai, temps, jours, quand, arriver, combien de temps

#### Frais de livraison
- **Question** : "Combien coûte la livraison ?"
- **Réponse** : Explication des frais selon localisation et poids, mention de la livraison gratuite à partir de 50 000 FCFA
- **Mots-clés** : frais, coût, prix, tarif, gratuit, combien coûte

#### Suivi de commande
- **Question** : "Comment suivre ma commande ?"
- **Réponse** : Instructions pour suivre une commande via le compte ou directement via le chatbot
- **Mots-clés** : suivre, suivi, où, commande, statut, tracking

#### Livreurs
- **Question** : "Avez-vous des livreurs ?"
- **Réponse** : Information sur le réseau de livreurs partenaires
- **Mots-clés** : livreur, transporteur, livrer, coursier

#### Devenir livreur
- **Question** : "Comment devenir livreur ?"
- **Réponse** : Processus pour créer un compte transporteur
- **Mots-clés** : devenir livreur, travailler, emploi, job, coursier

### Catégorie : Paiement

#### Modes de paiement
- **Question** : "Quels sont les modes de paiement acceptés ?"
- **Réponse** : Liste des modes (Mobile Money, cartes bancaires, paiement à la livraison)
- **Mots-clés** : payer, paiement, mode, moyen, carte, mobile, money, wave, orange

#### Sécurité
- **Question** : "Le paiement est-il sécurisé ?"
- **Réponse** : Explication des mesures de sécurité (SSL, partenaires certifiés)
- **Mots-clés** : sécurisé, sécurité, confiance, fiable, arnaque

#### Remboursement
- **Question** : "Comment obtenir un remboursement ?"
- **Réponse** : Processus de demande de remboursement
- **Mots-clés** : remboursement, rembourser, annuler, retour, argent

### Catégorie : Commandes

#### Annulation
- **Question** : "Comment annuler ma commande ?"
- **Réponse** : Instructions pour annuler une commande
- **Mots-clés** : annuler, annulation, supprimer, commande

#### Modification
- **Question** : "Puis-je modifier ma commande ?"
- **Réponse** : Conditions de modification d'une commande
- **Mots-clés** : modifier, changer, commande, adresse, quantité

#### Montant minimum
- **Question** : "Y a-t-il un montant minimum de commande ?"
- **Réponse** : Information sur l'absence de montant minimum
- **Mots-clés** : minimum, commande, montant

### Catégorie : Compte

#### Création de compte
- **Question** : "Comment créer un compte ?"
- **Réponse** : Étapes pour créer un compte
- **Mots-clés** : créer, compte, inscription, insérer, enregistrer

#### Devenir vendeur
- **Question** : "Comment devenir vendeur ?"
- **Réponse** : Processus pour devenir producteur ou transformateur
- **Mots-clés** : vendre, vendeur, producteur, agriculteur, devenir

#### Mot de passe oublié
- **Question** : "J'ai oublié mon mot de passe"
- **Réponse** : Instructions pour réinitialiser le mot de passe
- **Mots-clés** : mot de passe, oublié, réinitialiser, password, connexion

#### Types de comptes
- **Question** : "Quels sont les types de comptes ?"
- **Réponse** : Liste des types (Consommateur, Producteur, Transformateur, Restaurateur, Transporteur, Exportateur)
- **Mots-clés** : type, types, compte, profil, différence

### Catégorie : Produits

#### Qualité
- **Question** : "Comment garantissez-vous la qualité des produits ?"
- **Réponse** : Explication du processus de validation des vendeurs et contrôle qualité
- **Mots-clés** : qualité, frais, bio, naturel, origine

#### Disponibilité
- **Question** : "Un produit est en rupture de stock, que faire ?"
- **Réponse** : Alternatives en cas de rupture de stock
- **Mots-clés** : disponible, stock, rupture, quand

---

## 🔍 Recherche intelligente

### Détection automatique du type de recherche

Le chatbot détecte automatiquement le type de recherche souhaité :

- **Produits** : Recherche par défaut
- **Vendeurs** : Si le message contient "vendeur", "producteur", "agriculteur", "fermier", "restaurant"
- **Transporteurs** : Si le message contient "livreur", "transporteur", "livraison", "coursier"
- **Catégories** : Si le message contient "catégorie", "categorie", "rayon"

### Variantes de recherche

Le système génère automatiquement des variantes de recherche :
- Singulier/pluriel (ex: "tomate" → "tomates")
- Gestion des mots se terminant par "x" (ex: "prix" → "prix")

### Nettoyage du message

Avant la recherche, le message est nettoyé :
- Suppression des mots vides (vous, je, j'ai, des, du, de la, etc.)
- Suppression de la ponctuation
- Normalisation des espaces

### Exemples de recherche

```
Utilisateur : "Je cherche des tomates"
Bot : Recherche "tomates" → Affiche les produits correspondants

Utilisateur : "Avez-vous des livreurs à Dakar ?"
Bot : Détecte recherche transporteurs → Affiche les transporteurs disponibles

Utilisateur : "Je veux acheter du riz"
Bot : Recherche "riz" → Affiche les produits de riz
```

---

## 👥 Gestion des utilisateurs

### Utilisateurs connectés

Pour les utilisateurs authentifiés :
- Salutation personnalisée avec prénom
- Accès aux commandes personnelles
- Accès au panier
- Accès aux favoris
- Accès aux notifications
- Actions rapides disponibles dès l'ouverture

### Visiteurs (non connectés)

Pour les visiteurs :
- Collecte optionnelle du prénom (première interaction)
- Collecte optionnelle de l'email (après le prénom)
- Possibilité de passer l'étape email en tapant "passer"
- Accès limité aux fonctionnalités (pas de commandes, panier, etc.)
- Redirection vers la page de connexion pour certaines actions

### Collecte d'informations

Le processus de collecte :
1. **Première interaction** : Demande du prénom
2. **Après prénom** : Demande de l'email (optionnel)
3. **Après collecte** : Affichage des catégories et activation des fonctionnalités

Les informations sont stockées dans `sessionStorage` pour la durée de la session.

---

## 🎨 Interface utilisateur

### Composants principaux

#### 1. Bouton du chatbot
- Bouton flottant en bas à droite
- Position dynamique selon la visibilité du bouton "Back To Top"
- Couleur verte (`bg-green-600`) cohérente avec le design

#### 2. Fenêtre de chat
- **Taille** : 384px de largeur, 700px de hauteur max (90vh)
- **Position** : Fixe en bas à droite
- **Responsive** : S'adapte aux petits écrans
- **Minimisation** : Possibilité de minimiser la fenêtre

#### 3. En-tête
- Nom du bot : "Assistant Harvests"
- Avatar du bot
- Boutons : Minimiser, Fermer, Effacer la conversation

#### 4. Zone de messages
- Affichage des messages utilisateur et bot
- Indicateur de frappe ("Le bot écrit...")
- Feedback sur les réponses (👍/👎)
- Scroll automatique vers le dernier message

#### 5. Zone de saisie
- Champ de texte avec placeholder
- Bouton d'envoi
- Désactivation pendant la frappe du bot

#### 6. Composants contextuels

**Catégories** : Affichage des 5 catégories principales avec icônes

**Questions rapides** : Liste de questions cliquables après sélection d'une catégorie

**Résultats de recherche** :
- **Produits** : Cartes avec image, nom, prix, lien vers la page produit
- **Vendeurs** : Cartes avec photo, nom, type, lien vers le profil
- **Transporteurs** : Cartes avec photo, nom, lien vers le profil

**Liens rapides** : Boutons d'action (ex: "Voir mon panier", "Se connecter")

**Actions rapides** : Boutons pour les utilisateurs connectés (Commandes, Panier, Favoris, etc.)

### Comportements UI

#### Scroll locking
Quand le chatbot est ouvert et non minimisé, le scroll de la page est bloqué pour améliorer l'expérience utilisateur.

#### Position dynamique
Le chatbot ajuste sa position verticale selon la visibilité du bouton "Back To Top" :
- `bottom-6` quand BackToTop est caché
- `bottom-[80px]` quand BackToTop est visible

#### Sauvegarde de session
- État du chat sauvegardé dans `sessionStorage`
- Conservation des messages pendant la session
- Réouverture avec l'historique conservé

#### Timeout d'inactivité
Après 5 minutes d'inactivité, la conversation est automatiquement effacée.

---

## 📊 Logging et analytics

### Enregistrement des interactions

Chaque interaction avec le chatbot est enregistrée dans la base de données avec :

- **Question** : Message de l'utilisateur
- **Réponse** : Réponse du bot
- **Type de réponse** : `faq`, `intent`, `product_search`, `no_answer`
- **FAQ correspondante** : ID de la FAQ si applicable
- **Intent correspondant** : Nom de l'intent si applicable
- **Confiance** : Score de correspondance (pour futures améliorations)
- **Session ID** : Identifiant unique de la session
- **User ID** : ID de l'utilisateur (null pour visiteurs)
- **IP** : Adresse IP de l'utilisateur
- **User Agent** : Navigateur et OS

### Questions sans réponse

Quand le bot ne trouve pas de réponse appropriée :
- La question est enregistrée dans la table `UnansweredQuestion`
- Permet aux administrateurs d'ajouter de nouvelles réponses
- Détection des questions similaires pour éviter les doublons

### Feedback utilisateur

Les utilisateurs peuvent donner un feedback sur les réponses :
- 👍 (Positif) : La réponse était utile
- 👎 (Négatif) : La réponse n'était pas utile

Le feedback est enregistré pour améliorer les réponses.

### Modèle de données

#### ChatInteraction
```javascript
{
  userId: ObjectId (optionnel),
  sessionId: String,
  question: String,
  response: String,
  responseType: String, // 'faq', 'intent', 'product_search', 'no_answer'
  matchedFaqId: String (optionnel),
  matchedIntent: String (optionnel),
  confidence: Number (optionnel),
  feedback: Boolean (optionnel), // true = positif, false = négatif
  ip: String,
  userAgent: String,
  createdAt: Date
}
```

#### UnansweredQuestion
```javascript
{
  question: String,
  count: Number, // Nombre de fois que la question a été posée
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🏗️ Architecture technique

### Structure des fichiers

```
frontend/src/
├── components/chat/
│   ├── ChatBot.jsx          # Composant principal
│   ├── ChatBotUI.jsx         # Composants UI (bouton, header, messages, etc.)
│   ├── ChatInput.jsx         # Zone de saisie
│   ├── ChatMessage.jsx       # Affichage d'un message
│   └── chatHelpers.js        # Fonctions utilitaires
├── hooks/
│   └── useChatBot.js         # Hook personnalisé pour la logique du chatbot
├── data/
│   └── faqData.js            # Base de connaissances FAQ
└── services/
    └── chatService.js        # Service API pour le chatbot

backend/
├── controllers/
│   └── chatController.js     # Contrôleurs pour les endpoints chat
├── routes/
│   └── chatRoutes.js         # Routes API
└── models/
    ├── ChatInteraction.js    # Modèle pour les interactions
    └── UnansweredQuestion.js # Modèle pour les questions sans réponse
```

### Flux de données

1. **Utilisateur envoie un message** → `ChatBot.jsx` → `handleSendMessage()`
2. **Recherche de réponse personnalisée** → `findCustomAnswer()`
3. **Si pas trouvé** → `findBestAnswer()` (FAQ ou Intent)
4. **Si FAQ** → Affiche la réponse directement
5. **Si Intent** → `handleIntent()` → Action spécifique
6. **Si rien trouvé** → `tryProductSearch()` → Recherche de produits
7. **Enregistrement** → `logInteraction()` → API → Base de données

### Endpoints API

#### Frontend → Backend

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/chat/search-products` | GET | Recherche de produits |
| `/chat/search-sellers` | GET | Recherche de vendeurs |
| `/chat/search-transporters` | GET | Recherche de transporteurs |
| `/chat/log-interaction` | POST | Enregistrer une interaction |
| `/chat/log-feedback` | POST | Enregistrer un feedback |
| `/chat/custom-answers` | GET | Obtenir les réponses personnalisées |
| `/orders/my-orders` | GET | Commandes récentes de l'utilisateur |
| `/orders/track/:orderNumber` | GET | Statut d'une commande spécifique |

### Hooks personnalisés

#### `useChatBot`
Gère toute la logique d'état du chatbot :
- État d'ouverture/fermeture
- Messages
- Typing indicator
- Catégories, questions rapides, liens
- Résultats de recherche
- Informations invité
- Fonctions utilitaires (addBotMessage, addUserMessage, logInteraction, etc.)

#### `useBackToTopVisible`
Détecte si le bouton "Back To Top" est visible pour ajuster la position du chatbot.

### Services

#### `chatService`
Service centralisé pour tous les appels API liés au chatbot :
- `getRecentOrders()` : Commandes récentes
- `searchProducts()` : Recherche produits
- `searchSellers()` : Recherche vendeurs
- `searchTransporters()` : Recherche transporteurs
- `getOrderStatus()` : Statut d'une commande
- `getPromotions()` : Produits en promotion
- `getNewProducts()` : Nouveaux produits
- `getSuggestions()` : Suggestions personnalisées
- `getNotifications()` : Notifications
- `getCart()` : Contenu du panier
- `clearCart()` : Vider le panier
- `getFavorites()` : Produits favoris
- `sendFeedback()` : Envoyer un feedback
- `logInteraction()` : Enregistrer une interaction
- `getCustomAnswers()` : Réponses personnalisées

---

## ⚙️ Configuration et personnalisation

### Ajouter une nouvelle FAQ

Dans `frontend/src/data/faqData.js` :

```javascript
{
  id: 'nouvelle-faq-id',
  category: 'livraison', // ou 'paiement', 'commande', 'compte', 'produits'
  keywords: ['mot-clé1', 'mot-clé2', 'phrase complète'],
  question: 'Question fréquente ?',
  answer: 'Réponse détaillée avec\n• Points à puces\n• Informations importantes'
}
```

### Ajouter un nouvel Intent

Dans `frontend/src/data/faqData.js` :

```javascript
{
  id: 'nouvel_intent',
  keywords: ['mot-clé1', 'mot-clé2'],
  action: 'NOUVEL_INTENT'
}
```

Puis dans `frontend/src/components/chat/chatHelpers.js`, ajouter le cas dans `handleIntent()` :

```javascript
case 'NOUVEL_INTENT':
  addBotMessage('Réponse pour le nouvel intent');
  // Actions spécifiques
  break;
```

### Personnaliser les messages par défaut

Dans `frontend/src/data/faqData.js` :

```javascript
defaultMessages: {
  welcome: 'Message de bienvenue personnalisé',
  notUnderstood: 'Message quand le bot ne comprend pas',
  // ...
}
```

### Ajouter une réponse personnalisée (Admin)

Les administrateurs peuvent ajouter des réponses personnalisées via l'interface d'administration. Ces réponses sont prioritaires sur les FAQs standard.

### Timeout d'inactivité

Dans `frontend/src/hooks/useChatBot.js` :

```javascript
const INACTIVITY_TIMEOUT = 300000; // 5 minutes en millisecondes
```

### Taille de la fenêtre

Dans `frontend/src/components/chat/ChatBot.jsx` :

```javascript
className={`... w-96 max-w-[calc(100vw-3rem)] ... h-[700px] max-h-[90vh]`}
```

---

## 🔧 Maintenance et amélioration

### Améliorer la précision des réponses

1. **Analyser les questions sans réponse** : Consulter régulièrement `UnansweredQuestion` pour identifier les besoins
2. **Ajuster les mots-clés** : Ajouter des variantes et synonymes dans les FAQs
3. **Affiner les intents** : Ajouter plus de mots-clés pour chaque intent
4. **Analyser les feedbacks** : Utiliser les feedbacks négatifs pour améliorer les réponses

### Performance

- Les recherches sont limitées à 5 résultats par défaut
- Les messages sont sauvegardés dans `sessionStorage` (pas de requête serveur)
- Le logging est asynchrone et n'interrompt pas l'expérience utilisateur

### Sécurité

- Les interactions sont enregistrées avec IP et User Agent
- Les commandes ne sont accessibles qu'aux propriétaires ou admins
- Les recherches respectent les permissions des produits (status: 'approved', isActive: true)

---

## 📝 Notes importantes

### Limitations actuelles

- Le chatbot ne gère pas les conversations multi-tours complexes
- Les réponses sont principalement basées sur des mots-clés (pas de NLP avancé)
- Les recherches de produits sont limitées au nom, description et catégorie

### Améliorations futures possibles

- Intégration d'un système NLP (Natural Language Processing)
- Support multilingue automatique
- Suggestions contextuelles basées sur l'historique
- Intégration avec un système de tickets pour escalader vers le support humain
- Chatbot vocal (voice-to-text)

---

## 📞 Support

Pour toute question technique ou suggestion d'amélioration :
- Email : contact@harvests.site
- Téléphone : +221 77 197 07 13

---

**Dernière mise à jour** : 2024
**Version** : 1.0.0

