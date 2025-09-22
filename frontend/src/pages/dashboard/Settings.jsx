import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService, consumerService } from '../../services/api';
import ModularDashboardLayout from '../../components/layout/ModularDashboardLayout';
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

const Settings = () => {
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

  // Options disponibles
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

  const deliveryTimeOptions = [
    { value: 'morning', label: 'Matin (8h-12h)' },
    { value: 'afternoon', label: 'Après-midi (12h-18h)' },
    { value: 'evening', label: 'Soirée (18h-21h)' },
    { value: 'weekend', label: 'Weekend uniquement' },
    { value: 'flexible', label: 'Flexible' }
  ];

  const paymentMethodOptions = [
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

  const tabs = [
    { id: 'profile', label: 'Profil personnel', icon: FiUser },
    { id: 'dietary', label: 'Préférences alimentaires', icon: FiHeart },
    { id: 'addresses', label: 'Adresses de livraison', icon: FiMapPin },
    { id: 'shopping', label: 'Préférences d\'achat', icon: FiShoppingCart },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'security', label: 'Sécurité', icon: FiShield }
  ];

  // Charger les données utilisateur depuis l'API au montage
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          // Charger le profil complet depuis l'API
          const profileResponse = await authService.getProfile();
          if (profileResponse.data.status === 'success') {
            const userData = profileResponse.data.data.user;
            
            setProfileData({
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              email: userData.email || '',
              phone: userData.phone || '',
              preferredLanguage: userData.preferredLanguage || 'fr',
              country: userData.country || 'CM'
            });
            
            // Charger les données spécifiques au consommateur depuis les données du profil
            if (userData.userType === 'consumer') {
              setDietaryPreferences(userData.dietaryPreferences || []);
              setShoppingPreferences(userData.shoppingPreferences || {
                preferredDeliveryTime: 'flexible',
                maxDeliveryDistance: 25,
                budgetRange: { min: 0, max: 100000, currency: 'XAF' },
                preferredPaymentMethods: ['cash', 'mobile-money']
              });
              setNotifications(userData.notifications || { email: true, sms: false, push: true });
              setAllergies(userData.allergies || []);
              setDeliveryAddresses(userData.deliveryAddresses || []);
            } else {
              // Pour les autres types d'utilisateurs, utiliser les données de base
              setNotifications(userData.notifications || { email: true, sms: false, push: true });
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error);
          // Fallback sur les données du contexte en cas d'erreur
          setProfileData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            preferredLanguage: user.preferredLanguage || 'fr',
            country: user.country || 'SN'
          });
          setNotifications(user.notifications || { email: true, sms: false, push: true });
        }
      }
    };

    loadUserData();
  }, [user]);



  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };


  const handleSave = async () => {
    setLoading(true);
    try {
      // Sauvegarder le profil de base (User)
      await authService.updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        preferredLanguage: profileData.preferredLanguage,
        country: profileData.country,
        notifications: notifications
      });

      // Sauvegarder les données spécifiques au consommateur si l'utilisateur est un consumer
      if (user?.userType === 'consumer') {
        // Sauvegarder les préférences alimentaires
        await consumerService.updateDietaryPreferences(dietaryPreferences);

        // Sauvegarder les préférences d'achat
        await consumerService.updateShoppingPreferences(shoppingPreferences);

        // Sauvegarder les préférences de communication
        await consumerService.updateNotificationPreferences(notifications);

        // Sauvegarder les adresses de livraison
        for (const address of deliveryAddresses) {
          if (address.id && address.id > 1000000000000) { // ID généré localement (timestamp)
            // Nouvelle adresse - l'ajouter (nettoyer l'ID local)
            const cleanAddress = { ...address };
            delete cleanAddress.id; // Supprimer l'ID local
            await consumerService.addDeliveryAddress(cleanAddress);
          } else if (address._id) {
            // Adresse existante - la mettre à jour
            const cleanAddress = { ...address };
            delete cleanAddress.id; // Supprimer l'ID local s'il existe
            await consumerService.updateDeliveryAddress(address._id, cleanAddress);
          }
        }
      }

      // Recharger toutes les données depuis l'API pour afficher les modifications
      const profileResponse = await authService.getProfile();
      if (profileResponse.data.status === 'success') {
        const userData = profileResponse.data.data.user;
        
        // Mettre à jour le contexte d'authentification
        await updateProfile({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          preferredLanguage: userData.preferredLanguage,
          country: userData.country,
          notifications: userData.notifications
        });

        // Recharger les données spécifiques au consommateur
        if (userData.userType === 'consumer') {
          const dietaryResponse = await consumerService.getDietaryPreferences();
          if (dietaryResponse.success) {
            setDietaryPreferences(dietaryResponse.data.dietaryPreferences || []);
          }

          const shoppingResponse = await consumerService.getShoppingPreferences();
          if (shoppingResponse.success) {
            setShoppingPreferences(shoppingResponse.data.shoppingPreferences || {
              preferredDeliveryTime: 'flexible',
              maxDeliveryDistance: 25,
              budgetRange: { min: 0, max: 100000, currency: 'XAF' },
              preferredPaymentMethods: ['cash', 'mobile-money']
            });
          }

          const notificationResponse = await consumerService.getNotificationPreferences();
          if (notificationResponse.success) {
            setNotifications(notificationResponse.data.preferences || { email: true, sms: false, push: true });
          }
        }
      }

      showMessage('success', 'Paramètres sauvegardés avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showMessage('error', 'Erreur lors de la sauvegarde des paramètres');
    }
    setLoading(false);
  };

  const addDeliveryAddress = () => {
    setDeliveryAddresses([...deliveryAddresses, {
      id: Date.now(),
      label: '',
      street: '',
      city: '',
      region: '',
      country: profileData.country || 'SN', // Synchroniser avec le pays du profil
      postalCode: '',
      instructions: '',
      isDefault: deliveryAddresses.length === 0
    }]);
  };

  const removeDeliveryAddress = (index) => {
    const newAddresses = deliveryAddresses.filter((_, i) => i !== index);
    setDeliveryAddresses(newAddresses);
  };

  const updateDeliveryAddress = (index, field, value) => {
    const newAddresses = [...deliveryAddresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setDeliveryAddresses(newAddresses);
  };

  const addAllergy = () => {
    setAllergies([...allergies, { allergen: '', severity: 'mild' }]);
  };

  const removeAllergy = (index) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const updateAllergy = (index, field, value) => {
    const newAllergies = [...allergies];
    newAllergies[index] = { ...newAllergies[index], [field]: value };
    setAllergies(newAllergies);
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Informations personnelles</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
          <input
            type="text"
            value={profileData.firstName}
            onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
          <input
            type="text"
            value={profileData.lastName}
            onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Langue préférée</label>
          <select
            value={profileData.preferredLanguage}
            onChange={(e) => setProfileData({ ...profileData, preferredLanguage: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
          <select
            value={profileData.country}
            onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
          >
            {countries.map(country => (
              <option key={country.value} value={country.value}>{country.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderDietarySection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Préférences alimentaires</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {dietaryOptions.map(option => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dietaryPreferences.includes(option.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setDietaryPreferences([...dietaryPreferences, option.value]);
                  } else {
                    setDietaryPreferences(dietaryPreferences.filter(pref => pref !== option.value));
                  }
                }}
                className="rounded text-harvests-green focus:ring-harvests-green"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Allergies alimentaires</h3>
          <button
            onClick={addAllergy}
            className="flex items-center space-x-1 px-3 py-1 bg-harvests-green text-white rounded-md hover:bg-harvests-green/90"
          >
            <FiPlus className="h-4 w-4" />
            <span>Ajouter</span>
          </button>
        </div>
        
        {allergies.map((allergy, index) => (
          <div key={index} className="flex items-center space-x-3 mb-3">
            <input
              type="text"
              placeholder="Allergène"
              value={allergy.allergen}
              onChange={(e) => updateAllergy(index, 'allergen', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
            />
            <select
              value={allergy.severity}
              onChange={(e) => updateAllergy(index, 'severity', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
            >
              <option value="mild">Légère</option>
              <option value="moderate">Modérée</option>
              <option value="severe">Sévère</option>
            </select>
            <button
              onClick={() => removeAllergy(index)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        {allergies.length === 0 && (
          <p className="text-gray-500 text-sm">Aucune allergie déclarée</p>
        )}
      </div>
    </div>
  );

  const renderAddressesSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Adresses de livraison</h3>
        <button
          onClick={addDeliveryAddress}
          className="flex items-center space-x-1 px-3 py-1 bg-harvests-green text-white rounded-md hover:bg-harvests-green/90"
        >
          <FiPlus className="h-4 w-4" />
          <span>Ajouter une adresse</span>
        </button>
      </div>
      
      {deliveryAddresses.map((address, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-900">Adresse {index + 1}</h4>
            <button
              onClick={() => removeDeliveryAddress(index)}
              className="text-red-600 hover:bg-red-50 p-1 rounded"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Libellé</label>
              <input
                type="text"
                placeholder="ex: Domicile, Bureau..."
                value={address.label}
                onChange={(e) => updateDeliveryAddress(index, 'label', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rue/Adresse</label>
              <input
                type="text"
                value={address.street}
                onChange={(e) => updateDeliveryAddress(index, 'street', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input
                type="text"
                value={address.city}
                onChange={(e) => updateDeliveryAddress(index, 'city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
              <input
                type="text"
                value={address.region}
                onChange={(e) => updateDeliveryAddress(index, 'region', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructions de livraison</label>
              <textarea
                value={address.instructions}
                onChange={(e) => updateDeliveryAddress(index, 'instructions', e.target.value)}
                placeholder="Instructions spéciales pour le livreur..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={address.isDefault}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Décocher toutes les autres adresses par défaut
                      const newAddresses = deliveryAddresses.map((addr, i) => ({
                        ...addr,
                        isDefault: i === index
                      }));
                      setDeliveryAddresses(newAddresses);
                    } else {
                      updateDeliveryAddress(index, 'isDefault', false);
                    }
                  }}
                  className="rounded text-harvests-green focus:ring-harvests-green"
                />
                <span className="text-sm text-gray-700">Adresse par défaut</span>
              </label>
            </div>
          </div>
        </div>
      ))}
      
      {deliveryAddresses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FiMapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Aucune adresse de livraison configurée</p>
        </div>
      )}
    </div>
  );

  const renderShoppingSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Préférences d'achat</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Créneau de livraison préféré</label>
          <select
            value={shoppingPreferences.preferredDeliveryTime}
            onChange={(e) => setShoppingPreferences({
              ...shoppingPreferences,
              preferredDeliveryTime: e.target.value
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
          >
            {deliveryTimeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Distance maximale de livraison: {shoppingPreferences.maxDeliveryDistance} km
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={shoppingPreferences.maxDeliveryDistance}
            onChange={(e) => setShoppingPreferences({
              ...shoppingPreferences,
              maxDeliveryDistance: parseInt(e.target.value)
            })}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Budget minimum (XAF)</label>
          <input
            type="number"
            value={shoppingPreferences.budgetRange.min}
            onChange={(e) => setShoppingPreferences({
              ...shoppingPreferences,
              budgetRange: {
                ...shoppingPreferences.budgetRange,
                min: parseInt(e.target.value) || 0
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Budget maximum (XAF)</label>
          <input
            type="number"
            value={shoppingPreferences.budgetRange.max}
            onChange={(e) => setShoppingPreferences({
              ...shoppingPreferences,
              budgetRange: {
                ...shoppingPreferences.budgetRange,
                max: parseInt(e.target.value) || 100000
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Méthodes de paiement préférées</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {paymentMethodOptions.map(option => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={shoppingPreferences.preferredPaymentMethods.includes(option.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setShoppingPreferences({
                      ...shoppingPreferences,
                      preferredPaymentMethods: [...shoppingPreferences.preferredPaymentMethods, option.value]
                    });
                  } else {
                    setShoppingPreferences({
                      ...shoppingPreferences,
                      preferredPaymentMethods: shoppingPreferences.preferredPaymentMethods.filter(method => method !== option.value)
                    });
                  }
                }}
                className="rounded text-harvests-green focus:ring-harvests-green"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Préférences de notifications</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Notifications par email</h4>
            <p className="text-sm text-gray-600">Recevoir les confirmations de commande et promotions par email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-harvests-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-harvests-green"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Notifications SMS</h4>
            <p className="text-sm text-gray-600">Recevoir les alertes de livraison par SMS</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.sms}
              onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-harvests-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-harvests-green"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Notifications push</h4>
            <p className="text-sm text-gray-600">Recevoir les notifications sur votre navigateur</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.push}
              onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-harvests-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-harvests-green"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Sécurité du compte</h3>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FiAlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Changement de mot de passe</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Pour des raisons de sécurité, le changement de mot de passe sera bientôt disponible
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FiShield className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-800">Email vérifié</h4>
            <p className="text-sm text-green-700 mt-1">
              Votre adresse email a été vérifiée avec succès
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileSection();
      case 'dietary':
        return renderDietarySection();
      case 'addresses':
        return renderAddressesSection();
      case 'shopping':
        return renderShoppingSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'security':
        return renderSecuritySection();
      default:
        return renderProfileSection();
    }
  };

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600 mt-1">Configurez vos préférences et paramètres de compte</p>
        </div>

        
        {/* Message de feedback */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          {/* Navigation par onglets */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
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
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contenu de l'onglet actif */}
          <div className="p-6">
            {renderTabContent()}
          </div>

          {/* Bouton de sauvegarde */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-harvests-green text-white rounded-md hover:bg-harvests-green/90 disabled:opacity-50"
              >
                <FiSave className="h-4 w-4" />
                <span>{loading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default Settings;
