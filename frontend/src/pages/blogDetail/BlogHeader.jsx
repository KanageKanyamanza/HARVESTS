import React from 'react';
import { ArrowLeft, Calendar, User, Eye, Heart, Share2 } from 'lucide-react';

const BlogHeader = ({
  blog,
  isPreviewMode,
  navigate,
  t,
  getLocalizedContent,
  getTypeIcon,
  getTypeLabel,
  getCategoryLabel,
  formatDate,
  liked,
  handleLike,
  handleShare
}) => {
  const TypeIcon = getTypeIcon(blog.type);

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => isPreviewMode ? window.close() : navigate('/blog')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isPreviewMode ? 'Fermer la prévisualisation' : t('blog.backToBlog', 'Retour au blog')}
        </button>

        {/* Métadonnées */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex items-center text-sm text-primary-600">
            <TypeIcon className="h-4 w-4 mr-1" />
            {getTypeLabel(blog.type)}
          </div>
          <span className="text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">
            {getCategoryLabel(blog.category)}
          </span>
          <span className="text-sm text-gray-500">•</span>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(blog.publishedAt || blog.createdAt)}
          </div>
        </div>

        {/* Titre */}
        <h1 className="md:text-4xl text-2xl font-bold text-gray-900 mb-4">
          {getLocalizedContent(blog.title, 'Titre non disponible')}
        </h1>

        {/* Extrait */}
        <p className="md:text-xl text-sm text-gray-600 mb-6">
          {getLocalizedContent(blog.excerpt, 'Extrait non disponible')}
        </p>

        {/* Auteur et stats */}
        <div className="flex flex-wrap content-center items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-500">
              <User className="h-4 w-4 mr-1" />
              {t('blog.author', 'Auteur')} {blog.author?.name || blog.author?.firstName || t('blog.unknownAuthor', 'Auteur inconnu')}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Eye className="h-4 w-4 mr-1" />
              {blog.views || 0} {t('blog.views', 'vues')}
            </div>
          </div>

          {!isPreviewMode && (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLike}
                disabled={liked}
                className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  liked 
                    ? 'text-red-600 bg-red-100' 
                    : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <Heart className="h-4 w-4 mr-1" />
                {blog.likes || 0}
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center px-3 py-1 rounded-full text-sm font-medium text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              >
                <Share2 className="h-4 w-4 mr-1" />
                {t('blog.share', 'Partager')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogHeader;

