import React, { useState, useEffect, useCallback } from "react";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import { useAuth } from "../../../hooks/useAuth";
import { useNotifications } from "../../../contexts/NotificationContext";
import { reviewService } from "../../../services";
import StarRating from "../../../components/reviews/StarRating";
import CloudinaryImage from "../../../components/common/CloudinaryImage";
import {
	Star,
	MessageSquare,
	TrendingUp,
	Users,
	Filter,
	Search,
	Reply,
	CheckCircle,
	AlertCircle,
	ArrowRight,
	Send,
	X,
	Calendar,
	Sparkles,
} from "lucide-react";

const ProducerReviews = () => {
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
				reviewService.getProducerRatingStats(user?._id),
			]);

			setReviews(reviewsResponse.data.reviews || []);
			setStats(statsResponse.data || null);
		} catch (error) {
			console.error("Erreur lors du chargement des avis:", error);
			showError("Erreur lors du chargement des avis");
		} finally {
			setLoading(false);
		}
	}, [filters, user?._id, showError]);

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
		if (!stats?.averageRating) return "0.0";
		return stats.averageRating.toFixed(1);
	};

	const getTotalReviews = () => {
		return stats?.totalReviews || 0;
	};

	return (
		<ModularDashboardLayout userType="producer">
			<div className="min-h-screen relative overflow-hidden bg-harvests-light/20">
				{/* Background Decorative Glows */}
				<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
					<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
					<div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
				</div>

				<div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-10">
					{/* Header */}
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-down">
						<div className="space-y-3">
							<div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest mb-2">
								<div className="w-5 h-[2px] bg-emerald-600 rounded-full"></div>
								<span>Réputation</span>
							</div>
							<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
								Avis{" "}
								<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
									Clients.
								</span>
							</h1>
							<p className="text-xs text-gray-500 font-medium max-w-xl">
								Suivez la satisfaction de vos clients et engagez la conversation
								pour fidéliser votre audience.
							</p>
						</div>

						<div className="bg-white/70 backdrop-blur-xl px-6 py-4 rounded-[2rem] border border-white/60 shadow-sm flex items-center gap-4">
							<div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
								<Sparkles className="h-6 w-6" />
							</div>
							<div>
								<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
									Satisfaction
								</p>
								<div className="flex items-center gap-2">
									<span className="text-2xl font-[1000] text-gray-900 tracking-tight">
										{getAverageRating()}
									</span>
									<StarRating
										rating={parseFloat(getAverageRating())}
										size="sm"
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Stats Bar */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in-up delay-100">
						{[
							{
								label: "Total Avis",
								value: getTotalReviews(),
								icon: MessageSquare,
								color: "blue",
							},
							{
								label: "Indice de Réponse",
								value: `${getTotalReviews() > 0 ? Math.round((reviews.filter((r) => r.producerResponse).length / getTotalReviews()) * 100) : 0}%`,
								icon: Reply,
								color: "emerald",
							},
							{
								label: "En attente",
								value: reviews.filter((r) => !r.producerResponse).length,
								icon: TrendingUp,
								color: "amber",
							},
							{
								label: "Clients Vérifiés",
								value: reviews.filter((r) => r.isVerifiedPurchase).length,
								icon: CheckCircle,
								color: "purple",
							},
						].map((item, idx) => (
							<div
								key={idx}
								className="bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
							>
								<div className="flex items-center justify-between mb-4">
									<div
										className={`w-10 h-10 rounded-xl flex items-center justify-center
                        ${item.color === "blue" ? "bg-blue-50 text-blue-600 border border-blue-100" : ""}
                        ${item.color === "emerald" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : ""}
                        ${item.color === "amber" ? "bg-amber-50 text-amber-600 border border-amber-100" : ""}
                        ${item.color === "purple" ? "bg-purple-50 text-purple-600 border border-purple-100" : ""}
                      `}
									>
										<item.icon className="w-5 h-5" />
									</div>
								</div>
								<p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-1">
									{item.label}
								</p>
								<p className="text-2xl font-[1000] text-gray-900 tracking-tighter">
									{item.value}
								</p>
							</div>
						))}
					</div>

					{/* Filters Bar */}
					<div className="bg-white/50 backdrop-blur-xl p-4 rounded-[2.5rem] border border-white/60 shadow-sm flex flex-col md:flex-row gap-4 items-center animate-fade-in-up delay-200">
						<div className="flex items-center gap-3 px-4 border-r border-gray-100 hidden md:flex">
							<Filter className="h-4 w-4 text-gray-400" />
							<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
								Filtrer par
							</span>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
							<select
								value={filters.rating}
								onChange={(e) => handleFilterChange("rating", e.target.value)}
								className="bg-white/70 border-none rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-700 focus:ring-4 focus:ring-emerald-500/5 appearance-none cursor-pointer"
							>
								<option value="all">Toutes les notes</option>
								{[5, 4, 3, 2, 1].map((n) => (
									<option key={n} value={n.toString()}>
										{n} Étoiles
									</option>
								))}
							</select>

							<select
								value={filters.hasResponse}
								onChange={(e) =>
									handleFilterChange("hasResponse", e.target.value)
								}
								className="bg-white/70 border-none rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-700 focus:ring-4 focus:ring-emerald-500/5 appearance-none cursor-pointer"
							>
								<option value="all">Toutes les réponses</option>
								<option value="responded">Avec réponse</option>
								<option value="not-responded">Sans réponse</option>
							</select>

							<select
								value={filters.sort}
								onChange={(e) => handleFilterChange("sort", e.target.value)}
								className="bg-white/70 border-none rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-700 focus:ring-4 focus:ring-emerald-500/5 appearance-none cursor-pointer"
							>
								<option value="newest">Plus récents</option>
								<option value="oldest">Plus anciens</option>
								<option value="highest-rating">Meilleures notes</option>
								<option value="lowest-rating">Moins bonnes notes</option>
							</select>
						</div>
					</div>

					{/* Review List Section */}
					<div className="space-y-6 animate-fade-in-up delay-300">
						{loading ?
							<div className="space-y-6">
								{[1, 2, 3].map((i) => (
									<div
										key={i}
										className="bg-white/40 backdrop-blur-md border border-white/60 rounded-[2.5rem] p-8 animate-pulse"
									>
										<div className="flex gap-4 mb-6">
											<div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
											<div className="flex-1 space-y-2">
												<div className="h-4 bg-gray-200 rounded w-1/4"></div>
												<div className="h-3 bg-gray-200 rounded w-1/6"></div>
											</div>
										</div>
										<div className="space-y-3">
											<div className="h-4 bg-gray-200 rounded w-full"></div>
											<div className="h-4 bg-gray-200 rounded w-5/6"></div>
										</div>
									</div>
								))}
							</div>
						: reviews.length === 0 ?
							<div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[3rem] p-16 text-center shadow-sm">
								<div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
									<MessageSquare className="h-10 w-10" />
								</div>
								<h3 className="text-2xl font-[1000] text-gray-900 tracking-tight mb-2">
									Aucun avis pour le moment
								</h3>
								<p className="text-gray-500 max-w-sm mx-auto font-medium">
									Les avis de vos clients s'afficheront ici. Continuez à fournir
									d'excellents produits pour récolter des retours positifs !
								</p>
							</div>
						:	reviews.map((review) => (
								<div
									key={review._id}
									className="group bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-6 md:p-10 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden"
								>
									<div className="flex flex-col md:flex-row gap-8 relative z-10">
										{/* User Profile Info */}
										<div className="md:w-64 shrink-0">
											<div className="flex items-center gap-4 mb-4">
												<div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white shrink-0 overflow-hidden">
													{review.reviewer?.avatar ?
														<CloudinaryImage
															src={review.reviewer.avatar}
															className="w-full h-full object-cover"
														/>
													:	<Users className="h-6 w-6" />}
												</div>
												<div className="min-w-0">
													<h4 className="font-[1000] text-gray-900 tracking-tight truncate">
														{review.reviewer?.firstName}{" "}
														{review.reviewer?.lastName}
													</h4>
													<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">
														Acheteur Harvests
													</p>
												</div>
											</div>

											<div className="space-y-4">
												<div className="flex items-center gap-2">
													<StarRating rating={review.rating} size="sm" />
												</div>

												{/* Product Info Mini-Card */}
												{review.product && (
													<div className="p-3 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center gap-3">
														<div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white shadow-sm">
															{review.product.images?.[0] ?
																<CloudinaryImage
																	src={review.product.images[0].url}
																	className="w-full h-full object-cover"
																/>
															:	<div className="w-full h-full bg-gray-200 flex items-center justify-center">
																	<Sparkles className="h-4 w-4 text-gray-400" />
																</div>
															}
														</div>
														<div className="min-w-0">
															<p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">
																Produit concerné
															</p>
															<p className="text-[10px] font-bold text-gray-900 truncate">
																{review.product.name}
															</p>
														</div>
													</div>
												)}

												<div className="flex flex-col gap-2">
													<div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
														<Calendar className="h-3 w-3 text-emerald-500" />
														{new Date(review.createdAt).toLocaleDateString(
															"fr-FR",
															{
																day: "numeric",
																month: "long",
																year: "numeric",
															},
														)}
													</div>
													{review.isVerifiedPurchase && (
														<div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 w-fit">
															<CheckCircle className="h-3 w-3" />
															Achat Vérifié
														</div>
													)}
												</div>
											</div>
										</div>

										{/* Review Content */}
										<div className="flex-1 space-y-6">
											<div className="bg-gray-50/50 rounded-[1.8rem] p-6 md:p-8 border border-gray-100/50 relative">
												<div className="absolute top-0 right-0 p-6 opacity-[0.05]">
													<MessageSquare className="w-24 h-24" />
												</div>
												<h3 className="text-xl font-[1000] text-gray-900 tracking-tight mb-3">
													{review.title || "Sans titre"}
												</h3>
												<p className="text-gray-600 leading-relaxed font-medium">
													{review.comment}
												</p>
											</div>

											{/* Merchant Response Area */}
											{review.producerResponse ?
												<div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[1.8rem] p-6 md:p-8 text-white shadow-lg relative overflow-hidden group/response">
													<div className="absolute top-0 right-0 p-8 opacity-10 group-hover/response:scale-110 transition-transform duration-700">
														<Reply className="w-20 h-20" />
													</div>
													<div className="relative z-10">
														<div className="flex items-center justify-between mb-4">
															<div className="flex items-center gap-2">
																<div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
																	<Reply className="h-4 w-4" />
																</div>
																<span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100">
																	Votre Réponse
																</span>
															</div>
															<span className="text-[9px] font-black text-emerald-200 uppercase tracking-widest">
																{new Date(
																	review.producerResponse.respondedAt,
																).toLocaleDateString("fr-FR")}
															</span>
														</div>
														<p className="text-white/90 font-bold leading-relaxed">
															{review.producerResponse.comment}
														</p>
													</div>
												</div>
											: respondingTo === review._id ?
												<div className="bg-white/80 rounded-[1.8rem] p-6 border-2 border-emerald-500/20 shadow-inner animate-fade-in">
													<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">
														Rédiger votre réponse
													</label>
													<textarea
														value={responseText}
														onChange={(e) => setResponseText(e.target.value)}
														rows={3}
														className="w-full bg-transparent border-none focus:ring-0 text-gray-800 font-medium text-lg placeholder-gray-300 resize-none px-2"
														placeholder="Remerciez votre client ou apportez des précisions..."
														autoFocus
													/>
													<div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
														<button
															onClick={() => {
																setRespondingTo(null);
																setResponseText("");
															}}
															className="px-6 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
														>
															Annuler
														</button>
														<button
															onClick={() => handleRespondToReview(review._id)}
															disabled={
																submittingResponse || !responseText.trim()
															}
															className="px-8 py-3 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
														>
															{submittingResponse ?
																<div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
															:	<Send className="h-3 w-3" />}
															{submittingResponse ?
																"Publication..."
															:	"Envoyer la réponse"}
														</button>
													</div>
												</div>
											:	<button
													onClick={() => setRespondingTo(review._id)}
													className="w-full py-4 border-2 border-dashed border-gray-200 rounded-[1.8rem] text-gray-400 hover:border-emerald-300 hover:text-emerald-500 hover:bg-emerald-50/50 transition-all font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 group"
												>
													<Reply className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
													Répondre à cet avis
													<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
												</button>
											}
										</div>
									</div>
								</div>
							))
						}
					</div>
				</div>
			</div>
		</ModularDashboardLayout>
	);
};

export default ProducerReviews;
