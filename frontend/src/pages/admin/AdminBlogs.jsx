import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  Calendar,
  User,
  FileText,
  ExternalLink
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useNotifications } from '../../contexts/NotificationContext';
import CloudinaryImage from '../../components/common/CloudinaryImage';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminBlogs = () => {
  const { showSuccess, showError } = useNotifications();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fonction utilitaire pour extraire le texte multilingue
  const getLocalizedText = (text, fallback = '') => {
    if (!text) return fallback;
    if (typeof text === 'string') return text;
    if (typeof text === 'object') {
      return text.fr || text.en || fallback;
    }
    return fallback;
  };

  useEffect(() => {
    loadBlogs();
  }, [currentPage, statusFilter, typeFilter, categoryFilter, searchTerm]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        category: categoryFilter || undefined
      };
      
      const response = await adminService.getBlogs(params);
      
      if (response.success) {
        let blogsData = response.data || [];
        
        // Filtrer par recherche si nécessaire
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          blogsData = blogsData.filter(blog => {
            const title = getLocalizedText(blog.title).toLowerCase();
            const excerpt = getLocalizedText(blog.excerpt).toLowerCase();
            return title.includes(searchLower) || excerpt.includes(searchLower);
          });
        }
        
        setBlogs(blogsData);
        setTotalPages(response.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des blogs:', error);
      showError('Erreur lors du chargement des blogs');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce blog ?')) {
      return;
    }

    try {
      await adminService.deleteBlog(blogId);
      setBlogs(blogs.filter(b => b._id !== blogId));
      showSuccess('Blog supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showError('Erreur lors de la suppression du blog');
    }
  };

  const handleTogglePublish = async (blog) => {
    try {
      const newStatus = blog.status === 'published' ? 'draft' : 'published';
      await adminService.updateBlog(blog._id, { status: newStatus });
      
      setBlogs(blogs.map(b => 
        b._id === blog._id ? { ...b, status: newStatus } : b
      ));
      
      showSuccess(
        newStatus === 'published' 
          ? 'Blog publié avec succès' 
          : 'Blog dépublié avec succès'
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      showError('Erreur lors de la mise à jour du statut');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      published: { color: 'bg-green-100 text-green-800', label: 'Publié' },
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Brouillon' },
      archived: { color: 'bg-gray-100 text-gray-800', label: 'Archivé' }
    };
    const badge = badges[status] || badges.draft;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const types = {
      article: { color: 'bg-blue-100 text-blue-800', label: 'Article' },
      'etude-cas': { color: 'bg-purple-100 text-purple-800', label: 'Étude de cas' },
      tutoriel: { color: 'bg-orange-100 text-orange-800', label: 'Tutoriel' },
      actualite: { color: 'bg-red-100 text-red-800', label: 'Actualité' },
      temoignage: { color: 'bg-pink-100 text-pink-800', label: 'Témoignage' }
    };
    const typeInfo = types[type] || types.article;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeInfo.color}`}>
        {typeInfo.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Chargement des blogs..." />
      </div>
    );
  }

  return (
    <div className="p-6 overflow-x-auto">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Blogs</h1>
          <p className="text-gray-600 mt-1">Créez et gérez vos articles de blog</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/blog/stats"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            Statistiques
          </Link>
          <Link
            to="/admin/blog/create"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau Blog
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">Tous les statuts</option>
            <option value="published">Publié</option>
            <option value="draft">Brouillon</option>
            <option value="archived">Archivé</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">Tous les types</option>
            <option value="article">Article</option>
            <option value="etude-cas">Étude de cas</option>
            <option value="tutoriel">Tutoriel</option>
            <option value="actualite">Actualité</option>
            <option value="temoignage">Témoignage</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">Toutes les catégories</option>
            <option value="strategie">Stratégie</option>
            <option value="technologie">Technologie</option>
            <option value="finance">Finance</option>
            <option value="ressources-humaines">Ressources Humaines</option>
            <option value="marketing">Marketing</option>
            <option value="operations">Opérations</option>
            <option value="gouvernance">Gouvernance</option>
          </select>
        </div>
      </div>

      {/* Liste des blogs */}
      {blogs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun blog trouvé</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter || typeFilter || categoryFilter
              ? 'Essayez de modifier vos filtres'
              : 'Commencez par créer votre premier blog'}
          </p>
          {!searchTerm && !statusFilter && !typeFilter && !categoryFilter && (
            <Link
              to="/admin/blog/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Créer un blog
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blog
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type / Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 truncate max-w-[250px]">
                      <div className="flex items-center gap-3">
                        {blog.featuredImage?.url && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <CloudinaryImage
                              src={blog.featuredImage.url}
                              alt={getLocalizedText(blog.title)}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getLocalizedText(blog.title)}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {getLocalizedText(blog.excerpt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {getTypeBadge(blog.type)}
                        {blog.category && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                            {blog.category}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(blog.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {blog.author ? (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {blog.author.firstName} {blog.author.lastName}
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(blog.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {blog.views || 0}
                        </span>
                        <span>❤️ {blog.likes || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/blog/${getLocalizedText(blog.slug)}?preview=true&admin=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Voir l'article"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => navigate(`/admin/blog/edit/${blog._id}`)}
                          className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleTogglePublish(blog)}
                          className="p-2 text-green-400 hover:text-green-600 transition-colors"
                          title={blog.status === 'published' ? 'Dépublier' : 'Publier'}
                        >
                          {blog.status === 'published' ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(blog._id)}
                          className="p-2 text-red-400 hover:text-red-600 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  const isCurrentPage = page === currentPage;
                  const isNearCurrent = Math.abs(page - currentPage) <= 2;
                  const isFirstOrLast = page === 1 || page === totalPages;

                  if (!isNearCurrent && !isFirstOrLast) {
                    if (page === 2 || page === totalPages - 1) {
                      return (
                        <span key={page} className="px-3 py-2 text-sm text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        isCurrentPage
                          ? 'bg-green-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminBlogs;

