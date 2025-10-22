import React, { useState, useEffect } from 'react';
import { FiBell, FiSave, FiX, FiMail, FiSmartphone, FiMonitor } from 'react-icons/fi';
import { commonService } from '../../services';
import { useNotifications } from '../../contexts/NotificationContext';

// Composant pour gérer les préférences de notification communes
const NotificationSettings = ({ onUpdate, loading = false }) => {
  const { showSuccess, showError } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
    orderUpdates: true,
    priceAlerts: false
  });

  // Charger les préférences de notification
  useEffect(() => {
    const loadNotificationPreferences = async () => {
      try {
        const response = await commonService.getNotificationPreferences();
        setNotifications(response.data?.notifications || notifications);
      } catch (error) {
        console.error('Erreur lors du chargement des préférences:', error);
      }
    };

    loadNotificationPreferences();
  }, []);

  const handleToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await commonService.updateNotificationPreferences(notifications);
      showSuccess('Préférences de notification mises à jour avec succès');
      setIsEditing(false);
      onUpdate && onUpdate();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      showError('Erreur lors de la mise à jour des préférences');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Recharger les préférences depuis le serveur
    commonService.getNotificationPreferences()
      .then(response => {
        setNotifications(response.data?.notifications || notifications);
      })
      .catch(error => {
        console.error('Erreur lors du rechargement:', error);
      });
  };

  const notificationOptions = [
    {
      key: 'email',
      label: 'Notifications par email',
      description: 'Recevoir des notifications importantes par email',
      icon: FiMail,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      key: 'sms',
      label: 'Notifications SMS',
      description: 'Recevoir des notifications urgentes par SMS',
      icon: FiSmartphone,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      key: 'push',
      label: 'Notifications push',
      description: 'Recevoir des notifications dans le navigateur',
      icon: FiMonitor,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      key: 'orderUpdates',
      label: 'Mises à jour de commande',
      description: 'Notifications sur le statut de vos commandes',
      icon: FiBell,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      key: 'priceAlerts',
      label: 'Alertes de prix',
      description: 'Notifications quand les prix de vos produits favoris changent',
      icon: FiBell,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      key: 'marketing',
      label: 'Communications marketing',
      description: 'Recevoir des offres spéciales et des nouveautés',
      icon: FiBell,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50'
    }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FiBell className="mr-2" />
          Préférences de notification
        </h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-3 py-2 text-sm text-harvests-green hover:text-green-600 transition-colors"
          >
            <FiBell className="mr-1" />
            Modifier
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-3 py-2 text-sm text-white bg-harvests-green hover:bg-green-600 rounded-md transition-colors disabled:opacity-50"
            >
              <FiSave className="mr-1" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FiX className="mr-1" />
              Annuler
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {notificationOptions.map((option) => {
          const Icon = option.icon;
          const isEnabled = notifications[option.key];
          
          return (
            <div
              key={option.key}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                isEnabled
                  ? 'border-harvests-green bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${option.bgColor}`}>
                  <Icon className={`h-5 w-5 ${option.color}`} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{option.label}</h4>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>
              
              {isEditing ? (
                <button
                  onClick={() => handleToggle(option.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isEnabled ? 'bg-harvests-green' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              ) : (
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isEnabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {isEnabled ? 'Activé' : 'Désactivé'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isEditing && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note :</strong> Vous pouvez modifier ces préférences à tout moment. 
            Certaines notifications importantes (comme les mises à jour de sécurité) 
            ne peuvent pas être désactivées.
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
