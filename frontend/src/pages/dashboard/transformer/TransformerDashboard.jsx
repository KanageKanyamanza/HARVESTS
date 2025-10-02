import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { transformerService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import {
  FiPackage,
  FiShoppingCart,
  FiTrendingUp,
  FiDollarSign,
  FiEye,
  FiEdit,
  FiPlus,
  FiRefreshCw,
  FiStar,
  FiUsers,
  FiTruck,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiSettings,
  FiFileText,
  FiAward,
  FiTool,
  FiArchive,
  FiBarChart2,
  FiCalendar,
  FiShield,
  FiActivity,
  FiZap
} from 'react-icons/fi';

const TransformerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [productionBatches, setProductionBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données du dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      if (user?.userType === 'transformer') {
        try {
          setLoading(true);
          const [statsResponse, ordersResponse, batchesResponse] = await Promise.all([
            transformerService.getBusinessStats(),
            transformerService.getMyOrders(),
            transformerService.getProductionBatches()
          ]);

          setStats(statsResponse.data?.data || {});
          setOrders(ordersResponse.data?.data?.orders || []);
          setProductionBatches(batchesResponse.data?.data?.batches || []);
        } catch (error) {
          console.error('Erreur lors du chargement du dashboard:', error);
          setError('Erreur lors du chargement des données');
        } finally {
          setLoading(false);
        }
      }
    };

    loadDashboardData();
  }, [user]);

  // Calculer les statistiques dérivées
  const derivedStats = useMemo(() => {
    if (!orders.length) {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        monthlyRevenue: 0,
        averageProcessingTime: 0,
        qualityScore: 0
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyRevenue = orders.reduce((total, order) => {
      const orderDate = new Date(order.createdAt);
      if (orderDate.getMonth() === currentMonth && 
          orderDate.getFullYear() === currentYear && 
          order.status === 'completed') {
        return total + (order.total || 0);
      }
      return total;
    }, 0);

    const pendingOrders = orders.filter(order => 
      ['pending', 'processing', 'in_progress'].includes(order.status)
    ).length;

    const completedOrders = orders.filter(order => 
      order.status === 'completed'
    ).length;

    const averageProcessingTime = orders.length > 0 
      ? orders.reduce((total, order) => {
          if (order.processingTime) {
            return total + order.processingTime;
          }
          return total;
        }, 0) / orders.length 
      : 0;

    return {
      totalOrders: orders.length,
      pendingOrders,
      completedOrders,
      monthlyRevenue,
      averageProcessingTime,
      qualityScore: stats?.qualityScore || 0
    };
  }, [orders, stats]);

  // Statistiques principales
  const mainStats = [
    {
      title: 'Commandes en cours',
      value: derivedStats.pendingOrders,
      icon: FiClock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      link: '/transformer/orders?status=pending'
    },
    {
      title: 'Commandes terminées',
      value: derivedStats.completedOrders,
      icon: FiCheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/transformer/orders?status=completed'
    },
    {
      title: 'Revenus ce mois',
      value: `${derivedStats.monthlyRevenue.toLocaleString()} FCFA`,
      icon: FiDollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/transformer/analytics/revenue'
    },
    {
      title: 'Score qualité',
      value: `${derivedStats.qualityScore}%`,
      icon: FiAward,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      link: '/transformer/quality-control'
    }
  ];

  // Actions rapides
  const quickActions = [
    {
      title: 'Nouvelle commande',
      description: 'Accepter une nouvelle commande de transformation',
      icon: FiPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/transformer/orders/new'
    },
    {
      title: 'Lot de production',
      description: 'Créer un nouveau lot de production',
      icon: FiPackage,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/transformer/production/batches/new'
    },
    {
      title: 'Devis personnalisé',
      description: 'Créer un devis pour un client',
      icon: FiFileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      link: '/transformer/quotes/new'
    },
    {
      title: 'Rapport qualité',
      description: 'Générer un rapport de contrôle qualité',
      icon: FiShield,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      link: '/transformer/quality/reports/new'
    }
  ];

  // Menu de navigation
  const navigationItems = [
    {
      title: 'Commandes',
      icon: FiShoppingCart,
      items: [
        { label: 'Toutes les commandes', link: '/transformer/orders' },
        { label: 'Commandes en cours', link: '/transformer/orders?status=processing' },
        { label: 'Nouvelle commande', link: '/transformer/orders/new' }
      ]
    },
    {
      title: 'Production',
      icon: FiPackage,
      items: [
        { label: 'Lots de production', link: '/transformer/production/batches' },
        { label: 'Planification', link: '/transformer/production/planning' },
        { label: 'Contrôle qualité', link: '/transformer/quality-control' },
        { label: 'Traçabilité', link: '/transformer/traceability' }
      ]
    },
    {
      title: 'Clients & Devis',
      icon: FiUsers,
      items: [
        { label: 'Devis personnalisés', link: '/transformer/quotes' },
        { label: 'Contrats clients', link: '/transformer/contracts' },
        { label: 'Avis clients', link: '/transformer/reviews' }
      ]
    },
    {
      title: 'Équipements',
      icon: FiTool,
      items: [
        { label: 'Mon équipement', link: '/transformer/equipment' },
        { label: 'Maintenance', link: '/transformer/maintenance' },
        { label: 'Horaires', link: '/transformer/operating-hours' }
      ]
    },
    {
      title: 'Certifications',
      icon: FiAward,
      items: [
        { label: 'Mes certifications', link: '/transformer/certifications' },
        { label: 'Documents légaux', link: '/transformer/documents' },
        { label: 'Conformité', link: '/transformer/compliance' }
      ]
    },
    {
      title: 'Analytics',
      icon: FiBarChart2,
      items: [
        { label: 'Statistiques business', link: '/transformer/analytics/business' },
        { label: 'Analytics production', link: '/transformer/analytics/production' },
        { label: 'Métriques efficacité', link: '/transformer/analytics/efficiency' },
        { label: 'Revenus', link: '/transformer/analytics/revenue' }
      ]
    },
    {
      title: 'Paramètres',
      icon: FiSettings,
      items: [
        { label: 'Profil entreprise', link: '/transformer/profile' },
        { label: 'Capacités transformation', link: '/transformer/capabilities' },
        { label: 'Services offerts', link: '/transformer/services' },
        { label: 'Tarification', link: '/transformer/pricing' }
      ]
    }
  ];

  if (loading) {
    return (
      <ModularDashboardLayout userType="transformer">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </ModularDashboardLayout>
    );
  }

  if (error) {
    return (
      <ModularDashboardLayout userType="transformer">
        <div className="text-center py-12">
          <FiAlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Erreur</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Réessayer
          </button>
        </div>
      </ModularDashboardLayout>
    );
  }

  // Vérifier le statut d'approbation
  const isApproved = user?.isApproved || false;
  const needsApproval = ['producer', 'transformer', 'exporter', 'transporter'].includes(user?.userType);
  const canPerformOperations = isApproved || !needsApproval;

  return (
    <ModularDashboardLayout 
      navigationItems={navigationItems}
      user={user}
    >
      <div className="space-y-6">
        {/* Bandeau d'approbation en attente */}
        {needsApproval && !isApproved && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <FiClock className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Compte en attente d'approbation
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Votre compte est en cours d'examen. Vous pouvez consulter votre dashboard mais certaines opérations seront limitées jusqu'à l'approbation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* En-tête */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Dashboard Transformateur
              </h1>
              <p className="text-purple-100 mt-1">
                Bienvenue, {user?.firstName} {user?.lastName}
              </p>
              <p className="text-purple-200 text-sm mt-2">
                Gérez vos opérations de transformation et suivez vos performances
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {user?.companyName || 'Mon Entreprise'}
              </div>
              <div className="text-purple-200 text-sm">
                {user?.transformationType || 'Type de transformation'}
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainStats.map((stat, index) => (
            <Link
              key={index}
              to={stat.link}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const isDisabled = !canPerformOperations;
              return (
                <Link
                  key={index}
                  to={isDisabled ? '#' : action.link}
                  className={`flex items-center p-4 border border-gray-200 rounded-lg transition-colors ${
                    isDisabled 
                      ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                      : 'hover:border-purple-300 hover:bg-purple-50'
                  }`}
                  onClick={isDisabled ? (e) => e.preventDefault() : undefined}
                >
                  <div className={`p-2 rounded-lg ${isDisabled ? 'bg-gray-100' : action.bgColor} mr-3`}>
                    <action.icon className={`h-5 w-5 ${isDisabled ? 'text-gray-400' : action.color}`} />
                  </div>
                  <div>
                    <p className={`font-medium ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                      {action.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {isDisabled ? 'Disponible après approbation' : action.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Commandes récentes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Commandes récentes</h2>
            <Link
              to="/transformer/orders"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              Voir toutes
            </Link>
          </div>
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commande
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.orderNumber || order._id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.client?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.transformationType || 'Transformation'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status === 'completed' ? 'Terminé' :
                           order.status === 'processing' ? 'En cours' :
                           order.status === 'pending' ? 'En attente' :
                           order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FiShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande</h3>
              <p className="mt-1 text-sm text-gray-500">
                Vous n'avez pas encore de commandes de transformation.
              </p>
              <div className="mt-6">
                <Link
                  to="/transformer/orders/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  <FiPlus className="h-4 w-4 mr-2" />
                  Accepter une commande
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Lots de production récents */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Lots de production récents</h2>
            <Link
              to="/transformer/production/batches"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              Voir tous
            </Link>
          </div>
          {productionBatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productionBatches.slice(0, 6).map((batch) => (
                <div key={batch._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">
                      Lot #{batch.batchNumber || batch._id.slice(-8)}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      batch.status === 'completed' ? 'bg-green-100 text-green-800' :
                      batch.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {batch.status === 'completed' ? 'Terminé' :
                       batch.status === 'processing' ? 'En cours' :
                       batch.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {batch.productType || 'Produit transformé'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Quantité: {batch.quantity || 'N/A'} {batch.unit || ''}
                  </p>
                  <p className="text-xs text-gray-500">
                    Date: {new Date(batch.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun lot de production</h3>
              <p className="mt-1 text-sm text-gray-500">
                Créez votre premier lot de production.
              </p>
              <div className="mt-6">
                <Link
                  to="/transformer/production/batches/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  <FiPlus className="h-4 w-4 mr-2" />
                  Créer un lot
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default TransformerDashboard;
