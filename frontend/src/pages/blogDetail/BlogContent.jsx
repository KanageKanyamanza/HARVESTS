import React from 'react';
import BlogImageGallery from '../../components/blog/BlogImageGallery';
import CloudinaryImage from '../../components/common/CloudinaryImage';
import { Tag } from 'lucide-react';
import { markdownToHtml } from './blogUtils';

const BlogContent = ({
  blog,
  getLocalizedContent,
  normalizedTags,
  translateTag,
  t
}) => {
  return (
    <article className="bg-white rounded-2xl shadow-sm border border-emerald-100/80 p-5 sm:p-8">
      {/* Top Images (if specified as position: top) */}
      {blog.images && blog.images.filter(img => img.position === 'top').length > 0 && (
        <div className="mb-8">
          <div className="w-full overflow-hidden rounded-2xl border border-gray-100 space-y-4">
            {blog.images.filter(img => img.position === 'top').map((image, index) => (
              <div key={index} className="w-full relative">
                <CloudinaryImage
                  src={image.url || image.cloudinaryId}
                  alt={image.alt || `Image ${index + 1}`}
                  className="w-full h-auto rounded-xl max-h-[450px] object-cover"
                />
                {image.caption && (
                  <div className="bg-gray-900/80 text-white text-xs p-2.5 rounded-b-xl">
                    {image.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Start Content Images */}
      {blog.images && blog.images.filter(img => img.position === 'content-start').length > 0 && (
        <div className="mb-8">
          <BlogImageGallery images={blog.images.filter(img => img.position === 'content-start')} />
        </div>
      )}

      {/* Rich Article Body */}
      <div 
        className="prose prose-[#1A5514] prose-lg max-w-none text-[#161D14] leading-relaxed prose-headings:font-extrabold prose-headings:text-[#161D14] prose-a:text-[#1A5514] prose-a:font-bold hover:prose-a:text-[#31BC2E] prose-blockquote:border-l-[#1A5514] prose-blockquote:bg-emerald-50/50 prose-blockquote:p-4 prose-blockquote:rounded-r-xl"
        dangerouslySetInnerHTML={{ 
          __html: markdownToHtml(getLocalizedContent(blog.content, 'Contenu non disponible')) 
        }}
      />

      {/* Middle Images */}
      {blog.images && blog.images.filter(img => img.position === 'middle').length > 0 && (
        <div className="my-8">
          <BlogImageGallery images={blog.images.filter(img => img.position === 'middle')} />
        </div>
      )}

      {/* Bottom Images */}
      {blog.images && blog.images.filter(img => img.position === 'bottom').length > 0 && (
        <div className="mt-8">
          <BlogImageGallery images={blog.images.filter(img => img.position === 'bottom')} />
        </div>
      )}

      {/* Tags */}
      {normalizedTags && normalizedTags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-3">{t('blog.tagsLabel', 'Tags')}</h3>
          <div className="flex flex-wrap gap-2">
            {normalizedTags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-100"
              >
                <Tag className="h-3 w-3 mr-1 text-emerald-600" />
                #{translateTag(tag)}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default BlogContent;
