--- Plan bascule bilingue FR/EN (fr → fr + en) ---
Détail complet, chiffres d'audit et justifications : docs/Harvests-Bilingue-Roadmap.pdf. Repère jour par jour ci-dessous, à mettre à jour (fait) puis retirer au fur et à mesure comme d'habitude. Numérotation reprise à la suite de Jour 32.

Jour 45 — Traduction du contenu produit/plat (nom, description) — MT auto + migration exécutée (fait)
Option 4 retenue (voir échange du 22/09). Infrastructure backend : `name`/`description`/`shortDescription` sur Product passent de `String` à `Mixed` (accepte `{fr, en}` ou chaîne legacy, validation custom sur `fr`) ; `utils/translateText.js` (MyMemory, découpage en chunks ≤500 caractères pour les textes longs) extrait de blogAdminController.translateText et réutilisé partout. `models/product/productMiddleware.js` : un hook existant **aplatissait systématiquement tout objet {fr,en} en simple chaîne française** (PLAINTEXT_FIELDS, ajouté avant ce jour pour une autre raison) — identifié et retiré, sinon il aurait annulé ce jour silencieusement ; remplacé par un hook qui normalise en `{fr, en}` et traduit `fr→en` automatiquement (best-effort) sur `pre('save')` et les hooks `pre(update*)`. Services corrigés pour laisser passer la forme brute plutôt que la figer avant sauvegarde (producerProductService, transformerProductService, restaurateurDishService, dishProductUtils.js, adminDishController). Recherche : `utils/searchUtils.js` gérait déjà `name.fr`/`name.en` (code antérieur) ; généralisé à `description`/`shortDescription` ; index MongoDB text mis à jour, mais la vraie recherche produit passe par des regex (`buildFlexibleSearchQuery`), pas par `$text` — pas de rupture de recherche constatée. Frontend : `toPlainText` priorise désormais la langue active de l'UI (`i18n.language`) au lieu de toujours le français.
**Glossaire métier (24/09)** : `backend/data/translationGlossary.json` + branché dans `translateText.js` — correspondance exacte (court-circuite l'appel MT pour les noms de produits connus, ex. "Corète Potagère" → "Jute Mallow" au lieu de "Corchorus olitorius"/"corte") et remplacements de mots sur le résultat MT (ex. "tô" → "tô (corn porridge)" au lieu du contresens "toe"). À enrichir au fil des cas repérés.
**Migration exécutée contre Atlas Prod (24/09, avec validation explicite de l'utilisateur)** : `scripts/migrateProductTranslations.js --execute`, sur les 97 produits du catalogue. Deux bugs réels trouvés et corrigés en cours de route : (1) MyMemory renvoie parfois son message d'erreur "QUERY LENGTH LIMIT EXCEEDED" comme si c'était une traduction valide (HTTP 200 avec `responseStatus` interne à 403) — détecté et écarté, sinon stocké tel quel en DB ; (2) le service de repli LibreTranslate (`libretranslate.de`, hérité du code du blog) a fermé son accès anonyme et exige désormais une clé API payante — remplacé par un découpage du texte en morceaux ≤500 caractères tous traduits via MyMemory (gratuit), avec repli sur LibreTranslate uniquement si `LIBRETRANSLATE_API_KEY` est configurée. Le timeout de 5s s'est aussi révélé trop court sous charge (MyMemory a répondu jusqu'à 4-5s après la migration en masse) ; passé à 15s. Résultat final : **97/97 produits ont `name.en` et `description.en`**, 0 champ restant en chaîne simple non migrée.
Reste à faire, déplacé vers les jours dédiés à ces formulaires pour éviter de les modifier deux fois : le champ EN "retouche" dans AddProduct/EditProduct (producteur) → Jour 48, AddDish (restaurateur) → Jour 53. Recréation de l'index text (`--recreate-text-index`) pas encore lancée — pas urgent vu que la recherche réelle ne dépend pas de cet index.

Jour 46 — Page admin : gestion du glossaire de traduction (à faire)
Suite directe du glossaire métier posé au Jour 45 (`backend/data/translationGlossary.json`, actuellement un fichier statique édité à la main). Objectif : le rendre self-service pour l'équipe interne sans passer par du code. Backend : migrer `exactTerms`/`wordReplacements` vers une collection Mongo (`TranslationGlossary`) plutôt que de faire écrire l'admin dans le fichier JSON du serveur (plus sûr en prod, pas de perte au redéploiement, pas de redémarrage nécessaire) ; script de migration one-shot pour semer la DB avec le contenu actuel du JSON ; `utils/translateText.js` lit désormais la DB avec un cache mémoire (invalidé à chaque écriture admin) plutôt que le `require()` statique. Routes API admin CRUD (GET/POST/PUT/DELETE) sur les deux catégories d'entrées, avec validation (regex valide pour `wordReplacements`, pas de doublon de terme exact). Frontend : nouvelle page sous `pages/admin` (liste + formulaire d'ajout/édition, suppression avec confirmation), UI en français comme le reste du back-office (cf. décision Jour 69 sur le périmètre admin).

Jour 47 — Auth & onboarding (à faire)
Connexion, inscription, vérification d'e-mail, mot de passe oublié, ProfileCompletionModal, EmailVerificationBanner. Premier parcours vécu par tout nouvel utilisateur anglophone : priorité haute.

Jour 48 — Dashboard producteur : produits (à faire)
MyProducts, AddProduct, EditProduct — listing, formulaire d'ajout, formulaire d'édition, y compris messages de validation inline. Ajouter aussi le champ EN "retouche" (nom/description) sur AddProduct/EditProduct laissé de côté au Jour 45 pour éviter de traduire ces formulaires deux fois.

Jour 49 — Dashboard producteur : commandes, stats, avis (à faire)
Orders, Stats, ProducerReviews et les widgets du tableau de bord (RecentOrders, ProducerSalesStats, RecentProductsWidget).

Jour 50 — Conseils agricoles (à faire)
CropAdvice.jsx et CropAdviceDetail.jsx : le texte d'interface (labels, boutons) passe par i18next ; cropAdviceData.js lui-même (saisons, conseils, étapes de pousse) reste en français pour l'instant — trop volumineux pour cette passe, à traiter séparément si besoin.

Jour 51 — Dashboard transformateur (à faire)
MyProducts, AddProduct/EditProduct, OrdersList, TransformerReviews, TransformerStats — même famille d'écrans que le producteur, réutiliser les clés communes déjà posées au Jour 48-49.

Jour 52 — Dashboard transporteur (à faire)
Fleet, AddVehicle/EditVehicle, Statistics — vocabulaire spécifique (véhicules, trajets) à ajouter au namespace dédié.

Jour 53 — Dashboard restaurateur (à faire)
OrdersList, DishesManagement, AddDish, AddOrder, SuppliersList, RestaurateurReviews, Stats. Ajouter aussi le champ EN "retouche" (nom/description du plat) sur AddDish laissé de côté au Jour 45.

Jour 54 — Dashboard consommateur (à faire)
Cart, Favorites, OrderHistory, Reviews, Statistics, ConsumerDashboard.

Jour 55 — Dashboard exportateur (à faire)
Fleet, Statistics, Orders — même logique que transporteur/producteur, vocabulaire export en plus (douane, incoterms si présents).

Jour 56 — Pages communes (à faire)
ProfilePage, SettingsPage (UniversalProfile/UniversalSettings), NotificationsPage, DocumentsPage, Messages — partagées par tous les rôles, donc à fort effet de levier.

Jour 57 — Revue formulaires & erreurs inline (à faire)
Passe transverse sur tous les dashboards traités jusqu'ici : validations de formulaire, placeholders, messages d'erreur affichés en direct dans l'UI — catégorie de texte historiquement oubliée dans ce genre de migration.

Jour 58 — i18nResponse : module auth (à faire)
Étendre res.success/res.error (backend/middleware/i18nResponse.js) à authController.js, passwordController.js, authMiddleware.js, emailVerificationController.js — module le plus exposé côté utilisateur.

Jour 59 — i18nResponse : produits & commandes (à faire)
Contrôleurs produits et commandes (les plus gros en volume de code parmi les 57 identifiés avec du français en dur).

Jour 60 — i18nResponse : avis, notifications, chat (à faire)
Contrôleurs reviews, notifications, chatBotController (partie réponses HTTP, pas encore le NLP lui-même — voir Jour 66-68).

Jour 61 — i18nResponse : admin (à faire)
Contrôleurs du back-office. Priorité plus basse (voir décision Jour 69 sur le périmètre admin), mais autant le faire dans la foulée si le pattern est déjà rodé.

Jour 62 — Validations Joi/Mongoose bilingues (à faire)
Basculer les messages de validation sur les clés de backend/locales/{fr,en}.json plutôt que sur du texte en dur dans les schémas.

Jour 63 — Cookie de langue lu par le backend (à faire)
Vérifier/corriger que le middleware detectLanguage (backend/config/i18n.js) lit bien le cookie harvests_lang posé au Jour 35, pas seulement l'en-tête Accept-Language.

Jour 64 — E-mails bilingues (1/2) (à faire)
welcome.pug, passwordReset.pug, accountApproval.pug : injecter user.preferredLanguage dans le contexte de rendu, dupliquer le texte en clés fr/en plutôt que forker les gabarits, mettre à jour html(lang=...) dynamiquement.

Jour 65 — E-mails bilingues (2/2) (à faire)
orderConfirmation.pug, incompleteProfile.pug, subscriptionExpired/Expiring.pug, mailing.pug — même traitement.

Jour 66 — Chatbot : intentions FAQ en anglais (à faire)
Ajouter "en" à la config du NlpManager (chatBotController.js, actuellement languages: ["fr"] uniquement) et dupliquer en anglais les addDocument/addAnswer issus de la FAQ.

Jour 67 — Chatbot : salutations & routage (à faire)
Dupliquer les intentions salutations/remerciements/au revoir en anglais, puis router manager.process() sur la langue de la conversation au lieu de "fr" codé en dur.

Jour 68 — Chatbot : ré-entraînement (à faire)
Regénérer model.nlp, vérifier qu'il reste synchronisé entre la racine du repo et backend/model.nlp, tester quelques échanges en anglais de bout en bout.

Jour 69 — PWA & périmètre admin (à faire)
Traduire frontend/public/manifest.json (name, description, shortcuts). Trancher : le back-office (68 fichiers sous pages/admin + components/admin) reste français-only tant que l'équipe interne est francophone — à documenter comme décision assumée, pas comme oubli.

Jour 70 — Lexique de référence (à faire)
Figer le glossaire métier fr/en (producteur→producer, filière→value chain, fiche de culture→crop guide, étape de pousse→growth stage, etc. — liste complète dans le PDF) et le partager avec quiconque traduit ou relit.

Jour 71 — Relecture native (à faire)
Faire relire par un·e anglophone natif·ve l'ensemble des clés en.json (frontend + backend) avant toute mise en prod de la bascule anglaise.

Jour 72 — Tests de bascule (à faire)
Vérifier en anglais les parcours critiques de bout en bout : inscription, paiement, suivi de commande, chat. Consigner les écrans encore en français ici pour rattrapage.

Jour 73 — Lancement : pages publiques (à faire)
Activer le sélecteur de langue d'abord sur les pages vitrine (déjà couvertes Jours 37-40 et 43-44), le reste du site restant en français tant que non traité. Suivre le taux d'usage de la bascule anglais.

Jour 74 — Lancement : extension progressive (à faire)
Étendre au fil de l'eau : dashboards, puis e-mails, puis chatbot, en te basant sur les retours/usages remontés au Jour 73. Bilan de la couverture bilingue atteinte à ce stade.
