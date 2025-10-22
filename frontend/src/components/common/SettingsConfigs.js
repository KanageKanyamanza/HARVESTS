// Configuration des paramètres par type d'utilisateur
import {
  FiUser,
  FiMapPin,
  FiBell,
  FiCoffee,
  FiGlobe
} from 'react-icons/fi';

export const producerSettingsConfig = {
  title: 'Producteur',
  description: 'Gérez vos informations de base',
  tabs: [
    {
      id: 'farm',
      label: 'Ferme',
      icon: FiMapPin,
      title: 'Informations de la ferme',
      fields: [
        {
          name: 'farmName',
          label: 'Nom de la ferme',
          type: 'text',
          required: true
        },
        {
          name: 'farmingType',
          label: 'Type d\'agriculture',
          type: 'select',
          options: [
            { value: 'organic', label: 'Biologique' },
            { value: 'conventional', label: 'Conventionnel' },
            { value: 'mixed', label: 'Mixte' }
          ]
        }
      ]
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: FiBell,
      title: 'Préférences de notification',
      fields: [
        {
          name: 'notifications.email',
          label: 'Notifications par email',
          type: 'checkbox',
          description: 'Recevoir des notifications par email'
        },
        {
          name: 'notifications.push',
          label: 'Notifications push',
          type: 'checkbox',
          description: 'Recevoir des notifications push dans le navigateur'
        }
      ]
    }
  ]
};

export const transformerSettingsConfig = {
  title: 'Transformateur',
  description: 'Gérez vos informations d\'entreprise',
  tabs: [
    {
      id: 'company',
      label: 'Entreprise',
      icon: FiGlobe,
      title: 'Informations de l\'entreprise',
      fields: [
        {
          name: 'companyName',
          label: 'Nom de l\'entreprise',
          type: 'text',
          required: true
        },
        {
          name: 'businessType',
          label: 'Type d\'entreprise',
          type: 'select',
          options: [
            { value: 'cooperative', label: 'Coopérative' },
            { value: 'private', label: 'Privée' },
            { value: 'public', label: 'Publique' },
            { value: 'ngo', label: 'ONG' }
          ]
        }
      ]
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: FiBell,
      title: 'Préférences de notification',
      fields: [
        {
          name: 'notifications.email',
          label: 'Notifications par email',
          type: 'checkbox',
          description: 'Recevoir des notifications par email'
        },
        {
          name: 'notifications.push',
          label: 'Notifications push',
          type: 'checkbox',
          description: 'Recevoir des notifications push dans le navigateur'
        }
      ]
    }
  ]
};

export const restaurateurSettingsConfig = {
  title: 'Restaurateur',
  description: 'Gérez vos informations de restaurant',
  tabs: [
    {
      id: 'restaurant',
      label: 'Restaurant',
      icon: FiCoffee,
      title: 'Informations du restaurant',
      fields: [
        {
          name: 'restaurantName',
          label: 'Nom du restaurant',
          type: 'text',
          required: true
        },
        {
          name: 'restaurantType',
          label: 'Type de restaurant',
          type: 'select',
          options: [
            { value: 'fine-dining', label: 'Gastronomique' },
            { value: 'casual', label: 'Décontracté' },
            { value: 'fast-food', label: 'Restauration rapide' },
            { value: 'cafe', label: 'Café' },
            { value: 'bar', label: 'Bar' },
            { value: 'catering', label: 'Traiteur' }
          ]
        }
      ]
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: FiBell,
      title: 'Préférences de notification',
      fields: [
        {
          name: 'notifications.email',
          label: 'Notifications par email',
          type: 'checkbox',
          description: 'Recevoir des notifications par email'
        },
        {
          name: 'notifications.push',
          label: 'Notifications push',
          type: 'checkbox',
          description: 'Recevoir des notifications push dans le navigateur'
        }
      ]
    }
  ]
};

export const consumerSettingsConfig = {
  title: 'Consommateur',
  description: 'Gérez vos préférences et paramètres',
  tabs: [
    {
      id: 'preferences',
      label: 'Préférences',
      icon: FiUser,
      title: 'Préférences alimentaires',
      fields: [
        {
          name: 'preferredLanguage',
          label: 'Langue préférée',
          type: 'select',
          options: [
            { value: 'fr', label: 'Français' },
            { value: 'en', label: 'English' }
          ]
        }
      ]
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: FiBell,
      title: 'Préférences de notification',
      fields: [
        {
          name: 'notifications.email',
          label: 'Notifications par email',
          type: 'checkbox',
          description: 'Recevoir des notifications par email'
        },
        {
          name: 'notifications.push',
          label: 'Notifications push',
          type: 'checkbox',
          description: 'Recevoir des notifications push dans le navigateur'
        }
      ]
    }
  ]
};
