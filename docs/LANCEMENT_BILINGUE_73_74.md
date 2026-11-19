# 🌍 Lancement bilingue — Jours 73 et 74 (archivé)

> Journal des 05-06/11/2026, retiré de `Day.md` à la clôture des Jours 73-74.
> Décisions associées : `docs/I18N_DECISIONS.md` (J69-1 à J72-3, inchangées).

## Jour 73 — Lancement : pages publiques

**Le sélecteur de langue était déjà en place sur la vitrine** : l'en-tête
(`Header.jsx`) et le pied de page (`Footer.jsx`) l'exposent depuis les
Jours 37-44 sur les pages publiques traitées (accueil, catalogue,
catégories, producteurs, transformateurs, tarifs, fidélité, investir,
fiche de culture…). Le travail du jour a donc porté sur la mesure demandée
par la feuille de route : **suivre le taux d'usage de la bascule anglaise**.

- **Modèle `LanguageSwitch`** (un événement par bascule cliquée) : langues
  `from` → `to`, endroit de l'interface (`context`), chemin de la page
  (`path`), et identifiant **anonyme** du navigateur (`visitorId` —
  localStorage `harvests_visitor_id`). Aucune IP, aucun compte : les
  visiteurs non connectés doivent aussi être comptés.
- **Route publique `GET /api/v1/language-usage`** (montée dans `app.js`,
  contrôleur `languageUsageController.js`) : GET porteuse, comme
  `/health?lang=` (Jour 63) et la route d'ouverture d'info-lettre
  (`/newsletter/track/:id/:subscriberId`). Validation stricte :
  seules `fr`/`en` sont admises, `from === to` n'est pas une bascule (400,
  message `errors.bad_request` — aucune clé de locale ajoutée, la parité
  896/896 des locales backend est intacte), les valeurs trop longues sont
  tronquées sans erreur et le refus sans `visitor` protège l'agrégat
  « visiteurs distincts ».
- **Enregistrement côté front** (`utils/languageUsage.js`, appelé par
  `changeLanguage`) : fire-and-forget, `keepalive` (la bascule peut
  précéder une navigation immédiate), sans jeton ni intercepteur HTTP —
  le suivi ne doit jamais gêner la bascule ni déclencher le
  rafraîchissement de session.
- **`changeLanguage(lang, { context })`** relève la langue affichée avant
  le clic et transmet l'endroit de l'interface. Seule une action
  utilisateur déclenche l'enregistrement : `changeLanguage` n'étant
  appelée que par les sélecteurs, le démarrage de la page (langue déjà
  enregistrée en localStorage) n'est jamais compté comme une bascule.
- **Contextes relevés** : `header` (`Header.jsx`), `footer` (`Footer.jsx`),
  `topbar` (`DashboardTopbar.jsx`), `auth` (`AuthLayout.jsx`). Ils diront
  quels sélecteurs portent réellement la bascule — et si un sélecteur
  doublon n'est jamais cliqué.
- **Vérifié de bout en bout en local** (serveur dev + MongoDB réel, script
  rejouable `backend/scripts/verify-language-usage.js`) :
  une bascule `fr → en` écrit **un** document avec son contexte, son
  chemin et l'identifiant du visiteur ; une non-bascule (`from === to`)
  est rejetée en 400 ; `GET /admin/analytics` reste protégé (401 sans
  jeton) ; les données de test sont supprimées à la fin du script.

## Jour 74 — Lancement : extension progressive

**L'extension « dashboards, puis e-mails, puis chatbot » était déjà
couverte** par les jours précédents — vérifiée à nouveau :

- **Tableaux de bord** : `DashboardTopbar` (rendu par
  `ModularDashboardLayout`) porte le sélecteur dans tous les espaces de
  rôle (producteur, consommateur, restaurateur, transporteur,
  transformateur/exportateur) — le contexte `topbar` les distingue des
  pages publiques dans les statistiques.
- **E-mails** : bilingues, envoyés dans la langue du compte depuis les
  Jours 64-65 (gabarits côté `backend/utils/email/`).
- **Chatbot** : bilinguisme et routage par langue des Jours 66-68, modèle
  NLP régénéré fr/en ; une FAQ traduite est obligatoire avant l'anglais.

Fait au jour :

- **Carte « Bascule FR/EN »** sur la page admin
  Analytiques (`AdminAnalytics.jsx`, alimentée par la
  section `languageUsage` de `GET /api/v1/admin/analytics`, agrégats dans
  `adminAnalyticsController.getLanguageUsage`, logique pure testée
  séparément dans `buildLanguageUsageOverview`) : bascules sur la période, part anglaise,
  allers et retours, visiteurs distincts, sélecteurs employés. Le
  back-office reste en français (J69-2) : libellés français assumés. La
  section suit le même `timeRange` que le reste de la page.
