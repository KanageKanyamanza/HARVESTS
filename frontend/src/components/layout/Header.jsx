import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
	Shield,
} from "lucide-react";
import logo from "../../assets/logo.png";

import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../contexts/CartContext";
import { useCurrency } from "../../contexts/CurrencyContext.jsx";
import NotificationDropdown from "../notifications/NotificationDropdown";
import SearchModal from "../common/SearchModal";
import { generateUserNavigation } from "../../navigation";

const Header = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { isAuthenticated, user, logout } = useAuth();
	const { totalItems } = useCart();

	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);
	const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
	const { currency, setCurrency, currencies } = useCurrency();

	// Fermer les menus au clic extérieur
	React.useEffect(() => {
		const handleClickOutside = (event) => {
			// Ne pas fermer si on clique sur le bouton du menu mobile
			if (event.target.closest("[data-mobile-menu-button]")) {
				return;
			}

			setIsProfileMenuOpen(false);
			setIsMobileMenuOpen(false);
		};

		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, []);

	// Détecter le scroll pour changer l'apparence de la navbar
	React.useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.scrollY;
			setIsScrolled(scrollTop > 50);
		};

		// Vérifier l'état initial du scroll
		handleScroll();

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Déterminer si la navbar doit être transparente (uniquement sur la page d'accueil)
	const shouldBeTransparent = location.pathname === "/" && !isScrolled;

	// Navigation principale
	const mainNavigation = [
		{ name: "Accueil", href: "/", current: location.pathname === "/" },
		{
			name: "Produits",
			href: "/products",
			current: location.pathname === "/products",
		},
		{
			name: "Catégories",
			href: "/categories",
			current: location.pathname === "/categories",
		},
		{
			name: "Nos Producteurs",
			href: "/producteurs",
			current: location.pathname === "/producteurs",
		},
		{ name: "Blog", href: "/blog", current: location.pathname === "/blog" },
		{
			name: "Tarifs",
			href: "/pricing",
			current: location.pathname === "/pricing",
		},
		// { name: 'Contact', href: '/contact', current: location.pathname === '/contact' },
	];

	// Navigation utilisateur connecté - adaptée selon le type d'utilisateur
	const userNavigation = generateUserNavigation(user, {
		Package,
		MessageCircle,
		User,
		Settings,
		Shield,
	});

	const handleProductClick = (product) => {
		// Fermer le menu mobile si ouvert
		setIsMobileMenuOpen(false);

		// Naviguer vers le produit
		navigate(`/products/${product._id}`);
	};

	const handleLogout = async () => {
		await logout();
		// Utiliser window.location.href pour forcer une navigation complète
		// et éviter les redirections automatiques vers /login
		window.location.href = "/";
	};

	return (
		<header
			className={`${
				shouldBeTransparent
					? "absolute top-0 left-0 right-0 bg-transparent"
					: "bg-white sticky top-0"
			} z-40 transition-all duration-500 ease-in-out`}
		>
			<div className="w-full">
				<div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
					{/* Logo */}
					<div className="flex items-center">
						<Link to="/" className="flex items-center space-x-2">
							<img src={logo} alt="Harvests Logo" className="h-10 w-auto" />
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
										? "text-primary-600 border-b-2 border-primary-600"
										: shouldBeTransparent
										? "text-white hover:text-primary-200 hover:border-b-2 hover:border-primary-200"
										: "text-gray-700 hover:text-primary-600 hover:border-b-2 hover:border-primary-200"
								} px-3 py-2 text-sm font-medium transition-all duration-500 ease-in-out`}
							>
								{item.name}
							</Link>
						))}
					</nav>

					{/* Icône de recherche - Desktop */}
					<div className="hidden lg:block">
						<button
							onClick={() => setIsSearchModalOpen(true)}
							className={`${
								shouldBeTransparent
									? "text-white hover:text-primary-200"
									: "text-gray-700 hover:text-primary-600"
							} transition-colors duration-500 ease-in-out p-2 hover:bg-gray-100 rounded-lg`}
							aria-label="Rechercher"
						>
							<Search className="h-6 w-6" />
						</button>
					</div>

					{/* Actions utilisateur */}
					<div className="flex items-center space-x-2 sm:space-x-4">
						{/* Sélecteur de devise - Universel */}
						<div className="flex items-center">
							<select
								value={currency}
								onChange={(e) => setCurrency(e.target.value)}
								className={`bg-transparent text-sm font-bold border-none focus:ring-0 cursor-pointer transition-colors duration-500 ease-in-out pl-2 pr-6 ${
									shouldBeTransparent
										? "text-white hover:text-primary-200"
										: "text-primary-600 hover:text-primary-700"
								}`}
							>
								{currencies.map((c) => (
									<option key={c.code} value={c.code} className="text-gray-900">
										{c.code}
									</option>
								))}
							</select>
						</div>
						{/* Icône de recherche - Mobile */}
						<button
							onClick={() => setIsSearchModalOpen(true)}
							className={`lg:hidden ${
								shouldBeTransparent
									? "text-white hover:text-primary-200"
									: "text-gray-700 hover:text-primary-600"
							} transition-colors duration-500 ease-in-out p-2 hover:bg-gray-100 rounded-lg`}
							aria-label="Rechercher"
						>
							<Search className="h-6 w-6" />
						</button>

						{/* Panier - visible pour tous sauf producteurs et admins connectés */}
						{(!isAuthenticated ||
							(user?.userType !== "producer" &&
								user?.userType !== "admin")) && (
							<Link
								to="/cart"
								className={`${
									shouldBeTransparent
										? "text-white hover:text-primary-200"
										: "text-gray-700 hover:text-primary-600"
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
								<NotificationDropdown
									shouldBeTransparent={shouldBeTransparent}
								/>

								{/* Menu profil */}
								<div className="relative">
									<button
										onClick={(e) => {
											e.stopPropagation();
											setIsProfileMenuOpen(!isProfileMenuOpen);
										}}
										className={`flex items-center space-x-2 transition-colors ${
											shouldBeTransparent
												? "text-white hover:text-primary-200"
												: "text-gray-700 hover:text-primary-600"
										}`}
									>
										<div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
											<img
												src={user?.avatar}
												alt={user?.firstName}
												className="w-8 h-8 rounded-full object-cover"
											/>
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
								<Link to="/login" className="btn-primary btn-sm">
									<LogIn className="h-4 w-4 mr-1" />
									Connexion
								</Link>
							</div>
						)}

						{/* Menu mobile */}
						<button
							data-mobile-menu-button
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								setIsMobileMenuOpen(!isMobileMenuOpen);
							}}
							className={`md:hidden ${
								shouldBeTransparent
									? "text-white hover:text-primary-200"
									: "text-gray-700 hover:text-primary-600"
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
				<div
					className={`md:hidden fixed inset-0 z-50 transition-transform duration-300 ease-in-out ${
						isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
					}`}
				>
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
							{/* Bouton de recherche mobile */}
							<div className="px-3 py-2">
								<button
									onClick={() => {
										setIsMobileMenuOpen(false);
										setIsSearchModalOpen(true);
									}}
									className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
								>
									<Search className="h-5 w-5 mr-3" />
									Rechercher des produits
								</button>
							</div>

							{/* Navigation principale mobile */}
							{mainNavigation.map((item) => (
								<Link
									key={item.name}
									to={item.href}
									className={`${
										item.current
											? "bg-primary-50 border-primary-500 text-primary-700"
											: "border-transparent text-gray-600 hover:bg-harvests-light hover:border-gray-300 hover:text-gray-800"
									} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
									onClick={() => setIsMobileMenuOpen(false)}
								>
									{item.name}
								</Link>
							))}

							{/* Bouton de connexion mobile (uniquement si non connecté) */}
							{!isAuthenticated && (
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

			{/* Modale de recherche */}
			<SearchModal
				isOpen={isSearchModalOpen}
				onClose={() => setIsSearchModalOpen(false)}
				onProductClick={handleProductClick}
			/>
		</header>
	);
};

export default Header;
