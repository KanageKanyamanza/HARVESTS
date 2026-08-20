Jour 23 — Fix déconnexion automatique après actualisation de la page
Le cookie de session bloquait le renouvellement automatique de connexion car frontend et backend sont sur des domaines différents en production
Résultat : l'utilisateur était déconnecté de force après 15 minutes, surtout visible après une actualisation de page
Corrigé en ajustant les réglages du cookie (utilisateur + admin) pour qu'il soit bien transmis entre les deux domaines

Jour 24 — Fix scroll non remis à zéro au changement de page (dashboard)
Diagnostic : ScrollToTop.jsx existait déjà mais utilise window.scrollTo, qui n'a aucun effet dans le dashboard (producteur, consommateur, etc.) car le contenu défile dans un conteneur dédié (overflow-y-auto) et non dans la fenêtre — la position de scroll restait donc figée en changeant de page (ex: ouvrir le détail d'une culture après avoir scrollé dans la liste)
Fix : ajout d'un scrollTo(0,0) sur ce conteneur de contenu (ModularDashboardLayout.jsx) à chaque changement de route, en plus du scroll de fenêtre déjà en place pour les pages publiques
Vérifié que AdminLayout.jsx n'a pas ce problème (scroll de page classique, déjà couvert par ScrollToTop)

Jour 25 — Bandeau défilant "Nos Producteurs" façon JT sur la home
Nouveau composant VendorsNewsTicker.jsx : bandeau noir/vert avec badge "Nos Producteurs" et défilement continu (CSS, boucle sans coupure) des noms de tous les producteurs Harvests, chacun cliquable vers son profil
Charge dynamiquement la liste via producerService.getAllPublic (jusqu'à 60 vendeurs), s'affiche uniquement si des vendeurs sont trouvés
Défilement en pause au survol, désactivé automatiquement si prefers-reduced-motion
Déplacé de la home vers Layout.jsx, juste en dessous de la navigation (Header) : visible sur toutes les pages publiques, pas seulement l'accueil
Fix glitch visuel : le fondu de transition était positionné en pixels fixes non alignés avec la largeur réelle du badge "Nos Producteurs", créant une tache sombre décalée — corrigé en ancrant deux fondus (entrée/sortie) directement sur le conteneur du bandeau défilant
Fix import manquant : la balise <VendorsNewsTicker /> était restée dans Home.jsx après son déplacement vers Layout.jsx, provoquant un crash (ReferenceError) — supprimée
Bandeau rendu fixe au scroll : Header et VendorsNewsTicker regroupés dans un même conteneur sticky (Layout.jsx) au lieu du sticky individuel sur le Header, pour qu'ils restent collés ensemble en haut de l'écran
Vitesse de défilement ajustée (40s -> 22s -> 32s -> 14s -> 8s : la durée est le temps pour boucler, donc plus c'est court, plus c'est rapide)
Badge "Nos Producteurs" compacté sur mobile (icône + "Prod." au lieu du texte complet, padding réduit) pour laisser plus de place au défilement, et espacement resserré entre les noms
Fix vitesse plus lente sur mobile : texte/espacements réduits en dessous de 640px -> contenu défilant plus court en pixels -> même durée d'animation donne une vitesse perçue plus faible. Durée spécifique mobile (4s au lieu de 8s) pour compenser
Fix filtre mobile (Produits) masqué sous le bandeau : son décalage top était aussi codé en dur (top-16), remplacé par la même variable --app-header-height que les barres de filtres desktop
Fix résiduel : ProductFilters.jsx avait lui-même un 3e décalage codé en dur ("md:top-140px", interne au composant, raté lors du premier passage) — remplacé par un calc() sur --app-header-height pour garder le même espacement visuel qu'avant
Fix bandeau n'affichant que quelques producteurs en boucle : l'appel API appliquait par défaut un filtre de géolocalisation (comme la page Producteurs), limitant la liste à la zone détectée du visiteur. Ajout de useLocation:false pour charger tous les producteurs, limite remontée à 100
Fix des barres de filtres "sticky" sur 8 pages (Produits, Catégories, Producteurs, Transformateurs, Restaurateurs, Transport/Export, Blog, profil vendeur) : leur décalage top était codé en dur pour l'ancienne hauteur du header, devenu faux avec le nouveau bandeau (dont la hauteur varie en plus, selon qu'il s'affiche ou non). Remplacé par une variable CSS --app-header-height mesurée en direct (ResizeObserver dans Layout.jsx) au lieu d'un offset fixe
Vraie cause du bandeau limité à quelques producteurs identifiée : la requête publique exige aussi une bannière de boutique (shopBanner) configurée, ce qui exclut la plupart des producteurs — pas seulement un souci de géolocalisation. Ajout d'un paramètre namesOnly=true (producerSearchService.js) qui contourne cette exigence uniquement pour un listing de noms, sans toucher au comportement de la marketplace (cartes complètes)
Vérification (script ponctuel) : sur 74 producteurs éligibles, 73 affichent correctement leur nom de ferme ; 1 seul ("Colibri Agro sarl") retombe sur son vrai nom car son champ farmName est resté à "À compléter" alors que le nom d'entreprise a été saisi par erreur dans le champ prénom — problème de donnée isolé, pas un bug de code
Remplacement de "vendeur/vendeurs" par "partenaire/partenaires" sur tout le texte visible côté public (plus juste car le terme couvre producteurs, transformateurs et restaurateurs) : page Vendeurs.jsx, FAQ, Tarifs, Confidentialité, CGU, Hero de la home, pavillons régionaux, section "Producteurs à la Une", fiche produit, carte produit, profil partenaire, avis, panier. Logs techniques (console.error) et commentaires de code non touchés (invisibles pour les visiteurs)
