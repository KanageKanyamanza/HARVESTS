import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { authService } from '../../services';
import SocialLinks from '../../components/common/SocialLinks';
import logo from '../../assets/logo.png';
import authbg from '../../assets/images/authbg.png';

const ResetPassword = () => {
  const { token } = useParams();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.password.trim()) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authService.resetPassword(token, formData.password);
      
      if (response.data.status === 'success') {
        setIsSuccess(true);
      } else {
        setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundImage: `url(${authbg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
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

          {/* Section droite - Contenu de succès */}
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
                <h2 className="text-2xl font-bold text-gray-900">Succès !</h2>
              </div>

              <div className="text-center mb-6">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-gray-600 mb-4">
                  Votre mot de passe a été réinitialisé avec succès.
                </p>
              </div>

              <div className="text-center">
                <Link 
                  to="/login" 
                  className="text-green-600 hover:text-green-700 text-sm underline"
                >
                  Retour à la connexion
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundImage: `url(${authbg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
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

            <div className="text-center mb-5">
              <h2 className="text-2xl font-bold text-gray-900">Nouveau mot de passe</h2>
            </div>

            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-2 px-5 pt-5 pb-2 sm:px-10 sm:pt-10 sm:pb-5 backdrop-blur-sm shadow-lg rounded-4xl bg-green-500/10">
                {/* Nouveau mot de passe */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-black" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Nouveau mot de passe"
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

                {/* Confirmation du mot de passe */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-black" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirmer le mot de passe"
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

                {/* Lien retour */}
                <div className="text-center">
                  <Link 
                    to="/login" 
                    className="text-green-600 hover:text-green-700 text-sm underline"
                  >
                    Retour à la connexion
                  </Link>
                </div>
              </div>
              
              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-full transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  "Réinitialiser le mot de passe"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
