import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { restaurateurService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import { FiTrendingUp, FiDollarSign, FiPackage, FiShoppingBag, FiUsers, FiBarChart, FiCheckCircle, FiClock } from 'react-icons/fi';

const Stats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [salesAnalytics, setSalesAnalytics] = useState(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (user?.userType === 'restaurateur') {
        try {
          setLoading(true);
          const [statsResponse, salesResponse, revenueResponse, ordersResponse] = await Promise.all([
            restaurateurService.getStats(),
            restaurateurService.getSalesAnalytics(),
            restaurateurService.getRevenueAnalytics(),
            restaurateurService.getOrders()
          ]);

          setStats(statsResponse.data.data?.stats || statsResponse.data.stats || statsResponse.data);
          setSalesAnalytics(salesResponse.data.data?.analytics || salesResponse.data.analytics || salesResponse.data);
          setRevenueAnalytics(revenueResponse.data.data?.analytics || revenueResponse.data.analytics || revenueResponse.data);
          
          // Filtrer uniquement les commandes où le restaurateur est vendeur (commandes reçues)
          const ordersData = ordersResponse.data.data?.orders || ordersResponse.data.orders || [];
          const receivedOrders = ordersData.filter(order => order.role === 'seller' || (!order.role && order.seller));
          setOrders(Array.isArray(receivedOrders) ? receivedOrders : []);
        } catch (error) {
          console.error('Erreur lors du chargement des statistiques:', error);
          setStats(null);
          setSalesAnalytics(null);
          setRevenueAnalytics(null);
          setOrders([]);
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

  // Calculer les statuts des commandes
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
  const inTransitOrders = orders.filter(o => o.status === 'in-transit' || o.status === 'shipped').length;

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-20">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Statistiques de Vente</h1>
          <p className="text-gray-600 mt-1">Analysez les performances de votre restaurant</p>
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
                    {orders.length || stats?.totalOrders || 0}
                  </dd>
                  <dd className="text-xs text-gray-500 mt-1">
                    {completedOrders} complétées
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
                    Plats vendus
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.totalProductsSold || stats?.totalDishesSold || 0}
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

        {/* Ventes mensuelles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Ventes par mois */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiBarChart className="h-5 w-5 mr-2 text-blue-500" />
              Ventes par mois
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {salesAnalytics?.monthlySales && salesAnalytics.monthlySales.length > 0 ? (
                salesAnalytics.monthlySales.slice(0, 6).map((sale, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-harvests-light rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{sale.month}</p>
                      <p className="text-xs text-gray-500">{sale.orders} commande{sale.orders > 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{sale.products} plats</p>
                      <p className="text-xs text-green-600 font-medium">{(sale.revenue || 0).toLocaleString()} FCFA</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiBarChart className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm">Aucune donnée de vente disponible</p>
                </div>
              )}
            </div>
          </div>

          {/* Revenus par mois */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiDollarSign className="h-5 w-5 mr-2 text-green-500" />
              Revenus par mois
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {revenueAnalytics?.monthlyRevenue && revenueAnalytics.monthlyRevenue.length > 0 ? (
                revenueAnalytics.monthlyRevenue.slice(0, 6).map((rev, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{rev.month}</p>
                    <p className="text-base font-bold text-green-600">{(rev.revenue || 0).toLocaleString()} FCFA</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiDollarSign className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm">Aucune donnée de revenus disponible</p>
                </div>
              )}
            </div>
            
            {revenueAnalytics?.currentMonthRevenue !== undefined && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mois en cours</span>
                  <span className="text-lg font-bold text-primary-600">
                    {revenueAnalytics.currentMonthRevenue.toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Détails des plats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Plats les plus vendus */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiTrendingUp className="h-5 w-5 mr-2 text-green-500" />
              Plats les plus vendus
            </h3>
            <div className="overflow-hidden">
              {stats?.topProducts && stats.topProducts.length > 0 ? (
                <div className="space-y-3">
                  {stats.topProducts.map((dish, index) => (
                    <div key={dish.id || index} className="flex items-center justify-between p-3 bg-harvests-light rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center flex-1">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{dish.name}</p>
                          <p className="text-xs text-gray-500">{dish.category}</p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-bold text-gray-900">{dish.quantitySold} vendus</p>
                        <p className="text-xs text-green-600 font-medium">{(dish.revenue || 0).toLocaleString()} FCFA</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm">Aucun plat vendu pour le moment</p>
                </div>
              )}
            </div>
          </div>

          {/* Statut des plats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiPackage className="h-5 w-5 mr-2 text-purple-500" />
              Statut des plats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Plats actifs</span>
                </div>
                <span className="text-xl font-bold text-green-600">{stats?.activeProducts || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-harvests-light rounded-lg">
                <div className="flex items-center">
                  <FiPackage className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Total plats</span>
                </div>
                <span className="text-xl font-bold text-gray-600">{stats?.totalProducts || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <FiShoppingBag className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Unités vendues</span>
                </div>
                <span className="text-xl font-bold text-blue-600">{stats?.totalProductsSold || stats?.totalDishesSold || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statuts des commandes */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FiShoppingBag className="h-5 w-5 mr-2 text-blue-500" />
            Statuts des commandes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">En attente</span>
                <FiClock className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
              <p className="text-xs text-gray-600 mt-1">À traiter</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">En transit</span>
                <FiShoppingBag className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{inTransitOrders}</div>
              <p className="text-xs text-gray-600 mt-1">En livraison</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Complétées</span>
                <FiCheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-600">{completedOrders}</div>
              <p className="text-xs text-gray-600 mt-1">Livrées avec succès</p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Annulées</span>
                <FiPackage className="h-5 w-5 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-red-600">{cancelledOrders}</div>
              <p className="text-xs text-gray-600 mt-1">Non abouties</p>
            </div>
          </div>
        </div>

        {/* Résumé des performances */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg shadow-xl text-white p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6">Résumé des Performances</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">
                {stats?.averageOrderValue ? `${Math.round(stats.averageOrderValue).toLocaleString()}` : '0'}
              </p>
              <p className="text-sm text-white/80">Valeur moyenne commande (FCFA)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">
                {stats?.conversionRate || 0}%
              </p>
              <p className="text-sm text-white/80">Taux de conversion</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">
                {stats?.customerRetentionRate || 0}%
              </p>
              <p className="text-sm text-white/80">Taux de fidélisation</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">
                {stats?.uniqueCustomers || 0}
              </p>
              <p className="text-sm text-white/80">Clients uniques</p>
            </div>
          </div>
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default Stats;

