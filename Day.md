--- Plan bascule bilingue FR/EN (fr → fr + en) ---
Détail complet, chiffres d'audit et justifications : docs/Harvests-Bilingue-Roadmap.pdf. Repère jour par jour ci-dessous, à mettre à jour (fait) puis retirer au fur et à mesure comme d'habitude. Numérotation reprise à la suite de Jour 32.

Jour 42 — Pages vitrine : contenu institutionnel (1/2) (fait)
Traduit les 9 pages prévues : About, Contact, FAQ (route /help), Terms, Privacy, Pricing, Investors, LoyaltyProgram, NotFound. Nouvelles clés dans public.json (about, contact, faq, terms, privacy, pricing, investors, loyalty, notFound), ~800 lignes par langue ; les textes longs (FAQ, CGU, confidentialité, plans tarifaires, niveaux de fidélité) sont des tableaux lus via t(clé, { returnObjects: true }), la partie non textuelle (icônes, liens, couleurs, nombre de fonctionnalités incluses par plan) reste dans le composant, associée par position.
Détails : le sélecteur d'un formulaire pré-rempli (Investors : sujet + message par défaut) et l'objet du mailto passent aussi par t() ; les dates de mise à jour (CGU, confidentialité) et le format des prix (fr-FR / en-US) suivent la langue ; les libellés "Email :" / "Phone:" des CGU et de la confidentialité portent leur propre ponctuation (l'espace avant les deux-points est français, pas anglais). Trouvé au passage : LoyaltyProgram mélangeait déjà de l'anglais dans la version française ("Birthday rewards") — traduit ("Cadeau d'anniversaire"). Les mentions légales (raison sociale, RCCM, NINEA, téléphone, e-mail) restent en dur : identifiants, pas du texte à traduire.
Vérifié en navigateur réel (Chrome piloté en CDP) en anglais puis en français sur les 9 pages : titres traduits, 0 exception JS. Parité, garde-fou français en dur (41 fichiers protégés), lint et build verts.
Ajouts demandés juste après : (1) la FAQ passe de /help à /faq — route, lien du footer, entrée useSEO, robots.txt et sitemap.xml mis à jour ; /help a ensuite été supprimé complètement (plus de redirection, l'utilisateur ne le voyant utilisé nulle part ailleurs — grep confirmé : plus aucune référence dans src/).
Footer, colonne "Besoin d'aide ?" : ajout du lien À propos (/about) ; retrait de Connexion / Inscription / Panier pour le visiteur non connecté (les liens du compte connecté sont inchangés) ; retrait de la clé navigation.footer.register devenue inutile ; Contact et Tarifs, présents dans le tableau mais jamais affichés (masqués par un slice(3)), retirés du tableau au lieu de rester en code mort. (2) Bannière cookies (CookieConsentBanner.jsx) et fenêtre d'installation PWA (PWAInstallModal.jsx), montées sur toutes les pages et restées en français : traduites via le namespace common (clés cookies.* et pwaInstall.*). Les libellés/descriptions des 3 catégories de cookies vivaient dans utils/cookieConsent.js (texte français dupliqué, seule la bannière les lisait) : retirés de ce fichier, qui ne garde plus que id et locked. Vérifié en navigateur réel fr + en : bannière, fenêtre PWA, /faq et redirection /help, 0 exception ; 43 fichiers protégés, parité, lint et build verts.

Jour 43 — Pages vitrine : contenu marketplace (2/2) (à faire)
Categories.jsx, Producers.jsx, Restaurateurs.jsx, Transformers.jsx, TransporteursExportateurs.jsx, Vendeurs.jsx, ProductDetail.jsx, DishDetail.jsx, Cart.jsx (panier invité, distinct des dashboards par rôle prévus Jours 45-52) — pages de listing/fiche/panier, texte plus dynamique (états loading/vide, filtres, CTA). Les 5 pages *Profile.jsx (Producer/Transformer/Restaurateur/Transporter/ExporterProfile) ne sont que de fines coquilles (~16 lignes chacune) autour de components/common/VendorProfile.jsx + VendorConfigs.jsx — traduire ces deux fichiers partagés couvre les 5 d'un coup, pas la peine de toucher les coquilles.

Jour 44 — Auth & onboarding (à faire)
Connexion, inscription, vérification d'e-mail, mot de passe oublié, ProfileCompletionModal, EmailVerificationBanner. Premier parcours vécu par tout nouvel utilisateur anglophone : priorité haute.

Jour 45 — Dashboard producteur : produits (à faire)
MyProducts, AddProduct, EditProduct — listing, formulaire d'ajout, formulaire d'édition, y compris messages de validation inline.

Jour 46 — Dashboard producteur : commandes, stats, avis (à faire)
Orders, Stats, ProducerReviews et les widgets du tableau de bord (RecentOrders, ProducerSalesStats, RecentProductsWidget).

Jour 47 — Conseils agricoles (à faire)
CropAdvice.jsx et CropAdviceDetail.jsx : le texte d'interface (labels, boutons) passe par i18next ; cropAdviceData.js lui-même (saisons, conseils, étapes de pousse) reste en français pour l'instant — trop volumineux pour cette passe, à traiter séparément si besoin.

Jour 48 — Dashboard transformateur (à faire)
MyProducts, AddProduct/EditProduct, OrdersList, TransformerReviews, TransformerStats — même famille d'écrans que le producteur, réutiliser les clés communes déjà posées au Jour 45-46.

Jour 49 — Dashboard transporteur (à faire)
Fleet, AddVehicle/EditVehicle, Statistics — vocabulaire spécifique (véhicules, trajets) à ajouter au namespace dédié.

Jour 50 — Dashboard restaurateur (à faire)
OrdersList, DishesManagement, AddDish, AddOrder, SuppliersList, RestaurateurReviews, Stats.

Jour 51 — Dashboard consommateur (à faire)
Cart, Favorites, OrderHistory, Reviews, Statistics, ConsumerDashboard.

Jour 52 — Dashboard exportateur (à faire)
Fleet, Statistics, Orders — même logique que transporteur/producteur, vocabulaire export en plus (douane, incoterms si présents).

Jour 53 — Pages communes (à faire)
ProfilePage, SettingsPage (UniversalProfile/UniversalSettings), NotificationsPage, DocumentsPage, Messages — partagées par tous les rôles, donc à fort effet de levier.

Jour 54 — Revue formulaires & erreurs inline (à faire)
Passe transverse sur tous les dashboards traités jusqu'ici : validations de formulaire, placeholders, messages d'erreur affichés en direct dans l'UI — catégorie de texte historiquement oubliée dans ce genre de migration.

Jour 55 — i18nResponse : module auth (à faire)
Étendre res.success/res.error (backend/middleware/i18nResponse.js) à authController.js, passwordController.js, authMiddleware.js, emailVerificationController.js — module le plus exposé côté utilisateur.

Jour 56 — i18nResponse : produits & commandes (à faire)
Contrôleurs produits et commandes (les plus gros en volume de code parmi les 57 identifiés avec du français en dur).

Jour 57 — i18nResponse : avis, notifications, chat (à faire)
Contrôleurs reviews, notifications, chatBotController (partie réponses HTTP, pas encore le NLP lui-même — voir Jour 63-65).

Jour 58 — i18nResponse : admin (à faire)
Contrôleurs du back-office. Priorité plus basse (voir décision Jour 66 sur le périmètre admin), mais autant le faire dans la foulée si le pattern est déjà rodé.

Jour 59 — Validations Joi/Mongoose bilingues (à faire)
Basculer les messages de validation sur les clés de backend/locales/{fr,en}.json plutôt que sur du texte en dur dans les schémas.

Jour 60 — Cookie de langue lu par le backend (à faire)
Vérifier/corriger que le middleware detectLanguage (backend/config/i18n.js) lit bien le cookie harvests_lang posé au Jour 35, pas seulement l'en-tête Accept-Language.

Jour 61 — E-mails bilingues (1/2) (à faire)
welcome.pug, passwordReset.pug, accountApproval.pug : injecter user.preferredLanguage dans le contexte de rendu, dupliquer le texte en clés fr/en plutôt que forker les gabarits, mettre à jour html(lang=...) dynamiquement.

Jour 62 — E-mails bilingues (2/2) (à faire)
orderConfirmation.pug, incompleteProfile.pug, subscriptionExpired/Expiring.pug, mailing.pug — même traitement.

Jour 63 — Chatbot : intentions FAQ en anglais (à faire)
Ajouter "en" à la config du NlpManager (chatBotController.js, actuellement languages: ["fr"] uniquement) et dupliquer en anglais les addDocument/addAnswer issus de la FAQ.

Jour 64 — Chatbot : salutations & routage (à faire)
Dupliquer les intentions salutations/remerciements/au revoir en anglais, puis router manager.process() sur la langue de la conversation au lieu de "fr" codé en dur.

Jour 65 — Chatbot : ré-entraînement (à faire)
Regénérer model.nlp, vérifier qu'il reste synchronisé entre la racine du repo et backend/model.nlp, tester quelques échanges en anglais de bout en bout.

Jour 66 — PWA & périmètre admin (à faire)
Traduire frontend/public/manifest.json (name, description, shortcuts). Trancher : le back-office (68 fichiers sous pages/admin + components/admin) reste français-only tant que l'équipe interne est francophone — à documenter comme décision assumée, pas comme oubli.

Jour 67 — Lexique de référence (à faire)
Figer le glossaire métier fr/en (producteur→producer, filière→value chain, fiche de culture→crop guide, étape de pousse→growth stage, etc. — liste complète dans le PDF) et le partager avec quiconque traduit ou relit.

Jour 68 — Relecture native (à faire)
Faire relire par un·e anglophone natif·ve l'ensemble des clés en.json (frontend + backend) avant toute mise en prod de la bascule anglaise.

Jour 69 — Tests de bascule (à faire)
Vérifier en anglais les parcours critiques de bout en bout : inscription, paiement, suivi de commande, chat. Consigner les écrans encore en français ici pour rattrapage.

Jour 70 — Lancement : pages publiques (à faire)
Activer le sélecteur de langue d'abord sur les pages vitrine (déjà couvertes Jours 37-40 et 42-43), le reste du site restant en français tant que non traité. Suivre le taux d'usage de la bascule anglais.

Jour 71 — Lancement : extension progressive (à faire)
Étendre au fil de l'eau : dashboards, puis e-mails, puis chatbot, en te basant sur les retours/usages remontés au Jour 70. Bilan de la couverture bilingue atteinte à ce stade.
