import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUserType } from '../../hooks/useUserType';
import {
  FiHome,
  FiShoppingBag,
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiMessageCircle,
  FiCreditCard,
  FiTruck,
  FiStar
} from 'react-icons/fi';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, userDisplayName, userInitials } = useAuth();
  const { displayLabel, displayIcon } = useUserType();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Navigation items basés sur le type d'utilisateur
  const getNavigationItems = () => {
    const commonItems = [
      { name: 'Tableau de bord', href: '/dashboard', icon: FiHome },
      { name: 'Profil', href: '/profile', icon: FiUser },
      { name: 'Messages', href: '/messages', icon: FiMessageCircle },
      { name: 'Paramètres', href: '/settings', icon: FiSettings },
    ];

    if (user?.userType === 'consumer') {
      return [
        { name: 'Tableau de bord', href: '/consumer/dashboard', icon: FiHome },
        { name: 'Mes commandes', href: '/order-history', icon: FiShoppingBag },
        { name: 'Panier', href: '/cart', icon: FiShoppingCart },
        { name: 'Favoris', href: '/favorites', icon: FiHeart },
        { name: 'Adresses', href: '/addresses', icon: FiTruck },
        { name: 'Moyens de paiement', href: '/payment-methods', icon: FiCreditCard },
        { name: 'Avis et notes', href: '/reviews', icon: FiStar },
        ...commonItems.slice(1) // Exclure le dashboard général
      ];
    }

    if (user?.userType === 'producer') {
      return [
        { name: 'Tableau de bord', href: '/producer/dashboard', icon: FiHome },
        { name: 'Mes produits', href: '/producer/products', icon: FiShoppingBag },
        { name: 'Commandes reçues', href: '/producer/orders', icon: FiShoppingCart },
        { name: 'Statistiques', href: '/producer/stats', icon: FiStar },
        ...commonItems.slice(1)
      ];
    }

    return commonItems;
  };

  const navigationItems = getNavigationItems();

  const isActive = (href) => {
    return location.pathname === href;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex lg:flex-shrink-0
      `}>
        <div className="flex flex-col w-64 h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/src/assets/logo.png" alt="Harvests" className="h-8 w-auto" />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* User info */}
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-harvests-green rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {userInitials || user?.firstName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userDisplayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                </p>
                <div className="flex items-center space-x-1">
                  <span className="text-sm">{displayIcon}</span>
                  <p className="text-sm text-gray-500 truncate">
                    {displayLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive(item.href)
                      ? 'bg-harvests-green text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`
                    mr-3 h-5 w-5 flex-shrink-0
                    ${isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <FiLogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-black hover:text-black"
            >
              <FiMenu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="text-gray-400 hover:text-gray-500 relative">
                <FiBell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* User menu */}
              <div className="relative">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                  <div className="h-8 w-8 bg-harvests-green rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {userInitials || user?.firstName?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs">{displayIcon}</span>
                      <span className="text-sm font-medium">
                        {user?.firstName || 'Utilisateur'}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
