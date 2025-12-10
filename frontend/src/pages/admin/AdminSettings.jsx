import React from 'react';
import { Settings } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SettingsTabs from '../../components/admin/settings/SettingsTabs';
import ProfileTab from '../../components/admin/settings/ProfileTab';
import NotificationsTab from '../../components/admin/settings/NotificationsTab';
import PasswordTab from '../../components/admin/settings/PasswordTab';
import { useAdminSettings } from '../../hooks/useAdminSettings';

const AdminSettings = () => {
  const {
    user,
    loading,
    saving,
    activeTab,
    setActiveTab,
    formData,
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
  } = useAdminSettings();

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

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
            <SettingsTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* Onglet Profil */}
              {activeTab === 'profile' && (
                <ProfileTab
                  user={user}
                  formData={formData}
                  avatarPreview={avatarPreview}
                  errors={errors}
                  saving={saving}
                  onInputChange={handleInputChange}
                  onAvatarChange={handleAvatarChange}
                  onSubmit={handleUpdateProfile}
                  onReset={resetProfileForm}
                />
              )}

              {/* Onglet Notifications */}
              {activeTab === 'notifications' && (
                <NotificationsTab
                  user={user}
                  formData={formData}
                  saving={saving}
                  onInputChange={handleInputChange}
                  onSubmit={handleUpdateNotificationEmail}
                  onReset={resetNotificationForm}
                />
              )}

              {/* Onglet Mot de passe */}
              {activeTab === 'password' && (
                <PasswordTab
                  passwordData={passwordData}
                  errors={errors}
                  saving={saving}
                  onPasswordChange={handlePasswordChange}
                  onSubmit={handleChangePassword}
                  onReset={resetPasswordForm}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

