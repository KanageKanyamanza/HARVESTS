--- Plan bascule bilingue FR/EN (fr → fr + en) ---
Détail complet, chiffres d'audit et justifications : docs/Harvests-Bilingue-Roadmap.pdf. Repère jour par jour ci-dessous, à mettre à jour (fait) puis retirer au fur et à mesure comme d'habitude. Numérotation reprise à la suite de Jour 32.

Jour 73 — Lancement : pages publiques (à faire)
Activer le sélecteur de langue d'abord sur les pages vitrine (déjà couvertes Jours 37-40 et 43-44), le reste du site restant en français tant que non traité. Suivre le taux d'usage de la bascule anglais.

Jour 74 — Lancement : extension progressive (à faire)
Étendre au fil de l'eau : dashboards, puis e-mails, puis chatbot, en te basant sur les retours/usages remontés au Jour 73. Bilan de la couverture bilingue atteinte à ce stade.

--- Plan d'intégration de l'offre d'approvisionnement professionnel (prototype alpha) ---
Analyse du prototype https://harvests-alpha.vercel.app et note de décision chiffrée : docs/HARVESTS_Integration_Prototype_Alpha.pdf. Numérotation reprise à la suite du Jour 74. Deux scénarios : **rapide** (12 jours — 75, 76, 77, 78, 81, 82, 83, 84, 85, 88, 95, 97) pour une démonstration commerciale ; **complet** (26 jours — 75 à 100) pour une version facturable. Les jours marqués « complet » seul se sautent dans le scénario rapide ; la numérotation n'est pas compressée pour autant.

Jour 75 — Dette bloquante avant le B2B (à faire · rapide + complet)
Déclarer `Order.deliveryFee` dans `orderSchemas.js` : il est utilisé par `orderMiddleware.js` pour calculer le total sans être déclaré, ce qui peut produire un montant incohérent. Corriger `Transporter.updatePerformanceStats`, qui appelle `mongoose.model("Delivery")`, modèle inexistant. Réparer ou retirer `services/consumer/consumerSubscriptionService.js`, qui interroge `Subscription` avec des champs (`consumer`, `producer`, `frequency`) et un statut `paused` absents du schéma. Mettre à jour `docs/FRONTEND_LARGE_FILES.md`, qui cite encore `AddOrder.jsx` et `SuppliersList.jsx`, supprimés au commit `55b73a4`.

