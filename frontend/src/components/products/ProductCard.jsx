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
import { normalizeUnit } from "../../utils/productUtils";

const ProductCard = ({ product, viewMode = "grid" }) => {
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
			if (!productId) return;

			try {
				const statsResponse = await reviewService.getProductRatingStats(productId);
				const statsData = statsResponse?.data;
				if (!isMounted || !statsData) return;

				setRatingStats({
					average: statsData.averageRating ?? initialAverage ?? 0,
					totalReviews: statsData.totalReviews ?? initialCount ?? 0,
				});
			} catch (error) {
				console.error("Erreur avis produit:", error);
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

	const formatProductPrice = (price) => {
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

	const getVendorName = (vendor) => {
		if (!vendor) return "Vendeur";
		if (typeof vendor === 'string') return "Vendeur local";

		if (vendor.restaurantName && vendor.restaurantName !== "À compléter") {
			return vendor.restaurantName;
		}
		if (vendor.shopInfo?.shopName) {
			return vendor.shopInfo.shopName;
		}
		if (vendor.farmName && vendor.farmName !== "À compléter") {
			return vendor.farmName;
		}
		if (vendor.companyName && vendor.companyName !== "À compléter") {
			return vendor.companyName;
		}
		if (vendor.firstName) {
			const lastName = vendor.lastName && vendor.lastName !== "À compléter" ? vendor.lastName : "";
			return `${vendor.firstName} ${lastName}`.trim();
		}
		return vendor.user?.companyName || "Vendeur";
	};

	/* Mode Liste */
	if (viewMode === 'list') {
		return (
			<div className="bg-white border border-gray-200/90 rounded-2xl hover:border-emerald-500/40 hover:shadow-lg transition-all duration-300 p-3 sm:p-4 flex gap-4 items-center group relative overflow-hidden min-w-0">
				<Link to={`/products/${product.slug || product._id}`} className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 relative flex items-center justify-center">
					{primaryImage ? (
						<CloudinaryImage
							src={primaryImage.url}
							alt={productName}
							className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
							width={200}
							height={200}
							quality="auto"
							crop="fill"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
							<FiPackage className="h-10 w-10" />
						</div>
					)}

					{product.isFeatured && (
						<div className="absolute top-1.5 left-1.5 bg-[#FF9900] text-gray-900 px-1.5 py-0.5 text-[9px] font-extrabold rounded-full shadow-md">
							Choix
						</div>
					)}
				</Link>

				<div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<div className="space-y-1 min-w-0 flex-1">
						<div className="flex items-center gap-2">
							<h3 className="text-sm font-bold text-[#161D14] group-hover:text-[#1A5514] truncate" title={productName}>
								{productName}
							</h3>

							{(product.producer?.isBio || product.transformer?.isBio) && (
								<span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-extrabold text-white bg-[#1A5514] rounded-md flex-shrink-0">
									<Leaf className="w-2.5 h-2.5 mr-0.5 text-emerald-400" />
									BIO
								</span>
							)}
						</div>

						<div className="flex flex-wrap items-center gap-1.5 text-xs">
							<span className="font-bold text-amber-600">{formatAverageRating(ratingStats.average)}</span>
							<FiStar className="h-3.5 w-3.5 fill-current text-amber-500" />
							<span className="text-gray-400">({ratingStats.totalReviews || 0})</span>
							<span className="text-gray-300">•</span>
							<span className="text-gray-500 truncate">Vendu par <strong className="text-emerald-800">{getVendorName(product.producer || product.transformer || product.restaurateur)}</strong></span>
						</div>

						<div className="text-xs font-semibold text-emerald-700">
							{product.inventory?.quantity > 0 ? "En stock - Livraison rapide" : <span className="text-red-600">En rupture</span>}
						</div>
					</div>

					<div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0">
						<div className="text-left sm:text-right">
							<span className="text-base sm:text-lg font-black text-[#161D14]">
								{formatProductPrice(product.price)}
							</span>
							<span className="text-[11px] text-gray-500 font-medium block">
								/ {normalizeUnit(product.unit)}
							</span>
						</div>

						<button
							onClick={handleAddToCart}
							disabled={product.inventory?.quantity <= 0}
							className={`px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 ${
								isAdded ?
									"bg-emerald-100 border-emerald-300 text-emerald-900"
								: product.inventory?.quantity <= 0 ?
									"bg-gray-100 text-gray-400 cursor-not-allowed"
								: "bg-[#FF9900] hover:bg-[#e68a00] text-gray-900 shadow-amber-500/20 active:scale-95"
							}`}
						>
							{isAdded ?
								<><FiCheck className="h-4 w-4" /> <span>Ajouté</span></>
							: product.inventory?.quantity <= 0 ?
								"Indisponible"
							: <><FiShoppingCart className="h-4 w-4" /><span>Ajouter</span></>}
						</button>
					</div>
				</div>
			</div>
		);
	}

	/* Mode Grille */
	return (
		<div className="bg-white border border-gray-200/90 rounded-2xl hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 flex flex-col h-full group relative overflow-hidden">
			<Link to={`/products/${product.slug || product._id}`} className="block flex-shrink-0 p-1">
				{/* Image */}
				<div className="aspect-square relative flex items-center justify-center overflow-hidden mb-3 rounded-xl bg-gray-50 border border-gray-100">
					{primaryImage ?
						<CloudinaryImage
							src={primaryImage.url}
							alt={productName}
							className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
						<div className="absolute top-2 left-2 bg-[#FF9900] text-gray-900 px-2.5 py-0.5 text-[10px] font-extrabold rounded-full shadow-md">
							Choix Harvests
						</div>
					)}
				</div>
				
				<div className="flex flex-col flex-grow space-y-1">
					{/* Titre (1 seule ligne) */}
					<h3 className="text-xs sm:text-sm font-bold text-[#161D14] group-hover:text-[#1A5514] truncate leading-snug" title={productName}>
						{productName}
					</h3>
					
					{/* Ligne Meta : Badge BIO & Notes sur la même ligne */}
					<div className="flex items-center justify-between pt-1 min-h-[1.5rem]">
						<div className="flex items-center space-x-1">
							<span className="text-xs font-bold text-amber-600">{formatAverageRating(ratingStats.average)}</span>
							<div className="flex text-amber-500">
								<FiStar className="h-3 w-3 fill-current" />
							</div>
							<span className="text-[11px] text-gray-500 font-medium">
								({ratingStats.totalReviews || 0})
							</span>
						</div>

						{(product.producer?.isBio || product.transformer?.isBio) && (
							<span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-extrabold text-white bg-[#1A5514] rounded-md shadow-sm">
								<Leaf className="w-2.5 h-2.5 mr-1 text-emerald-400" />
								CERTIFIÉ BIO
							</span>
						)}
					</div>

					{/* Prix */}
					<div className="pt-1 flex items-baseline flex-wrap gap-1">
						<span className="text-base sm:text-lg font-extrabold text-[#161D14]">
							{formatProductPrice(product.price)}
						</span>
						<span className="text-[11px] text-gray-500 font-medium">
							/ {normalizeUnit(product.unit)}
						</span>
					</div>

					{/* Stock & Vendeur */}
					<div className="pt-1 text-[11px] text-gray-500 space-y-0.5">
						{product.inventory?.quantity > 0 ? (
							<div className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
								<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
								En stock - Livraison rapide
							</div>
						) : (
							<div className="text-red-600 font-semibold text-[11px]">En rupture temporaire</div>
						)}
						<div className="truncate text-gray-500">
							<span>Vendu par : </span>
							<span className="text-[#1A5514] font-semibold hover:underline">{getVendorName(product.producer || product.transformer || product.restaurateur)}</span>
						</div>
					</div>
				</div>
			</Link>

			{/* Bouton Ajouter au panier */}
			<div className="p-3 sm:p-4 pt-0 mt-auto">
				<button
					onClick={handleAddToCart}
					disabled={product.inventory?.quantity <= 0}
					className={`w-full py-2 px-3 rounded-full text-xs font-bold shadow-sm transition-all duration-200 border flex items-center justify-center gap-2 whitespace-nowrap ${
						isAdded ?
							"bg-emerald-100 border-emerald-300 text-emerald-900"
						: product.inventory?.quantity <= 0 ?
							"bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
						: "bg-[#FF9900] hover:bg-[#e68a00] border-[#FF9900] text-gray-900 shadow-amber-500/20 active:scale-95"
					}`}
				>
					{isAdded ?
						<><FiCheck className="h-4 w-4" /> <span>Ajouté <span className="hidden sm:inline">au panier</span></span></>
					: product.inventory?.quantity <= 0 ?
						"Indisponible"
					: <><FiShoppingCart className="h-4 w-4" /><span>Ajouter <span className="hidden sm:inline">au panier</span></span></>}
				</button>
			</div>
		</div>
	);
};

export default ProductCard;
