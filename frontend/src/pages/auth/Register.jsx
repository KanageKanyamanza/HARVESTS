import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Phone, MapPin } from 'lucide-react';
import SocialLinks from '../../components/common/SocialLinks';
import UserTypeSelector from '../../components/auth/UserTypeSelector';
import NameFields from '../../components/auth/NameFields';
import FormField from '../../components/auth/FormField';
import { useRegisterForm } from '../../hooks/useRegisterForm';
import { useRegisterSubmission } from '../../hooks/useRegisterSubmission';
import logo from '../../assets/logo.png';
import authbg from '../../assets/images/authbg.png';

const Register = () => {
  const [rememberMe, setRememberMe] = useState(false);
  
  // Hooks personnalisés
  const {
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
  } = useRegisterForm();

  const { handleSubmit, isSubmitting } = useRegisterSubmission(formData, setErrors, resetForm);

  return (
    <div className="flex items-center justify-center" style={{ backgroundImage: `url(${authbg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
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
                {/* Type de profil */}
                <UserTypeSelector
                  selectedUserType={formData.userType}
                  isOpen={isDropdownOpen}
                  onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
                  onSelect={setUserType}
                  error={errors.userType}
                />

                {/* Nom - Conditionnel selon le type d'utilisateur */}
                <NameFields
                  userType={formData.userType}
                  firstName={formData.firstName}
                  lastName={formData.lastName}
                  onFirstNameChange={handleChange}
                  onLastNameChange={handleChange}
                  firstNameError={errors.firstName}
                  lastNameError={errors.lastName}
                />

                {/* Email */}
                <FormField
                  icon={Mail}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Votre email"
                  error={errors.email}
                />

                {/* Mot de passe */}
                <FormField
                  icon={Lock}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Votre mot de passe"
                  error={errors.password}
                  showPasswordToggle={true}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  helperText="Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre"
                />

                {/* Confirmer mot de passe */}
                <FormField
                  icon={Lock}
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirmez votre mot de passe"
                  error={errors.confirmPassword}
                  showPasswordToggle={true}
                  showPassword={showConfirmPassword}
                  onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                />

                {/* Téléphone */}
                <FormField
                  icon={Phone}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Ex: +221 77 123 45 67 ou 1234567890"
                  error={errors.phone}
                />

                {/* Pays */}
                <FormField
                  icon={MapPin}
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Saisissez votre pays (ex: Sénégal, Cameroun, Ghana...)"
                  error={errors.country}
                />

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
                disabled={isSubmitting}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-full transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="ml-2">Inscription en cours...</span>
                  </>
                ) : (
                  "S'inscrire"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Register;
