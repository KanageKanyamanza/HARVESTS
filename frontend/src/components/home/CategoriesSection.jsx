import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Wheat, Carrot, Apple, Bean, Flame, Leaf, Sprout, Milk, Beef, Drumstick, Fish, Archive, CupSoda, Package, ArrowRight, Grid } from "lucide-react";
import CloudinaryImage from "../common/CloudinaryImage";
import LoadingSpinner from "../common/LoadingSpinner";
import { productService } from "../../services";

const ALL_CATEGORIES = [
	"fruits", "vegetables", "cereals", "meat", "dairy", "fish",
	"poultry", "processed-foods", "legumes", "tubers", "spices",
	"herbs", "nuts", "seeds", "beverages", "other",
];

const LABELS = {
	cereals: "Céréales & Grains", vegetables: "Légumes Frais", fruits: "Fruits de Saison",
	legumes: "Légumineuses", tubers: "Tubercules & Racines", spices: "Épices Locales",
	herbs: "Herbes Aromatiques", nuts: "Noix & Anacarde", seeds: "Graines & Semences", dairy: "Produits Laitiers",
	meat: "Viande Bovine & Ovine", poultry: "Volaille Bio", fish: "Poisson & Halieutique",
	"processed-foods": "Produits Transformés", beverages: "Jus & Boissons", other: "Épicerie & Produits Divers",
};

const ICONS = {
	cereals: Wheat, vegetables: Carrot, fruits: Apple, legumes: Bean,
	tubers: Carrot, spices: Flame, herbs: Leaf, nuts: Package, seeds: Sprout,
	dairy: Milk, meat: Beef, poultry: Drumstick, fish: Fish,
	"processed-foods": Archive, beverages: CupSoda, other: Package,
};

// Fallback high quality agritech images for categories
const CATEGORY_FALLBACK_IMAGES = {
	spices: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop",
	tubers: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop",
	vegetables: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop",
	other: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&auto=format&fit=crop",
	fruits: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop",
	cereals: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop",
	poultry: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&auto=format&fit=crop",
	"processed-foods": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop"
};

// Cache au niveau module : survit aux montages/démontages du composant
// (ex: navigation depuis/vers la home) pour éviter de refaire 8-16 requêtes
// à chaque retour sur la page d'accueil.
const CACHE_DURATION = 5 * 60 * 1000;
let sectionCache = null;

const CategoriesSection = () => {
	const [visibleCategories, setVisibleCategories] = useState([]);
	const [categoryProducts, setCategoryProducts] = useState({});
	const [loading, setLoading] = useState(true);

	const loadCategories = useCallback(async () => {
		// Servir depuis le cache module si encore valide (évite de refaire
		// 8 requêtes à chaque retour sur la home)
		if (sectionCache && Date.now() - sectionCache.timestamp < CACHE_DURATION) {
			setCategoryProducts(sectionCache.products);
			setVisibleCategories(sectionCache.visibleCategories);
			setLoading(false);
			return;
		}

		setLoading(true);
		try {
			let cats = ALL_CATEGORIES;
			try {
				const resp = await productService.getCategories();
				if (resp.data.status === "success" && resp.data.data?.length > 0) {
					cats = resp.data.data;
				}
			} catch {}

			// Limiter à 8 catégories interrogées en parallèle : on n'en
			// affiche que 4, inutile de saturer l'API avec 16 requêtes.
			cats = cats.slice(0, 8);

			const results = await Promise.allSettled(
				cats.map((cat) => productService.getProductsByCategory(cat, { limit: 1 }))
			);

			const products = {};
			const visible = [];
			results.forEach((result, i) => {
				if (result.status === "fulfilled") {
					const prods = result.value?.data?.data?.products || [];
					if (prods.length > 0) {
						products[cats[i]] = prods[0];
						visible.push(cats[i]);
					}
				}
			});

			// If empty, use top 4 default categories
			const displayCats = visible.length >= 4 ? visible.slice(0, 8) : ["spices", "tubers", "vegetables", "other"];

			sectionCache = {
				products,
				visibleCategories: displayCats,
				timestamp: Date.now(),
			};

			setCategoryProducts(products);
			setVisibleCategories(displayCats);
		} catch {
			setVisibleCategories(["spices", "tubers", "vegetables", "other"]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadCategories();
	}, [loadCategories]);

	if (loading) {
		return (
			<section className="my-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
				<div className="flex justify-center items-center py-12 bg-white rounded-2xl shadow-agri-card border border-emerald-100">
					<LoadingSpinner />
				</div>
			</section>
		);
	}

	return (
		<section
			className="md:bg-white my-6 p-0 sm:p-6 mx-4 sm:mx-6 lg:mx-8 max-w-7xl lg:mx-auto md:rounded-2xl md:shadow-agri-card md:border border-emerald-100/80 relative z-10"
			data-aos="fade-up"
		>
			<div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
				<div>
					<div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1A5514] uppercase tracking-wider mb-1">
						<Grid className="w-4 h-4 text-[#31BC2E]" />
						<span>Filières Agricoles & Produits</span>
					</div>
					<h2 className="text-2xl sm:text-3xl font-extrabold text-[#161D14]">
						Catégories Populaires du Marketplace
					</h2>
					<p className="text-sm text-gray-600 mt-0.5">Découvrez nos produits classés par filière d'approvisionnement</p>
				</div>
				<Link to="/categories" className="hidden md:flex text-xs sm:text-sm font-bold text-[#1A5514] hover:text-[#31BC2E] transition-colors items-center gap-1">
					Voir toutes les catégories →
				</Link>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
				{visibleCategories.slice(0, 4).map((category) => {
					const product = categoryProducts[category];
					const primaryImage =
						product?.primaryImage?.url ||
						product?.images?.find((img) => img.isPrimary)?.url ||
						product?.images?.[0]?.url ||
						CATEGORY_FALLBACK_IMAGES[category] ||
						"https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop";

					const Icon = ICONS[category] || Package;

					return (
						<Link
							key={category}
							to={`/categories/${category}`}
							className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1 flex flex-col overflow-hidden"
						>
							<div className="p-3.5 sm:p-4 flex items-center justify-between border-b border-gray-100 bg-[#F8FAF6] group-hover:bg-emerald-50/50 transition-colors">
								<h3 className="text-base sm:text-lg font-extrabold text-[#161D14] group-hover:text-[#1A5514] transition-colors">
									{LABELS[category] || category}
								</h3>
								<div className="w-8 h-8 rounded-xl bg-white border border-emerald-200/60 flex items-center justify-center shadow-sm">
									<Icon className="w-4 h-4 text-[#1A5514]" />
								</div>
							</div>

							<div className="relative h-48 sm:h-56 w-full overflow-hidden bg-gray-100">
								<img
									src={primaryImage}
									alt={LABELS[category] || category}
									className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							</div>

							<div className="p-3.5 bg-white flex items-center justify-between font-bold text-xs text-[#1A5514] group-hover:text-[#31BC2E]">
								<span>Découvrir la filière</span>
								<ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
							</div>
						</Link>
					);
				})}
			</div>

			<div className="md:hidden mx-auto text-center p-2 my-5">
				<Link
					to="/categories"
					className="text-xs sm:text-sm font-bold text-white hover:text-[#31BC2E] transition-colors bg-[#1A5514] rounded-full p-3 w-64 mx-auto flex items-center justify-center gap-1"
				>
					Voir toutes les catégories →
				</Link>
			</div>
		</section>
	);
};

export default CategoriesSection;
