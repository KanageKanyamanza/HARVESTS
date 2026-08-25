Jour 26 — Bandeau producteurs : la vraie cause du "redémarrage" trouvée
Le bandeau "recommençait" après quelques noms malgré le fix de vitesse : cause réelle trouvée en scrutant l'animation image par image — translateX(-50%) se résolvait sur la largeur du conteneur (pas du contenu réel), donc ne parcourait qu'une fraction du trajet avant de sauter au début. Corrigé avec w-max sur le conteneur défilant, vitesse encore ajustée ensuite sur retour utilisateur.

Jour 27 — CRUD complet utilisateurs (admin) et filtrage des boutiques vides
Le compte de test "Ferme Test Harvests" masqué du public (isShopVisible: false) sans le supprimer, pour ne pas casser les autres tests dessus.
Ajout du CRUD complet des utilisateurs côté admin : la création manquait entièrement (backend + UI), le bouton "Modifier" existait dans le code mais n'était jamais branché. Mot de passe généré automatiquement renvoyé une seule fois à la création (avec copie rapide), impossible à récupérer ensuite.
Les producteurs sans aucun produit publié n'apparaissent plus dans les listings publics (bandeau, page /producteurs, recherche, par région/culture) — seule la fiche détail reste accessible par lien direct.
