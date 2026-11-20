# Audit complet — HARVESTS

**Date :** 20/11/2026  
**Branche :** `Dev` → `a140b6c` (alignée sur `origin/Dev`)  
**Périmètre :** l'intégralité du site — parcours public, compte, acheteur, vendeur, administrateur, paiements, i18n, PWA, qualité technique et sécurité.  
**Méthode :** analyse statique du code (309 fichiers frontend, routes/controllers backend), trois audits indépendants en parallèle, scan déterministe `impeccable detect`, contrôles automatisés (build, lint, tests, recherche de secrets). Aucun serveur, navigateur ou environnement sandbox n'a été lancé.

## État d'exécution du plan d'action (20/11/2026)

| Action | État | Détail |
|---|---|---|
| P0-1 champs de formulaire nommés | ✅ corrigé | `FormField.jsx` : `id`, `aria-label`, `aria-invalid`, `aria-describedby` |
| P0-2 focus clavier visible | ✅ corrigé | `Vendeurs.jsx`, `transporter/Orders.jsx` : `focus-visible:ring-2` |
| P1-1 / P1-2 avis (votes, modif, suppression) | ✅ corrigé | `reviewService.js` aligné sur `/reviews/my/:id` et `/:id/vote` `{voteType}` |
| P1-3 chatbot commandes/panier/favoris/suivi | ✅ corrigé | `chatService.js` aligné sur `/chat/my-orders`, `/chat/track/:n`, `/consumers/me/cart|favorites` |
| P1-4 PWA anonymes | ✅ corrigé | `main.jsx` enregistre `/sw.js` au chargement ; `pushService.js` réutilise la promesse |
| P1-5 suivi de commande | ✅ corrigé | `orderService.js`, `consumerService.js` : suffixe `tracking` ; page de suivi non créée |
| P1-6 mouvement réduit | ✅ corrigé | `index.css` : animations bouclantes désactivées ; carrousel sans autoplay si reduced-motion |
| P1-10 moindre privilège + mot de passe par défaut | ✅ corrigé | `adminRoutes.js` : `restrictTo` sur refund/retry/audit ; `server.js` : mot de passe aléatoire hors prod |
| P2-7 période `1y` | ✅ corrigé | `paymentCostsService.parsePeriodDays` : `1y` = 365 jours + test |
| P2-6 audit logs exploitables | ⏳ restant | Page frontend et `ref` de populate à corriger |
| P2-1/2/3/4/5, P2-8/9/10/11/12/13 | ⏳ restant | Voir §5 |
| P1-7/8/9 palette et overrides | ⏳ restant | Nécessite une validation visuelle avant suppression du bloc « Amazon » |
| P3-4/5/6/7 | ✅ partiel | Dates fr-FR corrigées dans `AdminBlogEdit.jsx` et `AdminNewsletter.jsx` |
| P2-1 état d'erreur catalogue | ✅ corrigé | `Products.jsx` + clés i18n `products.loadError` / `products.retry` (fr + en) |
| P2-10 images différées | ✅ confirmé | `CloudinaryImage.jsx:18` avait déjà `loading="lazy"` par défaut (faux positif de l'audit) ; hero : 1re image `eager`+`fetchPriority=high`, autres `lazy` |

**Contrôles après corrections :** `npm run build` ✓ · `npm run lint` 0 erreur · `npx jest` 33 suites / 641 tests verts.

---

## 1. Score de santé

| # | Dimension | Score | Constat clé |
|---|---|---|---|
| 1 | Accessibilité | **2/4** | Champs de formulaire sans nom associé (`FormField.jsx:27-36`) ; focus clavier retiré sur recherche/filtres (`Vendeurs.jsx:265`, `transporter/Orders.jsx:179`) |
| 2 | Performance | **2/4** | Toutes les pages en lazy loading, mais 70 images dont 1 seule en `loading="lazy"` ; polices chargées 3 fois |
| 3 | Theming | **1/4** | Trois systèmes de couleurs coexistent et s'annulent à coups de `!important` (`tailwind.config.js:14-53` vs `index.css:423-467`) |
| 4 | Responsive | **2/4** | Breakpoints et safe-area corrects, mais `zoom: 0.80` non standard (`index.css:234-242`) et images `w-[400px]` fixes |
| 5 | Intégrité d'implémentation | **2/4** | Socle API/CSRF/i18n solide, mais dette de copier-coller et surcharges globales correctrices |
| | **Total** | **9/20** | **Poor** — révision majeure recommandée |

### Verdict d'intégrité
Le site **n'a pas une identité visuelle unifiée** : la marque verte/jaune cohabite avec une palette « Complete Farmer × Amazon » (vert foncé, orange) ajoutée par-dessus, puis avec des overrides globaux correctifs (`index.css:483-534`). Les composants partagent des structures copiées (44 en-têtes quasi identiques). Ce qui fonctionne le mieux — authentification, i18n, back-office — tient à des mécanismes centralisés, pas à un design system cohérent.

---

## 2. Résumé exécutif

- **Score : 9/20 (Poor).**
- **32 constats : P0 = 2 · P1 = 10 · P2 = 13 · P3 = 7.**
- **Top 5 :**
  1. Formulaires d'authentification inaccessibles aux lecteurs d'écran (P0).
  2. Navigation clavier invisible sur la recherche et les filtres (P0).
  3. Administration sans séparation des privilèges : un compte `support`/`moderator` peut rembourser et lire les audits (P1, à confirmer selon les comptes réels).
  4. Plusieurs parcours casés par le frontend : avis (votes/suppression), chatbot « mes commandes », suivi de commande (P1).
  5. PWA indisponible pour les visiteurs non connectés (P1).
- **Prochaines étapes :** corriger les 2 P0, restreindre les rôles admin, réaligner les contrats frontend/backend, unifier la palette, puis repasser l'audit.

---

## 3. Contrôles automatisés

| Contrôle | Résultat |
|---|---|
| `npm run build` (contrôles i18n + parité + glossaire + Vite) | ✅ réussi (1 min 50 s) |
| `npm run lint` | ✅ 0 erreur · 27 avertissements préexistants (`react-hooks/exhaustive-deps`) |
| `npx jest` (backend) | ✅ **33 suites / 641 tests verts** |
| Parité fr/en | ✅ 14 namespaces, 0 clé manquante |
| Recherche de secrets dans le code | ✅ aucune clé `*_live_*` active ; 1 mot de passe par défaut **hors production** (`server.js:136-146`, `quick-admin-setup.js:102`) — voir P1-10 |
| `impeccable detect` (pages + composants) | ⚠️ 96 signaux : gradient-text 44, palette IA 36, side-tab 9, bounce 4, border-accent 2, police 1 — vérifiés en contexte, faux positifs documentés §7 |
| Audit de sécurité historique (`SECURITY_AUDIT.md`) | 14 constats (2 critiques, 9 hautes, 3 moyennes) tous marqués corrigés au 18/06/2026 — non rejoué ici |

---

## 4. Parcours complet, de A à Z

Légende : ✅ fonctionne · ⚠️ partiel · ❌ cassé · ? non vérifiable sans navigateur/sandbox/données réelles.

### 4.1 Visiteur → découverte

| Étape | État | Sév. | Preuve |
|---|---|---|---|
| Accueil et sections | ✅ | P3 | `Home.jsx:16-33` ; `FeaturedProductsSection.jsx:50-51`, `FlashSalesSection.jsx:45`, `CategoriesSection.jsx:61` |
| Catalogue et recherche | ⚠️ | P2 | `Products.jsx:69-71`, `useProducts.js:66-156` ; erreurs API stockées mais non affichées (`:151-154`) |
| Fiche produit | ⚠️ | P1 | Panier OK `ProductDetail.jsx:71-81` ; votes d'avis cassés (`:162-177`) |
| Vendeurs | ✅ | P3 | `Vendeurs.jsx:69-71,129-134` |
| FAQ / blog / pages légales | ✅ | P3 | `AppRoutes.jsx:414-455`, `blogService.js:9,20` |
| Panier visiteur | ⚠️ | P2 | localStorage `Cart.jsx:3,29` ; sync désactivée `cartService.js:22-25` ; perte à la connexion `useCartSync.js:49-51` |
| Installation PWA / offline | ⚠️ | P1 | `sw.js:77-91` ; enregistré seulement après login (`AuthContext.jsx:83-108`, `pushService.js:37`) |
| Page 404 | ✅ | P3 | `AppRoutes.jsx:694`, `NotFound.jsx:6-70` |

### 4.2 Compte

| Étape | État | Sév. | Preuve |
|---|---|---|---|
| Inscription (6 rôles) | ✅ | P2 | `useRegisterSubmission.js:34-39`, `authRoutes.js:85` ; pays figé `useRegisterForm.js:23` |
| Vérification email | ✅ | P3 | `EmailVerification.jsx:16,57-69` |
| Connexion + refresh | ✅ | P3 | `authService.js:6`, `api.js:205-262` |
| Mot de passe oublié | ✅ | P3 | `ForgotPassword.jsx:60` |
| Profil | ✅ | P3 | `authProfile.js:9-40,134-201` |
| Bascule FR/EN | ✅ | P3 | `LanguageSelector.jsx:38-41`, `i18n.js:204-214` |
| Champs de saisie | ❌ | **P0** | `FormField.jsx:27-36` : `<input>` sans `id`/`label`/`aria-label` |
| Focus clavier | ❌ | **P0** | `Vendeurs.jsx:265`, `transporter/Orders.jsx:179` : `focus:outline-none ring-0` |

### 4.3 Acheteur

| Étape | État | Sév. | Preuve |
|---|---|---|---|
| Commande / payload | ✅ | P3 | `Checkout.jsx:87-129`, `backend/services/orderService.js:50` |
| Checkout 3 étapes | ✅ | P3 | `Checkout.jsx:294-352` |
| Paiement espèces / PayPal | ✅ | P2 | `CheckoutSteps.jsx:195-200`, `OrderConfirmation.jsx:136-206` (ClientID requis) |
| Paiement mobile money | ✅ | P3 | `Checkout.jsx:144-174`, `paymentRoutes.js:83-89` |
| Confirmation / facture | ✅ | P3 | `OrderConfirmation.jsx:43-92`, `orderRoutes.js:91` |
| Suivi de commande | ⚠️ | P1 | Pas de page dédiée ; `/track` (`orderService.js:41`) vs `/tracking` (`orderRoutes.js:61`) |
| Avis : création | ✅ | P3 | `reviewService.js:27`, `reviewUserController.js:13` |
| Avis : modifier/supprimer/voter | ❌ | P1 | `reviewService.js:39,45,50-58` vs `reviewRoutes.js:115,118,121` |
| Fidélité / notifications | ⚠️ | P2 | `notificationService.js:213-220` (WebSocket TODO), `:164-180`, `:53-60` |
| Chatbot « mes commandes / panier / favoris » | ❌ | P1 | `chatService.js:7,57,183,205` vs routes réelles ; `catch` → `[]` silencieux |
| Checkout selon le rôle | ⚠️ | P2 | `AppRoutes.jsx:243-249` redirige 3 rôles alors que `Checkout.jsx:121-129` ne gère que 2 |

### 4.4 Vendeur

| Étape | État | Sév. | Preuve |
|---|---|---|---|
| Tableau de bord | ✅ | P3 | `ProducerDashboardNew.jsx:14`, `producerRoutes.js:178` |
| Ajout produit | ✅ | P2 | `AddProduct.jsx:103`, `producerRoutes.js:237` |
| Gestion commandes / revenus / messages | ✅ | P3 | `Orders.jsx:28`, `Stats.jsx:46-49`, `Messages.jsx:5,25-31` |
| Documents | ⚠️ | P2 | `DocumentsPage.jsx:67-77` passe par `updateProfile` au lieu de `producerRoutes.js:267` |

### 4.5 Administrateur

| Étape | État | Sév. | Preuve |
|---|---|---|---|
| Connexion / dashboard / utilisateurs / produits / commandes / avis / messages / blog / newsletter / abonnements / glossaire | ✅ | — | `authLogin.js:19-29` ; `adminRoutes.js:51-71,103-148,176-219,246-261,268-283,290-302` ; `blogRoutes.js:50-109` |
| Paramètres système | ⚠️ | P2 | `adminSettingsController.js:9,20` (stubs) |
| Audit logs | ❌ | P2 | Endpoint `adminRoutes.js:374` orphelin : aucun menu/service/route frontend |
| Détail/modification paiement | ❌ | P2 | `adminPaymentController.js:144-160` (stubs non utilisés) |
| Rôles et permissions | ⚠️ | **P1** | `adminRoutes.js:28` : `protect` seul, pas de `restrictTo` ; 4 rôles `Admin.js:48-52` |
| Suppression admin proposée à tous | ⚠️ | P3 | `AdminManagement.jsx:156-167` vs `adminManagementRoutes.js:160` (super-admin seulement) |

### 4.6 Paiements / back-office

| Étape | État | Sév. | Preuve |
|---|---|---|---|
| Listes payins / payouts / remboursements | ✅ | — | `AdminPayments.jsx:138-141`, `adminPaymentController.js:24-66` |
| Coûts réels par devise | ✅ | — | `adminRoutes.js:314` avant `:id`, `paymentCostsService.js:270-277` |
| Float par pays | ⚠️ | P3 | `AdminPayments.jsx:90-95,157` : échec → section masquée sans message |
| Relances payin / refund | ✅ | — | `adminRoutes.js:326,329`, `adminPaymentController.js:95-139,166-194` |
| Tableau « Mobile money » | ⚠️ | P2 | `parsePeriodDays` : `1y` = 1 jour (`paymentCostsService.js:54-56`) vs 365 (`adminAnalyticsController.js:130-137`) |
| Page d'attente + suivi `/status` | ✅ | ? | `MobileMoneyPaymentSection.jsx:88-135`, `paymentController.js:345-376` |
| Webhooks payin / payout / refund | ✅ (statique) | P2 | `app.js:97-98` corps brut, signature HMAC, anti-replay, routage `refund-…` ; non rejoué en réel |
| Double chemin coûts | ⚠️ | P2 | `/payments/admin/provider-costs` (`paymentRoutes.js:139`) = 401 avec jeton admin ; `/admin/payments/provider-costs` OK ; commentaire obsolète `AdminPayments.jsx:5` |

### 4.7 Internationalisation

| Point | État | Sév. | Preuve |
|---|---|---|---|
| Parité 14 namespaces fr/en | ✅ | — | `i18n.js:43-58,61-94`, 0 clé manquante |
| Interface admin en français (J69-2) | ✅ | — | conforme (`I18N_DECISIONS.md`) |
| Namespace `b2b` prévu | ⚠️ | P3 | absent de `i18n.js:43-58` (prévu Jour 87+) |
| Dates hétérogènes | ⚠️ | P3 | `AdminBlogEdit.jsx:233`, `AdminNewsletter.jsx:902,1051` sans locale |
| Namespace `dashboard-admin` chargé mais inutilisé | ⚠️ | P3 | `i18n.js:16,31,47,66,82` ; 112 clés orphelines |

---

## 5. Constats détaillés par sévérité

### P0 — Bloquants

| ID | Titre | Catégorie | Localisation | Impact | Recommandation |
|---|---|---|---|---|---|
| P0-1 | Champs d'authentification sans nom accessible | Accessibilité | `FormField.jsx:27-36` | Lecteur d'écran ne peut pas annoncer le champ ; WCAG 4.1.2 | Ajouter `id={name}` + `<label htmlFor>` ou `aria-label` traduit |
| P0-2 | Focus clavier supprimé | Accessibilité | `Vendeurs.jsx:265`, `transporter/Orders.jsx:179` | Navigation clavier invisible sur recherche/filtres ; WCAG 2.4.7 | Retirer `ring-0 focus:ring-0`, utiliser `focus-visible:ring-2 focus-visible:ring-primary-500` |

### P1 — Majeurs

| ID | Titre | Catégorie | Localisation | Impact | Recommandation |
|---|---|---|---|---|---|
| P1-1 | Votes d'avis inopérants | Fonctionnel | `reviewService.js:50-58`, `reviewRoutes.js:121` | Boutons « utile/inutile » sans effet | Aligner sur `POST /reviews/:id/vote` `{voteType}` |
| P1-2 | Modification/suppression d'avis cassée | Fonctionnel | `reviewService.js:39,45`, `reviewRoutes.js:115,118` | 404 silencieux | Utiliser `/reviews/my/:id` |
| P1-3 | Chatbot « commandes/panier/favoris/suivi » mort | Fonctionnel | `chatService.js:7,57,183,205` | Réponses vides, l'utilisateur croit à une absence de données | Brancher sur les routes réelles et afficher une erreur |
| P1-4 | PWA non enregistrée pour les anonymes | Fonctionnel | `pushService.js:37`, `AuthContext.jsx:101` | Pas d'offline ni d'installation pour le visiteur | Enregistrer le SW au montage de `main.jsx`/`App.jsx` |
| P1-5 | Suivi de commande sans page et contrat divergent | Fonctionnel | `orderService.js:41`, `orderRoutes.js:61` | Impossible de suivre une commande depuis l'UI | Harmoniser `tracking` et créer la page |
| P1-6 | `prefers-reduced-motion` trop limité | Accessibilité | `index.css:277-281`, `ChatBotUI.jsx:146-154` | Vertige pour les utilisateurs sensibles | Règle globale + arrêt du `setInterval` du carrousel |
| P1-7 | Trois palettes de couleurs concurrentes | Theming | `tailwind.config.js:14-53`, `index.css:423-467` | Marque illisible, `!important` partout | Supprimer le bloc « Amazon », utiliser les tokens |
| P1-8 | Violet/indigo sur une marque verte | Theming | `StatCards.jsx:7-18`, `AdminAnalytics.jsx:198`, `LoyaltyProgram.jsx:38` | Interfaces génériques, rôle codé par hue exotique | Tokens + icônes pour les rôles |
| P1-9 | Surcharges globales correctrices | Theming | `index.css:483-534` | Toute modification de composant casse le correctif | Corriger à la source, supprimer les overrides d'attribut |
| P1-10 | Moindre privilège absent + mot de passe par défaut hors prod | Sécurité | `adminRoutes.js:28`, `Admin.js:48-52`, `server.js:136-146`, `quick-admin-setup.js:102` | `support`/`moderator` peuvent rembourser et lire les audits ; si `NODE_ENV` n'est pas exactement `production`, un super-admin à mot de passe connu est créé | `restrictTo('super-admin','admin')` sur le routeur + gardes fines ; exiger `ADMIN_PASSWORD` même hors prod |

### P2 — Mineurs

| ID | Titre | Localisation | Impact / correction |
|---|---|---|---|
| P2-1 | Erreurs catalogue masquées | `useProducts.js:151-154`, `Products.jsx:266-289` | Afficher un état d'erreur + « réessayer » |
| P2-2 | Panier visiteur perdu à la connexion | `cartService.js:22-25`, `useCartSync.js:49-51` | Fusionner au lieu de remplacer |
| P2-3 | Notifications incomplètes | `notificationService.js:53-60,164-180,213-220` | Polling/socket réel + état d'erreur |
| P2-4 | Checkout limité à 2 rôles | `AppRoutes.jsx:243-249` | Clarifier qui peut acheter |
| P2-5 | Documents vendeur via le mauvais endpoint | `DocumentsPage.jsx:67-77` | Utiliser `/me/documents` |
| P2-6 | Audit logs inexploitables | `adminRoutes.js:374`, `adminAuditController.js:37`, `AuditLog.js:12` | Page dédiée + corriger le `ref` de populate |
| P2-7 | Période `1y` = 1 jour | `paymentCostsService.js:54-56` | Normaliser à 365 |
| P2-8 | Endpoints `feature_in_development` | `adminPaymentController.js:144-160`, `adminSettingsController.js:9,20` | Retirer ou implémenter |
| P2-9 | Double chemin coûts + commentaire obsolète | `paymentRoutes.js:139`, `AdminPayments.jsx:5` | Déprécier la route utilisateur |
| P2-10 | Images non lazy | `CloudinaryImage.jsx:130`, 70 `<img>` dont 1 lazy | `loading="lazy"` par défaut + dimensions |
| P2-11 | Polices chargées 3 fois | `index.css:1`, `index.html:71-76`, `ResourcePreloader.jsx:11-22` | Garder une seule source |
| P2-12 | Texte 9–12 px et cibles tactiles < 44 px | `MobileBottomNav.jsx:32`, `transporter/AddVehicle.jsx:252` | `text-xs` mini + `min-h-[44px]` |
| P2-13 | `zoom: 0.80` non standard | `index.css:234-242` | Retirer, passer par des tokens d'espacement |

### P3 — Polish

| ID | Titre | Localisation |
|---|---|---|
| P3-1 | Carousel et rebound non respectueux de `reduced-motion` | `ChatBotUI.jsx:146-154`, `NotificationsTab.jsx:185` |
| P3-2 | Dette de debug/code mort | `api.js:36-38,104-108`, `vite.config.js:35-36` |
| P3-3 | Code mort auth / docs Swagger erronées | `authService.js:42,45`, `orderRoutes.js:166-174` |
| P3-4 | Namespace `dashboard-admin` inutilisé | `i18n.js:16,31,47,66,82` |
| P3-5 | Bouton suppression admin visible à tous | `AdminManagement.jsx:156-167` |
| P3-6 | Dates sans locale | `AdminBlogEdit.jsx:233`, `AdminNewsletter.jsx:902,1051` |
| P3-7 | Float masqué silencieusement / namespace `b2b` absent | `AdminPayments.jsx:90-95,157`, `Day.md:83` |

---

## 6. Patterns et problèmes systémiques

1. **Contrats frontend/backend non vérifiés à l'échelle du dépôt** : au moins 5 chemins appelés côté client n'existent pas côté serveur (avis, chatbot, tracking, documents, auth). Aucun test d'intégration ne les couvre.
2. **Correctifs en cascade** : `index.css:483-534` (contraste, taille, rayon) compense 77 composants au lieu de corriger les classes à la source.
3. **Design system triple** : tokens Tailwind vert/jaune, bloc « Amazon » en `!important`, overrides globaux — trois autorités contradictoires.
4. **Permissions déclaratives absentes** : un seul `protect` pour tout le back-office, alors que 4 rôles existent.
5. **États d'erreur presque toujours silencieux** : `catch` → `[]` ou liste vide, sans distinction entre « aucune donnée » et « échec réseau ».
6. **En-têtes copiés** : 44 structures quasi identiques ; la maintenance multiplie les dérives.

---

## 7. Signaux du détecteur : confirmés / faux positifs

| Signal | Comptage | Verdict |
|---|---|---|
| `gradient-text` | 44 | Confirmé, mais surtout décoratif dans des `<h1>` ; invisible en contraste forcé |
| `ai-color-palette` | 36 | Faux positif sur l'intention (roles codés volontairement par couleur), vrai sur la dérive de marque |
| `side-tab` | 9 | Confirmé, mais sémantiquement justifié (style citation) |
| `bounce-easing` | 4 | Confirmé (points de frappe chat) — vrai problème : reduced-motion |
| `border-accent-on-rounded` | 2 | Faux positif (petit tiret de titre) |
| `overused-font` | 1 | Confirmé : Inter/Poppins chargés trois fois |

---

## 8. Points positifs

1. **Code splitting systématique** : toutes les pages en `React.lazy` avec skeletons (`AppRoutes.jsx:23-84`).
2. **Authentification et API robustes** : double soumission CSRF (`api.js:10-22,152-176`), refresh 401 avec file d'attente (`:205-263`).
3. **i18n sérieux** : 14 namespaces FR/EN, synchronisation de `lang`, contrôles de parité intégrés au build.

---

## 9. Limites de cet audit

- **Aucun navigateur** : rendu visuel, responsive réel, focus, lecteur d'écran, toasts et modales non vérifiés. Aucun serveur local n'était actif pendant l'audit.
- **Sandbox AfriBaPay** : seul `/token` est testable avec le script ; payin/payout/refund, rejeu de webhook et statuts ambigus restent à exécuter par une personne.
- **Base de production** : `.env` pointe sur MongoDB Atlas ; aucun chiffre réel, coût capturé, float ni UID n'a été contrôlé.
- **Concurrence** : anti-replay et réservation de remboursement couvertes en unitaire, pas en conditions réseau.
- **Rôles réels** : la répartition effective des comptes `super-admin`/`admin`/`moderator`/`support` est inconnue ; l'impact P1-10 dépend de l'existence de comptes non privilégiés.

---

## 10. Actions recommandées (ordre de priorité)

1. **`/impeccable harden`** — P0/P1 : formulaires accessibles, focus clavier, moindre privilège admin, mot de passe par défaut.
2. **`/impeccable clarify`** — P1/P2 : réaligner les contrats avis/chatbot/tracking/documents et les états d'erreur explicites.
3. **`/impeccable document`** — P1 : figer un design system unique (tokens, rôles, palette) et supprimer la triple autorité couleurs.
4. **`/impeccable adapt`** — P2/P3 : responsive réel, cibles tactiles, suppression de `zoom`, reduced-motion global.
5. **`/impeccable optimize`** — P2 : lazy loading des images, source unique des polices, carrousel.
6. **`/impeccable polish`** — passe finale après corrections.

Ces actions peuvent être exécutées une par une, toutes ensemble, ou dans l'ordre souhaité. Relancer `/impeccable audit` après corrections pour mesurer l'évolution du score.
