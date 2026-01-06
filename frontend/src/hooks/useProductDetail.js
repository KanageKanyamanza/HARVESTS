import { useState, useEffect, useCallback } from "react";
import {
	productService,
	producerService,
	reviewService,
	consumerService,
} from "../services";

export const useProductDetail = (id, user) => {
	const [product, setProduct] = useState(null);
	const [producer, setProducer] = useState(null);
	const [reviews, setReviews] = useState([]);
	const [reviewStats, setReviewStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [reviewsLoading, setReviewsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isFavorite, setIsFavorite] = useState(false);
	const [favoritesCount, setFavoritesCount] = useState(0);

	const loadReviews = useCallback(async () => {
		if (!product?._id) return;
		try {
			setReviewsLoading(true);
			const [reviewsResponse, statsResponse] = await Promise.all([
				reviewService.getProductReviews(product._id),
				reviewService.getProductRatingStats(product._id),
			]);
			setReviews(reviewsResponse.data.reviews || []);
			setReviewStats(statsResponse.data || null);
		} catch (error) {
			console.error("Erreur lors du chargement des avis:", error);
		} finally {
			setReviewsLoading(false);
		}
	}, [product?._id]);

	useEffect(() => {
		const loadProductData = async () => {
			try {
				setLoading(true);
				let productResponse = null;

				try {
					productResponse = await productService.getProduct(id);
				} catch (publicError) {
					if (
						user &&
						(user.userType === "producer" || user.userType === "admin")
					) {
						try {
							productResponse = await producerService.getProduct(id);
						} catch (privateError) {
							throw publicError;
						}
					} else {
						throw publicError;
					}
				}

				if (productResponse?.data.status === "success") {
					const productData = productResponse.data.data.product;
					setProduct(productData);
					if (productData.reviews) setReviews(productData.reviews);
					if (productData.producer) setProducer(productData.producer);
					else if (productData.transformer)
						setProducer(productData.transformer);
					setFavoritesCount(productData.stats?.favorites || 0);
				}
			} catch (error) {
				console.error("Erreur lors du chargement du produit:", error);
				setError("Erreur lors du chargement du produit");
			} finally {
				setLoading(false);
			}
		};

		if (id) loadProductData();
	}, [id, user]);

	useEffect(() => {
		if (product?._id) loadReviews();
	}, [product?._id, loadReviews]);

	useEffect(() => {
		const loadFavoriteStatus = async () => {
			if (product?._id && user?.userType === "consumer") {
				try {
					const response = await consumerService.getFavorites();
					const favorites = response.data.data?.favorites || [];

					const isProductFavorite = favorites.some((fav) => {
						// Gérer différentes structures : fav.product._id, fav.product (string), ou fav._id si c'est directement le produit
						const productId =
							fav.product?._id ||
							fav.product ||
							(fav._id && !fav.product ? fav._id : null);
						const matches =
							productId &&
							(productId.toString() === product._id.toString() ||
								productId === product._id);
						if (matches) {
						}
						return matches;
					});

					setIsFavorite(isProductFavorite);
				} catch (error) {
					console.error("Erreur lors du chargement des favoris:", error);
					setIsFavorite(false);
				}
			} else {
				setIsFavorite(false);
			}
		};
		loadFavoriteStatus();
	}, [product?._id, user]);

	return {
		product,
		producer,
		reviews,
		reviewStats,
		loading,
		reviewsLoading,
		error,
		isFavorite,
		setIsFavorite,
		favoritesCount,
		setFavoritesCount,
		loadReviews,
	};
};

export const canViewProduct = (product, user) => {
	if (!product) return false;
	if (product.status === "approved") return true;
	if (user) {
		if (user.userType === "admin") return true;
		if (user.userType === "producer" && product.producer) {
			const producerId = product.producer._id || product.producer;
			return producerId === user._id || producerId === user.id;
		}
	}
	return false;
};
