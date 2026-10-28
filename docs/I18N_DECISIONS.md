# 🌐 Décisions de périmètre bilingue (FR/EN)

Ce fichier consigne les arbitrages du plan de bascule bilingue qui ne sont pas
des traductions : ils fixent **ce qui est traduit, ce qui ne l'est pas, et
pourquoi**. Une décision assumée et écrite ici ne doit pas être relue plus tard
comme un oubli.

Sommaire :

- [J69-1 — Manifeste PWA par langue](#j69-1--manifeste-pwa-par-langue)
- [J69-2 — Back-office volontairement français-only](#j69-2--back-office-volontairement-français-only)

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
