/**
 * Utilitaires pour générer les routes selon le type d'utilisateur
 */

/**
 * Obtient la route du tableau de bord selon le type d'utilisateur
 * @param {Object} user - L'objet utilisateur
 * @returns {string} - La route du tableau de bord
 */
export const getDashboardRoute = (user) => {
  if (user?.role === 'admin') return '/admin';
  if (user?.userType === 'producer') return '/producer/dashboard';
  if (user?.userType === 'transformer') return '/transformer/dashboard';
  if (user?.userType === 'restaurateur') return '/restaurateur/dashboard';
  if (user?.userType === 'transporter') return '/transporter/dashboard';
  if (user?.userType === 'exporter') return '/exporter/dashboard';
  return '/consumer/dashboard';
};

/**
 * Obtient la route des commandes selon le type d'utilisateur
 * @param {Object} user - L'objet utilisateur
 * @returns {string} - La route des commandes
 */
export const getOrdersRoute = (user) => {
  if (user?.role === 'admin') return '/admin/orders';
  if (user?.userType === 'producer') return '/producer/orders';
  if (user?.userType === 'transformer') return '/transformer/orders';
  if (user?.userType === 'restaurateur') return '/restaurateur/orders';
  if (user?.userType === 'transporter') return '/transporter/orders';
  if (user?.userType === 'exporter') return '/exporter/orders';
  return '/consumer/orders';
};

/**
 * Obtient la route des messages selon le type d'utilisateur
 * @param {Object} user - L'objet utilisateur
 * @returns {string} - La route des messages
 */
export const getMessagesRoute = (user) => {
  if (user?.role === 'admin') return '/admin/messages';
  if (user?.userType === 'producer') return '/producer/messages';
  if (user?.userType === 'transformer') return '/transformer/messages';
  if (user?.userType === 'restaurateur') return '/restaurateur/messages';
  if (user?.userType === 'transporter') return '/transporter/messages';
  if (user?.userType === 'exporter') return '/exporter/messages';
  return '/consumer/messages';
};

/**
 * Obtient la route du profil selon le type d'utilisateur
 * @param {Object} user - L'objet utilisateur
 * @returns {string} - La route du profil
 */
export const getProfileRoute = (user) => {
  if (user?.role === 'admin') return '/admin/profile';
  if (user?.userType === 'producer') return '/producer/profile';
  if (user?.userType === 'transformer') return '/transformer/profile';
  if (user?.userType === 'restaurateur') return '/restaurateur/profile';
  if (user?.userType === 'transporter') return '/transporter/profile';
  if (user?.userType === 'exporter') return '/exporter/profile';
  return '/consumer/profile';
};

/**
 * Obtient la route des paramètres selon le type d'utilisateur
 * @param {Object} user - L'objet utilisateur
 * @returns {string} - La route des paramètres
 */
export const getSettingsRoute = (user) => {
  if (user?.role === 'admin') return '/admin/settings';
  if (user?.userType === 'producer') return '/producer/settings';
  if (user?.userType === 'transformer') return '/transformer/settings';
  if (user?.userType === 'restaurateur') return '/restaurateur/settings';
  if (user?.userType === 'transporter') return '/transporter/settings';
  if (user?.userType === 'exporter') return '/exporter/settings';
  return '/consumer/settings';
};

/**
 * Obtient la route des produits selon le type d'utilisateur
 * @param {Object} user - L'objet utilisateur
 * @returns {string} - La route des produits
 */
export const getProductsRoute = (user) => {
  if (user?.role === 'admin') return '/admin/products';
  if (user?.userType === 'producer') return '/producer/products';
  if (user?.userType === 'transformer') return '/transformer/products';
  if (user?.userType === 'restaurateur') return '/restaurateur/dishes';
  if (user?.userType === 'transporter') return '/transporter/fleet';
  if (user?.userType === 'exporter') return '/exporter/fleet';
  return '/products';
};

/**
 * Obtient la route pour ajouter un produit selon le type d'utilisateur
 * @param {Object} user - L'objet utilisateur
 * @returns {string} - La route pour ajouter un produit
 */
export const getAddProductRoute = (user) => {
  if (user?.role === 'admin') return '/admin/products/add';
  if (user?.userType === 'producer') return '/producer/products/add';
  if (user?.userType === 'transformer') return '/transformer/products/add';
  if (user?.userType === 'restaurateur') return '/restaurateur/dishes/add';
  if (user?.userType === 'transporter') return '/transporter/fleet/add';
  if (user?.userType === 'exporter') return '/exporter/fleet/add';
  return '/products/add';
};

/**
 * Obtient la route des notifications selon le type d'utilisateur
 * @param {Object} user - L'objet utilisateur
 * @returns {string} - La route des notifications
 */
export const getNotificationsRoute = (user) => {
  if (user?.role === 'admin') return '/admin/notifications';
  if (user?.userType === 'producer') return '/producer/notifications';
  if (user?.userType === 'transformer') return '/transformer/notifications';
  if (user?.userType === 'restaurateur') return '/restaurateur/notifications';
  if (user?.userType === 'transporter') return '/transporter/notifications';
  if (user?.userType === 'exporter') return '/exporter/notifications';
  if (user?.userType === 'explorer') return '/explorer/notifications';
  return '/consumer/notifications';
};

/**
 * Génère la navigation utilisateur complète selon le type d'utilisateur
 * @param {Object} user - L'objet utilisateur
 * @param {Array} icons - Les icônes à utiliser
 * @returns {Array} - La navigation utilisateur
 */
export const getUserNavigation = (user, icons = {}) => {
  const {
    Package = 'Package',
    MessageCircle = 'MessageCircle',
    User = 'User',
    Settings = 'Settings',
    Shield = 'Shield'
  } = icons;

  const baseNavigation = [
    { name: 'Tableau de bord', href: getDashboardRoute(user), icon: Package },
    { name: 'Commandes', href: getOrdersRoute(user), icon: Package },
    { name: 'Messages', href: getMessagesRoute(user), icon: MessageCircle },
    { name: 'Profil', href: getProfileRoute(user), icon: User },
    { name: 'Paramètres', href: getSettingsRoute(user), icon: Settings },
  ];

  // Ajouter le lien admin si l'utilisateur est admin
  if (user?.role === 'admin') {
    baseNavigation.unshift({ 
      name: 'Administration', 
      href: '/admin', 
      icon: Shield 
    });
  }

  return baseNavigation;
};
