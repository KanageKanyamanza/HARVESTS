import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Menu, 
  X, 
  Search, 
  ShoppingCart, 
  Bell, 
  User,
  Globe,
  LogIn,
  UserPlus,
  LogOut,
  Settings,
  Package,
  MessageCircle
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { changeLanguage, getCurrentLanguage, getLanguageInfo } from '../../utils/i18n';

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fermer les menus au clic extérieur
  React.useEffect(() => {
    const handleClickOutside = () => {
      setIsProfileMenuOpen(false);
      setIsLanguageMenuOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Navigation principale
  const mainNavigation = [
    { name: t('navigation.home'), href: '/', current: location.pathname === '/' },
    { name: t('navigation.products'), href: '/products', current: location.pathname === '/products' },
    { name: t('navigation.categories'), href: '/categories', current: location.pathname === '/categories' },
    { name: t('navigation.producers'), href: '/producers', current: location.pathname === '/producers' },
  ];

  // Navigation utilisateur connecté
  const userNavigation = [
    { name: t('navigation.dashboard'), href: '/dashboard', icon: Package },
    { name: t('navigation.orders'), href: '/orders', icon: Package },
    { name: t('navigation.messages'), href: '/messages', icon: MessageCircle },
    { name: t('navigation.profile'), href: '/profile', icon: User },
    { name: t('navigation.settings'), href: '/settings', icon: Settings },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setIsLanguageMenuOpen(false);
  };

  const currentLanguage = getCurrentLanguage();
  const languageInfo = getLanguageInfo(currentLanguage);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="container-xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-harvest rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="font-display font-bold text-xl text-gray-900">
                Harvests
              </span>
            </Link>
          </div>

          {/* Navigation principale - Desktop */}
          <nav className="hidden md:flex space-x-8">
            {mainNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  item.current
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-700 hover:text-primary-600 hover:border-b-2 hover:border-primary-200'
                } px-3 py-2 text-sm font-medium transition-all duration-200`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Barre de recherche - Desktop */}
          <div className="hidden lg:block flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder={t('search.placeholder')}
              />
            </form>
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {/* Sélecteur de langue */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLanguageMenuOpen(!isLanguageMenuOpen);
                }}
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <Globe className="h-5 w-5" />
                <span className="text-sm font-medium">{languageInfo.flag}</span>
              </button>

              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <button
                      onClick={() => handleLanguageChange('fr')}
                      className={`${
                        currentLanguage === 'fr' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } flex items-center px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                    >
                      <span className="mr-3">🇫🇷</span>
                      Français
                    </button>
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`${
                        currentLanguage === 'en' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } flex items-center px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                    >
                      <span className="mr-3">🇬🇧</span>
                      English
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button className="text-gray-700 hover:text-primary-600 transition-colors relative">
                  <Bell className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* Panier (pour les consommateurs) */}
                {user?.userType === 'consumer' && (
                  <Link
                    to="/cart"
                    className="text-gray-700 hover:text-primary-600 transition-colors relative"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                      2
                    </span>
                  </Link>
                )}

                {/* Menu profil */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProfileMenuOpen(!isProfileMenuOpen);
                    }}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-sm">
                        {user?.firstName?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden md:block text-sm font-medium">
                      {user?.firstName}
                    </span>
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        {userNavigation.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <Icon className="h-4 w-4 mr-3" />
                              {item.name}
                            </Link>
                          );
                        })}
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          {t('navigation.logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/login"
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="text-sm font-medium">{t('navigation.login')}</span>
                </Link>
                <Link
                  to="/register"
                  className="btn-primary btn-sm"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  {t('navigation.register')}
                </Link>
              </div>
            )}

            {/* Menu mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-700 hover:text-primary-600 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {/* Barre de recherche mobile */}
              <form onSubmit={handleSearch} className="px-3 py-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder={t('search.placeholder')}
                  />
                </div>
              </form>

              {/* Navigation principale mobile */}
              {mainNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Actions utilisateur mobile */}
              {isAuthenticated ? (
                <>
                  <hr className="my-2" />
                  {userNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-center px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {item.name}
                      </Link>
                    );
                  })}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center px-3 py-2 text-base font-medium text-red-600 hover:text-red-900 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    {t('navigation.logout')}
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-2" />
                  <Link
                    to="/login"
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogIn className="h-5 w-5 mr-3" />
                    {t('navigation.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center px-3 py-2 text-base font-medium text-primary-600 hover:text-primary-900 hover:bg-primary-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserPlus className="h-5 w-5 mr-3" />
                    {t('navigation.register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
