--- Plan bascule bilingue FR/EN (fr → fr + en) ---
Détail complet, chiffres d'audit et justifications : docs/Harvests-Bilingue-Roadmap.pdf. Repère jour par jour ci-dessous, à mettre à jour (fait) puis retirer au fur et à mesure comme d'habitude. Numérotation reprise à la suite de Jour 32.

Jour 48 — Dashboard producteur : produits (fait)
MyProducts, AddProduct, EditProduct + `hooks/useEditProduct.js` + les composants d'images partagés avec le transformateur (ProductImageUpload, ProductImageManager) : 6 fichiers migrés et ajoutés au garde-fou CI. Section `products` de `dashboard-producer` réécrite (le namespace n'était utilisé nulle part), textes des images dans `common.imageUpload`, unités dans `common.units` (clé ASCII ajoutée à `config/units.js`, la `value` stockée en base et le `label` français restent pour les écrans pas encore migrés — Jours 51 et 53). Catégories : la liste française dupliquée dans les deux formulaires remplacée par `PRODUCT_FORM_CATEGORIES` + `getCategoryLabel(cat, langue)` (déjà bilingue, `utils/productHelpers.js`). **Saisie dans la langue de l'interface + retouche de l'autre langue (reportée du Jour 45)** : les champs principaux nom/description sont dans la langue de l'UI ; si l'utilisateur change de langue en cours de saisie, champs principaux et bloc facultatif échangent leur contenu sur place, sans rechargement ni perte de saisie (`hooks/useBilingualSourceLang.js`), et un bloc facultatif « Version anglaise » ou « Version française » permet de retoucher l'autre langue ; vide → traduction automatique, rempli → la retouche du vendeur est conservée. En édition, la langue des champs principaux est celle de l'UI sauf si le produit n'a pas encore de texte dans cette langue. **Backend** (`productMiddleware.js`) : traduction automatique désormais dans les deux sens (en → fr quand seul `en` est fourni ; repli sur une copie du texte anglais dans `fr` si le service échoue, `fr` restant obligatoire) et déplacée de `pre('save')` vers `pre('validate')`, sinon la validation (qui exige `fr`) rejetait un produit saisi en anglais avant la traduction. **Glossaire dans les deux sens** (suite logique : un vendeur peut désormais saisir en anglais) : champ `direction` (`fr-en` / `en-fr`) sur `TranslationGlossary`, un glossaire par sens chargé par `utils/translationGlossary.js` et appliqué par `translateText` selon la paire demandée ; unicité désormais sur { sens, type, terme } ; page admin avec choix du sens (formulaire, filtre, colonne, encart de test). Le sens inverse n'est pas déduit automatiquement des entrées existantes (plusieurs termes fr peuvent donner le même terme en, et un remplacement porte sur le texte déjà traduit). Les 10 entrées du Jour 46 sont lues comme fr → en ; `scripts/migrateGlossaryDirection.js` (dry-run par défaut) leur ajoute le champ et remplace l'ancien index unique { type, source }, qui bloquerait un même terme dans les deux sens. **Migration exécutée contre Atlas Prod (29/09, avec validation explicite de l'utilisateur)** : 10 entrées passées en fr-en, ancien index supprimé, index { direction, type, source } créé ; relu en base : fr → en inchangé (« Corète potagère » → « Jute Mallow »), en → fr opérant (testé avec une entrée simulée en mémoire, sans écriture). Le sens en → fr est encore vide : sans entrée, MyMemory laisse « Jute Mallow » tel quel en français → entrées à ajouter depuis la page admin. Logique frontend dans `utils/bilingualField.js`, réutilisable aux Jours 51 et 53 : en édition, si le texte principal change sans que l'autre langue soit retouchée, l'ancienne traduction n'est pas renvoyée (elle serait devenue fausse) → retraduction ; la description courte suit les mêmes langues. **Deux bugs corrigés** : (1) EditProduct préremplissait les champs avec `toPlainText`, qui suit la langue de l'UI depuis le Jour 45 → interface en anglais = texte anglais renvoyé comme `fr`, le nom français du produit était écrasé à l'enregistrement ; désormais `fr` et `en` sont chargés explicitement. (2) MyProducts plantait après « Publier » : la liste rechargée n'était pas aplatie et `{fr, en}` était rendu tel quel ; les noms sont maintenant convertis à l'affichage (ce qui suit aussi un changement de langue). Au passage : titre d'édition qui affichait « Modifier Product. », `aria-label` sur les boutons icônes. Vérifié : parité fr/en, check hardcoded-french (87 fichiers), eslint, build, script ad hoc (169 références de clés présentes en fr/en), 20 cas testés sur `bilingualField.js`, et validation Product testée hors base (saisie en seule, fr seule, les deux) avec le vrai service de traduction.
**À reprendre** : (1) **sécurité, hors périmètre traduction** — `producerProductService.updateProduct` fait `Object.assign(product, req.body)` et `createProduct` accepte `status` : un producteur peut passer lui-même son produit en `approved` (le sélecteur « Cycle de vie » d'EditProduct le propose même) et modifier d'autres champs, sans validation admin → à corriger côté backend (liste blanche de champs et de statuts). (2) ~~Pas vu dans le navigateur~~ → **testé dans le navigateur (29/09, compte producteur fictif `producteur.test@harvests.dev`, backend local sur Atlas Prod)** : ajout en français avec bascule en anglais en cours de saisie (champs échangés, les deux langues enregistrées telles quelles), ajout en anglais seul (français traduit automatiquement), ajout en français seul (anglais traduit), édition en français avec seul le français modifié (anglais retraduit), édition ouverte en français puis basculée en anglais (champs échangés, français retraduit), liste en anglais, « Publish » sans plantage, suppression ; produits de test supprimés, 0 restant en base. **Bug trouvé et corrigé pendant le test** : les cartes de MyProducts affichaient un stock vide (lecture de `product.stock`, alors que l'API renvoie `inventory.quantity`). **Revue de code** : bug trouvé dans la détection de traduction obsolète — si le vendeur modifiait le texte principal puis changeait de langue avant d'enregistrer, les rôles des champs étaient inversés et l'ancienne traduction était gardée. Corrigé en mémorisant, à la saisie, le rôle de chaque langue modifiée (texte principal ou retouche, `getStaleLang` dans `bilingualField.js`), rejoué dans le navigateur (modifier le français, basculer en anglais, enregistrer → seul `fr` envoyé, anglais retraduit ; retouche seule de l'anglais → rien de retraduit) et couvert par 24 cas unitaires. Relevé aussi : le bouton du sélecteur de langue garde l'`aria-label` « Changer de langue » en anglais (hors périmètre, composant du header). (3) « gombo » est parfois rendu par « Gumbo », que la règle actuelle (`\bgombo\b`) ne rattrape pas → règle à ajouter depuis la page admin du glossaire. (4) Même piège `toPlainText` probable dans l'édition transformateur et plats restaurateur → à traiter aux Jours 51 et 53 avec `bilingualField.js`.

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
