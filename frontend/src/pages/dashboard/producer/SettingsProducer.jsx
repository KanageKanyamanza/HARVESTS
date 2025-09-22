import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { authService, producerService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import {
  FiUser,
  FiMapPin,
  FiTruck,
  FiAward,
  FiPackage,
  FiDollarSign,
  FiBell,
  FiSave,
  FiPlus,
  FiTrash2,
  FiEdit,
  FiGlobe,
  FiShield,
  FiAlertTriangle
} from 'react-icons/fi';

const SettingsProducer = () => {
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

  const [farmData, setFarmData] = useState({
    farmName: '',
    farmSize: { value: 0, unit: 'hectares' },
    farmingType: 'conventional',
    storageCapacity: { value: 0, unit: 'tons' }
  });

  const [crops, setCrops] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [editingCrop, setEditingCrop] = useState(null);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [showCropForm, setShowCropForm] = useState(false);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [deliveryOptions, setDeliveryOptions] = useState({
    canDeliver: false,
    deliveryRadius: 0,
    deliveryFee: 0
  });
  const [commercialData, setCommercialData] = useState({
    minimumOrderQuantity: { value: 1, unit: 'unité(s)' }
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

            // Données spécifiques producteur
            setFarmData({
              farmName: userData.farmName || '',
              farmSize: userData.farmSize || { value: 0, unit: 'hectares' },
              farmingType: userData.farmingType || 'conventional',
              storageCapacity: userData.storageCapacity || { value: 0, unit: 'tons' }
            });

            setCrops(userData.crops || []);
            setEquipment(userData.equipment || []);
            setDeliveryOptions(userData.deliveryOptions || {
              canDeliver: false,
              deliveryRadius: 0,
              deliveryFee: 0
            });
            setCommercialData({
              minimumOrderQuantity: userData.minimumOrderQuantity || { value: 1, unit: 'unité(s)' }
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
    { id: 'farm', label: 'Ferme', icon: FiMapPin },
    { id: 'crops', label: 'Cultures', icon: FiPackage },
    { id: 'equipment', label: 'Équipements', icon: FiAward },
    { id: 'delivery', label: 'Livraison', icon: FiTruck },
    { id: 'commercial', label: 'Commercial', icon: FiDollarSign },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'security', label: 'Sécurité', icon: FiShield }
  ];

  const farmingTypes = [
    { value: 'organic', label: 'Biologique' },
    { value: 'conventional', label: 'Conventionnel' },
    { value: 'mixed', label: 'Mixte' }
  ];

  const cropCategories = [
    { value: 'cereals', label: 'Céréales' },
    { value: 'vegetables', label: 'Légumes' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'legumes', label: 'Légumineuses' },
    { value: 'tubers', label: 'Tubercules' },
    { value: 'spices', label: 'Épices' },
    { value: 'herbs', label: 'Herbes' }
  ];

  const equipmentTypes = [
    { value: 'tractor', label: 'Tracteur' },
    { value: 'harvester', label: 'Moissonneuse' },
    { value: 'irrigation', label: 'Irrigation' },
    { value: 'greenhouse', label: 'Serre' },
    { value: 'storage', label: 'Stockage' },
    { value: 'other', label: 'Autre' }
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
      
      // Sauvegarder les données de ferme
      await producerService.updateProfile(farmData);
      
      // Sauvegarder les cultures (pour l'instant, on ne fait que des ajouts)
      for (const crop of crops) {
        // Supprimer l'ID temporaire avant l'envoi
        const cropData = { ...crop };
        delete cropData.id;
        delete cropData._id;
        
        // Pour l'instant, on ajoute toutes les cultures comme nouvelles
        // TODO: Implémenter la logique de mise à jour plus tard
        await producerService.addCrop(cropData);
      }
      
      // Sauvegarder les équipements (pour l'instant, on ne fait que des ajouts)
      for (const equip of equipment) {
        // Supprimer l'ID temporaire avant l'envoi
        const equipData = { ...equip };
        delete equipData.id;
        delete equipData._id;
        
        // Pour l'instant, on ajoute tous les équipements comme nouveaux
        // TODO: Implémenter la logique de mise à jour plus tard
        await producerService.addEquipment(equipData);
      }
      
      // Sauvegarder les options de livraison
      await producerService.updateDeliverySettings(deliveryOptions);

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

  const addCrop = () => {
    setEditingCrop({
      id: `temp_${Date.now()}`,
      name: '',
      category: 'vegetables',
      plantingSeasons: [],
      harvestSeasons: [],
      estimatedYield: { value: 0, unit: 'kg' }
    });
    setShowCropForm(true);
  };

  const editCrop = (crop) => {
    setEditingCrop(crop);
    setShowCropForm(true);
  };

  const saveCrop = () => {
    if (editingCrop) {
      if (editingCrop.id?.startsWith('temp_')) {
        // Nouvelle culture
        setCrops([...crops, editingCrop]);
      } else {
        // Modification d'une culture existante
        setCrops(crops.map(crop => 
          crop._id === editingCrop._id ? editingCrop : crop
        ));
      }
    }
    setEditingCrop(null);
    setShowCropForm(false);
  };

  const cancelCrop = () => {
    setEditingCrop(null);
    setShowCropForm(false);
  };

  const removeCrop = async (crop) => {
    if (crop._id) {
      // Supprimer du backend
      try {
        await producerService.removeCrop(crop._id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
    // Supprimer de la liste locale
    setCrops(crops.filter(c => c._id !== crop._id && c.id !== crop.id));
  };

  const addEquipment = () => {
    setEditingEquipment({
      id: `temp_${Date.now()}`,
      type: 'other',
      description: '',
      capacity: ''
    });
    setShowEquipmentForm(true);
  };

  const editEquipment = (equipment) => {
    setEditingEquipment(equipment);
    setShowEquipmentForm(true);
  };

  const saveEquipment = () => {
    if (editingEquipment) {
      if (editingEquipment.id?.startsWith('temp_')) {
        // Nouvel équipement
        setEquipment([...equipment, editingEquipment]);
      } else {
        // Modification d'un équipement existant
        setEquipment(equipment.map(equip => 
          equip._id === editingEquipment._id ? editingEquipment : equip
        ));
      }
    }
    setEditingEquipment(null);
    setShowEquipmentForm(false);
  };

  const cancelEquipment = () => {
    setEditingEquipment(null);
    setShowEquipmentForm(false);
  };

  const removeEquipment = async (equip) => {
    if (equip._id) {
      // Supprimer du backend
      try {
        await producerService.removeEquipment(equip._id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
    // Supprimer de la liste locale
    setEquipment(equipment.filter(e => e._id !== equip._id && e.id !== equip.id));
  };

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-20">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Paramètres Producteur</h1>
          <p className="text-gray-600 mt-1">Gérez vos informations de ferme et de production</p>
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

            {/* Onglet Ferme */}
            {activeTab === 'farm' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Informations de la ferme</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom de la ferme</label>
                    <input
                      type="text"
                      value={farmData.farmName}
                      onChange={(e) => setFarmData({...farmData, farmName: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type d'agriculture</label>
                    <select
                      value={farmData.farmingType}
                      onChange={(e) => setFarmData({...farmData, farmingType: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    >
                      {farmingTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Taille de la ferme</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={farmData.farmSize.value}
                        onChange={(e) => setFarmData({
                          ...farmData, 
                          farmSize: {...farmData.farmSize, value: parseInt(e.target.value)}
                        })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                      />
                      <select
                        value={farmData.farmSize.unit}
                        onChange={(e) => setFarmData({
                          ...farmData, 
                          farmSize: {...farmData.farmSize, unit: e.target.value}
                        })}
                        className="mt-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                      >
                        <option value="hectares">Hectares</option>
                        <option value="acres">Acres</option>
                        <option value="m²">Mètres carrés</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Capacité de stockage</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={farmData.storageCapacity.value}
                        onChange={(e) => setFarmData({
                          ...farmData, 
                          storageCapacity: {...farmData.storageCapacity, value: parseInt(e.target.value)}
                        })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                      />
                      <select
                        value={farmData.storageCapacity.unit}
                        onChange={(e) => setFarmData({
                          ...farmData, 
                          storageCapacity: {...farmData.storageCapacity, unit: e.target.value}
                        })}
                        className="mt-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                      >
                        <option value="tons">Tonnes</option>
                        <option value="kg">Kilogrammes</option>
                        <option value="m³">Mètres cubes</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Cultures */}
            {activeTab === 'crops' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Cultures cultivées</h3>
                  <button
                    onClick={addCrop}
                    className="flex items-center px-4 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600"
                  >
                    <FiPlus className="h-4 w-4 mr-2" />
                    Ajouter une culture
                  </button>
                </div>

                {/* Liste des cultures existantes sous forme de cartes */}
                {crops.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {crops.map((crop, index) => (
                      <div key={crop._id || crop.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-gray-900 text-lg">{crop.name || 'Culture sans nom'}</h4>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => editCrop(crop)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Modifier"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => removeCrop(crop)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Supprimer"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p><span className="font-medium text-gray-700">Catégorie:</span> {cropCategories.find(cat => cat.value === crop.category)?.label || crop.category}</p>
                          <p><span className="font-medium text-gray-700">Plantation:</span> {crop.plantingSeasons?.join(', ') || 'Non défini'}</p>
                          <p><span className="font-medium text-gray-700">Récolte:</span> {crop.harvestSeasons?.join(', ') || 'Non défini'}</p>
                          <p><span className="font-medium text-gray-700">Rendement:</span> {crop.estimatedYield?.value || 0} {crop.estimatedYield?.unit || 'kg'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulaire d'ajout/modification */}
                {showCropForm && editingCrop && (
                  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      {editingCrop.id?.startsWith('temp_') ? 'Ajouter une culture' : 'Modifier la culture'}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la culture</label>
                        <input
                          type="text"
                          value={editingCrop.name}
                          onChange={(e) => setEditingCrop({...editingCrop, name: e.target.value})}
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                          placeholder="Ex: Tomates, Carottes..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                        <select
                          value={editingCrop.category}
                          onChange={(e) => setEditingCrop({...editingCrop, category: e.target.value})}
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                        >
                          {cropCategories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Saisons de plantation</label>
                        <input
                          type="text"
                          value={editingCrop.plantingSeasons?.join(', ') || ''}
                          onChange={(e) => setEditingCrop({
                            ...editingCrop, 
                            plantingSeasons: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                          })}
                          placeholder="Printemps, Été"
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Saisons de récolte</label>
                        <input
                          type="text"
                          value={editingCrop.harvestSeasons?.join(', ') || ''}
                          onChange={(e) => setEditingCrop({
                            ...editingCrop, 
                            harvestSeasons: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                          })}
                          placeholder="Automne, Hiver"
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rendement estimé</label>
                        <div className="flex">
                          <input
                            type="number"
                            value={editingCrop.estimatedYield?.value || 0}
                            onChange={(e) => setEditingCrop({
                              ...editingCrop, 
                              estimatedYield: {
                                ...editingCrop.estimatedYield,
                                value: parseFloat(e.target.value) || 0
                              }
                            })}
                            className="flex-1 border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                          />
                          <select
                            value={editingCrop.estimatedYield?.unit || 'kg'}
                            onChange={(e) => setEditingCrop({
                              ...editingCrop, 
                              estimatedYield: {
                                ...editingCrop.estimatedYield,
                                unit: e.target.value
                              }
                            })}
                            className="border border-gray-300 rounded-r-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                          >
                            <option value="kg">kg</option>
                            <option value="tons">tonnes</option>
                            <option value="quintals">quintaux</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        onClick={cancelCrop}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={saveCrop}
                        className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-harvests-green hover:bg-green-600"
                      >
                        {editingCrop.id?.startsWith('temp_') ? 'Ajouter' : 'Modifier'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Onglet Équipements */}
            {activeTab === 'equipment' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Équipements et infrastructure</h3>
                  <button
                    onClick={addEquipment}
                    className="flex items-center px-4 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600"
                  >
                    <FiPlus className="h-4 w-4 mr-2" />
                    Ajouter un équipement
                  </button>
                </div>

                {/* Liste des équipements existants sous forme de cartes */}
                {equipment.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {equipment.map((equip, index) => (
                      <div key={equip._id || equip.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-gray-900 text-lg">
                            {equipmentTypes.find(type => type.value === equip.type)?.label || equip.type}
                          </h4>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => editEquipment(equip)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Modifier"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => removeEquipment(equip)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Supprimer"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p><span className="font-medium text-gray-700">Description:</span> {equip.description || 'Non définie'}</p>
                          <p><span className="font-medium text-gray-700">Capacité:</span> {equip.capacity || 'Non définie'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulaire d'ajout/modification */}
                {showEquipmentForm && editingEquipment && (
                  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      {editingEquipment.id?.startsWith('temp_') ? 'Ajouter un équipement' : 'Modifier l\'équipement'}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type d'équipement</label>
                        <select
                          value={editingEquipment.type}
                          onChange={(e) => setEditingEquipment({...editingEquipment, type: e.target.value})}
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                        >
                          {equipmentTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacité</label>
                        <input
                          type="text"
                          value={editingEquipment.capacity}
                          onChange={(e) => setEditingEquipment({...editingEquipment, capacity: e.target.value})}
                          placeholder="Ex: 50 tonnes, 1000L..."
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={editingEquipment.description}
                          onChange={(e) => setEditingEquipment({...editingEquipment, description: e.target.value})}
                          placeholder="Décrivez l'équipement, son état, ses caractéristiques..."
                          rows={3}
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        onClick={cancelEquipment}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={saveEquipment}
                        className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-harvests-green hover:bg-green-600"
                      >
                        {editingEquipment.id?.startsWith('temp_') ? 'Ajouter' : 'Modifier'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Onglet Livraison */}
            {activeTab === 'delivery' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Options de livraison</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Proposer la livraison</label>
                      <p className="text-sm text-gray-500">Proposez-vous des services de livraison ?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={deliveryOptions.canDeliver}
                        onChange={(e) => setDeliveryOptions({...deliveryOptions, canDeliver: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-harvests-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-harvests-green"></div>
                    </label>
                  </div>
                  {deliveryOptions.canDeliver && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Rayon de livraison (km)</label>
                        <input
                          type="number"
                          value={deliveryOptions.deliveryRadius}
                          onChange={(e) => setDeliveryOptions({...deliveryOptions, deliveryRadius: parseInt(e.target.value)})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Frais de livraison (FCFA)</label>
                        <input
                          type="number"
                          value={deliveryOptions.deliveryFee}
                          onChange={(e) => setDeliveryOptions({...deliveryOptions, deliveryFee: parseInt(e.target.value)})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Onglet Commercial */}
            {activeTab === 'commercial' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Informations commerciales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantité minimale de commande</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={commercialData.minimumOrderQuantity.value}
                        onChange={(e) => setCommercialData({
                          ...commercialData,
                          minimumOrderQuantity: {
                            ...commercialData.minimumOrderQuantity,
                            value: parseInt(e.target.value)
                          }
                        })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                      />
                      <input
                        type="text"
                        value={commercialData.minimumOrderQuantity.unit}
                        onChange={(e) => setCommercialData({
                          ...commercialData,
                          minimumOrderQuantity: {
                            ...commercialData.minimumOrderQuantity,
                            unit: e.target.value
                          }
                        })}
                        className="mt-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                      />
                    </div>
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

export default SettingsProducer;
