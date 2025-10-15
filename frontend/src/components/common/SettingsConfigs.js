// Configuration des paramètres par type d'utilisateur
import {
  FiUser,
  FiMapPin,
  FiTruck,
  FiAward,
  FiPackage,
  FiDollarSign,
  FiBell,
  FiShield,
  FiCoffee,
  FiClock,
  FiGlobe
} from 'react-icons/fi';

export const producerSettingsConfig = {
  title: 'Producteur',
  description: 'Gérez vos informations de ferme et de production',
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
        },
        {
          name: 'farmSize.value',
          label: 'Taille de la ferme',
          type: 'number',
          min: 0
        },
        {
          name: 'farmSize.unit',
          label: 'Unité',
          type: 'select',
          options: [
            { value: 'hectares', label: 'Hectares' },
            { value: 'acres', label: 'Acres' },
            { value: 'm²', label: 'Mètres carrés' }
          ]
        },
        {
          name: 'storageCapacity.value',
          label: 'Capacité de stockage',
          type: 'number',
          min: 0
        },
        {
          name: 'storageCapacity.unit',
          label: 'Unité de stockage',
          type: 'select',
          options: [
            { value: 'tons', label: 'Tonnes' },
            { value: 'kg', label: 'Kilogrammes' },
            { value: 'm³', label: 'Mètres cubes' }
          ]
        }
      ]
    },
    {
      id: 'crops',
      label: 'Cultures',
      icon: FiPackage,
      title: 'Cultures cultivées',
      listConfig: {
        name: 'crops',
        title: 'Cultures cultivées',
        addButtonText: 'Ajouter une culture',
        defaultItem: {
          name: '',
          category: 'vegetables',
          plantingSeasons: [],
          harvestSeasons: [],
          estimatedYield: { value: 0, unit: 'kg' }
        },
        displayFields: ['category', 'plantingSeasons', 'harvestSeasons', 'estimatedYield']
      }
    },
    {
      id: 'equipment',
      label: 'Équipements',
      icon: FiAward,
      title: 'Équipements et infrastructure',
      listConfig: {
        name: 'equipment',
        title: 'Équipements et infrastructure',
        addButtonText: 'Ajouter un équipement',
        defaultItem: {
          type: 'other',
          description: '',
          capacity: ''
        },
        displayFields: ['description', 'capacity']
      }
    },
    {
      id: 'delivery',
      label: 'Livraison',
      icon: FiTruck,
      title: 'Options de livraison',
      fields: [
        {
          name: 'deliveryOptions.canDeliver',
          label: 'Proposer la livraison',
          type: 'checkbox',
          description: 'Proposez-vous des services de livraison ?'
        },
        {
          name: 'deliveryOptions.deliveryRadius',
          label: 'Rayon de livraison (km)',
          type: 'number',
          min: 0,
          conditional: 'deliveryOptions.canDeliver'
        },
        {
          name: 'deliveryOptions.deliveryFee',
          label: 'Frais de livraison (FCFA)',
          type: 'number',
          min: 0,
          conditional: 'deliveryOptions.canDeliver'
        }
      ]
    },
    {
      id: 'commercial',
      label: 'Commercial',
      icon: FiDollarSign,
      title: 'Informations commerciales',
      fields: [
        {
          name: 'minimumOrderQuantity.value',
          label: 'Quantité minimale de commande',
          type: 'number',
          min: 1
        },
        {
          name: 'minimumOrderQuantity.unit',
          label: 'Unité',
          type: 'text',
          placeholder: 'unité(s)'
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
          name: 'notifications.sms',
          label: 'Notifications SMS',
          type: 'checkbox',
          description: 'Recevoir des notifications par SMS'
        },
        {
          name: 'notifications.push',
          label: 'Notifications push',
          type: 'checkbox',
          description: 'Recevoir des notifications push dans le navigateur'
        }
      ]
    },
    {
      id: 'security',
      label: 'Sécurité',
      icon: FiShield,
      title: 'Sécurité du compte',
      fields: [
        {
          name: 'emailVerified',
          label: 'Email vérifié',
          type: 'display',
          description: 'Votre adresse email est vérifiée'
        },
        {
          name: 'twoFactorEnabled',
          label: 'Authentification à deux facteurs',
          type: 'display',
          description: 'Ajoutez une couche de sécurité supplémentaire'
        }
      ]
    }
  ]
};

