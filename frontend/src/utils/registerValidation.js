/**
 * Validation du formulaire d'inscription
 *
 * Jour 47 (bascule bilingue) : retourne des clés du namespace "auth"
 * (ex. "validation.emailRequired") et non du texte, traduites à l'affichage
 * par t() pour que les erreurs suivent un changement de langue.
 */
export const validateRegisterForm = (formData) => {
  const newErrors = {};
  
  // Pour les consommateurs : nom complet (prénom + nom)
  if (formData.userType === 'consumer') {
    if (!formData.fullName?.trim()) {
      newErrors.firstName = 'validation.fullNameRequired';
    } else {
      const parts = formData.fullName.trim().split(/\s+/);
      if (parts.length < 2) {
        newErrors.firstName = 'validation.fullNameIncomplete';
      }
    }
  } else if (formData.userType === 'producer') {
    if (!formData.farmName?.trim()) {
      newErrors.firstName = 'validation.farmNameRequired';
    }
  } else if (formData.userType === 'restaurateur') {
    if (!formData.restaurantName?.trim()) {
      newErrors.firstName = 'validation.restaurantNameRequired';
    }
  } else if (['transformer', 'exporter', 'transporter'].includes(formData.userType)) {
    if (!formData.companyName?.trim()) {
      newErrors.firstName = 'validation.companyNameRequired';
    }
  } else {
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'validation.nameRequired';
    }
  }
  
  if (!formData.email?.trim()) {
    newErrors.email = 'validation.emailRequired';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = 'validation.emailInvalid';
  }
  
  if (!formData.password) {
    newErrors.password = 'validation.passwordRequired';
  } else if (formData.password.length < 8) {
    newErrors.password = 'validation.passwordTooShort';
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.password)) {
    newErrors.password = 'validation.passwordWeak';
  }
  
  if (!formData.userType) {
    newErrors.userType = 'validation.userTypeRequired';
  }
  
  if (!formData.country?.trim()) {
    newErrors.country = 'validation.countryRequired';
  }

  if (!formData.acceptedTerms) {
    newErrors.acceptedTerms = 'validation.termsRequired';
  }

  return newErrors;
};

/**
 * Préparer les données d'inscription selon le type d'utilisateur
 */
export const prepareRegistrationData = (formData) => {
  const addressBase = {
    street: 'À compléter',
    city: 'À compléter', 
    region: 'À compléter',
    country: formData.country
  };

  if (formData.userType === 'consumer') {
    const fullName = formData.fullName?.trim() || '';
    const parts = fullName.split(/\s+/);
    const firstName = parts[0] || 'À compléter';
    const lastName = parts.slice(1).join(' ') || firstName || 'À compléter';
    
    // Create a copy of formData without fullName
    const { fullName: _, ...restFormData } = formData;

    return {
      ...restFormData,
      firstName,
      lastName,
      address: addressBase
    };
  }

  // Vendeurs : les champs métier (farmName/restaurantName/companyName) sont passés tels quels
  // firstName/lastName seront "À compléter" s'ils ne sont pas renseignés
  return {
    ...formData,
    firstName: formData.firstName || 'À compléter',
    lastName: formData.lastName || 'À compléter',
    address: addressBase
  };
};
