import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Shield,
  Star,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Activity,
  Globe,
  Truck
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    recentOrders: 0,
    monthlyGrowth: 0,
    totalProducers: 0,
    totalConsumers: 0,
    totalTransporters: 0,
    pendingProducts: 0,
    pendingReviews: 0,
    unreadMessages: 0,
    activeAdmins: 0
  });
  const [loading, setLoading] = useState(true);

  // Fonction loadStats mémorisée pour éviter les re-rendus
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      console.log('🔍 AdminDashboard - Response:', response.data);
      
      // Vérifier si la réponse contient des statistiques
      if (response.data && response.data.stats) {
        console.log('📊 AdminDashboard - Stats:', response.data.stats);
        const statsData = response.data.stats;
        
        setStats({
          totalUsers: statsData.totalUsers || 0,
          totalProducts: statsData.totalProducts || 0,
          totalOrders: statsData.totalOrders || 0,
          totalRevenue: statsData.totalRevenue || 0,
          pendingApprovals: statsData.pendingApprovals || 0,
          activeUsers: statsData.activeUsers || 0,
          recentOrders: statsData.recentOrders || 0,
          monthlyGrowth: statsData.monthlyGrowth || 0,
          totalProducers: statsData.totalProducers || 0,
          totalConsumers: statsData.totalConsumers || 0,
          totalTransporters: statsData.totalTransporters || 0,
          pendingProducts: statsData.pendingProducts || 0,
          pendingReviews: statsData.pendingReviews || 0,
          unreadMessages: statsData.unreadMessages || 0,
          activeAdmins: statsData.activeAdmins || 0
        });
      } else if (response.data && response.data.data && response.data.data.stats) {
        // Structure alternative avec data.stats
        console.log('📊 AdminDashboard - Stats (alt):', response.data.data.stats);
        const statsData = response.data.data.stats;
        
        setStats({
          totalUsers: statsData.totalUsers || 0,
          totalProducts: statsData.totalProducts || 0,
          totalOrders: statsData.totalOrders || 0,
          totalRevenue: statsData.totalRevenue || 0,
          pendingApprovals: statsData.pendingApprovals || 0,
          activeUsers: statsData.activeUsers || 0,
          recentOrders: statsData.recentOrders || 0,
          monthlyGrowth: statsData.monthlyGrowth || 0,
          totalProducers: statsData.totalProducers || 0,
          totalConsumers: statsData.totalConsumers || 0,
          totalTransporters: statsData.totalTransporters || 0,
          pendingProducts: statsData.pendingProducts || 0,
          pendingReviews: statsData.pendingReviews || 0,
          unreadMessages: statsData.unreadMessages || 0,
          activeAdmins: statsData.activeAdmins || 0
        });
      } else {
        console.log('❌ AdminDashboard - No stats found in response:', response.data);
        // En cas d'erreur, utiliser des données par défaut
        setStats({
          totalUsers: 0,
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          pendingApprovals: 0,
          activeUsers: 0,
          recentOrders: 0,
          monthlyGrowth: 0,
          totalProducers: 0,
          totalConsumers: 0,
          totalTransporters: 0,
          pendingProducts: 0,
          pendingReviews: 0,
          unreadMessages: 0,
          activeAdmins: 0
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      // En cas d'erreur, utiliser des données par défaut
      setStats({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingApprovals: 0,
        activeUsers: 0,
        recentOrders: 0,
        monthlyGrowth: 0,
        totalProducers: 0,
        totalConsumers: 0,
        totalTransporters: 0,
        pendingProducts: 0,
        pendingReviews: 0,
        unreadMessages: 0,
        activeAdmins: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const statCards = [
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
      change: '+8.2%',
      link: '/admin/products'
    },
    {
      title: 'Commandes totales',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'bg-purple-500',
      change: '+12.1%',
      link: '/admin/orders'
    },
    {
      title: 'Chiffre d\'affaires',
      value: `${stats.totalRevenue.toLocaleString()} FCFA`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+18.7%',
      link: '/admin/analytics'
    }
  ];

  const marketplaceStats = [
    {
      title: 'Producteurs',
      value: stats.totalProducers.toLocaleString(),
      icon: Globe,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Consommateurs',
      value: stats.totalConsumers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Transporteurs',
      value: stats.totalTransporters.toLocaleString(),
      icon: Truck,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Admins actifs',
      value: stats.activeAdmins.toLocaleString(),
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const quickActions = [
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
        </div>
    );
  }

  return (
        <div>
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Tableau de bord administrateur
        </h1>
        <p className="mt-2 text-gray-600">
          Bienvenue dans l'administration de Harvests
          </p>
        </div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2  gap-6 mb-8">
        {statCards.map((card, index) => (
          <Link key={index} to={card.link} className="group">
            <div className="bg-white rounded-lg shadow p-6 group-hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm text-green-600">{card.change}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Statistiques de la marketplace */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des utilisateurs</h3>
        <div className="grid grid-cols-2  gap-4">
          {marketplaceStats.map((stat, index) => (
            <div key={index} className={`${stat.bgColor} rounded-lg p-4`}>
              <div className="flex items-center">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
              </div>
            </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2  gap-6 mb-8">
        {quickActions.map((action, index) => (
          <Link key={index} to={action.link} className="group">
            <div className="bg-white rounded-lg shadow p-6 group-hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
              <div className="flex items-center">
                  <action.icon className={`h-8 w-8 ${action.color}`} />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{action.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{action.value}</p>
                </div>
                </div>
                <div className="flex items-center text-blue-600 group-hover:text-blue-800">
                  <span className="text-sm font-medium mr-1">{action.action}</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>
        ))}
        </div>

      {/* Graphiques et tableaux récents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des ventes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Évolution des ventes
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Graphique des ventes (à implémenter)</p>
              </div>
            </div>
          </div>

        {/* Dernières commandes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Commandes récentes
            </h3>
            <Link to="/admin/orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Voir tout
            </Link>
                          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((order) => (
              <div key={order} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">Commande #{1000 + order}</p>
                  <p className="text-xs text-gray-500">Il y a {order} heures</p>
                          </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{(Math.random() * 100 + 50).toFixed(0)} FCFA</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Terminé
                            </span>
                          </div>
                          </div>
            ))}
            </div>
          </div>
        </div>
      </div>
  );
};

export default AdminDashboard;
