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
	getNotificationsRoute,
} from "../utils/routeUtils";

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
	FiBell,
	FiFileText,
	FiMessageCircle,
	FiSun,
} from "react-icons/fi";
import { FaChartBar } from "react-icons/fa";

/**
 * Génère la navigation pour un type d'utilisateur spécifique
 * @param {Object} user - L'objet utilisateur
 * @param {Object} icons - Les icônes à utiliser
 * @returns {Array} - La navigation pour ce type d'utilisateur
 */
export const generateUserNavigation = (user, icons = {}, t = (key, fallback) => fallback) => {
	const {
		Package = "Package",
		MessageCircle = "MessageCircle",
		User = "User",
		Settings = "Settings",
		Shield = "Shield",
	} = icons;

	const baseNavigation = [
		{ name: t("dashboard", "Tableau de bord"), href: getDashboardRoute(user), icon: Package },
		{ name: t("orders", "Commandes"), href: getOrdersRoute(user), icon: Package },
		{ id: "messages", name: t("messages", "Messages"), href: getMessagesRoute(user), icon: MessageCircle },
		{ name: t("profile", "Profil"), href: getProfileRoute(user), icon: User },
		{ name: t("settings", "Paramètres"), href: getSettingsRoute(user), icon: Settings },
	];

	// Ajouter le lien admin si l'utilisateur est admin
	if (user?.role === "admin") {
		baseNavigation.unshift({
			name: t("admin", "Administration"),
			href: "/admin",
			icon: Shield,
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
export const generateSidebarNavigation = (user, icons = {}, t = (key, fallback) => fallback) => {
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
		FiBell: BellIcon = FiBell,
		FiFileText: FileTextIcon = FiFileText,
	} = icons;

	// Si des navigationItems sont fournis en prop, les utiliser
	if (user?.navigationItems && user.navigationItems.length > 0) {
		return user.navigationItems.flatMap((section) =>
			section.items.map((item) => ({
				name: item.name,
				href: item.href,
				icon: item.icon || HomeIcon,
			})),
		);
	}

	// Sinon, utiliser la logique par défaut
	if (user?.userType === "consumer") {
		return [
			{
				name: t("dashboard", "Tableau de bord"),
				href: getDashboardRoute(user),
				icon: HomeIcon,
			},
			{
				id: "messages", name: t("messages", "Messages"),
				href: getMessagesRoute(user),
				icon: FiMessageCircle,
			},
			{ name: t("cart", "Panier"), href: "/consumer/cart", icon: ShoppingCartIcon },
			{ name: t("sidebar.myFavorites", "Mes favoris"), href: "/consumer/favorites", icon: HeartIcon },
			{
				name: t("sidebar.myOrders", "Mes commandes"),
				href: "/consumer/orders",
				icon: ShoppingBagIcon,
			},
			{ name: t("sidebar.myReviews", "Mes avis"), href: "/consumer/reviews", icon: StarIcon },
			{
				name: t("sidebar.statistics", "Statistiques"),
				href: "/consumer/statistics",
				icon: TrendingUpIcon,
			},
			{
				name: t("notifications", "Notifications"),
				href: getNotificationsRoute(user),
				icon: BellIcon,
			},
			{ name: t("profile", "Profil"), href: getProfileRoute(user), icon: UserIcon },
			{ name: t("settings", "Paramètres"), href: getSettingsRoute(user), icon: SettingsIcon },
		];
	}

	if (user?.userType === "explorer") {
		return [
			{
				name: t("dashboard", "Tableau de bord"),
				href: getDashboardRoute(user),
				icon: HomeIcon,
			},
			{
				id: "messages", name: t("messages", "Messages"),
				href: getMessagesRoute(user),
				icon: FiMessageCircle,
			},
			{ name: t("sidebar.explore", "Explorer"), href: "/explorer/discover", icon: FiCompass },
			{ name: t("sidebar.myFavorites", "Mes favoris"), href: "/explorer/favorites", icon: HeartIcon },
			{
				name: t("sidebar.myOrders", "Mes commandes"),
				href: "/explorer/orders",
				icon: ShoppingBagIcon,
			},
			{ name: t("sidebar.myReviews", "Mes avis"), href: "/explorer/reviews", icon: StarIcon },
			{
				name: t("sidebar.statistics", "Statistiques"),
				href: "/explorer/statistics",
				icon: TrendingUpIcon,
			},
			{
				name: t("notifications", "Notifications"),
				href: getNotificationsRoute(user),
				icon: BellIcon,
			},
			{ name: t("profile", "Profil"), href: getProfileRoute(user), icon: UserIcon },
			{ name: t("settings", "Paramètres"), href: getSettingsRoute(user), icon: SettingsIcon },
		];
	}

	if (user?.userType === "producer") {
		return [
			{
				name: t("dashboard", "Tableau de bord"),
				href: getDashboardRoute(user),
				icon: HomeIcon,
			},
			{
				id: "messages", name: t("messages", "Messages"),
				href: getMessagesRoute(user),
				icon: FiMessageCircle,
			},
			{ name: t("sidebar.myProducts", "Mes Produits"), href: getProductsRoute(user), icon: PackageIcon },
			{
				name: t("sidebar.addProduct", "Ajouter produit"),
				href: getAddProductRoute(user),
				icon: PlusIcon,
			},
			{ name: t("orders", "Commandes"), href: getOrdersRoute(user), icon: ShoppingBagIcon },
			{ name: t("sidebar.reviewsReceived", "Avis reçus"), href: "/producer/reviews", icon: StarIcon },
			{
				name: t("sidebar.cropAdvice", "Conseils agricoles"),
				href: "/producer/crop-advice",
				icon: FiSun,
			},
			{ name: t("sidebar.statistics", "Statistiques"), href: "/producer/stats", icon: ChartBarIcon },
			{
				name: t("notifications", "Notifications"),
				href: getNotificationsRoute(user),
				icon: BellIcon,
			},
			{ name: t("sidebar.documents", "Documents"), href: "/producer/documents", icon: FileTextIcon },
			{ name: t("profile", "Profil"), href: getProfileRoute(user), icon: UserIcon },
			{ name: t("settings", "Paramètres"), href: getSettingsRoute(user), icon: SettingsIcon },
		];
	}

	if (user?.userType === "transformer") {
		return [
			{
				name: t("dashboard", "Tableau de bord"),
				href: getDashboardRoute(user),
				icon: HomeIcon,
			},
			{
				id: "messages", name: t("messages", "Messages"),
				href: getMessagesRoute(user),
				icon: FiMessageCircle,
			},
			{ name: t("orders", "Commandes"), href: getOrdersRoute(user), icon: ShoppingBagIcon },
			{ name: t("sidebar.myProducts", "Mes Produits"), href: getProductsRoute(user), icon: PackageIcon },
			{ name: t("sidebar.reviewsReceived", "Avis reçus"), href: "/transformer/reviews", icon: StarIcon },
			{ name: t("sidebar.statistics", "Statistiques"), href: "/transformer/stats", icon: ChartBarIcon },
			{
				name: t("notifications", "Notifications"),
				href: getNotificationsRoute(user),
				icon: BellIcon,
			},
			{ name: t("sidebar.documents", "Documents"), href: "/transformer/documents", icon: FileTextIcon },
			{ name: t("profile", "Profil"), href: getProfileRoute(user), icon: UserIcon },
			{ name: t("settings", "Paramètres"), href: getSettingsRoute(user), icon: SettingsIcon },
		];
	}

	if (user?.userType === "restaurateur") {
		return [
			{
				name: t("dashboard", "Tableau de bord"),
				href: getDashboardRoute(user),
				icon: HomeIcon,
			},
			{
				id: "messages", name: t("messages", "Messages"),
				href: getMessagesRoute(user),
				icon: FiMessageCircle,
			},
			{
				name: t("sidebar.myCart", "Mon panier"),
				href: "/restaurateur/cart",
				icon: ShoppingCartIcon,
			},
			{
				name: t("sidebar.myOrders", "Mes commandes"),
				href: getOrdersRoute(user),
				icon: ShoppingBagIcon,
			},
			{ name: t("sidebar.myDishes", "Mes plats"), href: getProductsRoute(user), icon: PackageIcon },
			{ name: t("sidebar.reviewsReceived", "Avis reçus"), href: "/restaurateur/reviews", icon: StarIcon },
			{ name: t("sidebar.statistics", "Statistiques"), href: "/restaurateur/stats", icon: ChartBarIcon },
			{
				name: t("notifications", "Notifications"),
				href: getNotificationsRoute(user),
				icon: BellIcon,
			},
			{
				name: t("sidebar.documents", "Documents"),
				href: "/restaurateur/documents",
				icon: FileTextIcon,
			},
			{ name: t("profile", "Profil"), href: getProfileRoute(user), icon: UserIcon },
			{ name: t("settings", "Paramètres"), href: getSettingsRoute(user), icon: SettingsIcon },
		];
	}

	if (user?.userType === "exporter") {
		return [
			{
				name: t("dashboard", "Tableau de bord"),
				href: getDashboardRoute(user),
				icon: HomeIcon,
			},
			{
				id: "messages", name: t("messages", "Messages"),
				href: getMessagesRoute(user),
				icon: FiMessageCircle,
			},
			{
				name: t("sidebar.exportOrders", "Commandes d'export"),
				href: getOrdersRoute(user),
				icon: ShoppingBagIcon,
			},
			{ name: t("sidebar.myFleet", "Ma flotte"), href: "/exporter/fleet", icon: TruckIcon },
			{
				name: t("sidebar.statistics", "Statistiques"),
				href: "/exporter/statistics",
				icon: ChartBarIcon,
			},
			{
				name: t("notifications", "Notifications"),
				href: getNotificationsRoute(user),
				icon: BellIcon,
			},
			{ name: t("sidebar.documents", "Documents"), href: "/exporter/documents", icon: FileTextIcon },
			{ name: t("profile", "Profil"), href: getProfileRoute(user), icon: UserIcon },
			{ name: t("settings", "Paramètres"), href: getSettingsRoute(user), icon: SettingsIcon },
		];
	}

	if (user?.userType === "transporter") {
		return [
			{
				name: t("dashboard", "Tableau de bord"),
				href: getDashboardRoute(user),
				icon: HomeIcon,
			},
			{
				id: "messages", name: t("messages", "Messages"),
				href: getMessagesRoute(user),
				icon: FiMessageCircle,
			},
			{ name: t("orders", "Commandes"), href: getOrdersRoute(user), icon: ShoppingBagIcon },
			{ name: t("sidebar.myFleet", "Ma flotte"), href: getProductsRoute(user), icon: PackageIcon },
			{
				name: t("sidebar.statistics", "Statistiques"),
				href: "/transporter/statistics",
				icon: ChartBarIcon,
			},
			{
				name: t("notifications", "Notifications"),
				href: getNotificationsRoute(user),
				icon: BellIcon,
			},
			{ name: t("sidebar.documents", "Documents"), href: "/transporter/documents", icon: FileTextIcon },
			{ name: t("profile", "Profil"), href: getProfileRoute(user), icon: UserIcon },
			{ name: t("settings", "Paramètres"), href: getSettingsRoute(user), icon: SettingsIcon },
		];
	}

	return [
		{ name: t("dashboard", "Tableau de bord"), href: getDashboardRoute(user), icon: HomeIcon },
		{ id: "messages", name: t("messages", "Messages"), href: getMessagesRoute(user), icon: FiMessageCircle },
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
		FiGlobe: GlobeIcon = FiGlobe,
	} = icons;

	const baseActions = [
		...(userType !== "exporter" ?
			[
				{
					icon: <PlusIcon className="h-5 w-5" />,
					title: "Ajouter un produit",
					description: "Créer un nouveau produit",
					href: getAddProductRoute({ userType }),
					color: "bg-blue-500 hover:bg-blue-600",
				},
			]
		:	[]),
		{
			icon: <EditIcon className="h-5 w-5" />,
			title: "Modifier le profil",
			description: "Mettre à jour vos informations",
			href: getProfileRoute({ userType }),
			color: "bg-green-500 hover:bg-green-600",
		},
		{
			icon: <SettingsIcon className="h-5 w-5" />,
			title: "Paramètres",
			description: "Configurer votre compte",
			href: getSettingsRoute({ userType }),
			color: "bg-gray-500 hover:bg-gray-600",
		},
	];

	// Actions spécifiques selon le type d'utilisateur
	switch (userType) {
		case "producer":
			return [
				...baseActions,
				{
					icon: <ShoppingBagIcon className="h-5 w-5" />,
					title: "Voir les commandes",
					description: "Consulter vos commandes",
					href: getOrdersRoute({ userType }),
					color: "bg-orange-500 hover:bg-orange-600",
				},
			];

		case "transformer":
			return [
				...baseActions,
				{
					icon: <PackageIcon className="h-5 w-5" />,
					title: "Gérer les produits",
					description: "Voir et modifier vos produits",
					href: getProductsRoute({ userType }),
					color: "bg-purple-500 hover:bg-purple-600",
				},
			];

		case "restaurateur":
			return baseActions;

		case "transporter":
			return [
				...baseActions,
				{
					icon: <FiTruck className="h-5 w-5" />,
					title: "Nouvelle livraison",
					description: "Créer une nouvelle livraison",
					href: "/transporter/deliveries/add",
					color: "bg-blue-500 hover:bg-blue-600",
				},
			];

		case "exporter":
			return [
				...baseActions,
				{
					icon: <TruckIcon className="h-5 w-5" />,
					title: "Ajouter un véhicule",
					description: "Enregistrer un nouveau moyen de transport",
					href: "/exporter/fleet/add",
					color: "bg-blue-500 hover:bg-blue-600",
				},
				{
					icon: <FiGlobe className="h-5 w-5" />,
					title: "Nouvel export",
					description: "Créer un nouvel export",
					href: "/exporter/exports/add",
					color: "bg-green-500 hover:bg-green-600",
				},
			];

		case "explorer":
			return [
				{
					icon: <FiCompass className="h-5 w-5" />,
					title: "Explorer",
					description: "Découvrir de nouveaux produits et producteurs",
					href: "/explorer/discover",
					color: "bg-cyan-500 hover:bg-cyan-600",
				},
				{
					icon: <HeartIcon className="h-5 w-5" />,
					title: "Mes favoris",
					description: "Voir mes favoris",
					href: "/explorer/favorites",
					color: "bg-pink-500 hover:bg-pink-600",
				},
				{
					icon: <ShoppingBagIcon className="h-5 w-5" />,
					title: "Mes commandes",
					description: "Voir mes commandes",
					href: "/explorer/orders",
					color: "bg-orange-500 hover:bg-orange-600",
				},
				{
					icon: <SettingsIcon className="h-5 w-5" />,
					title: "Paramètres",
					description: "Configurer votre compte",
					href: getSettingsRoute({ userType }),
					color: "bg-gray-500 hover:bg-gray-600",
				},
			];

		default:
			return baseActions;
	}
};

export default {
	generateUserNavigation,
	generateSidebarNavigation,
	generateQuickActions,
};
