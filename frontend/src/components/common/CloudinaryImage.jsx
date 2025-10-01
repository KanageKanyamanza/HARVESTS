import React, { useMemo, useCallback } from 'react';
import { uploadService } from '../../services';

/**
 * Composant d'image optimisé pour Cloudinary
 * Gère automatiquement les URLs Cloudinary et locales
 */
const CloudinaryImage = ({
  src,
  alt = '',
  className = '',
  loading = 'lazy',
  fallback = '/images/placeholder.svg',
  ...props
}) => {
  // Obtenir l'URL optimisée avec mémorisation
  const optimizedSrc = useMemo(() => {
    if (!src) return fallback;
    
    // Si c'est une URL Cloudinary, l'utiliser directement
    if (src.includes('cloudinary.com')) {
      return src;
    }
    
    // Pour les autres URLs, utiliser getImageUrl
    const processedUrl = uploadService.getImageUrl(src);
    return processedUrl;
  }, [src, fallback]);

  // Gestion des erreurs d'image avec mémorisation
  const handleError = useCallback((e) => {
    if (fallback && e.target.src !== fallback) {
      e.target.src = fallback;
    }
  }, [fallback]);

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
