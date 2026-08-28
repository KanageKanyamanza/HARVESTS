/**
 * Validation du formulaire d'inscription
 */
export const validateRegisterForm = (formData) => {
  const newErrors = {};
  
  // Pour les consommateurs : nom complet (prénom + nom)
  if (formData.userType === 'consumer') {
    if (!formData.fullName?.trim()) {
      newErrors.firstName = 'Le nom complet est requis';
    } else {
      const parts = formData.fullName.trim().split(/\s+/);
      if (parts.length < 2) {
        newErrors.firstName = 'Veuillez saisir votre prénom et votre nom';
      }
    }
  } else if (formData.userType === 'producer') {
    if (!formData.farmName?.trim()) {
      newErrors.firstName = 'Le nom de la ferme est requis';
    }
  } else if (formData.userType === 'restaurateur') {
    if (!formData.restaurantName?.trim()) {
      newErrors.firstName = 'Le nom du restaurant est requis';
    }
  } else if (['transformer', 'exporter', 'transporter'].includes(formData.userType)) {
    if (!formData.companyName?.trim()) {
      newErrors.firstName = "Le nom de l'entreprise est requis";
    }
  } else {
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'Le nom est requis';
    }
  }
  
  if (!formData.email?.trim()) {
    newErrors.email = 'L\'email est requis';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = 'Format d\'email invalide';
  }
  
  if (!formData.password) {
    newErrors.password = 'Le mot de passe est requis';
  } else if (formData.password.length < 8) {
    newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.password)) {
    newErrors.password = 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';
  }
  
  if (!formData.userType) {
    newErrors.userType = 'Le type d\'utilisateur est requis';
  }
  
  if (!formData.country?.trim()) {
    newErrors.country = 'Le pays est requis';
  }

  if (!formData.acceptedTerms) {
    newErrors.acceptedTerms = 'Vous devez accepter les Conditions d\'Utilisation et la Politique de Confidentialité';
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
