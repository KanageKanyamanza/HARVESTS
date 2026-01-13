import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
	Search,
	Filter,
	Eye,
	CheckCircle,
	XCircle,
	Star,
	Package,
	Calendar,
	User,
	DollarSign,
	AlertTriangle,
	MoreVertical,
} from "lucide-react";
import {
	getDishes,
	approveDish,
	rejectDish,
} from "../../services/adminService";
import CloudinaryImage from "../../components/common/CloudinaryImage";
import { normalizeDishImage } from "../../utils/dishImageUtils";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const AdminDishes = () => {
	const [dishes, setDishes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [selectedDishes, setSelectedDishes] = useState([]);

	useEffect(() => {
		loadDishes();
	}, [currentPage, statusFilter, searchTerm]);

	const loadDishes = async () => {
		try {
			setLoading(true);
			const params = {
				page: currentPage,
				limit: 10,
				search: searchTerm,
				status: statusFilter,
			};
			const response = await getDishes(params);
			let dishesData = [];
			let paginationData = {};

			if (response.data && response.data.dishes) {
				dishesData = response.data.dishes || [];
				paginationData = response.data.pagination || {};
			} else if (response.data && response.data.data) {
				if (response.data.data.dishes) {
					dishesData = response.data.data.dishes || [];
					paginationData = response.data.data.pagination || {};
				} else if (Array.isArray(response.data.data)) {
					dishesData = response.data.data;
				}
			}

			dishesData = dishesData.map((dish) => normalizeDishImage(dish));
			setDishes(dishesData);
			setTotalPages(paginationData.totalPages || 1);
		} catch (error) {
			console.error("Erreur lors du chargement des plats:", error);
			setDishes([]);
			setTotalPages(1);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = (e) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1);
	};

	const handleStatusFilter = (e) => {
		setStatusFilter(e.target.value);
		setCurrentPage(1);
	};

	const handleSelectDish = (dishId) => {
		setSelectedDishes((prev) =>
			prev.includes(dishId)
				? prev.filter((id) => id !== dishId)
				: [...prev, dishId]
		);
	};

	const handleSelectAll = () => {
		setSelectedDishes(
			selectedDishes.length === dishes.length
				? []
				: dishes.map((dish) => dish._id)
		);
	};

	const handleApproveDish = async (dishId) => {
		if (window.confirm("Êtes-vous sûr de vouloir approuver ce plat ?")) {
			try {
				await approveDish(dishId);
				loadDishes();
			} catch (error) {
				console.error("Erreur lors de l'approbation:", error);
			}
		}
	};

	const handleRejectDish = async (dishId) => {
		const reason = window.prompt("Raison du rejet:");
		if (reason) {
			try {
				await rejectDish(dishId, reason);
				loadDishes();
			} catch (error) {
				console.error("Erreur lors du rejet:", error);
			}
		}
	};

	const formatPrice = (price, currency = "XOF") => {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: currency,
			minimumFractionDigits: 0,
		}).format(price);
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
			approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
			"pending-review": "bg-amber-50 text-amber-600 border-amber-100",
			draft: "bg-gray-50 text-gray-600 border-gray-100",
			rejected: "bg-rose-50 text-rose-600 border-rose-100",
		};
		return colors[status] || "bg-gray-50 text-gray-600 border-gray-100";
	};

	const getStatusText = (status) => {
		const statusMap = {
			approved: "Approuvé",
			"pending-review": "En attente",
			draft: "Brouillon",
			rejected: "Rejeté",
		};
		return statusMap[status] || status;
	};

	const getCategoryText = (category) => {
		const categoryMap = {
			entree: "Entrée",
			plat: "Plat principal",
			dessert: "Dessert",
			boisson: "Boisson",
			accompagnement: "Accompagnement",
		};
		return categoryMap[category] || category;
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<LoadingSpinner size="lg" text="Chargement des plats..." />
			</div>
		);
	}

	return (
		<div className="min-h-screen md:pl-3 pb-20 relative overflow-hidden">
			{/* Background radial glows pour un effet "wow" */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
				<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-100/20 rounded-full blur-[120px]"></div>
			</div>

			<div className="max-w-full mx-auto px-3 py-4 space-y-4 relative z-10 pl-1 md:pl-6 md:px-4 md:py-6 md:space-y-6">
				{/* Header avec typographie premium */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
					<div className="animate-fade-in-down">
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-2">
							<div className="w-6 h-[2px] bg-emerald-600"></div>
							<span>Culinary Archives</span>
						</div>
						<h1 className="text-2xl md:text-3xl font-[1000] text-gray-900 tracking-tighter leading-[1] mb-2">
							Gestion des <span className="text-green-600">Plats</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">
							Modérez les nouveaux plats et gérez l'ensemble des créations
							culinaires des restaurateurs Harvests.
						</p>
					</div>
					<div className="flex items-center gap-4 animate-fade-in-up">
						{/* Boutons retirés comme demandé pour les produits */}
					</div>
				</div>

				{/* Section Filtres avec Glassmorphism */}
				<div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-white/60 animate-fade-in-up delay-100">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
						<div className="relative group">
							<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
							<input
								type="text"
								placeholder="Rechercher des plats..."
								value={searchTerm}
								onChange={handleSearch}
								className="w-full pl-11 pr-4 py-2 bg-gray-100/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-2 focus:ring-green-500/5 rounded-xl transition-all duration-300 font-bold text-xs text-gray-900 placeholder:text-gray-400"
							/>
						</div>

						<div className="relative">
							<select
								value={statusFilter}
								onChange={handleStatusFilter}
								className="w-full px-4 py-2 bg-gray-100/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-2 focus:ring-green-500/5 rounded-xl transition-all duration-300 font-bold text-xs text-gray-900 appearance-none cursor-pointer"
							>
								<option value="">Tous les statuts</option>
								<option value="pending-review">En attente (À valider)</option>
								<option value="approved">Approuvé</option>
								<option value="draft">Brouillon</option>
								<option value="rejected">Rejeté</option>
							</select>
						</div>

						<button className="flex items-center justify-center px-4 py-2 bg-gray-100/50 hover:bg-white border border-transparent hover:border-gray-100 rounded-xl transition-all duration-300 text-gray-600 font-black text-[9px] uppercase tracking-widest gap-2">
							<Filter className="h-3.5 w-3.5" />
							Plus
						</button>
					</div>
				</div>

				{/* Table des Plats Modernisée */}
				<div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 overflow-hidden animate-fade-in-up delay-200">
					<div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white/30">
						<div>
							<h3 className="text-xl font-[1000] text-gray-900 tracking-tight">
								Liste des Créations
							</h3>
							<p className="text-[9px] font-black text-gray-400 mt-0.5 uppercase tracking-[0.2em]">
								Total: {dishes.length} plats trouvés
							</p>
						</div>
						{selectedDishes.length > 0 && (
							<div className="flex gap-2 animate-fade-in">
								<button className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all duration-300">
									Approuver ({selectedDishes.length})
								</button>
								<button className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all duration-300">
									Rejeter ({selectedDishes.length})
								</button>
							</div>
						)}
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-gray-100 bg-slate-50/50">
									<th className="px-4 py-3 text-left">
										<input
											type="checkbox"
											checked={
												selectedDishes.length === dishes.length &&
												dishes.length > 0
											}
											onChange={handleSelectAll}
											className="w-4 h-4 border-2 border-gray-200 rounded bg-white checked:bg-green-600 checked:border-green-600 transition-all cursor-pointer appearance-none"
										/>
									</th>
									<th className="px-3 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Plat
									</th>
									<th className="px-3 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Restaurateur
									</th>
									<th className="px-3 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Prix
									</th>
									<th className="px-3 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Catégorie
									</th>
									<th className="px-3 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Statut
									</th>
									<th className="px-3 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Date
									</th>
									<th className="px-4 py-3 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{dishes.length === 0 ? (
									<tr>
										<td colSpan="8" className="px-4 py-12 text-center">
											<div className="flex flex-col items-center">
												<div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
													<Package className="h-8 w-8 text-gray-300" />
												</div>
												<p className="text-lg font-[1000] text-gray-900 tracking-tight">
													Aucun plat trouvé
												</p>
											</div>
										</td>
									</tr>
								) : (
									dishes.map((dish) => (
										<tr
											key={dish._id}
											className="group hover:bg-slate-50/50 transition-colors duration-300"
										>
											<td className="px-4 py-2.5">
												<input
													type="checkbox"
													checked={selectedDishes.includes(dish._id)}
													onChange={() => handleSelectDish(dish._id)}
													className="w-4 h-4 border-2 border-gray-200 rounded bg-white checked:bg-green-600 checked:border-green-600 transition-all cursor-pointer appearance-none"
												/>
											</td>
											<td className="px-3 py-2.5">
												<div className="flex items-center gap-3">
													<div className="h-10 w-10 rounded-xl overflow-hidden border border-gray-100 shadow-sm flex-shrink-0 relative">
														{dish.image ? (
															<img
																src={dish.image}
																alt={dish.name || "Plat"}
																className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
															/>
														) : (
															<div className="h-full w-full bg-gray-50 flex items-center justify-center">
																<Package className="h-5 w-5 text-gray-300" />
															</div>
														)}
													</div>
													<div>
														<p className="text-sm font-black text-gray-900 tracking-tight leading-tight mb-0.5 group-hover:text-green-600 transition-colors">
															{dish.name}
														</p>
														<span className="text-[9px] font-bold text-gray-400 line-clamp-1 max-w-[150px]">
															{dish.description}
														</span>
													</div>
												</div>
											</td>
											<td className="px-3 py-2.5">
												<div className="flex items-center gap-2">
													<div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
														<User className="h-3.5 w-3.5" />
													</div>
													<div>
														<p className="text-xs font-black text-gray-900 tracking-tight leading-none mb-1">
															{dish.restaurateur?.restaurantName ||
																`${dish.restaurateur?.firstName} ${dish.restaurateur?.lastName}`}
														</p>
														<p className="text-[9px] font-bold text-gray-400">
															{dish.restaurateur?.email}
														</p>
													</div>
												</div>
											</td>
											<td className="px-3 py-2.5">
												<p className="text-sm font-[1000] text-gray-900 tracking-tighter">
													{formatPrice(dish.price, dish.currency)}
												</p>
											</td>
											<td className="px-3 py-2.5">
												<span className="text-[9px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 px-2.5 py-1 rounded-lg">
													{getCategoryText(dish.category)}
												</span>
											</td>
											<td className="px-3 py-2.5">
												<span
													className={`inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(
														dish.status
													)}`}
												>
													{getStatusText(dish.status)}
												</span>
											</td>
											<td className="px-3 py-2.5">
												<div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
													<Calendar className="h-2.5 w-2.5" />
													{formatDate(dish.createdAt)}
												</div>
											</td>
											<td className="px-4 py-2.5 text-right">
												<div className="flex items-center justify-end gap-1.5">
													<Link
														to={`/admin/dishes/${dish._id}`}
														className="p-2 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-100"
														title="Voir détails"
													>
														<Eye className="h-3.5 w-3.5" />
													</Link>
													{dish.status === "pending-review" && (
														<>
															<button
																onClick={() => handleApproveDish(dish._id)}
																className="p-2 bg-gray-50 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300 border border-transparent hover:border-green-100"
																title="Approuver"
															>
																<CheckCircle className="h-3.5 w-3.5" />
															</button>
															<button
																onClick={() => handleRejectDish(dish._id)}
																className="p-2 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 border border-transparent hover:border-red-100"
																title="Rejeter"
															>
																<XCircle className="h-3.5 w-3.5" />
															</button>
														</>
													)}
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{/* Pagination Premium */}
					<div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/30">
						<p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
							Page {currentPage} sur {totalPages}
						</p>
						<div className="flex items-center gap-1.5">
							<button
								onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
								disabled={currentPage === 1}
								className="px-4 py-2 bg-white text-gray-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-gray-100 hover:bg-gray-900 hover:text-white transition-all duration-300 disabled:opacity-50"
							>
								Précédent
							</button>
							<button
								onClick={() =>
									setCurrentPage((prev) => Math.min(prev + 1, totalPages))
								}
								disabled={currentPage === totalPages}
								className="px-4 py-2 bg-white text-gray-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-gray-100 hover:bg-gray-900 hover:text-white transition-all duration-300 disabled:opacity-50"
							>
								Suivant
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminDishes;
