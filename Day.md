--- Plan bascule bilingue FR/EN (fr → fr + en) ---
Détail complet, chiffres d'audit et justifications : docs/Harvests-Bilingue-Roadmap.pdf. Repère jour par jour ci-dessous, à mettre à jour (fait) puis retirer au fur et à mesure comme d'habitude. Numérotation reprise à la suite de Jour 32.

Jour 46 — Page admin : gestion du glossaire de traduction (fait)
Glossaire fr→en déplacé du fichier `backend/data/translationGlossary.json` vers la collection Mongo `TranslationGlossary` (`models/TranslationGlossary.js`) : une seule collection avec `type` = `exact` (terme français normalisé en minuscules) ou `replacement` (motif regex + `flags`, gi par défaut), index unique `{type, source}` contre les doublons, regex et flags validés au `pre('validate')`. `utils/translationGlossary.js` : chargement depuis la DB avec cache mémoire, invalidé à chaque écriture admin, plus un TTL de 5 min (plusieurs instances du serveur) ; repli sur le JSON **uniquement si la DB est injoignable** (une collection vidée volontairement ne fait pas revenir les anciennes entrées). `translateText.js` lit ce cache au lieu du `require()` statique ; correction au passage : les remplacements du glossaire (cibles en anglais) ne s'appliquent plus aux traductions en→fr (blog), où ils n'avaient pas lieu d'être. API admin `GET/POST/PATCH/DELETE /api/v1/admin/glossary` (`controllers/admin/adminGlossaryController.js` ; PATCH plutôt que PUT pour rester cohérent avec le reste de adminRoutes), doublon → 409 lisible, chaque écriture tracée dans l'audit log (`GLOSSARY_ENTRY_*`). Frontend : `pages/admin/AdminGlossary.jsx` sur `/admin/glossary` (entrée « Glossaire de traduction » dans la sidebar) : liste filtrable par type et recherche, modal d'ajout/édition avec aide contextuelle et contrôle de la regex côté client, suppression avec confirmation, encart « Tester une traduction » (réutilise `/blogs/translate`, donc reflète immédiatement les modifications). Vérifié : smoke test backend hors DB (validation du modèle, repli JSON, lookup exact, chargement des routes), eslint propre, `npm run build` OK.
**Semence exécutée contre Atlas Prod (25/09, avec validation explicite de l'utilisateur)** : dry-run puis `scripts/seedTranslationGlossary.js --execute` → 10 entrées insérées (3 termes exacts, 7 remplacements), 0 échec ; index unique `type_1_source_1` créé. Vérifié par lecture en base : glossaire chargé depuis la DB (pas le repli JSON), « Corète potagère » → « Jute Mallow » via le glossaire. Reste non testé : la page `/admin/glossary` elle-même dans le navigateur contre la vraie base.

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
