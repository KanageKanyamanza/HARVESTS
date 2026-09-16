--- Plan bascule bilingue FR/EN (fr → fr + en) ---
Détail complet, chiffres d'audit et justifications : docs/Harvests-Bilingue-Roadmap.pdf. Repère jour par jour ci-dessous, à mettre à jour (fait) puis retirer au fur et à mesure comme d'habitude. Numérotation reprise à la suite de Jour 32.

Jour 33 — Cadrage bilingue (fait)
Décisions verrouillées : langue par défaut fr, anglais en bascule explicite (pas de géo-détection forcée) ; préférence stockée en localStorage + cookie harvests_lang partagé backend + champ preferredLanguage sur le modèle User ; pas de préfixe d'URL /en/... dans un premier temps ; pipeline de traduction = brouillon assisté puis relecture humaine native obligatoire avant prod.
Vérification du code existant contre ces décisions : preferredLanguage (fr/en/pt/ar, défaut fr) déjà présent sur User.js, cookie harvests_lang déjà géré côté backend (config/i18n.js), pas de préfixe /en/ dans le routing frontend. Écart trouvé et corrigé (fait) : utils/i18n.js retombait sur navigator.language si aucune préférence n'était sauvegardée, ce qui pouvait faire atterrir un visiteur francophone en anglais sans bascule explicite — supprimé, ne reste que localStorage puis défaut fr. Le fallback Accept-Language côté backend reste tel quel, sa correction est explicitement prévue au Jour 58.

Jour 34 — Namespaces locales frontend (fait)
Éclaté frontend/src/locales/{fr,en}.json (~780 lignes chacun) en 9 fichiers par domaine : frontend/src/locales/{fr,en}/{common,navigation,public,dashboard-admin,dashboard-consumer,dashboard-producer,auth,blog,seo}.json. Mapping 1:1 avec les anciennes clés de premier niveau (contenu recopié tel quel, aucune traduction ajoutée) — "chat" et "orders"/"products" partagés évoqués dans la note initiale n'existent pas encore en tant que tels dans le contenu actuel (rien à y mettre avant les jours dédiés) et n'ont donc pas été créés à vide.
utils/i18n.js déclare désormais ns + defaultNS ('common') et importe les 18 fichiers. Seuls 2 écrans consommaient réellement des clés jusqu'ici (le reste du contenu était préparé à l'avance pour les jours suivants) : useSEO.js et BlogPage.jsx/BlogDetailPage.jsx/BlogVisitorModal.jsx/blogUtils.js/BlogHeader.jsx/BlogSidebar.jsx/BlogContent.jsx — tous migrés vers useTranslation('seo') / useTranslation('blog') (BlogPage utilise les deux via useTranslation avec les namespaces blog + seo, préfixe seo: pour les clés SEO) et leurs t() débarrassés du préfixe de domaine devenu redondant. Vérifié par un script i18next autonome (résolution fr/en de chaque clé migrée) et par un build vite complet, tous deux verts.

Jour 35 — Sélecteur de langue (fait)
Créé un composant partagé components/common/LanguageSelector.jsx (dropdown maison fr/en, même motif que les autres menus du projet) et branché dans DashboardTopbar.jsx (visible pour tous les rôles, y compris admin) et dans Header.jsx public (desktop, à côté du sélecteur de devise, + menu mobile). Persistance au rechargement déjà assurée par changeLanguage() (localStorage harvests_language). Le cookie harvests_lang backend (posé par le middleware detectLanguage sur tout ?lang=, mais httpOnly donc non lisible/écrivable en JS) est maintenant réellement posé : changeLanguage() appelle en arrière-plan GET /health?lang=xx (endpoint public neutre, sans effet de bord) au lieu du bloc "notifier le backend" resté en stub jusqu'ici. Vérifié en conditions réelles (Chrome piloté via CDP) : ouverture du dropdown, bascule fr→en, document.documentElement.lang et localStorage mis à jour, aucune erreur console liée au changement ; build vite complet vert.

