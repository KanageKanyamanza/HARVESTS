import React from 'react';
import { ArrowLeft, Calendar, User, Eye, Heart, Share2, Sparkles } from 'lucide-react';
import CloudinaryImage from '../../components/common/CloudinaryImage';

const CATEGORY_FALLBACK_IMAGES = {
  strategie: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop",
  technologie: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=1200&auto=format&fit=crop",
  finance: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop",
  "ressources-humaines": "https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=1200&auto=format&fit=crop",
  marketing: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&auto=format&fit=crop",
  operations: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=1200&auto=format&fit=crop",
  gouvernance: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop",
};

const RANDOM_AGRI_IMAGES = [
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1592417817098-8f3d6eb1b757?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop",
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
  const TypeIcon = getTypeIcon ? getTypeIcon(blog.type) : null;
  const coverImgUrl = getBlogImageUrl(blog);

  return (
    <div className="bg-gradient-to-r from-[#161D14] via-[#1A5514] to-[#0D330A] text-white py-8 sm:py-12 border-b border-emerald-800/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => isPreviewMode ? window.close() : navigate('/blog')}
          className="inline-flex items-center text-xs font-bold text-emerald-300 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full transition-all mb-6 border border-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          {isPreviewMode ? 'Fermer la prévisualisation' : t('blog.backToBlog', 'Retour au journal')}
        </button>

        {/* Métadonnées & Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-bold">
          <span className="bg-emerald-600/90 text-white px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
            {TypeIcon && <TypeIcon className="h-3.5 w-3.5 mr-1" />}
            {getTypeLabel(blog.type)}
          </span>

          {blog.category && (
            <span className="bg-white/10 text-emerald-200 border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider">
              {getCategoryLabel(blog.category)}
            </span>
          )}

          <div className="flex items-center text-emerald-100/80 ml-auto">
            <Calendar className="h-3.5 w-3.5 mr-1 text-emerald-400" />
            {formatDate(blog.publishedAt || blog.createdAt)}
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mb-4 tracking-tight">
          {getLocalizedContent(blog.title, 'Titre non disponible')}
        </h1>

        {/* Extrait */}
        {blog.excerpt && (
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed mb-6 font-medium">
            {getLocalizedContent(blog.excerpt, '')}
          </p>
        )}

        {/* Auteur et actions */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-emerald-200 font-semibold">
              <User className="h-4 w-4 mr-1.5 text-emerald-400" />
              <span>{blog.author?.name || blog.author?.firstName || t('blog.unknownAuthor', 'Équipe Harvests')}</span>
            </div>
            <div className="flex items-center text-emerald-100/80 font-medium">
              <Eye className="h-4 w-4 mr-1.5 text-emerald-400" />
              <span>{blog.views || 0} vues</span>
            </div>
          </div>

          {!isPreviewMode && (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLike}
                disabled={liked}
                className={`flex items-center px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  liked 
                    ? 'text-red-400 bg-red-950/80 border border-red-800' 
                    : 'text-white bg-white/10 hover:bg-red-500/20 hover:text-red-300 border border-white/10'
                }`}
              >
                <Heart className={`h-4 w-4 mr-1.5 ${liked ? 'fill-current' : ''}`} />
                <span>{blog.likes || 0}</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center px-4 py-1.5 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-all"
              >
                <Share2 className="h-4 w-4 mr-1.5" />
                <span>{t('blog.share', 'Partager')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Featured Cover Image inside Banner */}
        {coverImgUrl && (
          <div className="w-full max-h-[360px] sm:max-h-[420px] overflow-hidden rounded-2xl shadow-2xl border border-white/20 relative bg-emerald-950/60">
            <CloudinaryImage
              src={coverImgUrl}
              alt={blog.featuredImage?.alt || getLocalizedContent(blog.title, 'Image de l\'article')}
              className="w-full h-[360px] sm:h-[420px] object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-[#161D14]/90 backdrop-blur-md text-emerald-100 text-xs p-3.5 flex items-center justify-between font-medium border-t border-white/10">
              <span className="line-clamp-1">
                {blog.featuredImage?.caption || getLocalizedContent(blog.excerpt, getLocalizedContent(blog.title, 'Illustration officielle de l\'article'))}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex-shrink-0 ml-2">
                Harvests Media
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogHeader;
