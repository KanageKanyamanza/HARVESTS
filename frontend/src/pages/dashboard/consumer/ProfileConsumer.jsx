import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import { useAuth } from '../../../hooks/useAuth';
import { authService } from '../../../services';
import ImageUpload from '../../../components/common/ImageUpload';
import { FiEdit3, FiMapPin, FiHeart, FiShoppingCart, FiBell, FiUser } from 'react-icons/fi';

const ProfileConsumer = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

  const getLanguageName = (code) => {
    return code === 'fr' ? 'Français' : 'English';
  };

  // Gestion de l'upload d'avatar
  const handleAvatarChange = async (newAvatar) => {
    setUploadingAvatar(true);
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
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = () => {
    setProfileData(prev => ({
      ...prev,
      avatar: null
    }));
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
          <h1 className="text-2xl font-bold text-gray-900">Mon Profil Consommateur</h1>
          <p className="text-gray-600 mt-1">Gérez vos informations personnelles et préférences</p>
        </div>

        <div className="space-y-8">
          {/* Informations de base */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Informations personnelles</h2>
            
            {/* Photo de profil */}
            <div className="flex items-start space-x-6 mb-6">
              <div className="flex-shrink-0">
                <ImageUpload
                  currentImage={currentUser?.avatar}
                  onImageChange={handleAvatarChange}
                  onImageRemove={handleAvatarRemove}
                  type="avatar"
                  size="large"
                  disabled={uploadingAvatar}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </h3>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FiUser className="h-4 w-4" />
                  <span>Consommateur</span>
                  {currentUser?.isApproved && (
                    <>
                      <span>•</span>
                      <span className="text-green-600 font-medium">Compte vérifié</span>
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
                <label className="block text-sm font-medium text-gray-700">Ville</label>
                <p className="text-gray-900 text-lg">{currentUser?.address?.city || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pays</label>
                <p className="text-gray-900 text-lg">{getCountryName(currentUser?.country)}</p>
              </div>
            </div>
          </div>
          
          {/* Préférences d'achat */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiShoppingCart className="h-5 w-5 mr-2 text-harvests-green" />
              Préférences d'achat
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Créneau de livraison</label>
                <p className="text-gray-900 text-lg">
                  {currentUser?.shoppingPreferences?.preferredDeliveryTime === 'flexible' ? 'Flexible' :
                   currentUser?.shoppingPreferences?.preferredDeliveryTime === 'morning' ? 'Matin (8h-12h)' :
                   currentUser?.shoppingPreferences?.preferredDeliveryTime === 'afternoon' ? 'Après-midi (12h-18h)' :
                   currentUser?.shoppingPreferences?.preferredDeliveryTime === 'evening' ? 'Soirée (18h-21h)' :
                   currentUser?.shoppingPreferences?.preferredDeliveryTime === 'weekend' ? 'Weekend uniquement' :
                   'Non défini'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Distance max de livraison</label>
                <p className="text-gray-900 text-lg">{currentUser?.shoppingPreferences?.maxDeliveryDistance || 0} km</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Budget</label>
                <p className="text-gray-900 text-lg">
                  {currentUser?.shoppingPreferences?.budgetRange?.min || 0} - {currentUser?.shoppingPreferences?.budgetRange?.max || 0} {currentUser?.shoppingPreferences?.budgetRange?.currency || 'XAF'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Méthodes de paiement</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {currentUser?.shoppingPreferences?.preferredPaymentMethods?.map((method, index) => (
                    <span key={index} className="px-2 py-1 bg-harvests-green/10 text-harvests-green rounded-full text-sm">
                      {method === 'cash' ? 'Espèces' :
                       method === 'card' ? 'Carte bancaire' :
                       method === 'mobile-money' ? 'Mobile Money' :
                       method === 'bank-transfer' ? 'Virement bancaire' : method}
                    </span>
                  )) || <span className="text-gray-500">Non défini</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Préférences alimentaires */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <FiHeart className="h-4 w-4 mr-2 text-harvests-green" />
              Préférences alimentaires
            </h4>
            <div className="flex flex-wrap gap-2">
              {currentUser?.dietaryPreferences?.length > 0 ? (
                currentUser.dietaryPreferences.map((pref, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {pref === 'organic' ? 'Bio/Organique' :
                     pref === 'vegetarian' ? 'Végétarien' :
                     pref === 'vegan' ? 'Végan' :
                     pref === 'gluten-free' ? 'Sans gluten' :
                     pref === 'halal' ? 'Halal' :
                     pref === 'kosher' ? 'Casher' :
                     pref === 'local' ? 'Produits locaux' :
                     pref === 'seasonal' ? 'Produits de saison' : pref}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">Aucune préférence définie</span>
              )}
            </div>
          </div>

          {/* Adresses de livraison */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <FiMapPin className="h-4 w-4 mr-2 text-harvests-green" />
              Adresses de livraison
            </h4>
            {currentUser?.deliveryAddresses?.length > 0 ? (
              <div className="space-y-2">
                {currentUser.deliveryAddresses.map((address, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{address.label || `Adresse ${index + 1}`}</p>
                        <p className="text-sm text-gray-600">
                          {address.street}, {address.city}, {address.region}
                        </p>
                        {address.instructions && (
                          <p className="text-xs text-gray-500 mt-1">{address.instructions}</p>
                        )}
                      </div>
                      {address.isDefault && (
                        <span className="px-2 py-1 bg-harvests-green text-white text-xs rounded-full">
                          Par défaut
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Aucune adresse de livraison configurée</p>
            )}
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <FiBell className="h-4 w-4 mr-2 text-harvests-green" />
              Notifications
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Email</span>
                <span className={`px-2 py-1 rounded-full text-xs ${currentUser?.notifications?.email ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {currentUser?.notifications?.email ? 'Activé' : 'Désactivé'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">SMS</span>
                <span className={`px-2 py-1 rounded-full text-xs ${currentUser?.notifications?.sms ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {currentUser?.notifications?.sms ? 'Activé' : 'Désactivé'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Push</span>
                <span className={`px-2 py-1 rounded-full text-xs ${currentUser?.notifications?.push ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {currentUser?.notifications?.push ? 'Activé' : 'Désactivé'}
                </span>
              </div>
            </div>
          </div>

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
            onClick={() => navigate('/consumer/settings')}
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

export default ProfileConsumer;
