/**
 * Validation du formulaire d'inscription
 */
export const validateRegisterForm = (formData) => {
  const newErrors = {};
  
  // Pour les consommateurs : prénom et nom séparés
  if (formData.userType === 'consumer') {
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Le nom est requis';
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
  
  if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
  }
  
  if (!formData.phone?.trim()) {
    newErrors.phone = 'Le téléphone est requis';
  } else {
    const cleaned = formData.phone.replace(/\D/g, '');
    if (cleaned.length < 7 || cleaned.length > 15) {
      newErrors.phone = 'Le numéro doit contenir entre 7 et 15 chiffres';
    }
  }
  
  if (!formData.userType) {
    newErrors.userType = 'Le type d\'utilisateur est requis';
  }
  
  if (!formData.country?.trim()) {
    newErrors.country = 'Le pays est requis';
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
    return {
      ...formData,
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
