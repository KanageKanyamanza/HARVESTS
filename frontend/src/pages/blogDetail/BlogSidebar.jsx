import React from 'react';
import { Heart, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CloudinaryImage from '../../components/common/CloudinaryImage';

const BlogSidebar = ({
  isPreviewMode,
  blog,
  relatedBlogs,
  liked,
  handleLike,
  handleShare,
  getLocalizedContent,
  getTypeIcon,
  getTypeLabel,
  formatDate,
  t
}) => {
  const navigate = useNavigate();

  return (
    <div className="lg:col-span-1">
      <div className="space-y-6">
        {/* Actions - seulement en mode normal */}
        {!isPreviewMode && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('blog.actions', 'Actions')}</h3>
            <div className="space-y-3">
              <button
                onClick={handleLike}
                disabled={liked}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Heart className="h-4 w-4 mr-2" />
                {liked ? t('blog.thankYou', 'Merci !') : t('blog.likeArticle', 'J\'aime cet article')}
              </button>
              
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Share2 className="h-4 w-4 mr-2" />
                {t('blog.share', 'Partager')}
              </button>
            </div>
          </div>
        )}

        {/* Articles similaires */}
        {relatedBlogs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('blog.relatedArticles', 'Articles similaires')}</h3>
            <div className="space-y-4">
              {relatedBlogs.map((relatedBlog) => {
                const RelatedTypeIcon = getTypeIcon(relatedBlog.type);
                const relatedSlug = typeof relatedBlog.slug === 'string' 
                  ? relatedBlog.slug 
                  : getLocalizedContent(relatedBlog.slug, '');
                
                return (
                  <div
                    key={relatedBlog._id}
                    className="flex space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md"
                    onClick={() => navigate(`/blog/${relatedSlug}`)}
                  >
                    {relatedBlog.featuredImage?.url && (
                      <CloudinaryImage
                        src={relatedBlog.featuredImage.url}
                        alt={getLocalizedContent(relatedBlog.title, '')}
                        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center text-xs text-primary-600 mb-1">
                        <RelatedTypeIcon className="h-3 w-3 mr-1" />
                        {getTypeLabel(relatedBlog.type)}
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {getLocalizedContent(relatedBlog.title, 'Titre non disponible')}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(relatedBlog.publishedAt || relatedBlog.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogSidebar;

