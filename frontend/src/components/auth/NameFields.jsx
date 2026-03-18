import React from 'react';
import { User } from 'lucide-react';
import FormField from './FormField';

const NameFields = ({ 
  userType, 
  firstName, 
  lastName, 
  onFirstNameChange, 
  onLastNameChange, 
  firstNameError, 
  lastNameError 
}) => {
  if (userType === 'consumer') {
    return (
      <>
        {/* Prénom pour consommateur */}
        <FormField
          icon={User}
          type="text"
          name="firstName"
          value={firstName}
          onChange={onFirstNameChange}
          placeholder="Votre prénom"
          error={firstNameError}
        />

        {/* Nom pour consommateur */}
        <FormField
          icon={User}
          type="text"
          name="lastName"
          value={lastName}
          onChange={onLastNameChange}
          placeholder="Votre nom"
          error={lastNameError}
        />
      </>
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
