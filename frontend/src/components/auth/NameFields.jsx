import React from 'react';
import { User } from 'lucide-react';
import FormField from './FormField';

const NameFields = ({ 
  userType, 
  firstName, 
  onFirstNameChange, 
  firstNameError 
}) => {
  if (userType === 'consumer') {
    return (
      <FormField
        icon={User}
        type="text"
        name="fullName"
        value={firstName}
        onChange={onFirstNameChange}
        placeholder="Votre prénom et nom"
        error={firstNameError}
      />
    );
  }

  // Chaque type de vendeur a son propre champ et placeholder
  const fieldConfig = 
    userType === 'producer'     ? { name: 'farmName',       placeholder: 'Nom de votre ferme / exploitation' } :
    userType === 'restaurateur' ? { name: 'restaurantName', placeholder: 'Nom de votre restaurant' } :
    userType === 'transformer'  ? { name: 'companyName',    placeholder: 'Nom de votre entreprise de transformation' } :
    userType === 'exporter'     ? { name: 'companyName',    placeholder: "Nom de votre entreprise d'exportation" } :
    userType === 'transporter'  ? { name: 'companyName',    placeholder: 'Nom de votre entreprise de transport' } :
                                  { name: 'firstName',      placeholder: 'Votre nom' };

  return (
    <FormField
      icon={User}
      type="text"
      name={fieldConfig.name}
      value={firstName}
      onChange={onFirstNameChange}
      placeholder={fieldConfig.placeholder}
      error={firstNameError}
    />
  );
};

export default NameFields;
