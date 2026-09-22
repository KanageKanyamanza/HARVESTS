--- Plan bascule bilingue FR/EN (fr → fr + en) ---
Détail complet, chiffres d'audit et justifications : docs/Harvests-Bilingue-Roadmap.pdf. Repère jour par jour ci-dessous, à mettre à jour (fait) puis retirer au fur et à mesure comme d'habitude. Numérotation reprise à la suite de Jour 32.

Jour 43 — Pages vitrine : contenu marketplace (2/2) (fait)
Categories.jsx, Producers.jsx, Restaurateurs.jsx, Transformers.jsx, TransporteursExportateurs.jsx, Vendeurs.jsx, ProductDetail.jsx (+ sous-composants ProductActions/ProductImageGallery/VendorCard/ProductSpecifications), DishDetail.jsx, Cart.jsx (panier invité, distinct des dashboards par rôle prévus Jours 46-53) — pages de listing/fiche/panier, texte plus dynamique (états loading/vide, filtres, CTA). 9 fichiers + 4 sous-composants traduits via `useTranslation("public")`, nouvelles clés `categories`/`producers`/`restaurateurs`/`transformers`/`logistics`/`vendeurs`/`productDetail`/`dishDetail`/`cart` dans public.json (les 3 premières remplacent intégralement les placeholders du Jour 34, non consommés ailleurs — vérifié par grep). Pluriels gérés via `_one`/`_other` (i18next) plutôt que du JS conditionnel ; le decompte "Affichage de N producteurs (page X sur Y)" utilise `<Trans>` pour le `<strong>` imbriqué. Décision assumée : les libellés de catégorie/statut produit (`getCategoryLabel`/`getStatusConfig` dans utils/productUtils.js, badge "Légumes"/"Disponible" sur ProductDetail) et les noms de pays (utils/countryMapper.js, déjà en français avant ce jour) restent en français — ce sont des utilitaires partagés par les dashboards non encore traités (Jours 46-53), même logique que la décision CropAdvice du Jour 48. Vérifié en navigateur réel (FR+EN) sur Categories/Producers/Restaurateurs/Transformers/Logistics/Vendeurs/Cart/ProductDetail avec de vraies données (ajout panier inclus) ; DishDetail vérifié par relecture de code + les scripts de contrôle uniquement, faute de plat en base sur cet environnement de dev.

