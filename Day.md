--- Plan de mise en conformité (données personnelles) ---
Suite à l'audit RGPD/loi 2008-12 : tout validé sauf l'âge minimum (hors périmètre, volontairement écarté).

Jour 30 — Export de mes données (fait)
Nouveau point d'API en libre-service (GET /users/me/export-data) qui télécharge un fichier JSON structuré : profil (sans champs sensibles), commandes (en tant qu'acheteur et/ou vendeur), produits publiés et avis (rédigés et reçus), selon ce qui s'applique au type de compte. Bouton "Télécharger mes données" dans les paramètres (onglet Sécurité). Testé en direct contre la base avec un compte jetable : export récupéré avec le bon Content-Disposition et la structure attendue.
Par ailleurs (fait) : les 19 comptes producteurs de la coopérative wendpenga affichaient encore "Coopérative wendpenga..." en public au lieu de leur nom (le nom de ferme prime sur prénom/nom dans l'affichage). Champ farmName remplacé par le nom personnel de chaque producteur (ex. "Marguerite Kabore", "Zebre", "Ouedraogo"). Plus aucun compte n'a "coopérative" dans son nom de ferme/société/restaurant (vérifié en base).

Jour 31 — Cookies (fait, en avance) + documents sensibles (reste à faire)
Bandeau de consentement cookies mis en place (essentiels toujours actifs, performance/préférence en opt-in), rejouable via "Gérer les cookies" en pied de page. Politique de Confidentialité mise à jour : section Cookies alignée sur le vrai mécanisme, nouvelle section Transferts internationaux ajoutée. Reste à faire : l'aperçu des pièces d'identité côté admin doit encore passer par la route de téléchargement signée existante au lieu de l'URL Cloudinary directe.

Jour 32 — Démarche CDP (hors code)
Pas de développement ce jour-là : vérifier le statut de la déclaration auprès de la Commission de protection des Données personnelles du Sénégal, idéalement avec un juriste habilité, vu le traitement de données sensibles (pièces d'identité, informations bancaires). Résultat à documenter ici une fois la démarche faite.
