--- Plan bascule bilingue FR/EN (fr → fr + en) ---
Détail complet, chiffres d'audit et justifications : docs/Harvests-Bilingue-Roadmap.pdf. Repère jour par jour ci-dessous, à mettre à jour (fait) puis retirer au fur et à mesure comme d'habitude. Numérotation reprise à la suite de Jour 32.

Jour 47 — Auth & onboarding (fait)
Connexion, inscription, mot de passe oublié, réinitialisation, vérification d'e-mail (page + modale), EmailVerificationBanner, EmailVerificationRequired, ProfileCompletionModal, plus les composants du formulaire d'inscription (UserTypeSelector, NameFields, FormField) : 12 fichiers migrés vers i18next et ajoutés à `scripts/i18n-migrated-files.js`. Le namespace `auth` n'était utilisé nulle part (squelette de clés génériques type « ambidextrousMode ») : réécrit entièrement et structuré par écran (`common`, `validation`, `login`, `register`, `userTypes`, `forgotPassword`, `resetPassword`, `emailVerification`, `verificationModal`, `verificationBanner`, `verificationRequired`, `profileCompletion`). Les erreurs de validation (Login/ForgotPassword/ResetPassword et `utils/registerValidation.js`) sont désormais stockées comme **clés** et traduites à l'affichage, idem pour le message d'état de la page EmailVerification : un changement de langue les retraduit au lieu de les laisser dans l'ancienne. Texte avec gras ou liens (CGU, « lien envoyé à <email> », bannière, +300 %) via `<Trans>` avec balises nommées, comme sur Producers. Libellés anglais des profils alignés sur l'existant (Transformer, Restaurateur) en attendant le lexique du Jour 70. **Bug corrigé** : `preferredLanguage` était figé à `'fr'` à l'inscription → désormais la langue active de l'UI au moment de l'envoi (sinon un anglophone recevrait ses e-mails en français aux Jours 64-65). Au passage : `aria-label` sur les boutons afficher/masquer le mot de passe et fermer, suppression d'un bloc JSX commenté mort dans EmailVerificationModal. Vérifié : parité fr/en, check hardcoded-french (81 fichiers), eslint, `npm run build`, script ad hoc (147 clés utilisées présentes en fr et en), et dans le navigateur en anglais : Login, Register (menu des profils, placeholder par type, erreurs, liens CGU), ForgotPassword, ResetPassword, EmailVerification (lien invalide / vérifié).
**Laissé en l'état, à reprendre** : (1) messages d'erreur du backend affichés bruts (toujours en français) jusqu'au Jour 58 ; deux détections s'appuient encore sur du texte français du backend — `Login.jsx` cherche « vérifier » (branche de toute façon plus déclenchée, le backend ne bloque plus la connexion d'un e-mail non vérifié) et `useRegisterSubmission.js` cherche « existe déjà » → à remplacer par un code d'erreur au Jour 58. (2) Les valeurs `'À compléter'` envoyées à l'inscription ne sont pas traduites : c'est un marqueur lu par `backend/middleware/profileCheck.js` ; à masquer à l'affichage sur les pages profil (Jour 56). (3) Bannière, modales et ProfileCompletionModal pas vues dans le navigateur (il faut un compte connecté / le backend) — vérifiées par les contrôles statiques seulement.

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
