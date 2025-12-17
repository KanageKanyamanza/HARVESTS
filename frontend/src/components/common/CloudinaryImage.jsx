import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { uploadService } from '../../services';

/**
 * Composant d'image optimisé pour Cloudinary
 * Gère automatiquement les URLs Cloudinary et locales avec optimisations de performance
 */
const CloudinaryImage = ({
  src,
  alt = '',
  className = '',
  loading = 'lazy',
  fallback = '/images/placeholder.svg',
  width,
  height,
  quality = 'auto',
  format = 'auto',
  ...props
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Obtenir l'URL optimisée avec transformations Cloudinary
  const optimizedSrc = useMemo(() => {
    if (!src) return fallback;
    
    // Si c'est une URL Cloudinary, l'optimiser
    if (src.includes('cloudinary.com')) {
      return uploadService.getOptimizedUrlLocal(src, {
        width,
        height,
        quality,
        format,
        crop: width && height ? 'fill' : 'fit'
      });
    }
    
    // Pour les autres URLs, utiliser getImageUrl
    const processedUrl = uploadService.getImageUrl(src);
    return processedUrl;
  }, [src, fallback, width, height, quality, format]);

  // Générer srcset pour images responsives (WebP si supporté)
  const srcSet = useMemo(() => {
    if (!src || !src.includes('cloudinary.com')) return undefined;
    
    const sizes = [400, 800, 1200, 1600];
    return sizes
      .map(size => {
        const optimizedUrl = uploadService.getOptimizedUrlLocal(src, {
          width: size,
          quality: 'auto',
          format: 'auto'
        });
        return `${optimizedUrl} ${size}w`;
      })
      .join(', ');
  }, [src]);

  // Gestion des erreurs d'image avec mémorisation
  const handleError = useCallback((e) => {
    if (fallback && e.target.src !== fallback && !imageError) {
      setImageError(true);
      e.target.src = fallback;
    }
  }, [fallback, imageError]);

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  // Réinitialiser l'état d'erreur si la source change
  useEffect(() => {
    if (src !== optimizedSrc) {
      setImageError(false);
      setImageLoaded(false);
    }
  }, [src, optimizedSrc]);

  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={width ? `${width}px` : '(max-width: 400px) 400px, (max-width: 800px) 800px, (max-width: 1200px) 1200px, 1600px'}
      alt={alt}
      className={`${className} ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      loading={loading}
      width={width}
      height={height}
      onError={handleError}
      onLoad={handleLoad}
      decoding="async"
      {...props}
    />
  );
};

export default CloudinaryImage;
