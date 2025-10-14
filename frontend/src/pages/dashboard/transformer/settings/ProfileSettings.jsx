import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { transformerService } from '../../../../services';
import { useNotifications } from '../../../../contexts/NotificationContext';
import ModularDashboardLayout from '../../../../components/layout/ModularDashboardLayout';
import {
  FiSave,
  FiUpload,
  FiUser,
  FiHome,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiEdit,
  FiCamera
} from 'react-icons/fi';

const ProfileSettings = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    // Informations personnelles
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Informations entreprise
    companyName: '',
    companyRegistrationNumber: '',
    transformationType: 'processing',
    
    // Adresse
    address: {
      street: '',
      city: '',
      region: '',
      country: 'Sénégal',
      postalCode: ''
    },
    
    // Contact
    website: '',
    description: ''
  });

  const transformationTypes = [
    { value: 'processing', label: 'Transformation' },
    { value: 'packaging', label: 'Emballage' },
    { value: 'preservation', label: 'Conservation' },
    { value: 'manufacturing', label: 'Fabrication' },
    { value: 'mixed', label: 'Mixte' }
  ];


  // Charger le profil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await transformerService.getMyProfile();
        if (response.data?.data?.transformer) {
          const transformerData = response.data.data.transformer;
          setProfile(prev => ({
            ...prev,
            ...transformerData,
            address: transformerData.address || prev.address
          }));
        } else {
          // Utiliser les données de l'utilisateur connecté
          setProfile(prev => ({
            ...prev,
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            phone: user?.phone || '',
            companyName: user?.companyName || '',
            transformationType: user?.transformationType || 'processing'
          }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        // Utiliser les données de l'utilisateur connecté en cas d'erreur
        setProfile(prev => ({
          ...prev,
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          phone: user?.phone || '',
          companyName: user?.companyName || '',
          transformationType: user?.transformationType || 'processing'
        }));
      }
    };

    loadProfile();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    console.log('Changement d\'adresse:', name, value);
    setProfile(prev => {
      const newProfile = {
        ...prev,
        address: {
          ...prev.address,
          [name]: value
        }
      };
      console.log('Nouveau profil après changement d\'adresse:', newProfile);
      return newProfile;
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Données envoyées au backend:', profile);
      const response = await transformerService.updateMyProfile(profile);
      console.log('Réponse du backend:', response.data);
      // Afficher un toast de succès
      showSuccess('Profil mis à jour avec succès !', 'Succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      showError('Erreur lors de la mise à jour du profil', 'Erreur');
    } finally {
      setLoading(false);
    }
  };


  return (
    <ModularDashboardLayout userType="transformer">
      <div className="space-y-6 px-4 pb-20 pt-4">
        {/* En-tête */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil Entreprise</h1>
          <p className="text-gray-600 mt-1">Gérez les informations de votre entreprise</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informations Personnelles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Informations entreprise */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informations Entreprise</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'entreprise *
                </label>
                <div className="relative">
                  <FiHome className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="companyName"
                    value={profile.companyName}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro d'enregistrement
                </label>
                <input
                  type="text"
                  name="companyRegistrationNumber"
                  value={profile.companyRegistrationNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de transformation *
                </label>
                <select
                  name="transformationType"
                  value={profile.transformationType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {transformationTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site web
                </label>
                <div className="relative">
                  <FiGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    name="website"
                    value={profile.website}
                    onChange={handleInputChange}
                    placeholder="https://www.example.com"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description de l'entreprise
              </label>
              <textarea
                name="description"
                value={profile.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Décrivez votre entreprise, vos spécialités, vos valeurs..."
              />
            </div>
          </div>

          {/* Adresse */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Adresse</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rue
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="street"
                    value={profile.address.street}
                    onChange={handleAddressChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  name="city"
                  value={profile.address.city}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Région
                </label>
                <input
                  type="text"
                  name="region"
                  value={profile.address.region}
                  onChange={handleAddressChange}
                  placeholder="Saisissez votre région"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={profile.address.postalCode}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays
                </label>
                <input
                  type="text"
                  name="country"
                  value={profile.address.country}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>


          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
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
        </form>
      </div>
    </ModularDashboardLayout>
  );
};

export default ProfileSettings;
