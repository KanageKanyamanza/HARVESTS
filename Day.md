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