/**
 * Routes pour les consommateurs
 */
import React from 'react';

// Import des composants consumer (lazy loading)
const ConsumerDashboard = React.lazy(() => import('../../../pages/dashboard/consumer/ConsumerDashboardNew'));
const Cart = React.lazy(() => import('../../../pages/dashboard/consumer/Cart'));
const Checkout = React.lazy(() => import('../../../pages/dashboard/consumer/Checkout'));
const OrderConfirmation = React.lazy(() => import('../../../pages/dashboard/consumer/OrderConfirmation'));
const OrderDetail = React.lazy(() => import('../../../pages/orders/OrderDetail'));
const Favorites = React.lazy(() => import('../../../pages/dashboard/consumer/Favorites'));
const OrderHistory = React.lazy(() => import('../../../pages/dashboard/consumer/OrderHistory'));
const Reviews = React.lazy(() => import('../../../pages/dashboard/consumer/Reviews'));
const Statistics = React.lazy(() => import('../../../pages/dashboard/consumer/Statistics'));
const ProfilePage = React.lazy(() => import('../../../pages/dashboard/common/ProfilePage'));
const SettingsPage = React.lazy(() => import('../../../pages/dashboard/common/SettingsPage'));

export const consumerRoutes = [
  {
    path: '/consumer/dashboard',
    element: <ConsumerDashboard />,
    title: 'Tableau de bord'
  },
  {
    path: '/consumer/cart',
    element: <Cart />,
    title: 'Mon panier'
  },
  {
    path: '/consumer/checkout',
    element: <Checkout />,
    title: 'Commande'
  },
  {
    path: '/consumer/orders/:orderId/confirmation',
    element: <OrderConfirmation />,
    title: 'Confirmation de commande'
  },
  {
    path: '/consumer/orders/:orderId',
    element: <OrderDetail />,
    title: 'Détails de la commande'
  },
  {
    path: '/consumer/favorites',
    element: <Favorites />,
    title: 'Mes favoris'
  },
  {
    path: '/consumer/orders',
    element: <OrderHistory />,
    title: 'Mes commandes'
  },
  {
    path: '/consumer/reviews',
    element: <Reviews />,
    title: 'Mes avis'
  },
  {
    path: '/consumer/statistics',
    element: <Statistics />,
    title: 'Statistiques'
  },
  {
    path: '/consumer/profile',
    element: <ProfilePage />,
    title: 'Mon profil'
  },
  {
    path: '/consumer/settings',
    element: <SettingsPage />,
    title: 'Paramètres'
  }
];

export default consumerRoutes;
