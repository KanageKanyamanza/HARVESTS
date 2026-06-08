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
		isBio,
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
		isBio,
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
			<div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
				{/* Breadcrumb / Top Info */}
				<div className="mb-4 flex items-center text-sm text-gray-600">
					<span className="font-bold">
						{totalProducts > 0 ? `1-${products.length + restaurateurProducts.length} sur plus de ${totalProducts} résultats` : "Aucun résultat"}
					</span>
					{searchQuery && <span className="ml-2 text-primary-700 font-bold">pour "{searchQuery}"</span>}
				</div>

				<div className="flex flex-col md:flex-row gap-6">
					{/* Sidebar Filtres (Left Column) */}
					<div className={`w-full md:w-64 lg:w-72 flex-shrink-0 ${showFilters ? "fixed inset-0 z-50 bg-white overflow-y-auto p-4 md:static md:bg-transparent md:p-0 md:z-auto" : "hidden md:block"}`}>
						<ProductFilters
							showFilters={showFilters}
							setShowFilters={setShowFilters}
							searchQuery={searchQuery}
							setSearchQuery={setSearchQuery}
							selectedCategory={selectedCategory}
							sortBy={sortBy}
							isBio={isBio}
							priceRange={priceRange}
							categories={categories}
							onFilterChange={handleFilterChange}
							onClearFilters={handleClearFilters}
							onPageReset={() => setCurrentPage(1)}
							selectedCountry={selectedCountry}
						/>
					</div>

					{/* Overlay pour le mode mobile */}
					{showFilters && (
						<div 
							className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
							onClick={() => setShowFilters(false)}
						></div>
					)}

					{/* Contenu principal (Right Column) */}
					<div className="flex-1">
						{/* Top bar (Tri et Filtre mobile) */}
						<div className="flex justify-between md:justify-end items-center bg-white p-2 border border-gray-200 rounded-sm shadow-sm mb-4">
							{/* Bouton filtre mobile */}
							<button 
								onClick={() => setShowFilters(true)}
								className="md:hidden flex items-center px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-sm text-gray-700 bg-white shadow-sm"
							>
								<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
								</svg>
								Filtrer
							</button>

							<div className="flex items-center">
								<span className="text-sm text-gray-700 mr-2 shadow-sm hidden sm:inline">Trier par:</span>
								<select
									value={sortBy}
									onChange={(e) => handleFilterChange("sort", e.target.value)}
									className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 bg-gray-50 shadow-sm hover:bg-gray-100 cursor-pointer max-w-[150px] sm:max-w-none"
								>
									<option value="newest">Nouveautés</option>
									<option value="price_asc">Prix: Croissant</option>
									<option value="price_desc">Prix: Décroissant</option>
									<option value="rating">Avis client</option>
								</select>
							</div>
						</div>

						{isSearching && (
							<div className="flex items-center text-sm text-gray-600 mb-4">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
								Recherche en cours...
							</div>
						)}

						{/* Section 1: Producteurs & Transformateurs */}
						{(products.length > 0 || restaurateurProducts.length > 0) && (
							<div className="mb-8">
								{products.length > 0 ? (
									<>
										<div className="grid gap-2 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
											{products.map((product) => (
												<ProductCard key={product._id} product={product} />
											))}
										</div>
										
										{/* Pagination */}
										{totalPages > 1 && (
											<div className="flex justify-center mt-12 py-4 border-t border-gray-200">
												<nav className="flex items-center gap-1 shadow-sm">
													{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
														<button
															key={page}
															onClick={() => {
																setCurrentPage(page);
																window.scrollTo({ top: 0, behavior: 'smooth' });
															}}
															className={`px-4 py-2 text-sm font-medium border transition-colors ${
																currentPage === page
																	? "border-primary-600 bg-white text-black shadow-sm pointer-events-none"
																	: "bg-white text-gray-600 hover:bg-gray-50 border-gray-300 shadow-sm"
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
									<div className="text-center py-12 bg-white/50 rounded-sm border border-gray-200">
										<FiPackage className="mx-auto h-12 w-12 text-gray-300 mb-4" />
										<p className="text-gray-500 font-medium">Aucun produit de producteur trouvé</p>
									</div>
								)}
							</div>
						)}

						{/* Section 2: Restaurateurs */}
						{(restaurateurProducts.length > 0 || (products.length > 0 && !loading)) && (
							<div className="mt-8 pt-8 border-t border-gray-200">
								<div className="flex items-center gap-3 mb-6">
									<h2 className="text-lg font-bold text-gray-900">
										Plats des Restaurateurs
									</h2>
								</div>

								{restaurateurProducts.length > 0 ? (
									<div className="grid gap-2 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
										{restaurateurProducts.map((product) => (
											<ProductCard key={product._id} product={product} />
										))}
									</div>
								) : (
									<div className="text-center py-12 bg-white/50 rounded-sm border border-gray-200">
										<FiPackage className="mx-auto h-12 w-12 text-gray-300 mb-4" />
										<p className="text-gray-500 font-medium">Aucun plat de restaurateur trouvé</p>
									</div>
								)}
							</div>
						)}

						{(products.length === 0 && restaurateurProducts.length === 0 && !loading) && (
							<div className="text-center py-16 bg-white rounded-sm border border-gray-200">
								<FiPackage className="mx-auto h-16 w-16 text-gray-300 mb-6" />
								<h3 className="text-xl font-bold text-gray-900 mb-2">
									Aucun résultat trouvé
								</h3>
								<p className="text-sm text-gray-600 mb-8 max-w-md mx-auto">
									Nous n'avons trouvé aucun produit correspondant à vos critères de recherche.
								</p>
								{(searchQuery ||
									selectedCategory ||
									selectedCountry ||
									priceRange.min ||
									priceRange.max) && (
									<button
										onClick={clearFilters}
										className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-sm hover:bg-gray-50 shadow-sm transition-all"
									>
										Effacer tous les filtres
									</button>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Products;
