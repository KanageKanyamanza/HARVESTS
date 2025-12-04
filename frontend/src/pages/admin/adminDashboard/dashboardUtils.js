// Utilitaires pour AdminDashboard

import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Shield,
  Star,
  MessageSquare,
  Activity,
  Globe,
  Truck,
  CreditCard
} from 'lucide-react';

export const createStatCards = (stats) => [
  {
    title: 'Utilisateurs totaux',
    value: stats.totalUsers.toLocaleString(),
    icon: Users,
    color: 'bg-blue-500',
    change: `+${stats.monthlyGrowth}%`,
    link: '/admin/users'
  },
  {
    title: 'Produits en ligne',
    value: stats.totalProducts.toLocaleString(),
    icon: Package,
    color: 'bg-green-500',
    change: stats.pendingProducts > 0 ? `${stats.pendingProducts} en attente` : 'Tous approuvés',
    link: '/admin/products'
  },
  {
    title: 'Commandes totales',
    value: stats.totalOrders.toLocaleString(),
    icon: ShoppingCart,
    color: 'bg-purple-500',
    change: `${stats.recentOrders} récentes`,
    link: '/admin/orders'
  },
  {
    title: 'Chiffre d\'affaires',
    value: `${stats.totalRevenue.toLocaleString()} FCFA`,
    icon: DollarSign,
    color: 'bg-yellow-500',
    change: `${stats.totalOrders} commandes`,
    link: '/admin/analytics'
  },
  {
    title: 'Abonnements',
    value: stats.totalSubscriptions.toLocaleString(),
    icon: CreditCard,
    color: 'bg-emerald-500',
    change: `${stats.activeSubscriptions} actifs`,
    link: '/admin/subscriptions'
  }
];

export const createMarketplaceStats = (stats) => [
  {
    title: 'Producteurs',
    value: stats.totalProducers.toLocaleString(),
    icon: Globe,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Agriculteurs et éleveurs'
  },
  {
    title: 'Consommateurs',
    value: stats.totalConsumers.toLocaleString(),
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Acheteurs finaux'
  },
  {
    title: 'Transformateurs',
    value: (stats.totalUsers - stats.totalProducers - stats.totalConsumers - stats.totalTransporters).toLocaleString(),
    icon: Activity,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Entreprises de transformation'
  },
  {
    title: 'Restaurateurs',
    value: (stats.totalRestaurateurs || 0).toLocaleString(),
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    description: 'Restaurants et cafés'
  },
  {
    title: 'Exportateurs',
    value: (stats.totalExportateurs || 0).toLocaleString(),
    icon: TrendingUp,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    description: 'Entreprises d\'exportation'
  },
  {
    title: 'Transporteurs',
    value: stats.totalTransporters.toLocaleString(),
    icon: Truck,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Services de livraison'
  },
  {
    title: 'Admins actifs',
    value: stats.activeAdmins.toLocaleString(),
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Administrateurs'
  }
];

export const createQuickActions = (stats) => [
  {
    title: 'Produits en attente',
    value: stats.pendingProducts,
    icon: Package,
    color: 'text-orange-500',
    action: 'Examiner',
    link: '/admin/products'
  },
  {
    title: 'Avis à modérer',
    value: stats.pendingReviews,
    icon: Star,
    color: 'text-yellow-500',
    action: 'Modérer',
    link: '/admin/reviews'
  },
  {
    title: 'Messages non lus',
    value: stats.unreadMessages,
    icon: MessageSquare,
    color: 'text-blue-500',
    action: 'Répondre',
    link: '/admin/messages'
  },
  {
    title: 'Commandes récentes',
    value: stats.recentOrders,
    icon: ShoppingCart,
    color: 'text-purple-500',
    action: 'Voir',
    link: '/admin/orders'
  }
];

