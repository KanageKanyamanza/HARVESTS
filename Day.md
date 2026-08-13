Jour 13 — Crash messagerie & diagnostic notifications push en prod

Fix crash "Cannot read properties of undefined (reading '_id')" dans ChatWindow.jsx : les messages système (ex. création de conversation) n'ont pas d'expéditeur, non géré à l'affichage
Les messages système s'affichent désormais comme un libellé neutre centré au lieu de planter la page
Fix 404 sur les liens de notification "Message reçu" : ils pointaient vers /messages/:id, une route sans préfixe de rôle qui n'existe pas
Ajout d'une redirection générique /messages(/:id) vers /{userType}/messages/:id selon le compte connecté
Diagnostic complet des notifications push web absentes en production (alors qu'elles arrivent en local) :
  - Clés VAPID vérifiées identiques entre local et Render
  - Abonnement de l'utilisateur bien enregistré côté serveur (vérifié en base)
  - Envoi de test direct depuis un script reproduisant la config prod : succès (notification bien reçue)
  - Conclusion : le process backend Render tourne avec des variables d'environnement VAPID chargées avant leur configuration -> nécessite un redeploy/redémarrage manuel du service pour les recharger

Jour 14 — Base de conseils agricoles pour les producteurs
Ajout d'une base de connaissances (cropAdviceData.js) couvrant 20 cultures d'Afrique de l'Ouest (tomate, oignon, manioc, mil, arachide, riz, mangue, niébé, etc.)
Chaque fiche culture indique : saison de semis/récolte, température idéale, besoins en eau, type de sol, durée de cycle, conseils de culture et conseils de conservation post-récolte
Fonctions de recherche et de correspondance automatique produit -> fiche conseil (par nom/alias)

Jour 16 — Corrections UI notifications & redesign des écrans d'erreur/PWA
Fix zoom auto iOS/Android à l'ouverture d'un champ texte (font-size < 16px forcée à 16px sous 768px)
Fix débordement du titre dans la cloche de notifications (min-w-0 manquant dans le flex, cause du texte non tronqué)
Fix bug "Supprimer" redirigeant vers une 404 : ajout de type="button" et preventDefault sur tous les boutons d'action des notifications (cloche + page complète + actions groupées)
Redesign de la page 404 (NotFound.jsx) : suppression du panneau de debug exposé en prod, nouveau visuel aux couleurs Harvests
Redesign de l'écran de secours ErrorBoundary.jsx dans le même langage visuel que la 404
Redesign de la modale d'installation PWA (PWAInstallModal.jsx) : icônes dédiées par avantage, meilleure hiérarchie visuelle
Fix débordement de la modale PWA sur petits écrans (hauteur max limitée à 90% de l'écran + défilement interne, espacements resserrés)

Jour 17 — Rubrique Investisseurs
Ajout d'une nouvelle page publique Investors.jsx (/investisseurs) : hero Agritech (même style que Pricing/About), points clés (marché, écosystème multi-acteurs, ancrage régional, impact) et coordonnées de contact
Formulaire "Demander le pitch deck" pré-rempli, réutilisant le service de contact existant (nouveau type "investor" ajouté côté backend pour le libellé de l'email reçu par les admins)
Entrée "Investisseurs" ajoutée au menu principal du site et au footer

Jour 18 — Widget météo & horloge dans le dashboard producteur
Création de WeatherClockWidget.jsx : horloge en direct (heure + date FR) et météo locale (température, humidité, vent) via l'API gratuite Open-Meteo, sans clé API
Géolocalisation navigateur avec repli automatique sur Dakar si refusée/indisponible, libellé basé sur la ville du profil si renseignée
Intégré dans DashboardTopbar.jsx, visible pour les producteurs et transformateurs (activités liées au terrain/à la récolte)
Script utilitaire create-test-producer.js ajouté pour créer/mettre à jour un compte producteur de test en un clic (email vérifié, compte approuvé)
Version compacte du widget météo/horloge (icône + température + heure) visible sur mobile, en plus de la version complète desktop
Ajout de ProducerQuickStats.jsx dans la topbar producteur : badge "commandes en attente", badge "produits en stock faible" (seuil 5 unités) et bouton rapide "Ajouter un produit", visibles sur mobile comme desktop

Jour 7 — Parcours d'authentification

Refonte de Login et Register (badges, cartes, dégradés de marque)
Refonte de ForgotPassword, ResetPassword, EmailVerification sur le même modèle
Mise à jour des composants partagés FormField et UserTypeSelector
Suppression de l'overlay gris qui assombrissait le fond
Correction du contraste du badge (texte illisible sur fond clair)
Suppression des liserés colorés jugés superflus sur les cartes

Jour 8 — Bugs transverses & fiabilité

Diagnostic et fix du bug CSRF (cookie SameSite=None sans Secure en dev)
Fix du vrai bug CSRF cross-origin (axios n'attachait pas le header X-CSRF hors same-origin)
Suppression d'un require() mort dans faqData.js (incompatible navigateur/Vite)
Vérification du build de production pour valider l'absence d'erreurs de syntaxe
Nettoyage des imports/variables inutilisés introduits pendant les itérations
Tests de cohérence visuelle finale sur l'ensemble des pages retouchées