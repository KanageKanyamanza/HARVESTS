import React from 'react';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import FormField from './FormField';

// Chaque type de vendeur a son propre champ (le libellé vient de
// auth:register.namePlaceholders.<type>)
const FIELD_NAMES = {
  consumer: 'fullName',
  producer: 'farmName',
  restaurateur: 'restaurantName',
  transformer: 'companyName',
  exporter: 'companyName',
  transporter: 'companyName',
};

const NameFields = ({ 
  userType, 
  firstName, 
  onFirstNameChange, 
  firstNameError 
}) => {
  const { t } = useTranslation('auth');
  const fieldName = FIELD_NAMES[userType] || 'firstName';
  const placeholderKey = FIELD_NAMES[userType] ? userType : 'default';

  return (
    <FormField
      icon={User}
      type="text"
      name={fieldName}
      value={firstName}
      onChange={onFirstNameChange}
      placeholder={t(`register.namePlaceholders.${placeholderKey}`)}
      error={firstNameError}
    />
  );
};

export default NameFields;
