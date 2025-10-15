import React from 'react';
import { FiMapPin, FiClock, FiCoffee, FiUsers, FiStar, FiAward, FiPackage, FiTruck, FiHome, FiMail, FiPhone, FiGlobe, FiHeart, FiBell, FiDollarSign } from 'react-icons/fi';

// Composant pour les champs de formulaire
const FormField = ({ field, value, onChange, disabled = false }) => {
  const { name, label, type, required, options, rows, ...props } = field;

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            name={name}
            value={value || ''}
            onChange={onChange}
            required={required}
            disabled={disabled}
            rows={rows || 3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green focus:border-transparent"
            {...props}
          />
        );

      case 'select':
        return (
          <select
            name={name}
            value={value || ''}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green focus:border-transparent"
            {...props}
          >
            <option value="">Sélectionner...</option>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {options?.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  name={name}
                  value={option.value}
                  checked={selectedValues.includes(option.value)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter(v => v !== option.value);
                    onChange({
                      target: {
                        name,
                        value: newValue,
                        type: 'checkbox'
                      }
                    });
                  }}
                  disabled={disabled}
                  className="h-4 w-4 text-harvests-green focus:ring-harvests-green border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              name={name}
              checked={value || false}
              onChange={onChange}
              disabled={disabled}
              className="h-4 w-4 text-harvests-green focus:ring-harvests-green border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">{label}</span>
          </label>
        );

      default:
        return (
          <input
            type={type || 'text'}
            name={name}
            value={value || ''}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green focus:border-transparent"
            {...props}
          />
        );
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {renderField()}
    </div>
  );
};

// Contenu général
export const GeneralContent = ({ profile, onChange, fields }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields.map((field, index) => (
        <FormField
          key={index}
          field={field}
          value={field.name.includes('.') 
            ? field.name.split('.').reduce((obj, key) => obj?.[key], profile)
            : profile[field.name]
          }
          onChange={onChange}
        />
      ))}
    </div>
  </div>
);

// Contenu exploitation (producteur)
export const FarmContent = ({ profile, onChange, fields }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields.map((field, index) => (
        <FormField
          key={index}
          field={field}
          value={field.name.includes('.') 
            ? field.name.split('.').reduce((obj, key) => obj?.[key], profile)
            : profile[field.name]
          }
          onChange={onChange}
        />
      ))}
    </div>
  </div>
);

// Contenu entreprise (transformateur)
export const CompanyContent = ({ profile, onChange, fields }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields.map((field, index) => (
        <FormField
          key={index}
          field={field}
          value={field.name.includes('.') 
            ? field.name.split('.').reduce((obj, key) => obj?.[key], profile)
            : profile[field.name]
          }
          onChange={onChange}
        />
      ))}
    </div>
  </div>
);

// Contenu restaurant (restaurateur)
export const RestaurantContent = ({ profile, onChange, fields }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields.map((field, index) => (
        <FormField
          key={index}
          field={field}
          value={field.name.includes('.') 
            ? field.name.split('.').reduce((obj, key) => obj?.[key], profile)
            : profile[field.name]
          }
          onChange={onChange}
        />
      ))}
    </div>
  </div>
);

// Contenu transformation (transformateur)
export const TransformationContent = ({ profile, onChange, fields }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields.map((field, index) => (
        <FormField
          key={index}
          field={field}
          value={field.name.includes('.') 
            ? field.name.split('.').reduce((obj, key) => obj?.[key], profile)
            : profile[field.name]
          }
          onChange={onChange}
        />
      ))}
    </div>
  </div>
);

// Contenu adresse
export const AddressContent = ({ profile, onChange, fields }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields.map((field, index) => (
        <FormField
          key={index}
          field={field}
          value={field.name.includes('.') 
            ? field.name.split('.').reduce((obj, key) => obj?.[key], profile)
            : profile[field.name]
          }
          onChange={onChange}
        />
      ))}
    </div>
  </div>
);

