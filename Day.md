Jour 25 — Bandeau défilant "Nos Producteurs" façon JT
Nouveau bandeau (VendorsNewsTicker.jsx) affiché sous le menu sur tout le site : noms de tous les producteurs qui défilent en continu, chacun cliquable vers son profil
Plusieurs ajustements après retours : vitesse de défilement, badge plus compact sur mobile, bandeau bien fixe au scroll, et la liste chargée corrigée pour afficher vraiment tous les producteurs (pas seulement quelques-uns)
Effet de bord réglé : la hauteur du menu ayant changé avec le nouveau bandeau, les barres de filtres "collantes" de 8 pages produits/catégories ont été recalées automatiquement au lieu d'un espacement codé en dur
Remplacement de "vendeur" par "partenaire" dans les textes visibles du site public (terme plus juste : couvre producteurs, transformateurs et restaurateurs)
Fix bandeau qui semblait "recommencer" après 8-10 noms : la durée de l'animation était fixe (8s), donc avec 74 producteurs le défilement était trop rapide pour être lu en entier avant la boucle. Durée recalculée dynamiquement à partir de la largeur réelle du contenu (vitesse constante en px/s) : tous les noms défilent maintenant lisiblement quel que soit leur nombre
