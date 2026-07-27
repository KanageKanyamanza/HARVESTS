import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SEOHead from "../components/seo/SEOHead";
import ProductCard from "../components/products/ProductCard";
import ProductFilters from "../components/products/ProductFilters";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useProducts } from "../hooks/useProducts";
import { getCategoryLabel } from "../utils/productHelpers";
import { FiPackage, FiGrid, FiList, FiFilter, FiSearch, FiSliders } from "react-icons/fi";
import { Sparkles, ShoppingBag, Utensils } from "lucide-react";

const Products = () => {
	const navigate = useNavigate();
	const [showFilters, setShowFilters] = useState(false);
	const [viewMode, setViewMode] = useState(() => {
		return localStorage.getItem('preferred_view_mode') || 'grid';
	});

	const handleViewModeChange = (mode) => {
		setViewMode(mode);
		localStorage.setItem('preferred_view_mode', mode);
	};

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

	const handleClearFilters = () => {
		clearFilters();
	};

	const pageTitle =
		selectedCategory ? `Produits : ${getCategoryLabel(selectedCategory)}`
		: selectedCountry ? `Produits au ${selectedCountry}`
		: isFeatured ? "Produits mis en avant"
		: "Catalogue des Produits Agricoles";

	const pageDescription =
		selectedCategory ?
			`Découvrez notre sélection de ${getCategoryLabel(selectedCategory).toLowerCase()} : produits frais, circuits courts et logistique fiable.`
		: isFeatured ?
			"Nos produits mis en avant : qualité, fraîcheur et livraison rapide avec Harvests."
		:	"Parcourez tous les produits agricoles Harvests : fraîcheur, traçabilité et livraison directe.";

	if (loading && products.length === 0) {
		return (
			<div className="min-h-screen bg-[#F8FAF6] flex items-center justify-center">
				<LoadingSpinner />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#F8FAF6] pb-16">
			<SEOHead title={pageTitle} description={pageDescription} />

			<div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-3 sm:pt-4">

				{/* Hero Banner Agritech */}
				<div className="relative rounded-2xl bg-gradient-to-r from-[#161D14] via-[#1A5514] to-[#0D330A] text-white p-6 sm:p-10 mb-6 overflow-hidden shadow-xl border border-emerald-800/40">
					<div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

					<div className="relative z-10 max-w-3xl">
						<div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
							<ShoppingBag className="w-4 h-4 text-[#31BC2E]" />
							<span>Marché Direct & Circuits Courts</span>
						</div>

						<h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-3">
							{pageTitle}
						</h1>

						<p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed max-w-2xl">
							{pageDescription}
						</p>
					</div>
				</div>

				{/* Sticky Toolbar under dual navbar */}
				<div className="sticky top-16 sm:top-20 lg:top-[108px] z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/90 shadow-sm p-3.5 mb-6">
					<div className="flex flex-wrap items-center justify-between gap-3">

						{/* Quick Mobile Filter button & Total counter */}
						<div className="flex items-center gap-3">
							<button 
								onClick={() => setShowFilters(true)}
								className="md:hidden inline-flex items-center gap-2 px-3.5 py-2 text-xs font-extrabold text-white bg-[#1A5514] rounded-xl shadow-sm hover:bg-[#31BC2E] transition-colors"
							>
								<FiFilter className="w-4 h-4" />
								<span>Filtres</span>
							</button>

							<span className="text-xs font-extrabold text-[#161D14]">
								{totalProducts > 0 
									? `${totalProducts} produit${totalProducts > 1 ? 's' : ''} trouvé${totalProducts > 1 ? 's' : ''}` 
									: "Aucun produit"
								}
								{searchQuery && <span className="text-emerald-700 font-bold ml-1">pour "{searchQuery}"</span>}
							</span>
						</div>

						{/* Right Actions: View mode & Sort */}
						<div className="flex items-center gap-3 ml-auto">
							{/* Switcher Grille / Liste */}
							<div className="flex items-center bg-gray-100 p-1 rounded-xl gap-1 border border-gray-200">
								<button
									onClick={() => handleViewModeChange('grid')}
									className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold ${viewMode === 'grid' ? 'bg-[#1A5514] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
									title="Vue en grille"
								>
									<FiGrid className="h-4 w-4" />
									<span className="">Grille</span>
								</button>
								<button
									onClick={() => handleViewModeChange('list')}
									className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold ${viewMode === 'list' ? 'bg-[#1A5514] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
									title="Vue en liste"
								>
									<FiList className="h-4 w-4" />
									<span className="">Liste</span>
								</button>
							</div>

							{/* Sort Select */}
							<div className="flex items-center gap-1.5">
								<span className="text-xs font-bold text-gray-500 hidden sm:inline">Trier par :</span>
								<select
									value={sortBy}
									onChange={(e) => handleFilterChange("sort", e.target.value)}
									className="py-1.5 px-3 bg-white border border-gray-200/90 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#1A5514] cursor-pointer"
								>
									<option value="newest">Nouveautés</option>
									<option value="price_asc">Prix: Croissant</option>
									<option value="price_desc">Prix: Décroissant</option>
									<option value="rating">Avis clients</option>
								</select>
							</div>
						</div>
					</div>
				</div>

				{/* Main Layout */}
				<div className="flex flex-col md:flex-row gap-6">

					{/* Sidebar Filters */}
					<div className={`w-full md:w-64 lg:w-72 flex-shrink-0 ${showFilters ? "fixed inset-x-0 bottom-0 top-16 z-50 flex flex-col md:static md:top-auto md:z-auto" : "hidden md:block"}`}>
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

					{/* Mobile Overlay */}
					{showFilters && (
						<div 
							className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
							onClick={() => setShowFilters(false)}
						/>
					)}

					{/* Products Content */}
					<div className="flex-1 min-w-0">

						{isSearching && (
							<div className="flex items-center text-xs text-emerald-800 font-bold mb-4 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mr-2" />
								Recherche des produits en cours...
							</div>
						)}

						{/* Section 1: Produit des Producteurs & Transformateurs */}
						{(products.length > 0 || restaurateurProducts.length > 0) && (
							<div className="mb-8">
								{products.length > 0 ? (
									<>
										<div className={viewMode === 'grid' ? "grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4" : "grid gap-3 grid-cols-1 sm:grid-cols-2"}>
											{products.map((product) => (
												<ProductCard key={product._id} product={product} viewMode={viewMode} />
											))}
										</div>
										
										{/* Pagination */}
										{totalPages > 1 && (
											<div className="flex justify-center mt-10 py-6">
												<nav className="inline-flex items-center gap-1.5 bg-white p-2 rounded-2xl border border-gray-200/90 shadow-sm">
													{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
														<button
															key={page}
															onClick={() => {
																setCurrentPage(page);
																window.scrollTo({ top: 0, behavior: 'smooth' });
															}}
															className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
																currentPage === page
																	? "bg-[#1A5514] text-white shadow-md"
																	: "bg-white text-gray-700 hover:bg-emerald-50 border border-transparent"
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
									<div className="text-center py-12 bg-white rounded-2xl border border-emerald-100/90 shadow-sm p-6">
										<FiPackage className="mx-auto h-12 w-12 text-gray-300 mb-3" />
										<p className="text-sm font-extrabold text-[#161D14]">Aucun produit de producteur trouvé</p>
									</div>
								)}
							</div>
						)}

						{/* Section 2: Plats des Restaurateurs */}
						{restaurateurProducts.length > 0 && (
							<div className="mt-10 pt-8 border-t border-gray-200/90">
								<div className="flex items-center gap-2 mb-6">
									<Utensils className="w-5 h-5 text-emerald-700" />
									<h2 className="text-lg font-black text-[#161D14]">
										Plats des Restaurateurs
									</h2>
								</div>

								<div className={viewMode === 'grid' ? "grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4" : "grid gap-3 grid-cols-1 sm:grid-cols-2"}>
									{restaurateurProducts.map((product) => (
										<ProductCard key={product._id} product={product} viewMode={viewMode} />
									))}
								</div>
							</div>
						)}

						{/* Empty State */}
						{(products.length === 0 && restaurateurProducts.length === 0 && !loading) && (
							<div className="text-center py-16 bg-white rounded-2xl border border-emerald-100/90 shadow-sm p-8">
								<FiPackage className="mx-auto h-14 w-14 text-gray-300 mb-4" />
								<h3 className="text-lg font-black text-[#161D14] mb-2">
									Aucun produit trouvé
								</h3>
								<p className="text-xs text-gray-500 mb-6 max-w-md mx-auto">
									Nous n'avons trouvé aucun produit correspondant à vos critères de recherche.
								</p>
								{(searchQuery ||
									selectedCategory ||
									selectedCountry ||
									priceRange.min ||
									priceRange.max) && (
									<button
										onClick={clearFilters}
										className="px-6 py-2.5 bg-[#1A5514] hover:bg-[#31BC2E] text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
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
