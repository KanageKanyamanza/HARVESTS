--- Plan de mise en conformité (données personnelles) ---
Suite à l'audit RGPD/loi 2008-12 : tout validé sauf l'âge minimum (hors périmètre, volontairement écarté).

Jour 29 — Suppression de compte en libre-service
Bouton "Supprimer mon compte" dans les paramètres, avec confirmation (mot de passe ou saisie de l'email). Le point d'API delete-me ne fait plus que désactiver le compte : il anonymise/supprime réellement les données personnelles, en gardant l'intégrité référentielle des commandes existantes.
Par ailleurs (fait) : nettoyage des 18 comptes producteurs de la coopérative wendpenga restés au placeholder "À compléter" depuis leur inscription fin juillet — renommés d'après le préfixe de leur email (script scripts/rename-placeholder-cooperative-users.js), pour qu'ils cessent de s'afficher sans nom dans les listings publics.

Jour 30 — Export de mes données
Nouveau point d'API en libre-service pour télécharger ses propres données (profil, commandes, produits/avis selon le type de compte) dans un format structuré. Bouton "Télécharger mes données" dans les paramètres.

Jour 31 — Cookies (fait, en avance) + documents sensibles (reste à faire)
Bandeau de consentement cookies mis en place (essentiels toujours actifs, performance/préférence en opt-in), rejouable via "Gérer les cookies" en pied de page. Politique de Confidentialité mise à jour : section Cookies alignée sur le vrai mécanisme, nouvelle section Transferts internationaux ajoutée. Reste à faire : l'aperçu des pièces d'identité côté admin doit encore passer par la route de téléchargement signée existante au lieu de l'URL Cloudinary directe.

Jour 32 — Démarche CDP (hors code)
Pas de développement ce jour-là : vérifier le statut de la déclaration auprès de la Commission de protection des Données personnelles du Sénégal, idéalement avec un juriste habilité, vu le traitement de données sensibles (pièces d'identité, informations bancaires). Résultat à documenter ici une fois la démarche faite.
