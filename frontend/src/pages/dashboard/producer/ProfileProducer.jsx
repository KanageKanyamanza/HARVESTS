import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import { useAuth } from '../../../hooks/useAuth';
import { authService } from '../../../services';
import ImageUpload from '../../../components/common/ImageUpload';
import Badge from '../../../components/common/Badge';
import { FiEdit3, FiMapPin, FiTruck, FiAward, FiPackage, FiDollarSign, FiCamera, FiShoppingBag } from 'react-icons/fi';

const ProfileProducer = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger les données complètes du profil
  useEffect(() => {
    const loadProfileData = async () => {
      if (user) {
        try {
          const response = await authService.getProfile();
          if (response.data.status === 'success') {
            setProfileData(response.data.data.user);
          }
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error);
        }
      }
      setLoading(false);
    };

    loadProfileData();
  }, [user]);

  const getCountryName = (code) => {
    const countries = {
      'CM': 'Cameroun',
      'SN': 'Sénégal',
      'CI': 'Côte d\'Ivoire',
      'GH': 'Ghana',
      'NG': 'Nigeria',
      'KE': 'Kenya'
    };
    return countries[code] || code;
  };

  // Gestion de l'upload d'avatar
  const handleAvatarChange = async (newAvatar) => {
    try {
      // Mettre à jour les données locales du profil
      setProfileData(prev => ({
        ...prev,
        avatar: newAvatar
      }));
      
      // Mettre à jour le contexte d'authentification pour que l'avatar s'affiche dans la sidebar/topbar
      await updateProfile({ avatar: newAvatar });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'avatar:', error);
    }
  };

  const handleAvatarRemove = () => {
    setProfileData(prev => ({
      ...prev,
      avatar: null
    }));
  };

  // Gestion de l'upload de bannière de boutique
  const handleBannerChange = async (newBanner) => {
    try {
      // Mettre à jour les données locales du profil
      setProfileData(prev => ({
        ...prev,
        shopBanner: newBanner
      }));
      
      // Mettre à jour le contexte d'authentification
      await updateProfile({ shopBanner: newBanner });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la bannière:', error);
    }
  };

  const handleBannerRemove = () => {
    setProfileData(prev => ({
      ...prev,
      shopBanner: null
    }));
  };

  const getLanguageName = (code) => {
    return code === 'fr' ? 'Français' : 'English';
  };

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-4xl mx-auto pb-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  const currentUser = profileData || user;

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-4xl mx-auto pb-20">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mon Profil Producteur</h1>
          <p className="text-gray-600 mt-1">Gérez vos informations de ferme et de production</p>
        </div>

        <div className="space-y-8">
          {/* Informations personnelles */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Informations personnelles</h2>
            
            {/* Photo de profil et badge */}
            <div className="flex items-start space-x-6 mb-6">
              <div className="flex-shrink-0">
                <ImageUpload
                  currentImage={currentUser?.avatar}
                  onImageChange={handleAvatarChange}
                  onImageRemove={handleAvatarRemove}
                  type="avatar"
                  size="large"
                />
                
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </h3>
                  {currentUser?.badge && (
                    <Badge type={currentUser.badge} size="medium" />
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FiAward className="h-4 w-4" />
                  <span>Producteur</span>
                  {currentUser?.isApproved && (
                    <>
                      <span>•</span>
                      <span className="text-green-600 font-medium">Compte approuvé</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900 text-lg">{currentUser?.email || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                <p className="text-gray-900 text-lg">{currentUser?.phone || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Langue préférée</label>
                <p className="text-gray-900 text-lg">{getLanguageName(currentUser?.preferredLanguage)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pays</label>
                <p className="text-gray-900 text-lg">{getCountryName(currentUser?.country)}</p>
              </div>
            </div>
          </div>

          {/* Informations de la ferme */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FiMapPin className="h-5 w-5 mr-2 text-harvests-green" />
              Informations de la ferme
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom de la ferme</label>
                <p className="text-gray-900 text-lg">{currentUser?.farmName || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Taille de la ferme</label>
                <p className="text-gray-900 text-lg">
                  {currentUser?.farmSize?.value ? 
                    `${currentUser.farmSize.value} ${currentUser.farmSize.unit || 'hectares'}` : 
                    'Non renseigné'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type d'agriculture</label>
                <p className="text-gray-900 text-lg">
                  {currentUser?.farmingType === 'organic' ? 'Biologique' :
                   currentUser?.farmingType === 'conventional' ? 'Conventionnel' :
                   currentUser?.farmingType === 'mixed' ? 'Mixte' :
                   currentUser?.farmingType || 'Non renseigné'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Capacité de stockage</label>
                <p className="text-gray-900 text-lg">
                  {currentUser?.storageCapacity?.value ? 
                    `${currentUser.storageCapacity.value} ${currentUser.storageCapacity.unit || 'tonnes'}` : 
                    'Non renseigné'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Cultures cultivées */}
          {currentUser?.crops && currentUser.crops.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <FiPackage className="h-4 w-4 mr-2 text-harvests-green" />
                Cultures cultivées
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentUser.crops.map((crop, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {crop.name || 'Culture'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Équipements */}
          {currentUser?.equipment && currentUser.equipment.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <FiAward className="h-4 w-4 mr-2 text-harvests-green" />
                Équipements
              </h4>
              <div className="space-y-2">
                {currentUser.equipment.map((equip, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    <p className="font-medium text-gray-900 capitalize">{equip.type || 'Équipement'}</p>
                    {equip.description && (
                      <p className="text-sm text-gray-600">{equip.description}</p>
                    )}
                    {equip.capacity && (
                      <p className="text-sm text-gray-500">Capacité: {equip.capacity}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Options de livraison */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <FiTruck className="h-4 w-4 mr-2 text-harvests-green" />
              Options de livraison
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Livraison possible</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  currentUser?.deliveryOptions?.canDeliver ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {currentUser?.deliveryOptions?.canDeliver ? 'Oui' : 'Non'}
                </span>
              </div>
              {currentUser?.deliveryOptions?.canDeliver && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Rayon de livraison</span>
                    <span className="text-sm text-gray-900">
                      {currentUser.deliveryOptions.deliveryRadius || 0} km
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Frais de livraison</span>
                    <span className="text-sm text-gray-900">
                      {currentUser.deliveryOptions.deliveryFee || 0} FCFA
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Boutique */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <FiShoppingBag className="h-4 w-4 mr-2 text-harvests-green" />
              Ma Boutique
            </h4>
            
            {/* Bannière de boutique */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bannière de boutique
              </label>
              <ImageUpload
                currentImage={currentUser?.shopBanner}
                onImageChange={handleBannerChange}
                onImageRemove={handleBannerRemove}
                type="banner"
                size="large"
                aspectRatio="banner"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">
                Recommandé: 1200x400px. Cette image apparaîtra en haut de votre boutique.
              </p>
            </div>

            {/* Informations de la boutique */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom de la boutique</label>
                <p className="text-gray-900">
                  {currentUser?.shopInfo?.shopName || currentUser?.farmName || 'Non défini'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut de la boutique</label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  currentUser?.shopInfo?.isShopActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {currentUser?.shopInfo?.isShopActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description de la boutique</label>
                <p className="text-gray-900">
                  {currentUser?.shopInfo?.shopDescription || currentUser?.shopDescription || 'Aucune description'}
                </p>
              </div>
            </div>
          </div>

          {/* Informations commerciales */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <FiDollarSign className="h-4 w-4 mr-2 text-harvests-green" />
              Informations commerciales
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Quantité minimale de commande</span>
                <span className="text-sm text-gray-900">
                  {currentUser?.minimumOrderQuantity?.value || 1} {currentUser?.minimumOrderQuantity?.unit || 'unité(s)'}
                </span>
              </div>
            </div>
          </div>

          {/* Statistiques de vente */}
          {currentUser?.salesStats && (
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Statistiques de vente</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{currentUser.salesStats.totalOrders || 0}</p>
                  <p className="text-sm text-gray-500">Commandes totales</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {(currentUser.salesStats.totalRevenue || 0).toLocaleString()} FCFA
                  </p>
                  <p className="text-sm text-gray-500">Revenus totaux</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{currentUser.salesStats.averageRating || 0}/5</p>
                  <p className="text-sm text-gray-500">Note moyenne</p>
                </div>
              </div>
            </div>
          )}

          {/* Informations de sécurité du compte */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Sécurité du compte</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Compte approuvé</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  currentUser?.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {currentUser?.isApproved ? 'Oui' : 'En attente'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Profil complet</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  currentUser?.isProfileComplete ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {currentUser?.isProfileComplete ? 'Oui' : 'Non'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Dernière connexion</span>
                <span className="text-sm text-gray-900">
                  {currentUser?.lastLogin ? 
                    new Date(currentUser.lastLogin).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Jamais'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Devise préférée</span>
                <span className="text-sm text-gray-900">
                  {currentUser?.currency || 'XOF (Franc CFA)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={() => navigate('/settings')}
            className="flex items-center space-x-2 px-6 py-2 bg-harvests-green text-white rounded-md hover:bg-harvests-green/90 transition-colors"
          >
            <FiEdit3 className="h-4 w-4" />
            <span>Modifier le profil</span>
          </button>
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default ProfileProducer;
