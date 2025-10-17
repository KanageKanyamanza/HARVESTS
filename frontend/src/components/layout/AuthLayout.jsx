import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe } from 'lucide-react';
import { changeLanguage, getCurrentLanguage, getLanguageInfo } from '../../utils/i18n';

const AuthLayout = ({ children, showBackButton = true }) => {
  const navigate = useNavigate();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = React.useState(false);

  const currentLanguage = getCurrentLanguage();
  const languageInfo = getLanguageInfo(currentLanguage);

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setIsLanguageMenuOpen(false);
  };

  // Fermer le menu langue au clic extérieur
  React.useEffect(() => {
    const handleClickOutside = () => {
      setIsLanguageMenuOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-harvests-light">
      {/* Header simplifié - seulement retour et traduction */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center">
          {showBackButton && (
            <Link
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Retour</span>
            </Link>
          )}
        </div>

        {/* Sélecteur de langue */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLanguageMenuOpen(!isLanguageMenuOpen);
            }}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
          >
            <Globe className="h-5 w-5" />
            <span className="text-sm font-medium">{languageInfo.flag}</span>
            <span className="hidden sm:block text-sm">{languageInfo.name}</span>
          </button>

          {isLanguageMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1">
                <button
                  onClick={() => handleLanguageChange('fr')}
                  className={`${
                    currentLanguage === 'fr' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } flex items-center px-4 py-2 text-sm w-full text-left hover:bg-gray-100 transition-colors`}
                >
                  <span className="mr-3">🇫🇷</span>
                  Français
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`${
                    currentLanguage === 'en' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } flex items-center px-4 py-2 text-sm w-full text-left hover:bg-gray-100 transition-colors`}
                >
                  <span className="mr-3">🇬🇧</span>
                  English
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal - plein écran */}
      <div className="w-full h-screen">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
