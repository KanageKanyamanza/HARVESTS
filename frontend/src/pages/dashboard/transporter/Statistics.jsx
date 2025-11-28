import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { transporterService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import { FaChartBar } from 'react-icons/fa';
import { FiTrendingUp, FiTruck, FiMapPin, FiDollarSign, FiClock } from 'react-icons/fi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const Statistics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (user?.userType === 'transporter') {
        try {
          setLoading(true);
          const response = await transporterService.getStats();
          console.log('[Statistics] Stats response:', response);
          // La réponse est { status: 'success', data: { stats: {...} } }
          // Donc response.data = { status: 'success', data: { stats: {...} } }
          // Et response.data.data = { stats: {...} }
          // Donc response.data.data.stats = { performanceStats: {...}, ... }
          const statsData = response.data?.data?.stats || response.data?.stats || response.data;
          setStats(statsData);
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
        <div className="p-6 max-w-7xl mx-auto">
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="Chargement des statistiques..." />
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Statistiques de livraison</h1>
          <p className="text-gray-600 mt-1">
            Analysez vos performances de livraison locale
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Livraisons totales</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stats?.performanceStats?.totalDeliveries || stats?.totalDeliveries || stats?.totalOrders || 0}
                  </p>
                </div>
                <FiTruck className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenu total</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stats?.performanceStats?.totalRevenue || stats?.totalRevenue || stats?.totalValue ? new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XOF'
                    }).format(stats?.performanceStats?.totalRevenue || stats?.totalRevenue || stats?.totalValue) : '0 XOF'}
                  </p>
                </div>
                <FiDollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Zones de service</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {typeof stats?.serviceAreas === 'number' ? stats.serviceAreas : (stats?.serviceAreas?.length || stats?.deliveryZones || 0)}
                  </p>
                </div>
                <FiMapPin className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Temps moyen</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stats.averageDeliveryTime ? `${stats.averageDeliveryTime} min` : 'N/A'}
                  </p>
                </div>
                <FiClock className="h-8 w-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Livraisons actives</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stats?.activeDeliveries || stats?.performanceStats?.pendingDeliveries || stats?.pendingOrders || 0}
                  </p>
                </div>
                <FiTrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taux de réussite</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stats?.performanceStats?.onTimeDeliveryRate || stats?.successfulDeliveryRate ? `${stats?.performanceStats?.onTimeDeliveryRate || stats?.successfulDeliveryRate}%` : '0%'}
                  </p>
                </div>
                <FaChartBar className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenu mensuel</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stats.monthlyRevenue ? new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XOF'
                    }).format(stats.monthlyRevenue) : '0 XOF'}
                  </p>
                </div>
                <FiDollarSign className="h-8 w-8 text-teal-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stats.averageRating?.toFixed(1) || '0.0'}
                  </p>
                </div>
                <FaChartBar className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>
        )}

        {!stats && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FiTruck className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune statistique disponible</h3>
            <p className="mt-2 text-gray-600">
              Vos statistiques apparaîtront ici une fois que vous commencerez à effectuer des livraisons.
            </p>
          </div>
        )}
      </div>
    </ModularDashboardLayout>
  );
};

export default Statistics;

