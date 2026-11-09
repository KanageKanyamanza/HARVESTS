--- Plan bascule bilingue FR/EN (fr → fr + en) ---
Détail complet, chiffres d'audit et justifications : docs/Harvests-Bilingue-Roadmap.pdf. Les Jours 33 à 74 sont clos et archivés au fil de l'eau (Jours 72-74 : docs/RECETTE_72.md et docs/LANCEMENT_BILINGUE_73_74.md) ; les journaux correspondants ont été retirés de Day.md comme d'habitude.

--- Plan paiement mobile money AfriBaPay : payin client + payout vendeurs (prioritaire) ---
Intégrée d'après le fonctionnement éprouvé dans AfricaSend (payin : `backend/controllers/transaction/transaction.afribapay.js` ; payout : `backend/controllers/transaction/transaction.payout.js` ; helpers `backend/utils/afribapay*.js`). Payin quand un client paie sa commande, payout quand on paie un vendeur (producteur, restaurateur et autres) établi dans un pays couvert par AfriBaPay — le Sénégal l'est (Orange, Wave, Free…), le pays du vendeur étant piloté par son code. Le règlement `cash` à la livraison reste disponible. **Ce bloc s'exécute en premier, avant le plan d'approvisionnement B2B ci-dessous.** Par convention, sa numérotation occupe les Jours 75 à 86 et le plan B2B est décalé de +12 (anciens Jours 75-100 → 87-112 ; le PDF `docs/HARVESTS_Integration_Prototype_Alpha.pdf` référence l'ancienne numérotation).



Jour 77 — Webhook payin signé et anti-replay (à faire)
Route webhook en raw body pour vérifier l'en-tête `Afribapay-Sign` (HMAC-SHA256 hexadécimal du corps brut avec `AFRIBAPAY_API_KEY`), comme dans AfricaSend. Événements idempotents grâce à un claim écrit (ingestion atomique, jamais traitée deux fois), contrôle de cohérence montant/devise (`payinMismatch`) contre la commande, statuts confirmés jamais rétrogradés. Alerte admin sur signature invalide ou notification concernant un payin inconnu.

Jour 78 — Vérification `/status` et réconciliation (à faire)
`GET /status?order_id=` seule source de vérité : polling des payins restés `pending` (worker planifié avec verrou d'idempotence et journal d'exécution, comme pour les occurrences B2B), resynchronisation des statuts divergents, relance `R<orderId>-p2` sur échec réseau, annulation automatique au-delà du délai imparti pour libérer la commande.

Jour 79 — Parcours client : choix opérateur et suivi du paiement (à faire)
À la caisse, méthode « Mobile Money » : liste des opérateurs du pays, saisie du numéro, page d'attente avec repoll du statut, redirection vers `return_url` après succès et `cancel_url` après abandon. Textes et erreurs dans le namespace `payment` fr + en (parité contrôlée par `check-i18n-parity`).

Jour 80 — Payout : modèle Payout et vendeurs payables (à faire)
Modèle `Payout` (vendeur, type producteur/restaurateur/autre, commande ou lot de commandes, montant dû calculé au taux de commission en vigueur, opérateur, numéro, pays, statut, tentatives, frais) et service qui liste les vendeurs payables : commandes livrées dont l'encaissement est acté (payin confirmé ou règlement de la livraison). Le pays du payout vient du code du vendeur ; AfriBaPay ne paie que des numéros dans les pays couverts.

Jour 81 — Exécution du payout et statuts ambigus (à faire)
`POST` sur l'URL payout dédiée avec `order_id` unique par tentative (`payout-<id>`, relance `payout-<id>-r2`), vérification du float `/balance` par pays (service=payout) avant envoi, verrou atomique type `claimTransactionForPayout` pour ne jamais partir deux fois. Distinguer `payout_ambiguous` (enquête via `/status` et webhook, alerte admin, pas de relance automatique) de `payout_network_issue` (relance auto), rejet clair d'opérateur traité comme définitif.

Jour 82 — Webhook payout, alertes admin et audit (à faire)
Webhook payout vérifié par signature ou secret d'URL, mise à jour idempotente du `Payout`, notification au vendeur au moment où la paie tombe, alerte admin sur échec définitif ou statut ambigu, journal d'audit des envois et des relances manuelles.

Jour 83 — Refunds client (à faire)
Remboursement d'une commande réglée en mobile money en cas d'annulation ou d'écart : `order_id` `refund-<paymentId>[-rN]`, lancé depuis le back-office sur les mêmes modèles, webhooks et réconciliation que le payout, statuts confirmés jamais écrasés.

Jour 84 — Frais réels AfriBaPay (à faire)
Capturer les coûts à chaque transaction (`extractAfribapayCosts` : fees, taxes, fees_taxes_ttc) sur le Payment et le Payout ; les exposer dans le back-office pour suivre le coût réel d'encaissement et de reversement, et documenter au journal qui supporte les frais (client, vendeur, marge).

Jour 85 — Back-office paiements et payouts (à faire)
Page admin listant payins, payouts et refunds avec statuts, tentatives, coûts réels et soldes de float par pays, actions de relance manuelles protégées (relance possible hors verrous), tableau « Mobile money » dans `AdminAnalytics` (volume, taux de succès, délais). L'interface admin reste en français (décision J69-2).

Jour 86 — Tests, sandbox et recette bout en bout (à faire)
Tests unitaires : signature (corps brut altéré = rejet), anti-replay, `payinMismatch`, formatage téléphone, codes opérateurs. Simulations sandbox : payin avec webhook rejouable, payout y compris statuts ambigus, refund ; script `backend/scripts/verify-afribapay.js` réexécutable. Recette manuelle : commande mobile_money → payin confirmé par webhook → livraison → payout vendeur, plus les cas annulation/écart → refund. Journal + archivage du bloc à son terme.

--- Plan d'intégration de l'offre d'approvisionnement professionnel (prototype alpha) ---
Analyse du prototype https://harvests-alpha.vercel.app et note de décision chiffrée : docs/HARVESTS_Integration_Prototype_Alpha.pdf. Numérotation reprise à la suite du Jour 86 du bloc AfriBaPay (les anciens Jours 75-100 ont été décalés de +12 ; le PDF référence l'ancienne numérotation). Deux scénarios : **rapide** (12 jours — 87, 88, 89, 90, 93, 94, 95, 96, 97, 100, 107, 109) pour une démonstration commerciale ; **complet** (26 jours — 87 à 112) pour une version facturable. Les jours marqués « complet » seul se sautent dans le scénario rapide ; la numérotation n'est pas compressée pour autant.

Jour 87 — Dette bloquante avant le B2B (à faire · rapide + complet)
Déclarer `Order.deliveryFee` dans `orderSchemas.js` : il est utilisé par `orderMiddleware.js` pour calculer le total sans être déclaré, ce qui peut produire un montant incohérent. Corriger `Transporter.updatePerformanceStats`, qui appelle `mongoose.model("Delivery")`, modèle inexistant. Réparer ou retirer `services/consumer/consumerSubscriptionService.js`, qui interroge `Subscription` avec des champs (`consumer`, `producer`, `frequency`) et un statut `paused` absents du schéma. Mettre à jour `docs/FRONTEND_LARGE_FILES.md`, qui cite encore `AddOrder.jsx` et `SuppliersList.jsx`, supprimés au commit `55b73a4`.

Jour 88 — Organisation et établissements (à faire · rapide + complet)
Créer les modèles `Organization` (titulaire, raison sociale, NINEA facultatif, conditions de paiement) et `Establishment` (nom, type d'activité, adresse, zone de livraison, contacts, facturation séparée), reliés à `User`. Le `User` reste le compte de connexion ; l'établissement devient le périmètre des commandes, des adresses et des factures. Aucune notion de site multiple n'existe aujourd'hui dans `Restaurateur.js`.

Jour 89 — Membres, droits et sélecteur d'établissement (à faire · rapide + complet)
Modèle `Membership` avec rôles `owner` / `orders` / `invoices` / `read`, middlewares d'autorisation par établissement, en-tête `X-Establishment-Id` côté API, sélecteur dans la navigation et mémorisation du choix. Réutiliser `User.subscriptionFeatures.b2bAccess`, qui existe déjà mais n'est appliqué nulle part, comme garde-fou d'accès à l'offre B2B.

Jour 90 — Produit B2B : unité de vente, minimum, provenance (à faire · rapide + complet)
Étendre `Product` : unité de vente normalisée (`kg`, `botte`, `cagette`, `pièce`) avec facteur de conversion, réactivation de `minimumOrderQuantity` (présent mais neutralisé), provenance structurée (zone, localité, distance) au lieu du seul lien `producer`. Reprendre l'affichage du prototype : prix à l'unité de vente et minimum indiqué sur la fiche.

Jour 91 — Calendrier saisonnier : modèle (à faire · complet)
Créer `Seasonality` (produit, mois de disponibilité, état `pleine saison` / `toute l'année` / `fin de saison` / `hors saison`) et la table de substitutions (produit proposé, écart de prix). Aucun champ saisonnier n'existe dans `product/` : tout est à créer.

Jour 92 — Saisonnalité : saisie et affichage (à faire · complet)
Écran vendeur/admin pour déclarer les saisons et les substitutions ; calendrier sur la fiche produit et badge de disponibilité dans le marché. Prévoir l'alerte de fin de saison qui déclenche la proposition de substitution.

Jour 93 — Programme d'approvisionnement : modèles (à faire · rapide + complet)
Créer `SupplyProgram` (établissement, nom, rythme, jours, créneau, adresse, statut `active` / `paused` / `cancelled`), `SupplyProgramLine` (produit, quantité, unité, prix de référence) et `DeliveryOccurrence` (date, statut, contenu figé au cut-off, clé d'idempotence programme + date). Ne pas réutiliser `Subscription` : c'est un abonnement SaaS vendeur, sans lien avec l'approvisionnement.

Jour 94 — Heure limite, génération et rappels (à faire · rapide + complet)
Générer les occurrences à partir des programmes (rythme + jours), geler le contenu à 18h00 la veille, envoyer un rappel à 16h00. Le dépôt n'a aucun ordonnanceur : ajouter un worker planifié (script `node` + cron système ou tâche hébergée) avec verrou d'idempotence et journal d'exécution.

Jour 95 — Écran « Mon programme » : création (à faire · rapide + complet)
Créer un programme depuis un modèle ou depuis le marché : produits, quantités, rythme, créneau, adresse. Afficher le prix indicatif par livraison et la prochaine date. Route `/restaurateur/programmes/nouveau`, service et namespace de traduction dédiés.

Jour 96 — Écran « Mon programme » : ajustement (à faire · rapide + complet)
Modifier les quantités d'une occurrence, sauter une livraison, mettre le programme en pause, consulter l'historique. Bloquer les modifications après le cut-off avec un message explicite. C'est le geste central du prototype : il doit tenir en une action.

Jour 97 — Marché professionnel : parcours d'achat (à faire · rapide + complet)
Page `/restaurateur/marche` : filtres catégorie / disponibilité / provenance, fiche produit avec minimum de commande et prix à l'unité de vente, ajout au programme en un geste. Réutiliser `restaurateurController.discoverSuppliers` (déjà implémenté) plutôt que recréer un annuaire.

Jour 98 — Marché professionnel : saisonnalité et substitutions (à faire · complet)
Afficher l'état de disponibilité, le calendrier et la substitution proposée dans le marché et dans le programme. Permettre d'accepter, refuser ou remplacer une substitution depuis la ligne concernée.

Jour 99 — Créneaux de livraison et capacité (à faire · complet)
Créer `DeliverySlot` (date, plage 5h–8h / 8h–11h, zone, capacité en commandes et en poids, statut `open` / `full` / `closed`), réserver le créneau à la création de l'occurrence, verrouiller contre le double booking. Relier aux `Transporter.serviceAreas` et `fleet` existants ; `Order.delivery.specialRequirements.timeWindow` n'est qu'un texte libre et ne suffit pas.

Jour 100 — Frais de livraison et TVA, côté serveur (à faire · rapide + complet)
`deliveryService.calculateDeliveryFee` renvoie aujourd'hui toujours 0 et les frais sont réglés en espèces au livreur. Implémenter la règle retenue (livraison incluse dès 25 000 FCFA, sinon 2 500 FCFA) dans `orderService.createOrder` et `estimateOrderCosts`, remplacer le `taxes = 0` codé en dur par un calcul de TVA limité aux frais de livraison, et faire apparaître le détail sur le récapitulatif et sur la facture.

Jour 101 — Réception : contrôle des poids (à faire · complet)
Ajouter `receivedWeight` par ligne, comparer au poids théorique (`Order.totalWeight`), définir un seuil de tolérance, accepter photos et commentaire. Écran de réception accessible depuis la livraison du jour.

Jour 102 — Écarts : avoir et remplacement (à faire · complet)
Workflow `open` / `review` / `accepted` / `rejected` / `resolved`, impact sur la facture du mois (avoir) ou remplacement à la livraison suivante, notification au fournisseur. Le statut `disputed` existe déjà mais sans aucun traitement derrière.

Jour 103 — Facture mensuelle : agrégation (à faire · complet)
Créer `Invoice` (établissement, période, lignes issues de plusieurs commandes, HT/TVA/TTC, échéance, statut `draft` / `issued` / `paid` / `overdue` / `void`, numérotation). Il n'existe aujourd'hui qu'un `invoiceNumber` par commande : la facture consolidée n'existe pas.

Jour 104 — Facture mensuelle : PDF et avoirs (à faire · complet)
Étendre `services/invoiceService.js`, aujourd'hui mono-commande, pour produire la facture de période avec ventilation TVA, déduction des avoirs et mentions légales. Génération à la clôture du mois et téléchargement depuis l'espace client.

Jour 105 — Encaissement par virement (à faire · complet)
`Payment.method` n'accepte que `cash` et `paypal`. Ajouter le virement (référence, date de valeur, rapprochement), les statuts de règlement et l'écran de suivi. Wave et Orange Money sont couverts par le bloc AfriBaPay (Jours 75-86) : ce jour ne traite que le virement, adapté aux encaissements des établissements.

Jour 106 — Relances et impayés (à faire · complet)
Échéances à 15 ou 30 jours, plafond par établissement (`Restaurateur.paymentPreferences.creditLimit` existe déjà), relances automatiques, blocage des nouvelles livraisons au-delà du plafond. Sans cela, le crédit devient un risque non maîtrisé.

Jour 107 — Tableau de bord client B2B (à faire · rapide + complet)
Prochaines livraisons, contenu de la prochaine caisse, bouton « ajuster », état du cut-off. Compléter ou remplacer `RestaurateurDashboardNew`, qui est aujourd'hui un tableau de bord de vendeur de plats.

Jour 108 — Tableau de bord : factures et historique (à faire · complet)
Onglets factures (mois courant, statut, PDF) et historique des livraisons avec écarts signalés. Ajouter les entrées correspondantes dans `NavigationManager.jsx`.

Jour 109 — Inscription professionnelle et programmes types (à faire · rapide + complet)
Parcours d'inscription pro (type d'établissement, NINEA facultatif, quartier, téléphone), validation sous 24 h ouvrées, puis création du premier programme. Ajouter les 4 programmes prêts à l'emploi du prototype (Essentiels cuisine, Petit-déjeuner hôtel, Bar à jus, Fruits au bureau) comme modèles de départ.

Jour 110 — Pages vitrine (à faire · complet)
Pages publiques `/programmes`, `/tarifs` et déclinaison professionnelle de `/fournisseurs`, alignées sur l'identité Harvests plutôt que sur celle du prototype. Les promesses commerciales doivent correspondre à ce qui est réellement livré.

Jour 111 — Version anglaise du périmètre B2B (à faire · complet)
Nouveau namespace `b2b` (fr + en-GB) dans `frontend/src/locales`, imports et `NAMESPACES` dans `src/utils/i18n.js`, vocabulaire figé du glossaire (`Processor`, `Carrier`), montants en `FCFA`, dates au format en-GB. `npm run build` et `npm run lint` doivent passer les contrôles de parité, de glossaire et de qualité.

Jour 112 — Recette de bout en bout (à faire · complet)
Rejouer le parcours complet avec un compte de test : inscription → programme → ajustement avant et après cut-off → livraison → écart de poids → avoir → facture mensuelle → règlement. Vérifier les droits par rôle, les notifications et les cas limites (programme en pause, occurrence sautée, produit hors saison).
