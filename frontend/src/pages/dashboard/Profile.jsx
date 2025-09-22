import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModularDashboardLayout from '../../components/layout/ModularDashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/api';
import UserStatusBadge from '../../components/user/UserStatusBadge';
import { FiEdit3, FiMapPin, FiHeart, FiShoppingCart, FiBell } from 'react-icons/fi';

const Profile = () => {
  const { user } = useAuth();
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

  const getLanguageName = (code) => {
    return code === 'fr' ? 'Français' : 'English';
  };

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-7xl mx-auto pb-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
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
      <div className="p-6 max-w-7xl mx-auto pb-20">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos informations personnelles et préférences
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <UserStatusBadge showDetails={true} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informations personnelles */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiEdit3 className="h-5 w-5 mr-2 text-harvests-green" />
                Informations personnelles
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prénom</label>
                  <p className="text-gray-900 text-lg">{currentUser?.firstName || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <p className="text-gray-900 text-lg">{currentUser?.lastName || 'Non renseigné'}</p>
                </div>
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
            
            {/* Informations spécifiques au consommateur */}
            {currentUser?.userType === 'consumer' && (
              <div>
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

                {/* Préférences alimentaires */}
                <div className="mt-6">
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
                <div className="mt-6">
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
                <div className="mt-6">
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
              </div>
            )}

            {/* Informations générales pour les autres types d'utilisateurs */}
            {currentUser?.userType !== 'consumer' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du compte</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type de compte</label>
                    <p className="text-gray-900 text-lg capitalize">{currentUser?.userType || 'Non défini'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Statut du compte</label>
                    <p className="text-gray-900 text-lg">
                      {currentUser?.isActive ? 'Actif' : 'Inactif'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email vérifié</label>
                    <p className="text-gray-900 text-lg">
                      {currentUser?.isEmailVerified ? 'Oui' : 'Non'}
                    </p>
                  </div>
                </div>
              </div>
            )}
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
      </div>
    </ModularDashboardLayout>
  );
};

export default Profile;
