import { useMemo } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook personnalisé pour gérer les types d'utilisateurs et leurs propriétés
 */
export const useUserType = () => {
  const { 
    user, 
    userType, 
    isProducer, 
    isConsumer, 
    isTransformer, 
    isRestaurateur, 
    isExporter, 
    isTransporter,
    isExplorer,
    hasPermission,
    canAccessRoute,
    getDefaultRoute
  } = useAuth();

  // Informations détaillées sur le type d'utilisateur
  const userTypeInfo = useMemo(() => {
    if (!userType) return null;

    const typeInfoMap = {
      consumer: {
        label: 'Consommateur',
        labelEn: 'Consumer',
        description: 'Achète des produits agricoles frais',
        color: 'blue',
        icon: '🛒',
        dashboardRoute: '/consumer/dashboard',
        permissions: ['view_products', 'create_orders', 'view_orders', 'create_reviews'],
        features: ['shopping_cart', 'order_history', 'favorites', 'reviews', 'loyalty_program']
      },
      producer: {
        label: 'Producteur',
        labelEn: 'Producer',
        description: 'Cultive et vend des produits agricoles',
        color: 'green',
        icon: '🌾',
        dashboardRoute: '/producer/dashboard',
        permissions: ['manage_products', 'view_orders', 'manage_inventory'],
        features: ['product_management', 'inventory', 'sales_analytics', 'order_management']
      },
      transformer: {
        label: 'Transformateur',
        labelEn: 'Processor',
        description: 'Transforme les produits agricoles',
        color: 'purple',
        icon: '🏭',
        dashboardRoute: '/transformer/dashboard',
        permissions: ['manage_processing', 'view_orders', 'manage_inventory'],
        features: ['processing_management', 'inventory', 'quality_control', 'order_management']
      },
      restaurateur: {
        label: 'Restaurateur',
        labelEn: 'Restaurant Owner',
        description: 'Propriétaire de restaurant',
        color: 'orange',
        icon: '🍽️',
        dashboardRoute: '/restaurateur/dashboard',
        permissions: ['manage_menu', 'view_orders', 'manage_inventory'],
        features: ['menu_management', 'inventory', 'table_management', 'order_management']
      },
      exporter: {
        label: 'Exportateur',
        labelEn: 'Exporter',
        description: 'Exporte des produits agricoles',
        color: 'indigo',
        icon: '🚢',
        dashboardRoute: '/exporter/dashboard',
        permissions: ['manage_exports', 'view_orders', 'manage_logistics'],
        features: ['export_management', 'logistics', 'documentation', 'order_management']
      },
      transporter: {
        label: 'Transporteur',
        labelEn: 'Transporter',
        description: 'Transporte des produits agricoles',
        color: 'yellow',
        icon: '🚛',
        dashboardRoute: '/transporter/dashboard',
        permissions: ['manage_transport', 'view_orders', 'manage_deliveries'],
        features: ['delivery_management', 'route_optimization', 'vehicle_tracking', 'order_management']
      },
      explorer: {
        label: 'Explorateur',
        labelEn: 'Explorer',
        description: 'Explore et découvre de nouveaux produits et producteurs',
        color: 'cyan',
        icon: '🧭',
        dashboardRoute: '/explorer/dashboard',
        permissions: ['view_products', 'create_orders', 'view_orders', 'create_reviews', 'explore_producers'],
        features: ['product_exploration', 'producer_discovery', 'favorites', 'reviews', 'order_history']
      },
      exporter: {
        label: 'Exportateur',
        labelEn: 'Exporter',
        description: 'Exporte des produits agricoles et peut aussi acheter',
        color: 'indigo',
        icon: '🚢',
        dashboardRoute: '/exporter/dashboard',
        permissions: ['view_products', 'create_orders', 'view_orders', 'create_reviews', 'manage_exports'],
        features: ['export_management', 'shopping_cart', 'order_history', 'favorites', 'reviews']
      }
    };

    return typeInfoMap[userType] || null;
  }, [userType]);

  // Vérifier si l'utilisateur a une fonctionnalité spécifique
  const hasFeature = (feature) => {
    return userTypeInfo?.features?.includes(feature) || false;
  };

  // Obtenir la couleur du thème pour le type d'utilisateur
  const getThemeColor = () => {
    return userTypeInfo?.color || 'gray';
  };

  // Obtenir les routes autorisées pour le type d'utilisateur
  const getAllowedRoutes = () => {
    if (!userType) return [];

    const baseRoutes = ['/dashboard', '/profile', '/settings', '/messages'];
    const typeSpecificRoutes = [`/${userType}/dashboard`];

    // Routes spécifiques aux consommateurs
    if (userType === 'consumer') {
      return [
        ...baseRoutes,
        '/consumer/dashboard',
        '/cart',
        '/checkout',
        '/order-history',
        '/favorites',
        '/addresses',
        '/payment-methods',
        '/reviews'
      ];
    }

    // Routes spécifiques aux explorateurs
    if (userType === 'explorer') {
      return [
        ...baseRoutes,
        '/explorer/dashboard',
        '/explorer/discover',
        '/explorer/favorites',
        '/explorer/reviews',
        '/explorer/statistics',
        '/cart',
        '/checkout',
        '/order-history'
      ];
    }

    // Routes spécifiques aux exportateurs (peuvent aussi acheter)
    if (userType === 'exporter') {
      return [
        ...baseRoutes,
        '/exporter/dashboard',
        '/exporter/fleet',
        '/exporter/orders',
        '/exporter/statistics',
        '/cart',
        '/checkout',
        '/order-history',
        '/favorites',
        '/products'
      ];
    }

    // Routes spécifiques aux producteurs
    if (userType === 'producer') {
      return [
        ...baseRoutes,
        '/producer/dashboard',
        '/producer/products',
        '/producer/products/add',
        '/producer/orders',
        '/producer/analytics',
        '/producer/inventory'
      ];
    }

    // Routes communes pour les autres types
    return [...baseRoutes, ...typeSpecificRoutes];
  };

  // Vérifier si le profil utilisateur est complet
  const isProfileComplete = () => {
    if (!user) return false;

    // Vérifications de base pour tous les utilisateurs
    const hasBasicInfo = user.firstName && user.email && user.phone;
    
    // Vérifications spécifiques par type
    switch (userType) {
      case 'consumer':
        return hasBasicInfo && user.lastName;
      
      case 'producer':
        return hasBasicInfo && user.farmName;
      
      case 'transformer':
        return hasBasicInfo && user.companyName;
      
      case 'restaurateur':
        return hasBasicInfo && user.restaurantName;
      
      case 'exporter':
        return hasBasicInfo && user.companyName;
      
      case 'transporter':
        return hasBasicInfo && user.companyName;
      
      case 'explorer':
        return hasBasicInfo && user.lastName;
      
      default:
        return hasBasicInfo;
    }
  };

  return {
    // Informations de base
    userType,
    userTypeInfo,
    
    // Vérifications de type
    isProducer,
    isConsumer,
    isTransformer,
    isRestaurateur,
    isExporter,
    isTransporter,
    isExplorer,
    
    // Fonctions utilitaires
    hasPermission,
    hasFeature,
    canAccessRoute,
    getDefaultRoute,
    getThemeColor,
    getAllowedRoutes,
    isProfileComplete: isProfileComplete(),
    
    // Données enrichies
    displayLabel: userTypeInfo?.label || 'Utilisateur',
    displayIcon: userTypeInfo?.icon || '👤',
    dashboardRoute: userTypeInfo?.dashboardRoute || '/dashboard'
  };
};

export default useUserType;
