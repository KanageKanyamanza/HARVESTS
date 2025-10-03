import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { transformerService } from '../../../../services';
import ModularDashboardLayout from '../../../../components/layout/ModularDashboardLayout';
import {
  FiSave,
  FiUpload,
  FiEye,
  FiEdit,
  FiSettings,
  FiGlobe,
  FiMail,
  FiPhone,
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiClock,
  FiToggleLeft,
  FiToggleRight,
  FiAlertCircle,
  FiCheckCircle,
  FiImage,
  FiCamera
} from 'react-icons/fi';

const ShopManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [shopInfo, setShopInfo] = useState({
    isShopActive: false,
    shopName: '',
    shopDescription: '',
    shopBanner: '',
    shopLogo: '',
    openingHours: {
      monday: { open: '08:00', close: '18:00', isOpen: true },
      tuesday: { open: '08:00', close: '18:00', isOpen: true },
      wednesday: { open: '08:00', close: '18:00', isOpen: true },
      thursday: { open: '08:00', close: '18:00', isOpen: true },
      friday: { open: '08:00', close: '18:00', isOpen: true },
      saturday: { open: '08:00', close: '16:00', isOpen: true },
      sunday: { open: '', close: '', isOpen: false }
    },
    contactInfo: {
      phone: '',
      email: '',
      website: '',
      socialMedia: {
        facebook: '',
        instagram: '',
        twitter: ''
      }
    }
  });

  // Charger les informations de boutique
  useEffect(() => {
    const loadShopInfo = async () => {
      try {
        setLoading(true);
        const response = await transformerService.getMyShopInfo();
        if (response.data.status === 'success') {
          const data = response.data.data.shopInfo;
          setShopInfo(prev => ({
            ...prev,
            isShopActive: data.isShopActive || false,
            shopName: data.shopName || '',
            shopDescription: data.shopDescription || '',
            shopBanner: data.shopBanner || '',
            shopLogo: data.shopLogo || '',
            openingHours: data.openingHours || prev.openingHours,
            contactInfo: {
              phone: data.contactInfo?.phone || '',
              email: data.contactInfo?.email || '',
              website: data.contactInfo?.website || '',
              socialMedia: {
                facebook: data.contactInfo?.socialMedia?.facebook || '',
                instagram: data.contactInfo?.socialMedia?.instagram || '',
                twitter: data.contactInfo?.socialMedia?.twitter || ''
              }
            }
          }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des informations de boutique:', error);
      } finally {
        setLoading(false);
      }
    };

    loadShopInfo();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShopInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setShopInfo(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [name]: value
      }
    }));
  };

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setShopInfo(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        socialMedia: {
          ...prev.contactInfo.socialMedia,
          [name]: value
        }
      }
    }));
  };

  const handleOpeningHoursChange = (day, field, value) => {
    setShopInfo(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleToggleShop = async () => {
    try {
      setSaving(true);
      if (shopInfo.isShopActive) {
        await transformerService.deactivateShop();
      } else {
        await transformerService.activateShop();
      }
      setShopInfo(prev => ({
        ...prev,
        isShopActive: !prev.isShopActive
      }));
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMessage('');
      await transformerService.updateMyShopInfo(shopInfo);
      setSaveMessage('Boutique mise à jour avec succès !');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSaveMessage('Erreur lors de la sauvegarde');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file, type) => {
    try {
      setSaving(true);
      setSaveMessage('');
      
      // Créer un aperçu immédiat
      const reader = new FileReader();
      reader.onload = (e) => {
        setShopInfo(prev => ({
          ...prev,
          [type === 'banner' ? 'shopBanner' : 'shopLogo']: e.target.result
        }));
      };
      reader.readAsDataURL(file);
      
      const formData = new FormData();
      formData.append('image', file);
      
      const response = type === 'banner' 
        ? await transformerService.uploadShopBanner(formData)
        : await transformerService.uploadShopLogo(formData);
      
      if (response.data.status === 'success') {
        // Mettre à jour avec l'URL Cloudinary réelle
        setShopInfo(prev => ({
          ...prev,
          [type === 'banner' ? 'shopBanner' : 'shopLogo']: response.data.data.url
        }));
        
        setSaveMessage(`${type === 'banner' ? 'Bannière' : 'Logo'} uploadé avec succès !`);
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setSaveMessage(`Erreur lors de l'upload du ${type === 'banner' ? 'bannière' : 'logo'}`);
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const getDayLabel = (day) => {
    const days = {
      'monday': 'Lundi',
      'tuesday': 'Mardi',
      'wednesday': 'Mercredi',
      'thursday': 'Jeudi',
      'friday': 'Vendredi',
      'saturday': 'Samedi',
      'sunday': 'Dimanche'
    };
    return days[day] || day;
  };

  if (loading) {
    return (
      <ModularDashboardLayout userType="transformer">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout userType="transformer">
      <div className="space-y-6 px-4 pb-20 pt-4">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion de Boutique</h1>
            <p className="text-gray-600 mt-1">Configurez votre boutique publique</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Statut de la boutique */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Boutique</span>
              <button
                onClick={handleToggleShop}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  shopInfo.isShopActive ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    shopInfo.isShopActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${
                shopInfo.isShopActive ? 'text-green-600' : 'text-gray-500'
              }`}>
                {shopInfo.isShopActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            {/* Bouton aperçu */}
            <a
              href={`/transformers/${user?._id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiEye className="h-4 w-4 mr-2" />
              Aperçu
            </a>
          </div>
        </div>

        {/* Message de succès */}
        {saveMessage && (
          <div className={`rounded-lg p-4 ${
            saveMessage.includes('succès') 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              {saveMessage.includes('succès') ? (
                <FiCheckCircle className="h-5 w-5 text-green-600 mr-3" />
              ) : (
                <FiAlertCircle className="h-5 w-5 text-red-600 mr-3" />
              )}
              <p className={`text-sm font-medium ${
                saveMessage.includes('succès') ? 'text-green-800' : 'text-red-800'
              }`}>
                {saveMessage}
              </p>
            </div>
          </div>
        )}

        {/* Alerte si boutique inactive */}
        {!shopInfo.isShopActive && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <FiAlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Boutique inactive</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Votre boutique n'est pas visible publiquement. Activez-la pour que les clients puissent la voir.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          {/* Informations de base */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informations de base</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la boutique *
                </label>
                <input
                  type="text"
                  name="shopName"
                  value={shopInfo.shopName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Transformation Bio Sénégal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="shopDescription"
                  value={shopInfo.shopDescription}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Décrivez votre entreprise de transformation..."
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bannière */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bannière de boutique
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {shopInfo.shopBanner ? (
                    <div className="relative">
                      <img
                        src={shopInfo.shopBanner}
                        alt="Bannière"
                        className="w-full h-32 object-cover rounded-md"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="hidden text-center">
                        <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Erreur de chargement de l'image</p>
                        <p className="text-xs text-gray-500 break-all">{shopInfo.shopBanner}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShopInfo(prev => ({ ...prev, shopBanner: '' }))}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        title="Supprimer la bannière"
                      >
                        <FiEdit className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Aucune bannière</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], 'banner')}
                        className="mt-2"
                        disabled={saving}
                      />
                      {saving && (
                        <p className="mt-2 text-sm text-purple-600">Upload en cours...</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo de boutique
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {shopInfo.shopLogo ? (
                    <div className="relative flex justify-center">
                      <img
                        src={shopInfo.shopLogo}
                        alt="Logo"
                        className="w-24 h-24 object-cover rounded-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="hidden text-center">
                        <FiCamera className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Erreur de chargement du logo</p>
                        <p className="text-xs text-gray-500 break-all">{shopInfo.shopLogo}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShopInfo(prev => ({ ...prev, shopLogo: '' }))}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        title="Supprimer le logo"
                      >
                        <FiEdit className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <FiCamera className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Aucun logo</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], 'logo')}
                        className="mt-2"
                        disabled={saving}
                      />
                      {saving && (
                        <p className="mt-2 text-sm text-purple-600">Upload en cours...</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Horaires d'ouverture */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Horaires d'ouverture</h2>
            <div className="space-y-3">
              {Object.entries(shopInfo.openingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center space-x-4">
                  <div className="w-24">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={hours.isOpen}
                        onChange={(e) => handleOpeningHoursChange(day, 'isOpen', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">{getDayLabel(day)}</span>
                    </label>
                  </div>
                  {hours.isOpen && (
                    <>
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Informations de contact */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informations de contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiPhone className="inline mr-1" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={shopInfo.contactInfo.phone}
                  onChange={handleContactChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="+221 XX XXX XX XX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMail className="inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={shopInfo.contactInfo.email}
                  onChange={handleContactChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="contact@votre-entreprise.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiGlobe className="inline mr-1" />
                  Site web
                </label>
                <input
                  type="url"
                  name="website"
                  value={shopInfo.contactInfo.website}
                  onChange={handleContactChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://www.votre-entreprise.com"
                />
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">Réseaux sociaux</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiFacebook className="inline mr-1 text-blue-600" />
                    Facebook
                  </label>
                  <input
                    type="url"
                    name="facebook"
                    value={shopInfo.contactInfo.socialMedia.facebook}
                    onChange={handleSocialMediaChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://facebook.com/votre-page"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiInstagram className="inline mr-1 text-pink-600" />
                    Instagram
                  </label>
                  <input
                    type="url"
                    name="instagram"
                    value={shopInfo.contactInfo.socialMedia.instagram}
                    onChange={handleSocialMediaChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://instagram.com/votre-compte"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiTwitter className="inline mr-1 text-blue-400" />
                    Twitter
                  </label>
                  <input
                    type="url"
                    name="twitter"
                    value={shopInfo.contactInfo.socialMedia.twitter}
                    onChange={handleSocialMediaChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://twitter.com/votre-compte"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? (
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

export default ShopManagement;
