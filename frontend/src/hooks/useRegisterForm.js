import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Hook personnalisé pour gérer le formulaire d'inscription
 */
export const useRegisterForm = () => {
  const [searchParams] = useSearchParams();
  const commercial = searchParams.get('ref') || searchParams.get('commercial') || '';

  const [formData, setFormData] = useState({
    fullName: '',
    firstName: '',
    lastName: '',
    farmName: '',
    restaurantName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    userType: '',
    country: 'Sénégal',
    preferredLanguage: 'fr',
    referredBy: commercial,
    acceptedTerms: false
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

  const toggleAcceptedTerms = (e) => {
    setFormData(prev => ({
      ...prev,
      acceptedTerms: e.target.checked
    }));

    if (errors.acceptedTerms) {
      setErrors(prev => ({
        ...prev,
        acceptedTerms: ''
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      firstName: '',
      lastName: '',
      farmName: '',
      restaurantName: '',
      companyName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      userType: '',
      country: 'Sénégal',
      preferredLanguage: 'fr',
      referredBy: commercial,
      acceptedTerms: false
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
    toggleAcceptedTerms,
    resetForm
  };
};

