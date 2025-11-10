import { apiRequest } from './api';

const uploadService = {
  // Upload d'avatar utilisateur
  uploadAvatar: (formData) => {
    return apiRequest.patch('/users/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload de bannière de boutique
  uploadShopBanner: (formData) => {
    return apiRequest.post('/users/upload-shop-banner', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload de logo de boutique
  uploadShopLogo: (formData) => {
    return apiRequest.post('/users/upload-shop-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload d'images de produits
  uploadProductImages: (formData) => {
    return apiRequest.post('/upload/product-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Supprimer une image par public ID (Cloudinary)
  deleteImage: (publicId) => {
    return apiRequest.delete(`/upload/image/${publicId}`);
  },

  // Supprimer une image par URL (Cloudinary)
  deleteImageByUrl: (imageUrl) => {
    return apiRequest.delete('/upload/image-by-url', { data: { imageUrl } });
  },

  // Obtenir une URL optimisée pour une image Cloudinary
  getOptimizedImageUrl: (publicId, options = {}) => {
    return apiRequest.get(`/upload/optimize/${publicId}`, { params: options });
  },

  // Obtenir l'URL complète d'une image (Cloudinary ou locale)
  getImageUrl: (imagePath) => {
    if (!imagePath) return null;
    
    // Si c'est déjà une URL complète (Cloudinary ou autre), la retourner telle quelle
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('data:') || imagePath.startsWith('blob:')) return imagePath;
    
    // Si c'est une URL Cloudinary (commence par res.cloudinary.com), la retourner
    if (imagePath.includes('cloudinary.com')) return imagePath;
    
    // Pour les anciennes images locales (migration), construire l'URL du serveur
    const baseUrl = import.meta.env.VITE_API_URL.replace('/api/v1', '');
    return `${baseUrl}${imagePath}`;
  },

  // Valider le type de fichier
  validateFileType: (file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp']) => {
    return allowedTypes.includes(file.type);
  },

  // Valider la taille du fichier
  validateFileSize: (file, maxSize = 5 * 1024 * 1024) => { // 5MB par défaut
    return file.size <= maxSize;
  },

  // Upload direct vers Cloudinary
  uploadToCloudinary: (formData) => {
    return apiRequest.post('/upload/cloudinary', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Créer un FormData pour l'upload
  createFormData: (file, fieldName = 'file') => {
    const formData = new FormData();
    formData.append(fieldName, file);
    return formData;
  },

  // Fonction utilitaire pour extraire le public ID d'une URL Cloudinary
  extractPublicId: (cloudinaryUrl) => {
    if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary.com')) return null;
    
    const parts = cloudinaryUrl.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1 || uploadIndex + 1 >= parts.length) return null;
    
    // Extraire le public_id (partie après 'upload' et avant l'extension)
    const publicIdWithVersion = parts.slice(uploadIndex + 1).join('/');
    return publicIdWithVersion.split('.')[0];
  },

  // Fonction pour générer une URL optimisée localement (pour éviter les appels API)
  getOptimizedUrlLocal: (cloudinaryUrl, options = {}) => {
    if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary.com')) return cloudinaryUrl;
    
    const { width, height, quality = 'auto', format = 'auto', crop = 'fit' } = options;
    
    // Extraire les parties de l'URL Cloudinary
    const parts = cloudinaryUrl.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return cloudinaryUrl;
    
    // Construire les transformations
    const transformations = [];
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (crop) transformations.push(`c_${crop}`);
    if (quality) transformations.push(`q_${quality}`);
    if (format && format !== 'auto') transformations.push(`f_${format}`);
    
    // Insérer les transformations dans l'URL
    if (transformations.length > 0) {
      parts.splice(uploadIndex + 1, 0, transformations.join(','));
    }
    
    return parts.join('/');
  }
};

export default uploadService;
