import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { authService, consumerService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import {
  FiUser,
  FiHeart,
  FiMapPin,
  FiShoppingCart,
  FiCreditCard,
  FiBell,
  FiSave,
  FiPlus,
  FiTrash2,
  FiEdit3,
  FiGlobe,
  FiShield,
  FiAlertTriangle
} from 'react-icons/fi';

const SettingsConsumer = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // États pour les différentes sections
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    preferredLanguage: 'fr',
    country: 'CM'
  });

  const [dietaryPreferences, setDietaryPreferences] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [deliveryAddresses, setDeliveryAddresses] = useState([]);
  const [shoppingPreferences, setShoppingPreferences] = useState({
    preferredDeliveryTime: 'flexible',
    maxDeliveryDistance: 25,
    budgetRange: { min: 0, max: 100000, currency: 'XAF' },
    preferredPaymentMethods: ['cash', 'mobile-money']
  });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true
  });

  // Charger les données utilisateur
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const response = await authService.getProfile();
          if (response.data.status === 'success') {
            const userData = response.data.data.user;
            
            // Données de profil de base
            setProfileData({
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              email: userData.email || '',
              phone: userData.phone || '',
              preferredLanguage: userData.preferredLanguage || 'fr',
              country: userData.country || 'CM'
            });

            // Données spécifiques consommateur
            setDietaryPreferences(userData.dietaryPreferences || []);
            setAllergies(userData.allergies || []);
            setDeliveryAddresses(userData.deliveryAddresses || []);
            setShoppingPreferences(userData.shoppingPreferences || {
              preferredDeliveryTime: 'flexible',
              maxDeliveryDistance: 25,
              budgetRange: { min: 0, max: 100000, currency: 'XAF' },
              preferredPaymentMethods: ['cash', 'mobile-money']
            });
            setNotifications(userData.notifications || {
              email: true,
              sms: false,
              push: true
            });
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
        }
      }
    };

    loadUserData();
  }, [user]);

  const tabs = [
    { id: 'profile', label: 'Profil', icon: FiUser },
    { id: 'dietary', label: 'Préférences alimentaires', icon: FiHeart },
    { id: 'addresses', label: 'Adresses', icon: FiMapPin },
    { id: 'shopping', label: 'Achats', icon: FiShoppingCart },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'security', label: 'Sécurité', icon: FiShield }
  ];

  const dietaryOptions = [
    { value: 'organic', label: 'Bio/Organique' },
    { value: 'vegetarian', label: 'Végétarien' },
    { value: 'vegan', label: 'Végan' },
    { value: 'gluten-free', label: 'Sans gluten' },
    { value: 'halal', label: 'Halal' },
    { value: 'kosher', label: 'Casher' },
    { value: 'local', label: 'Produits locaux' },
    { value: 'seasonal', label: 'Produits de saison' }
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Espèces' },
    { value: 'card', label: 'Carte bancaire' },
    { value: 'mobile-money', label: 'Mobile Money' },
    { value: 'bank-transfer', label: 'Virement bancaire' }
  ];

  const countries = [
    { value: 'CM', label: 'Cameroun' },
    { value: 'SN', label: 'Sénégal' },
    { value: 'CI', label: 'Côte d\'Ivoire' },
    { value: 'GH', label: 'Ghana' },
    { value: 'NG', label: 'Nigeria' },
    { value: 'KE', label: 'Kenya' }
  ];

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Sauvegarder les données de profil de base
      await authService.updateProfile(profileData);
      
      // Sauvegarder les préférences alimentaires
      await consumerService.updateDietaryPreferences({ dietaryPreferences });
      
      // Sauvegarder les adresses de livraison
      for (const address of deliveryAddresses) {
        const addressData = { ...address };
        delete addressData.id; // Supprimer l'ID local avant l'envoi
        
        if (address.id && address.id.toString().length > 10) {
          // Adresse existante - mise à jour
          await consumerService.updateDeliveryAddress(address.id, addressData);
        } else {
          // Nouvelle adresse - création
          await consumerService.addDeliveryAddress(addressData);
        }
      }
      
      // Sauvegarder les préférences d'achat
      await consumerService.updateShoppingPreferences(shoppingPreferences);
      
      // Sauvegarder les préférences de notification
      await consumerService.updateNotificationPreferences(notifications);

      // Mettre à jour le contexte utilisateur
      await updateProfile();

      setMessage({ type: 'success', text: 'Paramètres sauvegardés avec succès !' });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde des paramètres' });
    } finally {
      setLoading(false);
    }
  };

  const addDeliveryAddress = () => {
    setDeliveryAddresses([...deliveryAddresses, {
      id: Date.now(), // ID temporaire
      label: '',
      street: '',
      city: '',
      region: '',
      country: 'Cameroun',
      postalCode: '',
      instructions: '',
      isDefault: deliveryAddresses.length === 0
    }]);
  };

  const removeDeliveryAddress = (index) => {
    const newAddresses = deliveryAddresses.filter((_, i) => i !== index);
    setDeliveryAddresses(newAddresses);
  };

  const setDefaultAddress = (index) => {
    const newAddresses = deliveryAddresses.map((addr, i) => ({
      ...addr,
      isDefault: i === index
    }));
    setDeliveryAddresses(newAddresses);
  };

  const addAllergy = () => {
    setAllergies([...allergies, { name: '', severity: 'mild' }]);
  };

  const removeAllergy = (index) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-20">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Paramètres Consommateur</h1>
          <p className="text-gray-600 mt-1">Gérez vos préférences et informations personnelles</p>
        </div>

        {/* Message de statut */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          {/* Onglets */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-harvests-green text-harvests-green'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="p-6">
            {/* Onglet Profil */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Informations personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prénom</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Langue préférée</label>
                    <select
                      value={profileData.preferredLanguage}
                      onChange={(e) => setProfileData({...profileData, preferredLanguage: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pays</label>
                    <select
                      value={profileData.country}
                      onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    >
                      {countries.map(country => (
                        <option key={country.value} value={country.value}>{country.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Préférences alimentaires */}
            {activeTab === 'dietary' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Préférences alimentaires</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Sélectionnez vos préférences</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {dietaryOptions.map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={dietaryPreferences.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDietaryPreferences([...dietaryPreferences, option.value]);
                            } else {
                              setDietaryPreferences(dietaryPreferences.filter(p => p !== option.value));
                            }
                          }}
                          className="rounded border-gray-300 text-harvests-green focus:ring-harvests-green"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Allergies</label>
                    <button
                      onClick={addAllergy}
                      className="flex items-center text-sm text-harvests-green hover:text-green-600"
                    >
                      <FiPlus className="h-4 w-4 mr-1" />
                      Ajouter
                    </button>
                  </div>
                  <div className="space-y-3">
                    {allergies.map((allergy, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={allergy.name}
                          onChange={(e) => {
                            const newAllergies = [...allergies];
                            newAllergies[index].name = e.target.value;
                            setAllergies(newAllergies);
                          }}
                          placeholder="Nom de l'allergie"
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                        />
                        <select
                          value={allergy.severity}
                          onChange={(e) => {
                            const newAllergies = [...allergies];
                            newAllergies[index].severity = e.target.value;
                            setAllergies(newAllergies);
                          }}
                          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                        >
                          <option value="mild">Légère</option>
                          <option value="moderate">Modérée</option>
                          <option value="severe">Sévère</option>
                        </select>
                        <button
                          onClick={() => removeAllergy(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Adresses */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Adresses de livraison</h3>
                  <button
                    onClick={addDeliveryAddress}
                    className="flex items-center px-4 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600"
                  >
                    <FiPlus className="h-4 w-4 mr-2" />
                    Ajouter une adresse
                  </button>
                </div>
                <div className="space-y-4">
                  {deliveryAddresses.map((address, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Libellé</label>
                          <input
                            type="text"
                            value={address.label}
                            onChange={(e) => {
                              const newAddresses = [...deliveryAddresses];
                              newAddresses[index].label = e.target.value;
                              setDeliveryAddresses(newAddresses);
                            }}
                            placeholder="Ex: Domicile, Bureau..."
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Rue</label>
                          <input
                            type="text"
                            value={address.street}
                            onChange={(e) => {
                              const newAddresses = [...deliveryAddresses];
                              newAddresses[index].street = e.target.value;
                              setDeliveryAddresses(newAddresses);
                            }}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Ville</label>
                          <input
                            type="text"
                            value={address.city}
                            onChange={(e) => {
                              const newAddresses = [...deliveryAddresses];
                              newAddresses[index].city = e.target.value;
                              setDeliveryAddresses(newAddresses);
                            }}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Région</label>
                          <input
                            type="text"
                            value={address.region}
                            onChange={(e) => {
                              const newAddresses = [...deliveryAddresses];
                              newAddresses[index].region = e.target.value;
                              setDeliveryAddresses(newAddresses);
                            }}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Code postal</label>
                          <input
                            type="text"
                            value={address.postalCode}
                            onChange={(e) => {
                              const newAddresses = [...deliveryAddresses];
                              newAddresses[index].postalCode = e.target.value;
                              setDeliveryAddresses(newAddresses);
                            }}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Instructions</label>
                          <input
                            type="text"
                            value={address.instructions}
                            onChange={(e) => {
                              const newAddresses = [...deliveryAddresses];
                              newAddresses[index].instructions = e.target.value;
                              setDeliveryAddresses(newAddresses);
                            }}
                            placeholder="Ex: Sonner 2 fois..."
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={address.isDefault}
                            onChange={() => setDefaultAddress(index)}
                            className="rounded border-gray-300 text-harvests-green focus:ring-harvests-green"
                          />
                          <span className="ml-2 text-sm text-gray-700">Adresse par défaut</span>
                        </label>
                        <button
                          onClick={() => removeDeliveryAddress(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Onglet Achats */}
            {activeTab === 'shopping' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Préférences d'achat</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Créneau de livraison préféré</label>
                    <select
                      value={shoppingPreferences.preferredDeliveryTime}
                      onChange={(e) => setShoppingPreferences({...shoppingPreferences, preferredDeliveryTime: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    >
                      <option value="flexible">Flexible</option>
                      <option value="morning">Matin (8h-12h)</option>
                      <option value="afternoon">Après-midi (12h-18h)</option>
                      <option value="evening">Soirée (18h-21h)</option>
                      <option value="weekend">Weekend uniquement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Distance max de livraison (km)</label>
                    <input
                      type="number"
                      value={shoppingPreferences.maxDeliveryDistance}
                      onChange={(e) => setShoppingPreferences({...shoppingPreferences, maxDeliveryDistance: parseInt(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Budget minimum (FCFA)</label>
                    <input
                      type="number"
                      value={shoppingPreferences.budgetRange.min}
                      onChange={(e) => setShoppingPreferences({
                        ...shoppingPreferences, 
                        budgetRange: {...shoppingPreferences.budgetRange, min: parseInt(e.target.value)}
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Budget maximum (FCFA)</label>
                    <input
                      type="number"
                      value={shoppingPreferences.budgetRange.max}
                      onChange={(e) => setShoppingPreferences({
                        ...shoppingPreferences, 
                        budgetRange: {...shoppingPreferences.budgetRange, max: parseInt(e.target.value)}
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Méthodes de paiement préférées</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {paymentMethods.map(method => (
                      <label key={method.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={shoppingPreferences.preferredPaymentMethods.includes(method.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setShoppingPreferences({
                                ...shoppingPreferences,
                                preferredPaymentMethods: [...shoppingPreferences.preferredPaymentMethods, method.value]
                              });
                            } else {
                              setShoppingPreferences({
                                ...shoppingPreferences,
                                preferredPaymentMethods: shoppingPreferences.preferredPaymentMethods.filter(m => m !== method.value)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-harvests-green focus:ring-harvests-green"
                        />
                        <span className="ml-2 text-sm text-gray-700">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Préférences de notification</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Notifications par email</label>
                      <p className="text-sm text-gray-500">Recevoir des notifications par email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-harvests-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-harvests-green"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Notifications SMS</label>
                      <p className="text-sm text-gray-500">Recevoir des notifications par SMS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.sms}
                        onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-harvests-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-harvests-green"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Notifications push</label>
                      <p className="text-sm text-gray-500">Recevoir des notifications push dans le navigateur</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-harvests-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-harvests-green"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Sécurité */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Sécurité du compte</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <FiAlertTriangle className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-yellow-800">Changer le mot de passe</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Pour changer votre mot de passe, veuillez utiliser la fonctionnalité "Mot de passe oublié" 
                        depuis la page de connexion.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email vérifié</label>
                      <p className="text-sm text-gray-500">Votre adresse email est vérifiée</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Vérifié
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Authentification à deux facteurs</label>
                      <p className="text-sm text-gray-500">Ajoutez une couche de sécurité supplémentaire</p>
                    </div>
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200">
                      Non activé
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bouton de sauvegarde */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center px-6 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <FiSave className="h-4 w-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default SettingsConsumer;
