--- Plan bascule bilingue FR/EN (fr → fr + en) ---
Détail complet, chiffres d'audit et justifications : docs/Harvests-Bilingue-Roadmap.pdf. Repère jour par jour ci-dessous, à mettre à jour (fait) puis retirer au fur et à mesure comme d'habitude. Numérotation reprise à la suite de Jour 32.

Jour 62 — Validations Joi/Mongoose bilingues (fait)
Basculer les messages de validation sur les clés de backend/locales/{fr,en}.json plutôt que sur du texte en dur dans les schémas.
Fait : 119 nouvelles clés `validation.*` (fr/en) ajoutées, 3 clés génériques existantes réutilisées ; les 180 messages en dur des schémas Mongoose (utilisateurs, produits, commandes, avis, paiements, messages, blog, glossaire, notifications…) sont remplacés par ces clés. `middleware/errorHandler.js` traduit chaque détail de validation dans la langue de la requête, y compris après relais par `AppError.from` (192 relais `new AppError(error.message, …)` migrés pour conserver le type `ValidationError`) ; le pré-validate du blog et l'invalidation regex du glossaire passent aussi par des clés. Aucun schéma Joi n'est utilisé dans le backend : le périmètre est donc uniquement Mongoose. Les messages par défaut de Mongoose (champs `required: true` sans message explicite, `min`/`max` sans message) restent en anglais et pourront être traités avec le reste des validateurs si besoin. Test dédié : `tests/validation-i18n.test.js` (parité fr/en, traduction directe et après relais `AppError.from`).

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
Traduire frontend/public/manifest.json (name, description, shortcuts). Trancher : le back-office (68 fichiers sous pages/admin + components/admin) reste français-only tant que l'équipe interne est francophone — à documenter comme décision assumée, pas comme oubli. **Reporté du Jour 60 (sécurité, à faire avant lancement)** : migrer les documents déjà en ligne, encore publics — `node scripts/migrate-documents-private.js` (simulation, liste les fichiers) puis `--apply` ; base de prod + Cloudinary, à lancer seulement après accord.

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
