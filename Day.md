--- Plan bascule bilingue FR/EN (fr → fr + en) ---
Détail complet, chiffres d'audit et justifications : docs/Harvests-Bilingue-Roadmap.pdf. Repère jour par jour ci-dessous, à mettre à jour (fait) puis retirer au fur et à mesure comme d'habitude. Numérotation reprise à la suite de Jour 32.

Jour 59 — i18nResponse : produits & commandes (fait, test navigateur à faire)
Messages serveur produits / producteurs / commandes passés en clés `product.*`, `producer.*`, `order.*`, `upload.*` (fr/en) : services produit (producteur, transformateur, admin, public), services producteur (profil, équipements, cultures, certifications, transporteurs préférés, documents, livraison), contrôleur et services de commandes (accès, transitions de statut, vendeur introuvable, limite hebdomadaire, annulation). `AppError.from(error, statut)` : relaie une erreur de service sans perdre son statut ni ses paramètres ; `isNotFound()` : le 404 reste un 404 que le message soit l'ancien texte ou une clé. **Sécurité, fait** : (1) limite de produits du plan vérifiée côté serveur sur les trois routes de création (`assertProductLimit` dans utils/subscriptionLimits, la route de l'interface producteur ne la vérifiait pas) ; (2) réinitialisation / changement de mot de passe : mêmes jetons que la connexion (access 15 min + refresh 7 j), et un refresh token antérieur au dernier changement de mot de passe ne renouvelle plus la session ; (3) « renvoyer l'e-mail de vérification » : réponse neutre, ne révèle plus si un compte existe ; (4) documents administratifs envoyés en accès `authenticated` (route /upload/documents et stockage documents producteur), lus via `GET /upload/documents/access` (lien de téléchargement signé 5 min, propriétaire ou admin seulement), aperçu et liens « voir le document » adaptés (DocumentUpload, CertificationsSection, CertificationManager), proxy admin et suppression compatibles. Testés par appels Express de bout en bout (limite 403 fr/en, 404, transitions, accès document propriétaire / autre / admin / ancien public / URL invalide). **Test navigateur fait** (fr/en, sélecteur de langue → cookie `harvests_lang` → messages serveur) : connexion ratée, mot de passe oublié, route protégée sans session. **Reste** : envoi puis consultation d'un document protégé avec `producteur.test@` (connexion par l'utilisateur), création de produit au-delà du plan, changement de statut refusé. **Relevé** : lien « Retour » de la page de connexion non traduit ; bouton du sélecteur de langue en `type="submit"` (devrait être `button`) ; la connexion tente d'abord `/admin/auth/login`, encore en français (Jour 61).

Jour 60 — i18nResponse : avis, notifications, chat (à faire)
Contrôleurs reviews, notifications, chatBotController (partie réponses HTTP, pas encore le NLP lui-même — voir Jour 66-68). **Reporté du Jour 59 (sécurité)** : (1) migrer les documents déjà en ligne, toujours publics : `node scripts/migrate-documents-private.js` (simulation, liste les fichiers) puis `--apply` — base de prod + Cloudinary, à lancer seulement après accord ; (2) `POST /upload/image-by-url` (deleteImageByUrl) supprime n'importe quel fichier Cloudinary dont on connaît l'URL, sans vérifier qu'il appartient à l'utilisateur (images produits d'un autre vendeur comprises) ; (3) `protect` et `protectUserOrAdmin` ne vérifient pas le type du jeton : si `JWT_REFRESH_SECRET` n'est pas défini, un refresh token (7 j) est accepté comme jeton d'accès — exiger `decoded.type !== 'refresh'`.

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
Figer le glossaire métier fr/en (producteur→producer, filière→value chain, fiche de culture→crop guide, étape de pousse→growth stage, etc. — liste complète dans le PDF) et le partager avec quiconque traduit ou relit. **Reporté du Jour 48** : le glossaire de traduction (page admin `/admin/glossary`) fonctionne désormais dans les deux sens mais le sens EN → FR est vide — y saisir les équivalents des termes FR → EN (jute mallow → corète potagère, okra → gombo, cowpea → niébé…) ; ajouter aussi en FR → EN une règle « Gumbo » → « okra » (le service traduit parfois « gombo » par « Gumbo », non rattrapé par la règle `\bgombo\b`). Peut être fait avant, dès qu'un vendeur saisit en anglais. **Reporté du Jour 49** : les montants restent au format français en anglais (« 3 000 F CFA ») car `utils/currencyUtils.formatPrice`, commun à tout le site, force `fr-FR` → décider du format des prix en anglais (ex. « FCFA 3,000 ») avec le reste des conventions. **Reporté du Jour 54** : la livraison est facturée par le livreur (décision du 07/10), mais la page Programme de fidélité promet encore « Livraison gratuite » comme avantage de niveau (`public.json`, clés `loyalty.*`) → retirer ou remplacer cet avantage.

Jour 71 — Relecture native (à faire)
Faire relire par un·e anglophone natif·ve l'ensemble des clés en.json (frontend + backend) avant toute mise en prod de la bascule anglaise. Inclure le contenu agricole traduit au Jour 50 (`data/cropAdviceData.en.js`, 575 textes).

Jour 72 — Tests de bascule (à faire)
Vérifier en anglais les parcours critiques de bout en bout : inscription, paiement, suivi de commande, chat. Consigner les écrans encore en français ici pour rattrapage. **Reporté du Jour 49** : les boutons d'action d'une vraie commande (préparer, prête, livrée, réception…) n'ont été vérifiés qu'à l'affichage, avec des données fictives — les cliquer sur une commande de test de bout en bout. **Reporté des Jours 52-53** : rejouer en fr/en avec les comptes `transporteur.test@` et `restaurateur.test@harvests.dev` (mot de passe `DEV_ACCOUNT_PASSWORD` dans `backend/.env`) la flotte (ajout/modification/suppression d'un véhicule « TEST ») et le parcours d'un plat (ajout en anglais, modification en français, vérifier `name.fr`/`name.en` en base, suppression), plus le nouveau design restaurateur et les squelettes de chargement admin. Décider du sort de `restaurateur/AddOrder.jsx` et `SuppliersList.jsx`, reliés à aucune route. **Reporté du Jour 56** : rejouer en fr/en la messagerie (recherche, affichage mobile), les notifications, les documents, le détail de commande et le profil (affichage et modification, pour chaque rôle). **Reporté du Jour 56c** : paramètres en fr/en — adresses de livraison (ajout, modification, suppression, par défaut) avec `consommateur.test@`, préférences de notification (enregistrer puis recharger la page), compte bancaire avec un compte vendeur de test, renvoi de l'e-mail de vérification. **Relevé au Jour 57** : (1) tableau de bord explorateur (`ExplorerDashboardNew` + sections Statistiques / Avis / Favoris) encore en français ; (2) photos et vidéos du formulaire d'avis jamais envoyées : le formulaire transmet des URL `blob:` temporaires (visibles uniquement dans le navigateur de l'auteur) — brancher un vrai upload Cloudinary ou retirer le champ. **Reporté du Jour 57** : formulaire d'avis (note obligatoire, commande associée, dates/montants), liste d'avis (filtres, tri), recherche produits, envoi de la photo de profil (format/taille refusés), alerte « N nouvelle(s) commande(s) » du tableau de bord — en fr et en en. **Reporté du Jour 58** : messages serveur de l'authentification en fr/en — connexion avec mauvais mot de passe, inscription avec un e-mail existant, mot de passe oublié, changement de mot de passe (ancien mot de passe faux), session expirée.

Jour 73 — Lancement : pages publiques (à faire)
Activer le sélecteur de langue d'abord sur les pages vitrine (déjà couvertes Jours 37-40 et 43-44), le reste du site restant en français tant que non traité. Suivre le taux d'usage de la bascule anglais.

Jour 74 — Lancement : extension progressive (à faire)
Étendre au fil de l'eau : dashboards, puis e-mails, puis chatbot, en te basant sur les retours/usages remontés au Jour 73. Bilan de la couverture bilingue atteinte à ce stade.
