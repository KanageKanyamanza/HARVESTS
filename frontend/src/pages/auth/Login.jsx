import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import SocialLinks from '../../components/common/SocialLinks';
import { useModal } from '../../components/modals/ModalManager';
import logo from '../../assets/logo.png';
import authbg from '../../assets/images/authbg.png';

const Login = () => {
  const { login, getDefaultRoute } = useAuth();
  const { openEmailVerificationModal } = useModal();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);


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
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({}); // Effacer les erreurs précédentes

    try {
      // Utiliser l'AuthContext pour gérer la connexion
      const result = await login(formData);
      
      if (result.success) {
        navigate(getDefaultRoute());
      } else {
        // Vérifier si l'erreur est liée à un email non vérifié
        const errorMessage = result.error.toLowerCase();
        
        if (errorMessage.includes('vérifier') && errorMessage.includes('email')) {
          // Utiliser le gestionnaire de modales global
          openEmailVerificationModal(formData.email, false);
          setErrors({}); // Effacer les erreurs du formulaire
        } else {
          setErrors({ submit: result.error });
        }
      }
    } catch {
      setErrors({ submit: 'Erreur de connexion' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundImage: `url(${authbg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="w-full flex">
        {/* Section gauche - Logo et informations */}
        <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center items-center text-white relative">
          <div className="relative z-10 text-center">
            <img 
              src={logo} 
              alt="Harvests Logo" 
              className="w-[400px] h-[190px] mx-auto mb-6 drop-shadow-lg"
            />
            <p className="text-green-700 text-lg mb-6">
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

            <div className="text-center mb-5">
              <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
            </div>

            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-2 px-5 pt-5 pb-2 sm:px-10 sm:pt-10 sm:pb-5 backdrop-blur-sm shadow-lg rounded-4xl bg-green-500/10">
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

                {/* Lien d'inscription */}
                <div className="text-center">
                  <Link 
                    to="/register" 
                    className="text-green-600 hover:text-green-700 text-sm underline"
                  >
                    Ou inscrivez-vous
                  </Link>
                </div>

                {/* Lien mot de passe oublié */}
                <div className="text-center">
                  <Link 
                    to="/forgot-password" 
                    className="text-green-600 hover:text-green-700 text-sm underline"
                  >
                    Mot de passe oublié ?
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

                {/* Bouton de connexion */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-full transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="ml-2">Connexion en cours...</span>
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </button>

            </form>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Login;
