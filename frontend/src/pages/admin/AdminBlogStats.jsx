import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BarChart3,
  FileText,
  Eye,
  Heart,
  ArrowLeft,
  TrendingUp
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useNotifications } from '../../contexts/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminBlogStats = () => {
  const navigate = useNavigate();
  const { showError } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    byType: [],
    byCategory: [],
    totalViews: 0,
    totalLikes: 0,
    tracking: {
      totalVisits: 0,
      uniqueVisitors: 0,
      deviceBreakdown: [],
      topCountries: []
    }
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getBlogStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      showError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques des Blogs</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble des performances</p>
        </div>
        <Link
          to="/admin/blog/analytics"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <BarChart3 className="w-5 h-5" />
          Analytics détaillées
        </Link>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total des blogs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total || 0}</p>
            </div>
            <FileText className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Publiés</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.published || 0}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Brouillons</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.draft || 0}</p>
            </div>
            <FileText className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vues totales</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalViews || 0}</p>
            </div>
            <Eye className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Répartition par type */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Répartition par type</h2>
          {stats.byType && stats.byType.length > 0 ? (
            <div className="space-y-3">
              {stats.byType.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <span className="text-gray-700 capitalize">{item._id || 'N/A'}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${(item.count / stats.total) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune donnée</p>
          )}
        </div>

        {/* Répartition par catégorie */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Répartition par catégorie</h2>
          {stats.byCategory && stats.byCategory.length > 0 ? (
            <div className="space-y-3">
              {stats.byCategory.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <span className="text-gray-700 capitalize">{item._id || 'N/A'}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(item.count / stats.total) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune donnée</p>
          )}
        </div>
      </div>

      {/* Engagement */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Engagement</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <Eye className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Vues totales</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalViews || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Heart className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Likes totaux</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLikes || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking */}
      {stats.tracking && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tracking</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Total des visites</p>
              <p className="text-2xl font-bold text-gray-900">{stats.tracking.totalVisits || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Visiteurs uniques</p>
              <p className="text-2xl font-bold text-gray-900">{stats.tracking.uniqueVisitors || 0}</p>
            </div>
          </div>

          {stats.tracking.deviceBreakdown && stats.tracking.deviceBreakdown.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Répartition par appareil</h3>
              <div className="space-y-2">
                {stats.tracking.deviceBreakdown.map((device) => (
                  <div key={device._id} className="flex items-center justify-between">
                    <span className="text-gray-700 capitalize">{device._id || 'N/A'}</span>
                    <span className="text-sm font-medium text-gray-900">{device.count || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.tracking.topCountries && stats.tracking.topCountries.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Pays</h3>
              <div className="space-y-2">
                {stats.tracking.topCountries.slice(0, 10).map((country) => (
                  <div key={country._id} className="flex items-center justify-between">
                    <span className="text-gray-700">{country._id || 'N/A'}</span>
                    <span className="text-sm font-medium text-gray-900">{country.count || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBlogStats;

