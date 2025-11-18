import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUserType } from '../../hooks/useUserType';
import CloudinaryImage from '../common/CloudinaryImage';
import { 
  getDashboardRoute, 
  getOrdersRoute, 
  getProfileRoute, 
  getSettingsRoute,
  getProductsRoute,
  // getAddProductRoute
} from '../../utils/routeUtils';
import {
  FiHome,
  FiShoppingBag,
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiSettings,
  FiLogOut,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiStar,
  FiTrendingUp,
  FiGift,
  FiPackage,
  FiPlus,
  FiAward,
  FiGlobe,
  FiTruck,
  FiFileText
} from 'react-icons/fi';
import { FaChartBar } from 'react-icons/fa';
import Logo from '../../assets/logo.png';

const DashboardSidebarFixed = ({ onLogout, collapsed = false, onToggleCollapse, navigationItems, user: propUser }) => {
  const { user: authUser, userDisplayName } = useAuth();
  const { displayLabel, displayIcon } = useUserType();
  const location = useLocation();
  
  // Utiliser l'utilisateur passé en prop ou celui du contexte d'auth
  const user = propUser || authUser;

  const getNavigationItems = () => {
    // Si des navigationItems sont fournis en prop, les utiliser
    if (navigationItems && navigationItems.length > 0) {
      // Vérifier si c'est le nouveau format (tableau direct) ou l'ancien format (sections)
      if (navigationItems[0] && navigationItems[0].name) {
        // Nouveau format : tableau direct d'objets { name, href, icon }
        return navigationItems;
      } else {
        // Ancien format : sections avec items
        return navigationItems.flatMap(section => 
          section.items ? section.items.map(item => ({
            name: item.label,
            href: item.link,
            icon: item.icon || FiHome
          })) : []
        );
      }
    }

    // Sinon, utiliser la logique par défaut
    if (user?.userType === 'consumer') {
      return [
        { name: 'Tableau de bord', href: getDashboardRoute(user), icon: FiHome },
        { name: 'Mes commandes', href: '/order-history', icon: FiShoppingBag },
        { name: 'Mes favoris', href: '/consumer/favorites', icon: FiHeart },
        { name: 'Mes avis', href: '/consumer/reviews', icon: FiStar },
        { name: 'Statistiques', href: '/consumer/statistics', icon: FiTrendingUp },
        { name: 'Panier', href: 'consumer/cart', icon: FiShoppingCart },
        { name: 'Profil', href: getProfileRoute(user), icon: FiUser },
        { name: 'Paramètres', href: getSettingsRoute(user), icon: FiSettings }
      ];
    }

    if (user?.userType === 'producer') {
      return [
        { name: 'Tableau de bord', href: getDashboardRoute(user), icon: FiHome },
        { name: 'Mes produits', href: getProductsRoute(user), icon: FiPackage },
        // { name: 'Ajouter produit', href: getAddProductRoute(user), icon: FiPlus },
        { name: 'Commandes', href: getOrdersRoute(user), icon: FiShoppingBag },
        { name: 'Avis reçus', href: '/producer/reviews', icon: FiStar },
        { name: 'Statistiques', href: '/producer/stats', icon: FaChartBar },
        { name: 'Profil', href: getProfileRoute(user), icon: FiUser },
        { name: 'Paramètres', href: getSettingsRoute(user), icon: FiSettings }
      ];
    }

    if (user?.userType === 'transformer') {
      return [
        { name: 'Tableau de bord', href: getDashboardRoute(user), icon: FiHome },
        { name: 'Mes Produits', href: getProductsRoute(user), icon: FiPackage },
        { name: 'Commandes', href: getOrdersRoute(user), icon: FiShoppingBag },
        {name: 'Avis reçus', href: '/transformer/reviews', icon: FiStar },
        { name: 'Statistiques', href: '/transformer/stats', icon: FaChartBar },
        { name: 'Profil', href: getProfileRoute(user), icon: FiUser },
        { name: 'Paramètres', href: getSettingsRoute(user), icon: FiSettings }
      ];
    }

    if (user?.userType === 'restaurateur') {
      return [
        { name: 'Tableau de bord', href: getDashboardRoute(user), icon: FiHome },
        { name: 'Mon panier', href: '/restaurateur/cart', icon: FiShoppingCart },
        { name: 'Mes commandes', href: getOrdersRoute(user), icon: FiShoppingBag },
        { name: 'Mes plats', href: getProductsRoute(user), icon: FiPackage },
        { name: 'Statistiques', href: '/restaurateur/stats', icon: FaChartBar },
        { name: 'Profil', href: getProfileRoute(user), icon: FiUser },
        { name: 'Paramètres', href: getSettingsRoute(user), icon: FiSettings }
      ];
    }
    if (user?.userType === 'transporter') {
      return [
        { name: 'Tableau de bord', href: getDashboardRoute(user), icon: FiHome },
        { name: 'Commandes', href: getOrdersRoute(user), icon: FiShoppingBag },
        { name: 'Ma flotte', href: getProductsRoute(user), icon: FiTruck },
        { name: 'Statistiques', href: '/transporter/statistics', icon: FaChartBar },
        { name: 'Profil', href: getProfileRoute(user), icon: FiUser },
        { name: 'Paramètres', href: getSettingsRoute(user), icon: FiSettings }
      ];
    }

    if (user?.userType === 'exporter') {
      return [
        { name: 'Tableau de bord', href: getDashboardRoute(user), icon: FiHome },
        { name: 'Commandes d\'export', href: getOrdersRoute(user), icon: FiShoppingBag },
        { name: 'Ma flotte', href: '/exporter/fleet', icon: FiTruck },
        { name: 'Statistiques', href: '/exporter/statistics', icon: FaChartBar },
        { name: 'Profil', href: getProfileRoute(user), icon: FiUser },
        { name: 'Paramètres', href: getSettingsRoute(user), icon: FiSettings }
      ];
    }

    return [
      { name: 'Tableau de bord', href: getDashboardRoute(user), icon: FiHome }
    ];
  };

  const sidebarNavigationItems = getNavigationItems();
  const isActive = (href) => location.pathname === href;

  return (
    <div className={`h-full bg-white shadow-lg transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* Logo et bouton collapse */}
        <div className="h-16 px-4 border-b  border-gray-200 flex items-center justify-between flex-shrink-0">
          {!collapsed && (
            <Link to="/" className="flex items-center mx-auto space-x-1">
              <img src={Logo} alt="Harvests" className="h-10 w-auto" />
            </Link>
          )}
          {collapsed && (
            <Link to="/" className=" md:hidden mx-auto flex items-center justify-center w-full">
              <img src="/src/assets/logo.png" alt="Harvests" className="h-10 w-auto" />
            </Link>
          )}
          <button
            onClick={onToggleCollapse}
            className="hidden md:block p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
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
        <div className="px-2 py-3 border-b border-gray-200 flex-shrink-0">
          <div className={`flex items-center ${collapsed ? 'justify-center ' : 'space-x-2'}`}>
            <div className="h-10 w-10 bg-harvests-green rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <CloudinaryImage 
                  src={user.avatar} 
                  alt="Avatar" 
                  className="h-10 w-10 rounded-full object-cover" 
                  width={50}
                  height={50}
                  crop="fill"
                  quality="auto"
                />
              ) : (
                <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm">
                  {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                </div>
              )}
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
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {sidebarNavigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-harvests-green text-white'
                    : 'text-gray-600 hover:bg-harvests-light hover:text-gray-900'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.name : ''}
              >
                {React.createElement(Icon, {
                  className: `h-5 w-5 flex-shrink-0 ${
                    isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                  } ${collapsed ? '' : 'mr-3'}`
                })}
                {!collapsed && item.name}
              </Link>
            );
          })}
        </nav>

        {/* voir le site */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <Link to="/" className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-harvests-light hover:text-gray-900 transition-colors ${
            collapsed ? 'justify-center' : ''
          }">
            <FiGlobe className={`h-5 w-5 text-gray-400 group-hover:text-gray-500 ${collapsed ? '' : 'mr-3'}`} />
            {!collapsed && 'Voir le site'}
          </Link>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onLogout}
            className={`group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-harvests-light hover:text-gray-900 transition-colors ${
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
