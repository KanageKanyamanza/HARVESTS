import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Wheat, Carrot, Apple, Bean, Flame, Leaf, Sprout, Milk, Beef, Drumstick, Fish, Archive, CupSoda, Package } from "lucide-react";
import CloudinaryImage from "../common/CloudinaryImage";
import LoadingSpinner from "../common/LoadingSpinner";
import { productService } from "../../services";

// Catégories par défaut si l'API échoue
const DEFAULT_CATEGORIES = [
	"fruits",
	"vegetables",
	"cereals",
	"meat",
	"dairy",
	"fish",
	"poultry",
	"processed-foods",
];

const CategoriesSection = () => {
	const [allCategories, setAllCategories] = useState(DEFAULT_CATEGORIES);
	const [displayedCategories, setDisplayedCategories] = useState(
		DEFAULT_CATEGORIES.slice(0, 4),
	);
	const [categoryProducts, setCategoryProducts] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const categoryIndexRef = useRef(0);

	const getCategoryLabel = (category) => {
		const labels = {
			cereals: "Céréales",
			vegetables: "Légumes",
			fruits: "Fruits",
			legumes: "Légumineuses",
			tubers: "Tubercules",
			spices: "Épices",
			herbs: "Herbes",
			nuts: "Noix",
			seeds: "Graines",
			dairy: "Produits Laitiers",
			meat: "Viande",
			poultry: "Volaille",
			fish: "Poisson",
			"processed-foods": "Produits Transformés",
			beverages: "Boissons",
			other: "Autre",
		};
		return labels[category] || category;
	};

	const getCategoryIcon = (category) => {
		const icons = {
			cereals: Wheat,
			vegetables: Carrot,
			fruits: Apple,
			legumes: Bean,
			tubers: Carrot,
			spices: Flame,
			herbs: Leaf,
			nuts: Package,
			seeds: Sprout,
			dairy: Milk,
			meat: Beef,
			poultry: Drumstick,
			fish: Fish,
			"processed-foods": Archive,
			beverages: CupSoda,
			other: Package,
		};
		const Icon = icons[category] || Package;
		return <Icon size={80} className="text-gray-400" />;
	};

	const loadCategoryProduct = async (category) => {
		try {
			const response = await productService.getProductsByCategory(category, {
				limit: 1,
			});
			if (response.data.status === "success") {
				const products = response.data.data.products || [];
				if (products.length > 0) {
					setCategoryProducts((prev) => ({
						...prev,
						[category]: products[0],
					}));
				}
			}
		} catch (error) {
			console.error(
				`Erreur lors du chargement du produit pour ${category}:`,
				error,
			);
		}
	};

	const loadCategories = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			// Charger les catégories depuis l'API
			const response = await productService.getCategories();
			if (
				response.data.status === "success" &&
				response.data.data?.length > 0
			) {
				const cats = response.data.data;
				setAllCategories(cats);

				// Afficher les 4 premières catégories
				const initialCats = cats.slice(0, 4);
				setDisplayedCategories(initialCats);

				// Charger un produit pour chaque catégorie affichée
				await Promise.all(
					initialCats.map((category) => loadCategoryProduct(category)),
				);
			} else {
				// Utiliser les catégories par défaut
				await Promise.all(
					displayedCategories.map((category) => loadCategoryProduct(category)),
				);
			}
		} catch (err) {
			console.error("Erreur lors du chargement des catégories:", err);
			// Utiliser les catégories par défaut en cas d'erreur
			await Promise.all(
				displayedCategories.map((category) => loadCategoryProduct(category)),
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadCategories();
	}, [loadCategories]);

	// Rotation des catégories toutes les 3 minutes
	useEffect(() => {
		if (allCategories.length <= 4) return;

		const interval = setInterval(() => {
			const newIndex = (categoryIndexRef.current + 4) % allCategories.length;
			categoryIndexRef.current = newIndex;

			const newCats = [];
			for (let i = 0; i < 4 && i < allCategories.length; i++) {
				newCats.push(allCategories[(newIndex + i) % allCategories.length]);
			}
			setDisplayedCategories(newCats);

			// Charger les produits pour les nouvelles catégories
			newCats.forEach((cat) => {
				if (!categoryProducts[cat]) {
					loadCategoryProduct(cat);
				}
			});
		}, 180000); // 3 minutes

		return () => clearInterval(interval);
	}, [allCategories, categoryProducts]);

	return (
		<section className="relative z-20 px-4 sm:px-6 lg:px-8 max-w-[1500px] mx-auto mb-8" data-aos="fade-up">
			{loading ? (
				<div className="flex justify-center items-center py-10 bg-white rounded-lg shadow-sm">
					<LoadingSpinner />
				</div>
			) : error ? (
				<div className="text-center py-12 bg-white rounded-lg shadow-sm">
					<div className="text-red-600 mb-4">{error}</div>
					<button
						onClick={loadCategories}
						className="btn bg-primary-500 text-white hover:bg-primary-600"
					>
						Réessayer
					</button>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-h-[450px] sm:max-h-none overflow-y-auto sm:overflow-y-visible pr-1 scrollbar-thin">
					{displayedCategories.map((category) => {
						const product = categoryProducts[category];
						const primaryImage =
							product?.images?.find((img) => img.isPrimary) ||
							product?.images?.[0];

						return (
							<div key={category} className="bg-white p-5 flex flex-col shadow-sm rounded-sm z-10 h-[420px]">
								<h3 className="text-xl font-bold mb-4 text-gray-900">
									{getCategoryLabel(category)}
								</h3>
								
								<div className="flex-1 bg-gray-50 mb-4 flex items-center justify-center overflow-hidden">
									{primaryImage ? (
										<Link to={`/categories/${category}`} className="w-full h-full block">
											<CloudinaryImage
												src={primaryImage.url}
												alt={getCategoryLabel(category)}
												className="w-full h-full object-cover hover:opacity-90 transition-opacity"
												width={400}
												height={300}
												quality="auto"
												crop="fill"
											/>
										</Link>
									) : (
										<Link to={`/categories/${category}`} className="w-full h-full flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors">
											<div className="mb-2 flex justify-center items-center h-full w-full">
												{getCategoryIcon(category)}
											</div>
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
			)}
		</section>
	);
};

export default CategoriesSection;
