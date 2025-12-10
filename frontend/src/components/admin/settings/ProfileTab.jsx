import React from 'react';
import { User, Mail, Phone, Camera, Save, X } from 'lucide-react';
import CloudinaryImage from '../../common/CloudinaryImage';

const ProfileTab = ({
  user,
  formData,
  avatarPreview,
  errors,
  saving,
  onInputChange,
  onAvatarChange,
  onSubmit,
  onReset
}) => {
  return (
    <form onSubmit={onSubmit} className="p-6">
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
                onChange={onAvatarChange}
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
            onChange={onInputChange}
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
            onChange={onInputChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              Email de connexion
            </span>
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">L'email de connexion ne peut pas être modifié</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="flex items-center">
              <Phone className="h-4 w-4 mr-1" />
              Téléphone
            </span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onReset}
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
  );
};

export default ProfileTab;

