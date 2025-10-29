import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import CloudinaryImage from '../../../components/common/CloudinaryImage';
import ProfileImageUpload from '../../../components/common/ProfileImageUpload';
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
  FiAlertCircle,
  FiImage,
  FiRefreshCw
} from 'react-icons/fi';
import commonService from '../../../services/commonService';

const ProfilePage = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [shopBanner, setShopBanner] = useState(user?.shopBanner || '');
  const [shopLogo, setShopLogo] = useState(user?.shopLogo || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  useEffect(() => {
    if (isAuthenticated && user) {
      loadProfileData();
    }
  }, [isAuthenticated, user]);

  // Mettre à jour les états d'images et le statut de vérification quand l'utilisateur change
  useEffect(() => {
    if (user) {
      setShopBanner(user.shopBanner || '');
      setShopLogo(user.shopLogo || '');
      setAvatar(user.avatar || '');
      
      // Calculer le statut de vérification directement depuis l'utilisateur
      const verificationStatus = {
        email: {
          verified: user.isEmailVerified || user.emailVerified
        },
        phone: {
          verified: user.isPhoneVerified || user.phoneVerified
        },
        overall: {
          level: user.verificationLevel || 'Non vérifié'
        }
      };
      setVerificationStatus(verificationStatus);
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      // Les données de profil sont déjà chargées via refreshUser()
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
      companyName: user.companyName || '',
      farmName: user.farmName || '',
      restaurantName: user.restaurantName || '',
      cuisineTypes: user.cuisineTypes || [],
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
      
      // Appeler l'API pour mettre à jour le profil
      await commonService.updateCommonProfile(formData);
      
      // Recharger les données utilisateur pour mettre à jour l'interface
      await refreshUser();
      
      setEditing(false);
      setFormData({});
      
      // Afficher un message de succès
      alert('Profil mis à jour avec succès !');
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du profil');
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

  const handleCuisineTypeChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const currentTypes = prev.cuisineTypes || [];
      if (checked) {
        return {
          ...prev,
          cuisineTypes: [...currentTypes, value]
        };
      } else {
        return {
          ...prev,
          cuisineTypes: currentTypes.filter(type => type !== value)
        };
      }
    });
  };

  const handleBannerChange = async (imageUrl) => {
    try {
      setShopBanner(imageUrl);
      
      // Rafraîchir l'utilisateur pour que les changements soient visibles immédiatement
      await refreshUser();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la bannière:', error);
    }
  };

  const handleLogoChange = async (imageUrl) => {
    try {
      setShopLogo(imageUrl);
      
      // Rafraîchir l'utilisateur pour que les changements soient visibles immédiatement
      await refreshUser();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du logo:', error);
    }
  };

  const handleBannerRemove = async () => {
    try {
      setShopBanner('');
      
      // Appeler l'API pour supprimer la bannière
      await commonService.updateCommonProfile({ shopBanner: null });
      
      // Rafraîchir l'utilisateur pour que les changements soient visibles immédiatement
      await refreshUser();
    } catch (error) {
      console.error('Erreur lors de la suppression de la bannière:', error);
    }
  };

  const handleLogoRemove = async () => {
    try {
      setShopLogo('');
      
      // Appeler l'API pour supprimer le logo
      await commonService.updateCommonProfile({ shopLogo: null });
      
      // Rafraîchir l'utilisateur pour que les changements soient visibles immédiatement
      await refreshUser();
    } catch (error) {
      console.error('Erreur lors de la suppression du logo:', error);
    }
  };

  const handleAvatarChange = async (imageUrl) => {
    try {
      setAvatar(imageUrl);
      
      // Rafraîchir l'utilisateur pour que les changements soient visibles immédiatement
      await refreshUser();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'avatar:', error);
    }
  };

  const handleAvatarRemove = async () => {
    try {
      setAvatar('');
      
      // Appeler l'API pour supprimer l'avatar
      await commonService.updateCommonProfile({ avatar: null });
      
      // Rafraîchir l'utilisateur pour que les changements soient visibles immédiatement
      await refreshUser();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'avatar:', error);
    }
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
      <div className="p-3 max-w-4xl mx-auto">
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
            <div className="p-4">
              <div className="flex flex-wrap gap-4 items-start justify-between mb-6">
                <div className="flex items-center space-x-6">
                  {/* Avatar */}
                  <div className="relative ">
                    <ProfileImageUpload
                      imageType="avatar"
                      currentImage={avatar}
                      onImageChange={handleAvatarChange}
                      onImageRemove={handleAvatarRemove}
                      size="w-24 h-24"
                      aspectRatio="1:1"
                      className="rounded-full w-24 h-16"
                    />
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
                  </div>
                </div>
                
                {/* Bouton d'édition */}
                <div className="flex flex-wrap space-x-2">
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

                {/* Nom de l'entreprise (pour transformateurs) */}
                {user?.userType === 'transformer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiUser className="inline mr-1" />
                      Nom de l'entreprise
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nom de votre entreprise"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {safeDisplay(user.companyName, 'Non renseigné')}
                      </p>
                    )}
                  </div>
                )}

                {/* Nom de la ferme (pour producteurs) */}
                {user?.userType === 'producer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiUser className="inline mr-1" />
                      Nom de la ferme
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="farmName"
                        value={formData.farmName || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nom de votre ferme"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {safeDisplay(user.farmName, 'Non renseigné')}
                      </p>
                    )}
                  </div>
                )}

                {/* Nom du restaurant (pour restaurateurs) */}
                {user?.userType === 'restaurateur' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiUser className="inline mr-1" />
                      Nom du restaurant
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="restaurantName"
                        value={formData.restaurantName || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nom de votre restaurant"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {safeDisplay(user.restaurantName, 'Non renseigné')}
                      </p>
                    )}
                  </div>
                )}

                {/* Types de cuisine (pour restaurateurs) */}
                {user?.userType === 'restaurateur' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiUser className="inline mr-1" />
                      Types de cuisine
                    </label>
                    {editing ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: 'african', label: 'Africaine' },
                            { value: 'french', label: 'Française' },
                            { value: 'italian', label: 'Italienne' },
                            { value: 'asian', label: 'Asiatique' },
                            { value: 'american', label: 'Américaine' },
                            { value: 'mediterranean', label: 'Méditerranéenne' },
                            { value: 'fusion', label: 'Fusion' },
                            { value: 'vegetarian', label: 'Végétarienne' },
                            { value: 'vegan', label: 'Végane' }
                          ].map((cuisine) => (
                            <label key={cuisine.value} className="flex items-center">
                              <input
                                type="checkbox"
                                name="cuisineTypes"
                                value={cuisine.value}
                                checked={(formData.cuisineTypes || []).includes(cuisine.value)}
                                onChange={handleCuisineTypeChange}
                                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{cuisine.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(user.cuisineTypes || []).length > 0 ? (
                          (user.cuisineTypes || []).map((type, index) => {
                            const cuisineLabels = {
                              'african': 'Africaine',
                              'french': 'Française',
                              'italian': 'Italienne',
                              'asian': 'Asiatique',
                              'american': 'Américaine',
                              'mediterranean': 'Méditerranéenne',
                              'fusion': 'Fusion',
                              'vegetarian': 'Végétarienne',
                              'vegan': 'Végane'
                            };
                            return (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                              >
                                {cuisineLabels[type] || type}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-gray-500">Aucun type de cuisine renseigné</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

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
                      <option value="SN">Sénégal</option>
                      <option value="CM">Cameroun</option>
                      <option value="CI">Côte d'Ivoire</option>
                      <option value="BF">Burkina Faso</option>
                      <option value="ML">Mali</option>
                      <option value="GN">Guinée</option>
                      <option value="GM">Gambie</option>
                      <option value="GW">Guinée-Bissau</option>
                      <option value="CV">Cap-Vert</option>
                      <option value="MR">Mauritanie</option>
                      <option value="NE">Niger</option>
                      <option value="TD">Tchad</option>
                      <option value="CF">République centrafricaine</option>
                      <option value="GQ">Guinée équatoriale</option>
                      <option value="GA">Gabon</option>
                      <option value="CG">Congo</option>
                      <option value="CD">République démocratique du Congo</option>
                      <option value="AO">Angola</option>
                      <option value="ST">São Tomé-et-Príncipe</option>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <FiShield className="mr-2" />
                    Statut de vérification
                  </div>
                  <button
                    onClick={async () => {
                      await refreshUser();
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Rafraîchir le statut"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                  </button>
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

          {/* Section Boutique */}
          {(user?.userType === 'producer' || user?.userType === 'transformer' || user?.userType === 'restaurateur') && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <FiImage className="mr-2" />
                  Ma Boutique
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bannière de boutique */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Bannière de boutique
                    </label>
                    <ProfileImageUpload
                      currentImage={shopBanner}
                      onImageChange={handleBannerChange}
                      onImageRemove={handleBannerRemove}
                      imageType="banner"
                      size="large"
                      aspectRatio="banner"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Recommandé: 1200x400px (ratio 3:1)
                    </p>
                  </div>

                  {/* Logo de boutique */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Logo de boutique
                    </label>
                    <ProfileImageUpload
                      currentImage={shopLogo}
                      onImageChange={handleLogoChange}
                      onImageRemove={handleLogoRemove}
                      imageType="logo"
                      size="medium"
                      aspectRatio="square"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Recommandé: 400x400px (carré)
                    </p>
                  </div>
                </div>

                {/* Aperçu de la boutique */}
                {(shopBanner || shopLogo) && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Aperçu de votre boutique</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      {shopBanner && (
                        <div className="aspect-[3/1] bg-gray-100">
                          <CloudinaryImage
                            src={shopBanner}
                            alt="Bannière de boutique"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4 flex items-center space-x-3">
                        {shopLogo && (
                          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            <CloudinaryImage
                              src={shopLogo}
                              alt="Logo de boutique"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h5 className="font-medium text-gray-900">
                            {user?.farmName || user?.companyName || user?.businessName || 'Ma Boutique'}
                          </h5>
                          <p className="text-sm text-gray-500">
                            {user?.firstName} {user?.lastName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default ProfilePage;
