import React, { useState } from "react";
import { createPortal } from "react-dom";
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
	Sprout,
	TrendingUp,
	Leaf,
	Home,
	Grid,
	Newspaper,
	Tag,
	Share2,
	ChevronDown,
	Check,
	Briefcase,
} from "lucide-react";
import logo from "../../assets/logo.png";

import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../contexts/CartContext";
import { useCurrency } from "../../contexts/CurrencyContext.jsx";
import NotificationDropdown from "../notifications/NotificationDropdown";
import SearchModal from "../common/SearchModal";
import { generateUserNavigation } from "../../navigation";
import { getCategoryLabel } from "../../utils/productUtils";

const SEARCH_CATEGORIES = [
	"vegetables", "fruits", "cereals", "meat", "dairy", "fish",
	"poultry", "processed-foods", "legumes", "tubers", "spices",
	"herbs", "nuts", "seeds", "beverages", "other",
];

const Header = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { isAuthenticated, user, logout } = useAuth();
	const { totalItems } = useCart();

	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);
	const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [isCategoryOpen, setIsCategoryOpen] = useState(false);
	const categoryDropdownRef = React.useRef(null);
	const { currency, setCurrency, currencies } = useCurrency();

	const searchCategoryOptions = [
		{ value: "all", label: "Toutes catégories" },
		...SEARCH_CATEGORIES.map((slug) => ({ value: slug, label: getCategoryLabel(slug) })),
	];

	React.useEffect(() => {
		if (!isCategoryOpen) return;
		const handleClickOutsideCategory = (e) => {
			if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
				setIsCategoryOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutsideCategory);
		return () => document.removeEventListener("mousedown", handleClickOutsideCategory);
	}, [isCategoryOpen]);

	const handleSearchSubmit = (e) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
		} else if (selectedCategory && selectedCategory !== "all") {
			navigate(`/products?category=${encodeURIComponent(selectedCategory)}`);
		} else {
			navigate('/products');
		}
	};

	const handleShare = async () => {
		const shareData = {
			title: "Harvests",
			text: "Découvrez Harvests, la marketplace agricole",
			url: window.location.href,
		};
		if (navigator.share) {
			try {
				await navigator.share(shareData);
			} catch (err) {
				if (err?.name !== "AbortError") console.error(err);
			}
		} else {
			navigator.clipboard.writeText(window.location.href);
		}
	};

	const handleCategoryChange = (val) => {
		setSelectedCategory(val);
		setIsCategoryOpen(false);
		if (val && val !== "all") {
			navigate(`/products?category=${encodeURIComponent(val)}`);
		} else {
			navigate('/products');
		}
	};

	// Fermer les menus au clic extérieur
	React.useEffect(() => {
		const handleClickOutside = (event) => {
			// Ne pas fermer si on clique sur le bouton du menu mobile ou à l'intérieur du panneau (portalé dans body)
			if (
				event.target.closest("[data-mobile-menu-button]") ||
				event.target.closest("[data-mobile-menu-panel]")
			) {
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

	// Navbar toujours solide avec fond blanc et barres de navigation lisibles
	const shouldBeTransparent = false;

	// Navigation principale
	const mainNavigation = [
		{ name: "Accueil", href: "/", current: location.pathname === "/", icon: Home },
		{
			name: "Produits",
			href: "/products",
			current: location.pathname === "/products",
			icon: Package,
		},
		{
			name: "Catégories",
			href: "/categories",
			current: location.pathname === "/categories",
			icon: Grid,
		},
		{
			name: "Nos Producteurs",
			href: "/producteurs",
			current: location.pathname === "/producteurs",
			icon: Sprout,
		},
		{ name: "Blog", href: "/blog", current: location.pathname === "/blog", icon: Newspaper },
		{
			name: "Tarifs",
			href: "/pricing",
			current: location.pathname === "/pricing",
			icon: Tag,
		},
		{
			name: "Invest",
			href: "/invest",
			current: location.pathname === "/invest",
			icon: Briefcase,
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
		navigate(`/products/${product.slug || product._id}`);
	};

	const handleLogout = async () => {
		await logout();
		// Utiliser window.location.href pour forcer une navigation complète
		// et éviter les redirections automatiques vers /login
		window.location.href = "/";
	};

	return (
		<header
			className={`${shouldBeTransparent
					? "absolute top-0 left-0 right-0 bg-transparent"
					: "bg-white sticky top-0 border-b border-gray-200"
				} z-40 transition-all duration-500 ease-in-out flex flex-col`}
		>
			{/* Top Tier */}
			<div className="w-full">
				<div className="flex items-center h-16 px-3 sm:px-6 lg:px-8 gap-3 sm:gap-4">
					{/* Groupe gauche : Menu mobile + Logo */}
					<div className="flex items-center gap-3 shrink-0">
						<button
							data-mobile-menu-button
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								setIsMobileMenuOpen(!isMobileMenuOpen);
							}}
							className={`md:hidden ${shouldBeTransparent
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
						<Link to="/" className="flex items-center">
							<img src={logo} alt="Harvests Logo" className="h-9 sm:h-10 w-auto" />
						</Link>
					</div>

					{/* Barre de recherche interactive (Amazon style + Agritech) - Desktop */}
					<form onSubmit={handleSearchSubmit} className="hidden flex-1 lg:flex items-center mx-6 min-w-0">
						<div className="flex w-full min-w-0 rounded-full shadow-sm border border-emerald-200/80 bg-white hover:border-[#1A5514] focus-within:border-[#1A5514] focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all duration-200">
							<div className="relative shrink-0" ref={categoryDropdownRef}>
								<button
									type="button"
									onClick={() => setIsCategoryOpen((o) => !o)}
									className="h-full flex items-center gap-1.5 bg-gray-50 text-gray-800 text-xs font-bold px-3 py-2 border-r border-gray-200 outline-none cursor-pointer hover:bg-gray-100 rounded-l-full transition-colors whitespace-nowrap"
								>
									{searchCategoryOptions.find((o) => o.value === selectedCategory)?.label || "Toutes catégories"}
									<ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform ${isCategoryOpen ? "rotate-180" : ""}`} />
								</button>

								{isCategoryOpen && (
									<div className="absolute z-30 mt-2 left-0 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-black/10 py-2 max-h-80 overflow-y-auto">
										{searchCategoryOptions.map((opt) => (
											<button
												key={opt.value}
												type="button"
												onClick={() => handleCategoryChange(opt.value)}
												className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold text-left transition-colors ${
													selectedCategory === opt.value
														? "bg-emerald-50 text-[#1A5514]"
														: "text-gray-700 hover:bg-gray-50"
												}`}
											>
												{opt.label}
												{selectedCategory === opt.value && <Check className="h-4 w-4 text-[#1A5514]" />}
											</button>
										))}
									</div>
								)}
							</div>
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="flex-1 min-w-0 px-4 py-2 outline-none text-gray-900 bg-white text-sm placeholder-gray-400"
								placeholder="Rechercher des produits agricoles, céréales, fruits, engrais, producteurs..."
							/>
							<button
								type="submit"
								className="bg-[#FF9900] hover:bg-[#e68a00] text-gray-900 px-6 py-2 transition-colors flex items-center justify-center font-bold rounded-r-full"
								aria-label="Rechercher"
							>
								<Search className="h-5 w-5 text-gray-900" />
							</button>
						</div>
					</form>

					{/* Spacer (remplace la barre de recherche masquée sur mobile/tablette) */}
					<div className="flex-1 lg:hidden" />

					{/* Groupe droite : icônes + actions */}
					<div className="flex items-center gap-1 sm:gap-2 shrink-0">
						{/* Icône de recherche - Mobile */}
						<button
							onClick={() => setIsSearchModalOpen(true)}
							className={`lg:hidden ${shouldBeTransparent
									? "text-white hover:text-primary-200"
									: "text-gray-700 hover:text-primary-600"
								} transition-colors duration-500 ease-in-out p-2 hover:bg-gray-100 rounded-lg`}
							aria-label="Rechercher"
						>
							<Search className="h-5 w-5 sm:h-6 sm:w-6" />
						</button>

						{/* Panier */}
						{(!isAuthenticated ||
							(user?.userType !== "producer" &&
								user?.userType !== "admin")) && (
								<Link
									to="/cart"
									className="flex items-center text-gray-800 hover:text-[#1A5514] transition-colors relative p-2 gap-1.5 rounded-lg hover:bg-gray-100"
									title="Mon panier"
								>
									<div className="relative">
										<ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7 text-gray-800" />
										<span className="absolute -top-1.5 -right-1.5 font-black bg-[#FF9900] text-gray-900 text-[11px] h-5 w-5 rounded-full flex items-center justify-center shadow-sm">
											{totalItems}
										</span>
									</div>
									<span className="hidden md:inline font-bold text-xs sm:text-sm text-[#161D14] ml-1">Panier</span>
								</Link>
							)}

						{/* Bouton Partager (partage natif) */}
						<button
							onClick={handleShare}
							className={`${shouldBeTransparent
									? "text-white hover:text-primary-200"
									: "text-gray-700 hover:text-primary-600"
								} transition-colors duration-500 ease-in-out p-2 hover:bg-gray-100 rounded-lg`}
							aria-label="Partager"
							title="Partager"
						>
							<Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
						</button>

					{/* Actions utilisateur */}
					<div className="flex items-center space-x-2 sm:space-x-4">
						{/* Sélecteur de devise */}
						<div className="hidden md:flex items-center">
							<select
								value={currency}
								onChange={(e) => setCurrency(e.target.value)}
								className="bg-gray-50 hover:bg-gray-100 text-xs font-bold border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#1A5514] cursor-pointer py-1.5 px-3 text-gray-800 transition-colors"
							>
								{currencies.map((c) => (
									<option key={c.code} value={c.code} className="text-gray-900 font-semibold">
										{c.code}
									</option>
								))}
							</select>
						</div>

						{isAuthenticated ? (
							<>
								{/* Notifications */}
								<NotificationDropdown
									shouldBeTransparent={false}
								/>

								{/* Menu profil */}
								<div className="relative">
									<button
										onClick={(e) => {
											e.stopPropagation();
											setIsProfileMenuOpen(!isProfileMenuOpen);
										}}
										className="flex items-center space-x-2 text-gray-800 hover:text-[#1A5514] transition-colors"
									>
										<div className="text-left hidden md:block">
											<div className="text-xs text-gray-600">Bonjour, {user?.firstName}</div>
											<div className="text-sm font-bold text-[#161D14]">Compte et Listes ▼</div>
										</div>
										<div className="w-8 h-8 md:hidden bg-emerald-100 rounded-full flex items-center justify-center">
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
											</div>
										</div>
									)}
								</div>

								{/* Bouton Déconnexion (visible sur la navbar) */}
								<button
									onClick={handleLogout}
									className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 px-3 sm:px-4 py-2 rounded-full transition-colors shadow-sm"
									title="Déconnexion"
								>
									<LogOut className="h-4 w-4" />
									<span className="hidden lg:inline">Déconnexion</span>
								</button>
							</>
						) : (
							<div className="flex items-center gap-3">
								<Link to="/login" className="hidden md:flex flex-col text-left text-gray-800 hover:text-[#1A5514] transition-colors">
									<span className="text-[11px] text-gray-500 font-medium">Bonjour, Identifiez-vous</span>
									<span className="text-xs sm:text-sm font-extrabold text-[#161D14]">Compte & Listes ▼</span>
								</Link>
								<Link
									to="/login"
									className="flex lg:hidden items-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#1A5514] to-[#31BC2E] hover:shadow-lg px-3 sm:px-4 py-2 rounded-full transition-all shadow-sm shadow-emerald-900/20"
									title="Connexion"
								>
									<LogIn className="h-4 w-4" />
									<span className="hidden sm:inline">Connexion</span>
								</Link>
							</div>
						)}
					</div>
					</div>
				</div>
			</div>

			{/* Bottom Tier - Secondary Navigation (Agritech Role Navigation) */}
			<div className={`hidden md:flex items-center justify-between px-4 sm:px-6 lg:px-8 h-11 text-xs sm:text-sm font-medium ${shouldBeTransparent ? 'bg-black/30 text-white backdrop-blur-md' : 'bg-[#1A5514] text-white shadow-sm'}`}>
				<nav className="flex items-center space-x-1 sm:space-x-2">
					<span className="bg-[#31BC2E] text-white px-2.5 py-1 rounded-full font-bold text-xs mr-2 flex items-center gap-1.5 shadow-sm">
						<Leaf className="w-3.5 h-3.5" />
						Harvests Agritech
					</span>
					{mainNavigation.map((item) => (
						<Link
							key={item.name}
							to={item.href}
							className="px-3 py-1.5 hover:bg-white/15 rounded-full transition-all duration-200 whitespace-nowrap"
						>
							{item.name}
						</Link>
					))}
				</nav>
				<div className="flex items-center space-x-4 text-xs">
					<Link to="/producteurs" className="hover:text-emerald-300 transition-colors flex items-center gap-1.5">
						<Sprout className="w-3.5 h-3.5 text-emerald-400" />
						Espace Producteurs
					</Link>
					<span className="opacity-40">|</span>
					<Link to="/pricing" className="hover:text-emerald-300 transition-colors flex items-center gap-1.5">
						<TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
						Ventes en Gros (B2B)
					</Link>
				</div>
			</div>

			{/* Menu mobile (Sidebar) — rendu via portal pour passer au-dessus de la bottom nav */}
			{createPortal(
				<div
					data-mobile-menu-panel
					className={`md:hidden fixed inset-0 z-[100] transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
						}`}
				>
					{/* Overlay */}
					<div
						className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`}
						onClick={() => setIsMobileMenuOpen(false)}
					/>

					{/* Menu panel */}
					<div className="absolute left-0 top-0 h-full w-80 max-w-[85%] bg-white shadow-2xl overflow-y-auto flex flex-col">
						{/* Header du menu mobile */}
						<div className="relative shrink-0 bg-gradient-to-br from-[#1A5514] to-[#2E8B22] text-white overflow-hidden">
							<div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
							<div className="relative flex items-start justify-between p-5">
								<Link
									to={isAuthenticated ? "/dashboard" : "/login"}
									onClick={() => setIsMobileMenuOpen(false)}
									className="flex items-center gap-3"
								>
									<div className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center shrink-0">
										<User className="h-5 w-5 text-white" />
									</div>
									<div>
										<p className="text-[11px] font-semibold text-white/80">Bonjour</p>
										<p className="font-extrabold leading-tight">
											{isAuthenticated ? user?.firstName : "Identifiez-vous"}
										</p>
									</div>
								</Link>
								<button
									onClick={() => setIsMobileMenuOpen(false)}
									className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
								>
									<X className="h-5 w-5" />
								</button>
							</div>
						</div>

						<div className="py-3 flex-1">
							<p className="px-5 pt-1 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
								Navigation
							</p>
							{mainNavigation.map((item) => {
								const Icon = item.icon;
								return (
									<Link
										key={item.name}
										to={item.href}
										className={`flex items-center gap-3 px-5 py-3 text-sm font-bold transition-colors ${item.current
												? "text-[#1A5514] bg-emerald-50"
												: "text-gray-700 hover:bg-gray-50"
											}`}
										onClick={() => setIsMobileMenuOpen(false)}
									>
										<div
											className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.current ? "bg-[#1A5514] text-white" : "bg-gray-100 text-gray-500"
												}`}
										>
											{Icon && <Icon className="h-4 w-4" />}
										</div>
										{item.name}
									</Link>
								);
							})}

							<hr className="my-3 border-gray-100" />

							<p className="px-5 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
								Aide &amp; Paramètres
							</p>
							<div className="px-5 py-2 flex items-center">
								<select
									value={currency}
									onChange={(e) => setCurrency(e.target.value)}
									className="bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1A5514] cursor-pointer text-gray-700 w-full px-3 py-2"
								>
									{currencies.map((c) => (
										<option key={c.code} value={c.code}>Devise: {c.code}</option>
									))}
								</select>
							</div>
							{!isAuthenticated ? (
								<div className="px-5 pt-2">
									<Link
										to="/login"
										className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-[#1A5514] to-[#31BC2E] rounded-full shadow-lg shadow-emerald-900/20 hover:shadow-xl transition-all"
										onClick={() => setIsMobileMenuOpen(false)}
									>
										<LogIn className="h-4 w-4" />
										Connexion
									</Link>
								</div>
							) : (
								<button
									onClick={() => {
										setIsMobileMenuOpen(false);
										handleLogout();
									}}
									className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
								>
									<div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
										<LogOut className="h-4 w-4" />
									</div>
									Déconnexion
								</button>
							)}
						</div>
					</div>
				</div>,
				document.body
			)}

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
