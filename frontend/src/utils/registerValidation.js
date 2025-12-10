/**
 * Validation du formulaire d'inscription
 */
export const validateRegisterForm = (formData) => {
  const newErrors = {};
  
  // Pour les consommateurs : prénom et nom séparés
  if (formData.userType === 'consumer') {
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
  } else {
    // Pour les autres : juste le nom (firstName sera utilisé comme nom complet)
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le nom est requis';
    }
  }
  
  if (!formData.email.trim()) {
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
  
  if (!formData.phone.trim()) {
    newErrors.phone = 'Le téléphone est requis';
  } else {
    // Validation flexible pour tous les numéros internationaux
    const cleaned = formData.phone.replace(/\D/g, '');
    if (cleaned.length < 7 || cleaned.length > 15) {
      newErrors.phone = 'Le numéro doit contenir entre 7 et 15 chiffres';
    }
  }
  
  if (!formData.userType) {
    newErrors.userType = 'Le type d\'utilisateur est requis';
  }
  
  if (!formData.country.trim()) {
    newErrors.country = 'Le pays est requis';
  }
  
  return newErrors;
};

/**
 * Préparer les données d'inscription selon le type d'utilisateur
 */
export const prepareRegistrationData = (formData) => {
  if (formData.userType === 'consumer') {
    // Consommateur : prénom et nom séparés
    return {
      ...formData,
      address: {
        street: 'À compléter',
        city: 'À compléter', 
        region: 'À compléter',
        country: formData.country
      }
    };
  } else {
    // Autres : nom complet dans firstName, lastName vide
    return {
      ...formData,
      lastName: formData.lastName || 'À compléter',
      address: {
        street: 'À compléter',
        city: 'À compléter', 
        region: 'À compléter',
        country: formData.country
      }
    };
  }
};

