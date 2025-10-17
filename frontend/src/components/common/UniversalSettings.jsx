import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../contexts/NotificationContext';
import ModularDashboardLayout from '../layout/ModularDashboardLayout';
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

const UniversalSettings = ({ userType, service, settingsConfig }) => {
  const { user, updateProfile } = useAuth();
  const { showSuccess, showError } = useNotifications();
  
  const [activeTab, setActiveTab] = useState('farm');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({});

  // Charger les données utilisateur
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          setLoading(true);
          const getProfileMethod = service.getMyProfile || service.getProfile;
          const response = await getProfileMethod();
          const userData = response.data?.data?.[userType] || response.data?.[userType] || response.data?.data?.user || response.data?.user || {};
          
          // Initialiser les données de formulaire
          const initialData = {};
          settingsConfig.tabs.forEach(tab => {
            if (tab.fields) {
              tab.fields.forEach(field => {
                const value = getNestedValue(userData, field.name);
                setNestedValue(initialData, field.name, value || field.defaultValue || '');
              });
            }
          });
          
          setFormData(initialData);
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
          showError('Erreur lors du chargement des paramètres');
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserData();
  }, [user, service, userType, settingsConfig]);

  // Fonctions utilitaires pour les objets imbriqués
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const setNestedValue = (obj, path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  };

  // Gérer les changements d'input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const newData = { ...prev };
      setNestedValue(newData, name, fieldValue);
      return newData;
    });
  };

  // Gérer les changements pour les listes (cultures, équipements, etc.)
  const handleListChange = (listName, action, item = null, index = null) => {
    setFormData(prev => {
      const newData = { ...prev };
      const currentList = newData[listName] || [];
      
      switch (action) {
        case 'add':
          newData[listName] = [...currentList, { ...item, id: `temp_${Date.now()}` }];
          break;
        case 'edit':
          newData[listName] = currentList.map((listItem, i) => 
            i === index ? { ...listItem, ...item } : listItem
          );
          break;
        case 'remove':
          newData[listName] = currentList.filter((_, i) => i !== index);
          break;
        default:
          break;
      }
      
      return newData;
    });
  };

  // Sauvegarder les paramètres
  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Sauvegarder les données selon la configuration
      for (const tab of settingsConfig.tabs) {
        if (tab.saveMethod && formData[tab.id]) {
          await service[tab.saveMethod](formData[tab.id]);
        }
      }

      // Mettre à jour le contexte utilisateur
      await updateProfile();
      showSuccess('Paramètres sauvegardés avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showError('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setLoading(false);
    }
  };

  // Rendre un champ de formulaire
  const renderField = (field) => {
    const value = getNestedValue(formData, field.name) || '';
    
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            name={field.name}
            value={value}
            onChange={handleInputChange}
            rows={field.rows || 3}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
            placeholder={field.placeholder}
          />
        );

      case 'select':
        return (
          <select
            name={field.name}
            value={value}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
          >
            <option value="">Sélectionner...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name={field.name}
              checked={value}
              onChange={handleInputChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-harvests-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-harvests-green"></div>
          </label>
        );

      case 'number':
        return (
          <input
            type="number"
            name={field.name}
            value={value}
            onChange={handleInputChange}
            min={field.min}
            max={field.max}
            step={field.step}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
            placeholder={field.placeholder}
          />
        );

      default:
        return (
          <input
            type={field.type || 'text'}
            name={field.name}
            value={value}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
            placeholder={field.placeholder}
          />
        );
    }
  };

  // Rendre une liste (cultures, équipements, etc.)
  const renderList = (listConfig) => {
    const items = formData[listConfig.name] || [];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-gray-900">{listConfig.title}</h4>
          <button
            onClick={() => handleListChange(listConfig.name, 'add', listConfig.defaultItem)}
            className="flex items-center px-4 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600"
          >
            <FiPlus className="h-4 w-4 mr-2" />
            {listConfig.addButtonText}
          </button>
        </div>

        {items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, index) => (
              <div key={item.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                <div className="flex items-start justify-between mb-3">
                  <h5 className="font-medium text-gray-900 text-lg">
                    {item.name || item.type || 'Élément'}
                  </h5>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleListChange(listConfig.name, 'edit', item, index)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Modifier"
                    >
                      <FiEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleListChange(listConfig.name, 'remove', null, index)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Supprimer"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  {listConfig.displayFields?.map(field => (
                    <p key={field}>
                      <span className="font-medium text-gray-700">{field}:</span> {item[field] || 'Non défini'}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-harvests-green"></div>
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-20">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Paramètres {settingsConfig.title}</h1>
          <p className="text-gray-600 mt-1">{settingsConfig.description}</p>
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
              {settingsConfig.tabs.map((tab) => {
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
            {settingsConfig.tabs.map((tab) => (
              activeTab === tab.id && (
                <div key={tab.id} className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">{tab.title}</h3>
                  
                  {tab.listConfig ? (
                    renderList(tab.listConfig)
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {tab.fields?.map((field) => (
                        <div key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>
                          {renderField(field)}
                          {field.description && (
                            <p className="text-sm text-gray-500 mt-1">{field.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            ))}
          </div>

          {/* Bouton de sauvegarde */}
          <div className="px-6 py-4 bg-harvests-light border-t border-gray-200 flex justify-end">
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

export default UniversalSettings;
