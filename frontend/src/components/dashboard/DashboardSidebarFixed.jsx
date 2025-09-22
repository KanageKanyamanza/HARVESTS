import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  FiX,
  FiMessageCircle,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiStar,
  FiTrendingUp,
  FiGift
} from 'react-icons/fi';

const DashboardSidebarFixed = ({ onLogout, collapsed = false, onToggleCollapse }) => {
  const { user, userDisplayName, userInitials } = useAuth();
  const { displayLabel, displayIcon } = useUserType();
  const location = useLocation();

  const getNavigationItems = () => {
    if (user?.userType === 'consumer') {
      return [
        { name: 'Tableau de bord', href: '/consumer/dashboard', icon: FiHome },
        { name: 'Mes commandes', href: '/order-history', icon: FiShoppingBag },
        { name: 'Panier', href: '/cart', icon: FiShoppingCart },
        { name: 'Favoris', href: '/favorites', icon: FiHeart },
        { name: 'Abonnements', href: '/subscriptions', icon: FiRefreshCw },
        { name: 'Mes avis', href: '/reviews', icon: FiStar },
        { name: 'Fidélité', href: '/loyalty', icon: FiGift },
        { name: 'Statistiques', href: '/stats', icon: FiTrendingUp },
        { name: 'Profil', href: '/profile', icon: FiUser },
        { name: 'Messages', href: '/messages', icon: FiMessageCircle },
        { name: 'Paramètres', href: '/settings', icon: FiSettings }
      ];
    }

    return [
      { name: 'Tableau de bord', href: '/dashboard', icon: FiHome },
      { name: 'Profil', href: '/profile', icon: FiUser },
      { name: 'Messages', href: '/messages', icon: FiMessageCircle },
      { name: 'Paramètres', href: '/settings', icon: FiSettings }
    ];
  };

  const navigationItems = getNavigationItems();
  const isActive = (href) => location.pathname === href;

  return (
    <div className={`h-full bg-white shadow-lg transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* Logo et bouton collapse */}
        <div className="h-16 px-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          {!collapsed && (
            <Link to="/" className="flex items-center space-x-2">
              <img src="/src/assets/logo.png" alt="Harvests" className="h-8 w-auto" />
            </Link>
          )}
          {collapsed && (
            <Link to="/" className="flex items-center justify-center w-full">
              <img src="/src/assets/logo.png" alt="Harvests" className="h-8 w-auto" />
            </Link>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title={collapsed ? 'Étendre la sidebar' : 'Réduire la sidebar'}
          >
            {collapsed ? (
              <FiChevronRight className="h-5 w-5" />
            ) : (
              <FiChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-2'}`}>
            <div className="h-10 w-10 bg-harvests-green rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {userInitials || user?.firstName?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userDisplayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                </p>
                <div className="flex items-center space-x-1">
                  <span className="text-sm">{displayIcon}</span>
                  <p className="text-sm text-gray-500 truncate">{displayLabel}</p>
                </div>
              </div>
            )}
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
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-harvests-green text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.name : ''}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${
                  isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                } ${collapsed ? '' : 'mr-3'}`} />
                {!collapsed && item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onLogout}
            className={`group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Déconnexion' : ''}
          >
            <FiLogOut className={`h-5 w-5 text-gray-400 group-hover:text-gray-500 ${collapsed ? '' : 'mr-3'}`} />
            {!collapsed && 'Déconnexion'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebarFixed;
