import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import CloudinaryImage from '../../../components/common/CloudinaryImage';
import { 
  FiUser, 
  FiEdit3, 
  FiSave, 
  FiX, 
  FiCamera,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiShield,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import commonService from '../../../services/commonService';

const ProfilePage = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadProfileData();
    }
  }, [isAuthenticated, user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Recharger d'abord les données de l'utilisateur
      await refreshUser();
      
      const [verificationResponse, commonStatsResponse] = await Promise.all([
        commonService.getVerificationStatus().catch(() => ({ data: null })),
        commonService.getCommonStats().catch(() => ({ data: {} }))
      ]);

      setVerificationStatus(verificationResponse.data);
      setProfileCompletion(commonStatsResponse.data?.profileCompletion || 0);
      
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      region: user.region || '',
      country: user.country || '',
      bio: user.bio || ''
    });
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Ici, vous pouvez appeler l'API pour mettre à jour le profil
      // await commonService.updateProfile(formData);
      
      // Pour l'instant, on simule la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEditing(false);
      setFormData({});
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonction utilitaire pour afficher de manière sécurisée les propriétés utilisateur
  const safeDisplay = (value, fallback = 'Non renseigné') => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'object') {
      // Si c'est un objet, essayer de trouver une propriété de valeur
      return value.value || value.name || value.code || value.street || value.address || JSON.stringify(value) || fallback;
    }
    return value || fallback;
  };

  if (!isAuthenticated || !user) {
    return (
      <ModularDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h2>
            <p className="text-gray-600">Vous devez être connecté pour accéder à cette page.</p>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiUser className="mr-3" />
            Mon Profil
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez vos informations personnelles et votre image de profil
          </p>
        </div>

        <div className="space-y-6">
          {/* Carte de profil principale */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-6">
                  {/* Avatar */}
                  <div className="relative">
                    {user.avatar ? (
                      <CloudinaryImage
                        publicId={user.avatar}
                        className="w-24 h-24 rounded-full object-cover"
                        alt="Avatar"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                        <FiUser className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors">
                      <FiCamera className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Informations de base */}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {safeDisplay(user.firstName, '')} {safeDisplay(user.lastName, '')}
                    </h2>
                    <p className="text-gray-600 capitalize">{user.userType}</p>
                    <p className="text-sm text-gray-500">
                      {safeDisplay(user.email, '')}
                    </p>
                    
                    {/* Barre de progression du profil */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Complétion du profil</span>
                        <span>{profileCompletion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${profileCompletion}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bouton d'édition */}
                <div className="flex space-x-2">
                  {editing ? (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        <FiSave className="mr-2" />
                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        <FiX className="mr-2" />
                        Annuler
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEdit}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <FiEdit3 className="mr-2" />
                      Modifier
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Informations personnelles</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prénom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiUser className="inline mr-1" />
                    Prénom
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {safeDisplay(user.firstName, '')}
                    </p>
                  )}
                </div>

                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiUser className="inline mr-1" />
                    Nom
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {safeDisplay(user.lastName, '')}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMail className="inline mr-1" />
                    Email
                  </label>
                  <div className="flex items-center">
                    <p className="text-gray-900">
                      {safeDisplay(user.email, '')}
                    </p>
                    {verificationStatus?.email?.verified ? (
                      <FiCheckCircle className="ml-2 text-green-500" />
                    ) : (
                      <FiAlertCircle className="ml-2 text-red-500" />
                    )}
                  </div>
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiPhone className="inline mr-1" />
                    Téléphone
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center">
                      <p className="text-gray-900">
                        {safeDisplay(user.phone, 'Non renseigné')}
                      </p>
                      {verificationStatus?.phone?.verified && (
                        <FiCheckCircle className="ml-2 text-green-500" />
                      )}
                    </div>
                  )}
                </div>

                {/* Adresse */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMapPin className="inline mr-1" />
                    Adresse
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {safeDisplay(user.address, 'Non renseigné')}
                    </p>
                  )}
                </div>

                {/* Ville */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMapPin className="inline mr-1" />
                    Ville
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {safeDisplay(user.city, 'Non renseigné')}
                    </p>
                  )}
                </div>

                {/* Région */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMapPin className="inline mr-1" />
                    Région
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="region"
                      value={formData.region || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {safeDisplay(user.region, 'Non renseigné')}
                    </p>
                  )}
                </div>

                {/* Pays */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMapPin className="inline mr-1" />
                    Pays
                  </label>
                  {editing ? (
                    <select
                      name="country"
                      value={formData.country || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner un pays</option>
                      <option value="CM">Cameroun</option>
                      <option value="SN">Sénégal</option>
                      <option value="CI">Côte d'Ivoire</option>
                      <option value="BF">Burkina Faso</option>
                      <option value="ML">Mali</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">
                      {safeDisplay(user.country, 'Non renseigné')}
                    </p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biographie
                </label>
                {editing ? (
                  <textarea
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Parlez-nous de vous..."
                  />
                ) : (
                  <p className="text-gray-900">
                    {safeDisplay(user.bio, 'Aucune biographie renseignée')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Statut de vérification */}
          {verificationStatus && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <FiShield className="mr-2" />
                  Statut de vérification
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        verificationStatus.email?.verified ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-gray-600">
                          {verificationStatus.email?.verified ? 'Vérifié' : 'Non vérifié'}
                        </p>
                      </div>
                    </div>
                    {verificationStatus.email?.verified ? (
                      <FiCheckCircle className="text-green-500" />
                    ) : (
                      <FiAlertCircle className="text-red-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        verificationStatus.phone?.verified ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">Téléphone</p>
                        <p className="text-sm text-gray-600">
                          {verificationStatus.phone?.verified ? 'Vérifié' : 'Non vérifié'}
                        </p>
                      </div>
                    </div>
                    {verificationStatus.phone?.verified ? (
                      <FiCheckCircle className="text-green-500" />
                    ) : (
                      <FiAlertCircle className="text-red-500" />
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Niveau de vérification</h4>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      {verificationStatus.overall?.level || 'Non vérifié'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default ProfilePage;
