import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour gérer le formulaire d'inscription
 */
export const useRegisterForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    userType: '',
    country: 'Sénégal',
    preferredLanguage: 'fr'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const setUserType = (userType) => {
    setFormData(prev => ({
      ...prev,
      userType
    }));
    setIsDropdownOpen(false);
    
    // Clear error
    if (errors.userType) {
      setErrors(prev => ({
        ...prev,
        userType: ''
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      userType: '',
      country: 'Sénégal',
      preferredLanguage: 'fr'
    });
    setErrors({});
  };

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return {
    formData,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    errors,
    setErrors,
    isDropdownOpen,
    setIsDropdownOpen,
    handleChange,
    setUserType,
    resetForm
  };
};

