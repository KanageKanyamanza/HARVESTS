# Relecture native de l'anglais — Jour 71

> **Statut : relecture réalisée, Jour 71 clos le 02/11/2026.**
> Ce document reste le mode d'emploi de la relecture : il sert de référence pour
> toute nouvelle chaîne anglaise (dashboard, e-mail, contenu produit), et de
> grille commune si un·e second·e relecteur·rice reprend le sujet.
>
> Le Jour 71 de la feuille de route demandait de faire relire **l'ensemble des
> textes anglais** par un·e anglophone natif·ve avant la mise en production de
> la bascule anglaise. Une IA peut préparer le terrain (cohérence, oublis,
> typographie) ; elle ne peut pas se substituer au jugement d'un locuteur natif
> sur le **naturel** de la langue. Ce document dit exactement ce qui a été
> vérifié automatiquement, ce qui a été corrigé, et ce que la relecture humaine
> doit couvrir.

Sommaire :

- [1. Périmètre à relire](#1-périmètre-à-relire)
- [2. Ce qui est déjà vérifié automatiquement](#2-ce-qui-est-déjà-vérifié-automatiquement)
- [3. Ce qui a été corrigé pendant la pré-relecture](#3-ce-qui-a-été-corrigé-pendant-la-pré-relecture)
- [4. Ce que le natif doit chercher](#4-ce-que-le-natif-doit-chercher)
- [5. Par où commencer (ordre de priorité)](#5-par-où-commencer-ordre-de-priorité)
- [6. Comment signaler une correction](#6-comment-signaler-une-correction)
- [7. Critères de sortie](#7-critères-de-sortie)

---

## 1. Périmètre à relire

**4 810 textes anglais affichés**, répartis ainsi :

| Fichier | Textes | Visibilité |
| --- | ---: | --- |
| `frontend/src/locales/en/public.json` | 1 218 | Pages publiques — **priorité 1** |
| `backend/locales/en.json` | 654 | Erreurs API et e-mails — **priorité 1** |
| `frontend/src/locales/en/common.json` | 613 | Composants partagés |
| `frontend/src/locales/en/dashboard-producer.json` | 328 | Espace producteur |
| `frontend/src/locales/en/dashboard-consumer.json` | 254 | Espace consommateur |
| `frontend/src/locales/en/dashboard-transporter.json` | 254 | Espace transporteur |
| `frontend/src/locales/en/settings.json` | 160 | Paramètres |
| `frontend/src/locales/en/profile.json` | 155 | Profil |
| `frontend/src/locales/en/auth.json` | 150 | Connexion, inscription |
| `frontend/src/locales/en/dashboard-restaurateur.json` | 150 | Espace restaurateur |
| `frontend/src/locales/en/navigation.json` | 110 | Menus, pied de page |
| `frontend/src/locales/en/seo.json` | 76 | Titres et descriptions SEO |
| `frontend/src/locales/en/blog.json` | 57 | Blog |
| `frontend/src/locales/en/dashboard-admin.json` | 56 | Navigation admin (le back-office reste en français, cf. J69-2) |
| `frontend/src/data/cropAdviceData.en.js` | 575 | Fiches de culture — **priorité 1** (contenu agricole) |

**Hors périmètre** (décisions déjà prises, ne pas les remettre en cause) :

- le back-office (`pages/admin`, `components/admin`) reste en français (J69-2) ;
- les **clés** JSON ne se traduisent pas (`transporter`, `transformer`,
  `becomeTransporter`…) : seules les valeurs affichées suivent le lexique ;
- la marque **Harvests** ne se traduit pas ;
- les noms des produits locaux (gombo, niébé, bissap, soumbala, tô) gardent leur
  nom d'origine, avec une glose entre parenthèses (J70).

Le lexique de référence est `docs/GLOSSAIRE_REFERENCE.md` : toute divergence
entre ce document et un texte se tranche **dans le glossaire**, pas au fil du
fichier de traduction.

## 2. Ce qui est déjà vérifié automatiquement

`frontend/scripts/check-i18n-quality.js`, branché sur `npm run build` et
`npm run lint` (échec du build en cas de régression) :

| Contrôle | Ce qu'il détecte |
| --- | --- |
| Interpolation | `{{count}}` présent en français mais absent (ou en trop) en anglais → texte tronqué à l'affichage |
| Restes de français | mots-outils français et accents hors noms propres autorisés |
| Orthographe en-GB | `favor`, `color`, `fertilizer`, `optimize`, `license`, `program`, `liter`… |
| Devise | `XAF` (mauvaise zone CFA) et `XOF` (code technique) dans un texte affiché |
| Typographie | `...` au lieu de `…`, espace avant `:` |

Les garde-fous des jours précédents restent actifs : parité des clés fr/en
(Jour 36), couverture des 575 fiches de culture (Jour 50), manifestes PWA
(Jour 69), termes proscrits du lexique (Jour 70).

**Résultat au moment de la rédaction de ce document : 0 anomalie sur les
4 810 textes.** Ces contrôles garantissent la cohérence, pas la qualité
littéraire : c'est précisément ce que la relecture native doit apporter.

## 3. Ce qui a été corrigé pendant la pré-relecture

| Correction | Volume | Pourquoi |
| --- | ---: | --- |
| Orthographe normalisée en anglais britannique | 70 valeurs | Le corpus mélangeait les deux conventions (`favorite`/`favourite`, `fertilizer`/`fertiliser`, `optimize`/`optimise`, `license`/`licence`, `program`/`programme`, `analyze`/`analyse`, `liter`/`litre`, `recognize`/`recognise`, `unauthorized`/`unauthorised`, `personalized`/`personalised`…). Public visé : Afrique de l'Ouest anglophone. |
| Locale d'affichage `en-US` → `en-GB` | 8 fichiers | Dates et heures cohérentes avec l'orthographe : `29 Sep 2026`, `08:15`. |
| `XAF` / `XOF` → `FCFA` dans les textes | 26 valeurs (13 fr + 13 en) | La page fidélité annonçait des points en `XAF`, le franc CFA d'Afrique **centrale** ; les filtres de prix affichaient le code technique `XOF`. Convention Jour 70 : `FCFA`. |
| `...` → `…` | 85 valeurs anglaises | Les deux formes coexistaient d'un écran à l'autre. |
| `RCCM : `/`NINEA : ` → `RCCM: `/`NINEA: ` | 2 valeurs | Espace avant les deux-points = convention française. |

Aucune de ces corrections ne change le sens d'un texte : elles alignent la
forme. Les tournures elles-mêmes n'ont pas été réécrites.

## 4. Ce que le natif doit chercher

Les points qu'aucun script ne peut juger :

1. **Naturel** — la phrase se lit-elle comme écrite par un anglophone, ou
   comme une traduction ? Repérer les calques du français :
   - `sensitise`, `sensibilise` pour « sensibiliser » ;
   - `accompany` pour « accompagner » (préférer `support`, `help`) ;
   - `realise` / `ensure` employés pour « réaliser » / « assurer » quand le sens
     est `carry out` / `provide` ;
   - `Welcome!` en titre d'écran, tournures nominales longues.
2. **Registre et personne** — l'interface tutoie en français (« votre »
   utilisé, mais ton direct) : l'anglais doit rester direct et sans
   familiarité excessive. Vérifier qu'un même écran ne mélange pas `you` et
   `the user`.
3. **Boutons et libellés courts** — un bouton anglais plus long que le français
   casse la mise en page. Signaler tout libellé qui dépasse visiblement son
   équivalent français.
4. **Terminologie** — le lexique est figé (Producer, Processor, Carrier,
   Restaurateur, Value chain, Crop guide, Growth stage). Signaler toute
   divergence, mais la trancher dans le glossaire.
5. **Contenu agricole** (`cropAdviceData.en.js`) — le vocabulaire technique doit
   être celui d'un agronome anglophone : `rainy season` / `off-season`,
   `earthing up`, `transplanting`, `weeding`, `ridge`, `daba`. Vérifier aussi
   que les noms de ravageurs et maladies sont les noms usuels
   (`late blight`, `blossom-end rot`, `thrips`, `diamondback moth`).
6. **E-mails et erreurs API** (`backend/locales/en.json`) — un message d'erreur
   doit rester compréhensible hors contexte et ne pas exposer de jargon
   interne.
7. **Cohérence des énumérations** — listes d'avantages, FAQ, étapes : même
   construction grammaticale d'un élément à l'autre (tout en verbe, ou tout en
   nom).

## 5. Par où commencer (ordre de priorité)

1. `cropAdviceData.en.js` (575 textes) — contenu agricole, le plus visible pour
   la cible et le plus technique.
2. `public.json` — pages d'accueil, tarifs, fidélité, CGU, FAQ.
3. `backend/locales/en.json` — erreurs et e-mails.
4. `common.json` + `navigation.json` — composants partagés et menus.
5. Les `dashboard-*.json` — un espace à la fois, en s'appuyant sur les écrans
   réels.
6. `seo.json` / `blog.json` — après le reste : ce sont des métadonnées.

Pour relire avec le rendu sous les yeux : `npm run dev` dans `frontend/`, puis
basculer la langue en anglais dans le sélecteur.

## 6. Comment signaler une correction

Une ligne par texte, avec la clé exacte (le chemin dans le JSON) :

```text
Fichier  : frontend/src/locales/en/public.json
Clé      : loyalty.faq[5].answer
Actuel   : "No, the loyalty programme is completely free."
Proposé  : "No — the loyalty programme is completely free."
Raison   : le tiret cadratin rend la réponse plus lisible à l'oral.
```

Règles d'arbitrage :

- une correction de **forme** (orthographe, typographie, longueur) : directement
  dans la PR, sans discussion ;
- une correction de **vocabulaire métier** : d'abord dans
  `docs/GLOSSAIRE_REFERENCE.md`, puis propagée aux fichiers ;
- une correction qui **change le sens** (promesse commerciale, mention légale,
  prix) : à valider par le métier avant merge — cf. J70-4 sur les avantages de
  fidélité.

## 7. Critères de sortie

Le Jour 71 peut être considéré comme terminé quand :

- [x] les 575 textes de `cropAdviceData.en.js` ont été relus ;
- [x] `public.json` et `backend/locales/en.json` ont été relus ;
- [x] les écrans principaux (accueil, catalogue, fiche produit, panier,
      commande, tableaux de bord) ont été parcourus en anglais ;
- [x] aucune correction ne reste ouverte dans la PR ;
- [x] `npm run build` et `npm run lint` passent (garde-fous inclus).

**Jour 71 clos le 02/11/2026.** Pour toute nouvelle chaîne anglaise, reprendre
la grille §4 et relancer `npm run lint` (qui exécute
`check-i18n-quality.js`).
