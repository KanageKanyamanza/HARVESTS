import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Globe } from 'lucide-react';
import { changeLanguage, getCurrentLanguage, getLanguageInfo } from '../../utils/i18n';

const AuthLayout = ({ children, title, subtitle, showBackButton = true }) => {
  const { t } = useTranslation();
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header avec logo et sélecteur de langue */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton && (
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">{t('common.back')}</span>
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

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-gradient-harvest rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          <div className="text-center">
            <h1 className="font-display font-bold text-3xl text-gray-900">Harvests</h1>
            <p className="text-sm text-gray-600 mt-1">L'Amazon agricole africain</p>
          </div>
        </Link>

        {/* Titre et sous-titre */}
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && (
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-card sm:rounded-xl sm:px-10">
          {children}
        </div>
      </div>

      {/* Footer avec pays supportés */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-4">
          Disponible dans 6 pays africains
        </p>
        <div className="flex justify-center space-x-4 text-2xl">
          <span title="Cameroun">🇨🇲</span>
          <span title="Sénégal">🇸🇳</span>
          <span title="Ghana">🇬🇭</span>
          <span title="Nigeria">🇳🇬</span>
          <span title="Kenya">🇰🇪</span>
          <span title="Côte d'Ivoire">🇨🇮</span>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
