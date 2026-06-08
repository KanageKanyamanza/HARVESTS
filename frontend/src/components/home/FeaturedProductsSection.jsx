import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { FiMapPin } from "react-icons/fi";
import ProductCard from "../products/ProductCard";
import LoadingSpinner from "../common/LoadingSpinner";
import { productService } from "../../services";
import { useGeoLocation } from "../../hooks/useGeoLocation";

const FeaturedProductsSection = () => {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isLocal, setIsLocal] = useState(false);
	const { countryCode, countryName, detected, loading: geoLoading } = useGeoLocation();

	useEffect(() => {
		if (!geoLoading) {
			loadFeaturedProducts();
		}
	}, [geoLoading, countryCode]);

	const loadFeaturedProducts = async () => {
		try {
			setLoading(true);
			setError(null);

			const params = { limit: 8 };
			if (detected && countryCode) {
				params.country = countryCode;
			}

			const response = await productService.getFeaturedProducts(params);

			if (response.data.status === "success") {
				const fetched = response.data.data.products || [];
				setProducts(fetched);
				setIsLocal(detected && countryCode && fetched.length > 0);

				// Fallback global si aucun produit featured dans la zone
				if (detected && countryCode && fetched.length === 0) {
					const fallback = await productService.getFeaturedProducts({ limit: 8 });
					if (fallback.data.status === "success") {
						setProducts(fallback.data.data.products || []);
					}
					setIsLocal(false);
				}
			}
		} catch (err) {
			console.error(
				"Erreur lors du chargement des produits mis en avant:",
				err
			);
			setError("Impossible de charger les produits mis en avant");
		} finally {
			setLoading(false);
		}
	};

	// Ne pas afficher la section s'il n'y a pas de produits featured
	if (!loading && products.length === 0) {
		return null;
	}

	return (
		<section className="py-20 bg-harvests-light" data-aos="fade-up">
			<div className="container-xl">
				{/* En-tête */}
				<div className="flex justify-between items-center mb-5">
					<div>
						<h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
							Featured Products
						</h2>
						{isLocal && countryName && (
							<span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
								<FiMapPin className="h-3 w-3" />
								{countryName}
							</span>
						)}
					</div>
					{/* CTA pour voir tous les produits */}
					<div className="flex whitespace-nowrap justify-end">
						<Link
							to="/products?featured=true"
							className="font-semibold inline-flex items-center text-primary-500 hover:text-primary-600 hover:underline hover:-translate-y-1 transition-all duration-300 ease-in-out"
						>
							Voir Tous
							<ArrowRight className="ml-2 h-5 w-5" />
						</Link>
					</div>
				</div>
				<div className="mb-5 text-center">
					<p className="text-sm text-gray-600">
						Découvrez notre sélection de produits d'exception, choisis pour leur
						qualité et leur fraîcheur
					</p>
				</div>

				{/* Contenu */}
				{loading ? (
					<div className="flex justify-center items-center py-10">
						<LoadingSpinner />
					</div>
				) : error ? (
					<div className="text-center py-12">
						<div className="text-red-600 mb-4">{error}</div>
						<button
							onClick={loadFeaturedProducts}
							className="btn bg-primary-500 text-white hover:bg-primary-600"
						>
							Réessayer
						</button>
					</div>
				) : (
					<>
						{/* Grille de produits */}
						<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6 mb-5">
							{products.map((product) => (
								<ProductCard key={product._id} product={product} />
							))}
						</div>
					</>
				)}
			</div>
		</section>
	);
};

export default FeaturedProductsSection;
