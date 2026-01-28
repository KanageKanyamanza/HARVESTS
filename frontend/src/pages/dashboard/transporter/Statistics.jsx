import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { transporterService } from "../../../services";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import StatCards from "../../admin/adminDashboard/StatCards";
import {
	BarChart3,
	TrendingUp,
	Truck,
	MapPin,
	DollarSign,
	Clock,
	Star,
	CheckCircle,
} from "lucide-react";

const Statistics = () => {
	const { user } = useAuth();
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadStats = async () => {
			if (user?.userType === "transporter") {
				try {
					setLoading(true);
					const response = await transporterService.getStats();
					const statsData =
						response.data?.data?.stats || response.data?.stats || response.data;
					setStats(statsData);
				} catch (error) {
					console.error("Erreur lors du chargement des statistiques:", error);
				} finally {
					setLoading(false);
				}
			}
		};

		loadStats();
	}, [user]);

	if (loading && !stats) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner size="lg" text="Chargement..." />
			</div>
		);
	}

	const performanceStats = [
		{
			title: "Livraisons Totales",
			value: (
				stats?.performanceStats?.totalDeliveries ||
				stats?.totalDeliveries ||
				stats?.totalOrders ||
				0
			).toLocaleString(),
			icon: Truck,
			color: "bg-blue-500",
			change: "Cumulé",
			link: "/transporter/orders",
		},
		{
			title: "Chiffre d'affaires",
			value:
				(
					stats?.performanceStats?.totalRevenue ||
					stats?.totalRevenue ||
					stats?.totalValue
				) ?
					`${new Intl.NumberFormat("fr-FR", {
						maximumFractionDigits: 0,
					}).format(
						stats?.performanceStats?.totalRevenue ||
							stats?.totalRevenue ||
							stats?.totalValue,
					)} FCFA`
				:	"0 FCFA",
			icon: DollarSign,
			color: "bg-emerald-500",
			change: "Total brut",
			link: "/transporter/statistics",
		},
		{
			title: "Zones de service",
			value: (typeof stats?.serviceAreas === "number" ?
				stats.serviceAreas
			:	stats?.serviceAreas?.length || stats?.deliveryZones || 0
			).toString(),
			icon: MapPin,
			color: "bg-indigo-500",
			change: "Zones couvertes",
			link: "/transporter/profile",
		},
		{
			title: "Taux de Réussite",
			value: `${stats?.performanceStats?.onTimeDeliveryRate || stats?.successfulDeliveryRate || 0}%`,
			icon: BarChart3,
			color: "bg-orange-500",
			change: "Ponctualité",
			link: "/transporter/orders",
		},
	];

	const secondaryStats = [
		{
			title: "Livr. Actives",
			value: (
				stats?.activeDeliveries ||
				stats?.performanceStats?.pendingDeliveries ||
				stats?.pendingOrders ||
				0
			).toString(),
			icon: TrendingUp,
			color: "bg-rose-500",
			change: "En cours",
			link: "/transporter/orders",
		},
		{
			title: "Temps Moyen",
			value:
				stats?.averageDeliveryTime ? `${stats.averageDeliveryTime} min` : "N/A",
			icon: Clock,
			color: "bg-amber-500",
			change: "Par trajet",
			link: "/transporter/statistics",
		},
		{
			title: "Revenu Mensuel",
			value:
				stats?.monthlyRevenue ?
					`${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(stats.monthlyRevenue)} FCFA`
				:	"0 FCFA",
			icon: CheckCircle,
			color: "bg-teal-500",
			change: "Ce mois",
			link: "/transporter/statistics",
		},
		{
			title: "Note Client",
			value: `${stats?.averageRating ? Number(stats?.averageRating).toFixed(1) : "0.0"}/5`,
			icon: Star,
			color: "bg-yellow-500",
			change: `${stats?.totalReviews || 0} avis`,
			link: "/transporter/profile",
		},
	];

	return (
		<div className="min-h-screen md:pl-3 pb-20 relative overflow-hidden bg-gray-50/30">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
				<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-100/20 rounded-full blur-[120px]"></div>
			</div>

			<div className="relative z-10 p-4 md:p-6 max-w-7xl mx-auto space-y-8">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-down">
					<div>
						<div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] mb-2">
							<div className="w-5 h-[2px] bg-indigo-600"></div>
							<span>Analyses & Rapports</span>
						</div>
						<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
							Indicateurs&nbsp;
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 italic">
								Logistiques.
							</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">
							Analysez vos performances de livraison et optimisez votre
							rentabilité opérationnelle.
						</p>
					</div>
				</div>

				{/* Primary Stats Grid */}
				<div className="animate-fade-in-up delay-100">
					<div className="flex items-center gap-2 mb-6 px-2">
						<Truck className="w-4 h-4 text-indigo-600" />
						<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
							Performances Générales
						</span>
					</div>
					<StatCards statCards={performanceStats} />
				</div>

				{/* Secondary Stats Grid */}
				<div className="animate-fade-in-up delay-200">
					<div className="flex items-center gap-2 mb-6 px-2">
						<BarChart3 className="w-4 h-4 text-emerald-600" />
						<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
							Métriques de qualité & Revenus
						</span>
					</div>
					<StatCards statCards={secondaryStats} />
				</div>

				{/* Empty State / No Data */}
				{!stats && !loading && (
					<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-indigo-900/5 border border-white/60 p-20 text-center animate-fade-in-up delay-300">
						<div className="mx-auto h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
							<BarChart3 className="h-10 w-10 text-indigo-300" />
						</div>
						<h3 className="text-xl font-[1000] text-gray-900 tracking-tight mb-2">
							Aucune donnée disponible
						</h3>
						<p className="text-xs text-gray-500 font-medium max-w-xs mx-auto">
							Vos statistiques détaillées apparaîtront dès que vous aurez activé
							votre première mission de livraison.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default Statistics;
