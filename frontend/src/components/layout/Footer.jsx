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
		phones: ["+221 771970713", "+221 774536704"],
	};

	const footerLinks = {
		help: [
			{ name: "À propos", href: "/about" },
			{ name: "Contact", href: "/contact" },
			{ name: "Tarifs", href: "/pricing" },
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
				name: CATEGORY_LABELS[cat] || cat,
				slug: cat,
			});
		}
		return result;
	}, [categories, categoryIndex]);

	return (
		<footer className="bg-black text-white">
			<div className="container-xl">
				<div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
					<div className="lg:col-span-1">
						<Link to="/" className="inline-block mb-4">
							<img src={logo} alt="Harvests Logo" className="h-10 w-auto" />
						</Link>
						<p className="text-gray-400 text-sm mb-6">
							Produits agricoles frais.
							<br />
							Partenaires de la chaine de valeur alimentaire.
						</p>

						<div className="space-y-2 text-sm text-gray-400">
							<div className="flex items-center space-x-2">
								<MapPin className="h-4 w-4 flex-shrink-0" />
								<span>{contactInfo.address}</span>
							</div>
							{contactInfo.phones.map((phone, index) => (
								<a
									key={index}
									href={`tel:${phone.replace(/\s/g, "")}`}
									className="flex items-center space-x-2 hover:text-primary-500 transition-colors"
								>
									<Phone className="h-4 w-4 flex-shrink-0" />
									<span>{phone}</span>
								</a>
							))}
							<a
								href={`mailto:${contactInfo.email}`}
								className="flex items-center space-x-2 hover:text-primary-500 transition-colors"
							>
								<Mail className="h-4 w-4 flex-shrink-0" />
								<span>{contactInfo.email}</span>
							</a>
						</div>
					</div>

					<div>
						<h3 className="font-semibold text-white text-base mb-4">
							Mon Compte
						</h3>
						<ul className="space-y-2">
							{myAccountLinks.map((link) => (
								<li key={link.name}>
									<Link
										to={link.href}
										className="text-gray-400 hover:text-primary-500 transition-colors text-sm"
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h3 className="font-semibold text-white text-base mb-4">Aide</h3>
						<ul className="space-y-2">
							{footerLinks.help.map((link) => (
								<li key={link.name}>
									<Link
										to={link.href}
										className="text-gray-400 hover:text-primary-500 transition-colors text-sm"
									>
										{link.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h3 className="font-semibold text-white text-base mb-4">
							Catégories
						</h3>
						<ul className="space-y-2">
							{displayedCategories.map((cat) => (
								<li key={cat.slug}>
									<Link
										to={`/categories/${cat.slug}`}
										className="text-gray-400 hover:text-primary-500 transition-colors text-sm"
									>
										{cat.name}
									</Link>
								</li>
							))}
						</ul>

						<div className="mt-8 pt-6 border-t border-gray-800">
							<h4 className="text-sm font-semibold mb-3 text-white">
								Newsletter
							</h4>
							<p className="text-xs text-gray-400 mb-3">
								Inscrivez-vous pour recevoir nos dernières actualités.
							</p>
							<form onSubmit={handleSubscribe} className="relative">
								<div className="flex">
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="Votre email"
										className="w-full bg-gray-800 text-white text-sm px-4 py-2 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary-500 border border-gray-700 border-r-0 placeholder-gray-500"
										required
									/>
									<button
										type="submit"
										disabled={subscribeStatus === "loading"}
										className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-r-md transition-colors flex items-center justify-center min-w-[40px]"
									>
										{subscribeStatus === "loading" ?
											<Loader2 className="h-4 w-4 animate-spin" />
										:	<ArrowRight className="h-4 w-4" />}
									</button>
								</div>
								{subscribeMessage && (
									<p
										className={`text-xs mt-2 ${
											subscribeStatus === "success" ? "text-green-400" : (
												"text-red-400"
											)
										}`}
									>
										{subscribeMessage}
									</p>
								)}
							</form>
						</div>
					</div>
				</div>

				<div className="py-6 border-t border-gray-800 dark:border-gray-700 justify-center content-center text-center">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
							<p className="text-gray-500 text-sm">
								© {currentYear} Harvests. Tous droits réservés.
							</p>
						</div>

						<div className="flex flex-wrap items-center justify-center content-center gap-2">
							<p className="text-gray-500 text-sm flex items-center">
								Un produit de{" "}
								<span className="text-yellow-200 font-bold ml-1"> UBB </span>
							</p>
							<SocialLinks
								variant="minimal"
								size="sm"
								className="justify-start"
							/>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
