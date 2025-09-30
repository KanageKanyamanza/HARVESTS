import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { producerService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import { FiTrendingUp, FiDollarSign, FiPackage, FiShoppingBag, FiUsers, FiBarChart } from 'react-icons/fi';

const Stats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [salesAnalytics, setSalesAnalytics] = useState(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (user?.userType === 'producer') {
        try {
          setLoading(true);
          const [statsResponse, salesResponse, revenueResponse] = await Promise.all([
            producerService.getStats(),
            producerService.getSalesAnalytics(),
            producerService.getRevenueAnalytics()
          ]);

          setStats(statsResponse.data.stats || statsResponse.data);
          setSalesAnalytics(salesResponse.data.analytics || salesResponse.data);
          setRevenueAnalytics(revenueResponse.data.analytics || revenueResponse.data);
        } catch (error) {
          console.error('Erreur lors du chargement des statistiques:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadStats();
  }, [user]);

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-7xl mx-auto pb-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-20">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-gray-600 mt-1">Analysez les performances de votre activité</p>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiDollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Revenus totaux
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {(stats?.totalRevenue || 0).toLocaleString()} FCFA
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiShoppingBag className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Commandes totales
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.totalOrders || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiPackage className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Produits vendus
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.totalProductsSold || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiUsers className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Clients uniques
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.uniqueCustomers || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Ventes par mois */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiBarChart className="h-5 w-5 mr-2" />
              Ventes par mois
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              {salesAnalytics?.monthlySales ? (
                <div className="text-center">
                  <p className="text-sm">Graphique des ventes mensuelles</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {salesAnalytics.monthlySales.length} mois de données
                  </p>
                </div>
              ) : (
                <p className="text-sm">Aucune donnée de vente disponible</p>
              )}
            </div>
          </div>

          {/* Revenus par mois */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiTrendingUp className="h-5 w-5 mr-2" />
              Revenus par mois
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              {revenueAnalytics?.monthlyRevenue ? (
                <div className="text-center">
                  <p className="text-sm">Graphique des revenus mensuels</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {revenueAnalytics.monthlyRevenue.length} mois de données
                  </p>
                </div>
              ) : (
                <p className="text-sm">Aucune donnée de revenus disponible</p>
              )}
            </div>
          </div>
        </div>

        {/* Produits les plus vendus */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Produits les plus vendus
          </h3>
          <div className="overflow-hidden">
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.topProducts.map((product, index) => (
                  <div key={product.id || index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                        {index + 1}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{product.quantitySold} vendus</p>
                      <p className="text-sm text-gray-500">{(product.revenue || 0).toLocaleString()} FCFA</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm">Aucun produit vendu pour le moment</p>
              </div>
            )}
          </div>
        </div>

        {/* Résumé des performances */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Résumé des performances
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {stats?.averageOrderValue ? `${stats.averageOrderValue.toLocaleString()} FCFA` : '0 FCFA'}
              </p>
              <p className="text-sm text-gray-500">Valeur moyenne des commandes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {stats?.conversionRate ? `${stats.conversionRate}%` : '0%'}
              </p>
              <p className="text-sm text-gray-500">Taux de conversion</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {stats?.customerRetentionRate ? `${stats.customerRetentionRate}%` : '0%'}
              </p>
              <p className="text-sm text-gray-500">Taux de fidélisation</p>
            </div>
          </div>
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default Stats;
