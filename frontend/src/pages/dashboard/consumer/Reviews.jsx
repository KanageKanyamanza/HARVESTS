import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
	FiStar,
	FiEdit,
	FiTrash2,
	FiClock,
	FiUser,
	FiArrowRight,
	FiMessageSquare,
	FiPackage,
	FiRefreshCw,
} from "react-icons/fi";
import { reviewService } from "../../../services";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorMessage from "../../../components/common/ErrorMessage";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";

const Reviews = () => {
	const [reviews, setReviews] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		loadReviews();

		const handleReviewChange = () => {
			loadReviews();
		};

		window.addEventListener("reviewChanged", handleReviewChange);

		return () => {
			window.removeEventListener("reviewChanged", handleReviewChange);
		};
	}, []);

	const loadReviews = async () => {
		try {
			setLoading(true);
			const response = await reviewService.getMyReviews();

			const reviewsData =
				response.data?.reviews || response.reviews || response.data || [];
			setReviews(Array.isArray(reviewsData) ? reviewsData : []);
		} catch (err) {
			console.error("Erreur lors du chargement des avis:", err);
			setError("Impossible de charger vos avis");
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteReview = async (reviewId) => {
		if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) {
			return;
		}

		try {
			await reviewService.deleteMyReview(reviewId);
			setReviews((prev) => prev.filter((review) => review._id !== reviewId));
			window.dispatchEvent(new Event("reviewChanged"));
		} catch (err) {
			console.error("Erreur lors de la suppression de l'avis:", err);
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const renderStars = (rating) => {
		return Array.from({ length: 5 }, (_, index) => (
			<FiStar
				key={index}
				className={`h-3 w-3 ${
					index < rating ? "text-amber-400 fill-current" : "text-gray-200"
				}`}
			/>
		));
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner size="lg" text="Chargement de vos avis..." />
			</div>
		);
	}

	return (
		<div className="min-h-screen relative overflow-hidden bg-harvests-light/20 pb-20">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-50/20 rounded-full blur-[100px]"></div>
				<div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-cyan-100/20 rounded-full blur-[120px]"></div>
			</div>

			<div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-10">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-down">
					<div className="space-y-3">
						<div className="flex items-center gap-2 text-blue-600 font-black text-[9px] uppercase tracking-widest mb-2">
							<div className="w-5 h-[2px] bg-blue-600 rounded-full"></div>
							<span>Feedback</span>
						</div>
						<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
							Mes{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 italic">
								Avis.
							</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">
							Retrouvez tous les retours que vous avez partagés avec nos
							producteurs. {reviews.length} avis publié
							{reviews.length > 1 ? "s" : ""}.
						</p>
					</div>

					<div className="flex items-center gap-3">
						<button
							onClick={loadReviews}
							className="w-12 h-12 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors group"
						>
							<FiRefreshCw className="w-4 h-4 group-active:rotate-180 transition-transform duration-500" />
						</button>
					</div>
				</div>

				{error && (
					<div className="animate-fade-in">
						<ErrorMessage message={error} />
					</div>
				)}

				{/* Reviews List */}
				<div className="animate-fade-in-up delay-100">
					{reviews.length === 0 ?
						<div className="bg-white/50 backdrop-blur-xl rounded-[3rem] p-20 border border-white/60 text-center shadow-lg">
							<div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-6 shadow-inner">
								<FiMessageSquare className="w-10 h-10" />
							</div>
							<h3 className="text-2xl font-[1000] text-gray-900 tracking-tight mb-2">
								Aucun avis pour le moment
							</h3>
							<p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">
								Partagez votre expérience sur les produits que vous avez achetés
								pour aider la communauté.
							</p>
							<Link
								to="/consumer/orders"
								className="inline-flex items-center px-10 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
							>
								Donner mon avis
							</Link>
						</div>
					:	<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{reviews.map((review) => (
								<div
									key={review._id}
									className="group bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/60 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col"
								>
									{/* Card Header */}
									<div className="flex items-start justify-between mb-6">
										<div className="flex items-center gap-3">
											<div className="w-12 h-12 rounded-2xl bg-gray-50 overflow-hidden shadow-inner flex items-center justify-center text-blue-200">
												{review.product?.images?.[0]?.url ?
													<img
														src={review.product.images[0].url}
														className="w-full h-full object-cover"
														alt=""
													/>
												:	<FiPackage className="w-6 h-6" />}
											</div>
											<div>
												<h4 className="text-sm font-[1000] text-gray-900 leading-tight mb-0.5 line-clamp-1">
													{review.product?.name?.fr ||
														review.product?.name?.en ||
														review.product?.name ||
														"Produit inconnu"}
												</h4>
												<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
													{review.producer?.farmName ||
														review.transformer?.companyName ||
														"Harvests Seller"}
												</p>
											</div>
										</div>
										<button
											onClick={() => handleDeleteReview(review._id)}
											className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white"
										>
											<FiTrash2 className="w-4 h-4" />
										</button>
									</div>

									{/* Content */}
									<div className="flex-1 bg-white/40 rounded-3xl p-5 border border-gray-100/50 mb-6 italic text-gray-600 text-xs leading-relaxed relative">
										<div className="absolute -top-3 left-4 flex items-center bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
											<div className="flex gap-0.5 mr-2">
												{renderStars(review.rating)}
											</div>
											<span className="text-[10px] font-black text-amber-500 font-mono">
												{review.rating}.0
											</span>
										</div>
										"{review.comment || "Aucun commentaire laissé."}"
									</div>

									{/* Footer */}
									<div className="flex items-center justify-between mt-auto">
										<div className="flex items-center gap-2">
											<div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
												<FiClock className="w-3 h-3" />
											</div>
											<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
												{formatDate(review.createdAt)}
											</span>
										</div>
										<Link
											to={`/products/${review.product?._id}`}
											className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 uppercase tracking-widest hover:translate-x-1 transition-transform"
										>
											Acheter à nouveau <FiArrowRight className="w-3 h-3" />
										</Link>
									</div>
								</div>
							))}
						</div>
					}
				</div>
			</div>
		</div>
	);
};

export default Reviews;
