// Configuration des champs de profil par type d'utilisateur
import {
  GeneralContent,
  CertificationsContent,
  RestaurantContent,
  HoursContent,
  CompanyContent,
  TransformationContent,
  PreferencesContent,
  NotificationsContent
} from './ProfileTabContent';

export const producerProfileConfig = {
  userType: 'producer',
  service: 'producerService',
  tabs: [
    {
      id: 'general',
      label: 'Général',
      content: GeneralContent
    },
    {
      id: 'certifications',
      label: 'Certifications',
      content: CertificationsContent
    }
  ],
  fields: {
    general: [
      { name: 'firstName', label: 'Prénom', type: 'text', required: true },
      { name: 'lastName', label: 'Nom', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true, disabled: true },
      { name: 'phone', label: 'Téléphone', type: 'tel', required: true },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
      { name: 'address.street', label: 'Adresse', type: 'text' },
      { name: 'address.city', label: 'Ville', type: 'text', required: true },
      { name: 'address.region', label: 'Région', type: 'text', required: true },
      { name: 'address.country', label: 'Pays', type: 'select', options: [
        { value: 'SN', label: 'Sénégal' },
        { value: 'CM', label: 'Cameroun' },
        { value: 'CI', label: 'Côte d\'Ivoire' },
        { value: 'GH', label: 'Ghana' },
        { value: 'NG', label: 'Nigeria' },
        { value: 'KE', label: 'Kenya' }
      ]},
      { name: 'address.postalCode', label: 'Code postal', type: 'text' }
    ]
  }
};

export const transformerProfileConfig = {
  userType: 'transformer',
  service: 'transformerService',
  tabs: [
    {
      id: 'general',
      label: 'Général',
      content: GeneralContent
    },
    {
      id: 'company',
      label: 'Entreprise',
      content: CompanyContent
    },
    {
      id: 'transformation',
      label: 'Transformation',
      content: TransformationContent
    },
    {
      id: 'certifications',
      label: 'Certifications',
      content: CertificationsContent
    }
  ],
  fields: {
    general: [
      { name: 'firstName', label: 'Prénom', type: 'text', required: true },
      { name: 'lastName', label: 'Nom', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true, disabled: true },
      { name: 'phone', label: 'Téléphone', type: 'tel', required: true },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
      { name: 'address.street', label: 'Adresse', type: 'text' },
      { name: 'address.city', label: 'Ville', type: 'text', required: true },
      { name: 'address.region', label: 'Région', type: 'text', required: true },
      { name: 'address.country', label: 'Pays', type: 'select', options: [
        { value: 'SN', label: 'Sénégal' },
        { value: 'CM', label: 'Cameroun' },
        { value: 'CI', label: 'Côte d\'Ivoire' },
        { value: 'GH', label: 'Ghana' },
        { value: 'NG', label: 'Nigeria' },
        { value: 'KE', label: 'Kenya' }
      ]},
      { name: 'address.postalCode', label: 'Code postal', type: 'text' }
    ],
    company: [
      { name: 'companyName', label: 'Nom de l\'entreprise', type: 'text', required: true },
      { name: 'companyRegistrationNumber', label: 'Numéro d\'enregistrement', type: 'text' },
      { name: 'website', label: 'Site web', type: 'url' },
      { name: 'foundedYear', label: 'Année de création', type: 'number' },
      { name: 'employeeCount', label: 'Nombre d\'employés', type: 'number' }
    ],
    transformation: [
      { name: 'transformationType', label: 'Type de transformation', type: 'select', options: [
        { value: 'processing', label: 'Transformation' },
        { value: 'packaging', label: 'Emballage' },
        { value: 'preservation', label: 'Conservation' },
        { value: 'milling', label: 'Mouture' },
        { value: 'drying', label: 'Séchage' }
      ]},
      { name: 'specialties', label: 'Spécialités', type: 'multiselect', options: [
        { value: 'cereals', label: 'Céréales' },
        { value: 'vegetables', label: 'Légumes' },
        { value: 'fruits', label: 'Fruits' },
        { value: 'spices', label: 'Épices' },
        { value: 'herbs', label: 'Herbes' }
      ]},
      { name: 'capacity', label: 'Capacité de transformation (kg/jour)', type: 'number' }
    ]
  }
};

