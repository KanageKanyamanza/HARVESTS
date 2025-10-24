/**
 * Routes pour les administrateurs
 */
import React from 'react';

// Import des composants admin (lazy loading)
const AdminDashboard = React.lazy(() => import('../../../pages/admin/AdminDashboard'));
const AdminUsers = React.lazy(() => import('../../../pages/admin/AdminUsers'));
const AdminProducts = React.lazy(() => import('../../../pages/admin/AdminProducts'));
const AdminOrders = React.lazy(() => import('../../../pages/admin/AdminOrders'));
const AdminReviews = React.lazy(() => import('../../../pages/admin/AdminReviews'));
const AdminMessages = React.lazy(() => import('../../../pages/admin/AdminMessages'));
const AdminAnalytics = React.lazy(() => import('../../../pages/admin/AdminAnalytics'));
const OrderDetail = React.lazy(() => import('../../../pages/orders/OrderDetail'));

export const adminRoutes = [
  {
    path: '/admin',
    element: <AdminDashboard />,
    title: 'Tableau de bord Admin'
  },
  {
    path: '/admin/users',
    element: <AdminUsers />,
    title: 'Gestion des utilisateurs'
  },
  {
    path: '/admin/products',
    element: <AdminProducts />,
    title: 'Gestion des produits'
  },
  {
    path: '/admin/orders',
    element: <AdminOrders />,
    title: 'Gestion des commandes'
  },
  {
    path: '/admin/orders/:id',
    element: <OrderDetail />,
    title: 'Détails de la commande'
  },
  {
    path: '/admin/reviews',
    element: <AdminReviews />,
    title: 'Gestion des avis'
  },
  {
    path: '/admin/messages',
    element: <AdminMessages />,
    title: 'Messages'
  },
  {
    path: '/admin/analytics',
    element: <AdminAnalytics />,
    title: 'Analytiques'
  },
];

export default adminRoutes;
