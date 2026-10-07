--- Plan bascule bilingue FR/EN (fr → fr + en) ---
Détail complet, chiffres d'audit et justifications : docs/Harvests-Bilingue-Roadmap.pdf. Repère jour par jour ci-dessous, à mettre à jour (fait) puis retirer au fur et à mesure comme d'habitude. Numérotation reprise à la suite de Jour 32.

Jour 54 — Dashboard consommateur (fait, test navigateur à faire)
Namespace `dashboard-consumer` refait (les clés du Jour 34 n'étaient utilisées nulle part) : tableau de bord, panier, favoris, historique, avis, statistiques, et tout le parcours d'achat partagé avec le restaurateur (Checkout + étapes + récapitulatif, confirmation de commande, section PayPal, `orderUIUtils` : statuts et dates traduits). **Données fictives retirées** (affichées en prod aux vrais clients) : 1 250 points par défaut, +8,4 % / +12,5 %, courbe de dépenses janvier-juin inventée, deux faux favoris, note « 4.8 » sur chaque favori, « Bio » par défaut, tendance « +5 % » des stats → tout est branché sur les vraies données (`/consumers/me/stats`, `/spending-analytics`, favoris). **Corrigé côté backend** : les points de fidélité étaient lus dans `loyaltyPoints`/`loyaltyTier` qui n'existent pas (vrais champs : `loyaltyProgram.points/tier`) → toujours 0 point et niveau Bronze, et l'échange de points écrivait dans le vide (stats + service fidélité) ; nombre d'avis donnés ajouté aux stats ; mois des dépenses en ISO triés. **Livraison (décision du 07/10) : facturée par le livreur, pas par Harvests** → prix 2 000 / 5 000 FCFA retirés de l'étape « Mode de livraison », « livraison offerte » remplacé par « frais réglés directement au livreur » (panier, récapitulatif), FAQ publique et FAQ du chatbot corrigées (« gratuite dès 50 000 FCFA » supprimé), motif de l'estimation backend corrigé, plus de ligne « Frais de livraison : 0 » sur la facture PDF. Le serveur n'ajoutait déjà aucun frais au total. **À décider** : la page Programme de fidélité promet « Livraison gratuite » comme avantage de niveau (`public.json`, `loyalty.*`). **Reste** : test navigateur fr/en avec `consommateur.test@harvests.dev` (panier → paiement → confirmation, en paiement à la livraison, commande « TEST J54 » à supprimer ensuite en base).

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
Vérifier en anglais les parcours critiques de bout en bout : inscription, paiement, suivi de commande, chat. Consigner les écrans encore en français ici pour rattrapage. **Reporté du Jour 49** : les boutons d'action d'une vraie commande (préparer, prête, livrée, réception…) n'ont été vérifiés qu'à l'affichage, avec des données fictives — les cliquer sur une commande de test de bout en bout. **Reporté des Jours 52-53** : rejouer en fr/en avec les comptes `transporteur.test@` et `restaurateur.test@harvests.dev` (mot de passe `DEV_ACCOUNT_PASSWORD` dans `backend/.env`) la flotte (ajout/modification/suppression d'un véhicule « TEST ») et le parcours d'un plat (ajout en anglais, modification en français, vérifier `name.fr`/`name.en` en base, suppression), plus le nouveau design restaurateur et les squelettes de chargement admin. Décider du sort de `restaurateur/AddOrder.jsx` et `SuppliersList.jsx`, reliés à aucune route.

Jour 73 — Lancement : pages publiques (à faire)
Activer le sélecteur de langue d'abord sur les pages vitrine (déjà couvertes Jours 37-40 et 43-44), le reste du site restant en français tant que non traité. Suivre le taux d'usage de la bascule anglais.

Jour 74 — Lancement : extension progressive (à faire)
Étendre au fil de l'eau : dashboards, puis e-mails, puis chatbot, en te basant sur les retours/usages remontés au Jour 73. Bilan de la couverture bilingue atteinte à ce stade.
