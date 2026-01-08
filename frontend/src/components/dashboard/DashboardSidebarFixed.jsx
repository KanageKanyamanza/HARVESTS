import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useUserType } from "../../hooks/useUserType";
import CloudinaryImage from "../common/CloudinaryImage";
import {
	getDashboardRoute,
	getOrdersRoute,
	getProfileRoute,
	getSettingsRoute,
	getProductsRoute,
	getDocumentsRoute,
	// getAddProductRoute
} from "../../utils/routeUtils";
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
	FiFileText,
} from "react-icons/fi";
import { FaChartBar } from "react-icons/fa";
import Logo from "../../assets/logo.png";

const DashboardSidebarFixed = ({
	onLogout,
	collapsed = false,
	onToggleCollapse,
	navigationItems,
	user: propUser,
}) => {
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
				return navigationItems.flatMap((section) =>
					section.items
						? section.items.map((item) => ({
								name: item.label,
								href: item.link,
								icon: item.icon || FiHome,
						  }))
						: []
				);
			}
		}

		// Sinon, utiliser la logique par défaut
		if (user?.userType === "consumer") {
			return [
				{
					name: "Tableau de bord",
					href: getDashboardRoute(user),
					icon: FiHome,
				},
				{ name: "Mes commandes", href: "/order-history", icon: FiShoppingBag },
				{ name: "Mes favoris", href: "/consumer/favorites", icon: FiHeart },
				{ name: "Mes avis", href: "/consumer/reviews", icon: FiStar },
				{
					name: "Statistiques",
					href: "/consumer/statistics",
					icon: FiTrendingUp,
				},
				{ name: "Panier", href: "consumer/cart", icon: FiShoppingCart },
				{ name: "Profil", href: getProfileRoute(user), icon: FiUser },
				{ name: "Paramètres", href: getSettingsRoute(user), icon: FiSettings },
			];
		}

		if (user?.userType === "producer") {
			return [
				{
					name: "Tableau de bord",
					href: getDashboardRoute(user),
					icon: FiHome,
				},
				{ name: "Mes produits", href: getProductsRoute(user), icon: FiPackage },
				// { name: 'Ajouter produit', href: getAddProductRoute(user), icon: FiPlus },
				{ name: "Commandes", href: getOrdersRoute(user), icon: FiShoppingBag },
				{ name: "Avis reçus", href: "/producer/reviews", icon: FiStar },
				{ name: "Statistiques", href: "/producer/stats", icon: FaChartBar },
				{ name: "Profil", href: getProfileRoute(user), icon: FiUser },
				{ name: "Documents", href: getDocumentsRoute(user), icon: FiFileText },
				{ name: "Paramètres", href: getSettingsRoute(user), icon: FiSettings },
			];
		}

		if (user?.userType === "transformer") {
			return [
				{
					name: "Tableau de bord",
					href: getDashboardRoute(user),
					icon: FiHome,
				},
				{ name: "Mes Produits", href: getProductsRoute(user), icon: FiPackage },
				{ name: "Commandes", href: getOrdersRoute(user), icon: FiShoppingBag },
				{ name: "Avis reçus", href: "/transformer/reviews", icon: FiStar },
				{ name: "Statistiques", href: "/transformer/stats", icon: FaChartBar },
				{ name: "Profil", href: getProfileRoute(user), icon: FiUser },
				{ name: "Documents", href: getDocumentsRoute(user), icon: FiFileText },
				{ name: "Paramètres", href: getSettingsRoute(user), icon: FiSettings },
			];
		}

		if (user?.userType === "restaurateur") {
			return [
				{
					name: "Tableau de bord",
					href: getDashboardRoute(user),
					icon: FiHome,
				},
				{
					name: "Mon panier",
					href: "/restaurateur/cart",
					icon: FiShoppingCart,
				},
				{
					name: "Mes commandes",
					href: getOrdersRoute(user),
					icon: FiShoppingBag,
				},
				{ name: "Mes plats", href: getProductsRoute(user), icon: FiPackage },
				{ name: "Statistiques", href: "/restaurateur/stats", icon: FaChartBar },
				{ name: "Profil", href: getProfileRoute(user), icon: FiUser },
				{ name: "Documents", href: getDocumentsRoute(user), icon: FiFileText },
				{ name: "Paramètres", href: getSettingsRoute(user), icon: FiSettings },
			];
		}
		if (user?.userType === "transporter") {
			return [
				{
					name: "Tableau de bord",
					href: getDashboardRoute(user),
					icon: FiHome,
				},
				{ name: "Commandes", href: getOrdersRoute(user), icon: FiShoppingBag },
				{ name: "Ma flotte", href: getProductsRoute(user), icon: FiTruck },
				{
					name: "Statistiques",
					href: "/transporter/statistics",
					icon: FaChartBar,
				},
				{ name: "Profil", href: getProfileRoute(user), icon: FiUser },
				{ name: "Documents", href: getDocumentsRoute(user), icon: FiFileText },
				{ name: "Paramètres", href: getSettingsRoute(user), icon: FiSettings },
			];
		}

		if (user?.userType === "exporter") {
			return [
				{
					name: "Tableau de bord",
					href: getDashboardRoute(user),
					icon: FiHome,
				},
				{
					name: "Commandes d'export",
					href: getOrdersRoute(user),
					icon: FiShoppingBag,
				},
				{ name: "Ma flotte", href: "/exporter/fleet", icon: FiTruck },
				{
					name: "Statistiques",
					href: "/exporter/statistics",
					icon: FaChartBar,
				},
				{ name: "Profil", href: getProfileRoute(user), icon: FiUser },
				{ name: "Documents", href: getDocumentsRoute(user), icon: FiFileText },
				{ name: "Paramètres", href: getSettingsRoute(user), icon: FiSettings },
			];
		}

		return [
			{ name: "Tableau de bord", href: getDashboardRoute(user), icon: FiHome },
		];
	};

	const sidebarNavigationItems = getNavigationItems();
	const isActive = (href) => location.pathname === href;

	return (
		<div
			className={`h-full transition-all duration-300 z-50 fixed left-0 top-0 border-r border-white/60 ${
				collapsed ? "w-20" : "w-64"
			}`}
		>
			{/* Glassmorphism Background Layer */}
			<div className="absolute inset-0 bg-white/80 backdrop-blur-2xl" />

			{/* Decorative Elements */}
			<div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-primary-50/50 to-transparent pointer-events-none" />

			<div className="relative flex flex-col h-full z-10">
				{/* Header / Logo */}
				<div
					className={`h-20 flex items-center ${
						collapsed ? "justify-center" : "px-6 justify-between"
					}`}
				>
					<Link to="/" className="block">
						<img
							src={Logo}
							alt="Harvests"
							className={`transition-all duration-300 object-contain drop-shadow-sm ${
								collapsed ? "h-8 w-8" : "h-10 w-auto"
							}`}
						/>
					</Link>
					{!collapsed && (
						<button
							onClick={onToggleCollapse}
							className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300 group"
						>
							<FiChevronLeft className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" />
						</button>
					)}
				</div>

				{/* Collapsed Toggle Button (Centered if collapsed) */}
				{collapsed && (
					<button
						onClick={onToggleCollapse}
						className="mx-auto mb-3 p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300"
					>
						<FiChevronRight className="h-4 w-4" />
					</button>
				)}

				{/* User Profile Card */}
				<div
					className={`px-3 mb-4 transition-all duration-300 ${
						collapsed ? "px-1.5" : ""
					}`}
				>
					<div
						className={`bg-white/50 border border-white rounded-[1rem] shadow-sm p-2.5 flex items-center gap-2.5 transition-all duration-300 ${
							collapsed
								? "flex-col justify-center p-1.5 bg-transparent border-none shadow-none"
								: ""
						}`}
					>
						<div className="relative group">
							<div
								className={`absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500 ${
									collapsed ? "w-10 h-10" : "w-10 h-10"
								}`}
							></div>
							<div
								className={`relative rounded-full p-0.5 bg-white ${
									collapsed ? "w-10 h-10" : "w-10 h-10"
								}`}
							>
								{user?.avatar ? (
									<CloudinaryImage
										src={user.avatar}
										alt="Avatar"
										className="h-full w-full rounded-full object-cover"
										width={40}
										height={40}
										crop="fill"
										quality="auto"
									/>
								) : (
									<div className="h-full w-full bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm">
										{user?.firstName?.[0] || user?.email?.[0] || "U"}
									</div>
								)}
							</div>
							{/* Status Indicator */}
							<div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary-500 border-2 border-white rounded-full"></div>
						</div>

						{!collapsed && (
							<div className="flex-1 min-w-0">
								<h3 className="text-xs font-bold text-gray-900 truncate tracking-tight">
									{userDisplayName ||
										`${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
								</h3>
								<div className="flex items-center gap-1 mt-0.5">
									<span className="inline-flex items-center justify-center w-4 h-4 rounded-md bg-primary-100/50 text-primary-600 text-[10px]">
										{displayIcon}
									</span>
									<span className="text-[10px] font-medium text-gray-500 truncate">
										{displayLabel}
									</span>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Navigation */}
				<nav className="flex-1 px-3 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">
					{sidebarNavigationItems.map((item) => {
						const Icon = item.icon;
						const active = isActive(item.href);
						return (
							<Link
								key={item.name}
								to={item.href}
								className={`relative group flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-300 ${
									active
										? "bg-primary-600 text-white shadow-lg shadow-primary-200"
										: "text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-md hover:shadow-gray-100"
								} ${collapsed ? "justify-center px-1.5 py-2.5" : ""}`}
								title={collapsed ? item.name : ""}
							>
								{/* Active Indicator Glow */}
								{active && (
									<div className="absolute inset-0 bg-gradient-to-tr from-primary-600 to-primary-500 rounded-xl opacity-100 -z-10" />
								)}

								<Icon
									className={`h-4.5 w-4.5 transition-transform duration-300 ${
										active
											? "text-white scale-110"
											: "text-gray-400 group-hover:text-primary-500 group-hover:scale-110"
									} ${collapsed ? "" : "mr-3"}`}
								/>

								{!collapsed && (
									<span
										className={`font-semibold text-xs tracking-wide ${
											active ? "text-white" : ""
										}`}
									>
										{item.name}
									</span>
								)}

								{/* Active Dot */}
								{active && !collapsed && (
									<div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-sm" />
								)}
							</Link>
						);
					})}
				</nav>

				{/* Footer Actions */}
				<div className="p-3 mt-auto space-y-1.5">
					{/* View Site */}
					<Link
						to="/"
						className={`flex items-center w-full px-3 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-md hover:shadow-gray-200 transition-all duration-300 group custom-dashed-border ${
							collapsed ? "justify-center" : ""
						}`}
					>
						<FiGlobe
							className={`h-4.5 w-4.5 transition-colors ${
								collapsed ? "" : "mr-3"
							} text-gray-400 group-hover:text-blue-500`}
						/>
						{!collapsed && "Voir le site"}
					</Link>

					{/* Logout */}
					<button
						onClick={onLogout}
						className={`flex items-center w-full px-3 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 group ${
							collapsed ? "justify-center" : ""
						}`}
					>
						<FiLogOut
							className={`h-4.5 w-4.5 transition-colors ${
								collapsed ? "" : "mr-3"
							} text-gray-400 group-hover:text-rose-500`}
						/>
						{!collapsed && "Déconnexion"}
					</button>
				</div>

				{/* Bottom Gradient Fade */}
				<div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
			</div>
		</div>
	);
};

export default DashboardSidebarFixed;