export const consumerProfileConfig = {
  userType: 'consumer',
  service: 'authService',
  tabs: [
    {
      id: 'general',
      label: 'Général',
      content: GeneralContent
    },
    {
      id: 'preferences',
      label: 'Préférences',
      content: PreferencesContent
    },
    {
      id: 'notifications',
      label: 'Notifications',
      content: NotificationsContent
    }
  ],
  fields: {
    general: [
      { name: 'firstName', label: 'Prénom', type: 'text', required: true },
      { name: 'lastName', label: 'Nom', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true, disabled: true },
      { name: 'phone', label: 'Téléphone', type: 'tel' },
      { name: 'dateOfBirth', label: 'Date de naissance', type: 'date' },
      { name: 'address.street', label: 'Adresse', type: 'text' },
      { name: 'address.city', label: 'Ville', type: 'text', required: true },
      { name: 'address.region', label: 'Région', type: 'text', required: true },
      { name: 'address.country', label: 'Pays', type: 'select', options: [
        { value: 'SN', label: 'Sénégal' },
        { value: 'CM', label: 'Cameroun' },
        { value: 'CI', label: 'Côte d\'Ivoire' },
        { value: 'GH', label: 'Ghana' },
        { value: 'NG', label: 'Nigeria' },
        { value: 'KE', label: 'Kenya' }
      ]},
      { name: 'address.postalCode', label: 'Code postal', type: 'text' }
    ],
    preferences: [
      { name: 'dietaryPreferences', label: 'Préférences alimentaires', type: 'multiselect', options: [
        { value: 'vegetarian', label: 'Végétarien' },
        { value: 'vegan', label: 'Végan' },
        { value: 'halal', label: 'Halal' },
        { value: 'kosher', label: 'Casher' },
        { value: 'gluten-free', label: 'Sans gluten' }
      ]},
      { name: 'allergies', label: 'Allergies', type: 'multiselect', options: [
        { value: 'nuts', label: 'Noix' },
        { value: 'dairy', label: 'Lait' },
        { value: 'eggs', label: 'Œufs' },
        { value: 'shellfish', label: 'Crustacés' },
        { value: 'soy', label: 'Soja' }
      ]},
      { name: 'preferredLanguage', label: 'Langue préférée', type: 'select', options: [
        { value: 'fr', label: 'Français' },
        { value: 'en', label: 'English' }
      ]}
    ]
  }
};

export const restaurateurProfileConfig = {
  userType: 'restaurateur',
  service: 'restaurateurService',
  tabs: [
    {
      id: 'general',
      label: 'Général',
      content: GeneralContent
    },
    {
      id: 'restaurant',
      label: 'Restaurant',
      content: RestaurantContent
    },
    {
      id: 'hours',
      label: 'Horaires',
      content: HoursContent
    }
  ],
  fields: {
    general: [
      { name: 'firstName', label: 'Prénom', type: 'text', required: true },
      { name: 'lastName', label: 'Nom', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true, disabled: true },
      { name: 'phone', label: 'Téléphone', type: 'tel', required: true },
      { name: 'address.street', label: 'Adresse', type: 'text' },
      { name: 'address.city', label: 'Ville', type: 'text', required: true },
      { name: 'address.region', label: 'Région', type: 'text', required: true },
      { name: 'address.country', label: 'Pays', type: 'select', options: [
        { value: 'SN', label: 'Sénégal' },
        { value: 'CM', label: 'Cameroun' },
        { value: 'CI', label: 'Côte d\'Ivoire' },
        { value: 'GH', label: 'Ghana' },
        { value: 'NG', label: 'Nigeria' },
        { value: 'KE', label: 'Kenya' }
      ]},
      { name: 'address.postalCode', label: 'Code postal', type: 'text' }
    ],
    restaurant: [
      { name: 'restaurantName', label: 'Nom du restaurant', type: 'text', required: true },
      { name: 'restaurantType', label: 'Type de restaurant', type: 'select', options: [
        { value: 'fine-dining', label: 'Gastronomique' },
        { value: 'casual', label: 'Décontracté' },
        { value: 'fast-food', label: 'Restauration rapide' },
        { value: 'cafe', label: 'Café' },
        { value: 'bar', label: 'Bar' },
        { value: 'catering', label: 'Traiteur' },
        { value: 'food-truck', label: 'Food truck' },
        { value: 'bakery', label: 'Boulangerie' }
      ]},
      { name: 'cuisineTypes', label: 'Types de cuisine (séparés par des virgules)', type: 'text', placeholder: 'Ex: Africaine, Française, Italienne' },
      { name: 'seatingCapacity', label: 'Capacité d\'accueil', type: 'number', required: true }
    ]
  }
};
