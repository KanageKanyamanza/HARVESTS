import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Settings, User, Mail, Phone, Camera, Save, X, Lock } from 'lucide-react';
import profileService from '../../services/profileService';
import { authService } from '../../services/authService';
import { adminService } from '../../services/adminService';
import CloudinaryImage from '../../components/common/CloudinaryImage';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminSettings = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
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
        phone: user.phone || ''
      });
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // Effacer les erreurs lors de la modification
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
      if (!profileService.validateFileSize(file)) {
        setErrors(prev => ({ ...prev, avatar: 'Fichier trop volumineux. Taille maximale: 2MB.' }));
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
      // Préparer les données pour l'admin (l'endpoint admin ne prend que certains champs)
      const adminData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      };

      // Mettre à jour le profil admin
      await adminService.updateAdminProfile(adminData);

      // Upload de l'avatar si un nouveau fichier a été sélectionné
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

      // Rafraîchir les données utilisateur
      await refreshUser();
      
      setSuccessMessage('Profil mis à jour avec succès !');
      setAvatarFile(null);
      setAvatarPreview(null);
      
      // Effacer le message de succès après 3 secondes
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

    // Validation
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
      await authService.changePassword(
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

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'password', label: 'Mot de passe', icon: Lock },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="h-7 w-7 mr-3 text-green-600" />
            Paramètres
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>

        {/* Message de succès */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Message d'erreur général */}
        {errors.general && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar avec onglets */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors mb-2 ${
                      activeTab === tab.id
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* Onglet Profil */}
              {activeTab === 'profile' && (
                <form onSubmit={handleUpdateProfile} className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Informations personnelles
                  </h2>

                  {/* Avatar */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photo de profil
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {avatarPreview || user?.avatar ? (
                          <CloudinaryImage
                            src={avatarPreview || user.avatar}
                            alt="Avatar"
                            className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                            fallback={
                              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-12 w-12 text-gray-400" />
                              </div>
                            }
                          />
                        ) : (
                          <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700">
                          <Camera className="h-4 w-4" />
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          JPG, PNG ou WEBP. Taille max: 5MB
                        </p>
                        {errors.avatar && (
                          <p className="text-sm text-red-600 mt-1">{errors.avatar}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Informations de base */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Bouton de sauvegarde */}
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          firstName: user.firstName || '',
                          lastName: user.lastName || '',
                          email: user.email || '',
                          phone: user.phone || ''
                        });
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      <X className="h-4 w-4 inline mr-2" />
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="h-4 w-4 inline mr-2" />
                      {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                </form>
              )}

              {/* Onglet Mot de passe */}
              {activeTab === 'password' && (
                <form onSubmit={handleChangePassword} className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Changer le mot de passe
                  </h2>

                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mot de passe actuel *
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nouveau mot de passe *
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        required
                        minLength={6}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmer le nouveau mot de passe *
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        minLength={6}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    {errors.password && (
                      <div className="text-sm text-red-600">{errors.password}</div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                        setErrors({});
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      <X className="h-4 w-4 inline mr-2" />
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="h-4 w-4 inline mr-2" />
                      {saving ? 'Enregistrement...' : 'Changer le mot de passe'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

