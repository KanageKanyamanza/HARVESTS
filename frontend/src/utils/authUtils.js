// Utilitaires d'authentification

// Fonction pour obtenir la route par défaut selon le type d'utilisateur
export const getDefaultRoute = (userType, role = null) => {
  // Priorité au rôle admin
  if (role === 'admin' || userType === 'admin') {
    return '/admin';
  }
  
  const routes = {
    consumer: '/consumer/dashboard',
    producer: '/producer/dashboard',
    transformer: '/transformer/dashboard',
    restaurateur: '/restaurateur/dashboard',
    exporter: '/exporter/dashboard',
    transporter: '/transporter/dashboard',
  };
  return routes[userType] || '/dashboard';
};

// Fonction pour vérifier les permissions
export const hasPermission = (userType, permission) => {
  if (!userType) return false;
  
  // Permissions basées sur le type d'utilisateur
  const permissions = {
    consumer: ['view_products', 'create_orders', 'view_orders', 'create_reviews'],
    producer: ['manage_products', 'view_orders', 'manage_inventory'],
    transformer: ['manage_processing', 'view_orders', 'manage_inventory'],
    restaurateur: ['manage_menu', 'view_orders', 'manage_inventory'],
    exporter: ['manage_exports', 'view_orders', 'manage_logistics'],
    transporter: ['manage_transport', 'view_orders', 'manage_deliveries'],
    admin: ['*'] // Toutes les permissions
  };

  const userPermissions = permissions[userType] || [];
  return userPermissions.includes('*') || userPermissions.includes(permission);
};

// Fonction pour vérifier si l'utilisateur peut accéder à une route
export const canAccessRoute = (route, userType, isAuthenticated, role = null) => {
  if (!isAuthenticated) return false;
  
  // Routes admin - accès complet pour les admins
  if (role === 'admin' || userType === 'admin') {
    return route.startsWith('/admin') || route.startsWith('/dashboard') || route.startsWith('/profile') || route.startsWith('/settings');
  }
  
  // Routes publiques accessibles à tous les utilisateurs connectés
  const publicRoutes = ['/dashboard', '/profile', '/settings', '/messages'];
  if (publicRoutes.some(publicRoute => route.startsWith(publicRoute))) {
    return true;
  }

  // Routes spécifiques par type d'utilisateur
  if (route.startsWith(`/${userType}/`)) {
    return true;
  }

  // Routes communes aux consommateurs
  if (userType === 'consumer' && 
      ['/cart', '/checkout', '/order-history', '/favorites', '/addresses', '/payment-methods', '/reviews'].some(r => route.startsWith(r))) {
    return true;
  }

  return false;
};
