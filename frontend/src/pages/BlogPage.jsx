import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { blogApiService } from '../services/blogService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CloudinaryImage from '../components/common/CloudinaryImage';
import { FiSearch, FiCalendar, FiEye, FiHeart, FiTag } from 'react-icons/fi';

// Fonction simple pour formater les dates
const formatDate = (dateString, language = 'fr') => {
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', options);
};

const BlogPage = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const language = i18n.language || 'fr';

  const loadBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 10,
        lang: language
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedType) params.type = selectedType;
      if (selectedCategory) params.category = selectedCategory;

      const response = await blogApiService.getBlogs(params);

      if (response.data.success) {
        setBlogs(response.data.data || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des blogs:', error);
      setError('Erreur lors du chargement des blogs');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedType, selectedCategory, language]);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  // Recharger lors du changement de langue
  useEffect(() => {
    loadBlogs();
  }, [i18n.language]);

  const handleBlogClick = (blog) => {
    navigate(`/blog/${blog.slug}`);
  };

  const handleLike = async (e, blogId) => {
    e.stopPropagation();
    try {
      await blogApiService.likeBlog(blogId);
      // Recharger les blogs pour mettre à jour les likes
      loadBlogs();
    } catch (error) {
      console.error('Erreur lors du like:', error);
    }
  };

  const getLocalizedContent = (content, fallback) => {
    if (typeof content === 'string') return content;
    return content?.[language] || content?.fr || content?.en || fallback || '';
  };

  const translateTag = (tag) => {
    return t(`blog.tags.${tag}`, tag);
  };

  const getTypeLabel = (type) => {
    return t(`blog.types.${type}`, type);
  };

  const getCategoryLabel = (category) => {
    return t(`blog.categories.${category}`, category);
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="min-h-screen bg-harvests-light flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-harvests-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('blog.title', 'Blog')}
          </h1>
          <p className="text-gray-600">
            {t('blog.subtitle', 'Découvrez nos articles, actualités et ressources')}
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('blog.searchPlaceholder', 'Rechercher...')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t('blog.types.all', 'Tous les types')}</option>
              <option value="article">{t('blog.types.article', 'Article')}</option>
              <option value="etude-cas">{t('blog.types.etude-cas', 'Étude de cas')}</option>
              <option value="tutoriel">{t('blog.types.tutoriel', 'Tutoriel')}</option>
              <option value="actualite">{t('blog.types.actualite', 'Actualité')}</option>
              <option value="temoignage">{t('blog.types.temoignage', 'Témoignage')}</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t('blog.categories.all', 'Toutes les catégories')}</option>
              <option value="strategie">{t('blog.categories.strategie', 'Stratégie')}</option>
              <option value="technologie">{t('blog.categories.technologie', 'Technologie')}</option>
              <option value="finance">{t('blog.categories.finance', 'Finance')}</option>
              <option value="ressources-humaines">{t('blog.categories.ressources-humaines', 'Ressources Humaines')}</option>
              <option value="marketing">{t('blog.categories.marketing', 'Marketing')}</option>
              <option value="operations">{t('blog.categories.operations', 'Opérations')}</option>
              <option value="gouvernance">{t('blog.categories.gouvernance', 'Gouvernance')}</option>
            </select>
          </div>
        </div>

        {/* Liste des blogs */}
        {error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={loadBlogs}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {t('blog.retry', 'Réessayer')}
            </button>
          </div>
        ) : blogs.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <div
                  key={blog._id}
                  onClick={() => handleBlogClick(blog)}
                  className="bg-white rounded-lg shadow-sm border overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                >
                  {blog.featuredImage?.url && (
                    <div className="h-48 overflow-hidden">
                      <CloudinaryImage
                        src={blog.featuredImage.url}
                        alt={blog.featuredImage.alt || getLocalizedContent(blog.title)}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-green-600 uppercase">
                        {getTypeLabel(blog.type)}
                      </span>
                      {blog.category && (
                        <span className="text-xs text-gray-500">
                          • {getCategoryLabel(blog.category)}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {getLocalizedContent(blog.title)}
                    </h2>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {getLocalizedContent(blog.excerpt)}
                    </p>

                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {blog.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            <FiTag className="w-3 h-3" />
                            {translateTag(tag)}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        {blog.publishedAt && (
                          <div className="flex items-center gap-1">
                            <FiCalendar className="w-4 h-4" />
                            {formatDate(blog.publishedAt, language)}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <FiEye className="w-4 h-4" />
                          {blog.views || 0}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleLike(e, blog._id)}
                        className="flex items-center gap-1 hover:text-red-500 transition-colors"
                      >
                        <FiHeart className="w-4 h-4" />
                        {blog.likes || 0}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-harvests-light disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('blog.previous', 'Précédent')}
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
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-harvests-light'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-harvests-light disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('blog.next', 'Suivant')}
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('blog.noBlogs', 'Aucun blog trouvé')}
            </h3>
            <p className="text-gray-500">
              {t('blog.noBlogsDescription', 'Essayez de modifier vos critères de recherche')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;

