import React from 'react';
import { uploadService } from '../../services';

/**
 * Composant d'image optimisé pour Cloudinary
 * Gère automatiquement les URLs Cloudinary et locales
 */
const CloudinaryImage = ({
  src,
  alt = '',
  width,
  height,
  quality = 'auto',
  format = 'auto',
  crop = 'fit',
  className = '',
  loading = 'lazy',
  fallback = '/images/placeholder.svg',
  ...props
}) => {
  // Obtenir l'URL optimisée
  const getOptimizedSrc = () => {
    if (!src) return fallback;
    
    // Si c'est une URL Cloudinary, l'utiliser directement
    if (src.includes('cloudinary.com')) {
      return src;
    }
    
    // Pour les autres URLs, utiliser getImageUrl
    const processedUrl = uploadService.getImageUrl(src);
    return processedUrl;
  };

  const optimizedSrc = getOptimizedSrc();

  // Gestion des erreurs d'image
  const handleError = (e) => {
    if (fallback && e.target.src !== fallback) {
      e.target.src = fallback;
    }
  };

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleError}
      {...props}
    />
  );
};

export default CloudinaryImage;
