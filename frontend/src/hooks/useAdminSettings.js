import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { adminService } from '../services/adminService';
import profileService from '../services/profileService';

/**
 * Hook personnalisé pour gérer les paramètres admin
 */
export const useAdminSettings = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    notificationEmail: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        notificationEmail: user.notificationEmail || ''
      });
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!profileService.validateFileType(file)) {
        setErrors(prev => ({ ...prev, avatar: 'Format de fichier non supporté. Utilisez JPG, PNG ou WEBP.' }));
        return;
      }
      if (!profileService.validateFileSize(file, 5 * 1024 * 1024)) {
        setErrors(prev => ({ ...prev, avatar: 'Fichier trop volumineux. Taille maximale: 5MB.' }));
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, avatar: '' }));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const adminData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      };

      await adminService.updateAdminProfile(adminData);

      if (avatarFile) {
        try {
          const formDataAvatar = profileService.createFormData(avatarFile, 'avatar');
          await adminService.uploadAdminAvatar(formDataAvatar);
        } catch (avatarError) {
          console.error('Erreur lors de l\'upload de l\'avatar:', avatarError);
          setErrors({
            avatar: 'L\'avatar n\'a pas pu être mis à jour. Les autres informations ont été sauvegardées.'
          });
        }
      }

      await refreshUser();
      setSuccessMessage('Profil mis à jour avec succès !');
      setAvatarFile(null);
      setAvatarPreview(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setErrors({
        general: error.response?.data?.message || 'Erreur lors de la mise à jour du profil'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ password: 'Les mots de passe ne correspondent pas' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrors({ password: 'Le mot de passe doit contenir au moins 6 caractères' });
      return;
    }

    setSaving(true);
    try {
      await adminService.changeMyPassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      setSuccessMessage('Mot de passe modifié avec succès !');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      setErrors({
        password: error.response?.data?.message || 'Erreur lors du changement de mot de passe'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNotificationEmail = async () => {
    setSaving(true);
    setErrors({});
    setSuccessMessage('');

    try {
      await adminService.updateAdminProfile({
        notificationEmail: formData.notificationEmail || null
      });
      await refreshUser();
      setSuccessMessage('Email de notification mis à jour avec succès !');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setErrors({
        general: error.response?.data?.message || 'Erreur lors de la mise à jour de l\'email de notification'
      });
    } finally {
      setSaving(false);
    }
  };

  const resetProfileForm = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      notificationEmail: user?.notificationEmail || ''
    });
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const resetPasswordForm = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  const resetNotificationForm = () => {
    setFormData(prev => ({
      ...prev,
      notificationEmail: user?.notificationEmail || ''
    }));
  };

  return {
    user,
    loading,
    saving,
    activeTab,
    setActiveTab,
    formData,
    avatarFile,
    avatarPreview,
    passwordData,
    setPasswordData,
    errors,
    successMessage,
    handleInputChange,
    handleAvatarChange,
    handleUpdateProfile,
    handleChangePassword,
    handleUpdateNotificationEmail,
    resetProfileForm,
    resetPasswordForm,
    resetNotificationForm
  };
};

