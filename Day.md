--- Plan bascule bilingue FR/EN (fr → fr + en) ---
Détail complet, chiffres d'audit et justifications : docs/Harvests-Bilingue-Roadmap.pdf. Repère jour par jour ci-dessous, à mettre à jour (fait) puis retirer au fur et à mesure comme d'habitude. Numérotation reprise à la suite de Jour 32.

Jour 52 — Dashboard transporteur (fait, test navigateur à faire)
Fleet, AddVehicle/EditVehicle, Statistics, Orders et tableau de bord migrés dans le nouveau namespace `dashboard-transporter` (véhicules : types, équipements, états, unités, messages des hooks `useAddVehicle`/`useVehicleForm`). Sections partagées migrées dans `common.dashboardSections` (OrdersSection, QuickActionsSection, SubscriptionSection) + FleetSummarySection. Corrigé au passage : `AddVehicle` utilisait `LoadingSpinner` sans l'importer (plantage à l'enregistrement) ; liens morts des actions rapides transporteur (`/transporter/deliveries`, `/transporter/zones`) et des cartes (`/transporter/reviews`) ; le résumé de flotte du tableau de bord transporteur renvoyait vers `/exporter/fleet`. **Reste** : test navigateur fr/en (pas de compte transporteur de test — en créer un), dont ajout/modification/suppression d'un véhicule marqué « TEST J52 » à nettoyer en prod. **Aussi à tester (même session)** : gabarit `dashboard-page`/`dashboard-container` étendu à toutes les pages admin, et suppression des spinners de chargement dans les tableaux de bord (squelettes : `DashboardPageSkeleton` pour le chargement des pages/session, `CardGridSkeleton` pour les listes admin, chatbot, flotte, livraisons, messagerie) — vérifier en compte admin et producteur.

Jour 53 — Dashboard restaurateur (à faire)
OrdersList, DishesManagement, AddDish, AddOrder, SuppliersList, RestaurateurReviews, Stats. Ajouter aussi le champ EN "retouche" (nom/description du plat) sur AddDish laissé de côté au Jour 45 — **reporté du Jour 48** : même schéma que le producteur (saisie dans la langue de l'UI + retouche de l'autre langue, `utils/bilingualField.js` et `hooks/useBilingualSourceLang.js`), et vérifier le même piège `toPlainText` à l'édition d'un plat.

Jour 54 — Dashboard consommateur (à faire)
Cart, Favorites, OrderHistory, Reviews, Statistics, ConsumerDashboard.

Jour 55 — Dashboard exportateur (à faire)
Fleet, Statistics, Orders — même logique que transporteur/producteur, vocabulaire export en plus (douane, incoterms si présents). Réutiliser `dashboard-transporter` (clés `vehicle.*`, déjà prêtes pour les types conteneur/navire/avion) et les sections partagées migrées au Jour 52 ; les composants `components/vehicles/*` et les hooks véhicule sont déjà traduits.

Jour 56 — Pages communes (à faire)
ProfilePage, SettingsPage (UniversalProfile/UniversalSettings), NotificationsPage, DocumentsPage, Messages — partagées par tous les rôles, donc à fort effet de levier. **Reporté du Jour 48** : le bouton du sélecteur de langue (header) garde l'`aria-label` « Changer de langue » quand l'interface est en anglais → le passer par t(). **Reporté du Jour 49** : la page de détail d'une commande (`pages/orders/OrderDetail.jsx`, partagée par tous les profils) n'est traduite que pour les libellés de statut — reste tout le texte de la page.

Jour 57 — Revue formulaires & erreurs inline (à faire)
Passe transverse sur tous les dashboards traités jusqu'ici : validations de formulaire, placeholders, messages d'erreur affichés en direct dans l'UI — catégorie de texte historiquement oubliée dans ce genre de migration. **Reporté du Jour 50** : brancher en CI le contrôle de couverture des fiches de culture (chaque texte français de `data/cropAdviceData.js` doit avoir sa traduction dans `data/cropAdviceData.en.js`, indexée par le texte exact — sinon une modification du français fait repasser ce texte en français dans l'interface anglaise).

Jour 58 — i18nResponse : module auth (à faire)
Étendre res.success/res.error (backend/middleware/i18nResponse.js) à authController.js, passwordController.js, authMiddleware.js, emailVerificationController.js — module le plus exposé côté utilisateur.

Jour 59 — i18nResponse : produits & commandes (à faire)
Contrôleurs produits et commandes (les plus gros en volume de code parmi les 57 identifiés avec du français en dur). **Reporté du Jour 48 (sécurité)** : la création de produit utilisée par l'interface producteur (`services/producer/producerProductService.js`) ne vérifie la limite de produits de l'abonnement que côté interface ; un appel direct à l'API permet de la dépasser → reprendre la vérification déjà présente dans `productProducerService.createProduct`.

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
Figer le glossaire métier fr/en (producteur→producer, filière→value chain, fiche de culture→crop guide, étape de pousse→growth stage, etc. — liste complète dans le PDF) et le partager avec quiconque traduit ou relit. **Reporté du Jour 48** : le glossaire de traduction (page admin `/admin/glossary`) fonctionne désormais dans les deux sens mais le sens EN → FR est vide — y saisir les équivalents des termes FR → EN (jute mallow → corète potagère, okra → gombo, cowpea → niébé…) ; ajouter aussi en FR → EN une règle « Gumbo » → « okra » (le service traduit parfois « gombo » par « Gumbo », non rattrapé par la règle `\bgombo\b`). Peut être fait avant, dès qu'un vendeur saisit en anglais. **Reporté du Jour 49** : les montants restent au format français en anglais (« 3 000 F CFA ») car `utils/currencyUtils.formatPrice`, commun à tout le site, force `fr-FR` → décider du format des prix en anglais (ex. « FCFA 3,000 ») avec le reste des conventions.

Jour 71 — Relecture native (à faire)
Faire relire par un·e anglophone natif·ve l'ensemble des clés en.json (frontend + backend) avant toute mise en prod de la bascule anglaise. Inclure le contenu agricole traduit au Jour 50 (`data/cropAdviceData.en.js`, 575 textes).

Jour 72 — Tests de bascule (à faire)
Vérifier en anglais les parcours critiques de bout en bout : inscription, paiement, suivi de commande, chat. Consigner les écrans encore en français ici pour rattrapage. **Reporté du Jour 49** : les boutons d'action d'une vraie commande (préparer, prête, livrée, réception…) n'ont été vérifiés qu'à l'affichage, avec des données fictives — les cliquer sur une commande de test de bout en bout.

Jour 73 — Lancement : pages publiques (à faire)
Activer le sélecteur de langue d'abord sur les pages vitrine (déjà couvertes Jours 37-40 et 43-44), le reste du site restant en français tant que non traité. Suivre le taux d'usage de la bascule anglais.

Jour 74 — Lancement : extension progressive (à faire)
Étendre au fil de l'eau : dashboards, puis e-mails, puis chatbot, en te basant sur les retours/usages remontés au Jour 73. Bilan de la couverture bilingue atteinte à ce stade.
