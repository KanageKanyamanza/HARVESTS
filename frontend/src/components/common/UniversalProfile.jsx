import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../contexts/NotificationContext';
import ModularDashboardLayout from '../layout/ModularDashboardLayout';
import CloudinaryImage from './CloudinaryImage';
import ImageUpload from './ImageUpload';
import { uploadService } from '../../services';
import {
  FiEdit,
  FiSave,
  FiX,
  FiMapPin,
  FiClock,
  FiCoffee,
  FiUsers,
  FiStar,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiAlertCircle,
  FiUpload,
  FiHome,
  FiMail,
  FiPhone,
  FiGlobe,
  FiHeart,
  FiShoppingCart,
  FiBell,
  FiAward,
  FiDollarSign
} from 'react-icons/fi';

const UniversalProfile = ({ userType, service, profileFields, tabs }) => {
  const { user, updateProfile } = useAuth();
  const { showSuccess, showError } = useNotifications();
  
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [profile, setProfile] = useState({});

  // Configuration spécifique par type d'utilisateur
  const userConfig = {
    producer: {
      title: 'Mon Profil Producteur',
      description: 'Gérez vos informations et préférences',
      icon: FiPackage,
      color: 'green',
      quickInfo: [
        { key: 'location', icon: FiMapPin, label: 'Localisation' },
        { key: 'specialty', icon: FiStar, label: 'Spécialité' },
        { key: 'experience', icon: FiAward, label: 'Expérience' }
      ]
    },
    transformer: {
      title: 'Mon Profil Transformateur',
      description: 'Gérez vos informations et préférences',
      icon: FiTruck,
      color: 'purple',
      quickInfo: [
        { key: 'location', icon: FiMapPin, label: 'Localisation' },
        { key: 'company', icon: FiHome, label: 'Entreprise' },
        { key: 'specialty', icon: FiStar, label: 'Spécialité' }
      ]
    },
    consumer: {
      title: 'Mon Profil Consommateur',
      description: 'Gérez vos informations et préférences',
      icon: FiShoppingCart,
      color: 'blue',
      quickInfo: [
        { key: 'location', icon: FiMapPin, label: 'Localisation' },
        { key: 'preferences', icon: FiHeart, label: 'Préférences' },
        { key: 'notifications', icon: FiBell, label: 'Notifications' }
      ]
    },
    restaurateur: {
      title: 'Mon Profil Restaurateur',
      description: 'Gérez vos informations et préférences',
      icon: FiCoffee,
      color: 'orange',
      quickInfo: [
        { key: 'location', icon: FiMapPin, label: 'Localisation' },
        { key: 'restaurant', icon: FiCoffee, label: 'Restaurant' },
        { key: 'capacity', icon: FiUsers, label: 'Capacité' }
      ]
    }
  };

  const config = userConfig[userType] || userConfig.producer;

  // Fonctions d'upload d'images
  const handleAvatarChange = async (imageUrl) => {
    setProfile(prev => ({ ...prev, avatar: imageUrl }));
    await updateProfile({ avatar: imageUrl });
    showSuccess('Photo de profil mise à jour');
    loadProfile();
  };

  const handleAvatarRemove = async () => {
    setProfile(prev => ({ ...prev, avatar: null }));
    await updateProfile({ avatar: null });
    showSuccess('Photo de profil supprimée');
    loadProfile();
  };

  const handleBannerChange = async (imageUrl) => {
    setProfile(prev => ({ ...prev, shopBanner: imageUrl }));
    await updateProfile({ shopBanner: imageUrl });
    showSuccess('Bannière mise à jour');
    loadProfile();
  };

  const handleBannerRemove = async () => {
    setProfile(prev => ({ ...prev, shopBanner: null }));
    await updateProfile({ shopBanner: null });
    showSuccess('Bannière supprimée');
    loadProfile();
  };

  // Charger le profil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        // Gérer les différentes conventions de nommage des services
        const getProfileMethod = service.getMyProfile || service.getProfile;
        const response = await getProfileMethod();
        const profileData = response.data?.data?.[userType] || response.data?.[userType] || response.data?.data?.user || response.data?.user || {};
        
        setProfile(prev => ({
          ...prev,
          ...profileData,
          address: {
            ...prev.address,
            ...profileData.address
          },
          operatingHours: {
            ...prev.operatingHours,
            ...profileData.operatingHours
          },
          additionalServices: {
            ...prev.additionalServices,
            ...profileData.additionalServices
          }
        }));
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        showError('Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [service, userType]);

  // Gérer les changements d'input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Sauvegarder le profil
  const handleSave = async () => {
    try {
      setLoading(true);
      // Gérer les différentes conventions de nommage des services
      const updateProfileMethod = service.updateMyProfile || service.updateProfile;
      const response = await updateProfileMethod(profile);
      
      if (response.data?.status === 'success') {
        showSuccess('Profil mis à jour avec succès');
        setEditing(false);
        // Mettre à jour l'utilisateur dans le contexte
        updateProfile({ ...user, ...profile });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showError('Erreur lors de la sauvegarde du profil');
    } finally {
      setLoading(false);
    }
  };

  // Annuler l'édition
  const handleCancel = () => {
    setEditing(false);
    window.location.reload();
  };

  // Obtenir les informations rapides
  const getQuickInfo = () => {
    const info = [];
    
    config.quickInfo.forEach(item => {
      let value = '';
      switch (item.key) {
        case 'location':
          value = profile.address ? `${profile.address.city}, ${profile.address.region}` : 'Non renseigné';
          break;
        case 'specialty':
          value = profile.specialty || profile.transformationType || 'Non renseigné';
          break;
        case 'experience':
          value = profile.experience || 'Non renseigné';
          break;
        case 'company':
          value = profile.companyName || profile.restaurantName || 'Non renseigné';
          break;
        case 'preferences':
          value = profile.preferences?.length ? `${profile.preferences.length} préférences` : 'Aucune préférence';
          break;
        case 'notifications':
          value = profile.notifications?.email ? 'Activées' : 'Désactivées';
          break;
        case 'restaurant':
          value = profile.restaurantType || 'Non renseigné';
          break;
        case 'capacity':
          value = profile.seatingCapacity ? `${profile.seatingCapacity} places` : 'Non renseigné';
          break;
        default:
          value = profile[item.key] || 'Non renseigné';
      }
      
      info.push({ ...item, value });
    });
    
    return info;
  };

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-7xl mx-auto pb-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
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
      <div className="p-6 max-w-7xl mx-auto pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
            <p className="text-gray-600 mt-1">{config.description}</p>
          </div>
          <div className="flex space-x-3">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600 disabled:opacity-50"
                >
                  <FiSave className="h-4 w-4 mr-2" />
                  {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiX className="h-4 w-4 mr-2" />
                  Annuler
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiEdit className="h-4 w-4 mr-2" />
                Modifier
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne de gauche: Avatar et infos rapides */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    {profile.avatar ? (
                      <CloudinaryImage
                        src={profile.avatar}
                        alt={profile.firstName}
                        className="w-32 h-32 object-cover rounded-full"
                        width={200}
                        height={200}
                        quality="auto"
                        crop="fill"
                      />
                    ) : (
                      <config.icon className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-gray-500">
                  {profile.companyName || profile.restaurantName || profile.email}
                </p>
                
                <div className="mt-4 space-y-2">
                  {getQuickInfo().map((item, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-500">
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.value}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Détails du profil */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-harvests-green text-harvests-green'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="p-6">
                {tabs.map((tab) => (
                  activeTab === tab.id && (
                    <div key={tab.id}>
                      {React.createElement(tab.content, {
                        profile,
                        onChange: handleInputChange,
                        fields: profileFields[tab.id] || []
                      })}
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section d'upload d'images */}
        {editing && (
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📸 Gestion des Images
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo de profil
                </label>
                {profile.avatar && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">Image actuelle :</p>
                    <div className="w-20 h-20 rounded-lg overflow-hidden">
                      <CloudinaryImage
                        src={profile.avatar}
                        alt="Avatar actuel"
                        className="w-full h-full object-cover"
                        width={80}
                        height={80}
                        quality="auto"
                        crop="fill"
                      />
                    </div>
                  </div>
                )}
                <ImageUpload
                  currentImage={profile.avatar}
                  onImageChange={handleAvatarChange}
                  onImageRemove={handleAvatarRemove}
                  type="avatar"
                  size="large"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bannière
                </label>
                {profile.shopBanner && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">Bannière actuelle :</p>
                    <div className="w-full h-16 rounded-lg overflow-hidden">
                      <CloudinaryImage
                        src={profile.shopBanner}
                        alt="Bannière actuelle"
                        className="w-full h-full object-cover"
                        width={200}
                        height={64}
                        quality="auto"
                        crop="fill"
                      />
                    </div>
                  </div>
                )}
                <ImageUpload
                  currentImage={profile.shopBanner}
                  onImageChange={handleBannerChange}
                  onImageRemove={handleBannerRemove}
                  type="banner"
                  size="large"
                  aspectRatio="banner"
                  className="w-full h-24"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ModularDashboardLayout>
  );
};

export default UniversalProfile;
