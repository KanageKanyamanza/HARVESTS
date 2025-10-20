import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { authService } from '../../services';
import SocialLinks from '../../components/common/SocialLinks';
import logo from '../../assets/logo.png';
import authbg from '../../assets/images/authbg.png';

const ForgotPassword = () => {
  
  const [formData, setFormData] = useState({
    email: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
      const response = await authService.forgotPassword(formData.email);
      
      if (response.data.status === 'success') {
        setIsSuccess(true);
      } else {
        setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
      }
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation:', error);
      
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
                <h2 className="text-2xl font-bold text-gray-900">Email envoyé !</h2>
              </div>

              <div className="text-center mb-6">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-gray-600 mb-4">
                  Nous avons envoyé un lien de réinitialisation à <strong>{formData.email}</strong>
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

              <div className="flex items-center justify-center text-center my-4">
                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-green-600 hover:text-green-700 text-sm underline"
                >
                  Renvoyer l'email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <h2 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h2>
            </div>

            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errors.general}
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
                  "Envoyer le lien"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
