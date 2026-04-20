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
	const {
		products,
		restaurateurProducts,
		categories,
		loading,
		isSearching,
		searchQuery,
		setSearchQuery,
		selectedCategory,
		selectedCountry,
		sortBy,
		isFeatured,
		priceRange,
		currentPage,
		setCurrentPage,
		totalPages,
		totalProducts,
		handleFilterChange,
		clearFilters,
	} = useProducts();

	// Synchronisation URL (utilise les valeurs debouncées internes)
	useProductURL(
		searchQuery, // Le hook useProducts gère déjà le debounce
		selectedCategory,
		selectedCountry,
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
		: selectedCountry ? `Produits au ${selectedCountry}`
		: isFeatured ? "Produits mis en avant"
		: "Nos produits";

	const pageDescription =
		selectedCategory ?
			`Découvrez notre sélection de ${getCategoryLabel(selectedCategory).toLowerCase()} : produits frais, circuits courts et logistique fiable.`
		: isFeatured ?
			"Nos produits mis en avant : qualité, fraîcheur et livraison rapide avec Harvests."
		:	"Parcourez tous les produits Harvests : qualité, fraîcheur et livraison assurée.";

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
				<div className="mb-8 rotate-0">
					<h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tighter">
						{selectedCategory ?
							getCategoryLabel(selectedCategory)
						: selectedCountry ?
							`Produits : ${selectedCountry}`
						: isFeatured ?
							"Produits Mis en Avant"
						:	"Nos Produits"}
					</h1>
					<p className="text-gray-600 text-sm font-medium">
						{selectedCategory ?
							`Découvrez notre sélection de ${getCategoryLabel(
								selectedCategory,
							).toLowerCase()}`
						: isFeatured ?
							"Découvrez notre sélection de produits mis en avant"
						:	"Découvrez nos produits frais et de qualité"}
						{totalProducts > 0 && ` (${totalProducts} produits de producteurs)`}
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
					selectedCountry={selectedCountry}
				/>

				{/* Informations de pagination */}
				<div className="flex justify-between items-center mb-6">
					{isSearching && (
						<div className="flex items-center text-sm text-gray-600">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
							Recherche en cours...
						</div>
					)}
					<div className="text-sm text-gray-600 font-bold uppercase tracking-widest text-[10px]">
						Page {currentPage} sur {totalPages}
					</div>
				</div>

				{/* Section 1: Producteurs & Transformateurs */}
				{(products.length > 0 || restaurateurProducts.length > 0) && (
					<div className="mb-12">
						<div className="flex items-center gap-3 mb-8">
							<div className="h-8 w-1.5 bg-green-600 rounded-full"></div>
							<h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
								Produits des Producteurs & Transformateurs
							</h2>
						</div>

						{products.length > 0 ? (
							<>
								<div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
									{products.map((product) => (
										<ProductCard key={product._id} product={product} />
									))}
								</div>
								
								{/* Pagination */}
								{totalPages > 1 && (
									<div className="flex justify-center mt-12 py-8">
										<nav className="flex items-center gap-1">
											{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
												<button
													key={page}
													onClick={() => {
														setCurrentPage(page);
														window.scrollTo({ top: 0, behavior: 'smooth' });
													}}
													className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
														currentPage === page
															? "bg-green-600 text-white"
															: "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
													}`}
												>
													{page}
												</button>
											))}
										</nav>
									</div>
								)}
							</>
						) : (
							<div className="text-center py-12 bg-white/50 rounded-3xl border border-dashed border-gray-200">
								<FiPackage className="mx-auto h-12 w-12 text-gray-300 mb-4" />
								<p className="text-gray-500 font-medium">Aucun produit de producteur trouvé</p>
							</div>
						)}
					</div>
				)}

				{/* Section 2: Restaurateurs */}
				{(restaurateurProducts.length > 0 || (products.length > 0 && !loading)) && (
					<div className="mt-16 pt-16 border-t border-gray-200">
						<div className="flex items-center gap-3 mb-8">
							<div className="h-8 w-1.5 bg-orange-500 rounded-full"></div>
							<h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
								Plats des Restaurateurs
							</h2>
						</div>

						{restaurateurProducts.length > 0 ? (
							<div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{restaurateurProducts.map((product) => (
									<ProductCard key={product._id} product={product} />
								))}
							</div>
						) : (
							<div className="text-center py-12 bg-white/50 rounded-3xl border border-dashed border-gray-200">
								<FiPackage className="mx-auto h-12 w-12 text-gray-300 mb-4" />
								<p className="text-gray-500 font-medium">Aucun plat de restaurateur trouvé</p>
							</div>
						)}
					</div>
				)}

				{(products.length === 0 && restaurateurProducts.length === 0 && !loading) && (
					<div className="text-center py-24 bg-gray-50/50 rounded-3xl border border-dashed border-gray-300">
						<FiPackage className="mx-auto h-16 w-16 text-gray-300 mb-6" />
						<h3 className="text-2xl font-black text-gray-900 mb-2">
							Aucun résultat trouvé
						</h3>
						<p className="text-gray-600 mb-8 max-w-md mx-auto">
							{(
								searchQuery ||
								selectedCategory ||
								selectedCountry ||
								isFeatured ||
								priceRange.min ||
								priceRange.max
							) ?
								`Nous n'avons trouvé aucun produit correspondant à vos filtres actuels${selectedCountry ? ` au ${selectedCountry}` : ''}.`
							:	"Il n'y a aucun produit disponible pour le moment."}
						</p>
						{(searchQuery ||
							selectedCategory ||
							selectedCountry ||
							isFeatured ||
							priceRange.min ||
							priceRange.max) && (
							<button
								onClick={clearFilters}
								className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-95"
							>
								Réinitialiser tous les filtres
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Products;
