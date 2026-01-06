import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	Package,
	User,
	Calendar,
	DollarSign,
	Star,
	Edit,
	Trash2,
	CheckCircle,
	XCircle,
	Clock,
	Tag,
	MapPin,
	Truck,
	Shield,
	AlertTriangle,
	FileText,
	UtensilsCrossed,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { adminService } from "../../services/adminService";

const DishDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [dish, setDish] = useState(null);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);

	useEffect(() => {
		loadDish();
	}, [id]);

	const loadDish = async () => {
		try {
			setLoading(true);
			const response = await adminService.getDishById(id);
			// Extraire la donnée selon la structure de réponse (les plats utilisent souvent .data.dish ou .data.data.dish)
			const data = response.data.data || response.data;
			setDish(data.dish || data);
		} catch (error) {
			console.error("Erreur lors du chargement du plat:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleApproveDish = async () => {
		if (window.confirm("Êtes-vous sûr de vouloir approuver ce plat ?")) {
			try {
				setActionLoading(true);
				await adminService.approveDish(id);
				await loadDish();
			} catch (error) {
				console.error("Erreur lors de l'approbation:", error);
			} finally {
				setActionLoading(false);
			}
		}
	};

	const handleRejectDish = async () => {
		const reason = window.prompt("Raison du rejet:");
		if (reason) {
			try {
				setActionLoading(true);
				await adminService.rejectDish(id, reason);
				await loadDish();
			} catch (error) {
				console.error("Erreur lors du rejet:", error);
			} finally {
				setActionLoading(false);
			}
		}
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

	const getStatusIcon = (status) => {
		switch (status) {
			case "approved":
				return <CheckCircle className="h-4 w-4" />;
			case "pending-review":
				return <Clock className="h-4 w-4" />;
			case "rejected":
				return <XCircle className="h-4 w-4" />;
			default:
				return <UtensilsCrossed className="h-4 w-4" />;
		}
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

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatPrice = (price) => {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: dish?.currency || "XOF",
			minimumFractionDigits: 0,
		}).format(price);
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
				<LoadingSpinner size="lg" text="Chargement des détails..." />
			</div>
		);
	}

	if (!dish) {
		return (
			<div className="max-w-[1200px] mx-auto px-4 py-20 text-center">
				<div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
					<AlertTriangle className="h-10 w-10 text-rose-500" />
				</div>
				<h2 className="text-3xl font-[1000] text-gray-900 tracking-tight mb-4">
					Plat non trouvé
				</h2>
				<p className="text-gray-500 font-medium mb-10 max-w-md mx-auto">
					Le plat que vous recherchez semble avoir été déplacé ou supprimé.
				</p>
				<button
					onClick={() => navigate(-1)}
					className="px-10 py-4 bg-gray-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all duration-500"
				>
					Retour à la gestion
				</button>
			</div>
		);
	}

	return (
		<div className="min-h-screen pb-20 relative overflow-hidden">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="max-w-[1400px] mx-auto px-4 py-12 relative z-10">
				{/* Header Premium */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 animate-fade-in-down">
					<div className="flex items-center gap-6">
						<button
							onClick={() => navigate(-1)}
							className="p-4 bg-white text-gray-400 hover:text-gray-900 rounded-2xl transition-all duration-300 shadow-sm border border-gray-100 hover:scale-105"
						>
							<ArrowLeft className="h-6 w-6" />
						</button>
						<div>
							<div className="flex items-center gap-3 mb-2">
								<span
									className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(
										dish.status
									)} shadow-sm`}
								>
									{getStatusIcon(dish.status)}
									<span className="ml-2">{getStatusText(dish.status)}</span>
								</span>
								<span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
									<Tag className="h-3 w-3 mr-2" />
									{getCategoryText(dish.category)}
								</span>
							</div>
							<h1 className="text-4xl font-[1000] text-gray-900 tracking-tighter leading-tight">
								{dish.name}
							</h1>
							<p className="text-gray-500 font-medium">
								ID: {dish._id?.substring(0, 12)}...
							</p>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-4">
						{dish.status === "pending-review" && (
							<>
								<button
									onClick={handleRejectDish}
									disabled={actionLoading}
									className="group flex items-center px-8 py-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all duration-500 shadow-lg hover:shadow-rose-200/50 disabled:opacity-50"
								>
									<XCircle className="h-4 w-4 mr-3" />
									Rejeter
								</button>
								<button
									onClick={handleApproveDish}
									disabled={actionLoading}
									className="group flex items-center px-10 py-4 bg-gray-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all duration-500 shadow-xl hover:shadow-green-200/50 disabled:opacity-50"
								>
									<CheckCircle className="h-4 w-4 mr-3" />
									Approuver
								</button>
							</>
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
					{/* Colonne Principale */}
					<div className="xl:col-span-2 space-y-10 animate-fade-in-up delay-150">
						{/* Image Principal */}
						<div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] border border-white/60">
							<h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">
								Visuel du Plat
							</h2>
							<div className="aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden border border-gray-100 shadow-2xl relative group">
								{dish.image ? (
									<img
										src={dish.image}
										alt={dish.name}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
									/>
								) : (
									<div className="w-full h-full bg-gray-50 flex items-center justify-center">
										<UtensilsCrossed className="h-20 w-20 text-gray-200" />
									</div>
								)}
								<div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/40">
									<span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
										Image Officielle
									</span>
								</div>
							</div>
						</div>

						{/* Description */}
						<div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60">
							<div className="flex items-center gap-4 mb-8">
								<div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 border border-green-100">
									<FileText className="h-6 w-6" />
								</div>
								<h2 className="text-2xl font-[1000] text-gray-900 tracking-tight">
									Description culinaire
								</h2>
							</div>
							<div className="text-gray-600 leading-relaxed font-medium text-lg">
								{dish.description || "Aucune description fournie pour ce plat."}
							</div>
						</div>
					</div>

					{/* Colonne Latérale */}
					<div className="space-y-10 animate-fade-in-up delay-[300ms]">
						{/* Prix */}
						<div className="bg-gray-900 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden group">
							<div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>
							<h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">
								Tarification
							</h3>
							<div className="mb-8">
								<p className="text-5xl font-[1000] tracking-tighter mb-2">
									{formatPrice(dish.price)}
								</p>
								<p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
									Prix par portion
								</p>
							</div>
						</div>

						{/* Restaurateur */}
						<div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60">
							<h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">
								Restaurateur
							</h3>
							<div className="flex items-center gap-6 mb-8 group cursor-pointer">
								<div className="h-16 w-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
									<User className="h-8 w-8" />
								</div>
								<div>
									<p className="text-xl font-[1000] text-gray-900 tracking-tight leading-tight mb-1">
										{dish.restaurateur?.restaurantName ||
											`${dish.restaurateur?.firstName} ${dish.restaurateur?.lastName}`}
									</p>
									<p className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
										Établissement vérifié
									</p>
								</div>
							</div>
							<div className="space-y-4 pt-8 border-t border-gray-100/50">
								<div className="flex items-center gap-4 text-gray-600">
									<MapPin className="h-5 w-5 text-gray-400" />
									<span className="text-sm font-bold tracking-tight">
										{dish.restaurateur?.address?.city || "Ville non définie"}
									</span>
								</div>
								<div className="flex items-center gap-4 text-gray-600">
									<Shield className="h-5 w-5 text-emerald-500" />
									<span className="text-sm font-bold tracking-tight text-emerald-600">
										Certifié Harvests
									</span>
								</div>
							</div>
						</div>

						{/* Chronologie */}
						<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-sm border border-white/60">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Calendar className="h-5 w-5 text-gray-400" />
									<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
										Ajouté le
									</p>
								</div>
								<p className="text-xs font-black text-gray-900">
									{formatDate(dish.createdAt)}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DishDetails;
