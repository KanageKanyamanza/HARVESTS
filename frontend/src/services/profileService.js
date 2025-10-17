import { apiRequest } from './api';

// Service centralisé pour la gestion des profils
const profileService = {
  // Obtenir le profil complet
  getProfile: () => apiRequest.get('/profiles/me'),
  
  // Mettre à jour le profil
  updateProfile: (data) => apiRequest.patch('/profiles/me', data),
  
  // Upload d'images
  uploadAvatar: (formData) => {
    return apiRequest.patch('/profiles/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  uploadBanner: (formData) => {
    return apiRequest.patch('/profiles/me/banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  uploadLogo: (formData) => {
    return apiRequest.patch('/profiles/me/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Suppression d'images
  deleteImage: (imageType) => apiRequest.delete(`/profiles/me/images/${imageType}`),
  
  // Statistiques communes
  getStats: () => apiRequest.get('/profiles/me/stats'),
  
  // Préférences de notification
  updateNotificationPreferences: (preferences) => 
    apiRequest.patch('/profiles/me/notifications', { notifications: preferences }),
  
  // Fonctions utilitaires
  createFormData: (file, fieldName = 'avatar') => {
    const formData = new FormData();
    formData.append(fieldName, file);
    return formData;
  },
  
  // Validation des types de fichiers
  validateFileType: (file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp']) => {
    return allowedTypes.includes(file.type);
  },
  
  // Validation de la taille des fichiers
  validateFileSize: (file, maxSize = 2 * 1024 * 1024) => { // 2MB par défaut
    return file.size <= maxSize;
  },
  
  // Configuration par type d'image
  getImageConfig: (imageType) => {
    const configs = {
      avatar: {
        maxSize: 2 * 1024 * 1024, // 2MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fieldName: 'avatar',
        uploadFunction: 'uploadAvatar'
      },
      banner: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fieldName: 'banner',
        uploadFunction: 'uploadBanner'
      },
      logo: {
        maxSize: 2 * 1024 * 1024, // 2MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fieldName: 'logo',
        uploadFunction: 'uploadLogo'
      }
    };
    
    return configs[imageType] || configs.avatar;
  }
};

export default profileService;
