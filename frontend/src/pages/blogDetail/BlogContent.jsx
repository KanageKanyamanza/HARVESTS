import React from 'react';
import BlogImageGallery from '../../components/blog/BlogImageGallery';
import CloudinaryImage from '../../components/common/CloudinaryImage';
import { Tag } from 'lucide-react';

const BlogContent = ({
  blog,
  getLocalizedContent,
  normalizedTags,
  translateTag,
  t
}) => {
  return (
    <article className="bg-white rounded-lg shadow-sm p-2 sm:p-8">
      {/* Image featured en haut - pleine largeur */}
      {blog.featuredImage?.url && (
        <div className="mb-8 -mx-2 sm:-mx-8 px-3">
          <div className="w-full overflow-hidden rounded-lg">
            <div className="w-full relative">
              <CloudinaryImage
                src={blog.featuredImage.url}
                alt={blog.featuredImage.alt || getLocalizedContent(blog.title, 'Image du blog')}
                className="w-full h-auto"
              />
              {blog.featuredImage.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                  {blog.featuredImage.caption}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Images en haut - pleine largeur */}
      {blog.images && blog.images.filter(img => img.position === 'top').length > 0 && (
        <div className="mb-8 -mx-2 sm:-mx-8 px-3">
          <div className="w-full overflow-hidden rounded-lg">
            {blog.images.filter(img => img.position === 'top').map((image, index) => (
              <div key={index} className="w-full relative">
                <CloudinaryImage
                  src={image.url || image.cloudinaryId}
                  alt={image.alt || `Image ${index + 1}`}
                  className="w-full h-auto"
                />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                    {image.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Images au début du contenu */}
      {blog.images && blog.images.filter(img => img.position === 'content-start').length > 0 && (
        <div className="mb-8">
          <BlogImageGallery images={blog.images.filter(img => img.position === 'content-start')} />
        </div>
      )}

      {/* Contenu */}
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: getLocalizedContent(blog.content, 'Contenu non disponible') }}
      />

      {/* Images au milieu */}
      {blog.images && blog.images.filter(img => img.position === 'middle').length > 0 && (
        <div className="my-8">
          <BlogImageGallery images={blog.images.filter(img => img.position === 'middle')} />
        </div>
      )}

      {/* Images en bas */}
      {blog.images && blog.images.filter(img => img.position === 'bottom').length > 0 && (
        <div className="mt-8">
          <BlogImageGallery images={blog.images.filter(img => img.position === 'bottom')} />
        </div>
      )}

      {/* Images à la fin du contenu */}
      {blog.images && blog.images.filter(img => img.position === 'content-end').length > 0 && (
        <div className="mt-8">
          <BlogImageGallery images={blog.images.filter(img => img.position === 'content-end')} />
        </div>
      )}

      {/* Tags */}
      {normalizedTags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">{t('blog.tagsLabel', 'Tags')}</h3>
          <div className="flex flex-wrap gap-2">
            {normalizedTags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
              >
                <Tag className="h-3 w-3 mr-1" />
                {translateTag(tag)}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default BlogContent;

