import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Search, 
  ShoppingCart, 
  User,
  LogIn,
  LogOut,
  Settings,
  Package,
  MessageCircle,
  Shield
} from 'lucide-react';
import logo from '../../assets/logo.png';

import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../contexts/CartContext';
import NotificationDropdown from '../notifications/NotificationDropdown';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Fermer les menus au clic extérieur
  React.useEffect(() => {
    const handleClickOutside = () => {
      setIsProfileMenuOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Détecter le scroll pour changer l'apparence de la navbar
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    // Vérifier l'état initial du scroll
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Déterminer si la navbar doit être transparente (uniquement sur la page d'accueil)
  const shouldBeTransparent = location.pathname === '/' && !isScrolled;


  // Navigation principale
  const mainNavigation = [
    { name: 'Accueil', href: '/', current: location.pathname === '/' },
    { name: 'Produits', href: '/products', current: location.pathname === '/products' },
    { name: 'Catégories', href: '/categories', current: location.pathname === '/categories' },
    { name: 'Producteurs', href: '/producers', current: location.pathname === '/producers' },
  ];

  // Navigation utilisateur connecté
  const userNavigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: Package },
    { name: 'Commandes', href: '/orders', icon: Package },
    { name: 'Messages', href: '/messages', icon: MessageCircle },
    { name: 'Profil', href: '/profile', icon: User },
    { name: 'Paramètres', href: '/settings', icon: Settings },
  ];

  // Ajouter le lien admin si l'utilisateur est admin
  if (user?.role === 'admin') {
    userNavigation.unshift({ 
      name: 'Administration', 
      href: '/admin', 
      icon: Shield 
    });
  }

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


  return (
    <header 
      className={`${
        shouldBeTransparent
          ? 'absolute top-0 left-0 right-0 bg-transparent' 
          : 'bg-white sticky top-0'
      } z-40 transition-all duration-500 ease-in-out`}
    >
      <div className="w-full">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src={logo} 
                alt="Harvests Logo" 
                className="h-10 w-auto"
              />
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
                    : shouldBeTransparent 
                      ? 'text-white hover:text-primary-200 hover:border-b-2 hover:border-primary-200'
                      : 'text-gray-700 hover:text-primary-600 hover:border-b-2 hover:border-primary-200'
                } px-3 py-2 text-sm font-medium transition-all duration-500 ease-in-out`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Barre de recherche - Desktop */}
          <div className="hidden lg:block flex-1 max-w-[250px] ">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`h-5 w-5 transition-colors duration-500 ease-in-out ${shouldBeTransparent ? 'text-white' : 'text-gray-400'}`} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Rechercher..."
              />
            </form>
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {/* Panier - visible pour tous sauf producteurs et admins connectés */}
            {(!isAuthenticated || (user?.userType !== 'producer' && user?.userType !== 'admin')) && (
              <Link
                to="/cart"
                className={`${
                  shouldBeTransparent 
                    ? 'text-white hover:text-primary-200' 
                    : 'text-gray-700 hover:text-primary-600'
                } transition-colors duration-500 ease-in-out relative`}
                title="Mon panier"
              >
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <NotificationDropdown />

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
                      
                      <img src={user?.avatar} alt={user?.firstName} className="w-8 h-8 rounded-full object-cover" />
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
                          Déconnexion
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
                  className="btn-primary btn-sm"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Connexion
                </Link>
              </div>
            )}

            {/* Menu mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden ${
                shouldBeTransparent 
                  ? 'text-white hover:text-primary-200' 
                  : 'text-gray-700 hover:text-primary-600'
              } transition-colors duration-500 ease-in-out`}
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
        <div className={`md:hidden fixed inset-0 z-50 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu panel */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-sm bg-white shadow-xl">
            {/* Header du menu mobile */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="px-2 pt-2 pb-3 space-y-1 h-[calc(100%-80px)] overflow-y-auto">
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
                    placeholder="Rechercher..."
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
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-2" />
                  <Link
                    to="/login"
                    className="flex items-center px-3 py-2 text-base font-medium text-primary-600 hover:text-primary-900 hover:bg-primary-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogIn className="h-5 w-5 mr-3" />
                    Connexion
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
