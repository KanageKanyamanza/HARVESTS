# Composants des tableaux de bord

## Communs à tous les rôles

- `DashboardSidebarFixed.jsx` : barre latérale ; ses entrées viennent de `navigation/NavigationManager.jsx`.
- `DashboardTopbar.jsx` : barre du haut (langue, notifications, compte).
- `ProfileCompletionModal.jsx` : invitation à compléter le profil.
- `EmailVerificationBanner.jsx` et `PushNotificationBanner.jsx` : bannières de haut de page.
- `WeatherClockWidget.jsx` : heure et météo.

## Sections réutilisables (`sections/`)

Utilisées par les tableaux de bord exportateur et transporteur :

- `OrdersSection.jsx` : dernières commandes, avec leur statut.
- `QuickActionsSection.jsx` : actions rapides selon le rôle.
- `FleetSummarySection.jsx` : résumé de la flotte.
- `SubscriptionSection.jsx` : abonnement en cours.

Chaque rôle a son propre tableau de bord dans `pages/dashboard/<rôle>/`.
