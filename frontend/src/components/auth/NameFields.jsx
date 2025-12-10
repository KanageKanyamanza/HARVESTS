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

  // Nom complet pour les autres types d'utilisateurs
  const placeholder = 
    userType === 'producer' ? 'Nom de votre ferme/exploitation' :
    userType === 'transformer' ? 'Nom de votre entreprise' :
    userType === 'restaurateur' ? 'Nom de votre restaurant' :
    userType === 'exporter' ? 'Nom de votre entreprise' :
    userType === 'transporter' ? 'Nom de votre entreprise' :
    'Votre nom';

  return (
    <FormField
      icon={User}
      type="text"
      name="firstName"
      value={firstName}
      onChange={onFirstNameChange}
      placeholder={placeholder}
      error={firstNameError}
    />
  );
};

export default NameFields;