- **Agrégats vérifiés** avec des événements de test (script ci-dessus,
  données supprimées) : 4 bascules dont 3 vers l'anglais donnent bien
  `englishShare: 75` et `distinctVisitors: 2`, et la ventilation par
  contexte (`header`, `footer`, `test`) est correcte.

---

## Bilan de la couverture bilingue (clôture Jour 74)

État du bilinguisme au 06/11/2026 (volumes anglais comptés à la relecture
native, cf. `docs/I18N_REVIEW_71.md`) :

| Domaine | Couverture | Références |
| --- | --- | --- |
| Pages publiques (vitrine) | **Complète** — 1 218 textes anglais + SEO (76) | Jours 37-44, `public.json`, `seo.json` |
| Fiches de culture | **Complète** — 575 textes relus | Jour 50, `cropAdviceData.en.js` |
| Composants partagés | **Complète** — common (613) + navigation (110) | `common.json`, `navigation.json` |
| Tableaux de bord par rôle | **Complète** — producer (328), consumer (254), transporter (254), restaurateur (150) | Jours 41-62, `dashboard-*.json` |
| Connexion / inscription | **Complète** — 150 textes | `auth.json` |
| Paramètres / profil | **Complète** — 160 + 155 textes | `settings.json`, `profile.json` |
| Blog | **Complète** — 57 textes + tracking des visites | `blog.json`, `BlogVisit` |
| Erreurs API | **Localisées** côté serveur, dans la langue de la requête | `backend/locales/{fr,en}.json` (896 clés de chaque côté) |
| E-mails | **Bilingues**, langue du compte, gabarits partagés | Jours 64-65 |
| Chatbot | **Bilingue**, routage par langue, FAQ EN conditionnée | Jours 66-68, `model.nlp` |
| Notifications | **Traduites à la lecture**, langue du destinataire, montants en FCFA | Jour 72, `backend/utils/notificationI18n.js` |
| Contenu des données | **Bilingue** sur les champs marchands (`name`/`description` `{fr, en}`) : produits, plats, snapshots de commande (J72-2), messages système retraduits (J72-1) | `utils/bilingualField.js` |
| PWA (nom de l'application installée) | **Bilingue** — un manifeste par langue | Jour 69, `manifest(.en).json` |
| Back-office admin | **Français, décision assumée** (J69-2) — composants partagés et la carte « Bascule FR/EN » restent bilingues ; e-mails et chatbot bilingues même déclenchés depuis l'admin | `docs/I18N_DECISIONS.md` |

Suivi d'usage désormais en place (Jour 73) : part des bascules vers
l'anglais, visiteurs distincts, sélecteurs et pages employés, à lire dans
la carte « Bascule FR/EN » de la page admin Analytiques. Ses conclusions
piloteront la priorisation des prochains travaux de traduction et
pourraient rouvrir la relecture native sur les écrans les plus basculés
(Jour 71-3).

**Écarts connus laissés ouverts** (vus et arbitrés, pas des oublis) :

- Un produit sans traduction anglaise garde son nom français à l'affichage
  anglais (repli sans erreur, cf. point (g) de `docs/RECETTE_72.md`) : la
  parité suit la saisie des vendeurs, la plateforme ne peut pas inventer
  des noms. Les nouveaux champs bilingues (`-alt`) le rendent plus rare au
  fil des publications.
- La relecture native (Jour 71) couvre l'état au 02/11 : toute nouvelle
  chaîne anglaise repasse par la grille §4 de `docs/I18N_REVIEW_71.md`,
  en s'appuyant sur les écrans réellement basculés par les usages.

## Validation (clôture Jour 74)

- `npm run lint` (frontend) : 0 erreur (27 avertissements `react-hooks` préexistants) ; `check-hardcoded-french`, `check-glossary-terms` et `check-i18n-quality` : OK.
- `npm run build` (frontend) : OK, contrôles I18n inclus.
- `npm run test` (backend) : **11 suites, 119 tests**, dont les 10 nouveaux de `tests/language-usage.test.js` (sans MongoDB).
- Vérification de bout en bout en local : `node scripts/verify-language-usage.js http://localhost:5000` — enregistrement, agrégats (75 % d'anglais sur le jeu de test), protection admin et nettoyage des données de test.
- **Écueil corrigé au passage** : un `module.exports = {…}` dans
  `languageUsageController.js` écrasait l'export du contrôleur déjà posé
  via `exports.` — le serveur refusait de démarrer
  (« Route.get() requires a callback function »). Les exports de test
  sont ajoutés sur l'objet `module.exports`, jamais réécrasés.
