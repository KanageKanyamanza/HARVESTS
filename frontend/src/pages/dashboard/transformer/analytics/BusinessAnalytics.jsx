import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../../../hooks/useAuth';
import { transformerService } from '../../../../services';
import ModularDashboardLayout from '../../../../components/layout/ModularDashboardLayout';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiPackage,
  FiUsers,
  FiAward,
  FiCalendar,
  FiBarChart2,
  FiPieChart,
  FiActivity
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const BusinessAnalytics = () => {
  // const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  // Charger les analytics
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const response = await transformerService.getBusinessStats();
        setAnalytics(response.data?.data || {});
      } catch (error) {
        console.error('Erreur lors du chargement des analytics:', error);
        // Données de démonstration
        setAnalytics({
          overview: {
            totalOrders: 45,
            totalRevenue: 1250000,
            averageOrderValue: 27778,
            completionRate: 94.2,
            customerSatisfaction: 4.6,
            monthlyGrowth: 12.5
          },
          revenue: {
            current: 1250000,
            previous: 1100000,
            growth: 13.6
          },
          orders: {
            current: 45,
            previous: 38,
            growth: 18.4
          },
          trends: {
            revenue: [
              { month: 'Jan', revenue: 800000, orders: 25 },
              { month: 'Fév', revenue: 950000, orders: 32 },
              { month: 'Mar', revenue: 1100000, orders: 38 },
              { month: 'Avr', revenue: 1250000, orders: 45 }
            ],
            orders: [
              { month: 'Jan', completed: 23, pending: 2, cancelled: 0 },
              { month: 'Fév', completed: 30, pending: 2, cancelled: 0 },
              { month: 'Mar', completed: 36, pending: 2, cancelled: 0 },
              { month: 'Avr', completed: 42, pending: 3, cancelled: 0 }
            ]
          },
          topClients: [
            { name: 'Restaurant Le Gourmet', orders: 12, revenue: 450000 },
            { name: 'Café Central', orders: 8, revenue: 280000 },
            { name: 'Boulangerie Artisanale', orders: 6, revenue: 220000 },
            { name: 'Épicerie Bio', orders: 5, revenue: 180000 },
            { name: 'Hôtel Plaza', orders: 4, revenue: 120000 }
          ],
          productTypes: [
            { name: 'Conservation', value: 35, revenue: 437500 },
            { name: 'Transformation', value: 28, revenue: 350000 },
            { name: 'Emballage', value: 22, revenue: 275000 },
            { name: 'Fabrication', value: 15, revenue: 187500 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [timeRange]);

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  if (loading) {
    return (
      <ModularDashboardLayout userType="transformer">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout userType="transformer">
      <div className="space-y-6 px-4 pb-20 pt-4">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Business</h1>
            <p className="text-gray-600 mt-1">Analysez vos performances commerciales</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
              <option value="1y">1 an</option>
            </select>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <FiDollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.overview?.totalRevenue?.toLocaleString()} FCFA
                </p>
                <div className="flex items-center mt-1">
                  <FiTrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">
                    +{analytics?.revenue?.growth}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <FiPackage className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Commandes totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.overview?.totalOrders}
                </p>
                <div className="flex items-center mt-1">
                  <FiTrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">
                    +{analytics?.orders?.growth}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <FiAward className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taux de réussite</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.overview?.completionRate}%
                </p>
                <div className="flex items-center mt-1">
                  <FiTrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">
                    +2.1%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100">
                <FiUsers className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Satisfaction client</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.overview?.customerSatisfaction}/5
                </p>
                <div className="flex items-center mt-1">
                  <FiTrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">
                    +0.2
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution des revenus */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Évolution des Revenus</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics?.trends?.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString()} FCFA`, 'Revenus']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Évolution des commandes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Évolution des Commandes</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.trends?.orders}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10B981" name="Terminées" />
                <Bar dataKey="pending" fill="#F59E0B" name="En attente" />
                <Bar dataKey="cancelled" fill="#EF4444" name="Annulées" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition par type de produit */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition par Type de Produit</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics?.productTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics?.productTypes?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top clients */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Clients</h3>
            <div className="space-y-4">
              {analytics?.topClients?.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-purple-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-500">{client.orders} commandes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {client.revenue.toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Métriques détaillées */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Métriques Détaillées</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {analytics?.overview?.averageOrderValue?.toLocaleString()} FCFA
              </div>
              <div className="text-sm text-gray-500 mt-1">Valeur moyenne par commande</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {analytics?.overview?.monthlyGrowth}%
              </div>
              <div className="text-sm text-gray-500 mt-1">Croissance mensuelle</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {analytics?.topClients?.length || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">Clients actifs</div>
            </div>
          </div>
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default BusinessAnalytics;
