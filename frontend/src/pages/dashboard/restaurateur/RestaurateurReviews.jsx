import React, { useState, useEffect, useCallback } from "react";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import { useAuth } from "../../../hooks/useAuth";
import { useNotifications } from "../../../contexts/NotificationContext";
import { reviewService } from "../../../services";
import StarRating from "../../../components/reviews/StarRating";
import {
	Star,
	MessageSquare,
	TrendingUp,
	Users,
	Filter,
	Reply,
	CheckCircle,
} from "lucide-react";

const RestaurateurReviews = () => {
	const { user } = useAuth();
	const { showSuccess, showError } = useNotifications();

	const [reviews, setReviews] = useState([]);
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [respondingTo, setRespondingTo] = useState(null);
	const [responseText, setResponseText] = useState("");
	const [submittingResponse, setSubmittingResponse] = useState(false);
	const [filters, setFilters] = useState({
		rating: "all",
		hasResponse: "all",
		sort: "newest",
	});

	const loadReviews = useCallback(async () => {
		try {
			setLoading(true);
			const [reviewsResponse, statsResponse] = await Promise.all([
				reviewService.getReceivedReviews(filters),
				reviewService.getProducerRatingStats(user._id),
			]);

			setReviews(
				reviewsResponse.data?.reviews || reviewsResponse.reviews || [],
			);
			setStats(statsResponse.data || null);
		} catch (error) {
			console.error("Erreur lors du chargement des avis:", error);
			showError("Erreur lors du chargement des avis");
		} finally {
			setLoading(false);
		}
	}, [filters, user._id, showError]);

	useEffect(() => {
		loadReviews();
	}, [loadReviews]);

	const handleRespondToReview = async (reviewId) => {
		if (!responseText.trim()) {
			showError("Veuillez saisir une réponse");
			return;
		}

		try {
			setSubmittingResponse(true);
			await reviewService.respondToReview(reviewId, {
				comment: responseText.trim(),
			});

			showSuccess("Réponse publiée avec succès");
			setResponseText("");
			setRespondingTo(null);
			loadReviews();
		} catch (error) {
			console.error("Erreur lors de la réponse:", error);
			showError("Erreur lors de la publication de la réponse");
		} finally {
			setSubmittingResponse(false);
		}
	};

	const handleFilterChange = (key, value) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const getAverageRating = () => {
		if (!stats?.averageRating) return 0;
		return stats.averageRating.toFixed(1);
	};

	const getTotalReviews = () => {
		return stats?.totalReviews || reviews.length || 0;
	};

	return (
		<div className="max-w-7xl mx-auto px-4 py-8">
			{/* En-tête */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Avis reçus</h1>
				<p className="text-gray-600">
					Gérez les avis de vos clients et répondez-leur
				</p>
			</div>

			{/* Statistiques */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<Star className="h-8 w-8 text-yellow-400" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-500">Note moyenne</p>
							<div className="flex items-center space-x-2">
								<p className="text-2xl font-semibold text-gray-900">
									{getAverageRating()}
								</p>
								<StarRating rating={parseFloat(getAverageRating())} size="sm" />
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<MessageSquare className="h-8 w-8 text-blue-400" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-500">Total avis</p>
							<p className="text-2xl font-semibold text-gray-900">
								{getTotalReviews()}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<Reply className="h-8 w-8 text-green-400" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-500">Avec réponse</p>
							<p className="text-2xl font-semibold text-gray-900">
								{reviews.filter((r) => r.producerResponse).length}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<TrendingUp className="h-8 w-8 text-purple-400" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-500">Sans réponse</p>
							<p className="text-2xl font-semibold text-gray-900">
								{reviews.filter((r) => !r.producerResponse).length}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Filtres */}
			<div className="bg-white rounded-lg shadow p-6 mb-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-medium text-gray-900">Filtres</h3>
					<Filter className="h-5 w-5 text-gray-400" />
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Note
						</label>
						<select
							value={filters.rating}
							onChange={(e) => handleFilterChange("rating", e.target.value)}
							className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
						>
							<option value="all">Toutes les notes</option>
							<option value="5">5 étoiles</option>
							<option value="4">4 étoiles</option>
							<option value="3">3 étoiles</option>
							<option value="2">2 étoiles</option>
							<option value="1">1 étoile</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Réponse
						</label>
						<select
							value={filters.hasResponse}
							onChange={(e) =>
								handleFilterChange("hasResponse", e.target.value)
							}
							className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
						>
							<option value="all">Tous</option>
							<option value="responded">Avec réponse</option>
							<option value="not-responded">Sans réponse</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Trier par
						</label>
						<select
							value={filters.sort}
							onChange={(e) => handleFilterChange("sort", e.target.value)}
							className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
						>
							<option value="newest">Plus récents</option>
							<option value="oldest">Plus anciens</option>
							<option value="highest-rating">Meilleures notes</option>
							<option value="lowest-rating">Moins bonnes notes</option>
						</select>
					</div>
				</div>
			</div>

			{/* Liste des avis */}
			<div className="space-y-6">
				{loading ?
					<div className="space-y-4">
						{[...Array(3)].map((_, index) => (
							<div
								key={index}
								className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
							>
								<div className="flex items-start space-x-3 mb-4">
									<div className="h-10 w-10 bg-gray-300 rounded-full"></div>
									<div className="flex-1">
										<div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
										<div className="h-3 bg-gray-300 rounded w-1/4"></div>
									</div>
								</div>
								<div className="space-y-2">
									<div className="h-4 bg-gray-300 rounded w-3/4"></div>
									<div className="h-4 bg-gray-300 rounded w-1/2"></div>
								</div>
							</div>
						))}
					</div>
				: reviews.length === 0 ?
					<div className="text-center py-12">
						<MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							Aucun avis trouvé
						</h3>
						<p className="text-gray-600">
							Vous n'avez pas encore reçu d'avis de vos clients.
						</p>
					</div>
				:	reviews.map((review) => (
						<div
							key={review._id}
							className="bg-white rounded-lg border border-gray-200 p-6"
						>
							<div className="flex items-start justify-between mb-4">
								<div className="flex items-center space-x-3">
									<div className="flex-shrink-0">
										<div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
											<Users className="h-5 w-5 text-gray-600" />
										</div>
									</div>
									<div>
										<div className="flex items-center space-x-2">
											<h4 className="text-sm font-medium text-gray-900">
												{review.reviewer?.firstName || "Client"}{" "}
												{review.reviewer?.lastName || ""}
											</h4>
											{review.isVerifiedPurchase && (
												<CheckCircle
													className="h-4 w-4 text-green-500"
													title="Achat vérifié"
												/>
											)}
										</div>
										<div className="flex items-center space-x-2">
											<StarRating rating={review.rating} size="sm" />
											<span className="text-sm text-gray-500">
												{new Date(review.createdAt).toLocaleDateString("fr-FR")}
											</span>
										</div>
									</div>
								</div>

								{!review.producerResponse && (
									<button
										onClick={() => setRespondingTo(review._id)}
										className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-harvests-light"
									>
										<Reply className="h-4 w-4 mr-1" />
										Répondre
									</button>
								)}
							</div>

							<div className="mb-4">
								<h3 className="text-lg font-medium text-gray-900 mb-2">
									{review.title}
								</h3>
								<p className="text-gray-700 leading-relaxed">
									{review.comment}
								</p>
							</div>

							{/* Réponse du restaurateur */}
							{review.producerResponse && (
								<div className="bg-green-50 border-l-4 border-green-400 rounded-r-lg p-4 mb-4">
									<div className="flex items-center space-x-2 mb-2">
										<h5 className="text-sm font-medium text-green-800">
											Votre réponse
										</h5>
										<span className="text-xs text-green-600">
											{new Date(
												review.producerResponse.respondedAt,
											).toLocaleDateString("fr-FR")}
										</span>
									</div>
									<p className="text-sm text-green-700">
										{review.producerResponse.comment}
									</p>
								</div>
							)}

							{/* Formulaire de réponse */}
							{respondingTo === review._id && (
								<div className="border-t border-gray-200 pt-4">
									<div className="mb-3">
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Votre réponse
										</label>
										<textarea
											value={responseText}
											onChange={(e) => setResponseText(e.target.value)}
											rows={3}
											className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
											placeholder="Répondez à votre client..."
										/>
									</div>
									<div className="flex items-center justify-end space-x-3">
										<button
											onClick={() => {
												setRespondingTo(null);
												setResponseText("");
											}}
											className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-harvests-light"
										>
											Annuler
										</button>
										<button
											onClick={() => handleRespondToReview(review._id)}
											disabled={submittingResponse || !responseText.trim()}
											className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{submittingResponse ? "Envoi..." : "Publier la réponse"}
										</button>
									</div>
								</div>
							)}
						</div>
					))
				}
			</div>
		</div>
	);
};

export default RestaurateurReviews;