Jour 36 — Garde-fous CI (fait)
frontend/scripts/check-i18n-parity.js compare chaque paire fr/{ns}.json vs en/{ns}.json (9 namespaces depuis le Jour 34, plus fr.json/en.json monolithiques d'origine) et échoue si une clé manque d'un côté — branché en tête de `npm run build`. A révélé un vrai trou (blog.tags entièrement vide côté en.json depuis le Jour 34) : traduit et corrigé avant d'activer le garde-fou pour ne pas casser le build de tout le monde.
frontend/scripts/check-hardcoded-french.js (regex sur caractères accentués, pas de dépendance eslint-plugin-i18next ajoutée) scanne uniquement les fichiers déjà migrés, listés dans scripts/i18n-migrated-files.js (à compléter à chaque jour de migration) — scanner tout le frontend maintenant produirait des centaines de faux positifs attendus vu le travail encore à faire (Jours 37-52). A trouvé 7 vraies régressions dans BlogPage.jsx (options de select et badges non passés par t() malgré des clés déjà traduites) : corrigées.
Dette eslint préexistante (175 erreurs) traitée pour pouvoir chaîner le check ci-dessus dans `npm run lint` (`eslint . && node scripts/check-hardcoded-french.js`, désormais vert). Root cause de loin la plus fréquente : eslint-plugin-react n'était pas installé, donc `no-unused-vars` ne reconnaissait pas `<Icon />` comme un usage de `Icon` — faux positifs sur toute variable utilisée uniquement en JSX (~40 occurrences). Installé (pnpm, pas npm — ce repo est en pnpm-lock.yaml) et activé via `react/jsx-uses-vars`. Au passage, plusieurs vrais bugs trouvés par le reste du nettoyage : import dupliqué cassant la syntaxe d'OrderCart.jsx, deux clés dupliquées écrasant silencieusement une valeur (useEditProductTransformer.js, useUserType.js — le rôle exportateur avait deux définitions contradictoires), un `require()` CommonJS dans du code navigateur qui cassait le tracking analytics à chaque `sendBeacon`, un `loadProfile` référencé hors de sa portée dans UniversalProfile.jsx (crash silencieux après changement d'avatar/bannière), une action "rejeter la vérification" jamais reliée à un bouton dans UserDetails.jsx (ajouté), et surtout une faille XSS dans blogUtils.js : la fonction d'échappement HTML du rendu Markdown était codée mais jamais appelée sur le chemin texte brut — remplacée par un DOMPurify.sanitize() final, cohérent avec l'autre branche du même fichier qui le faisait déjà. Build complet + test manuel (Chrome piloté via CDP) sur Accueil/Blog/Produits/Producteurs : aucune régression, aucune nouvelle erreur console.

Jour 37 — SEO bilingue, pages vitrine (1/2) (fait)
Vérifié d'abord avec check-i18n-parity.js : les clés home/products/categories/producers existaient déjà côté en/seo.json (pas de trou structurel), mais avec un contenu générique très en retrait par rapport au fr (mots-clés locaux ciblés type "oignons de Podor", "riz local Sénégal" vs traductions plates "fresh products, fruits, vegetables"). Réécrit les 4 avec le même niveau d'exigence SEO que la version fr (mots-clés de recherche réels, pas une traduction mot à mot) plutôt que de simplement les considérer comme "déjà faites". hreflang toujours identique fr/en dans SEOHead.jsx (pas de préfixe /en/) — resté tel quel, explicitement prévu au Jour 38. Build complet vérifié vert.

Jour 38 — SEO bilingue, pages vitrine (2/2) + hreflang (fait)
Réécrit les clés en/seo.json (transformers, restaurateurs, logistics, pricing, blog, loyalty, about, contact) avec un vrai niveau SEO, comme au Jour 37 — productDetail laissé tel quel (fr lui-même minimal/template, pas un retard côté en). Trouvé au passage : /invest n'avait aucune entrée dans useSEO.js ni de clés seo.json — Investors.jsx passait un titre/description français codés en dur à SEOHead, jamais traduits. Ajouté la clé "invest" (fr+en) et l'entrée routeConfigs '/invest', et débranché les props hardcodées d'Investors.jsx pour qu'il retombe sur useSEO() comme les autres pages. Vérifié en conditions réelles : bascule fr→en change bien le <title> de la page Investors.
hreflang : décision prise avec l'utilisateur (fr/en servis sur la même URL, pas de préfixe /en/ — Jour 33) — pas de sitemap dynamique ni d'URLs par langue pour cette passe. Retiré les hreflang="fr"/"en" de SEOHead.jsx qui pointaient tous les deux vers la même URL (techniquement trompeur, Google ignore/déconseille hreflang hors paire d'URLs distinctes), gardé x-default.
Trouvé en testant (pas corrigé, hors scope de cette passe — à trancher séparément) : index.html a une meta description statique de fallback, et react-helmet-async ne la remplace pas au montage (comportement documenté de la lib, contrairement à l'ancien react-helmet) — la page rendue a donc deux balises <meta name="description"> en double une fois hydratée (vérifié sur /invest). Le <title>, lui, est bien remplacé (balise singleton gérée différemment par Helmet). Comme le static HTML sert le même contenu générique quel que soit le chemin (pas de SSR), l'enjeu réel est faible pour les crawlers modernes qui exécutent le JS, mais ça reste une vraie duplication dans le DOM final.
Correctif supplémentaire (signalé par l'utilisateur via capture d'écran, /producteurs affichait "Producteurs Agricoles Certifiés | Harvests | Harvests" — suffixe en double) : 7 pages (Categories, LoyaltyProgram, Pricing, Producers, Restaurateurs, Transformers, TransporteursExportateurs) passaient un title/description français codés en dur à SEOHead au lieu de le laisser retomber sur useSEO(), rendant TOUT le travail des Jours 37-38 invisible sur ces pages (le title hardcodé contournait complètement routeSEO, d'où le double "| Harvests" : SEOHead ajoute déjà ce suffixe à tout title custom). Retiré les props hardcodées des 7 pages. En creusant, deux bugs de routing distincts dans useSEO.js lui-même : la clé 'transporteurs-exportateurs' ne correspondait à aucune route réelle (le vrai chemin déclaré dans AppRoutes.jsx est '/logistics') — renommée ; et '/producteurs' (alias fr de '/producers', même composant Producers.jsx, les deux routes existent) n'avait pas d'entrée du tout — ajoutée. Reformulé pour être direct : le SEO ne "suivait" que sur Invest et Blog parce que ce sont les deux seules pages qui n'avaient jamais eu ce bug de props hardcodées — pas un souci de traduction, un souci de câblage. Revérifié les 7 pages une par une (onglets isolés) en fr et en : toutes affichent maintenant le bon titre traduit.
Repéré, puis finalement traité tout de suite (l'utilisateur est retombé dessus sur /products avant que ça attende le Jour 39-40) : Products.jsx construisait son title/description dynamiquement selon le filtre actif (catégorie/pays/mis en avant), toujours en français codé en dur, sans passer par useSEO(). Ajouté 5 clés seo.json (products.catalogTitle/catalogDescription/featuredTitle/featuredDescription/byCategoryTitle/byCategoryDescription/byCountryTitle, interpolation {{category}}/{{country}}) et basculé Products.jsx sur useTranslation('seo'). Ça nécessitait des libellés de catégorie traduits (getCategoryLabel dans utils/productHelpers.js ne renvoyait que du français, sans paramètre de langue) — étendu avec un second dictionnaire "en" et un paramètre lang (défaut 'fr' pour ne pas casser ProductFilters.jsx, seul autre appelant, non touché) ; au passage getSortOptions (même fichier, jusque-là non utilisé par Products.jsx qui avait ses propres <option> câblées en dur) a reçu le même traitement pour être prêt le jour où quelqu'un l'utilisera. Reste volontairement en français sur cette page (Jour 40, "listings") : boutons vue grille/liste, libellés de tri du <select> local (différents de getSortOptions, jamais reliés), pagination, messages "aucun résultat" — seuls le <title>, la meta description et le <h1>/<p> du bandeau (qui partagent pageTitle/pageDescription) sont concernés par ce correctif. Vérifié en navigateur : catalogue par défaut et variante par catégorie ("Products: Fruits") corrects en fr et en.
Build complet + lint vérifiés verts, tests visuels en navigateur sur les 7 pages corrigées + Products.jsx (fr + en, onglets isolés).

Jour 39 — Traduction composants Home (à faire)
Le texte des 14 pages vitrine vit surtout dans components/home/* (les fichiers pages/* sont de fines coquilles). Migrer section par section : hero, catégories mises en avant, bandeau producteurs, sections chiffres/témoignages.

Jour 40 — Traduction header, footer & listings (à faire)
Header public, Footer, filtres et cartes produit/producteur (ProductFilters, cartes de listing) — composants partagés vus sur presque toutes les pages publiques, donc rentables à traiter tôt.

Jour 41 — Layouts partagés dashboard (à faire)
ModularDashboardLayout, DashboardSidebarFixed, DashboardTopbar. Une fois traduits, la bascule de langue devient visible immédiatement sur tout le dashboard même si le contenu des pages suit derrière.

Jour 42 — Auth & onboarding (à faire)
Connexion, inscription, vérification d'e-mail, mot de passe oublié, ProfileCompletionModal, EmailVerificationBanner. Premier parcours vécu par tout nouvel utilisateur anglophone : priorité haute.

Jour 43 — Dashboard producteur : produits (à faire)
MyProducts, AddProduct, EditProduct — listing, formulaire d'ajout, formulaire d'édition, y compris messages de validation inline.

Jour 44 — Dashboard producteur : commandes, stats, avis (à faire)
Orders, Stats, ProducerReviews et les widgets du tableau de bord (RecentOrders, ProducerSalesStats, RecentProductsWidget).

Jour 45 — Conseils agricoles (à faire)
CropAdvice.jsx et CropAdviceDetail.jsx : le texte d'interface (labels, boutons) passe par i18next ; cropAdviceData.js lui-même (saisons, conseils, étapes de pousse) reste en français pour l'instant — trop volumineux pour cette passe, à traiter séparément si besoin.

Jour 46 — Dashboard transformateur (à faire)
MyProducts, AddProduct/EditProduct, OrdersList, TransformerReviews, TransformerStats — même famille d'écrans que le producteur, réutiliser les clés communes déjà posées au Jour 43-44.

Jour 47 — Dashboard transporteur (à faire)
Fleet, AddVehicle/EditVehicle, Statistics — vocabulaire spécifique (véhicules, trajets) à ajouter au namespace dédié.

Jour 48 — Dashboard restaurateur (à faire)
OrdersList, DishesManagement, AddDish, AddOrder, SuppliersList, RestaurateurReviews, Stats.

Jour 49 — Dashboard consommateur (à faire)
Cart, Favorites, OrderHistory, Reviews, Statistics, ConsumerDashboard.

Jour 50 — Dashboard exportateur (à faire)
Fleet, Statistics, Orders — même logique que transporteur/producteur, vocabulaire export en plus (douane, incoterms si présents).

Jour 51 — Pages communes (à faire)
ProfilePage, SettingsPage (UniversalProfile/UniversalSettings), NotificationsPage, DocumentsPage, Messages — partagées par tous les rôles, donc à fort effet de levier.

Jour 52 — Revue formulaires & erreurs inline (à faire)
Passe transverse sur tous les dashboards traités jusqu'ici : validations de formulaire, placeholders, messages d'erreur affichés en direct dans l'UI — catégorie de texte historiquement oubliée dans ce genre de migration.

Jour 53 — i18nResponse : module auth (à faire)
Étendre res.success/res.error (backend/middleware/i18nResponse.js) à authController.js, passwordController.js, authMiddleware.js, emailVerificationController.js — module le plus exposé côté utilisateur.

Jour 54 — i18nResponse : produits & commandes (à faire)
Contrôleurs produits et commandes (les plus gros en volume de code parmi les 57 identifiés avec du français en dur).

Jour 55 — i18nResponse : avis, notifications, chat (à faire)
Contrôleurs reviews, notifications, chatBotController (partie réponses HTTP, pas encore le NLP lui-même — voir Jour 61-63).

Jour 56 — i18nResponse : admin (à faire)
Contrôleurs du back-office. Priorité plus basse (voir décision Jour 64 sur le périmètre admin), mais autant le faire dans la foulée si le pattern est déjà rodé.

Jour 57 — Validations Joi/Mongoose bilingues (à faire)
Basculer les messages de validation sur les clés de backend/locales/{fr,en}.json plutôt que sur du texte en dur dans les schémas.

Jour 58 — Cookie de langue lu par le backend (à faire)
Vérifier/corriger que le middleware detectLanguage (backend/config/i18n.js) lit bien le cookie harvests_lang posé au Jour 35, pas seulement l'en-tête Accept-Language.

Jour 59 — E-mails bilingues (1/2) (à faire)
welcome.pug, passwordReset.pug, accountApproval.pug : injecter user.preferredLanguage dans le contexte de rendu, dupliquer le texte en clés fr/en plutôt que forker les gabarits, mettre à jour html(lang=...) dynamiquement.

Jour 60 — E-mails bilingues (2/2) (à faire)
orderConfirmation.pug, incompleteProfile.pug, subscriptionExpired/Expiring.pug, mailing.pug — même traitement.

Jour 61 — Chatbot : intentions FAQ en anglais (à faire)
Ajouter "en" à la config du NlpManager (chatBotController.js, actuellement languages: ["fr"] uniquement) et dupliquer en anglais les addDocument/addAnswer issus de la FAQ.

Jour 62 — Chatbot : salutations & routage (à faire)
Dupliquer les intentions salutations/remerciements/au revoir en anglais, puis router manager.process() sur la langue de la conversation au lieu de "fr" codé en dur.

Jour 63 — Chatbot : ré-entraînement (à faire)
Regénérer model.nlp, vérifier qu'il reste synchronisé entre la racine du repo et backend/model.nlp, tester quelques échanges en anglais de bout en bout.

Jour 64 — PWA & périmètre admin (à faire)
Traduire frontend/public/manifest.json (name, description, shortcuts). Trancher : le back-office (68 fichiers sous pages/admin + components/admin) reste français-only tant que l'équipe interne est francophone — à documenter comme décision assumée, pas comme oubli.

Jour 65 — Lexique de référence (à faire)
Figer le glossaire métier fr/en (producteur→producer, filière→value chain, fiche de culture→crop guide, étape de pousse→growth stage, etc. — liste complète dans le PDF) et le partager avec quiconque traduit ou relit.

Jour 66 — Relecture native (à faire)
Faire relire par un·e anglophone natif·ve l'ensemble des clés en.json (frontend + backend) avant toute mise en prod de la bascule anglaise.

Jour 67 — Tests de bascule (à faire)
Vérifier en anglais les parcours critiques de bout en bout : inscription, paiement, suivi de commande, chat. Consigner les écrans encore en français ici pour rattrapage.

Jour 68 — Lancement : pages publiques (à faire)
Activer le sélecteur de langue d'abord sur les pages vitrine (déjà couvertes Jours 37-40), le reste du site restant en français tant que non traité. Suivre le taux d'usage de la bascule anglais.

Jour 69 — Lancement : extension progressive (à faire)
Étendre au fil de l'eau : dashboards, puis e-mails, puis chatbot, en te basant sur les retours/usages remontés au Jour 68. Bilan de la couverture bilingue atteinte à ce stade.
