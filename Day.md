Jour 23 — Fix déconnexion automatique après actualisation de la page
Le cookie de session bloquait le renouvellement automatique de connexion car frontend et backend sont sur des domaines différents en production
Résultat : l'utilisateur était déconnecté de force après 15 minutes, surtout visible après une actualisation de page
Corrigé en ajustant les réglages du cookie (utilisateur + admin) pour qu'il soit bien transmis entre les deux domaines

Jour 24 — Fix scroll non remis à zéro au changement de page (dashboard)
Diagnostic : ScrollToTop.jsx existait déjà mais utilise window.scrollTo, qui n'a aucun effet dans le dashboard (producteur, consommateur, etc.) car le contenu défile dans un conteneur dédié (overflow-y-auto) et non dans la fenêtre — la position de scroll restait donc figée en changeant de page (ex: ouvrir le détail d'une culture après avoir scrollé dans la liste)
Fix : ajout d'un scrollTo(0,0) sur ce conteneur de contenu (ModularDashboardLayout.jsx) à chaque changement de route, en plus du scroll de fenêtre déjà en place pour les pages publiques
Vérifié que AdminLayout.jsx n'a pas ce problème (scroll de page classique, déjà couvert par ScrollToTop)