Jour 76 — Organisation et établissements (à faire · rapide + complet)
Créer les modèles `Organization` (titulaire, raison sociale, NINEA facultatif, conditions de paiement) et `Establishment` (nom, type d'activité, adresse, zone de livraison, contacts, facturation séparée), reliés à `User`. Le `User` reste le compte de connexion ; l'établissement devient le périmètre des commandes, des adresses et des factures. Aucune notion de site multiple n'existe aujourd'hui dans `Restaurateur.js`.

Jour 77 — Membres, droits et sélecteur d'établissement (à faire · rapide + complet)
Modèle `Membership` avec rôles `owner` / `orders` / `invoices` / `read`, middlewares d'autorisation par établissement, en-tête `X-Establishment-Id` côté API, sélecteur dans la navigation et mémorisation du choix. Réutiliser `User.subscriptionFeatures.b2bAccess`, qui existe déjà mais n'est appliqué nulle part, comme garde-fou d'accès à l'offre B2B.

Jour 78 — Produit B2B : unité de vente, minimum, provenance (à faire · rapide + complet)
Étendre `Product` : unité de vente normalisée (`kg`, `botte`, `cagette`, `pièce`) avec facteur de conversion, réactivation de `minimumOrderQuantity` (présent mais neutralisé), provenance structurée (zone, localité, distance) au lieu du seul lien `producer`. Reprendre l'affichage du prototype : prix à l'unité de vente et minimum indiqué sur la fiche.

Jour 79 — Calendrier saisonnier : modèle (à faire · complet)
Créer `Seasonality` (produit, mois de disponibilité, état `pleine saison` / `toute l'année` / `fin de saison` / `hors saison`) et la table de substitutions (produit proposé, écart de prix). Aucun champ saisonnier n'existe dans `product/` : tout est à créer.

Jour 80 — Saisonnalité : saisie et affichage (à faire · complet)
Écran vendeur/admin pour déclarer les saisons et les substitutions ; calendrier sur la fiche produit et badge de disponibilité dans le marché. Prévoir l'alerte de fin de saison qui déclenche la proposition de substitution.

Jour 81 — Programme d'approvisionnement : modèles (à faire · rapide + complet)
Créer `SupplyProgram` (établissement, nom, rythme, jours, créneau, adresse, statut `active` / `paused` / `cancelled`), `SupplyProgramLine` (produit, quantité, unité, prix de référence) et `DeliveryOccurrence` (date, statut, contenu figé au cut-off, clé d'idempotence programme + date). Ne pas réutiliser `Subscription` : c'est un abonnement SaaS vendeur, sans lien avec l'approvisionnement.

Jour 82 — Heure limite, génération et rappels (à faire · rapide + complet)
Générer les occurrences à partir des programmes (rythme + jours), geler le contenu à 18h00 la veille, envoyer un rappel à 16h00. Le dépôt n'a aucun ordonnanceur : ajouter un worker planifié (script `node` + cron système ou tâche hébergée) avec verrou d'idempotence et journal d'exécution.

Jour 83 — Écran « Mon programme » : création (à faire · rapide + complet)
Créer un programme depuis un modèle ou depuis le marché : produits, quantités, rythme, créneau, adresse. Afficher le prix indicatif par livraison et la prochaine date. Route `/restaurateur/programmes/nouveau`, service et namespace de traduction dédiés.

Jour 84 — Écran « Mon programme » : ajustement (à faire · rapide + complet)
Modifier les quantités d'une occurrence, sauter une livraison, mettre le programme en pause, consulter l'historique. Bloquer les modifications après le cut-off avec un message explicite. C'est le geste central du prototype : il doit tenir en une action.

Jour 85 — Marché professionnel : parcours d'achat (à faire · rapide + complet)
Page `/restaurateur/marche` : filtres catégorie / disponibilité / provenance, fiche produit avec minimum de commande et prix à l'unité de vente, ajout au programme en un geste. Réutiliser `restaurateurController.discoverSuppliers` (déjà implémenté) plutôt que recréer un annuaire.

Jour 86 — Marché professionnel : saisonnalité et substitutions (à faire · complet)
Afficher l'état de disponibilité, le calendrier et la substitution proposée dans le marché et dans le programme. Permettre d'accepter, refuser ou remplacer une substitution depuis la ligne concernée.

Jour 87 — Créneaux de livraison et capacité (à faire · complet)
Créer `DeliverySlot` (date, plage 5h–8h / 8h–11h, zone, capacité en commandes et en poids, statut `open` / `full` / `closed`), réserver le créneau à la création de l'occurrence, verrouiller contre le double booking. Relier aux `Transporter.serviceAreas` et `fleet` existants ; `Order.delivery.specialRequirements.timeWindow` n'est qu'un texte libre et ne suffit pas.

Jour 88 — Frais de livraison et TVA, côté serveur (à faire · rapide + complet)
`deliveryService.calculateDeliveryFee` renvoie aujourd'hui toujours 0 et les frais sont réglés en espèces au livreur. Implémenter la règle retenue (livraison incluse dès 25 000 FCFA, sinon 2 500 FCFA) dans `orderService.createOrder` et `estimateOrderCosts`, remplacer le `taxes = 0` codé en dur par un calcul de TVA limité aux frais de livraison, et faire apparaître le détail sur le récapitulatif et sur la facture.

Jour 89 — Réception : contrôle des poids (à faire · complet)
Ajouter `receivedWeight` par ligne, comparer au poids théorique (`Order.totalWeight`), définir un seuil de tolérance, accepter photos et commentaire. Écran de réception accessible depuis la livraison du jour.

Jour 90 — Écarts : avoir et remplacement (à faire · complet)
Workflow `open` / `review` / `accepted` / `rejected` / `resolved`, impact sur la facture du mois (avoir) ou remplacement à la livraison suivante, notification au fournisseur. Le statut `disputed` existe déjà mais sans aucun traitement derrière.

Jour 91 — Facture mensuelle : agrégation (à faire · complet)
Créer `Invoice` (établissement, période, lignes issues de plusieurs commandes, HT/TVA/TTC, échéance, statut `draft` / `issued` / `paid` / `overdue` / `void`, numérotation). Il n'existe aujourd'hui qu'un `invoiceNumber` par commande : la facture consolidée n'existe pas.

Jour 92 — Facture mensuelle : PDF et avoirs (à faire · complet)
Étendre `services/invoiceService.js`, aujourd'hui mono-commande, pour produire la facture de période avec ventilation TVA, déduction des avoirs et mentions légales. Génération à la clôture du mois et téléchargement depuis l'espace client.

Jour 93 — Encaissement par virement (à faire · complet)
`Payment.method` n'accepte que `cash` et `paypal`. Ajouter le virement (référence, date de valeur, rapprochement), les statuts de règlement et l'écran de suivi. Wave et Orange Money restent hors de ce plan : +4 à 5 jours, à chiffrer séparément.

Jour 94 — Relances et impayés (à faire · complet)
Échéances à 15 ou 30 jours, plafond par établissement (`Restaurateur.paymentPreferences.creditLimit` existe déjà), relances automatiques, blocage des nouvelles livraisons au-delà du plafond. Sans cela, le crédit devient un risque non maîtrisé.

Jour 95 — Tableau de bord client B2B (à faire · rapide + complet)
Prochaines livraisons, contenu de la prochaine caisse, bouton « ajuster », état du cut-off. Compléter ou remplacer `RestaurateurDashboardNew`, qui est aujourd'hui un tableau de bord de vendeur de plats.

Jour 96 — Tableau de bord : factures et historique (à faire · complet)
Onglets factures (mois courant, statut, PDF) et historique des livraisons avec écarts signalés. Ajouter les entrées correspondantes dans `NavigationManager.jsx`.

Jour 97 — Inscription professionnelle et programmes types (à faire · rapide + complet)
Parcours d'inscription pro (type d'établissement, NINEA facultatif, quartier, téléphone), validation sous 24 h ouvrées, puis création du premier programme. Ajouter les 4 programmes prêts à l'emploi du prototype (Essentiels cuisine, Petit-déjeuner hôtel, Bar à jus, Fruits au bureau) comme modèles de départ.

Jour 98 — Pages vitrine (à faire · complet)
Pages publiques `/programmes`, `/tarifs` et déclinaison professionnelle de `/fournisseurs`, alignées sur l'identité Harvests plutôt que sur celle du prototype. Les promesses commerciales doivent correspondre à ce qui est réellement livré.

Jour 99 — Version anglaise du périmètre B2B (à faire · complet)
Nouveau namespace `b2b` (fr + en-GB) dans `frontend/src/locales`, imports et `NAMESPACES` dans `src/utils/i18n.js`, vocabulaire figé du glossaire (`Processor`, `Carrier`), montants en `FCFA`, dates au format en-GB. `npm run build` et `npm run lint` doivent passer les contrôles de parité, de glossaire et de qualité.

Jour 100 — Recette de bout en bout (à faire · complet)
Rejouer le parcours complet avec un compte de test : inscription → programme → ajustement avant et après cut-off → livraison → écart de poids → avoir → facture mensuelle → règlement. Vérifier les droits par rôle, les notifications et les cas limites (programme en pause, occurrence sautée, produit hors saison).