Jour 44 — Pages vendeur : profils partagés (à faire)
Les 5 pages *Profile.jsx (Producer/Transformer/Restaurateur/Transporter/ExporterProfile) ne sont que de fines coquilles (~16 lignes chacune) autour de components/common/VendorProfile.jsx (479 lignes) — mais le vrai volume de texte est dans config/vendor/{baseConfig,producerConfig,transformerConfig,restaurateurConfig,transporterConfig,exporterConfig}.jsx (~1385 lignes à eux 6 : labels d'onglets, textes d'état vide, boutons d'action). Sous-estimé au Jour 43 initial, d'où cette journée dédiée séparée.

Jour 45 — Auth & onboarding (à faire)
Connexion, inscription, vérification d'e-mail, mot de passe oublié, ProfileCompletionModal, EmailVerificationBanner. Premier parcours vécu par tout nouvel utilisateur anglophone : priorité haute.

Jour 46 — Dashboard producteur : produits (à faire)
MyProducts, AddProduct, EditProduct — listing, formulaire d'ajout, formulaire d'édition, y compris messages de validation inline.

Jour 47 — Dashboard producteur : commandes, stats, avis (à faire)
Orders, Stats, ProducerReviews et les widgets du tableau de bord (RecentOrders, ProducerSalesStats, RecentProductsWidget).

Jour 48 — Conseils agricoles (à faire)
CropAdvice.jsx et CropAdviceDetail.jsx : le texte d'interface (labels, boutons) passe par i18next ; cropAdviceData.js lui-même (saisons, conseils, étapes de pousse) reste en français pour l'instant — trop volumineux pour cette passe, à traiter séparément si besoin.

Jour 49 — Dashboard transformateur (à faire)
MyProducts, AddProduct/EditProduct, OrdersList, TransformerReviews, TransformerStats — même famille d'écrans que le producteur, réutiliser les clés communes déjà posées au Jour 46-47.

Jour 50 — Dashboard transporteur (à faire)
Fleet, AddVehicle/EditVehicle, Statistics — vocabulaire spécifique (véhicules, trajets) à ajouter au namespace dédié.

Jour 51 — Dashboard restaurateur (à faire)
OrdersList, DishesManagement, AddDish, AddOrder, SuppliersList, RestaurateurReviews, Stats.

Jour 52 — Dashboard consommateur (à faire)
Cart, Favorites, OrderHistory, Reviews, Statistics, ConsumerDashboard.

Jour 53 — Dashboard exportateur (à faire)
Fleet, Statistics, Orders — même logique que transporteur/producteur, vocabulaire export en plus (douane, incoterms si présents).

Jour 54 — Pages communes (à faire)
ProfilePage, SettingsPage (UniversalProfile/UniversalSettings), NotificationsPage, DocumentsPage, Messages — partagées par tous les rôles, donc à fort effet de levier.

Jour 55 — Revue formulaires & erreurs inline (à faire)
Passe transverse sur tous les dashboards traités jusqu'ici : validations de formulaire, placeholders, messages d'erreur affichés en direct dans l'UI — catégorie de texte historiquement oubliée dans ce genre de migration.

Jour 56 — i18nResponse : module auth (à faire)
Étendre res.success/res.error (backend/middleware/i18nResponse.js) à authController.js, passwordController.js, authMiddleware.js, emailVerificationController.js — module le plus exposé côté utilisateur.

Jour 57 — i18nResponse : produits & commandes (à faire)
Contrôleurs produits et commandes (les plus gros en volume de code parmi les 57 identifiés avec du français en dur).

Jour 58 — i18nResponse : avis, notifications, chat (à faire)
Contrôleurs reviews, notifications, chatBotController (partie réponses HTTP, pas encore le NLP lui-même — voir Jour 64-66).

Jour 59 — i18nResponse : admin (à faire)
Contrôleurs du back-office. Priorité plus basse (voir décision Jour 67 sur le périmètre admin), mais autant le faire dans la foulée si le pattern est déjà rodé.

Jour 60 — Validations Joi/Mongoose bilingues (à faire)
Basculer les messages de validation sur les clés de backend/locales/{fr,en}.json plutôt que sur du texte en dur dans les schémas.

Jour 61 — Cookie de langue lu par le backend (à faire)
Vérifier/corriger que le middleware detectLanguage (backend/config/i18n.js) lit bien le cookie harvests_lang posé au Jour 35, pas seulement l'en-tête Accept-Language.

Jour 62 — E-mails bilingues (1/2) (à faire)
welcome.pug, passwordReset.pug, accountApproval.pug : injecter user.preferredLanguage dans le contexte de rendu, dupliquer le texte en clés fr/en plutôt que forker les gabarits, mettre à jour html(lang=...) dynamiquement.

Jour 63 — E-mails bilingues (2/2) (à faire)
orderConfirmation.pug, incompleteProfile.pug, subscriptionExpired/Expiring.pug, mailing.pug — même traitement.

Jour 64 — Chatbot : intentions FAQ en anglais (à faire)
Ajouter "en" à la config du NlpManager (chatBotController.js, actuellement languages: ["fr"] uniquement) et dupliquer en anglais les addDocument/addAnswer issus de la FAQ.

Jour 65 — Chatbot : salutations & routage (à faire)
Dupliquer les intentions salutations/remerciements/au revoir en anglais, puis router manager.process() sur la langue de la conversation au lieu de "fr" codé en dur.

Jour 66 — Chatbot : ré-entraînement (à faire)
Regénérer model.nlp, vérifier qu'il reste synchronisé entre la racine du repo et backend/model.nlp, tester quelques échanges en anglais de bout en bout.

Jour 67 — PWA & périmètre admin (à faire)
Traduire frontend/public/manifest.json (name, description, shortcuts). Trancher : le back-office (68 fichiers sous pages/admin + components/admin) reste français-only tant que l'équipe interne est francophone — à documenter comme décision assumée, pas comme oubli.

Jour 68 — Lexique de référence (à faire)
Figer le glossaire métier fr/en (producteur→producer, filière→value chain, fiche de culture→crop guide, étape de pousse→growth stage, etc. — liste complète dans le PDF) et le partager avec quiconque traduit ou relit.

Jour 69 — Relecture native (à faire)
Faire relire par un·e anglophone natif·ve l'ensemble des clés en.json (frontend + backend) avant toute mise en prod de la bascule anglaise.

Jour 70 — Tests de bascule (à faire)
Vérifier en anglais les parcours critiques de bout en bout : inscription, paiement, suivi de commande, chat. Consigner les écrans encore en français ici pour rattrapage.

Jour 71 — Lancement : pages publiques (à faire)
Activer le sélecteur de langue d'abord sur les pages vitrine (déjà couvertes Jours 37-40 et 43-44), le reste du site restant en français tant que non traité. Suivre le taux d'usage de la bascule anglais.

Jour 72 — Lancement : extension progressive (à faire)
Étendre au fil de l'eau : dashboards, puis e-mails, puis chatbot, en te basant sur les retours/usages remontés au Jour 71. Bilan de la couverture bilingue atteinte à ce stade.
