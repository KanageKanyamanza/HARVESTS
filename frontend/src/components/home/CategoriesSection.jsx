import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Wheat, Carrot, Apple, Bean, Flame, Leaf, Sprout, Milk, Beef, Drumstick, Fish, Archive, CupSoda, Package } from "lucide-react";
import CloudinaryImage from "../common/CloudinaryImage";
import LoadingSpinner from "../common/LoadingSpinner";
import { productService } from "../../services";

const ALL_CATEGORIES = [
	"fruits", "vegetables", "cereals", "meat", "dairy", "fish",
	"poultry", "processed-foods", "legumes", "tubers", "spices",
	"herbs", "nuts", "seeds", "beverages", "other",
];

const LABELS = {
	cereals: "Céréales", vegetables: "Légumes", fruits: "Fruits",
	legumes: "Légumineuses", tubers: "Tubercules", spices: "Épices",
	herbs: "Herbes", nuts: "Noix", seeds: "Graines", dairy: "Produits Laitiers",
	meat: "Viande", poultry: "Volaille", fish: "Poisson",
	"processed-foods": "Produits Transformés", beverages: "Boissons", other: "Autre",
};

const ICONS = {
	cereals: Wheat, vegetables: Carrot, fruits: Apple, legumes: Bean,
	tubers: Carrot, spices: Flame, herbs: Leaf, nuts: Package, seeds: Sprout,
	dairy: Milk, meat: Beef, poultry: Drumstick, fish: Fish,
	"processed-foods": Archive, beverages: CupSoda, other: Package,
};

const CARD_WIDTH = 300; // px
const CARD_GAP = 20;    // px
const SCROLL_SPEED = 0.5; // px per frame

const CategoriesSection = () => {
	const [visibleCategories, setVisibleCategories] = useState([]);
	const [categoryProducts, setCategoryProducts] = useState({});
	const [loading, setLoading] = useState(true);

	const scrollRef = useRef(null);
	const animRef = useRef(null);
	const posRef = useRef(0);
	const pausedRef = useRef(false);

	const loadCategories = useCallback(async () => {
		setLoading(true);
		try {
			let cats = ALL_CATEGORIES;
			try {
				const resp = await productService.getCategories();
				if (resp.data.status === "success" && resp.data.data?.length > 0) {
					cats = resp.data.data;
				}
			} catch {}

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

			setCategoryProducts(products);
			setVisibleCategories(visible);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadCategories();
	}, [loadCategories]);

	// Défilement automatique lent — s'arrête au survol
	useEffect(() => {
		const el = scrollRef.current;
		if (!el || visibleCategories.length === 0) return;

		posRef.current = 0;

		const tick = () => {
			if (!pausedRef.current) {
				posRef.current += SCROLL_SPEED;
				const half = (CARD_WIDTH + CARD_GAP) * visibleCategories.length;
				if (posRef.current >= half) posRef.current = 0;
				el.scrollLeft = posRef.current;
			}
			animRef.current = requestAnimationFrame(tick);
		};

		animRef.current = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(animRef.current);
	}, [visibleCategories]);

	if (loading) {
		return (
			<section className="relative z-20 px-4 sm:px-6 lg:px-8 max-w-[1500px] mx-auto mb-8">
				<div className="flex justify-center items-center py-10 bg-white rounded-lg shadow-sm">
					<LoadingSpinner />
				</div>
			</section>
		);
	}

	if (visibleCategories.length === 0) return null;

	// Dupliquer pour boucle infinie seamless
	const loopItems = [...visibleCategories, ...visibleCategories];

	return (
		<section
			className="relative z-20 px-4 sm:px-6 lg:px-8 max-w-[1500px] mx-auto mb-8"
			data-aos="fade-up"
		>
			<div
				ref={scrollRef}
				className="flex overflow-x-hidden gap-5 scrollbar-hide"
				style={{ cursor: "default" }}
				onMouseEnter={() => { pausedRef.current = true; }}
				onMouseLeave={() => { pausedRef.current = false; }}
			>
				{loopItems.map((category, idx) => {
					const product = categoryProducts[category];
					const primaryImage =
						product?.images?.find((img) => img.isPrimary) ||
						product?.images?.[0];
					const Icon = ICONS[category] || Package;

					return (
						<div
							key={`${category}-${idx}`}
							className="bg-white p-5 flex flex-col shadow-sm rounded-sm z-10 h-[420px] flex-none"
							style={{ width: CARD_WIDTH }}
						>
							<h3 className="text-xl font-bold mb-4 text-gray-900">
								{LABELS[category] || category}
							</h3>

							<div className="flex-1 bg-gray-50 mb-4 flex items-center justify-center overflow-hidden">
								{primaryImage ? (
									<Link to={`/categories/${category}`} className="w-full h-full block">
										<CloudinaryImage
											src={primaryImage.url}
											alt={LABELS[category] || category}
											className="w-full h-full object-cover hover:opacity-90 transition-opacity"
											width={400}
											height={300}
											quality="auto"
											crop="fill"
										/>
									</Link>
								) : (
									<Link
										to={`/categories/${category}`}
										className="w-full h-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
									>
										<Icon size={80} className="text-gray-400" />
									</Link>
								)}
							</div>

							<Link
								to={`/categories/${category}`}
								className="text-primary-600 text-sm font-medium hover:text-primary-800 hover:underline"
							>
								Découvrir la catégorie
							</Link>
						</div>
					);
				})}
			</div>
		</section>
	);
};

export default CategoriesSection;
