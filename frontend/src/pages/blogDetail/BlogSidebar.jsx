import React from 'react';
import { Heart, Share2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CloudinaryImage from '../../components/common/CloudinaryImage';

const CATEGORY_FALLBACK_IMAGES = {
  strategie: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop",
  technologie: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400&auto=format&fit=crop",
  finance: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop",
  "ressources-humaines": "https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=400&auto=format&fit=crop",
  marketing: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&auto=format&fit=crop",
  operations: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=400&auto=format&fit=crop",
  gouvernance: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&auto=format&fit=crop",
};

const RANDOM_AGRI_IMAGES = [
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1592417817098-8f3d6eb1b757?w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&auto=format&fit=crop",
];

const getBlogImageUrl = (blog) => {
  if (!blog) return RANDOM_AGRI_IMAGES[0];
  if (typeof blog.featuredImage === 'string' && blog.featuredImage.trim()) return blog.featuredImage;
  if (blog.featuredImage?.url && typeof blog.featuredImage.url === 'string') return blog.featuredImage.url;
  if (Array.isArray(blog.images) && blog.images.length > 0) {
    for (const img of blog.images) {
      if (typeof img === 'string' && img.trim()) return img;
      if (img?.url && typeof img.url === 'string') return img.url;
    }
  }
  if (typeof blog.coverImage === 'string' && blog.coverImage.trim()) return blog.coverImage;
  if (blog.coverImage?.url && typeof blog.coverImage.url === 'string') return blog.coverImage.url;

  if (blog.category && CATEGORY_FALLBACK_IMAGES[blog.category]) {
    return CATEGORY_FALLBACK_IMAGES[blog.category];
  }

  const str = (blog._id || blog.title?.fr || blog.title || "").toString();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % RANDOM_AGRI_IMAGES.length;
  return RANDOM_AGRI_IMAGES[index];
};

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
    <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-[128px]">
      {/* Actions card */}
      {!isPreviewMode && (
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100/80 p-5 space-y-3">
          <h3 className="text-sm font-extrabold text-[#161D14] uppercase tracking-wider">{t('blog.actions', 'Interagir')}</h3>
          
          <button
            onClick={handleLike}
            disabled={liked}
            className={`w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              liked 
                ? 'bg-red-50 text-red-600 border border-red-200 cursor-default' 
                : 'bg-[#1A5514] hover:bg-[#31BC2E] text-white'
            }`}
          >
            <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
            {liked ? t('blog.thankYou', 'Merci pour votre soutien !') : t('blog.likeArticle', 'J\'aime cet article')}
          </button>
          
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-sm"
          >
            <Share2 className="h-4 w-4 mr-2 text-emerald-700" />
            {t('blog.share', 'Partager l\'article')}
          </button>
        </div>
      )}

      {/* Articles similaires */}
      {relatedBlogs && relatedBlogs.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100/80 p-5 space-y-4">
          <h3 className="text-sm font-extrabold text-[#161D14] uppercase tracking-wider">{t('blog.relatedArticles', 'Articles similaires')}</h3>
          <div className="space-y-3">
            {relatedBlogs.map((relatedBlog) => {
              const RelatedTypeIcon = getTypeIcon ? getTypeIcon(relatedBlog.type) : null;
              const relatedSlug = typeof relatedBlog.slug === 'string' 
                ? relatedBlog.slug 
                : getLocalizedContent(relatedBlog.slug, '');
              const imgUrl = getBlogImageUrl(relatedBlog);

              return (
                <div
                  key={relatedBlog._id}
                  className="group flex gap-3 cursor-pointer hover:bg-emerald-50/50 p-2.5 rounded-xl transition-all border border-transparent hover:border-emerald-100"
                  onClick={() => navigate(`/blog/${relatedSlug || relatedBlog._id}`)}
                >
                  <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    <CloudinaryImage
                      src={imgUrl}
                      alt={getLocalizedContent(relatedBlog.title, '')}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center text-[10px] font-bold text-emerald-700 uppercase mb-0.5">
                        {RelatedTypeIcon && <RelatedTypeIcon className="h-3 w-3 mr-1" />}
                        <span>{getTypeLabel(relatedBlog.type)}</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#161D14] group-hover:text-[#1A5514] transition-colors line-clamp-2 leading-snug">
                        {getLocalizedContent(relatedBlog.title, 'Titre non disponible')}
                      </h4>
                    </div>

                    <p className="text-[10px] text-gray-400 font-medium">
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
  );
};

export default BlogSidebar;
