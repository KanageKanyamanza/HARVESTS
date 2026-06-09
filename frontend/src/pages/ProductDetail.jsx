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
import { getCategoryLabel, getStatusConfig } from "../utils/productUtils";
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
			<div className="min-h-screen bg-harvests-light flex items-center justify-center">
				<LoadingSpinner size="lg" text="Chargement du produit..." />
			</div>
		);
	}

	if (error || !product) {
		return (
			<div className="min-h-screen bg-harvests-light flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">
						Produit non trouvé
					</h1>
					<p className="text-gray-600 mb-6">
						Le produit n'existe pas ou n'est plus disponible
					</p>
					<button
						onClick={() => navigate("/products")}
						className="inline-flex items-center px-4 py-2 bg-harvests-green text-white rounded-md"
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
			<div className="min-h-screen bg-harvests-light flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">
						Accès non autorisé
					</h1>
					<p className="text-gray-600 mb-6">
						Ce produit n'est pas encore approuvé.
					</p>
					<button
						onClick={() => navigate("/products")}
						className="inline-flex items-center px-4 py-2 bg-harvests-green text-white rounded-md"
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
		<div className="min-h-screen bg-harvests-light">
			<SEOHead
				title={productName}
				description={
					productDescription || "Découvrez ce produit disponible sur Harvests."
				}
				image={imageUrl}
				type="product"
				canonical={canonicalUrl}
			/>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-6">
					<button
						onClick={() => navigate(-1)}
						className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
					>
						<FiArrowLeft className="h-4 w-4 mr-2" />
						Retour
					</button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* Colonne 1: Galerie d'images (Left) */}
					<div className="lg:col-span-5">
						<ProductImageGallery
							images={product.images}
							selectedIndex={selectedImageIndex}
							onSelectImage={setSelectedImageIndex}
							productName={productName}
						/>
					</div>

					{/* Colonne 2: Informations du produit (Middle) */}
					<div className="lg:col-span-4 space-y-4">
						{/* En-tête */}
						<div>
							<div className="flex flex-wrap items-center justify-between mb-2">
								<span className="inline-flex items-center text-sm font-medium text-primary-700 hover:underline cursor-pointer">
									{getCategoryLabel(product.category)}
								</span>
							</div>
							<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-2">
								{productName}
							</h1>
							
							<div className="flex items-center space-x-2 border-b border-gray-200 pb-2 mb-2">
								<div className="flex items-center cursor-pointer hover:text-primary-600">
									<span className="text-sm font-bold text-gray-800 mr-1">{reviewStats?.averageRating || 0}</span>
									<StarRating rating={reviewStats?.averageRating || 0} size="sm" />
								</div>
								{reviewStats?.totalReviews > 0 && (
									<span className="text-sm text-primary-600 hover:underline cursor-pointer">
										{reviewStats.totalReviews} évaluations
									</span>
								)}
							</div>

							<div className="flex items-center space-x-2 mt-2 mb-4">
								<span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusConfig.color}`}>
									<StatusIcon className="w-3 h-3 mr-1" />
									{statusConfig.text}
								</span>
								{(producer?.isBio || product.transformer?.isBio) && (
									<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
										<Leaf className="mr-1 h-3 w-3" />
										CERTIFIE BIO
									</span>
								)}
							</div>
						</div>

						{/* Prix (Middle) */}
						<div className="py-2">
							<div className="flex items-end">
								<span className="text-3xl font-bold text-gray-900">
									{formatPrice(product.price, product.currency)}
								</span>
							</div>
							<div className="text-sm text-gray-500 mt-1">
								par {product.unit || "unité"}
							</div>
						</div>

						{/* Description courte / Bullets */}
						<div className="border-t border-gray-200 pt-4">
							<h3 className="font-bold text-gray-900 mb-2">À propos de cet article</h3>
							<p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line truncate">
								{productDescription.length > 150 ? productDescription.slice(0, 150) + "..." : productDescription}
							</p>
						</div>
					</div>

					{/* Colonne 3: Buy Box (Right) */}
					<div className="lg:col-span-3">
						<div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm sticky top-4">
							<div className="text-2xl font-bold text-gray-900 mb-2">
								{formatPrice(product.price, product.currency)}
							</div>
							
							<div className="text-sm text-gray-600 mb-4 flex items-center">
								<FiPackage className="h-4 w-4 mr-2 text-primary-600" />
								<span className="font-medium text-green-700">En stock</span>
								<span className="ml-1">({product.inventory?.quantity || 0} disponibles)</span>
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
								<div className="mt-3 bg-green-50 text-green-700 whitespace-nowrap px-3 py-2 rounded border border-green-200 text-sm flex items-center">
									<FiCheckCircle className="h-4 w-4 mr-2" />
									Ajouté au panier
								</div>
							)}

							<div className="mt-4 pt-4 border-t border-gray-200">
								<div className="text-sm text-gray-600 mb-2 flex items-center">
									<FiShield className="h-4 w-4 mr-2 text-gray-400" />
									Paiement sécurisé
								</div>
								<VendorCard vendor={producer} />
							</div>
						</div>
					</div>
				</div>

				{/* Onglets */}
				<div className="mt-12">
					<div className="border-b border-gray-200">
						<nav className="-mb-px flex space-x-8">
							{["description", "specifications", "reviews"].map((tab) => (
								<button
									key={tab}
									onClick={() => setActiveTab(tab)}
									className={`py-2 px-1 border-b-2 font-medium text-sm ${
										activeTab === tab ?
											"border-harvests-green text-harvests-green"
										:	"border-transparent text-gray-500 hover:text-gray-700"
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

					<div className="py-6">
						{activeTab === "description" && (
							<p className="text-gray-600 leading-relaxed">
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
									<div className="bg-primary-50 border border-primary-200 rounded-lg p-4 flex items-center justify-between">
										<div>
											<h3 className="text-lg font-medium text-primary-500">
												Avez-vous acheté ce produit ?
											</h3>
											<p className="text-primary-700 text-sm mt-1">
												Partagez votre expérience
											</p>
										</div>
										<button
											onClick={() => setShowReviewForm(true)}
											className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
										>
											<FiStar className="h-4 w-4 mr-2" />
											Laisser un avis
										</button>
									</div>
								)}
								{showReviewForm && (
									<div className="bg-white border border-gray-200 rounded-lg p-6">
										<div className="flex items-center justify-between mb-4">
											<h3 className="text-lg font-medium text-gray-900">
												Laisser un avis
											</h3>
											<button
												onClick={() => setShowReviewForm(false)}
												className="text-gray-400 hover:text-gray-600"
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
		</div>
	);
};

export default ProductDetail;
