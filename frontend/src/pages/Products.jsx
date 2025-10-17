import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { productService } from "../services";
import ProductCard from "../components/products/ProductCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
	FiSearch,
	FiFilter,
	FiChevronDown,
	FiX,
	FiPackage,
} from "react-icons/fi";

const Products = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const { category: categoryFromRoute } = useParams();
	const navigate = useNavigate();

	// États
	const [products, setProducts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showFilters, setShowFilters] = useState(false);
	const [isSearching, setIsSearching] = useState(false);

	// Filtres et recherche - Prioriser le paramètre de route s'il existe
	const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
	const [selectedCategory, setSelectedCategory] = useState(
		categoryFromRoute || searchParams.get("category") || ""
	);
	const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
	const [isFeatured, setIsFeatured] = useState(
		searchParams.get("featured") === "true"
	);
	const [priceRange, setPriceRange] = useState({
		min: searchParams.get("minPrice") || "",
		max: searchParams.get("maxPrice") || "",
	});

	// Pagination
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalProducts, setTotalProducts] = useState(0);
	const productsPerPage = 12;

	// Déclarer les états debouncés en premier
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchParams.get("q") || "");
	const [debouncedPriceRange, setDebouncedPriceRange] = useState({
		min: searchParams.get("minPrice") || "",
		max: searchParams.get("maxPrice") || "",
	});

	const loadProducts = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const params = {
				page: currentPage,
				limit: productsPerPage,
			};

			// Ajouter les paramètres seulement s'ils ont des valeurs valides
			if (debouncedSearchQuery && debouncedSearchQuery.trim() !== "") {
				params.search = debouncedSearchQuery.trim();
			}
			
			if (selectedCategory && selectedCategory !== "") {
				params.category = selectedCategory;
			}
			
			if (debouncedPriceRange.min && debouncedPriceRange.min !== "" && !isNaN(parseFloat(debouncedPriceRange.min))) {
				params.minPrice = parseFloat(debouncedPriceRange.min).toString();
			}
			
			if (debouncedPriceRange.max && debouncedPriceRange.max !== "" && !isNaN(parseFloat(debouncedPriceRange.max))) {
				params.maxPrice = parseFloat(debouncedPriceRange.max).toString();
			}
			
			// Gérer le tri
			if (sortBy && sortBy !== "newest") {
				params.sort = sortBy;
			} else if (sortBy === "newest") {
				params.sort = "-createdAt";
			}

			const response = isFeatured
				? await productService.getFeaturedProducts(params)
				: await productService.getProducts(params);

			if (response.data.status === "success") {
				setProducts(response.data.data.products || []);
				setTotalPages(response.data.pagination?.totalPages || 1);
				setTotalProducts(response.data.pagination?.total || 0);
			}
		} catch (error) {
			console.error("Erreur lors du chargement des produits:", error);
			setError("Erreur lors du chargement des produits");
		} finally {
			setLoading(false);
		}
	}, [
		currentPage,
		selectedCategory,
		sortBy,
		debouncedPriceRange,
		debouncedSearchQuery,
		isFeatured,
		productsPerPage,
	]);

	// Synchroniser les paramètres URL avec l'état local
	useEffect(() => {
		const urlSearchQuery = searchParams.get("q") || "";
		const urlCategory = categoryFromRoute || searchParams.get("category") || "";
		const urlSort = searchParams.get("sort") || "newest";
		const urlFeatured = searchParams.get("featured") === "true";
		const urlPriceRange = {
			min: searchParams.get("minPrice") || "",
			max: searchParams.get("maxPrice") || "",
		};
		const urlPage = parseInt(searchParams.get("page")) || 1;

		setSearchQuery(urlSearchQuery);
		setSelectedCategory(urlCategory);
		setSortBy(urlSort);
		setIsFeatured(urlFeatured);
		setPriceRange(urlPriceRange);
		setCurrentPage(urlPage);

		// Synchroniser aussi les états debouncés
		setDebouncedSearchQuery(urlSearchQuery);
		setDebouncedPriceRange(urlPriceRange);
	}, [searchParams, categoryFromRoute]);

	// Charger les données
	useEffect(() => {
		loadProducts();
		loadCategories();
	}, [loadProducts]);

	const loadCategories = async () => {
		try {
			const response = await productService.getCategories();
			if (response.data.status === "success") {
				setCategories(response.data.data || []);
			}
		} catch (error) {
			console.error("Erreur lors du chargement des catégories:", error);
		}
	};



	// Debounce pour la recherche textuelle
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchQuery(searchQuery);
		}, 1000); // 1 seconde de délai pour la recherche

		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Debounce pour les prix
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedPriceRange(priceRange);
		}, 800); // 800ms pour les prix

		return () => clearTimeout(timer);
	}, [priceRange]);

	// Fonction pour mettre à jour l'URL
	const updateURL = useCallback(() => {
		const params = new URLSearchParams();
		if (debouncedSearchQuery) params.set("q", debouncedSearchQuery);
		if (selectedCategory) params.set("category", selectedCategory);
		if (sortBy !== "newest") params.set("sort", sortBy);
		if (isFeatured) params.set("featured", "true");
		if (debouncedPriceRange.min) params.set("minPrice", debouncedPriceRange.min);
		if (debouncedPriceRange.max) params.set("maxPrice", debouncedPriceRange.max);
		if (currentPage > 1) params.set("page", currentPage);

		// Construire l'URL avec les paramètres
		const newUrl = `/products${params.toString() ? `?${params.toString()}` : ''}`;
		navigate(newUrl, { replace: true });
	}, [debouncedSearchQuery, selectedCategory, sortBy, isFeatured, debouncedPriceRange.min, debouncedPriceRange.max, currentPage, navigate]);

	// Recherche avec debounce pour les valeurs debouncées
	useEffect(() => {
		// Éviter les recherches inutiles au chargement initial
		const hasActiveFilters = debouncedSearchQuery || selectedCategory || debouncedPriceRange.min || debouncedPriceRange.max || isFeatured;
		
		if (hasActiveFilters || currentPage > 1) {
			setIsSearching(true);
			loadProducts().finally(() => setIsSearching(false));
		}
	}, [debouncedSearchQuery, selectedCategory, sortBy, isFeatured, debouncedPriceRange.min, debouncedPriceRange.max, currentPage, loadProducts]);

	// Mise à jour de l'URL avec debounce séparé
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			updateURL();
		}, 1200); // Délai plus long pour l'URL

		return () => clearTimeout(timeoutId);
	}, [updateURL]);

	const handleFilterChange = (filterType, value) => {
		setCurrentPage(1);
		switch (filterType) {
			case "category":
				setSelectedCategory(value);
				break;
			case "sort":
				setSortBy(value);
				break;
			case "priceMin":
				setPriceRange((prev) => ({ ...prev, min: value }));
				break;
			case "priceMax":
				setPriceRange((prev) => ({ ...prev, max: value }));
				break;
			default:
				break;
		}
		// L'URL sera mise à jour par le useEffect avec debounce
	};

	const clearFilters = () => {
		setSearchQuery("");
		setSelectedCategory("");
		setSortBy("newest");
		setIsFeatured(false);
		setPriceRange({ min: "", max: "" });
		setCurrentPage(1);
		setSearchParams({});
		navigate("/products");
	};

	const getCategoryLabel = (category) => {
		const categories = {
			cereals: "Céréales",
			vegetables: "Légumes",
			fruits: "Fruits",
			legumes: "Légumineuses",
			tubers: "Tubercules",
			spices: "Épices",
			herbs: "Herbes",
			grains: "Grains",
			nuts: "Noix",
			seeds: "Graines",
			dairy: "Produits laitiers",
			meat: "Viande",
			poultry: "Volaille",
			fish: "Poisson",
			"processed-foods": "Aliments transformés",
			beverages: "Boissons",
			other: "Autres",
		};
		return categories[category] || category;
	};

	const getSortOptions = () => [
		{ value: "newest", label: "Plus récents" },
		{ value: "createdAt", label: "Plus anciens" },
		{ value: "price", label: "Prix croissant" },
		{ value: "-price", label: "Prix décroissant" },
		{ value: "name.fr", label: "Nom A-Z" },
		{ value: "-name.fr", label: "Nom Z-A" },
		{ value: "-stats.averageRating", label: "Mieux notés" },
		{ value: "-stats.salesCount", label: "Plus populaires" },
	];

	if (loading && products.length === 0) {
		return (
			<div className="min-h-screen bg-harvests-light flex items-center justify-center">
				<LoadingSpinner />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-harvests-light">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* En-tête */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						{selectedCategory
							? getCategoryLabel(selectedCategory)
							: isFeatured
							? "Produits Mis en Avant"
							: "Nos Produits"}
					</h1>
					<p className="text-gray-600">
						{selectedCategory
							? `Découvrez notre sélection de ${getCategoryLabel(
									selectedCategory
							  ).toLowerCase()}`
							: isFeatured
							? "Découvrez notre sélection de produits mis en avant"
							: "Découvrez nos produits frais et de qualité"}
						{totalProducts > 0 && ` (${totalProducts} produits)`}
					</p>
				</div>

				{/* Barre de recherche et filtres */}
				<div className="bg-white gap-2 flex flex-wrap justify-around rounded-lg shadow-sm border p-6 mb-8">
					<div className="w-full md:flex-1">
						<div className="flex flex-col sm:flex-row gap-4">
							<div className="flex-1">
								<div className="relative">
									<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
									<input
										type="text"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										placeholder="Rechercher des produits..."
										className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
									/>
								</div>
							</div>
							{searchQuery && (
								<button
									type="button"
									onClick={() => {
										setSearchQuery("");
										setCurrentPage(1);
									}}
									className="px-4 py-2 bg-harvests-light0 text-white rounded-md hover:bg-gray-600 transition-colors"
								>
									Effacer
								</button>
							)}
						</div>
					</div>

					{/* Filtres */}
					<div className="flex flex-wrap gap-2">
						<button
							onClick={() => setShowFilters(!showFilters)}
							className=" flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-harvests-light"
						>
							<FiFilter className="h-4 w-4 mr-2" />
							Filtres
							<FiChevronDown
								className={`h-4 w-4 ml-2 transition-transform ${
									showFilters ? "rotate-180" : ""
								}`}
							/>
						</button>

						<select
							value={sortBy}
							onChange={(e) => handleFilterChange("sort", e.target.value)}
							className="px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
						>
							{getSortOptions().map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>

						<select
							value={selectedCategory}
							onChange={(e) => handleFilterChange("category", e.target.value)}
							className="flex-1 px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
						>
							<option value="">Toutes les catégories</option>
							{categories.map((category) => (
								<option key={category} value={category}>
									{getCategoryLabel(category)}
								</option>
							))}
						</select>

						{(selectedCategory ||
							sortBy !== "newest" ||
							priceRange.min ||
							priceRange.max) && (
							<button
								onClick={clearFilters}
								className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
							>
								<FiX className="h-4 w-4 mr-1" />
								Effacer
							</button>
						)}
					</div>

					{/* Filtres avancés */}
					{showFilters && (
						<div className="mt-6 pt-6 border-t border-gray-200">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Prix minimum (XOF)
									</label>
									<input
										type="number"
										value={priceRange.min}
										onChange={(e) => handleFilterChange("priceMin", e.target.value)}
										placeholder="0"
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Prix maximum (XOF)
									</label>
									<input
										type="number"
										value={priceRange.max}
										onChange={(e) => handleFilterChange("priceMax", e.target.value)}
										placeholder="100000"
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
									/>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Informations de pagination */}
				<div className="flex justify-between items-center mb-6">
					{isSearching && (
						<div className="flex items-center text-sm text-gray-600">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
							Recherche en cours...
						</div>
					)}
					<div className="text-sm text-gray-600">
						Affichage de {products.length} produit
						{products.length > 1 ? "s" : ""} • Page {currentPage} sur{" "}
						{totalPages}
					</div>
				</div>

				{/* Liste des produits */}
				{error ? (
					<div className="text-center py-12">
						<div className="text-red-600 mb-4">{error}</div>
						<button
							onClick={loadProducts}
							className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
						>
							Réessayer
						</button>
					</div>
				) : products.length > 0 ? (
					<>
						<div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{products.map((product) => (
								<ProductCard key={product._id} product={product} />
							))}
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="mt-8 flex justify-center">
								<nav className="flex items-center space-x-2">
									<button
										onClick={() => {
											const newPage = Math.max(1, currentPage - 1);
											setCurrentPage(newPage);
										}}
										disabled={currentPage === 1}
										className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-harvests-light disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Précédent
									</button>

									{[...Array(totalPages)].map((_, i) => {
										const page = i + 1;
										const isCurrentPage = page === currentPage;
										const isNearCurrent = Math.abs(page - currentPage) <= 2;
										const isFirstOrLast = page === 1 || page === totalPages;

										if (!isNearCurrent && !isFirstOrLast) {
											if (page === 2 || page === totalPages - 1) {
												return (
													<span
														key={page}
														className="px-3 py-2 text-sm text-gray-500"
													>
														...
													</span>
												);
											}
											return null;
										}

										return (
											<button
												key={page}
												onClick={() => setCurrentPage(page)}
												className={`px-3 py-2 text-sm font-medium rounded-md ${
													isCurrentPage
														? "bg-green-600 text-white"
														: "text-gray-700 bg-white border border-gray-300 hover:bg-harvests-light"
												}`}
											>
												{page}
											</button>
										);
									})}

									<button
										onClick={() => {
											const newPage = Math.min(totalPages, currentPage + 1);
											setCurrentPage(newPage);
										}}
										disabled={currentPage === totalPages}
										className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-harvests-light disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Suivant
									</button>
								</nav>
							</div>
						)}
					</>
				) : (
					<div className="text-center py-12">
						<FiPackage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							Aucun produit trouvé
						</h3>
						<p className="text-gray-500 mb-4">
							{searchQuery ||
							selectedCategory ||
							isFeatured ||
							priceRange.min ||
							priceRange.max
								? "Essayez de modifier vos critères de recherche"
								: "Aucun produit disponible pour le moment"}
						</p>
						{(searchQuery ||
							selectedCategory ||
							isFeatured ||
							priceRange.min ||
							priceRange.max) && (
							<button
								onClick={clearFilters}
								className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
							>
								Effacer les filtres
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Products;
