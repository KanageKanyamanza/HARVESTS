import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CloudinaryImage from "../common/CloudinaryImage";
import {
	FiStar,
	FiPackage,
	FiMapPin,
	FiShoppingCart,
	FiCheck,
} from "react-icons/fi";
import { Leaf } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { reviewService } from "../../services";
import {
	formatAverageRating,
	getProductAverageRating,
	getProductReviewCount,
} from "../../utils/vendorRatings";
import { convertPrice, formatPrice } from "../../utils/currencyUtils";
import { useCurrency } from "../../contexts/CurrencyContext";
import { getCountryName } from "../../utils/countryMapper";

const ProductCard = ({ product }) => {
	const { addToCart } = useCart();
	const { currency } = useCurrency();
	const [isAdded, setIsAdded] = useState(false);
	const initialAverage = getProductAverageRating(product);
	const initialCount = getProductReviewCount(product);
	const [ratingStats, setRatingStats] = useState({
		average: initialAverage,
		totalReviews: initialCount,
	});

	const productName = product.name?.fr || product.name?.en || product.name;
	const primaryImage =
		product.images?.find((img) => img.isPrimary) || product.images?.[0];

	useEffect(() => {
		let isMounted = true;

		const loadRatingStats = async () => {
			const productId = product?._id || product?.id;
			if (!productId) {
				return;
			}

			try {
				const statsResponse =
					await reviewService.getProductRatingStats(productId);
				const statsData = statsResponse?.data;
				if (!isMounted || !statsData) {
					return;
				}

				setRatingStats({
					average: statsData.averageRating ?? initialAverage ?? 0,
					totalReviews: statsData.totalReviews ?? initialCount ?? 0,
				});
			} catch (error) {
				console.error(
					"Erreur lors du chargement des statistiques d'avis du produit:",
					error,
				);
			}
		};

		loadRatingStats();

		return () => {
			isMounted = false;
		};
	}, [product?._id, product?.id]);

	const handleAddToCart = (e) => {
		e.preventDefault();
		e.stopPropagation();

		addToCart({
			...product,
			quantity: 1,
		});

		setIsAdded(true);
		setTimeout(() => setIsAdded(false), 2000);
	};

	const formatPrice = (price) => {
		const convertedPrice = convertPrice(
			price,
			product.currency || "FCFA",
			currency,
		);
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: currency === "FCFA" ? "XOF" : currency,
			minimumFractionDigits: currency === "FCFA" ? 0 : 2,
		})
			.format(convertedPrice)
			.replace("XOF", "FCFA");
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
			nuts: "Noix",
			seeds: "Graines",
			dairy: "Produits laitiers",
			meat: "Viande",
			poultry: "Volaille",
			fish: "Poisson",
			"processed-foods": "Produits transformés",
			beverages: "Boissons",
			other: "Autre",
		};
		return categories[category] || category;
	};

	const getVendorName = (vendor) => {
		if (!vendor) return "Vendeur";
		
		// Si c'est juste un ID (pas populé)
		if (typeof vendor === 'string') return "Vendeur local";

		// Priorité 1 : Nom du restaurant (si c'est un restaurateur)
		if (vendor.restaurantName && vendor.restaurantName !== "À compléter") {
			return vendor.restaurantName;
		}

		// Priorité 2 : Nom de la boutique (pour producteurs/transformateurs)
		if (vendor.shopInfo?.shopName) {
			return vendor.shopInfo.shopName;
		}

		// Pour les producteurs
		if (vendor.farmName && vendor.farmName !== "À compléter") {
			return vendor.farmName;
		}

		// Pour les transformateurs
		if (vendor.companyName && vendor.companyName !== "À compléter") {
			return vendor.companyName;
		}

		// Fallback : nom complet de la personne
		if (vendor.firstName) {
			const lastName =
				vendor.lastName && vendor.lastName !== "À compléter" ?
					vendor.lastName
				:	"";
			return `${vendor.firstName} ${lastName}`.trim();
		}

		// Dernier fallback
		return vendor.user?.companyName || "Vendeur";
	};

	return (
		<div className="bg-white border border-gray-200 rounded-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full group relative">
			<Link to={`/products/${product._id}`} className="block flex-shrink-0 p-2 sm:p-4">
				{/* Image */}
				<div className="aspect-square relative flex items-center justify-center overflow-hidden mb-2 sm:mb-3">
					{primaryImage ?
						<CloudinaryImage
							src={primaryImage.url}
							alt={productName}
							className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
							width={300}
							height={300}
							quality="auto"
							crop="fill"
						/>
					:	<div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
							<FiPackage className="h-16 w-16" />
						</div>
					}

					{/* Badge Featured */}
					{product.isFeatured && (
						<div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-0.5 text-xs font-bold shadow-sm">
							Choix de récolte
						</div>
					)}
				</div>
				
				<div className="flex flex-col flex-grow">
					{/* Titre */}
					<h3 className="text-[13px] sm:text-[15px] font-medium text-gray-900 group-hover:text-primary-700 line-clamp-2 leading-tight min-h-[2.5rem]">
						{productName}
					</h3>
					
					{/* BIO Badge */}
					{(product.producer?.isBio || product.transformer?.isBio) && (
						<div className="mt-1">
							<span className="inline-flex items-center px-2 py-0.5 text-[10px] sm:text-xs font-black text-white bg-harvests-green rounded shadow-sm shadow-emerald-200">
								<Leaf className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
								CERTIFIÉ BIO
							</span>
						</div>
					)}

					{/* Notes */}
					<div className="flex items-center space-x-1 mt-1 sm:mt-1.5">
						<span className="text-xs sm:text-sm font-bold text-gray-800">{formatAverageRating(ratingStats.average)}</span>
						<div className="flex text-yellow-500">
							<FiStar className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
						</div>
						{ratingStats.totalReviews > 0 && (
							<span className="text-xs sm:text-sm text-primary-600 hover:underline">
								{ratingStats.totalReviews}
							</span>
						)}
					</div>

					{/* Prix */}
					<div className="mt-1 sm:mt-2 flex items-baseline flex-wrap">
						<span className="text-base sm:text-xl font-bold text-gray-900">
							{formatPrice(product.price)}
						</span>
						<span className="text-[10px] sm:text-xs text-gray-500 ml-1">
							/ {product.unit || "unité"}
						</span>
					</div>

					{/* Stock & Vendeur */}
					<div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-500 space-y-0.5">
						{product.inventory?.quantity > 0 ? (
							<div className="text-green-700 font-medium">En stock</div>
						) : (
							<div className="text-red-600 font-medium">Rupture</div>
						)}
						<div className="truncate">
							<span className="hidden sm:inline">Vendu par : </span>
							<span className="text-primary-600 hover:underline">{getVendorName(product.producer || product.transformer || product.restaurateur)}</span>
						</div>
					</div>
				</div>
			</Link>

			{/* Bouton Ajouter au panier (Toujours en bas) */}
			<div className="p-2 sm:p-4 mt-auto">
				<button
					onClick={handleAddToCart}
					disabled={product.inventory?.quantity <= 0}
					className={`w-full py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm transition-colors border flex items-center justify-center ${
						isAdded ?
							"bg-green-100 border-green-200 text-green-800"
						: product.inventory?.quantity <= 0 ?
							"bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
						: "bg-white hover:bg-green-50 border-harvests-green text-harvests-green"
					}`}
				>
					{isAdded ?
						<><FiCheck className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Ajouté</span></>
					: product.inventory?.quantity <= 0 ?
						"Indisp."
					: <><FiShoppingCart className="h-4 w-4 sm:mr-2 sm:hidden" /><span className="hidden sm:inline">Ajouter au panier</span><span className="sm:hidden ml-1">Ajouter</span></>}
				</button>
			</div>
		</div>
	);
};

export default ProductCard;
