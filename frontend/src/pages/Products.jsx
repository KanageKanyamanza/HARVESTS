import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SEOHead from "../components/seo/SEOHead";
import ProductCard from "../components/products/ProductCard";
import ProductFilters from "../components/products/ProductFilters";
import ProductPagination from "../components/products/ProductPagination";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useProducts } from "../hooks/useProducts";
import { useProductURL } from "../hooks/useProductURL";
import { getCategoryLabel } from "../utils/productHelpers";
import { FiPackage } from "react-icons/fi";

const Products = () => {
	const navigate = useNavigate();
	const [showFilters, setShowFilters] = useState(false);
	const baseUrl = (
		import.meta.env.VITE_FRONTEND_URL ||
		(typeof window !== "undefined" ? window.location.origin : "") ||
		""
	).replace(/\/$/, "");

	const {
		products,
		categories,
		loading,
		error,
		isSearching,
		searchQuery,
		setSearchQuery,
		selectedCategory,
		sortBy,
		isFeatured,
		priceRange,
		currentPage,
		setCurrentPage,
		totalPages,
		totalProducts,
		handleFilterChange,
		clearFilters,
		loadProducts,
	} = useProducts();

	// Synchronisation URL (utilise les valeurs debouncées internes)
	useProductURL(
		searchQuery, // Le hook useProducts gère déjà le debounce
		selectedCategory,
		sortBy,
		isFeatured,
		priceRange,
		currentPage,
	);

	const handleClearFilters = () => {
		clearFilters();
		navigate("/products");
	};

	const pageTitle =
		selectedCategory ? `Produits : ${getCategoryLabel(selectedCategory)}`
		: isFeatured ? "Produits mis en avant"
		: "Nos produits";

	const pageDescription =
		selectedCategory ?
			`Découvrez notre sélection de ${getCategoryLabel(selectedCategory).toLowerCase()} : produits frais, circuits courts et logistique fiable.`
		: isFeatured ?
			"Nos produits mis en avant : qualité, fraîcheur et livraison rapide avec Harvests."
		:	"Parcourez tous les produits Harvests : qualité, fraîcheur et livraison assurée.";

	const canonicalUrl = `${baseUrl || "https://www.harvests.site"}/products`;

	if (loading && products.length === 0) {
		return (
			<div className="min-h-screen bg-harvests-light flex items-center justify-center">
				<LoadingSpinner />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-harvests-light">
			<SEOHead title={pageTitle} description={pageDescription} />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* En-tête */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						{selectedCategory ?
							getCategoryLabel(selectedCategory)
						: isFeatured ?
							"Produits Mis en Avant"
						:	"Nos Produits"}
					</h1>
					<p className="text-gray-600">
						{selectedCategory ?
							`Découvrez notre sélection de ${getCategoryLabel(
								selectedCategory,
							).toLowerCase()}`
						: isFeatured ?
							"Découvrez notre sélection de produits mis en avant"
						:	"Découvrez nos produits frais et de qualité"}
						{totalProducts > 0 && ` (${totalProducts} produits)`}
					</p>
				</div>

				{/* Barre de recherche et filtres */}
				<ProductFilters
					showFilters={showFilters}
					setShowFilters={setShowFilters}
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					selectedCategory={selectedCategory}
					sortBy={sortBy}
					priceRange={priceRange}
					categories={categories}
					onFilterChange={handleFilterChange}
					onClearFilters={handleClearFilters}
					onPageReset={() => setCurrentPage(1)}
				/>

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
				{error ?
					<div className="text-center py-12">
						<div className="text-red-600 mb-4">{error}</div>
						<button
							onClick={loadProducts}
							className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
						>
							Réessayer
						</button>
					</div>
				: products.length > 0 ?
					<>
						<div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{products.map((product) => (
								<ProductCard key={product._id} product={product} />
							))}
						</div>

						{/* Pagination */}
						<ProductPagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
						/>
					</>
				:	<div className="text-center py-12">
						<FiPackage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							Aucun produit trouvé
						</h3>
						<p className="text-gray-500 mb-4">
							{(
								searchQuery ||
								selectedCategory ||
								isFeatured ||
								priceRange.min ||
								priceRange.max
							) ?
								"Essayez de modifier vos critères de recherche"
							:	"Aucun produit disponible pour le moment"}
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
				}
			</div>
		</div>
	);
};

export default Products;
