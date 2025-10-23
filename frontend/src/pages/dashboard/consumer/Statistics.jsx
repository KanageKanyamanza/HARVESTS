import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiDollarSign, FiStar, FiShoppingBag, FiEye, FiCalendar, FiAward } from 'react-icons/fi';
import { consumerService } from '../../../services/genericService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../components/common/ErrorMessage';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const [statsResponse, analyticsResponse] = await Promise.allSettled([
        consumerService.getStats(),
        consumerService.getSpendingAnalytics()
      ]);

      if (statsResponse.status === 'fulfilled' && statsResponse.value.data.status === 'success') {
        setStats(statsResponse.value.data.data);
      }

      if (analyticsResponse.status === 'fulfilled' && analyticsResponse.value.data.status === 'success') {
        setAnalytics(analyticsResponse.value.data.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError('Impossible de charger vos statistiques');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  const statsData = stats?.stats || {};
  const activityStats = stats?.activityStats || {};
  const loyaltyStats = stats?.loyaltyStats || {};
  const analyticsData = analytics?.analytics || {};

  return (
    <ModularDashboardLayout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FiTrendingUp className="h-8 w-8 text-green-600 mr-3" />
            Mes Statistiques
          </h1>
          <p className="mt-2 text-gray-600">
            Consultez vos statistiques détaillées et votre activité
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-50">
                <FiShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Commandes totales</p>
                <p className="text-2xl font-bold text-gray-900">{statsData.totalOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-50">
                <FiDollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Montant dépensé</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(statsData.totalSpent || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-50">
                <FiStar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avis laissés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activityStats.reviewsWritten || 0}
                </p>
                <p className="text-xs text-gray-500">
                  Note moyenne: {activityStats.averageRatingGiven?.toFixed(1) || '0.0'}/5
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-50">
                <FiEye className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vues du profil</p>
                <p className="text-2xl font-bold text-gray-900">{statsData.profileViews || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Activité */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiCalendar className="h-5 w-5 text-green-600 mr-2" />
              Activité
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Commandes complétées</span>
                <span className="font-medium">{activityStats.completedOrders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Commandes annulées</span>
                <span className="font-medium">{activityStats.cancelledOrders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avis laissés</span>
                <span className="font-medium">{activityStats.reviewsWritten || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Note moyenne donnée</span>
                <span className="font-medium">
                  {activityStats.averageRatingGiven?.toFixed(1) || '0.0'}/5
                </span>
              </div>
              {activityStats.lastOrderDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Dernière commande</span>
                  <span className="font-medium">
                    {formatDate(activityStats.lastOrderDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Programme de fidélité */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiAward className="h-5 w-5 text-yellow-600 mr-2" />
              Programme de fidélité
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Points actuels</span>
                <span className="font-medium">{loyaltyStats.points || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Niveau</span>
                <span className="font-medium capitalize">{loyaltyStats.tier || 'Bronze'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Points gagnés</span>
                <span className="font-medium">{loyaltyStats.totalPointsEarned || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Points utilisés</span>
                <span className="font-medium">{loyaltyStats.totalPointsRedeemed || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics de dépenses */}
        {analyticsData && Object.keys(analyticsData).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiTrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              Analytics de dépenses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600">Valeur moyenne des commandes</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(analyticsData.averageOrderValue || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Commandes ce mois</p>
                <p className="text-xl font-bold text-gray-900">
                  {analyticsData.ordersThisMonth || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dépensé ce mois</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(analyticsData.spentThisMonth || 0)}
                </p>
              </div>
              {analyticsData.lastOrderDate && (
                <div>
                  <p className="text-sm text-gray-600">Dernière commande</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatDate(analyticsData.lastOrderDate)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default Statistics;
