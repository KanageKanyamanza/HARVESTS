import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, ArrowRight, Loader2 } from "lucide-react";
import SocialLinks from "../common/SocialLinks";
import { getConfig } from "../../config/production";
import { useAuth } from "../../hooks/useAuth";
import { productService } from "../../services/productService";
import logo from "../../assets/logo.png";

const CATEGORY_LABELS = {
	fruits: "Fruits",
	vegetables: "Légumes",
	cereals: "Céréales",
	meat: "Viande",
	dairy: "Produits Laitiers",
	processed: "Produits Transformés",
	spices: "Épices",
};

const Footer = () => {
	const { user, isAuthenticated } = useAuth();
	const [categories, setCategories] = useState([]);
	const [categoryIndex, setCategoryIndex] = useState(0);
	const [email, setEmail] = useState("");
	const [subscribeStatus, setSubscribeStatus] = useState("idle");
	const [subscribeMessage, setSubscribeMessage] = useState("");

	const currentYear = new Date().getFullYear();

	const contactInfo = {
		address: "Dakar, Sénégal",
		email: "contact@harvests.site",
		phones: ["+221 78 834 69 69"],
	};

	const footerLinks = {
		help: [
			{ name: "À propos", href: "/about" },
			{ name: "Contact", href: "/contact" },
			{ name: "Tarifs", href: "/pricing" },
			{ name: "Investisseurs", href: "/investisseurs" },
			{ name: "FAQs", href: "/help" },
			{ name: "Conditions d'utilisation", href: "/terms" },
			{ name: "Politique de confidentialité", href: "/privacy" },
		],
	};

	const handleSubscribe = async (e) => {
		e.preventDefault();
		if (!email) return;

		setSubscribeStatus("loading");
		try {
			const { API_BASE_URL } = getConfig();
			const baseUrl = API_BASE_URL.replace(/\/api\/v1$/, "");

			const response = await fetch(`${baseUrl}/api/v1/newsletter/subscribe`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});
			const data = await response.json();

			if (response.ok) {
				setSubscribeStatus("success");
				setSubscribeMessage(data.message);
				setEmail("");
				setTimeout(() => {
					setSubscribeMessage("");
					setSubscribeStatus("idle");
				}, 5000);
			} else {
				setSubscribeStatus("error");
				setSubscribeMessage(data.message || "Une erreur est survenue.");
			}
		} catch (error) {
			setSubscribeStatus("error");
			setSubscribeMessage("Erreur de connexion.");
		}
	};

	const myAccountLinks = useMemo(() => {
		if (!isAuthenticated) {
			return [
				{ name: "Connexion", href: "/login" },
				{ name: "Inscription", href: "/register" },
				{ name: "Panier", href: "/cart" },
			];
		}

		const userType = user?.userType || "consumer";
		const basePath = `/${userType}/dashboard`;

		const commonLinks = [
			{ name: "Mon Compte", href: basePath },
			{ name: "Profil", href: `${basePath}/profile` },
		];

		switch (userType) {
			case "producer":
			case "transformer":
				return [
					...commonLinks,
					{ name: "Mes Produits", href: `${basePath}/products` },
					{ name: "Mes Commandes", href: `${basePath}/orders` },
				];
			case "restaurateur":
				return [
					...commonLinks,
					{ name: "Mes Plats", href: `${basePath}/dishes` },
					{ name: "Mes Commandes", href: `${basePath}/orders` },
				];
			case "transporter":
				return [
					...commonLinks,
					{ name: "Mes Livraisons", href: `${basePath}/deliveries` },
				];
			case "consumer":
			default:
				return [
					...commonLinks,
					{ name: "Mes Commandes", href: `${basePath}/orders` },
					{ name: "Panier", href: "/cart" },
					{ name: "Favoris", href: "/favorites" },
				];
		}
	}, [isAuthenticated, user?.userType]);

	useEffect(() => {
		const loadCategories = async () => {
			try {
				const response = await productService.getCategories();
				if (response.data.status === "success") {
					setCategories(response.data.data || []);
				}
			} catch (error) {
				console.error("Erreur chargement catégories:", error);
			}
		};
		loadCategories();
	}, []);

	useEffect(() => {
		if (categories.length <= 4) return;

		const interval = setInterval(() => {
			setCategoryIndex((prev) => (prev + 4) % categories.length);
		}, 180000);

		return () => clearInterval(interval);
	}, [categories.length]);

	const displayedCategories = useMemo(() => {
		if (categories.length === 0) {
			return [
				{ name: "Fruits", slug: "fruits" },
				{ name: "Légumes", slug: "vegetables" },
				{ name: "Céréales", slug: "cereals" },
				{ name: "Viande", slug: "meat" },
			];
		}
		const result = [];
		for (let i = 0; i < 4 && i < categories.length; i++) {
			const idx = (categoryIndex + i) % categories.length;
			const cat = categories[idx];
			result.push({
				name: CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1),
				slug: cat,
			});
		}
		return result;
	}, [categories, categoryIndex]);

	return (
		<footer className="bg-black text-white mb-14 md:mb-0">
			{/* Back to top button (Amazon style) */}
			<div 
				className="bg-gray-800 hover:bg-gray-700 text-center py-4 cursor-pointer text-sm font-medium transition-colors"
				onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
			>
				Retour en haut
			</div>

			<div className="container-xl mx-auto">
				{/* 4-Column Layout */}
				<div className="py-10 px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
					
					{/* Column 1: Contact Info */}
					<div>
						<h3 className="font-bold text-white text-base mb-4 leading-relaxed">UBUNTU BUSINESS BUILDERS (UBB) – SARL</h3>
						<ul className="space-y-3">
							<li className="flex items-start text-gray-400 text-sm">
								<MapPin className="h-5 w-5 mr-3 shrink-0" />
								<span>Dakar, Sénégal</span>
							</li>
							<li className="text-gray-400 text-sm ml-8">
								RCCM : SN.DKR.2026.B.1650
							</li>
							<li className="text-gray-400 text-sm ml-8">
								NINEA : 012753069
							</li>
							<li className="flex items-center text-gray-400 text-sm">
								<Phone className="h-5 w-5 mr-3 shrink-0" />
								<a href="tel:+221788346969" className="hover:text-white transition-colors">+221 78 834 69 69</a>
							</li>
							<li className="flex items-center text-gray-400 text-sm">
								<Mail className="h-5 w-5 mr-3 shrink-0" />
								<a href="mailto:contact@harvests.site" className="hover:text-white transition-colors">contact@harvests.site</a>
							</li>
						</ul>
					</div>

					{/* Column 2: Gagnez de l'argent avec nous */}
					<div>
						<h3 className="font-bold text-white text-base mb-4">Gagnez de l'argent avec nous</h3>
						<ul className="space-y-2">
							<li><Link to="/register" className="text-gray-300 hover:underline text-sm">Devenir Producteur</Link></li>
							<li><Link to="/register" className="text-gray-300 hover:underline text-sm">Devenir Transporteur</Link></li>
							<li><Link to="/producteurs" className="text-gray-300 hover:underline text-sm">Nos partenaires</Link></li>
							<li><Link to="/pricing" className="text-gray-300 hover:underline text-sm">Tarifs et commissions</Link></li>
						</ul>
					</div>

					{/* Column 3: Catégories & Découverte */}
					<div>
						<h3 className="font-bold text-white text-base mb-4">Catégories & Découverte</h3>
						<ul className="space-y-2">
							{displayedCategories.map((cat) => (
								<li key={cat.slug}>
									<Link
										to={`/categories/${cat.slug}`}
										className="text-gray-300 hover:underline text-sm"
									>
										{cat.name}
									</Link>
								</li>
							))}
							<li><Link to="/categories" className="text-gray-300 hover:underline text-sm">Voir toutes les catégories</Link></li>
						</ul>
					</div>

					{/* Column 4: Besoin d'aide ? */}
					<div>
						<h3 className="font-bold text-white text-base mb-4">Besoin d'aide ?</h3>
						<ul className="space-y-2">
							{myAccountLinks.map((link) => (
								<li key={link.name}>
									<Link
										to={link.href}
										className="text-gray-300 hover:underline text-sm"
									>
										{link.name}
									</Link>
								</li>
							))}
							{footerLinks.help.slice(3).map((link) => ( // FAQs, Conditions, Privacy
								<li key={link.name}>
									<Link
										to={link.href}
										className="text-gray-300 hover:underline text-sm"
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="border-t border-gray-800 py-8 px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col items-center gap-6">
						{/* Logo and Selectors */}
						<div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
							<Link to="/">
								<img src={logo} alt="Harvests Logo" className="h-8 w-auto" />
							</Link>
							
							<div className="flex items-center gap-4">
								<div className="border border-gray-500 rounded px-3 py-2 flex items-center cursor-pointer hover:border-white transition-colors">
									<span className="text-sm text-gray-300">Français</span>
								</div>
								<div className="border border-gray-500 rounded px-3 py-2 flex items-center cursor-pointer hover:border-white transition-colors">
									<span className="text-sm text-gray-300 font-bold">FCFA - Franc CFA</span>
								</div>
							</div>
						</div>

						{/* Newsletter (moved below selectors) */}
						<div className="w-full max-w-md">
							<h4 className="text-sm font-semibold mb-2 text-center text-white">
								Restez informé(e) de nos actualités
							</h4>
							<form onSubmit={handleSubscribe} className="relative">
								<div className="flex">
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="Votre adresse e-mail"
										className="w-full bg-white text-black text-sm px-4 py-2 rounded-l focus:outline-none focus:ring-2 focus:ring-primary-500 border-none"
										required
									/>
									<button
										type="submit"
										disabled={subscribeStatus === "loading"}
										className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-r transition-colors flex items-center justify-center min-w-[100px] font-bold text-sm"
									>
										{subscribeStatus === "loading" ?
											<Loader2 className="h-4 w-4 animate-spin" />
										:	"S'inscrire"}
									</button>
								</div>
								{subscribeMessage && (
									<p
										className={`text-xs mt-2 text-center ${
											subscribeStatus === "success" ? "text-green-400" : "text-red-400"
										}`}
									>
										{subscribeMessage}
									</p>
								)}
							</form>
						</div>
					</div>
				</div>

				{/* Bottom Links & Copyright */}
				<div className="bg-black py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
					<div className="flex flex-col items-center gap-4 text-center">
						<div className="flex flex-wrap justify-center gap-4 text-xs text-gray-300">
							<Link to="/terms" className="hover:underline">Conditions générales de vente</Link>
							<Link to="/privacy" className="hover:underline">Vos informations personnelles</Link>
							<Link to="/cookies" className="hover:underline">Cookies</Link>
							<Link to="/ads" className="hover:underline">Annonces basées sur vos centres d'intérêt</Link>
						</div>
						<div className="text-xs text-gray-400 flex flex-col md:flex-row items-center gap-2">
							<span>© {currentYear} Harvests. Tous droits réservés.</span>
							<span className="hidden md:inline">|</span>
							<span className="flex items-center">Un produit de <span className="text-yellow-200 font-bold ml-1"> UBB </span></span>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
