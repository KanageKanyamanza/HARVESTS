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
					: "bg-white sticky top-0 border-b border-gray-200"
			} z-40 transition-all duration-500 ease-in-out flex flex-col`}
		>
			{/* Top Tier */}
			<div className="w-full">
				<div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 gap-4">
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

					{/* Logo */}
					<div className="flex-shrink-0 flex items-center">
						<Link to="/" className="flex items-center space-x-2">
							<img src={logo} alt="Harvests Logo" className="h-10 w-auto" />
						</Link>
					</div>

					{/* Barre de recherche large (Amazon style) - Desktop */}
					<div className="hidden flex-1 lg:flex items-center mx-4">
						<div className="flex w-full rounded-md shadow-sm border border-gray-300 bg-white">
							<input
								type="text"
								className="flex-1 px-4 py-2 outline-none text-gray-900 bg-white rounded-l-md"
								placeholder="Rechercher des produits, catégories..."
								onClick={() => setIsSearchModalOpen(true)}
								readOnly
							/>
							<button
								onClick={() => setIsSearchModalOpen(true)}
								className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 rounded-r-md transition-colors"
								aria-label="Rechercher"
							>
								<Search className="h-5 w-5" />
							</button>
						</div>
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

					{/* Actions utilisateur */}
					<div className="flex items-center space-x-2 sm:space-x-4">
						{/* Sélecteur de devise */}
						<div className="hidden md:flex items-center">
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
										<div className="text-left hidden md:block">
											<div className="text-xs">Bonjour, {user?.firstName}</div>
											<div className="text-sm font-bold">Compte et Listes ▼</div>
										</div>
										<div className="w-8 h-8 md:hidden bg-primary-100 rounded-full flex items-center justify-center">
											<img
												src={user?.avatar}
												alt={user?.firstName}
												className="w-8 h-8 rounded-full object-cover"
											/>
										</div>
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
							<div className="hidden md:flex items-center">
								<Link to="/login" className={`flex flex-col text-left transition-colors ${shouldBeTransparent ? "text-white hover:text-primary-200" : "text-gray-700 hover:text-primary-600"}`}>
									<span className="text-xs">Bonjour, Identifiez-vous</span>
									<span className="text-sm font-bold">Compte et Listes ▼</span>
								</Link>
							</div>
						)}

						{/* Panier */}
						{(!isAuthenticated ||
							(user?.userType !== "producer" &&
								user?.userType !== "admin")) && (
							<Link
								to="/cart"
								className={`flex items-end ${
									shouldBeTransparent
										? "text-white hover:text-primary-200"
										: "text-gray-700 hover:text-primary-600"
								} transition-colors duration-500 ease-in-out relative px-2`}
								title="Mon panier"
							>
								<div className="relative">
									<ShoppingCart className="h-8 w-8" />
									<span className="absolute -top-2 left-3 font-bold text-primary-500 text-sm">
										{totalItems}
									</span>
								</div>
								<span className="hidden md:inline font-bold text-sm ml-1 mb-1">Panier</span>
							</Link>
						)}
					</div>
				</div>
			</div>

			{/* Bottom Tier - Secondary Navigation */}
			<div className={`hidden md:flex items-center px-4 sm:px-6 lg:px-8 h-10 text-sm ${shouldBeTransparent ? 'bg-black/20 text-white' : 'bg-primary-600 text-white'}`}>
				<nav className="flex items-center space-x-1">
					{mainNavigation.map((item) => (
						<Link
							key={item.name}
							to={item.href}
							className="px-2 py-1 hover:border-white border border-transparent rounded-sm whitespace-nowrap"
						>
							{item.name}
						</Link>
					))}
				</nav>
			</div>

			{/* Menu mobile (Sidebar) */}
			<div
				className={`md:hidden fixed inset-0 z-50 transition-transform duration-300 ease-in-out ${
					isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				{/* Overlay */}
				<div
					className={`absolute inset-0 bg-black transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-50" : "opacity-0"}`}
					onClick={() => setIsMobileMenuOpen(false)}
				/>

				{/* Menu panel */}
				<div className="absolute left-0 top-0 h-full w-80 max-w-[80%] bg-white shadow-xl overflow-y-auto">
					{/* Header du menu mobile (style Amazon Hello) */}
					<div className="flex items-center justify-between p-4 bg-primary-600 text-white">
						<Link to={isAuthenticated ? "/dashboard" : "/login"} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center text-lg font-bold">
							<User className="h-6 w-6 mr-2 bg-white text-primary-600 rounded-full p-1" /> 
							Bonjour, {isAuthenticated ? user?.firstName : "Identifiez-vous"}
						</Link>
						<button
							onClick={() => setIsMobileMenuOpen(false)}
							className="p-1 text-white hover:text-gray-200 transition-colors"
						>
							<X className="h-6 w-6" />
						</button>
					</div>

					<div className="py-2">
						<div className="px-4 py-2 font-bold text-lg text-gray-900">Tendances</div>
						{mainNavigation.map((item) => (
							<Link
								key={item.name}
								to={item.href}
								className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								{item.name}
							</Link>
						))}

						<hr className="my-2 border-gray-300" />
						
						<div className="px-4 py-2 font-bold text-lg text-gray-900">Aide & Paramètres</div>
						<div className="px-4 py-2 flex items-center">
							<select
								value={currency}
								onChange={(e) => setCurrency(e.target.value)}
								className="bg-transparent text-base border-none focus:ring-0 cursor-pointer text-gray-700 w-full"
							>
								{currencies.map((c) => (
									<option key={c.code} value={c.code}>Devise: {c.code}</option>
								))}
							</select>
						</div>
						{!isAuthenticated ? (
							<Link
								to="/login"
								className="block px-4 py-3 text-base text-gray-700 hover:bg-gray-100"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								Connexion
							</Link>
						) : (
							<button
								onClick={() => {
									setIsMobileMenuOpen(false);
									handleLogout();
								}}
								className="w-full text-left px-4 py-3 text-base text-gray-700 hover:bg-gray-100"
							>
								Déconnexion
							</button>
						)}
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
