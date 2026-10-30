# Lexique de référence FR/EN — Harvests

> **Statut : figé le 30 octobre 2026 (Jour 70 du plan bilingue).**
> Toute personne qui traduit, relit ou rédige du contenu anglais sur Harvests
> part de ce document. Un terme absent d'ici se discute avant d'être inventé
> ailleurs : le but est qu'un même mot ait **une seule** traduction dans
> l'interface, les e-mails, le chatbot et les fiches produit.

Sommaire :

- [1. Trois glossaires, un seul vocabulaire](#1-trois-glossaires-un-seul-vocabulaire)
- [2. Rôles utilisateurs](#2-rôles-utilisateurs)
- [3. Vocabulaire métier](#3-vocabulaire-métier)
- [4. Produits et cuisine locaux](#4-produits-et-cuisine-locaux)
- [5. Montants, dates et nombres](#5-montants-dates-et-nombres)
- [6. Ce qui ne se traduit jamais](#6-ce-qui-ne-se-traduit-jamais)
- [7. Gouvernance](#7-gouvernance)

---

## 1. Trois glossaires, un seul vocabulaire

| Où | Quoi | Qui le modifie |
| --- | --- | --- |
| `docs/GLOSSAIRE_REFERENCE.md` (ce fichier) | La **décision** : quel terme anglais est retenu, et pourquoi | Toute l'équipe, par revue de PR |
| Back-office `/admin/glossary` | Le glossaire **exécutable** : les remplacements appliqués par la traduction automatique (`utils/translateText.js`) | Admin, sans déploiement |
| `backend/data/translationGlossary.json` | La **semence** et le repli hors base des mêmes entrées | Développeur, avec le code |

Les trois doivent rester alignés : un terme figé ici qui n'est pas dans le
back-office ne corrige aucune traduction, et une entrée du back-office absente
d'ici sera re-questionnée à la prochaine relecture.

## 2. Rôles utilisateurs

Ces termes désignent les types de comptes (`userType`) et apparaissent dans les
badges, les filtres catalogue, les tableaux de bord et les e-mails.

| Français | English | Remarque |
| --- | --- | --- |
| Producteur | **Producer** | Rôle, tableaux de bord, filtres catalogue |
| Transformateur | **Processor** | Ne jamais écrire « Transformer » : homonyme du verbe et du transformateur électrique. Vérifié par `frontend/scripts/check-glossary-terms.js` |
| Transporteur | **Carrier** | Ne jamais écrire « Transporter » : en anglais, un *transporter* est un engin de transport. Vérifié par le même script |
| Restaurateur | **Restaurateur** | Mot anglais existant (personne qui tient un restaurant), déjà employé partout dans les pages publiques. On ne le remplace pas par « Restaurant owner » |
| Consommateur | **Consumer** | — |
| Exportateur | **Exporter** | — |
| Explorateur | **Explorer** | Rôle de découverte du catalogue |
| Administrateur | **Administrator** | Le back-office reste en français (cf. décision J69-2) |

Les clés techniques (`transporter`, `transformer`, `restaurateur`…) ne changent
**jamais** : seules les valeurs affichées suivent ce tableau.

## 3. Vocabulaire métier

| Français | English | Contexte |
| --- | --- | --- |
| Filière | **Value chain** | Pages investisseurs, contenu institutionnel |
| Fiche de culture | **Crop guide** | Module de conseils agricoles (`cropAdviceData.js`) |
| Étape de pousse | **Growth stage** | Les 4 étapes illustrées par culture (semis / croissance / floraison / récolte) |
| Zone sahélienne | **Sahel zone** | Bandeau contextuel des fiches de culture |
| Récolte | **Harvest** | Nom commun ; la marque « Harvests » ne se traduit pas (voir §6) |
| Producteur (dans une commande) | **Seller** | Uniquement quand le contexte est commercial (« your seller has shipped… ») |
| Commande | **Order** | — |
| Livraison | **Delivery** | La livraison est facturée par le livreur (décision du 07/10/2026) |
| Livreur | **Delivery driver** | La personne qui livre ; le rôle de compte reste *Carrier* |
| Point de retrait | **Pickup point** | — |
| Vente flash | **Flash sale** | — |

## 4. Produits et cuisine locaux

Ces termes sont gérés par le glossaire exécutable : ils court-circuitent la
traduction automatique (correspondance exacte) ou corrigent son résultat
(remplacement). Les deux sens sont désormais renseignés (Jour 70) — avant, le
sens EN → FR était vide.

| Français | English | Type d'entrée |
| --- | --- | --- |
| Corète potagère / corète | Jute mallow | exact + remplacement (`\bcorte\b`, `\bcorète\b`) |
| Gombo | Okra | exact + remplacement (`\bgombo\b`, et `\bgumbo\b` → `okra` car la MT rend parfois « Gumbo ») |
| Niébé | Cowpea | exact + remplacement (`\bni[ée]b[ée]\b`) |
| Bissap | Bissap (hibiscus) | exact + remplacement |
| Soumbala | Soumbala (fermented locust bean) | exact + remplacement |
| Tô | Tô (corn or millet porridge) | exact + remplacement (`\btoe\b`) |

Règle d'écriture : un produit local garde son nom d'origine, avec une glose
entre parenthèses à la première occurrence si le lecteur anglophone risque de ne
pas le connaître — `Soumbala (fermented locust bean)`, pas `locust bean seasoning`.

## 5. Montants, dates et nombres

| Élément | Français | English |
| --- | --- | --- |
| Prix | `3 000 F CFA` | `FCFA 3,000` |
| Nombre | `3 000` (espace) | `3,000` (virgule) |
| Date | `29/09/2026` | `Sep 29, 2026` |
| Heure | `08:15` | `08:15 AM` |

- La devise **ne dépend pas de la langue** : tous les prix sont libellés en
  FCFA/XOF, y compris en anglais. Avant le Jour 70, l'anglais retombait sur le
  cedi ghanéen dans certains utilitaires.
- Implémentation unique : `frontend/src/utils/priceFormat.js`, réutilisée par
  `utils/currencyUtils.js` (tout le site) et `utils/i18n.js`. Ne pas réécrire un
  `Intl.NumberFormat("fr-FR", …)` local dans un écran bilingue.
- Le back-office reste en français : ses montants peuvent garder le format
  français.

## 6. Ce qui ne se traduit jamais

- **Harvests** : nom de la marque, identique dans les deux langues (y compris
  dans le manifeste PWA et le titre iOS).
- Les **noms de produits locaux** notés au §4 (ils peuvent être glosés, pas
  remplacés).
- Les **codes** : `XOF`, `FCFA`, `userType`, les URL et les identifiants.
- Les **noms de pays** restent affichés dans la langue de l'interface
  (`Sénégal` / `Senegal`), via `utils/countryMapper.js` et les locales.

## 7. Gouvernance

1. **Nouveau terme métier** : l'ajouter d'abord ici (une ligne, avec le
   contexte), puis dans `/admin/glossary` si la traduction automatique doit le
   corriger, puis dans `backend/data/translationGlossary.json` pour que la
   semence et le repli hors base restent à jour.
2. **Terme proscrit** : l'ajouter à `frontend/scripts/check-glossary-terms.js`
   (tableau `FORBIDDEN`) pour que le build échoue si une traduction le
   réintroduit.
3. **Relecture native (Jour 71)** : toute divergence constatée entre ce document
   et un texte anglais se tranche ici, pas dans le fichier de traduction.
4. **Sens de traduction** : chaque entrée du back-office porte une direction
   (`fr-en` ou `en-fr`). Ne pas déduire l'un de l'autre — plusieurs termes
   français peuvent donner le même terme anglais, et un remplacement porte sur
   le texte déjà traduit.
