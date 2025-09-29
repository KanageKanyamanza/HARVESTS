import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Calendar,
  Download
} from 'lucide-react';

import { adminService } from '../../services/adminService';

const AdminAnalytics = () => {
  const { t, i18n } = useTranslation();
  const [analytics, setAnalytics] = useState({
    overview: {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      userGrowth: 0,
      productGrowth: 0,
      orderGrowth: 0,
      revenueGrowth: 0
    },
    charts: {
      userRegistrations: [],
      productCreations: [],
      orderTrends: [],
      revenueTrends: [],
      categoryDistribution: [],
      topProducers: [],
      topProducts: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  // Fonction loadAnalytics mémorisée pour éviter les re-rendus
  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getAnalytics({ timeRange });
      console.log('🔍 AdminAnalytics - Response:', response.data);
      
      // Vérifier si la réponse contient des analytics
      if (response.data && response.data.analytics) {
        console.log('📊 AdminAnalytics - Analytics:', response.data.analytics);
        setAnalytics(response.data.analytics);
      } else if (response.data && response.data.data) {
        // Structure alternative avec data
        console.log('📊 AdminAnalytics - Analytics (alt):', response.data.data);
        setAnalytics(response.data.data);
      } else {
        console.log('❌ AdminAnalytics - No analytics found in response:', response.data);
        // Garder les valeurs par défaut
      }
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
      // Garder les valeurs par défaut
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    if (i18n.isInitialized) {
      loadAnalytics();
    }
  }, [i18n.isInitialized, loadAnalytics]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? TrendingUp : TrendingDown;
  };

  if (!i18n.isInitialized || loading) {
    return (
      <div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.analytics')}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('admin.analyticsDescription')}
            </p>
          </div>
          <div className="flex space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="7d">{t('admin.last7Days')}</option>
              <option value="30d">{t('admin.last30Days')}</option>
              <option value="90d">{t('admin.last90Days')}</option>
              <option value="1y">{t('admin.lastYear')}</option>
            </select>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">
              <Download className="h-4 w-4 inline mr-2" />
              {t('admin.exportData')}
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('admin.totalUsers')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatNumber(analytics.overview.totalUsers)}
                    </dd>
                    <dd className={`text-sm ${getGrowthColor(analytics.overview.userGrowth)}`}>
                      {(() => {
                        const Icon = getGrowthIcon(analytics.overview.userGrowth);
                        return (
                          <div className="flex items-center">
                            <Icon className="h-4 w-4 mr-1" />
                            {Math.abs(analytics.overview.userGrowth)}%
                          </div>
                        );
                      })()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('admin.totalProducts')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatNumber(analytics.overview.totalProducts)}
                    </dd>
                    <dd className={`text-sm ${getGrowthColor(analytics.overview.productGrowth)}`}>
                      {(() => {
                        const Icon = getGrowthIcon(analytics.overview.productGrowth);
                        return (
                          <div className="flex items-center">
                            <Icon className="h-4 w-4 mr-1" />
                            {Math.abs(analytics.overview.productGrowth)}%
                          </div>
                        );
                      })()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingCart className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('admin.totalOrders')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatNumber(analytics.overview.totalOrders)}
                    </dd>
                    <dd className={`text-sm ${getGrowthColor(analytics.overview.orderGrowth)}`}>
                      {(() => {
                        const Icon = getGrowthIcon(analytics.overview.orderGrowth);
                        return (
                          <div className="flex items-center">
                            <Icon className="h-4 w-4 mr-1" />
                            {Math.abs(analytics.overview.orderGrowth)}%
                          </div>
                        );
                      })()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('admin.totalRevenue')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatPrice(analytics.overview.totalRevenue)}
                    </dd>
                    <dd className={`text-sm ${getGrowthColor(analytics.overview.revenueGrowth)}`}>
                      {(() => {
                        const Icon = getGrowthIcon(analytics.overview.revenueGrowth);
                        return (
                          <div className="flex items-center">
                            <Icon className="h-4 w-4 mr-1" />
                            {Math.abs(analytics.overview.revenueGrowth)}%
                          </div>
                        );
                      })()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* User Registrations Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('admin.userRegistrations')}
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>{t('admin.chartPlaceholder')}</p>
              </div>
            </div>
          </div>

          {/* Revenue Trends Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('admin.revenueTrends')}
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>{t('admin.chartPlaceholder')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Producers and Products */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top Producers */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {t('admin.topProducers')}
              </h3>
              <div className="mt-5">
                <div className="flow-root">
                  <ul className="-my-5 divide-y divide-gray-200">
                    {analytics.charts.topProducers.map((producer, index) => (
                      <li key={producer._id} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {producer.farmName?.charAt(0) || producer.firstName?.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {producer.farmName || `${producer.firstName} ${producer.lastName}`}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {producer.address?.city}
                            </p>
                          </div>
                          <div className="flex-shrink-0 text-sm text-gray-500">
                            #{index + 1}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {t('admin.topProducts')}
              </h3>
              <div className="mt-5">
                <div className="flow-root">
                  <ul className="-my-5 divide-y divide-gray-200">
                    {analytics.charts.topProducts.map((product, index) => (
                      <li key={product._id} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                          <div className="flex-shrink-0 text-sm text-gray-500">
                            #{index + 1}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
