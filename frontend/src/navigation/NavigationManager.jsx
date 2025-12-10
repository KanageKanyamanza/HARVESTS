/**
 * Gestionnaire de navigation centralisé
 */
import { 
  getDashboardRoute, 
  getOrdersRoute, 
  getMessagesRoute, 
  getProfileRoute, 
  getSettingsRoute,
  getProductsRoute,
  getAddProductRoute,
  getNotificationsRoute
} from '../utils/routeUtils';

// Import des icônes par défaut
import {
  FiHome,
  FiUser,
  FiSettings,
  FiShoppingBag,
  FiPackage,
  FiPlus,
  FiStar,
  FiHeart,
  FiTrendingUp,
  FiShoppingCart,
  FiEdit,
  FiUsers,
  FiTruck,
  FiGlobe,
  FiCompass,
  FiSearch,
  FiBell
} from 'react-icons/fi';
import { FaChartBar } from 'react-icons/fa';

/**
 * Génère la navigation pour un type d'utilisateur spécifique
 * @param {Object} user - L'objet utilisateur
 * @param {Object} icons - Les icônes à utiliser
 * @returns {Array} - La navigation pour ce type d'utilisateur
 */
export const generateUserNavigation = (user, icons = {}) => {
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

/**
 * Génère la navigation sidebar pour un type d'utilisateur spécifique
 * @param {Object} user - L'objet utilisateur
 * @param {Object} icons - Les icônes à utiliser
 * @returns {Array} - La navigation sidebar pour ce type d'utilisateur
 */
export const generateSidebarNavigation = (user, icons = {}) => {
  const {
    FiHome: HomeIcon = FiHome,
    FiUser: UserIcon = FiUser,
    FiSettings: SettingsIcon = FiSettings,
    FiShoppingBag: ShoppingBagIcon = FiShoppingBag,
    FiPackage: PackageIcon = FiPackage,
    FiPlus: PlusIcon = FiPlus,
    FiStar: StarIcon = FiStar,
    FiHeart: HeartIcon = FiHeart,
    FiTrendingUp: TrendingUpIcon = FiTrendingUp,
    FiShoppingCart: ShoppingCartIcon = FiShoppingCart,
    FaChartBar: ChartBarIcon = FaChartBar,
    FiTruck: TruckIcon = FiTruck,
    FiBell: BellIcon = FiBell
  } = icons;

  // Si des navigationItems sont fournis en prop, les utiliser
  if (user?.navigationItems && user.navigationItems.length > 0) {
    return user.navigationItems.flatMap(section => 
      section.items.map(item => ({
        name: item.name,
        href: item.href,
        icon: item.icon || HomeIcon
      }))
    );
  }

  // Sinon, utiliser la logique par défaut
    if (user?.userType === 'consumer') {
      return [
        { name: 'Tableau de bord', href: getDashboardRoute(user), icon: HomeIcon },
        { name: 'Panier', href: '/consumer/cart', icon: ShoppingCartIcon },
        { name: 'Mes favoris', href: '/consumer/favorites', icon: HeartIcon },
        { name: 'Mes commandes', href: '/consumer/orders', icon: ShoppingBagIcon },
        { name: 'Mes avis', href: '/consumer/reviews', icon: StarIcon },
        { name: 'Statistiques', href: '/consumer/statistics', icon: TrendingUpIcon },
        { name: 'Notifications', href: getNotificationsRoute(user), icon: BellIcon },
        { name: 'Profil', href: getProfileRoute(user), icon: UserIcon },
        { name: 'Paramètres', href: getSettingsRoute(user), icon: SettingsIcon }
      ];
    }

    if (user?.userType === 'explorer') {
      return [
        { name: 'Tableau de bord', href: getDashboardRoute(user), icon: HomeIcon },
        { name: 'Explorer', href: '/explorer/discover', icon: FiCompass },
        { name: 'Mes favoris', href: '/explorer/favorites', icon: HeartIcon },
        { name: 'Mes commandes', href: '/explorer/orders', icon: ShoppingBagIcon },
        { name: 'Mes avis', href: '/explorer/reviews', icon: StarIcon },
        { name: 'Statistiques', href: '/explorer/statistics', icon: TrendingUpIcon },
        { name: 'Notifications', href: getNotificationsRoute(user), icon: BellIcon },
        { name: 'Profil', href: getProfileRoute(user), icon: UserIcon },
        { name: 'Paramètres', href: getSettingsRoute(user), icon: SettingsIcon }
      ];
    }

  if (user?.userType === 'producer') {
    return [
      { name: 'Tableau de bord', href: getDashboardRoute(user), icon: HomeIcon },
      { name: 'Mes produits', href: getProductsRoute(user), icon: PackageIcon },
      { name: 'Ajouter produit', href: getAddProductRoute(user), icon: PlusIcon },
      { name: 'Commandes', href: getOrdersRoute(user), icon: ShoppingBagIcon },
      { name: 'Avis reçus', href: '/producer/reviews', icon: StarIcon },
      { name: 'Statistiques', href: '/producer/stats', icon: ChartBarIcon },
      { name: 'Notifications', href: getNotificationsRoute(user), icon: BellIcon },
      { name: 'Profil', href: getProfileRoute(user), icon: UserIcon },
      { name: 'Paramètres', href: getSettingsRoute(user), icon: SettingsIcon }
    ];
  }

  if (user?.userType === 'transformer') {
    return [
      { name: 'Tableau de bord', href: getDashboardRoute(user), icon: HomeIcon },
      { name: 'Commandes', href: getOrdersRoute(user), icon: ShoppingBagIcon },
      { name: 'Mes Produits', href: getProductsRoute(user), icon: PackageIcon },
      { name: 'Avis reçus', href: '/transformer/reviews', icon: StarIcon },
      { name: 'Statistiques', href: '/transformer/stats', icon: ChartBarIcon },
      { name: 'Notifications', href: getNotificationsRoute(user), icon: BellIcon },
      { name: 'Profil', href: getProfileRoute(user), icon: UserIcon },
      { name: 'Paramètres', href: getSettingsRoute(user), icon: SettingsIcon }
    ];
  }

  if (user?.userType === 'restaurateur') {
    return [
      { name: 'Tableau de bord', href: getDashboardRoute(user), icon: HomeIcon },
      { name: 'Mon panier', href: '/restaurateur/cart', icon: ShoppingCartIcon },
      { name: 'Mes commandes', href: getOrdersRoute(user), icon: ShoppingBagIcon },
      { name: 'Mes plats', href: getProductsRoute(user), icon: PackageIcon },
      { name: 'Avis reçus', href: '/restaurateur/reviews', icon: StarIcon },
      { name: 'Statistiques', href: '/restaurateur/stats', icon: ChartBarIcon },
      { name: 'Notifications', href: getNotificationsRoute(user), icon: BellIcon },
      { name: 'Profil', href: getProfileRoute(user), icon: UserIcon },
      { name: 'Paramètres', href: getSettingsRoute(user), icon: SettingsIcon }
    ];
  }

  if (user?.userType === 'exporter') {
    return [
      { name: 'Tableau de bord', href: getDashboardRoute(user), icon: HomeIcon },
      { name: 'Commandes d\'export', href: getOrdersRoute(user), icon: ShoppingBagIcon },
      { name: 'Ma flotte', href: '/exporter/fleet', icon: TruckIcon },
      { name: 'Statistiques', href: '/exporter/statistics', icon: ChartBarIcon },
      { name: 'Notifications', href: getNotificationsRoute(user), icon: BellIcon },
      { name: 'Profil', href: getProfileRoute(user), icon: UserIcon },
      { name: 'Paramètres', href: getSettingsRoute(user), icon: SettingsIcon }
    ];
  }

  if (user?.userType === 'transporter') {
    return [
      { name: 'Tableau de bord', href: getDashboardRoute(user), icon: HomeIcon },
      { name: 'Commandes', href: getOrdersRoute(user), icon: ShoppingBagIcon },
      { name: 'Ma flotte', href: getProductsRoute(user), icon: PackageIcon },
      { name: 'Statistiques', href: '/transporter/statistics', icon: ChartBarIcon },
      { name: 'Notifications', href: getNotificationsRoute(user), icon: BellIcon },
      { name: 'Profil', href: getProfileRoute(user), icon: UserIcon },
      { name: 'Paramètres', href: getSettingsRoute(user), icon: SettingsIcon }
    ];
  }

  return [
    { name: 'Tableau de bord', href: getDashboardRoute(user), icon: HomeIcon }
  ];
};

/**
 * Génère les actions rapides pour un type d'utilisateur spécifique
 * @param {string} userType - Le type d'utilisateur
 * @param {Object} icons - Les icônes à utiliser
 * @returns {Array} - Les actions rapides pour ce type d'utilisateur
 */
export const generateQuickActions = (userType, icons = {}) => {
  const {
    FiPlus: PlusIcon = FiPlus,
    FiEdit: EditIcon = FiEdit,
    FiSettings: SettingsIcon = FiSettings,
    FiShoppingBag: ShoppingBagIcon = FiShoppingBag,
    FiPackage: PackageIcon = FiPackage,
    FiTrendingUp: TrendingUpIcon = FiTrendingUp,
    FiUsers: UsersIcon = FiUsers,
    FiTruck: TruckIcon = FiTruck,
    FiGlobe: GlobeIcon = FiGlobe
  } = icons;

  const baseActions = [
    ...(userType !== 'exporter'
      ? [{
          icon: <PlusIcon className="h-5 w-5" />,
          title: 'Ajouter un produit',
          description: 'Créer un nouveau produit',
          href: getAddProductRoute({ userType }),
          color: 'bg-blue-500 hover:bg-blue-600'
        }]
      : []),
    {
      icon: <EditIcon className="h-5 w-5" />,
      title: 'Modifier le profil',
      description: 'Mettre à jour vos informations',
      href: getProfileRoute({ userType }),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      icon: <SettingsIcon className="h-5 w-5" />,
      title: 'Paramètres',
      description: 'Configurer votre compte',
      href: getSettingsRoute({ userType }),
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  // Actions spécifiques selon le type d'utilisateur
  switch (userType) {
    case 'producer':
      return [
        ...baseActions,
        {
          icon: <ShoppingBagIcon className="h-5 w-5" />,
          title: 'Voir les commandes',
          description: 'Consulter vos commandes',
          href: getOrdersRoute({ userType }),
          color: 'bg-orange-500 hover:bg-orange-600'
        }
      ];

    case 'transformer':
      return [
        ...baseActions,
        {
          icon: <PackageIcon className="h-5 w-5" />,
          title: 'Gérer les produits',
          description: 'Voir et modifier vos produits',
          href: getProductsRoute({ userType }),
          color: 'bg-purple-500 hover:bg-purple-600'
        }
      ];

    case 'restaurateur':
      return baseActions;

    case 'transporter':
      return [
        ...baseActions,
        {
          icon: <FiTruck className="h-5 w-5" />,
          title: 'Nouvelle livraison',
          description: 'Créer une nouvelle livraison',
          href: '/transporter/deliveries/add',
          color: 'bg-blue-500 hover:bg-blue-600'
        }
      ];

    case 'exporter':
      return [
        ...baseActions,
        {
          icon: <TruckIcon className="h-5 w-5" />,
          title: 'Ajouter un véhicule',
          description: 'Enregistrer un nouveau moyen de transport',
          href: '/exporter/fleet/add',
          color: 'bg-blue-500 hover:bg-blue-600'
        },
        {
          icon: <FiGlobe className="h-5 w-5" />,
          title: 'Nouvel export',
          description: 'Créer un nouvel export',
          href: '/exporter/exports/add',
          color: 'bg-green-500 hover:bg-green-600'
        }
      ];

    case 'explorer':
      return [
        {
          icon: <FiCompass className="h-5 w-5" />,
          title: 'Explorer',
          description: 'Découvrir de nouveaux produits et producteurs',
          href: '/explorer/discover',
          color: 'bg-cyan-500 hover:bg-cyan-600'
        },
        {
          icon: <HeartIcon className="h-5 w-5" />,
          title: 'Mes favoris',
          description: 'Voir mes favoris',
          href: '/explorer/favorites',
          color: 'bg-pink-500 hover:bg-pink-600'
        },
        {
          icon: <ShoppingBagIcon className="h-5 w-5" />,
          title: 'Mes commandes',
          description: 'Voir mes commandes',
          href: '/explorer/orders',
          color: 'bg-orange-500 hover:bg-orange-600'
        },
        {
          icon: <SettingsIcon className="h-5 w-5" />,
          title: 'Paramètres',
          description: 'Configurer votre compte',
          href: getSettingsRoute({ userType }),
          color: 'bg-gray-500 hover:bg-gray-600'
        }
      ];

    default:
      return baseActions;
  }
};

export default {
  generateUserNavigation,
  generateSidebarNavigation,
  generateQuickActions
};
