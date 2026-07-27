import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SEOHead from "../components/seo/SEOHead";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../contexts/CartContext";
import { useNotifications } from "../hooks/useNotifications";
import { useProductDetail, canViewProduct } from "../hooks/useProductDetail";
import { reviewService, consumerService } from "../services";
import {
	ProductImageGallery,
	ProductActions,
	VendorCard,
} from "../components/product";
import ReviewList from "../components/reviews/ReviewList";
import SimpleReviewForm from "../components/reviews/SimpleReviewForm";
import StarRating from "../components/reviews/StarRating";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ProductSpecifications from "../components/product/ProductSpecifications";
import { toPlainText } from "../utils/textHelpers";
import { getCategoryLabel, getStatusConfig, normalizeUnit } from "../utils/productUtils";
import { formatPrice } from "../utils/currencyUtils";
import {
	FiArrowLeft,
	FiStar,
	FiPackage,
	FiHeart,
	FiShoppingCart,
	FiShield,
	FiCheckCircle,
	FiXCircle,
	FiClock,
	FiEye,
	FiX,
} from "react-icons/fi";
import { Leaf } from "lucide-react";

const ProductDetail = () => {
	const { id } = useParams();
	const { user } = useAuth();
	const { addToCart } = useCart();
	const { showSuccess, showError } = useNotifications();
	const navigate = useNavigate();
	const baseUrl = (
		import.meta.env.VITE_FRONTEND_URL ||
		(typeof window !== "undefined" ? window.location.origin : "") ||
		""
	).replace(/\/$/, "");

	const {
		product,
		producer,
		reviews,
		reviewStats,
		loading,
		reviewsLoading,
		error,
		isFavorite,
		setIsFavorite,
		setFavoritesCount,
		loadReviews,
	} = useProductDetail(id, user);

	const [quantity, setQuantity] = useState(1);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [activeTab, setActiveTab] = useState("description");
	const [showAddedToCart, setShowAddedToCart] = useState(false);
	const [showReviewForm, setShowReviewForm] = useState(false);

	const handleAddToCart = () => {
		if (product) {
			addToCart({ ...product, quantity });
			showSuccess(
				`${quantity} article${quantity > 1 ? "s" : ""} ajouté${
					quantity > 1 ? "s" : ""
				} au panier`,
				"Produit ajouté",
			);
			setShowAddedToCart(true);
			setTimeout(() => setShowAddedToCart(false), 3000);
		}
	};

	const handleToggleFavorite = async () => {
		if (!user || user.userType !== "consumer" || !product?._id) {
			showError(
				"Vous devez être connecté en tant que consommateur pour gérer vos favoris",
			);
			return;
		}
		try {
			if (isFavorite) {
				await consumerService.removeFavorite(product._id);
				setIsFavorite(false);
				setFavoritesCount((prev) => Math.max(0, prev - 1));
				showSuccess("Produit retiré de vos favoris");
				// Déclencher un événement pour rafraîchir les favoris dans le dashboard
				window.dispatchEvent(new Event("favoriteChanged"));
			} else {
				const response = await consumerService.addFavorite(product._id);
				// Si le produit était déjà favori, mettre à jour l'état local
				if (
					response.data?.alreadyFavorite ||
					response.data?.message?.includes("déjà")
				) {
					setIsFavorite(true);
					showSuccess("Produit déjà dans vos favoris");
				} else {
					setIsFavorite(true);
					setFavoritesCount((prev) => prev + 1);
					showSuccess("Produit ajouté à vos favoris");
				}
				// Déclencher un événement pour rafraîchir les favoris dans le dashboard
				window.dispatchEvent(new Event("favoriteChanged"));
				// Recharger le statut favori pour s'assurer qu'il est à jour
				setTimeout(() => {
					const loadFavoriteStatus = async () => {
						try {
							const favResponse = await consumerService.getFavorites();
							const favorites = favResponse.data.data?.favorites || [];
							const isProductFavorite = favorites.some((fav) => {
								const favProductId = fav.product?._id || fav.product;
								return (
									favProductId &&
									(favProductId.toString() === product._id.toString() ||
										favProductId === product._id)
								);
							});
							setIsFavorite(isProductFavorite);
						} catch (error) {
							console.error(
								"Erreur lors du rechargement du statut favori:",
								error,
							);
						}
					};
					loadFavoriteStatus();
				}, 500);
			}
		} catch (error) {
			const msg = error.response?.data?.message;
			if (msg?.includes("déjà dans vos favoris")) {
				setIsFavorite(true);
				showError("Ce produit est déjà dans vos favoris");
			} else {
				showError(msg || "Erreur lors de la gestion des favoris");
			}
		}
	};

	const handleShare = () => {
		if (navigator.share) {
			navigator.share({
				title: toPlainText(product?.name),
				text: toPlainText(product?.description),
				url: window.location.href,
			});
		} else {
			navigator.clipboard.writeText(window.location.href);
		}
	};

	const handleVoteHelpful = async (reviewId) => {
		try {
			await reviewService.voteHelpful(reviewId);
			loadReviews();
		} catch (e) {
			console.error(e);
		}
	};

	const handleVoteUnhelpful = async (reviewId) => {
		try {
			await reviewService.voteUnhelpful(reviewId);
			loadReviews();
		} catch (e) {
			console.error(e);
		}
	};

	const handleSubmitReview = async (reviewData) => {
		try {
			await reviewService.createReview({
				...reviewData,
				productId: product._id,
				producer: producer?._id,
			});
			showSuccess("Votre avis a été publié avec succès !");
			setShowReviewForm(false);
			loadReviews();
			// Déclencher un événement pour rafraîchir les avis dans le dashboard
			window.dispatchEvent(new Event("reviewChanged"));
		} catch (error) {
			let msg =
				error.response?.data?.message ||
				"Erreur lors de la publication de l'avis";
			if (msg.includes("Vous devez avoir acheté"))
				msg = "Vous devez avoir acheté ce produit pour laisser un avis";
			else if (msg.includes("pas encore complétée"))
				msg = "Votre commande n'est pas encore complétée.";
			else if (msg.includes("déjà laissé un avis"))
				msg = "Vous avez déjà laissé un avis pour cette commande";
			showError(msg);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-[#F8FAF6] flex items-center justify-center">
				<LoadingSpinner size="lg" text="Chargement du produit..." />
			</div>
		);
	}

	if (error || !product) {
		return (
			<div className="min-h-screen bg-[#F8FAF6] flex items-center justify-center px-4">
				<div className="text-center bg-white rounded-3xl shadow-agri-card border border-emerald-100/80 p-10 max-w-md">
					<h1 className="text-xl font-extrabold text-[#161D14] mb-2">
						Produit non trouvé
					</h1>
					<p className="text-gray-500 mb-6 text-sm">
						Le produit n'existe pas ou n'est plus disponible
					</p>
					<button
						onClick={() => navigate("/products")}
						className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#1A5514] to-[#31BC2E] text-white rounded-full font-bold shadow-lg shadow-emerald-900/20"
					>
						<FiArrowLeft className="h-4 w-4 mr-2" />
						Retour
					</button>
				</div>
			</div>
		);
	}

	if (!canViewProduct(product, user)) {
		return (
			<div className="min-h-screen bg-[#F8FAF6] flex items-center justify-center px-4">
				<div className="text-center bg-white rounded-3xl shadow-agri-card border border-emerald-100/80 p-10 max-w-md">
					<h1 className="text-xl font-extrabold text-[#161D14] mb-2">
						Accès non autorisé
					</h1>
					<p className="text-gray-500 mb-6 text-sm">
						Ce produit n'est pas encore approuvé.
					</p>
					<button
						onClick={() => navigate("/products")}
						className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#1A5514] to-[#31BC2E] text-white rounded-full font-bold shadow-lg shadow-emerald-900/20"
					>
						<FiArrowLeft className="h-4 w-4 mr-2" />
						Retour aux produits
					</button>
				</div>
			</div>
		);
	}

	const productName = toPlainText(product.name, "Produit");
	const productDescription = toPlainText(product.description, "");
	const statusConfig = getStatusConfig(product.status);
	const StatusIcon =
		{ check: FiCheckCircle, clock: FiClock, package: FiPackage, x: FiXCircle }[
			statusConfig.iconName
		] || FiPackage;
	const canLeaveReview = user?.userType === "consumer";
	const rawImage = Array.isArray(product?.images) ? product.images[0] : null;
	const imageUrl =
		typeof rawImage === "string" ? rawImage : (
			rawImage?.url || `${baseUrl || "https://www.harvests.site"}/logo.png`
		);
	const canonicalUrl = `${baseUrl || "https://www.harvests.site"}/products/${
		product?.slug || product?._id || id
	}`;

	return (
		<div className="min-h-screen bg-[#F8FAF6] pb-24 lg:pb-8">
			<SEOHead
				title={productName}
				description={
					productDescription || "Découvrez ce produit disponible sur Harvests."
				}
				image={imageUrl}
				type="product"
				canonical={canonicalUrl}
			/>
			<div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
				<button
					onClick={() => navigate(-1)}
					className="inline-flex items-center text-gray-600 hover:text-[#1A5514] mb-4 text-sm font-bold transition-colors"
				>
					<FiArrowLeft className="h-4 w-4 mr-1.5" />
					Retour
				</button>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					{/* Colonne 1: Galerie d'images (Left) */}
					<div className="lg:col-span-5">
						<div className="bg-white rounded-2xl border border-emerald-100/80 shadow-sm p-3 sm:p-4">
							<ProductImageGallery
								images={product.images}
								selectedIndex={selectedImageIndex}
								onSelectImage={setSelectedImageIndex}
								productName={productName}
							/>
						</div>
					</div>

					{/* Colonne 2: Informations du produit (Middle) */}
					<div className="lg:col-span-4 space-y-4">
						<div className="bg-white rounded-2xl border border-emerald-100/80 shadow-sm p-5">
							{/* En-tête */}
							<span className="inline-flex items-center text-xs font-bold text-[#1A5514] bg-emerald-50 px-2.5 py-1 rounded-full mb-3">
								{getCategoryLabel(product.category)}
							</span>
							<h1 className="text-xl sm:text-2xl font-extrabold text-[#161D14] leading-tight mb-2">
								{productName}
							</h1>

							<div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
								<div className="flex items-center gap-1">
									<span className="text-sm font-bold text-gray-800">{reviewStats?.averageRating || 0}</span>
									<StarRating rating={reviewStats?.averageRating || 0} size="sm" />
								</div>
								{reviewStats?.totalReviews > 0 && (
									<span className="text-xs text-gray-500">
										({reviewStats.totalReviews} évaluations)
									</span>
								)}
							</div>

							<div className="flex flex-wrap items-center gap-2 mb-4">
								<span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig.color}`}>
									<StatusIcon className="w-3 h-3 mr-1" />
									{statusConfig.text}
								</span>
								{(producer?.isBio || product.transformer?.isBio) && (
									<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
										<Leaf className="mr-1 h-3 w-3" />
										Certifié BIO
									</span>
								)}
							</div>

							{/* Prix */}
							<div className="py-3 border-t border-gray-100">
								<span className="text-2xl sm:text-3xl font-extrabold text-[#1A5514]">
									{formatPrice(product.price, product.currency)}
								</span>
								<span className="text-sm text-gray-500 ml-1.5">
									/ {normalizeUnit(product.unit)}
								</span>
							</div>

							{/* Description courte */}
							<div className="border-t border-gray-100 pt-4">
								<h3 className="font-bold text-[#161D14] mb-2 text-sm">À propos de cet article</h3>
								<p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line line-clamp-4">
									{productDescription}
								</p>
							</div>
						</div>
					</div>

					{/* Colonne 3: Buy Box (Right) */}
					<div className="lg:col-span-3">
						<div className="hidden lg:block bg-white border border-emerald-100/80 rounded-2xl p-5 shadow-agri-card sticky top-24">
							<div className="text-2xl font-extrabold text-[#161D14] mb-1">
								{formatPrice(product.price, product.currency)}
							</div>

							<div className="text-sm mb-4 flex items-center gap-1.5">
								<FiPackage className="h-4 w-4 text-[#1A5514]" />
								<span className="font-bold text-emerald-700">En stock</span>
							</div>

							<ProductActions
								quantity={quantity}
								onQuantityChange={setQuantity}
								onAddToCart={handleAddToCart}
								onToggleFavorite={handleToggleFavorite}
								onShare={handleShare}
								isFavorite={isFavorite}
								showAddedToCart={showAddedToCart}
							/>

							{showAddedToCart && (
								<div className="mt-3 bg-emerald-50 text-emerald-700 whitespace-nowrap px-3 py-2 rounded-xl border border-emerald-200 text-sm flex items-center font-semibold">
									<FiCheckCircle className="h-4 w-4 mr-2" />
									Ajouté au panier
								</div>
							)}

							<div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
								<div className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
									<FiShield className="h-3.5 w-3.5 text-emerald-500" />
									Paiement sécurisé
								</div>
								<VendorCard vendor={producer} />
							</div>
						</div>
					</div>
				</div>

				{/* Onglets */}
				<div className="mt-8 bg-white rounded-2xl border border-emerald-100/80 shadow-sm">
					<div className="border-b border-gray-100 px-3 sm:px-5 overflow-x-auto">
						<nav className="-mb-px flex gap-1 sm:gap-2 w-max">
							{["description", "specifications", "reviews"].map((tab) => (
								<button
									key={tab}
									onClick={() => setActiveTab(tab)}
									className={`py-3.5 px-3 sm:px-4 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${
										activeTab === tab ?
											"border-[#1A5514] text-[#1A5514]"
										:	"border-transparent text-gray-400 hover:text-gray-600"
									}`}
								>
									{tab === "description" ?
										"Description"
									: tab === "specifications" ?
										"Spécifications"
									:	`Avis (${reviews.length})`}
								</button>
							))}
						</nav>
					</div>

					<div className="p-4 sm:p-6">
						{activeTab === "description" && (
							<p className="text-gray-600 leading-relaxed text-sm">
								{productDescription}
							</p>
						)}
						{activeTab === "specifications" && (
							<ProductSpecifications
								product={product}
								producer={producer}
								user={user}
								statusConfig={statusConfig}
							/>
						)}
						{activeTab === "reviews" && (
							<div className="space-y-6">
								{canLeaveReview && !showReviewForm && (
									<div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
										<div>
											<h3 className="text-sm font-extrabold text-[#1A5514]">
												Avez-vous acheté ce produit ?
											</h3>
											<p className="text-emerald-700/80 text-xs mt-0.5">
												Partagez votre expérience
											</p>
										</div>
										<button
											onClick={() => setShowReviewForm(true)}
											className="inline-flex items-center justify-center px-4 py-2.5 bg-[#1A5514] text-white rounded-full text-sm font-bold hover:bg-emerald-800 transition-colors shrink-0"
										>
											<FiStar className="h-4 w-4 mr-2" />
											Laisser un avis
										</button>
									</div>
								)}
								{showReviewForm && (
									<div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
										<div className="flex items-center justify-between mb-4">
											<h3 className="text-base font-extrabold text-[#161D14]">
												Laisser un avis
											</h3>
											<button
												onClick={() => setShowReviewForm(false)}
												className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
											>
												<FiX className="h-5 w-5" />
											</button>
										</div>
										<SimpleReviewForm
											product={product}
											producer={producer}
											onSubmit={handleSubmitReview}
											onCancel={() => setShowReviewForm(false)}
										/>
									</div>
								)}
								<ReviewList
									reviews={reviews}
									stats={reviewStats}
									loading={reviewsLoading}
									onVoteHelpful={handleVoteHelpful}
									onVoteUnhelpful={handleVoteUnhelpful}
									currentUserId={user?._id}
									showProductInfo={false}
								/>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Barre d'achat fixe (mobile) */}
			<div className="lg:hidden fixed bottom-16 inset-x-0 z-30 bg-white border-t border-gray-200 p-3 shadow-[0_-8px_30px_-8px_rgba(0,0,0,0.15)]">
				{showAddedToCart ? (
					<div className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3.5 rounded-full font-bold">
						<FiCheckCircle className="h-5 w-5" />
						Ajouté au panier
					</div>
				) : (
					<div className="flex items-center gap-2">
						<button
							onClick={handleToggleFavorite}
							aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
							className={`h-12 w-12 shrink-0 rounded-full border flex items-center justify-center transition-colors ${
								isFavorite ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-gray-200 text-gray-600"
							}`}
						>
							<FiHeart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
						</button>
						<div className="flex items-center border border-gray-200 rounded-full bg-gray-50 overflow-hidden shrink-0">
							<button
								onClick={() => setQuantity((q) => Math.max(1, q - 1))}
								className="h-12 w-9 flex items-center justify-center text-gray-600 text-lg font-bold"
							>
								−
							</button>
							<span className="px-2 min-w-[1.75rem] text-center text-sm font-bold text-[#161D14]">{quantity}</span>
							<button
								onClick={() => setQuantity((q) => q + 1)}
								className="h-12 w-9 flex items-center justify-center text-gray-600 text-lg font-bold"
							>
								+
							</button>
						</div>
						<button
							onClick={handleAddToCart}
							className="flex-1 min-w-0 h-12 px-3 bg-gradient-to-r from-[#1A5514] to-[#31BC2E] text-white rounded-full font-bold shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-1.5 text-xs sm:text-sm"
						>
							<FiShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
							<span className="truncate">
								Ajouter — {formatPrice(product.price * quantity, product.currency)}
							</span>
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default ProductDetail;