// Contenu horaires (restaurateur)
export const HoursContent = ({ profile, onChange }) => {
  const days = [
    { key: 'monday', label: 'Lundi' },
    { key: 'tuesday', label: 'Mardi' },
    { key: 'wednesday', label: 'Mercredi' },
    { key: 'thursday', label: 'Jeudi' },
    { key: 'friday', label: 'Vendredi' },
    { key: 'saturday', label: 'Samedi' },
    { key: 'sunday', label: 'Dimanche' }
  ];

  const handleHoursChange = (day, field, value) => {
    onChange({
      target: {
        name: `operatingHours.${day}.${field}`,
        value: value,
        type: 'text'
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {days.map(day => (
          <div key={day.key} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">{day.label}</h3>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profile.operatingHours?.[day.key]?.isOpen || false}
                  onChange={(e) => handleHoursChange(day.key, 'isOpen', e.target.checked)}
                  className="h-4 w-4 text-harvests-green focus:ring-harvests-green border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Ouvert</span>
              </label>
            </div>
            {profile.operatingHours?.[day.key]?.isOpen && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Ouverture</label>
                  <input
                    type="time"
                    value={profile.operatingHours?.[day.key]?.open || '08:00'}
                    onChange={(e) => handleHoursChange(day.key, 'open', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-harvests-green"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fermeture</label>
                  <input
                    type="time"
                    value={profile.operatingHours?.[day.key]?.close || '22:00'}
                    onChange={(e) => handleHoursChange(day.key, 'close', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-harvests-green"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Contenu services (restaurateur)
export const ServicesContent = ({ profile, onChange }) => {
  const services = [
    { key: 'catering', label: 'Traiteur', icon: FiPackage },
    { key: 'delivery', label: 'Livraison', icon: FiTruck },
    { key: 'events', label: 'Événements', icon: FiStar },
    { key: 'mealPlanning', label: 'Planification de repas', icon: FiClock }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map(service => (
          <div key={service.key} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <service.icon className="h-5 w-5 text-gray-400 mr-3" />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profile.additionalServices?.[service.key] || false}
                  onChange={(e) => onChange({
                    target: {
                      name: `additionalServices.${service.key}`,
                      value: e.target.checked,
                      type: 'checkbox'
                    }
                  })}
                  className="h-4 w-4 text-harvests-green focus:ring-harvests-green border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">{service.label}</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Contenu préférences (consommateur)
export const PreferencesContent = ({ profile, onChange, fields }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields.map((field, index) => (
        <FormField
          key={index}
          field={field}
          value={field.name.includes('.') 
            ? field.name.split('.').reduce((obj, key) => obj?.[key], profile)
            : profile[field.name]
          }
          onChange={onChange}
        />
      ))}
    </div>
  </div>
);

// Contenu notifications (consommateur)
export const NotificationsContent = ({ profile, onChange }) => {
  const notificationTypes = [
    { key: 'email', label: 'Email', icon: FiMail },
    { key: 'sms', label: 'SMS', icon: FiPhone },
    { key: 'push', label: 'Notifications push', icon: FiBell }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {notificationTypes.map(type => (
          <div key={type.key} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <type.icon className="h-5 w-5 text-gray-400 mr-3" />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profile.notifications?.[type.key] || false}
                  onChange={(e) => onChange({
                    target: {
                      name: `notifications.${type.key}`,
                      value: e.target.checked,
                      type: 'checkbox'
                    }
                  })}
                  className="h-4 w-4 text-harvests-green focus:ring-harvests-green border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">{type.label}</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Contenu produits (producteur)
export const ProductsContent = ({ profile }) => (
  <div className="space-y-6">
    <div className="text-center py-8">
      <FiPackage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Gestion des produits</h3>
      <p className="text-gray-500">Cette section sera gérée dans la page dédiée aux produits</p>
    </div>
  </div>
);

// Contenu certifications
export const CertificationsContent = ({ profile }) => (
  <div className="space-y-6">
    <div className="text-center py-8">
      <FiAward className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Certifications</h3>
      <p className="text-gray-500">Cette section sera gérée dans la page dédiée aux certifications</p>
    </div>
  </div>
);
