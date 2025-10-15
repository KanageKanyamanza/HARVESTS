import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { profileService } from '../services';
import { useNotifications } from '../contexts/NotificationContext';

export const useProfile = () => {
  const { user, updateProfile } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Charger le profil
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await profileService.getProfile();
      setProfile(response.data.profile);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      showError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Mettre à jour le profil
  const updateProfileData = useCallback(async (data) => {
    try {
      setSaving(true);
      const response = await profileService.updateProfile(data);
      setProfile(response.data.profile);
      
      // Mettre à jour le contexte d'authentification
      await updateProfile(data);
      
      showSuccess('Profil mis à jour avec succès');
      return response.data.profile;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      showError('Erreur lors de la mise à jour du profil');
      throw error;
    } finally {
      setSaving(false);
    }
  }, [updateProfile, showSuccess, showError]);

  // Upload d'image
  const uploadImage = useCallback(async (file, imageType) => {
    try {
      setSaving(true);
      const formData = profileService.createFormData(file, imageType);
      
      let response;
      switch (imageType) {
        case 'avatar':
          response = await profileService.uploadAvatar(formData);
          break;
        case 'banner':
          response = await profileService.uploadBanner(formData);
          break;
        case 'logo':
          response = await profileService.uploadLogo(formData);
          break;
        default:
          throw new Error('Type d\'image invalide');
      }
      
      const updatedProfile = response.data.profile;
      setProfile(updatedProfile);
      
      // Mettre à jour le contexte d'authentification
      const imageField = imageType === 'avatar' ? 'avatar' : 
                        imageType === 'banner' ? 'shopBanner' : 'shopLogo';
      await updateProfile({ [imageField]: updatedProfile[imageField] });
      
      showSuccess('Image uploadée avec succès');
      return updatedProfile;
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error);
      showError('Erreur lors de l\'upload de l\'image');
      throw error;
    } finally {
      setSaving(false);
    }
  }, [updateProfile, showSuccess, showError]);

  // Supprimer une image
  const deleteImage = useCallback(async (imageType) => {
    try {
      setSaving(true);
      const response = await profileService.deleteImage(imageType);
      const updatedProfile = response.data.profile;
      setProfile(updatedProfile);
      
      // Mettre à jour le contexte d'authentification
      const imageField = imageType === 'avatar' ? 'avatar' : 
                        imageType === 'banner' ? 'shopBanner' : 'shopLogo';
      await updateProfile({ [imageField]: null });
      
      showSuccess('Image supprimée avec succès');
      return updatedProfile;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      showError('Erreur lors de la suppression de l\'image');
      throw error;
    } finally {
      setSaving(false);
    }
  }, [updateProfile, showSuccess, showError]);

  // Charger le profil au montage
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user, loadProfile]);

  return {
    profile,
    loading,
    saving,
    loadProfile,
    updateProfile: updateProfileData,
    uploadImage,
    deleteImage
  };
};

export default useProfile;