export const transformerSettingsConfig = {
  title: 'Transformateur',
  description: 'Gérez vos informations d\'entreprise et de transformation',
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
        },
        {
          name: 'registrationNumber',
          label: 'Numéro d\'enregistrement',
          type: 'text'
        },
        {
          name: 'taxId',
          label: 'Identifiant fiscal',
          type: 'text'
        }
      ]
    },
    {
      id: 'transformation',
      label: 'Transformation',
      icon: FiPackage,
      title: 'Capacités de transformation',
      fields: [
        {
          name: 'processingCapacity.value',
          label: 'Capacité de transformation',
          type: 'number',
          min: 0
        },
        {
          name: 'processingCapacity.unit',
          label: 'Unité',
          type: 'select',
          options: [
            { value: 'tons', label: 'Tonnes' },
            { value: 'kg', label: 'Kilogrammes' },
            { value: 'liters', label: 'Litres' }
          ]
        },
        {
          name: 'specialties',
          label: 'Spécialités',
          type: 'textarea',
          placeholder: 'Décrivez vos spécialités de transformation...'
        }
      ]
    },
    {
      id: 'equipment',
      label: 'Équipements',
      icon: FiAward,
      title: 'Équipements de transformation',
      listConfig: {
        name: 'equipment',
        title: 'Équipements de transformation',
        addButtonText: 'Ajouter un équipement',
        defaultItem: {
          type: 'other',
          description: '',
          capacity: ''
        },
        displayFields: ['description', 'capacity']
      }
    },
    {
      id: 'delivery',
      label: 'Livraison',
      icon: FiTruck,
      title: 'Options de livraison',
      fields: [
        {
          name: 'deliveryOptions.canDeliver',
          label: 'Proposer la livraison',
          type: 'checkbox',
          description: 'Proposez-vous des services de livraison ?'
        },
        {
          name: 'deliveryOptions.deliveryRadius',
          label: 'Rayon de livraison (km)',
          type: 'number',
          min: 0,
          conditional: 'deliveryOptions.canDeliver'
        },
        {
          name: 'deliveryOptions.deliveryFee',
          label: 'Frais de livraison (FCFA)',
          type: 'number',
          min: 0,
          conditional: 'deliveryOptions.canDeliver'
        }
      ]
    },
    {
      id: 'commercial',
      label: 'Commercial',
      icon: FiDollarSign,
      title: 'Informations commerciales',
      fields: [
        {
          name: 'minimumOrderQuantity.value',
          label: 'Quantité minimale de commande',
          type: 'number',
          min: 1
        },
        {
          name: 'minimumOrderQuantity.unit',
          label: 'Unité',
          type: 'text',
          placeholder: 'unité(s)'
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
          name: 'notifications.sms',
          label: 'Notifications SMS',
          type: 'checkbox',
          description: 'Recevoir des notifications par SMS'
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
  description: 'Gérez vos informations de restaurant et de service',
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
        },
        {
          name: 'seatingCapacity',
          label: 'Capacité d\'accueil',
          type: 'number',
          min: 1
        },
        {
          name: 'cuisineTypes',
          label: 'Types de cuisine',
          type: 'multiselect',
          options: [
            { value: 'african', label: 'Africaine' },
            { value: 'french', label: 'Française' },
            { value: 'italian', label: 'Italienne' },
            { value: 'asian', label: 'Asiatique' },
            { value: 'american', label: 'Américaine' },
            { value: 'mediterranean', label: 'Méditerranéenne' }
          ]
        }
      ]
    },
    {
      id: 'hours',
      label: 'Horaires',
      icon: FiClock,
      title: 'Horaires d\'ouverture',
      fields: [
        {
          name: 'operatingHours.monday.isOpen',
          label: 'Lundi',
          type: 'checkbox'
        },
        {
          name: 'operatingHours.monday.open',
          label: 'Ouverture lundi',
          type: 'time',
          conditional: 'operatingHours.monday.isOpen'
        },
        {
          name: 'operatingHours.monday.close',
          label: 'Fermeture lundi',
          type: 'time',
          conditional: 'operatingHours.monday.isOpen'
        },
        // Répéter pour chaque jour de la semaine...
      ]
    },
    {
      id: 'services',
      label: 'Services',
      icon: FiAward,
      title: 'Services additionnels',
      fields: [
        {
          name: 'additionalServices.catering',
          label: 'Traiteur',
          type: 'checkbox',
          description: 'Proposez des services de traiteur'
        },
        {
          name: 'additionalServices.delivery',
          label: 'Livraison',
          type: 'checkbox',
          description: 'Proposez des services de livraison'
        },
        {
          name: 'additionalServices.events',
          label: 'Événements',
          type: 'checkbox',
          description: 'Organisez des événements'
        },
        {
          name: 'additionalServices.mealPlanning',
          label: 'Planification de repas',
          type: 'checkbox',
          description: 'Aidez à planifier les repas'
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
          name: 'notifications.sms',
          label: 'Notifications SMS',
          type: 'checkbox',
          description: 'Recevoir des notifications par SMS'
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
          name: 'dietaryPreferences',
          label: 'Préférences alimentaires',
          type: 'multiselect',
          options: [
            { value: 'vegetarian', label: 'Végétarien' },
            { value: 'vegan', label: 'Végan' },
            { value: 'halal', label: 'Halal' },
            { value: 'kosher', label: 'Casher' },
            { value: 'gluten-free', label: 'Sans gluten' }
          ]
        },
        {
          name: 'allergies',
          label: 'Allergies',
          type: 'multiselect',
          options: [
            { value: 'nuts', label: 'Noix' },
            { value: 'dairy', label: 'Lait' },
            { value: 'eggs', label: 'Œufs' },
            { value: 'shellfish', label: 'Crustacés' },
            { value: 'soy', label: 'Soja' }
          ]
        },
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
          name: 'notifications.sms',
          label: 'Notifications SMS',
          type: 'checkbox',
          description: 'Recevoir des notifications par SMS'
        },
        {
          name: 'notifications.push',
          label: 'Notifications push',
          type: 'checkbox',
          description: 'Recevoir des notifications push dans le navigateur'
        }
      ]
    },
    {
      id: 'security',
      label: 'Sécurité',
      icon: FiShield,
      title: 'Sécurité du compte',
      fields: [
        {
          name: 'emailVerified',
          label: 'Email vérifié',
          type: 'display',
          description: 'Votre adresse email est vérifiée'
        },
        {
          name: 'twoFactorEnabled',
          label: 'Authentification à deux facteurs',
          type: 'display',
          description: 'Ajoutez une couche de sécurité supplémentaire'
        }
      ]
    }
  ]
};
