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
