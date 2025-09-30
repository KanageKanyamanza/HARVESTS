import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Phone, Users, ChevronUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SocialLinks from '../../components/common/SocialLinks';
import { useModal } from '../../components/modals/ModalManager';
import logo from '../../assets/logo.png';
import authbg from '../../assets/images/authbg.png';

const Register = () => {
  const { register, isLoading } = useAuth();
  const { openEmailVerificationModal } = useModal();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    userType: '',
    country: 'CM',
    preferredLanguage: 'fr'
  });

  // Types d'utilisateurs disponibles
  const userTypes = [
    { value: 'consumer', label: '🛒 Consommateur', description: 'Achetez des produits frais directement des producteurs' },
    { value: 'producer', label: '🌾 Producteur', description: 'Vendez vos produits agricoles sur notre plateforme' },
    { value: 'transformer', label: '🏭 Transformateur', description: 'Transformez et commercialisez des produits agricoles' },
    { value: 'restaurateur', label: '🍽️ Restaurateur', description: 'Commandez des ingrédients frais pour votre restaurant' },
    { value: 'exporter', label: '🚢 Exportateur', description: 'Exportez des produits agricoles vers d\'autres pays' },
    { value: 'transporter', label: '🚛 Transporteur', description: 'Transportez des produits agricoles en toute sécurité' }
  ];
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fonction pour sélectionner un type d'utilisateur
  const selectUserType = (type) => {
    setFormData(prev => ({
      ...prev,
      userType: type.value
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

  // Fermer le dropdown au clic extérieur
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

  const validateForm = () => {
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
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le téléphone est requis';
    }
    
    if (!formData.userType) {
      newErrors.userType = 'Le type d\'utilisateur est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Préparer les données selon le type d'utilisateur
      let registrationData;
      
      if (formData.userType === 'consumer') {
        // Consommateur : prénom et nom séparés
        registrationData = {
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
        registrationData = {
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

      const result = await register(registrationData);
      if (result.success) {
        // Afficher la modale de vérification d'email via ModalManager
        openEmailVerificationModal(formData.email, true);
      } else {
        setErrors({ submit: result.error });
      }
    } catch {
      setErrors({ submit: 'Erreur lors de l\'inscription' });
    }
  };

  return (
    <div className="flex items-center justify-center" style={{ backgroundImage: `url(${authbg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="w-full flex overflow-hidden">
        {/* Section gauche - Logo et informations */}
        <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center items-center text-white relative">
          <div className="relative z-10 text-center">
            <img 
              src={logo} 
              alt="Harvests Logo" 
              className="w-[400px] h-[190px] mx-auto mb-6 drop-shadow-lg"
            />
            <p className="text-green-700 text-lg mb-6">
              Agricultural Products Rural<br />
              Entrepreneurship Management System: AgriConnect Hub
            </p>
            
            {/* Réseaux sociaux */}
            <div className="mt-8">
              <SocialLinks 
                variant="glass" 
                size="md"
                className="justify-center"
              />
            </div>
          </div>
        </div>

        {/* Section droite - Formulaire */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 lg:p-12">
          <div className="max-w-md mx-auto">
            {/* Header mobile */}
            <div className="lg:hidden text-center mb-8">
              <img 
                src={logo} 
                alt="Harvests Logo" 
                className="sm:w-[300px] sm:h-[140px] w-[200px] h-[90px] mx-auto mb-4"
              />
            </div>

            <div className="text-center mb-2">
              <h2 className="text-2xl font-bold text-gray-900">Inscription</h2>
            </div>

            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-2 px-5 pt-5 pb-2 sm:px-10 sm:pt-10 sm:pb-5 backdrop-blur-sm shadow-lg rounded-4xl bg-green-500/10">
                {/* Nom - Conditionnel selon le type d'utilisateur */}
                {formData.userType === 'consumer' ? (
                  <>
                    {/* Prénom pour consommateur */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-black" />
                      </div>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Votre prénom"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.firstName ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                      )}
                    </div>

                    {/* Nom pour consommateur */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-black" />
                      </div>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.lastName ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                      )}
                    </div>
                  </>
                ) : (
                  /* Nom complet pour les autres types d'utilisateurs */
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-black" />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder={
                        formData.userType === 'producer' ? 'Nom de votre ferme/exploitation' :
                        formData.userType === 'transformer' ? 'Nom de votre entreprise' :
                        formData.userType === 'restaurateur' ? 'Nom de votre restaurant' :
                        formData.userType === 'exporter' ? 'Nom de votre entreprise' :
                        formData.userType === 'transporter' ? 'Nom de votre entreprise' :
                        'Votre nom'
                      }
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.firstName ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>
                )}

              {/* Email */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-black" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Votre email"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Mot de passe */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-black" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Votre mot de passe"
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-black" />
                  ) : (
                    <Eye className="h-5 w-5 text-black" />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirmer mot de passe */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-black" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirmez votre mot de passe"
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-black" />
                  ) : (
                    <Eye className="h-5 w-5 text-black" />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Téléphone */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-black" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Votre numéro de téléphone"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>


              {/* Type de profil - Custom Dropdown */}
              <div className="relative profile-dropdown">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Users className="h-5 w-5 text-black" />
                </div>
                
                {/* Trigger du dropdown */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-left flex items-center justify-between ${
                    errors.userType ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <span className={formData.userType ? 'text-gray-900' : 'text-gray-500'}>
                    {formData.userType 
                      ? userTypes.find(type => type.value === formData.userType)?.label 
                      : 'Sélectionner un profil'
                    }
                  </span>
                  <ChevronUp className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Menu dropdown */}
                {isDropdownOpen && (
                  <div className="absolute -top-[330px] left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
                    <div className="py-2">
                      {userTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => selectUserType(type)}
                          className={`w-full px-4 py-3 text-left hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                            formData.userType === type.value ? 'bg-green-50 text-green-700' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="text-2xl">{type.label.split(' ')[0]}</div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {type.label.split(' ').slice(1).join(' ')}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {type.description}
                              </div>
                            </div>
                            {formData.userType === type.value && (
                              <div className="flex-shrink-0">
                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {errors.userType && (
                  <p className="mt-1 text-sm text-red-600">{errors.userType}</p>
                )}
              </div>

              {/* Lien de connexion */}
              <div className="text-center">
                  <Link 
                    to="/login" 
                    className="text-green-600 hover:text-green-700 text-sm underline"
                  >
                    Ou connectez-vous
                  </Link>
              </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-center text-center my-2">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>

              {/* Bouton d'inscription */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-full transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  "S'inscrire"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Les modales sont maintenant gérées globalement par ModalManager */}
    </div>
  );
};

export default Register;
