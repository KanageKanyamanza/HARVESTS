import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BarChart3,
  ArrowLeft,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Globe,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useNotifications } from '../../contexts/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminBlogAnalytics = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [filters, setFilters] = useState({
    blogId: '',
    country: '',
    deviceType: '',
    dateFrom: '',
    dateTo: ''
  });
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState({
    totalVisits: 0,
    uniqueVisitors: 0,
    totalLikes: 0,
    deviceBreakdown: [],
    topCountries: []
  });

  useEffect(() => {
    loadBlogs();
    loadVisits();
  }, [pagination.current, filters]);

  const loadBlogs = async () => {
    try {
      const response = await adminService.getBlogs({ limit: 1000 });
      if (response.success && response.data) {
        setBlogs(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des blogs:', error);
    }
  };

  const loadVisits = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: 50,
        ...filters
      };
      
      // Nettoyer les paramètres vides
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await adminService.getAllBlogVisits(params);
      
      if (response.success) {
        setVisits(response.data || []);
        setPagination(response.pagination || {
          current: 1,
          pages: 1,
          total: 0
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des visites:', error);
      showError('Erreur lors du chargement des visites');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      blogId: '',
      country: '',
      deviceType: '',
      dateFrom: '',
      dateTo: ''
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const exportToCSV = () => {
    // Créer le CSV
    const headers = ['Date', 'Article', 'Pays', 'Ville', 'Appareil', 'Navigateur', 'Durée (s)', 'Scroll (%)', 'Référent'];
    const rows = visits.map(visit => [
      new Date(visit.visitedAt).toLocaleString('fr-FR'),
      visit.blog?.title?.fr || visit.blog?.title?.en || 'N/A',
      visit.country || 'N/A',
      visit.city || 'N/A',
      visit.device?.type || 'N/A',
      visit.device?.browser || 'N/A',
      visit.timeOnPage || 0,
      visit.scrollDepth || 0,
      visit.referrerDomain || 'Direct'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `blog-visits-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess('Export CSV réussi');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const getDeviceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            to="/admin/blog/stats"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux statistiques
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Détaillées</h1>
          <p className="text-gray-600 mt-1">Analysez les visites et comportements des visiteurs</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadVisits}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="w-5 h-5" />
            Actualiser
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-5 h-5" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm text-gray-600">Total des vues</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalVisits || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm text-gray-600">Visiteurs uniques</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.uniqueVisitors || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm text-gray-600">Total des visites</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{pagination.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm text-gray-600">Total des likes</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalLikes || 0}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Blog</label>
            <select
              value={filters.blogId}
              onChange={(e) => handleFilterChange('blogId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Tous les blogs</option>
              {blogs.map((blog) => (
                <option key={blog._id} value={blog._id}>
                  {blog.title?.fr || blog.title?.en || blog._id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
            <input
              type="text"
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              placeholder="Ex: France"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Appareil</label>
            <select
              value={filters.deviceType}
              onChange={(e) => handleFilterChange('deviceType', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Tous</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      {/* Tableau des visites */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        ) : visits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune visite trouvée</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Localisation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appareil</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durée</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scroll</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référent</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {visits.map((visit) => (
                    <tr key={visit._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(visit.visitedAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {visit.blog?.title?.fr || visit.blog?.title?.en || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {visit.country || 'N/A'}
                          {visit.city && `, ${visit.city}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(visit.device?.type)}
                          <span className="capitalize">{visit.device?.type || 'N/A'}</span>
                          {visit.device?.browser && (
                            <span className="text-gray-400">• {visit.device.browser}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {visit.timeOnPage ? `${Math.round(visit.timeOnPage)}s` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {visit.scrollDepth ? `${Math.round(visit.scrollDepth)}%` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {visit.referrerDomain || 'Direct'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Affichage de {(pagination.current - 1) * 50 + 1} à {Math.min(pagination.current * 50, pagination.total)} sur {pagination.total} résultats
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, current: Math.max(1, prev.current - 1) }))}
                    disabled={pagination.current === 1}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, current: Math.min(prev.pages, prev.current + 1) }))}
                    disabled={pagination.current === pagination.pages}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminBlogAnalytics;

