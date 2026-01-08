import React, { useState, useEffect, useCallback } from "react";
import {
	Star,
	User,
	Package,
	AlertTriangle,
	CheckCircle,
	X,
	Eye,
	Trash2,
	Search,
	Filter,
	Calendar,
	MoreVertical,
	XCircle,
	Clock,
	MessageSquare,
	ChevronLeft,
	ChevronRight,
	ThumbsUp,
	ThumbsDown,
} from "lucide-react";

import { adminService } from "../../services/adminService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import CloudinaryImage from "../../components/common/CloudinaryImage";

const AdminReviews = () => {
	const [reviews, setReviews] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [selectedReviews, setSelectedReviews] = useState([]);
	const [actionLoading, setActionLoading] = useState(false);

	const loadReviews = useCallback(async () => {
		try {
			setLoading(true);
			const params = {
				page: currentPage,
				limit: 10,
				status: statusFilter,
				search: searchTerm,
			};

			const response = await adminService.getReviews(params);

			if (response.data && response.data.reviews) {
				setReviews(response.data.reviews || []);
				setTotalPages(response.data.pagination?.totalPages || 1);
			} else if (
				response.data &&
				response.data.data &&
				response.data.data.reviews
			) {
				setReviews(response.data.data.reviews || []);
				setTotalPages(response.data.data.pagination?.totalPages || 1);
			} else {
				setReviews([]);
				setTotalPages(1);
			}
		} catch (error) {
			console.error("Erreur lors du chargement des avis:", error);
			setReviews([]);
			setTotalPages(1);
		} finally {
			setLoading(false);
		}
	}, [currentPage, statusFilter, searchTerm]);

	useEffect(() => {
		loadReviews();
	}, [loadReviews]);

	const handleSearch = (e) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1);
	};

	const handleStatusFilter = (e) => {
		setStatusFilter(e.target.value);
		setCurrentPage(1);
	};

	const handleSelectReview = (reviewId) => {
		setSelectedReviews((prev) =>
			prev.includes(reviewId)
				? prev.filter((id) => id !== reviewId)
				: [...prev, reviewId]
		);
	};

	const handleSelectAll = () => {
		setSelectedReviews(
			selectedReviews.length === reviews.length
				? []
				: reviews.map((review) => review._id)
		);
	};

	const handleApproveReview = async (reviewId) => {
		try {
			setActionLoading(true);
			await adminService.approveReview(reviewId);
			loadReviews();
		} catch (error) {
			console.error("Erreur lors de l'approbation:", error);
		} finally {
			setActionLoading(false);
		}
	};

	const handleRejectReview = async (reviewId) => {
		const reason = window.prompt("Raison du rejet:");
		if (reason) {
			try {
				setActionLoading(true);
				await adminService.rejectReview(reviewId, reason);
				loadReviews();
			} catch (error) {
				console.error("Erreur lors du rejet:", error);
			} finally {
				setActionLoading(false);
			}
		}
	};

	const handleDeleteReview = async (reviewId) => {
		if (window.confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) {
			try {
				setActionLoading(true);
				await adminService.deleteReview(reviewId);
				loadReviews();
			} catch (error) {
				console.error("Erreur lors de la suppression:", error);
			} finally {
				setActionLoading(false);
			}
		}
	};

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getStatusColor = (status) => {
		const colors = {
			approved: "text-emerald-600 bg-emerald-50 border-emerald-100",
			pending: "text-amber-600 bg-amber-50 border-amber-100",
			rejected: "text-rose-600 bg-rose-50 border-rose-100",
			reported: "text-orange-600 bg-orange-50 border-orange-100",
			hidden: "text-gray-600 bg-gray-50 border-gray-100",
		};
		return colors[status] || "text-gray-600 bg-gray-50 border-gray-100";
	};

	const getStatusText = (status) => {
		const statusMap = {
			approved: "Approuvé",
			pending: "En attente",
			rejected: "Rejeté",
			reported: "Signalé",
			hidden: "Masqué",
		};
		return statusMap[status] || status;
	};

	const renderStars = (rating) => {
		return (
			<div className="flex items-center gap-0.5">
				{Array.from({ length: 5 }, (_, i) => (
					<Star
						key={i}
						className={`h-3.5 w-3.5 ${
							i < rating ? "text-amber-400 fill-amber-400" : "text-gray-200"
						}`}
					/>
				))}
			</div>
		);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<LoadingSpinner size="lg" text="Chargement des avis..." />
			</div>
		);
	}

	return (
		<div className="min-h-screen md:pl-3 pb-20 relative overflow-hidden">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="max-w-full mx-auto px-4 py-8 relative z-10 pl-6">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 animate-fade-in-down">
					<div>
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1.5">
							<div className="w-6 h-[2px] bg-emerald-600"></div>
							<span>Reputation Monitor</span>
						</div>
						<h1 className="text-2xl md:text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-1.5">
							Avis & <span className="text-green-600">Modération</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium flex items-center gap-2">
							<MessageSquare className="h-4 w-4 text-green-500" />
							Gérez les témoignages et commentaires de la communauté Harvests
						</p>
					</div>

					{/* Search & Filter Bar */}
					<div className="flex flex-wrap items-center gap-3 bg-white/70 backdrop-blur-xl p-1.5 rounded-xl border border-white/60 shadow-sm">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<input
								type="text"
								placeholder="Rechercher..."
								value={searchTerm}
								onChange={handleSearch}
								className="pl-9 pr-3 py-1.5 bg-gray-100/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-2 focus:ring-green-500/5 rounded-lg text-xs font-medium transition-all w-full md:w-56"
							/>
						</div>
						<div className="relative">
							<Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
							<select
								value={statusFilter}
								onChange={handleStatusFilter}
								className="pl-8 pr-6 py-1.5 bg-gray-100/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-2 focus:ring-green-500/5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all appearance-none cursor-pointer"
							>
								<option value="">Tous les statuts</option>
								<option value="pending">En attente</option>
								<option value="reported">Signalés</option>
								<option value="approved">Approuvés</option>
								<option value="rejected">Rejetés</option>
							</select>
						</div>
						<button
							onClick={handleSelectAll}
							className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-green-600 transition-all duration-300"
						>
							{selectedReviews.length === reviews.length
								? "Désélectionner"
								: "Sélectionner tout"}
						</button>
					</div>
				</div>

				{/* Bulk Actions Bar */}
				{selectedReviews.length > 0 && (
					<div className="mb-6 flex items-center justify-between p-4 bg-gray-900 rounded-[1.5rem] shadow-2xl animate-scale-in border border-gray-800">
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-black text-xs">
								{selectedReviews.length}
							</div>
							<p className="text-white font-bold tracking-tight text-sm">
								Avis sélectionnés pour action groupée
							</p>
						</div>
						<div className="flex gap-2">
							<button
								onClick={() => {
									selectedReviews.forEach((id) => handleApproveReview(id));
									setSelectedReviews([]);
								}}
								className="px-4 py-2 bg-white text-gray-900 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all duration-300"
							>
								Approuver tout
							</button>
							<button
								onClick={() => {
									selectedReviews.forEach((id) => handleRejectReview(id));
									setSelectedReviews([]);
								}}
								className="px-4 py-2 bg-rose-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all duration-300"
							>
								Rejeter tout
							</button>
						</div>
					</div>
				)}

				{/* Review List */}
				<div className="space-y-3">
					{reviews.length === 0 ? (
						<div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 text-center border border-white/60 shadow-sm">
							<div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
								<Star className="h-6 w-6 text-gray-200" />
							</div>
							<h3 className="text-lg font-[1000] text-gray-900 tracking-tight">
								Aucun avis à modérer
							</h3>
						</div>
					) : (
						reviews.map((review) => (
							<div
								key={review._id}
								className={`group bg-white/70 backdrop-blur-xl rounded-2xl p-4 border transition-all duration-500 hover:shadow-md hover:-translate-y-0.5 ${
									selectedReviews.includes(review._id)
										? "border-green-500/50 shadow-md opacity-100"
										: "border-white/60 shadow-sm"
								}`}
							>
								<div className="flex flex-col lg:flex-row gap-4">
									{/* Checkbox & Reviewer */}
									<div className="flex items-start gap-3 lg:w-1/4">
										<div className="pt-0.5">
											<input
												type="checkbox"
												checked={selectedReviews.includes(review._id)}
												onChange={() => handleSelectReview(review._id)}
												className="w-3.5 h-3.5 border-2 border-gray-200 rounded bg-white checked:bg-green-600 checked:border-green-600 transition-all cursor-pointer appearance-none"
											/>
										</div>
										<div className="flex items-center gap-2">
											<div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-100 shadow-sm bg-white p-0.5">
												{review.reviewer?.avatar ? (
													<CloudinaryImage
														src={review.reviewer.avatar}
														className="w-full h-full object-cover rounded"
													/>
												) : (
													<div className="w-full h-full bg-gray-50 flex items-center justify-center rounded">
														<User className="h-4 w-4 text-gray-300" />
													</div>
												)}
											</div>
											<div>
												<p className="text-xs font-[1000] text-gray-900 tracking-tight leading-none mb-0.5">
													{review.reviewer?.firstName || "Utilisateur"}{" "}
													{review.reviewer?.lastName || ""}
												</p>
												<p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
													Reviewer
												</p>
											</div>
										</div>
									</div>

									{/* Review Content */}
									<div className="flex-1 lg:border-l lg:border-r lg:border-gray-100 lg:px-4">
										<div className="flex flex-wrap items-center gap-2 mb-1.5">
											{renderStars(review.rating)}
											<span
												className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusColor(
													review.status
												)}`}
											>
												{getStatusText(review.status)}
											</span>
											<span className="flex items-center gap-1 text-[8px] font-bold text-gray-400">
												<Calendar className="h-2.5 w-2.5" />
												{formatDate(review.createdAt)}
											</span>
										</div>

										<p className="text-[8px] font-black text-green-600 uppercase tracking-widest mb-1 flex items-center gap-1">
											<Package className="h-2.5 w-2.5" />
											{review.product?.name?.fr ||
												review.product?.name?.en ||
												"Produit inconnu"}
										</p>

										<h4 className="text-xs font-black text-gray-900 tracking-tighter mb-1">
											{review.title || "Sans titre"}
										</h4>
										<p className="text-[11px] text-gray-600 leading-relaxed font-medium bg-gray-50/50 p-2 rounded-lg border border-gray-100/50 italic">
											"{review.comment}"
										</p>

										{review.reports?.length > 0 && (
											<div className="mt-2 flex items-center gap-2 p-2 bg-rose-50 border border-rose-100 rounded-lg animate-pulse">
												<AlertTriangle className="h-3 w-3 text-rose-500" />
												<p className="text-[9px] font-black text-rose-600 uppercase tracking-widest leading-none">
													Signalé : {review.reports[0].description}
												</p>
											</div>
										)}
									</div>

									{/* Actions */}
									<div className="lg:w-1/6 flex lg:flex-col items-center justify-center gap-1.5">
										{review.status !== "approved" && (
											<button
												onClick={() => handleApproveReview(review._id)}
												disabled={actionLoading}
												className="w-full group/btn flex items-center justify-center gap-1.5 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-600 hover:text-white transition-all duration-300"
											>
												<CheckCircle className="h-3.5 w-3.5" />
												<span className="text-[8px] font-black uppercase tracking-widest">
													Approuver
												</span>
											</button>
										)}
										{review.status !== "rejected" && (
											<button
												onClick={() => handleRejectReview(review._id)}
												disabled={actionLoading}
												className="w-full group/btn flex items-center justify-center gap-1.5 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-600 hover:text-white transition-all duration-300"
											>
												<XCircle className="h-3.5 w-3.5" />
												<span className="text-[8px] font-black uppercase tracking-widest">
													Rejeter
												</span>
											</button>
										)}
										<button
											onClick={() => handleDeleteReview(review._id)}
											disabled={actionLoading}
											className="w-full group/btn flex items-center justify-center gap-1.5 py-1.5 bg-gray-50 text-gray-400 border border-transparent hover:border-gray-200 hover:text-gray-900 rounded-lg transition-all duration-300"
										>
											<Trash2 className="h-3.5 w-3.5" />
											<span className="text-[8px] font-black uppercase tracking-widest">
												Supprimer
											</span>
										</button>
									</div>
								</div>
							</div>
						))
					)}
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="mt-4 flex items-center justify-between bg-white/70 backdrop-blur-xl p-2 rounded-xl border border-white/60 shadow-sm">
						<button
							onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
							disabled={currentPage === 1}
							className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-400 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all duration-300 disabled:opacity-50"
						>
							<ChevronLeft className="h-3 w-3" /> Précédent
						</button>
						<div className="flex items-center gap-1.5">
							{Array.from({ length: totalPages }).map((_, i) => (
								<button
									key={i}
									onClick={() => setCurrentPage(i + 1)}
									className={`w-7 h-7 rounded-lg text-[8px] font-black transition-all duration-300 ${
										currentPage === i + 1
											? "bg-gray-900 text-white shadow-md shadow-gray-200"
											: "text-gray-400 hover:bg-gray-50"
									}`}
								>
									{i + 1}
								</button>
							))}
						</div>
						<button
							onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages}
							className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-400 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all duration-300 disabled:opacity-50"
						>
							Suivant <ChevronRight className="h-3 w-3" />
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default AdminReviews;
