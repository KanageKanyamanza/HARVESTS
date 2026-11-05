# 🌐 Décisions de périmètre bilingue (FR/EN)

Ce fichier consigne les arbitrages du plan de bascule bilingue qui ne sont pas
des traductions : ils fixent **ce qui est traduit, ce qui ne l'est pas, et
pourquoi**. Une décision assumée et écrite ici ne doit pas être relue plus tard
comme un oubli.

Sommaire :

- [J69-1 — Manifeste PWA par langue](#j69-1--manifeste-pwa-par-langue)
- [J69-2 — Back-office volontairement français-only](#j69-2--back-office-volontairement-français-only)
- [J70-1 — Lexique de référence figé](#j70-1--lexique-de-référence-figé)
- [J70-2 — Glossaire exécutable dans les deux sens](#j70-2--glossaire-exécutable-dans-les-deux-sens)
- [J70-3 — Format des prix en anglais](#j70-3--format-des-prix-en-anglais)
- [J70-4 — Fidélité : plus de livraison gratuite](#j70-4--fidélité--plus-de-livraison-gratuite)
- [J71-1 — Anglais britannique (en-GB)](#j71-1--anglais-britannique-en-gb)
- [J71-2 — « FCFA » dans tous les textes affichés](#j71-2--fcfa-dans-tous-les-textes-affichés)
- [J71-3 — Ce que l'automatique peut relire, et ce qu'il ne peut pas](#j71-3--ce-que-lautomatique-peut-relire-et-ce-quil-ne-peut-pas)
- [J72-1 — Messages serveur en clés, messages système retraduits](#j72-1--messages-serveur-en-clés-messages-système-retraduits)
- [J72-2 — Snapshots de commande bilingues](#j72-2--snapshots-de-commande-bilingues)
- [J72-3 — Placeholders hors base et orthographe « e-mail »](#j72-3--placeholders-hors-base-et-orthographe-e-mail)

---

## J69-1 — Manifeste PWA par langue

### Décision

Le manifeste de la PWA (nom affiché à l'installation, description, raccourcis)
est **traduit**, via **un fichier par langue** :

| Langue | Fichier | `lang` |
| --- | --- | --- |
| Français (repli) | `frontend/public/manifest.json` | `fr` |
| Anglais | `frontend/public/manifest.en.json` | `en` |

Un manifeste web ne sait pas décrire plusieurs langues dans un seul fichier : la
seule alternative serait un nom bilingue du type « HARVESTS – Plateforme
agricole / Agricultural platform », illisible dans le lanceur d'applications.
Deux fichiers, un par langue, gardent un nom court et naturel dans les deux cas.

### Fonctionnement

- `frontend/index.html` déclare `/manifest.json` (français). C'est cohérent avec
  le reste du site : la bascule anglaise est explicite (Jour 33), le français
  est la langue de repli avant que le JavaScript ne s'exécute.
- `frontend/src/utils/i18n.js` expose `applyManifestLanguage(language)` : au
  démarrage (`detectLanguage()`) et à chaque `changeLanguage()`, le `href` du
  `<link rel="manifest">` est basculé vers le fichier de la langue affichée.
  Le navigateur relit le manifeste dès que ce `href` change ; une PWA déjà
  installée met à jour son nom et sa description au lancement suivant.
- `frontend/public/sw.js` précache les deux manifestes pour que l'installation
  reste possible hors ligne dans les deux langues.
- `frontend/scripts/check-manifest.js`, branché sur `npm run build`, échoue si
  les deux fichiers divergent : champ manquant d'un côté, icône ou raccourci
  différents, `lang` incohérent, texte anglais identique au français ou encore
  accentué (signe d'un texte français laissé en place).

### Règles de maintenance

- Toute modification structurelle (icône, `start_url`, `scope`, `theme_color`,
  catégories, raccourci) se fait **dans les deux fichiers**, sinon le build
  casse — c'est voulu.
- Les textes (`name`, `description`, `shortcuts[].name/short_name/description`)
  doivent rester différents d'une langue à l'autre ; le script le vérifie.
- Le titre iOS (`apple-mobile-web-app-title` dans `index.html`) reste
  « Harvests », un nom de marque identique dans les deux langues.

---

## J69-2 — Back-office volontairement français-only

### Décision

Le back-office d'administration (`frontend/src/pages/admin` +
`frontend/src/components/admin`, 69 fichiers aujourd'hui — 68 au moment de
l'audit de la feuille de route) **reste en français uniquement**. Ce n'est pas
un reste de migration : c'est un périmètre assumé, recommandé par la feuille de
route bilingue.

### Pourquoi

- L'équipe interne qui utilise le back-office est francophone ; traduire ces
  écrans n'apporte aucune valeur aux utilisateurs (producteurs, transformateurs,
  consommateurs, restaurateurs, exportateurs, transporteurs) et représenterait
  plusieurs jours de traduction + relecture native.
- Le back-office est déjà de fait en français : aucun fichier de `pages/admin`
  n'utilise `useTranslation`, et seuls deux composants de `components/admin`
  (`RecentOrders`, `SalesChart`) passent par le namespace `common` pour des
  libellés génériques (dates, totaux).
- Le traduire à moitié serait pire que ne pas le traduire : interfaces mixtes,
  clés `dashboard-admin` à maintenir sans relecteur.

### Ce qui reste bilingue malgré tout

- Les **messages d'erreur et de validation de l'API** sont localisés côté
  serveur (`backend/config/i18n.js`) et suivent la langue de la requête, y
  compris pour un administrateur.
- Les **composants partagés** (barre supérieure de tableau de bord, sélecteur de
  langue, notifications) restent bilingues : un administrateur qui bascule en
  anglais voit ces éléments en anglais, le contenu proprement administratif
  restant en français.
- Les **e-mails** et le **chatbot** sont bilingues (Jours 64-67), quelle que
  soit la personne qui les déclenche depuis l'administration.
- Le **texte des notifications** est choisi à la lecture, dans la langue du
  destinataire (`backend/utils/notificationI18n.js`, Jour 72). Celles destinées
  aux administrateurs restent en français, comme le reste du contenu administratif.

### Quand rouvrir la décision

Uniquement si un membre de l'équipe non francophone rejoint l'administration,
ou si le back-office est ouvert à des partenaires externes. La marche à suivre
est alors :

1. traduire les écrans par le namespace `dashboard-admin` — les fichiers
   `fr/dashboard-admin.json` et `en/dashboard-admin.json` existent déjà et sont
   à parité, mais ne sont encore utilisés nulle part ;
2. remplacer les chaînes en dur par `useTranslation("dashboard-admin")` ;
3. ajouter les fichiers migrés à `frontend/scripts/i18n-migrated-files.js` pour
   que `check-hardcoded-french.js` empêche les régressions ;
4. faire relire l'ensemble par un·e anglophone natif·ve (Jour 71) avant mise en
   production.

Tant que la décision tient, **ne pas** ajouter `pages/admin` ni
`components/admin` à la liste des fichiers migrés : le garde-fou
`check-hardcoded-french.js` échouerait sur des centaines de chaînes françaises
attendues.

---

## J70-1 — Lexique de référence figé

### Décision

Le vocabulaire métier FR/EN est figé dans **`docs/GLOSSAIRE_REFERENCE.md`**, qui
devient la référence pour toute traduction ou relecture. Il reprend la liste de
la feuille de route bilingue (rôles, filière, fiche de culture, étape de pousse,
zone sahélienne) et tranche les cas qu'elle laissait ouverts.

Arbitrages notables :

| Français | Retenu | Pourquoi |
| --- | --- | --- |
| Transformateur | **Processor** | « Transformer » est ambigu (verbe, transformateur électrique) |
| Transporteur | **Carrier** | « Transporter » désigne un engin en anglais ; la feuille de route acceptait les deux, on fixe le plus naturel |
| Restaurateur | **Restaurateur** | Mot anglais existant, déjà employé dans 44 chaînes des pages publiques ; « Restaurant owner » n'était utilisé que dans deux libellés de rôle |

### Garde-fou

`frontend/scripts/check-glossary-terms.js` parcourt les **valeurs** de
`src/locales/en/*.json` (jamais les clés) et échoue si « transformer » ou
« transporter » réapparaît comme nom de rôle. Branché sur `npm run build` et
`npm run lint`, comme les garde-fous des Jours 36 et 69.

### Portée

Les clés techniques (`transformer`, `transporter`, `transformerProfile`,
`becomeTransporter`…) ne changent pas : seules les valeurs affichées suivent le
lexique, pour ne pas casser le routage ni les `userType`.

---

## J70-2 — Glossaire exécutable dans les deux sens

### Décision

Le glossaire du back-office (`/admin/glossary`) porte désormais **les deux
sens**. Le sens EN → FR, vide depuis le Jour 48, est semé avec les équivalents
des produits locaux, et le sens FR → EN reçoit la règle « Gumbo » → « okra ».

### Pourquoi la règle « Gumbo »

Quand la traduction automatique rend « Gumbo » pour « gombo », la règle
`\bgombo\b` ne matche plus : elle s'applique au texte **déjà traduit**. Une
seconde règle `\bgumbo\b` → `okra` rattrape ce cas. Les correspondances exactes
(`gombo` → `Okra`) court-circuitent en plus l'appel au service pour les noms de
produits seuls.

### Mise en œuvre

- `backend/data/translationGlossary.json` est réorganisé par direction
  (`exactTerms["fr-en"|"en-fr"]`, `wordReplacements["fr-en"|"en-fr"]`) ; il reste
  la semence et le repli hors base.
- `backend/scripts/seedTranslationGlossary.js` sème les deux sens en mode
  idempotent (dry-run par défaut, `--execute` pour écrire).
- `backend/tests/translation-glossary.test.js` vérifie les deux sens, l'absence
  de doublon et la validité des motifs, sans connexion réseau ni MongoDB.

---

## J70-3 — Format des prix en anglais

### Décision

| Langue | Format | Exemple |
| --- | --- | --- |
| Français | montant puis devise, milliers séparés par une espace | `3 000 F CFA` |
| Anglais | code devise puis montant, milliers séparés par une virgule | `FCFA 3,000` |

La devise **ne change pas avec la langue** : tous les prix restent en FCFA/XOF.

### Pourquoi

`utils/currencyUtils.formatPrice` forçait `fr-FR` pour tout le site : en anglais,
les montants restaient au format français. La feuille de route laissait le choix
(« FCFA 3,000 » ou équivalent) ; on retient la présentation naturelle en anglais
(code avant le montant, séparateur virgule) sans toucher au français déjà affiché.

### Mise en œuvre

- `frontend/src/utils/priceFormat.js` centralise la règle (langue lue via
  l'instance i18next partagée, donc pas de cycle d'imports).
- `utils/currencyUtils.formatPrice` et `utils/i18n.formatPrice` y délèguent ; les
  formatages locaux des écrans bilingues (catégories, détail de plat, profils
  vendeurs, abonnement du tableau de bord) sont remplacés par cet utilitaire.
- `getLocaleConfig("en").currency` passe de `GHS` (cedi ghanéen, jamais utilisé
  pour un prix réel) à `XOF`.
- Le back-office reste en français (J69-2) et garde donc le format français.

---

## J70-4 — Fidélité : plus de livraison gratuite

### Décision

Les avantages « Livraison gratuite sur commandes > 10,000 XAF » (niveau Silver)
et « Livraison gratuite illimitée » (niveau Gold) sont **retirés** de
`public.json` (clés `loyalty.tiers[*].benefits`), tout comme « Retours
gratuits » (Gold), qui promettait la même logistique gratuite. L'exemple de
bonus Platinum (`loyalty.exampleBonus1`) est remplacé par « Support VIP 24/7 »,
avantage déjà listé pour ce niveau.

### Pourquoi

Depuis la décision du 07/10/2026, **la livraison est facturée par le livreur** :
la plateforme ne peut pas promettre la gratuité, ni à l'aller ni au retour.
Une page publique qui promet un avantage non tenu est un risque commercial et
juridique, pas seulement une incohérence de traduction.

---

## J71-1 — Anglais britannique (en-GB)

### Décision

L'anglais du site suit l'**orthographe et les conventions britanniques** :
`favour`, `colour`, `fertiliser`, `optimise`, `customise`, `analyse`,
`recognise`, `licence` (nom), `programme`, `litre`, `centre`, `labour`,
`behaviour`, `neighbour`.

Conséquence technique : la locale d'affichage de l'anglais passe de `en-US` à
`en-GB` dans `utils/i18n.js`, `utils/priceFormat.js` et les écrans qui
formataient des dates localement. L'anglais affiche donc `29 Sep 2026` et
`08:15` (24 h) au lieu de `Sep 29, 2026` et `08:15 AM`.

### Pourquoi

Le public visé est l'**Afrique de l'Ouest anglophone** — Ghana, Nigeria, Sierra
Leone, Gambie, Liberia — où l'anglais britannique est la norme scolaire et
administrative. C'était aussi la convention majoritaire du corpus déjà traduit
(`colour`, `ploughing`, `optimise`, `licence`, `Favourites`, `recognised`),
mais huit familles de mots mélangeaient les deux orthographes : `favorite` et
`favourite` se côtoyaient dans le même écran.

Le choix est unique et mécanique, donc vérifiable : c'est ce qui a permis de le
confier à un garde-fou plutôt qu'à la vigilance des relecteurs.

### Portée

- 70 valeurs corrigées (locales anglaises + `cropAdviceData.en.js`).
- Les **clés** ne changent pas : `favorites`, `loyaltyProgram`,
  `licenseNumber`, `transformer`… restent telles quelles.
- Exception assumée : `src/config/currencies.js` garde `locale: "en-US"` pour
  le dollar américain — c'est le format d'une devise, pas la langue du site.

---

## J71-2 — « FCFA » dans tous les textes affichés

### Décision

Les textes affichés n'emploient plus les codes `XAF` ni `XOF` : ils écrivent
**`FCFA`**. Corrigé dans les deux langues (26 valeurs).

### Pourquoi

- `XAF` est le **franc CFA d'Afrique centrale** : ce n'est pas la zone du
  Sénégal (XOF), et la page fidélité promettait pourtant « 1 point = 100 XAF ».
  Le montant est identique (parité fixe), mais le code est faux et un lecteur
  averti le remarque.
- `XOF` est un code technique ISO, pas un libellé : il apparaissait tel quel
  dans les filtres de prix (« Minimum price (XOF) »).
- La convention du Jour 70 est déjà `FCFA` pour l'affichage des prix ; laisser
  `XAF`/`XOF` dans les phrases créait deux noms pour la même devise.

Les codes restent évidemment valides **dans le code** (attributs `currency`,
`Intl`, API) : la règle ne concerne que les phrases montrées à l'utilisateur.

---

## J71-3 — Ce que l'automatique peut relire, et ce qu'il ne peut pas

### Décision

Le Jour 71 (relecture native) se décompose en deux :

1. **Pré-relecture automatique** — faite, outillée et rejouable par
   `frontend/scripts/check-i18n-quality.js` (branché sur `npm run build` et
   `npm run lint`) : parité des variables d'interpolation, restes de français,
   orthographe en-GB, devise, typographie.
2. **Relecture par un·e anglophone natif·ve** — **réalisée**, sur la base de
   `docs/I18N_REVIEW_71.md` (périmètre, priorités, grille de signalement,
   critères de sortie). Aucune correction n'est restée ouverte ; les écarts de
   vocabulaire constatés sont tranchés dans `docs/GLOSSAIRE_REFERENCE.md`.

### Pourquoi le dire explicitement

Une IA peut garantir qu'un texte est cohérent, complet et bien orthographié ;
elle ne peut pas garantir qu'il « sonne » anglais. C'est pourquoi les deux
étapes sont distinguées : les garde-fous empêchent la régression au fil des
traductions futures, la relecture native valide le niveau de langue à un
instant donné.

### Conséquence

Le Jour 71 est clos, mais la règle reste : **toute nouvelle chaîne anglaise**
(dashboard, e-mail, contenu produit) passe par `npm run lint` — et par une
relecture native si elle introduit un vocabulaire ou un registre nouveau.

---

## J72-1 — Messages serveur en clés, messages système retraduits

### Décision

Les messages renvoyés par l'API à l'utilisateur sont des **clés de traduction**
(`message.*`, `user.*`, `blog.*`, `exporter.*`), traduites par `req.t` dans la
langue de la requête. Les messages système d'une conversation (création,
arrivée, départ) sont enregistrés dans cette langue, mais accompagnés de
`metadata.systemType` et, quand il y a un nom ou un titre, de
`metadata.name` / `metadata.title`. L'interface les retraduit dans la langue
active ; `content` sert de repli pour les messages anciens ou d'un type inconnu.

### Pourquoi

Un message système est un fait de la conversation, pas un texte libre : le
stocker traduit une fois pour toutes laissait « Conversation démarrée » en
français chez un utilisateur anglais. Les métadonnées permettent de changer de
langue sans migration ni perte d'historique.

### Portée

- Contrôleurs messagerie, profil, blog et exportateur (y compris les réponses
  provisoires `exporter.features.*`).
- Interface : `ChatWindow.jsx` et `ChatList.jsx` (`messaging.userJoined`,
  `userLeft`, `groupConversationCreated`).
- Les messages réellement écrits par un utilisateur ne sont jamais traduits.

---

## J72-2 — Snapshots de commande bilingues

### Décision

`productSnapshot.name` conserve le nom dans ses deux langues (`{ fr, en }`)
et non plus une chaîne figée en français. L'affichage choisit la langue de
l'interface (`parseProductName` côté frontend, `toPlainText` côté backend pour
les e-mails, factures et notifications). Les commandes antérieures, dont le
snapshot est une chaîne simple, restent compatibles.

### Pourquoi

Le client voyait « Millet Couscous » et le vendeur « Couscous de mil » sur la
même commande : le snapshot était aplati en français à la création. Figer une
seule langue dans une donnée partagée par plusieurs interfaces reproduit le
problème à chaque nouvelle langue.

### Portée

- `backend/models/order/orderSchemas.js` (`Mixed`), `orderService.js`.
- `OrderItemsList.jsx`, `OrderConfirmationComponents.jsx`.
- Consommateurs backend (admin, facture, notifications) : aplatissement
  explicite, jamais d'objet affiché tel quel.

---

## J72-3 — Placeholders hors base et orthographe « e-mail »

### Décision

1. Les modèles vendeurs ne stockent plus de texte d'interface : `companyName`,
   `farmName` et `restaurantName` ont pour valeur par défaut une chaîne vide.
   L'ancien placeholder « À compléter » est traité comme vide à l'affichage et
   à l'édition, sans migration de données.
2. En français, le mot s'écrit **« e-mail »** (et « e-mails »), y compris dans
   les phrases où il était écrit « email ». Les variables `{{email}}` et les
   noms de clés (`emailPlaceholder`, `emailRequired`…) ne changent pas.

### Pourquoi

Un placeholder enregistré en base finit par être affiché, exporté ou comparé
comme une donnée réelle (« À compléter » dans un profil, un document ou une
facture). Quant à l'orthographe, deux graphies coexistaient dans la même
interface française (« RENVOYER L'EMAIL » et « RENVOYER L'E-MAIL »).

### Portée

- Modèles `Exporter`, `Transporter`, `Producer`, `Restaurateur`, `Transformer`.
- `ProfilePage.jsx` (`safeDisplay`, préremplissage du formulaire).
- `backend/locales/fr.json`, `frontend/src/locales/fr/*.json`.
